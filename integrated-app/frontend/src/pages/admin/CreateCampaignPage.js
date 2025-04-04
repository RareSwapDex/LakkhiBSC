import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Form, Button, Row, Col, Card, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Web3 from 'web3';
import axios from 'axios';
import TokenSelector from '../../components/TokenSelector';
import { useProvider } from '../../web3/ProviderContext';
import * as projectService from '../../services/projectService';

const CreateCampaignPage = ({ isEditMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the project ID from URL when editing
  const { account, web3, provider, isConnected, connectWallet } = useProvider();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    funding: '',
    tokenAddress: '',
    blockchain: 'BSC', // Default to BSC
  });

  const [step, setStep] = useState(1);
  const [validatingToken, setValidatingToken] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [tokenEquivalent, setTokenEquivalent] = useState(null);
  
  // Load campaign data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchCampaignData = async () => {
        try {
          setIsLoading(true);
          setLoadingMessage('Loading campaign data...');
          
          const response = await projectService.getProjectById(id);
          if (response.success) {
            const project = response.project;
            
            // Pre-fill the form with the project data
            setFormValues({
              title: project.title || '',
              description: project.description || '',
              funding: project.fund_amount ? project.fund_amount.toString() : '',
              tokenAddress: project.token_address || '',
              blockchain: project.blockchain_chain || 'BSC',
            });
            
            // If we have token data, trigger validation
            if (project.token_address) {
              validateToken(project.token_address, project.blockchain_chain || 'BSC');
            }
          } else {
            setError(response.message || 'Failed to fetch campaign data');
          }
        } catch (err) {
          console.error('Error fetching campaign:', err);
          setError('An error occurred while fetching the campaign data');
        } finally {
          setIsLoading(false);
          setLoadingMessage('');
        }
      };
      
      fetchCampaignData();
    }
  }, [isEditMode, id]);

  // Validate the token address
  const validateToken = useCallback(async (address, blockchain) => {
    if (!address) return;
    
    setValidatingToken(true);
    setTokenValid(false);
    setTokenData(null);
    setTokenError(null);
    
    try {
      // Use the token validation service to check if the token is valid
      const validationResult = await TokenSelector.validateToken(address, blockchain);
      
      if (validationResult.success) {
        setTokenValid(true);
        setTokenData(validationResult.token_info);
        
        // Update form values with the blockchain if it was detected
        if (validationResult.blockchain && validationResult.blockchain !== formValues.blockchain) {
          setFormValues(prevValues => ({
            ...prevValues,
            blockchain: validationResult.blockchain
          }));
        }
        
        // Get token price equivalent if funding amount specified
        if (formValues.funding) {
          getTokenEquivalent(address, formValues.funding, validationResult.blockchain || formValues.blockchain);
        }
      } else {
        setTokenValid(false);
        setTokenError(validationResult.message || 'Token validation failed');
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setTokenValid(false);
      setTokenError('Error validating token. Please check the address and try again.');
    } finally {
      setValidatingToken(false);
    }
  }, [formValues.funding, formValues.blockchain]);

  // Get token price and calculate equivalent
  const getTokenEquivalent = async (tokenAddress, usdAmount, blockchain) => {
    if (!tokenAddress || !usdAmount) return;
    
    try {
      // Get token price for the selected blockchain
      // Use axios to directly call the token price API
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/token/price/?token_address=${tokenAddress}&blockchain=${blockchain}`,
        { 
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      const tokenPrice = response.data?.price_usd || null;
      
      if (tokenPrice && tokenPrice > 0) {
        // Calculate how many tokens are needed for the USD amount
        const tokenAmount = parseFloat(usdAmount) / tokenPrice;
        setTokenEquivalent({
          price: tokenPrice,
          amount: tokenAmount,
          formatted: tokenAmount.toLocaleString(undefined, {
            maximumFractionDigits: 8
          })
        });
      } else {
        setTokenEquivalent(null);
        console.warn('Could not determine token price');
      }
    } catch (error) {
      console.error('Error calculating token equivalent:', error);
      setTokenEquivalent(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
    
    // If updating funding amount and we have a valid token, recalculate equivalent
    if (name === 'funding' && tokenValid && formValues.tokenAddress) {
      getTokenEquivalent(formValues.tokenAddress, value, formValues.blockchain);
    }
  };
  
  // Handle token address changes
  const handleTokenChange = (value) => {
    setFormValues(prevValues => ({
      ...prevValues,
      tokenAddress: value
    }));
    
    if (value) {
      validateToken(value, formValues.blockchain);
    } else {
      setTokenValid(false);
      setTokenData(null);
      setTokenError(null);
    }
  };
  
  // Handle blockchain selection change
  const handleBlockchainChange = (e) => {
    const blockchain = e.target.value;
    setFormValues(prevValues => ({
      ...prevValues,
      blockchain: blockchain
    }));
    
    // Revalidate token with new blockchain
    if (formValues.tokenAddress) {
      validateToken(formValues.tokenAddress, blockchain);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      await connectWallet();
      return;
    }
    
    try {
      setIsLoading(true);
      setLoadingMessage(isEditMode ? 'Updating campaign...' : 'Creating campaign...');
      setError(null);
      
      const formData = new FormData();
      formData.append('title', formValues.title);
      formData.append('description', formValues.description);
      formData.append('fund_amount', formValues.funding);
      formData.append('token_address', formValues.tokenAddress);
      formData.append('blockchain_chain', formValues.blockchain);
      formData.append('wallet_address', account);
      
      let response;
      
      if (isEditMode) {
        response = await projectService.updateProject(id, formData);
      } else {
        response = await projectService.createProject(formData);
      }
      
      if (response.success) {
        setSuccess(isEditMode ? 'Campaign updated successfully!' : 'Campaign created successfully!');
        setTimeout(() => {
          const projectId = isEditMode ? id : response.project?.id;
          navigate(`/projects/${projectId}`);
        }, 2000);
      } else {
        setError(response.message || (isEditMode ? 'Failed to update campaign' : 'Failed to create campaign'));
      }
    } catch (error) {
      console.error(isEditMode ? 'Error updating campaign:' : 'Error creating campaign:', error);
      setError(error.message || (isEditMode ? 'Failed to update campaign' : 'Failed to create campaign'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col md={8} className="mx-auto">
          <Card>
            <Card.Header>
              <h2 className="mb-0">{isEditMode ? 'Edit Campaign' : 'Create New Campaign'}</h2>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              {isLoading && (
                <div className="text-center my-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">{loadingMessage}</p>
                </div>
              )}
              
              {!isLoading && (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>Campaign Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formValues.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter a clear, descriptive title for your campaign"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={formValues.description}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      placeholder="Describe your campaign and why people should support it"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Funding Goal (USD)</Form.Label>
                    <Form.Control
                      type="number"
                      name="funding"
                      value={formValues.funding}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter the amount in USD"
                      min="1"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Blockchain</Form.Label>
                    <Form.Select 
                      name="blockchain"
                      value={formValues.blockchain}
                      onChange={handleBlockchainChange}
                    >
                      <option value="BSC">Binance Smart Chain (BSC)</option>
                      <option value="Ethereum">Ethereum</option>
                      <option value="Base">Base</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Token Address</Form.Label>
                    <TokenSelector
                      value={formValues.tokenAddress}
                      onChange={handleTokenChange}
                      onValidate={setTokenValid}
                      blockchain={formValues.blockchain}
                    />
                    {validatingToken && <div className="mt-2"><Spinner size="sm" animation="border" /> Validating token...</div>}
                    {tokenError && <div className="text-danger mt-2">{tokenError}</div>}
                    {tokenValid && tokenData && (
                      <div className="mt-2 text-success">
                        <div>✅ Valid token: {tokenData.name} ({tokenData.symbol})</div>
                        <div>Decimals: {tokenData.decimals}</div>
                      </div>
                    )}
                  </Form.Group>
                  
                  {tokenValid && tokenEquivalent && (
                    <Alert variant="info" className="mb-4">
                      <p className="mb-1"><strong>Token Price:</strong> ${tokenEquivalent.price}</p>
                      <p className="mb-0"><strong>Equivalent:</strong> {formValues.funding} USD = {tokenEquivalent.formatted} {tokenData?.symbol}</p>
                    </Alert>
                  )}
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Your Wallet Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={account || 'Not connected'}
                      disabled
                      readOnly
                    />
                  </Form.Group>
                  
                  <div className="d-grid gap-2">
                    {!isConnected ? (
                      <Button variant="primary" onClick={connectWallet}>
                        Connect Wallet First
                      </Button>
                    ) : (
                      <Button variant="primary" type="submit" disabled={isLoading || !tokenValid}>
                        {isEditMode ? 'Update Campaign' : 'Create Campaign'}
                      </Button>
                    )}
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateCampaignPage; 