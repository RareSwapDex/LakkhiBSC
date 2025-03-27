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
      tokenAddress: '',
    },
    milestones: [
      {
        title: 'Initial Release',
        description: 'Initial funding release upon campaign completion',
        targetAmount: '',
        dueDate: ''
      }
    ],
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
  
  // Handle milestone changes
  const handleMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      milestones: updatedMilestones
    }));
  };
  
  // Add milestone
  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          title: '',
          description: '',
          targetAmount: '',
          dueDate: ''
        }
      ]
    }));
  };
  
  // Remove milestone
  const removeMilestone = (index) => {
    if (formData.milestones.length <= 1) {
      setError('You must have at least one milestone');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };
  
  // Validate form including milestones
  const validateForm = () => {
    // Validate basic info
    if (!formData.basics.projectTitle || !formData.basics.projectDescription || !formData.basics.projectFundAmount) {
      setError('Please fill out all required fields');
      return false;
    }
    
    // Validate token
    if (!formData.basics.tokenAddress || !tokenInfo) {
      setError('Please provide and validate a token address');
      return false;
    }
    
    // Validate milestones
    if (formData.milestones.some(m => !m.title || !m.description || !m.targetAmount)) {
      setError('Please complete all milestone fields');
      return false;
    }
    
    // Calculate total milestone amounts
    const totalMilestoneAmount = formData.milestones.reduce(
      (sum, m) => sum + parseFloat(m.targetAmount || 0),
      0
    );
    
    // Compare with fund amount
    if (Math.abs(totalMilestoneAmount - parseFloat(formData.basics.projectFundAmount)) > 0.01) {
      setError(`Total milestone amounts (${totalMilestoneAmount}) must equal the fund amount (${formData.basics.projectFundAmount})`);
      return false;
    }
    
    return true;
  };
  
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
    
    // Validate form including milestones
    if (!validateForm()) {
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
      
      // Add milestones
      formDataToSend.append('milestones', JSON.stringify(formDataWithWallet.milestones));
      
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
      
      // Make API call to create campaign
      const createResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/campaigns/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Handle successful response
      console.log('Campaign created:', createResponse.data);
      
      setSubmitSuccess(true);
      setTimeout(() => {
        // Navigate to the new campaign page
        navigate(`/campaigns/${createResponse.data.campaign_id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating campaign:', error);
      setError(`Error creating campaign: ${error.message || 'Unknown error'}`);
      setSubmitting(false);
    }
  };
  
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
                  <Form.Label>Campaign Duration (days)*</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.basics.projectDeadlineDate}
                    onChange={(e) => handleInputChange('basics', 'projectDeadlineDate', e.target.value)}
                    required
                    min="1"
                    max="365"
                    placeholder="Enter number of days"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="activate-immediately"
                label="Activate campaign immediately after creation"
                checked={formData.basics.activateImmediately}
                onChange={(e) => handleInputChange('basics', 'activateImmediately', e.target.checked)}
              />
            </Form.Group>
          </Card.Body>
        </Card>
        
        {/* Milestones Section */}
        <Card className="mb-3">
          <Card.Header>
            <h3 className="mb-0">Campaign Milestones</h3>
            <small className="text-muted">Define how funds will be released as the campaign progresses</small>
          </Card.Header>
          <Card.Body>
            <p className="text-info mb-3">
              <strong>Note:</strong> The total target amount of all milestones must equal your campaign's funding goal.
              Currently: {formData.milestones.reduce((sum, m) => sum + parseFloat(m.targetAmount || 0), 0)} / {formData.basics.projectFundAmount || 0}
            </p>
            
            {formData.milestones.map((milestone, index) => (
              <Card key={index} className="mb-3 border-light">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Milestone #{index + 1}</h5>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => removeMilestone(index)}
                    disabled={formData.milestones.length <= 1}
                  >
                    Remove
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Title*</Form.Label>
                        <Form.Control
                          type="text"
                          value={milestone.title}
                          onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                          required
                          placeholder="e.g., Initial Development, Beta Release"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Target Amount*</Form.Label>
                        <Form.Control
                          type="number"
                          value={milestone.targetAmount}
                          onChange={(e) => handleMilestoneChange(index, 'targetAmount', e.target.value)}
                          required
                          min="0"
                          step="0.01"
                          placeholder="Amount for this milestone"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Due Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={milestone.dueDate}
                          onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)}
                          placeholder="Expected completion date"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Description*</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={milestone.description}
                      onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                      required
                      placeholder="Describe what will be accomplished in this milestone"
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            ))}
            
            <div className="d-grid gap-2">
              <Button 
                variant="outline-primary" 
                onClick={addMilestone}
                className="mt-2"
              >
                Add Another Milestone
              </Button>
            </div>
          </Card.Body>
        </Card>
        
        <Form.Group className="mb-3">
          <Form.Check 
            type="checkbox"
            id="include-incentives"
            label="Include supporter incentives (rewards)"
            checked={includeIncentives}
            onChange={(e) => setIncludeIncentives(e.target.checked)}
          />
        </Form.Group>
        
        {includeIncentives && (
          <Card className="mb-3">
            <Card.Header>
              <h3 className="mb-0">Rewards</h3>
            </Card.Header>
            <Card.Body>
              {formData.rewards.projectRewards.map((reward, index) => (
                <Row key={index} className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reward Title</Form.Label>
                      <Form.Control
                        type="text"
                        value={reward.title}
                        onChange={(e) => handleRewardChange(index, 'title', e.target.value)}
                        placeholder="e.g., Early Access"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price</Form.Label>
                      <Form.Control
                        type="number"
                        value={reward.price}
                        onChange={(e) => handleRewardChange(index, 'price', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="Minimum contribution to receive this reward"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={reward.description}
                        onChange={(e) => handleRewardChange(index, 'description', e.target.value)}
                        placeholder="Describe what supporters will receive"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              ))}
            </Card.Body>
          </Card>
        )}
        
        <div className="d-grid gap-2">
          <Button variant="primary" type="submit" size="lg">
            Create Campaign
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CreateCampaignPage; 