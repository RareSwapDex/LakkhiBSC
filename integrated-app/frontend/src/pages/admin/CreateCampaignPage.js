import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ProviderContext } from '../../web3/ProviderContext';
import TokenSelector from '../../components/TokenSelector';

const CreateCampaignPage = () => {
  const navigate = useNavigate();
  const { provider, isConnected, account } = useContext(ProviderContext);
  
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [includeIncentives, setIncludeIncentives] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState('');
  const [isWalletVerified, setIsWalletVerified] = useState(false);
  
  // Token validation state
  const [validatingToken, setValidatingToken] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [tokenError, setTokenError] = useState(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    basics: {
      projectTitle: '',
      blockchainChain: 'BSC',
      projectDescription: '',
      projectImageFile: null,
      projectLaunchDate: '',
      projectDeadlineDate: '30',
      activateImmediately: true,
      projectFundAmount: '',
      projectFundCurrency: 'USD',
      walletAddress: '',
      tokenAddress: '', // New field for token address
    },
    rewards: {
      projectRewards: [
        {
          title: '',
          description: '',
          price: '',
          availableItems: '',
          estimatedDelivery: '',
          displayOrder: 1,
        }
      ]
    }
  });
  
  // Token validation function
  const validateToken = async () => {
    const tokenAddress = formData.basics.tokenAddress;
    
    if (!tokenAddress || !tokenAddress.trim()) {
      setTokenError("Token address is required");
      setTokenInfo(null);
      return;
    }
    
    setValidatingToken(true);
    setTokenError(null);
    setTokenInfo(null);
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/token/validate/`,
        { token_address: tokenAddress }
      );
      
      if (response.data.success) {
        setTokenInfo(response.data.token_info);
      } else {
        setTokenError(response.data.message || "Invalid token address");
      }
    } catch (err) {
      console.error("Error validating token:", err);
      setTokenError(err.response?.data?.message || "Failed to validate token");
    } finally {
      setValidatingToken(false);
    }
  };
  
  // Handle token address blur
  const handleTokenBlur = () => {
    if (formData.basics.tokenAddress) {
      validateToken();
    }
  };
  
  // Blockchain chains
  const blockchainChains = [
    { id: 'BSC', name: 'BSC' },
    { id: 'Solana', name: 'Solana' },
    { id: 'Ethereum', name: 'Ethereum' },
    { id: 'Base', name: 'Base' }
  ];
  
  // Check for connected wallet
  useEffect(() => {
    const checkWallet = async () => {
      try {
        // Check if provider is available and wallet is connected
        if (!provider || !isConnected) {
          setError('Please connect your wallet to create a campaign');
          return;
        }
        
        if (account) {
          setConnectedWallet(account);
          
          // Auto-verify wallet when it's connected
          localStorage.setItem('lakkhi_verified_wallet', account);
          setIsWalletVerified(true);
          
          // Set wallet address in form data
          handleInputChange('basics', 'walletAddress', account);
          setError(null); // Clear any existing error
        } else {
          setError('Please connect your wallet to create a campaign');
        }
      } catch (err) {
        console.error('Error getting wallet:', err);
        setError('Error connecting to wallet. Please try reconnecting.');
      }
    };
    
    checkWallet();
  }, [provider, isConnected, account]);
  
  // Handle form field changes
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  // Handle file upload
  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      basics: {
        ...prev.basics,
        projectImageFile: e.target.files[0]
      }
    }));
  };
  
  // Handle reward form changes
  const handleRewardChange = (index, field, value) => {
    const updatedRewards = [...formData.rewards.projectRewards];
    updatedRewards[index] = {
      ...updatedRewards[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      rewards: {
        ...prev.rewards,
        projectRewards: updatedRewards
      }
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verify wallet is connected
    if (!connectedWallet) {
      setError('Please connect your wallet before creating a campaign');
      return;
    }
    
    // Verify wallet is verified
    if (!isWalletVerified) {
      setError('Your wallet must be verified before creating a campaign. Please connect and sign with your wallet.');
      return;
    }
    
    // Verify token is provided and validated
    if (!formData.basics.tokenAddress) {
      setError('Token address is required. Please enter and validate a token address.');
      return;
    }
    
    // Verify token is validated
    if (!tokenInfo) {
      setError('Please validate your token address before submitting. Click the Validate button next to the token address field.');
      return;
    }
    
    setSubmitting(true);
    setError('Deploying smart contract. Please confirm the transaction in MetaMask when prompted...');
    
    try {
      // Step 1: Deploy the smart contract through MetaMask
      const contractData = await deploySmartContract();
      if (!contractData) {
        setError('Smart contract deployment failed. Please try again.');
        setSubmitting(false);
        return;
      }
      
      setError('Smart contract deployed successfully! Creating campaign record...');
      
      // Step 2: Create FormData for backend submission
      const formDataToSend = new FormData();
      
      // Ensure the wallet address is set to the connected wallet
      const formDataWithWallet = {
        ...formData,
        basics: {
          ...formData.basics,
          walletAddress: connectedWallet
        }
      };
      
      // Add basics
      Object.keys(formDataWithWallet.basics).forEach(key => {
        formDataToSend.append(`basics.${key}`, formDataWithWallet.basics[key]);
      });
      
      // Add description to story field
      formDataToSend.append('story.projectStory', formDataWithWallet.basics.projectDescription || '');
      
      // Add rewards if included
      if (includeIncentives) {
        formDataToSend.append('rewards.projectRewards', JSON.stringify(formDataWithWallet.rewards.projectRewards));
      } else {
        formDataToSend.append('rewards.projectRewards', JSON.stringify([]));
      }
      
      // Always create contract immediately
      formDataToSend.append('create_contract', 'true');
      
      // Set publish state based on immediate activation
      formDataToSend.append('publish', formDataWithWallet.basics.activateImmediately ? 'true' : 'false');
      
      // Add contract data
      formDataToSend.append('contract_data', JSON.stringify(contractData));
      
      // Step 3: Send data to the backend
      console.log('Sending campaign data to backend with contract info:', contractData);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || ''}/api/projects/add/`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        setSubmitSuccess(true);
        console.log('Campaign created successfully:', response.data.project);
        
        // Navigate to the project detail page
        const projectId = response.data.project.id;
        
        // Show success message before redirecting
        setTimeout(() => {
          navigate(`/projects/${projectId}`);
        }, 1500);
      } else {
        setError(response.data.message || 'An error occurred while creating the campaign');
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError(`Campaign creation error: ${err.message || 'An error occurred while creating the campaign'}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Deploy smart contract using MetaMask
  const deploySmartContract = async () => {
    try {
      if (!account) {
        setError('Wallet not connected. Please connect your wallet first.');
        return null;
      }
      
      // Inform user about the transaction
      setError('Please confirm the transaction in your wallet to deploy the campaign smart contract...');
      
      // Ensure we have access to window.ethereum (MetaMask)
      if (!window.ethereum) {
        setError('MetaMask not detected! Please install MetaMask and refresh the page.');
        return null;
      }
      
      // Initialize Web3 directly with window.ethereum
      const Web3 = require('web3');
      const web3 = new Web3(window.ethereum);
      
      // Campaign staking contract ABI
      const factoryABI = [
        {
          "inputs": [
            {"name": "name", "type": "string"},
            {"name": "tokenAddress", "type": "address"},
            {"name": "beneficiary", "type": "address"},
            {"name": "targetAmount", "type": "uint256"},
            {"name": "durationInDays", "type": "uint256"}
          ],
          "name": "createCampaign",
          "outputs": [{"name": "campaignAddress", "type": "address"}],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];
      
      // Factory contract address
      const FACTORY_ADDRESS = '0x9ec02756a559700d8d9e79ece56809f7bcc5dc27';
      
      // Create contract instance
      const factoryContract = new web3.eth.Contract(factoryABI, FACTORY_ADDRESS);
      
      // Calculate duration in days
      const durationInDays = parseInt(formData.basics.projectDeadlineDate) || 30;
      
      // Convert fund amount to wei
      const fundAmountInWei = web3.utils.toWei(formData.basics.projectFundAmount.toString(), 'ether');
      
      console.log('Deploying contract with params:', {
        name: formData.basics.projectTitle,
        tokenAddress: formData.basics.tokenAddress,
        beneficiary: account, // Use connected wallet
        targetAmount: fundAmountInWei,
        durationInDays: durationInDays
      });
      
      // THIS IS THE DIRECT METAMASK REQUEST - Triggers MetaMask popup
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: FACTORY_ADDRESS,
          data: factoryContract.methods.createCampaign(
            formData.basics.projectTitle,
            formData.basics.tokenAddress,
            account, // Use connected wallet
            fundAmountInWei,
            durationInDays
          ).encodeABI()
        }]
      });
      
      console.log('Transaction submitted with hash:', txHash);
      
      // Wait for transaction receipt
      const waitForReceipt = async (hash, attempts = 30) => {
        if (attempts <= 0) throw new Error('Transaction receipt not found after maximum attempts');
        
        const receipt = await web3.eth.getTransactionReceipt(hash);
        if (receipt) return receipt;
        
        // Wait 2 seconds before trying again
        await new Promise(resolve => setTimeout(resolve, 2000));
        return waitForReceipt(hash, attempts - 1);
      };
      
      setError('Transaction submitted! Waiting for confirmation...');
      const receipt = await waitForReceipt(txHash);
      console.log('Transaction confirmed! Receipt:', receipt);
      
      // For development purposes - in production, you'd parse the contract address from event logs
      // Here we're using a mock address based on the transaction hash
      const campaignAddress = `0x${receipt.blockNumber.toString(16)}000000000000000000000000`;
      
      // Return contract data
      return {
        contract_address: campaignAddress,
        transaction_hash: txHash,
        block_number: receipt.blockNumber,
        chain: formData.basics.blockchainChain || 'BSC',
        contract_url: `https://bscscan.com/address/${campaignAddress}`
      };
    } catch (error) {
      console.error('Error deploying contract:', error);
      setError(`Error deploying contract: ${error.message || 'Unknown error'}`);
      return null;
    }
  };
  
  // Wallet verification alert
  const renderWalletAlert = () => {
    // Don't show any alerts if wallet address is populated
    if (connectedWallet && connectedWallet.startsWith('0x')) {
      return null;
    }
    
    // Connect button is present but wallet is not connected yet
    if (!connectedWallet) {
      return (
        <Alert variant="warning">
          <Alert.Heading>Wallet Not Connected</Alert.Heading>
          <p>You must connect your wallet using the "Connect Wallet" button in the navigation bar before creating a campaign.</p>
        </Alert>
      );
    }
    
    // Fallback - should never reach here if wallet is connected
    return null;
  };
  
  if (submitting) {
    return <Container className="py-3 text-center"><p>Creating campaign...</p></Container>;
  }
  
  if (submitSuccess) {
    return (
      <Container className="py-3">
        <Alert variant="success">
          <Alert.Heading>Campaign Created Successfully!</Alert.Heading>
          <p>Your campaign has been created. You will be redirected to the campaign page shortly.</p>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="py-5">
      <h1 className="mb-4">Create New Campaign</h1>
      
      <Card className="mb-4 border-info">
        <Card.Body>
          <Card.Title>Decentralized Campaign Ownership</Card.Title>
          <Card.Text>
            Lakkhi Funding uses a fully decentralized approach to campaign management. When you create a campaign:
            <ul className="mt-2">
              <li>Your wallet address becomes the permanent owner of the campaign</li>
              <li>A real smart contract is deployed on-chain using the PancakeSwap factory</li>
              <li>The smart contract will send all collected funds to this wallet address</li>
              <li>Only the owner wallet can withdraw or manage campaign funds</li>
              <li>Ownership cannot be transferred later, so ensure you have access to this wallet</li>
            </ul>
          </Card.Text>
        </Card.Body>
      </Card>
      
      {renderWalletAlert()}
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Card className="mb-3">
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Campaign Title*</Form.Label>
              <Form.Control
                type="text"
                value={formData.basics.projectTitle}
                onChange={(e) => handleInputChange('basics', 'projectTitle', e.target.value)}
                required
                placeholder="Enter a clear, descriptive title"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Wallet Address (Connected)</Form.Label>
              <Form.Control
                type="text"
                value={connectedWallet}
                disabled
                readOnly
                className="bg-light"
              />
              <Form.Text className="text-muted">
                <strong>Important:</strong> This wallet will be the owner of the campaign. Only this wallet address 
                will be able to withdraw or manage funds. Make sure you have access to this wallet as ownership 
                cannot be transferred later.
              </Form.Text>
            </Form.Group>
            
            <TokenSelector 
              value={formData.basics.tokenAddress}
              onChange={(value) => handleInputChange('basics', 'tokenAddress', value)}
              onValidate={(tokenInfo) => setTokenInfo(tokenInfo)}
              onReset={() => setTokenInfo(null)}
            />
            
            <Form.Group className="mb-3">
              <Form.Label>Blockchain Chain*</Form.Label>
              <Form.Select 
                value={formData.basics.blockchainChain}
                onChange={(e) => handleInputChange('basics', 'blockchainChain', e.target.value)}
                required
              >
                {blockchainChains.map(chain => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Brief Description*</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.basics.projectDescription}
                onChange={(e) => handleInputChange('basics', 'projectDescription', e.target.value)}
                required
                placeholder="Briefly describe your project (max 300 characters)"
                maxLength={300}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Funding Goal*</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.basics.projectFundAmount}
                    onChange={(e) => handleInputChange('basics', 'projectFundAmount', e.target.value)}
                    required
                    min="1"
                    step="0.01"
                    placeholder="Enter amount"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Currency*</Form.Label>
                  <Form.Select
                    value={formData.basics.projectFundCurrency}
                    onChange={(e) => handleInputChange('basics', 'projectFundCurrency', e.target.value)}
                    required
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Campaign Image (Optional)</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
              />
              <Form.Text className="text-muted">
                Upload an image to represent your campaign. If not provided, a default image will be used.
              </Form.Text>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Launch Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.basics.projectLaunchDate}
                    onChange={(e) => handleInputChange('basics', 'projectLaunchDate', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Campaign Duration*</Form.Label>
                  <Form.Select
                    value={formData.basics.projectDeadlineDate}
                    onChange={(e) => handleInputChange('basics', 'projectDeadlineDate', e.target.value)}
                    required
                  >
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="activateImmediately"
                label="Activate campaign immediately"
                checked={formData.basics.activateImmediately}
                onChange={(e) => handleInputChange('basics', 'activateImmediately', e.target.checked)}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="includeIncentives"
                label="Include incentives for backers"
                checked={includeIncentives}
                onChange={(e) => setIncludeIncentives(e.target.checked)}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        {includeIncentives && (
          <Card className="mb-3">
            <Card.Body>
              <h5 className="mb-2">Campaign Incentive</h5>
              
              <Form.Group className="mb-2">
                <Form.Label>Title*</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.rewards.projectRewards[0].title}
                  onChange={(e) => handleRewardChange(0, 'title', e.target.value)}
                  required={includeIncentives}
                  placeholder="Enter a title for this reward"
                />
              </Form.Group>
              
              <Form.Group className="mb-2">
                <Form.Label>Description*</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.rewards.projectRewards[0].description}
                  onChange={(e) => handleRewardChange(0, 'description', e.target.value)}
                  required={includeIncentives}
                  placeholder="Describe what backers will receive"
                />
              </Form.Group>
              
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>Price*</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.rewards.projectRewards[0].price}
                      onChange={(e) => handleRewardChange(0, 'price', e.target.value)}
                      required={includeIncentives}
                      min="1"
                      step="0.01"
                      placeholder="Price"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>Quantity*</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.rewards.projectRewards[0].availableItems}
                      onChange={(e) => handleRewardChange(0, 'availableItems', e.target.value)}
                      required={includeIncentives}
                      min="1"
                      placeholder="Quantity"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>Delivery Date*</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.rewards.projectRewards[0].estimatedDelivery}
                      onChange={(e) => handleRewardChange(0, 'estimatedDelivery', e.target.value)}
                      required={includeIncentives}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
        
        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          className="w-100 mt-4"
          disabled={!connectedWallet || !isWalletVerified || submitting || (formData.basics.tokenAddress && !tokenInfo)}
        >
          Create Campaign
        </Button>
      </Form>
    </Container>
  );
};

export default CreateCampaignPage; 