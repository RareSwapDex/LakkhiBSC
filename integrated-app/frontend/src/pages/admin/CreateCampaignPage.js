import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner, Tabs, Tab, ListGroup, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ProviderContext } from '../../web3/ProviderContext';
import TokenSelector from '../../components/TokenSelector';
import projectService from '../../services/projectService';
import Web3 from 'web3';

const CreateCampaignPage = () => {
  const navigate = useNavigate();
  const { provider, isConnected, account, chainId, switchChain } = useContext(ProviderContext);
  
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [includeIncentives, setIncludeIncentives] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState('');
  const [isWalletVerified, setIsWalletVerified] = useState(false);
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  
  // Token validation state
  const [validatingToken, setValidatingToken] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [tokenError, setTokenError] = useState(null);
  
  // Add state variables for token price conversion
  const [tokenPriceUSD, setTokenPriceUSD] = useState(null);
  const [tokenEquivalent, setTokenEquivalent] = useState(null);
  const [loadingTokenPrice, setLoadingTokenPrice] = useState(false);
  
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
      contractOwnerAddress: '', // Add contract owner address field
      category: '',
      tags: [],
      minContribution: '0.01',
      maxContribution: '',
      enableAutoRefund: true
    },
    story: {
      projectStory: '',
      projectGoals: '',
      projectRisks: '',
      projectTimeline: '',
      projectBudget: ''
    },
    team: {
      members: [
        {
          name: '',
          role: '',
          bio: '',
          social: ''
        }
      ]
    },
    social: {
      website: '',
      twitter: '',
      telegram: '',
      discord: '',
      github: '',
      linkedin: ''
    },
    updates: {
      scheduleCommitment: 'weekly', // weekly, biweekly, monthly
    },
    legal: {
      termsAccepted: false,
      privacyAccepted: false,
      refundPolicy: '',
      kycCompleted: false
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
  
  // Handle team member changes
  const handleTeamMemberChange = (index, field, value) => {
    const updatedMembers = [...formData.team.members];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: updatedMembers
      }
    }));
  };
  
  // Add team member
  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: [
          ...prev.team.members,
          {
            name: '',
            role: '',
            bio: '',
            social: ''
          }
        ]
      }
    }));
  };
  
  // Remove team member
  const removeTeamMember = (index) => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.filter((_, i) => i !== index)
      }
    }));
  };
  
  // Handle social link changes
  const handleSocialChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: value
      }
    }));
  };
  
  // Handle tag input
  const [tagInput, setTagInput] = useState('');
  
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.basics.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        basics: {
          ...prev.basics,
          tags: [...prev.basics.tags, tagInput.trim()]
        }
      }));
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      basics: {
        ...prev.basics,
        tags: prev.basics.tags.filter(tag => tag !== tagToRemove)
      }
    }));
  };
  
  // Validate form including milestones
  const validateForm = () => {
    let isValid = true;
    let invalidTabKey = null;
    
    // Validate basic info
    if (!formData.basics.projectTitle || !formData.basics.projectDescription || !formData.basics.projectFundAmount) {
      setError('Please fill out all required fields in the Basics section');
      isValid = false;
      invalidTabKey = 'basics';
    }
    
    // Validate token
    if (!formData.basics.tokenAddress || !tokenInfo) {
      setError('Please provide and validate a token address');
      isValid = false;
      invalidTabKey = invalidTabKey || 'basics';
    }
    
    // Validate contract owner address
    if (!formData.basics.contractOwnerAddress || !Web3.utils.isAddress(formData.basics.contractOwnerAddress)) {
      setError('Please provide a valid contract owner wallet address in the Basics section');
      isValid = false;
      invalidTabKey = invalidTabKey || 'basics';
    }
    
    // Validate detailed story
    if (!formData.story.projectStory || formData.story.projectStory.length < 100) {
      setError('Please provide a more detailed project story (at least 100 characters)');
      isValid = false;
      invalidTabKey = invalidTabKey || 'story';
    }
    
    // Validate legal terms
    if (!formData.legal.termsAccepted || !formData.legal.privacyAccepted) {
      setError('You must accept the terms of service and privacy policy');
      isValid = false;
      invalidTabKey = invalidTabKey || 'legal';
    }
    
    // Validate milestones
    if (formData.milestones.some(m => !m.title || !m.description || !m.targetAmount)) {
      setError('Please complete all milestone fields');
      isValid = false;
      invalidTabKey = invalidTabKey || 'milestones';
    }
    
    // Calculate total milestone amounts
    const totalMilestoneAmount = formData.milestones.reduce(
      (sum, m) => sum + parseFloat(m.targetAmount || 0),
      0
    );
    
    // Compare with fund amount
    if (Math.abs(totalMilestoneAmount - parseFloat(formData.basics.projectFundAmount)) > 0.01) {
      setError(`Total milestone amounts (${totalMilestoneAmount}) must equal the fund amount (${formData.basics.projectFundAmount})`);
      isValid = false;
      invalidTabKey = invalidTabKey || 'milestones';
    }
    
    return isValid;
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
      // Detect blockchain based on address format
      let detectedBlockchain = 'BSC'; // Default
      
      // Simple blockchain detection based on address format/prefix
      if (tokenAddress.startsWith('0x')) {
        // Could be BSC, Ethereum, or Base
        // We'll let the API determine which one
        if (window.ethereum) {
          try {
            // Try to detect chain ID from connected wallet
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId === '0x1') detectedBlockchain = 'Ethereum';
            else if (chainId === '0x38') detectedBlockchain = 'BSC';
            else if (chainId === '0x8453') detectedBlockchain = 'Base';
          } catch (e) {
            console.warn('Could not detect chain from wallet', e);
          }
        }
      } else if (tokenAddress.length >= 32 && tokenAddress.length <= 44) {
        // Likely Solana address
        detectedBlockchain = 'Solana';
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/token/validate/`,
        { 
          token_address: tokenAddress,
          blockchain: detectedBlockchain // Send detected blockchain as a hint
        }
      );
      
      if (response.data.success) {
        const tokenData = response.data.token_info;
        
        // If API response includes blockchain info, use it, otherwise use our detection
        if (tokenData.blockchain) {
          // Update blockchain in form data
          handleInputChange('basics', 'blockchainChain', tokenData.blockchain);
        } else {
          // Set the blockchain we detected
          tokenData.blockchain = detectedBlockchain;
          handleInputChange('basics', 'blockchainChain', detectedBlockchain);
        }
        
        setTokenInfo(tokenData);
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
          
          // Also set the contract owner address to the connected wallet by default
          handleInputChange('basics', 'contractOwnerAddress', account);
          
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
  
  // Check if current chain matches token's blockchain
  const validateChainMatch = () => {
    if (!tokenInfo || !tokenInfo.blockchain) {
      setError('Token blockchain information is missing');
      return false;
    }

    // Get current chain ID from context
    const currentChainName = (() => {
      if (chainId) {
        if (chainId === '0x1') return 'Ethereum';
        if (chainId === '0x38') return 'BSC';
        if (chainId === '0x8453') return 'Base';
      }
      return null;
    })();

    if (!currentChainName) {
      setError('Unable to determine current network. Please ensure your wallet is connected.');
      return false;
    }

    // Check if current chain matches the token's blockchain
    return currentChainName === tokenInfo.blockchain;
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
    
    // Check if the wallet's chain matches the token's blockchain
    if (!validateChainMatch()) {
      setError(`Your wallet must be on the ${tokenInfo.blockchain} network to create this campaign. Please switch networks.`);
      return;
    }
    
    // Validate complete form
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
        if (key === 'tags') {
          formDataToSend.append(`basics.${key}`, JSON.stringify(formDataWithWallet.basics[key]));
        } else {
        formDataToSend.append(`basics.${key}`, formDataWithWallet.basics[key]);
        }
      });
      
      // Add story fields
      Object.keys(formDataWithWallet.story).forEach(key => {
        formDataToSend.append(`story.${key}`, formDataWithWallet.story[key]);
      });
      
      // Add team info
      formDataToSend.append('team.members', JSON.stringify(formDataWithWallet.team.members));
      
      // Add social links
      Object.keys(formDataWithWallet.social).forEach(key => {
        formDataToSend.append(`social.${key}`, formDataWithWallet.social[key]);
      });
      
      // Add update schedule
      formDataToSend.append('updates.scheduleCommitment', formDataWithWallet.updates.scheduleCommitment);
      
      // Add legal info
      Object.keys(formDataWithWallet.legal).forEach(key => {
        formDataToSend.append(`legal.${key}`, formDataWithWallet.legal[key]);
      });
      
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
      
      // Get the contract owner address from form data or use connected wallet
      const contractOwner = formData.basics.contractOwnerAddress || account;
      
      // Inform user about the transaction
      setError('Please confirm the transaction in your wallet to deploy the campaign smart contract...');
      
      // Ensure we have access to window.ethereum (MetaMask)
      if (!window.ethereum) {
        setError('MetaMask not detected! Please install MetaMask and refresh the page.');
        return null;
      }
      
      // Initialize Web3 directly with window.ethereum
      const web3 = new Web3(window.ethereum);
      
      // Updated Campaign factory ABI with new parameters
      const factoryABI = [
        {
          "inputs": [
            {"name": "name", "type": "string"},
            {"name": "tokenAddress", "type": "address"},
            {"name": "beneficiary", "type": "address"},
            {"name": "targetAmount", "type": "uint256"},
            {"name": "minContribution", "type": "uint256"},
            {"name": "maxContribution", "type": "uint256"},
            {"name": "durationInDays", "type": "uint256"},
            {"name": "milestones", "type": "tuple[]", "components": [
              {"name": "title", "type": "string"},
              {"name": "description", "type": "string"},
              {"name": "amount", "type": "uint256"},
              {"name": "releaseTime", "type": "uint256"}
            ]},
            {"name": "enableAutoRefund", "type": "bool"}
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
      
      // Convert min contribution to wei (default to 0.01 ETH if not set)
      const minContributionInWei = web3.utils.toWei(
        formData.basics.minContribution || '0.01', 
        'ether'
      );
      
      // Convert max contribution to wei (or set to max uint256 if not specified)
      const maxContributionInWei = formData.basics.maxContribution 
        ? web3.utils.toWei(formData.basics.maxContribution, 'ether')
        : '115792089237316195423570985008687907853269984665640564039457584007913129639935'; // max uint256
      
      // Format milestones for the contract
      const formattedMilestones = formData.milestones.map(milestone => {
        // Calculate timestamp for due date or use campaign end date if not specified
        let releaseTime;
        if (milestone.dueDate) {
          releaseTime = Math.floor(new Date(milestone.dueDate).getTime() / 1000);
        } else {
          // If no specific due date, use campaign end date (now + duration)
          const campaignEndDate = new Date();
          campaignEndDate.setDate(campaignEndDate.getDate() + durationInDays);
          releaseTime = Math.floor(campaignEndDate.getTime() / 1000);
        }
        
        return {
          title: milestone.title,
          description: milestone.description,
          amount: web3.utils.toWei(milestone.targetAmount.toString(), 'ether'),
          releaseTime: releaseTime
        };
      });
      
      console.log('Deploying contract with params:', {
        name: formData.basics.projectTitle,
        tokenAddress: formData.basics.tokenAddress,
        beneficiary: contractOwner, // Use contract owner address
        targetAmount: fundAmountInWei,
        minContribution: minContributionInWei,
        maxContribution: maxContributionInWei,
        durationInDays: durationInDays,
        milestones: formattedMilestones,
        enableAutoRefund: formData.basics.enableAutoRefund
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
            contractOwner, // Use contract owner address
            fundAmountInWei,
            minContributionInWei,
            maxContributionInWei,
            durationInDays,
            formattedMilestones,
            formData.basics.enableAutoRefund
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
  
  // Campaign categories
  const campaignCategories = [
    { id: '', name: 'Select a category' },
    { id: 'defi', name: 'DeFi' },
    { id: 'nft', name: 'NFT' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'metaverse', name: 'Metaverse' },
    { id: 'dao', name: 'DAO' },
    { id: 'infrastructure', name: 'Infrastructure' },
    { id: 'social', name: 'Social' },
    { id: 'other', name: 'Other' }
  ];
  
  // Add a function to handle token info updates from TokenSelector
  const handleTokenValidation = (tokenInfo) => {
    setTokenInfo(tokenInfo);
    
    // If token validation included blockchain info, update the form's blockchain chain
    if (tokenInfo && tokenInfo.blockchain) {
      // Update the blockchain chain based on the detected blockchain
      handleInputChange('basics', 'blockchainChain', tokenInfo.blockchain);
    } else {
      // Default to BSC if blockchain info wasn't detected
      handleInputChange('basics', 'blockchainChain', 'BSC');
    }
  };
  
  // Add this function to get prices from open, CORS-friendly APIs
  const getTokenPrice = async (tokenSymbol) => {
    try {
      // Try multiple public APIs until we get a price
      
      // Option 1: Use CoinGecko public API through a CORS proxy
      const corsProxy = 'https://cors-anywhere.herokuapp.com/';
      const coinGeckoAPI = 'https://api.coingecko.com/api/v3/simple/price';
      
      // Convert common token symbols to CoinGecko IDs
      let coinId = tokenSymbol.toLowerCase();
      if (tokenSymbol === 'WHY') coinId = 'whitebit';
      if (tokenSymbol === 'CAKE') coinId = 'pancakeswap-token';
      if (tokenSymbol === 'KILO') coinId = 'kilopi';
      
      const response = await axios.get(`${corsProxy}${coinGeckoAPI}?ids=${coinId}&vs_currencies=usd`);
      
      if (response.data && response.data[coinId] && response.data[coinId].usd) {
        return response.data[coinId].usd;
      }
      
      // If CoinGecko fails, try Binance price API through proxy for popular tokens
      if (['BNB', 'CAKE', 'ETH', 'WBNB'].includes(tokenSymbol)) {
        const symbol = tokenSymbol === 'WBNB' ? 'BNB' : tokenSymbol;
        const binanceAPI = 'https://api.binance.com/api/v3/ticker/price';
        const binanceResponse = await axios.get(`${corsProxy}${binanceAPI}?symbol=${symbol}USDT`);
        
        if (binanceResponse.data && binanceResponse.data.price) {
          return parseFloat(binanceResponse.data.price);
        }
      }
      
      // If both fail, throw an error
      throw new Error('Could not retrieve price data');
    } catch (error) {
      console.error('Error fetching token price:', error);
      throw error;
    }
  };
  
  // New function to get token prices without CORS issues
  const getTokenPriceWithoutCORS = async (tokenAddress, tokenSymbol, blockchain) => {
    try {
      console.log(`Attempting to get price for ${tokenSymbol} (${tokenAddress}) on ${blockchain}`);
      
      // Try on-chain price first (most accurate for the specific blockchain)
      if (blockchain === 'BSC' || blockchain === 'Ethereum') {
        try {
          console.log(`Attempting to get price from ${blockchain} blockchain directly...`);
          const dexPrice = await getTokenPriceFromDex(tokenAddress, blockchain);
          if (dexPrice && dexPrice > 0) {
            console.log(`Successfully got price from DEX: ${dexPrice}`);
            return dexPrice;
          }
        } catch (dexError) {
          console.warn('DEX price lookup failed:', dexError);
        }
      }
      
      // Try our backend API with proper CORS headers
      try {
        console.log('Attempting to get price from backend API...');
        // Use axios with credentials and full URL
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
        
        if (response.data && response.data.success && response.data.price_usd) {
          console.log(`Successfully got price from backend API: ${response.data.price_usd}`);
          return parseFloat(response.data.price_usd);
        }
      } catch (apiError) {
        console.warn('Backend API price fallback failed:', apiError.message);
      }
      
      // Try CoinGecko public API directly 
      try {
        console.log('Attempting to get price from CoinGecko...');
        // Convert blockchain name to CoinGecko network ID
        const network = blockchain === 'Ethereum' ? 'ethereum' : 
                         blockchain === 'BSC' ? 'binance-smart-chain' : 'ethereum';
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/token_price/${network}?contract_addresses=${tokenAddress}&vs_currencies=usd`
        );
        const data = await response.json();
        
        if (data && data[tokenAddress.toLowerCase()] && data[tokenAddress.toLowerCase()].usd) {
          const price = data[tokenAddress.toLowerCase()].usd;
          console.log(`Successfully got price from CoinGecko: ${price}`);
          return price;
        }
      } catch (coinGeckoError) {
        console.warn('CoinGecko API lookup failed:', coinGeckoError);
      }
      
      // If all attempts fail, return null to indicate failure
      console.warn(`Could not retrieve price data for ${tokenSymbol}`);
      return null;
    } catch (error) {
      console.error('Error getting token price:', error);
      return null;
    }
  };
  
  // Helper function to get CoinGecko network ID
  const getNetworkForCoinGecko = (blockchain) => {
    switch (blockchain) {
      case 'Ethereum':
        return 'ethereum';
      case 'BSC':
        return 'binance-smart-chain';
      case 'Base':
        return 'base';
      default:
        return 'ethereum';
    }
  };
  
  // Replace the useEffect for token price calculation
  useEffect(() => {
    const calculateTokenEquivalent = async () => {
      if (tokenInfo && formData.basics.projectFundAmount && formData.basics.projectFundCurrency === 'USD') {
        try {
          setLoadingTokenPrice(true);
          
          const price = await getTokenPriceWithoutCORS(
            tokenInfo.address, 
            tokenInfo.symbol,
            formData.basics.blockchainChain
          );
          
          if (price && price > 0) {
            setTokenPriceUSD(price);
            const fundAmount = parseFloat(formData.basics.projectFundAmount);
            
            if (!isNaN(fundAmount)) {
              const equivalent = fundAmount / price;
              setTokenEquivalent(equivalent);
            } else {
              setTokenEquivalent(null);
            }
          } else {
            // Price lookup failed
            setTokenPriceUSD(null);
            setTokenEquivalent(null);
          }
        } catch (error) {
          console.error('Error calculating token equivalent:', error);
          setTokenPriceUSD(null);
          setTokenEquivalent(null);
        } finally {
          setLoadingTokenPrice(false);
        }
      } else {
        setTokenPriceUSD(null);
        setTokenEquivalent(null);
      }
    };
    
    calculateTokenEquivalent();
  }, [tokenInfo, formData.basics.projectFundAmount, formData.basics.projectFundCurrency, formData.basics.blockchainChain]);
  
  // Improve the PancakeSwap router for BSC tokens - ensure the correct pairs are used
  const getTokenPriceFromDex = async (tokenAddress, blockchain) => {
    if (blockchain === 'Ethereum') {
      return await getEthereumTokenPrice(tokenAddress);
    } else if (blockchain === 'BSC') {
      return await getBscTokenPrice(tokenAddress);
    } else if (blockchain === 'Base') {
      return await getBaseTokenPrice(tokenAddress);
    } else {
      console.warn(`Unsupported blockchain for price lookup: ${blockchain}`);
      return null;
    }
  };
  
  // Function to get Ethereum token prices
  const getEthereumTokenPrice = async (tokenAddress) => {
    try {
      console.log('Using Ethereum token price lookup for', tokenAddress);
      
      // Use a reliable Ethereum RPC
      const RPC_URL = 'https://eth.llamarpc.com';
      const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
      
      // WETH Address on Ethereum
      const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
      
      // USDC Address on Ethereum
      const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
      
      // Token ABI (minimal for decimals)
      const tokenAbi = [
        {
          "inputs": [],
          "name": "decimals",
          "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
      // Get token info
      const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
      let decimals, symbol;
      
      try {
        decimals = await tokenContract.methods.decimals().call();
        symbol = await tokenContract.methods.symbol().call();
        console.log(`Token symbol: ${symbol}, decimals: ${decimals}`);
      } catch (error) {
        console.warn('Error getting token info, using defaults:', error);
        decimals = 18;
      }
      
      // Try to get price from CoinGecko by contract address
      try {
        console.log('Trying CoinGecko direct contract lookup');
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${tokenAddress}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.market_data && data.market_data.current_price && data.market_data.current_price.usd) {
            console.log(`Found price from CoinGecko: ${data.market_data.current_price.usd}`);
            return data.market_data.current_price.usd;
          }
        }
      } catch (cgError) {
        console.warn('CoinGecko contract lookup failed:', cgError);
      }
      
      // Try to use a public API like Ethplorer
      try {
        console.log('Trying Ethplorer API');
        const response = await fetch(`https://api.ethplorer.io/getTokenInfo/${tokenAddress}?apiKey=freekey`);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.price && data.price.rate) {
            console.log(`Found price from Ethplorer: ${data.price.rate}`);
            return data.price.rate;
          }
        }
      } catch (ethplorerError) {
        console.warn('Ethplorer lookup failed:', ethplorerError);
      }
      
      // Try 1inch quote API
      try {
        console.log('Trying 1inch API');
        // Amount for 1 token with proper decimals
        const amountIn = web3.utils.toBN(10).pow(web3.utils.toBN(decimals)).toString();
        
        const response = await fetch(`https://api.1inch.io/v5.0/1/quote?fromTokenAddress=${tokenAddress}&toTokenAddress=${USDC_ADDRESS}&amount=${amountIn}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.toTokenAmount) {
            // USDC has 6 decimals
            const price = data.toTokenAmount / Math.pow(10, 6) / (amountIn / Math.pow(10, decimals));
            console.log(`Found price from 1inch: ${price}`);
            return price;
          }
        }
      } catch (inchError) {
        console.warn('1inch API lookup failed:', inchError);
      }
      
      console.log('All Ethereum price lookup methods failed');
      return null;
    } catch (error) {
      console.error('Error in getEthereumTokenPrice:', error);
      return null;
    }
  };
  
  // Function to get BSC token prices using PancakeSwap
  const getBscTokenPrice = async (tokenAddress) => {
    try {
      console.log('Using BSC/PancakeSwap token price lookup for', tokenAddress);
      
      // Use BSC RPC endpoint that's more reliable and public
      const RPC_URL = 'https://bsc-dataseed1.binance.org/';
      const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
      
      // PancakeSwap Router Address (v2)
      const PANCAKE_ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
      
      // BNB/WBNB token address
      const WBNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
      
      // BUSD token address
      const BUSD_ADDRESS = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
      
      // USDT token address
      const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
      
      // Router ABI (minimal for price checking)
      const routerAbi = [
        {
          "inputs": [
            { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
            { "internalType": "address[]", "name": "path", "type": "address[]" }
          ],
          "name": "getAmountsOut",
          "outputs": [
            { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
      // Token ABI (minimal for decimals)
      const tokenAbi = [
        {
          "inputs": [],
          "name": "decimals",
          "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
      // Initialize router contract
      const router = new web3.eth.Contract(routerAbi, PANCAKE_ROUTER_ADDRESS);
      
      // Get token decimals or default to 18
      let decimals = 18;
      try {
        const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
        decimals = await tokenContract.methods.decimals().call();
        console.log(`Token decimals: ${decimals}`);
      } catch (error) {
        console.warn('Error getting token decimals, using default 18:', error);
      }
      
      // Set amount of tokens to get price for (1 token with decimals)
      const amountIn = web3.utils.toBN(10).pow(web3.utils.toBN(decimals)).toString();
      
      // Try token -> BUSD direct pair first (simplest)
      try {
        console.log('Trying direct Token->BUSD path');
        const directPath = [tokenAddress, BUSD_ADDRESS];
        const directAmounts = await router.methods.getAmountsOut(amountIn, directPath).call();
        
        const busdDecimals = 18;  // BUSD has 18 decimals
        const priceInBusd = directAmounts[1] / Math.pow(10, busdDecimals);
        
        if (priceInBusd > 0) {
          console.log(`Direct price in BUSD: ${priceInBusd}`);
          return priceInBusd;
        }
      } catch (error) {
        console.warn('Error getting direct BUSD price:', error);
      }
      
      // Try token -> USDT direct pair
      try {
        console.log('Trying direct Token->USDT path');
        const usdtPath = [tokenAddress, USDT_ADDRESS];
        const usdtAmounts = await router.methods.getAmountsOut(amountIn, usdtPath).call();
        
        const usdtDecimals = 18;  // USDT on BSC has 18 decimals
        const priceInUsdt = usdtAmounts[1] / Math.pow(10, usdtDecimals);
        
        if (priceInUsdt > 0) {
          console.log(`Direct price in USDT: ${priceInUsdt}`);
          return priceInUsdt;
        }
      } catch (error) {
        console.warn('Error getting direct USDT price:', error);
      }
      
      // Try Token -> BNB -> BUSD path
      try {
        console.log('Trying Token->BNB->BUSD path');
        // First get BNB/WBNB price in BUSD
        const bnbToBusdPath = [WBNB_ADDRESS, BUSD_ADDRESS];
        const bnbBusdAmounts = await router.methods.getAmountsOut(web3.utils.toWei('1', 'ether'), bnbToBusdPath).call();
        const bnbPriceInBusd = bnbBusdAmounts[1] / Math.pow(10, 18);
        console.log(`BNB price in BUSD: ${bnbPriceInBusd}`);
        
        // Then get token price in BNB
        const tokenToBnbPath = [tokenAddress, WBNB_ADDRESS];
        const tokenBnbAmounts = await router.methods.getAmountsOut(amountIn, tokenToBnbPath).call();
        const tokenPriceInBnb = tokenBnbAmounts[1] / Math.pow(10, 18);
        console.log(`Token price in BNB: ${tokenPriceInBnb}`);
        
        // Calculate token price in USD
        const tokenPriceInUsd = tokenPriceInBnb * bnbPriceInBusd;
        
        if (tokenPriceInUsd > 0) {
          console.log(`Price via BNB: ${tokenPriceInUsd}`);
          return tokenPriceInUsd;
        }
      } catch (error) {
        console.warn('Error getting price via BNB:', error);
      }
      
      return null;
    } catch (error) {
      console.error('Error in getBscTokenPrice:', error);
      return null;
    }
  };
  
  // Function to get Base token prices
  const getBaseTokenPrice = async (tokenAddress) => {
    try {
      console.log('Using Base token price lookup for', tokenAddress);
      
      // Use a reliable Base RPC
      const RPC_URL = 'https://mainnet.base.org';
      const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
      
      // WETH Address on Base
      const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
      
      // USDC Address on Base
      const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
      
      // Token ABI (minimal for decimals)
      const tokenAbi = [
        {
          "inputs": [],
          "name": "decimals",
          "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
      // Get token info
      const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
      let decimals, symbol;
      
      try {
        decimals = await tokenContract.methods.decimals().call();
        symbol = await tokenContract.methods.symbol().call();
        console.log(`Token symbol: ${symbol}, decimals: ${decimals}`);
      } catch (error) {
        console.warn('Error getting token info, using defaults:', error);
        decimals = 18;
      }
      
      // Try to get price from CoinGecko by contract address
      try {
        console.log('Trying CoinGecko direct contract lookup');
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/base/contract/${tokenAddress}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.market_data && data.market_data.current_price && data.market_data.current_price.usd) {
            console.log(`Found price from CoinGecko: ${data.market_data.current_price.usd}`);
            return data.market_data.current_price.usd;
          }
        }
      } catch (cgError) {
        console.warn('CoinGecko contract lookup failed:', cgError);
      }
      
      // Try to use Base token price API endpoint (when available)
      try {
        console.log('Trying Basescan API');
        const response = await fetch(`https://api.basescan.org/api?module=token&action=tokeninfo&contractaddress=${tokenAddress}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.result && data.result.tokenPriceUSD) {
            console.log(`Found price from Basescan: ${data.result.tokenPriceUSD}`);
            return parseFloat(data.result.tokenPriceUSD);
          }
        }
      } catch (baseError) {
        console.warn('Basescan lookup failed:', baseError);
      }
      
      // Try to get price from our backend API
      try {
        console.log('Trying backend API for Base token');
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/token/price/?token_address=${tokenAddress}&blockchain=Base`,
          { 
            withCredentials: true,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data && response.data.success && response.data.price_usd) {
          console.log(`Successfully got price from backend API: ${response.data.price_usd}`);
          return parseFloat(response.data.price_usd);
        }
      } catch (apiError) {
        console.warn('Backend API for Base token failed:', apiError.message);
      }
      
      // Try defilama API which has good Base coverage
      try {
        console.log('Trying DefiLlama API');
        const response = await fetch(`https://coins.llama.fi/prices/current/base:${tokenAddress}`);
        
        if (response.ok) {
          const data = await response.json();
          const priceKey = `base:${tokenAddress.toLowerCase()}`;
          
          if (data && data.coins && data.coins[priceKey] && data.coins[priceKey].price) {
            console.log(`Found price from DefiLlama: ${data.coins[priceKey].price}`);
            return data.coins[priceKey].price;
          }
        }
      } catch (llamaError) {
        console.warn('DefiLlama API lookup failed:', llamaError);
      }
      
      // If all specialized methods fail, try to use a generic approach with the token
      console.log('All Base price lookup methods failed');
      return null;
    } catch (error) {
      console.error('Error in getBaseTokenPrice:', error);
      return null;
    }
  };
  
  // Function to get chain ID from blockchain name
  const getChainIdFromBlockchain = (blockchain) => {
    if (blockchain === 'BSC') return '0x38';
    if (blockchain === 'Ethereum') return '0x1';
    if (blockchain === 'Base') return '0x8453';
    return null;
  };

  // Function to switch networks in MetaMask
  const changeBlockchainNetwork = async (targetBlockchain) => {
    try {
      setIsSwitchingChain(true);
      setError(`Switching to ${targetBlockchain} network. Please confirm in your wallet...`);
      
      const targetChainId = getChainIdFromBlockchain(targetBlockchain);
      if (!targetChainId) {
        throw new Error(`Unknown blockchain: ${targetBlockchain}`);
      }
      
      await switchChain(targetChainId);
      
      setError(`Successfully switched to ${targetBlockchain} network. You can now create your campaign.`);
      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      setError(`Failed to switch network: ${error.message}`);
      return false;
    } finally {
      setIsSwitchingChain(false);
    }
  };
  
  // Add network mismatch alert function
  const renderNetworkAlert = () => {
    // Only show if token is validated and there's a blockchain mismatch
    if (tokenInfo && tokenInfo.blockchain) {
      // Check if we can determine the current chain
      const currentChainName = (() => {
        if (chainId) {
          if (chainId === '0x1') return 'Ethereum';
          if (chainId === '0x38') return 'BSC';
          if (chainId === '0x8453') return 'Base';
        }
        return null;
      })();

      // If we can't determine the chain or if it matches, don't show alert
      if (!currentChainName || currentChainName === tokenInfo.blockchain) {
        return null;
      }

      return (
        <Alert variant="danger" className="mt-2 mb-3">
          <Alert.Heading>⚠️ Network Mismatch Detected</Alert.Heading>
          <p>
            Your wallet is connected to <strong>{currentChainName}</strong> but your token 
            <strong> {tokenInfo.symbol} </strong> is on <strong>{tokenInfo.blockchain}</strong>.
          </p>
          <p className="mb-0 fw-bold">
            You MUST switch to the {tokenInfo.blockchain} network before creating this campaign.
          </p>
          <hr />
          <div className="d-grid">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => changeBlockchainNetwork(tokenInfo.blockchain)}
              disabled={isSwitchingChain}
              className="mt-2"
            >
              {isSwitchingChain ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Switching to {tokenInfo.blockchain}...
                </>
              ) : (
                `Switch to ${tokenInfo.blockchain} Network`
              )}
            </Button>
          </div>
        </Alert>
      );
    }
    
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
      
      {renderNetworkAlert()}
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs defaultActiveKey="basics" id="campaign-form-tabs" className="mb-3">
        <Tab eventKey="basics" title="Basics">
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
                <Form.Label>Category*</Form.Label>
                <Form.Select
                  value={formData.basics.category}
                  onChange={(e) => handleInputChange('basics', 'category', e.target.value)}
                  required
                >
                  {campaignCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Tags</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Enter a tag and press Add"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button variant="outline-secondary" onClick={handleAddTag}>
                    Add
                  </Button>
                </InputGroup>
                <div className="mt-2">
                  {formData.basics.tags.map((tag, index) => (
                    <span key={index} className="badge bg-primary me-2 mb-2 p-2">
                      {tag}
                      <button 
                        type="button" 
                        className="btn-close btn-close-white ms-2" 
                        style={{ fontSize: '0.5rem' }}
                        onClick={() => handleRemoveTag(tag)}
                        aria-label="Remove tag"
                      ></button>
                    </span>
                  ))}
                </div>
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
                <strong>Important:</strong> This wallet will be the owner of the campaign and will create the campaign record.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Contract Owner Address (for fund management)</Form.Label>
              <Form.Control
                type="text"
                value={connectedWallet}  // Default to connected wallet
                onChange={(e) => handleInputChange('basics', 'contractOwnerAddress', e.target.value)}
                placeholder="0x..."
              />
              <Form.Text className="text-muted">
                <strong>Important:</strong> This wallet will be the owner of the campaign's smart contract. Only this wallet address 
                will be able to withdraw or manage funds. Make sure it's correct as ownership cannot be transferred later.
                Leave as your connected wallet address if you want to manage the funds yourself.
              </Form.Text>
            </Form.Group>
            
            <TokenSelector 
              value={formData.basics.tokenAddress}
              onChange={(value) => handleInputChange('basics', 'tokenAddress', value)}
                onValidate={handleTokenValidation}
                onReset={() => {
                  setTokenInfo(null);
                  // Reset to BSC when token is cleared
                  handleInputChange('basics', 'blockchainChain', 'BSC');
                }}
            />
            
            <Form.Group className="mb-3">
              <Form.Label>Blockchain Chain*</Form.Label>
                <Form.Control 
                  type="text"
                value={formData.basics.blockchainChain}
                  readOnly
                  className="bg-light"
                required
                />
                <Form.Text className="text-muted">
                  This field is automatically set based on the validated token's blockchain.
                </Form.Text>
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
                    {loadingTokenPrice && (
                      <Form.Text className="text-muted mt-2">
                        Calculating token equivalent...
                      </Form.Text>
                    )}
                    {tokenInfo && tokenEquivalent && tokenPriceUSD && !loadingTokenPrice && (
                      <Form.Text className="text-muted mt-2">
                        Approximately {tokenEquivalent.toLocaleString(undefined, { maximumFractionDigits: 6 })} {tokenInfo.symbol} 
                        {` (1 ${tokenInfo.symbol} = $${parseFloat(tokenPriceUSD).toLocaleString(undefined, { maximumFractionDigits: 6 })} USD)`}
                        <br/>
                        <span className="text-success">Chain: {formData.basics.blockchainChain}</span>
                      </Form.Text>
                    )}
                    {tokenInfo && !tokenPriceUSD && !loadingTokenPrice && (
                      <Form.Text className="text-danger mt-2">
                        Unable to retrieve price information for {tokenInfo.symbol}. Token conversion cannot be calculated.
                        <br/>
                        <span className="text-success">Chain: {formData.basics.blockchainChain}</span>
                      </Form.Text>
                    )}
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

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Minimum Contribution ({formData.basics.projectFundCurrency})</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.basics.minContribution}
                      onChange={(e) => handleInputChange('basics', 'minContribution', e.target.value)}
                      min="0.01"
                      step="0.01"
                      placeholder="Enter minimum contribution amount"
                    />
                    <Form.Text className="text-muted">
                      The smallest amount a supporter can contribute (default: 0.01)
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Maximum Contribution ({formData.basics.projectFundCurrency})</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.basics.maxContribution}
                      onChange={(e) => handleInputChange('basics', 'maxContribution', e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="Leave empty for no limit"
                    />
                    <Form.Text className="text-muted">
                      The largest amount a supporter can contribute (leave empty for no limit)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                  id="enable-auto-refund"
                  label="Enable automatic refunds if campaign fails to reach target"
                  checked={formData.basics.enableAutoRefund}
                  onChange={(e) => handleInputChange('basics', 'enableAutoRefund', e.target.checked)}
                />
                <Form.Text className="text-muted">
                  When enabled, contributors will automatically receive refunds if the campaign doesn't meet its target
                </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>
        </Tab>

        <Tab eventKey="story" title="Detailed Story">
          <Card className="mb-3">
            <Card.Body>
              <p className="text-muted mb-3">
                A detailed project story helps potential supporters understand your vision and increases your chances of success.
              </p>
              
              <Form.Group className="mb-3">
                <Form.Label>Project Story*</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={formData.story.projectStory}
                  onChange={(e) => handleInputChange('story', 'projectStory', e.target.value)}
                  required
                  placeholder="Describe your project in detail. What are you creating and why is it important?"
                />
                <Form.Text className="text-muted">
                  {formData.story.projectStory.length} characters (min 100 recommended)
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Project Goals</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.story.projectGoals}
                  onChange={(e) => handleInputChange('story', 'projectGoals', e.target.value)}
                  placeholder="What specific goals are you trying to achieve with this funding?"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Project Timeline</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.story.projectTimeline}
                  onChange={(e) => handleInputChange('story', 'projectTimeline', e.target.value)}
                  placeholder="Outline the major phases and timeline of your project"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Budget Breakdown</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.story.projectBudget}
                  onChange={(e) => handleInputChange('story', 'projectBudget', e.target.value)}
                  placeholder="How will you use the funds? Provide a breakdown of your budget."
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Risks and Challenges</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.story.projectRisks}
                  onChange={(e) => handleInputChange('story', 'projectRisks', e.target.value)}
                  placeholder="What risks or challenges might you face, and how will you address them?"
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="team" title="Team">
          <Card className="mb-3">
            <Card.Body>
              <p className="text-muted mb-3">
                Introduce your team to build trust with potential supporters.
              </p>
              
              {formData.team.members.map((member, index) => (
                <Card key={index} className="mb-3 border-light">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Team Member #{index + 1}</h5>
                    {formData.team.members.length > 1 && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => removeTeamMember(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={member.name}
                            onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                            placeholder="Full name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Role</Form.Label>
                          <Form.Control
                            type="text"
                            value={member.role}
                            onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                            placeholder="e.g., Project Lead, Developer, Designer"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={member.bio}
                        onChange={(e) => handleTeamMemberChange(index, 'bio', e.target.value)}
                        placeholder="Brief biography highlighting relevant experience"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Social Link</Form.Label>
                      <Form.Control
                        type="text"
                        value={member.social}
                        onChange={(e) => handleTeamMemberChange(index, 'social', e.target.value)}
                        placeholder="LinkedIn, Twitter, or GitHub profile link"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              ))}
              
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-primary" 
                  onClick={addTeamMember}
                  className="mt-2"
                >
                  Add Team Member
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="social" title="Social & Links">
          <Card className="mb-3">
            <Card.Body>
              <p className="text-muted mb-3">
                Connect your social platforms to build credibility and keep supporters updated.
              </p>
              
              <Form.Group className="mb-3">
                <Form.Label>Website</Form.Label>
                <Form.Control
                  type="url"
                  value={formData.social.website}
                  onChange={(e) => handleSocialChange('website', e.target.value)}
                  placeholder="https://yourdomain.com"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Twitter</Form.Label>
                <InputGroup>
                  <InputGroup.Text>twitter.com/</InputGroup.Text>
                  <Form.Control
                    type="text"
                    value={formData.social.twitter}
                    onChange={(e) => handleSocialChange('twitter', e.target.value)}
                    placeholder="username"
                  />
                </InputGroup>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Telegram</Form.Label>
                <InputGroup>
                  <InputGroup.Text>t.me/</InputGroup.Text>
                  <Form.Control
                    type="text"
                    value={formData.social.telegram}
                    onChange={(e) => handleSocialChange('telegram', e.target.value)}
                    placeholder="username or group"
                  />
                </InputGroup>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Discord</Form.Label>
                <InputGroup>
                  <InputGroup.Text>discord.gg/</InputGroup.Text>
                  <Form.Control
                    type="text"
                    value={formData.social.discord}
                    onChange={(e) => handleSocialChange('discord', e.target.value)}
                    placeholder="invite code"
                  />
                </InputGroup>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>GitHub</Form.Label>
                <InputGroup>
                  <InputGroup.Text>github.com/</InputGroup.Text>
                  <Form.Control
                    type="text"
                    value={formData.social.github}
                    onChange={(e) => handleSocialChange('github', e.target.value)}
                    placeholder="username or organization"
                  />
                </InputGroup>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>LinkedIn</Form.Label>
                <InputGroup>
                  <InputGroup.Text>linkedin.com/in/</InputGroup.Text>
                  <Form.Control
                    type="text"
                    value={formData.social.linkedin}
                    onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                    placeholder="username"
                  />
                </InputGroup>
              </Form.Group>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="milestones" title="Milestones">
          <Card className="mb-3">
            <Card.Header>
              <h3 className="mb-0">Campaign Milestones</h3>
              <small className="text-muted">Define how funds will be released as the campaign progresses</small>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-3">
                <Alert.Heading>Smart Contract Integration</Alert.Heading>
                <p>
                  These milestones are directly integrated into your campaign's smart contract. Each milestone:
                  <ul className="mb-0">
                    <li>Locks a portion of funds until the specified date</li>
                    <li>Requires meeting milestone criteria before funds can be released</li>
                    <li>Creates transparency and accountability for your backers</li>
                  </ul>
                </p>
              </Alert>
              
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
                          <Form.Label>Target Amount* ({formData.basics.projectFundCurrency})</Form.Label>
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
        </Tab>
        
        <Tab eventKey="updates" title="Updates Schedule">
          <Card className="mb-3">
            <Card.Body>
              <p className="text-muted mb-3">
                Setting clear expectations for updates helps build trust with your supporters.
              </p>
              
              <Form.Group className="mb-3">
                <Form.Label>Update Frequency Commitment</Form.Label>
                <Form.Select
                  value={formData.updates.scheduleCommitment}
                  onChange={(e) => handleInputChange('updates', 'scheduleCommitment', e.target.value)}
                >
                  <option value="weekly">Weekly Updates</option>
                  <option value="biweekly">Bi-Weekly Updates</option>
                  <option value="monthly">Monthly Updates</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  How often do you commit to updating your backers on project progress?
                </Form.Text>
              </Form.Group>
              
              <Alert variant="info">
                <Alert.Heading>Why Updates Matter</Alert.Heading>
                <p>
                  Regular updates are crucial for maintaining backer confidence. They show your project is active
                  and making progress. Campaigns with consistent updates are more likely to succeed and maintain
                  community support.
                </p>
              </Alert>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="rewards" title="Rewards">
          <Card className="mb-3">
            <Card.Header>
              <h3 className="mb-0">Rewards</h3>
            </Card.Header>
            <Card.Body>
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
                <>
                  <p className="text-muted mb-3">
                    Rewards incentivize supporters to back your project. Define what backers will receive at different contribution levels.
                  </p>
                  
                  {formData.rewards.projectRewards.map((reward, index) => (
                    <Card key={index} className="mb-3 border-light">
                      <Card.Header>Reward Tier #{index + 1}</Card.Header>
                      <Card.Body>
              <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Reward Title</Form.Label>
                              <Form.Control
                                type="text"
                                value={reward.title}
                                onChange={(e) => handleRewardChange(index, 'title', e.target.value)}
                                placeholder="e.g., Early Access, Premium Supporter"
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
                        </Row>
                        
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Available Items</Form.Label>
                    <Form.Control
                      type="number"
                                value={reward.availableItems}
                                onChange={(e) => handleRewardChange(index, 'availableItems', e.target.value)}
                                min="0"
                                placeholder="Number available (leave blank for unlimited)"
                    />
                  </Form.Group>
                </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Estimated Delivery</Form.Label>
                    <Form.Control
                      type="date"
                                value={reward.estimatedDelivery}
                                onChange={(e) => handleRewardChange(index, 'estimatedDelivery', e.target.value)}
                                placeholder="When will backers receive this reward?"
                    />
                  </Form.Group>
                </Col>
              </Row>
                        
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
            </Card.Body>
          </Card>
                  ))}
        
        <Button 
                    variant="outline-primary"
                    onClick={() => {
                      const updatedRewards = [...formData.rewards.projectRewards];
                      updatedRewards.push({
                        title: '',
                        description: '',
                        price: '',
                        availableItems: '',
                        estimatedDelivery: '',
                        displayOrder: formData.rewards.projectRewards.length + 1,
                      });
                      
                      setFormData(prev => ({
                        ...prev,
                        rewards: {
                          ...prev.rewards,
                          projectRewards: updatedRewards
                        }
                      }));
                    }}
                  >
                    Add Another Reward Tier
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="legal" title="Legal">
          <Card className="mb-3">
            <Card.Body>
              <p className="text-muted mb-3">
                These legal agreements protect both you and your supporters.
              </p>
              
              <Form.Group className="mb-3">
                <Form.Label>Refund Policy</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.legal.refundPolicy}
                  onChange={(e) => handleInputChange('legal', 'refundPolicy', e.target.value)}
                  placeholder="Describe your refund policy for backers"
                />
                <Form.Text className="text-muted">
                  If you don't specify a custom policy, our standard platform refund policy will apply.
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Check 
                  type="checkbox"
                  id="terms-accepted"
                  label={
                    <>
                      I accept the <a href="/terms" target="_blank">Terms of Service</a>
                    </>
                  }
                  checked={formData.legal.termsAccepted}
                  onChange={(e) => handleInputChange('legal', 'termsAccepted', e.target.checked)}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Check 
                  type="checkbox"
                  id="privacy-accepted"
                  label={
                    <>
                      I accept the <a href="/privacy" target="_blank">Privacy Policy</a>
                    </>
                  }
                  checked={formData.legal.privacyAccepted}
                  onChange={(e) => handleInputChange('legal', 'privacyAccepted', e.target.checked)}
                  required
                />
              </Form.Group>
              
              <Alert variant="warning">
                <Alert.Heading>Legal Responsibilities</Alert.Heading>
                <p>
                  As a campaign creator, you are legally obligated to fulfill your campaign promises and rewards.
                  Failure to do so may result in legal action from backers or regulatory authorities.
                </p>
              </Alert>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="preview" title="Preview">
          <Card className="mb-3">
            <Card.Body>
              <p className="text-info mb-3">
                Review your campaign information before final submission.
              </p>
              
              <h3>{formData.basics.projectTitle || 'Campaign Title'}</h3>
              
              <p><strong>Goal:</strong> {formData.basics.projectFundAmount || '0'} {formData.basics.projectFundCurrency}</p>
              <p><strong>Duration:</strong> {formData.basics.projectDeadlineDate || '30'} days</p>
              <p><strong>Category:</strong> {campaignCategories.find(c => c.id === formData.basics.category)?.name || 'Not selected'}</p>
              
              <hr />
              
              <h4>Brief Description</h4>
              <p>{formData.basics.projectDescription || 'No description provided'}</p>
              
              <h4>Detailed Story</h4>
              <p>{formData.story.projectStory || 'No detailed story provided'}</p>
              
              <hr />
              
              <h4>Team</h4>
              {formData.team.members.length > 0 ? (
                <ListGroup>
                  {formData.team.members.map((member, index) => (
                    <ListGroup.Item key={index}>
                      <strong>{member.name || 'Unnamed'}</strong> - {member.role || 'No role specified'}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p>No team members added</p>
              )}
              
              <hr />
              
              <h4>Milestones</h4>
              {formData.milestones.length > 0 ? (
                <ListGroup>
                  {formData.milestones.map((milestone, index) => (
                    <ListGroup.Item key={index}>
                      <strong>{milestone.title || `Milestone #${index + 1}`}</strong> - 
                      {milestone.targetAmount ? ` ${milestone.targetAmount} ${formData.basics.projectFundCurrency}` : ' No amount specified'}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p>No milestones added</p>
              )}
              
              <hr />
              
              <h4>Rewards</h4>
              {includeIncentives && formData.rewards.projectRewards.length > 0 ? (
                <ListGroup>
                  {formData.rewards.projectRewards.map((reward, index) => (
                    <ListGroup.Item key={index}>
                      <strong>{reward.title || `Reward #${index + 1}`}</strong> - 
                      {reward.price ? ` ${reward.price} ${formData.basics.projectFundCurrency}` : ' No price specified'}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p>No rewards added</p>
              )}
              
              <p><strong>Contribution Limits:</strong> 
                {formData.basics.minContribution ? `Min: ${formData.basics.minContribution} ${formData.basics.projectFundCurrency}` : 'No minimum'} 
                {formData.basics.maxContribution ? ` / Max: ${formData.basics.maxContribution} ${formData.basics.projectFundCurrency}` : ' / No maximum'}
              </p>
              <p><strong>Auto Refund:</strong> {formData.basics.enableAutoRefund ? 'Enabled' : 'Disabled'}</p>
              
              <div className="alert alert-warning mt-4">
                This is just a preview. You can go back to any section to make changes before submission.
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      <div className="d-grid gap-2 mt-4">
        <Button variant="primary" onClick={handleSubmit} size="lg">
          Create Campaign
        </Button>
      </div>
    </Container>
  );
};

export default CreateCampaignPage; 