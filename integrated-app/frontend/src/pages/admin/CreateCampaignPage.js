import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner, Tabs, Tab, ListGroup, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ProviderContext } from '../../web3/ProviderContext';
import TokenSelector from '../../components/TokenSelector';
import FormProgressBar from '../../components/FormProgressBar';
import FormField from '../../components/FormField';
import ContractOwnerSelector from '../../components/ContractOwnerSelector';
import SubmitConfirmationModal from '../../components/SubmitConfirmationModal';
import LivePreview from '../../components/LivePreview';
import useFormPersistence from '../../hooks/useFormPersistence';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUndo, faInfoCircle, faExclamationTriangle, faCheckCircle, faCheck, faExchangeAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import Web3 from 'web3';
import './CreateCampaignPage.css';
import CampaignTemplates from '../../components/CampaignTemplates';
import { FaPlus } from 'react-icons/fa';
import { FaEthereum } from 'react-icons/fa';
import { SiBinance } from 'react-icons/si';
import { BsCoin } from 'react-icons/bs';

const EXPLORER_URLS = {
  Ethereum: 'https://etherscan.io',
  BSC: 'https://bscscan.com',
  Base: 'https://basescan.org'
};

const CreateCampaignPage = () => {
  const navigate = useNavigate();
  const { provider, isConnected, account, chainId, switchChain } = useContext(ProviderContext);
  
  // Form steps configuration
  const formSteps = [
    { key: 'basics', label: 'Basics' },
    { key: 'story', label: 'Story' },
    { key: 'team', label: 'Team' },
    { key: 'social', label: 'Social' },
    { key: 'milestones', label: 'Milestones' },
    { key: 'updates', label: 'Updates' },
    { key: 'legal', label: 'Legal' },
    { key: 'rewards', label: 'Rewards' },
    { key: 'preview', label: 'Preview' },
  ];

  // App state
  const [activeTab, setActiveTab] = useState('basics');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [gasEstimate, setGasEstimate] = useState(null);
  
  // Component state
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [includeIncentives, setIncludeIncentives] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState('');
  const [isWalletVerified, setIsWalletVerified] = useState(false);
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const [savedState, setSavedState] = useState(null);
  
  // Token validation state
  const [validatingToken, setValidatingToken] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [tokenError, setTokenError] = useState(null);
  
  // Add state variables for token price conversion
  const [tokenPriceUSD, setTokenPriceUSD] = useState(null);
  const [tokenEquivalent, setTokenEquivalent] = useState(null);
  const [loadingTokenPrice, setLoadingTokenPrice] = useState(false);
  
  // Use form persistence hook for auto-saving
  const [formData, setFormData, persistForm, clearPersistedForm] = useFormPersistence(
    'lakkhi_campaign_form',
    {
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
    },
    false // Don't save automatically on every change, we'll manage it manually
  );

  // Add tag input state
  const [tagInput, setTagInput] = useState('');
  
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
    // Clear previous errors
    setFieldErrors({});
    
    // Track field errors
    const errors = {};
    let isValid = true;
    
    // Validate basics tab
    if (!formData.basics.projectTitle) {
      errors['basics.projectTitle'] = true;
      isValid = false;
    }
    
    if (!formData.basics.projectDescription) {
      errors['basics.projectDescription'] = true;
      isValid = false;
    }
    
    if (!formData.basics.tokenAddress) {
      errors['basics.tokenAddress'] = true;
      isValid = false;
    }
    
    if (!formData.basics.projectFundAmount) {
      errors['basics.projectFundAmount'] = true;
      isValid = false;
    }
    
    if (!formData.basics.category) {
      errors['basics.category'] = true;
      isValid = false;
    }
    
    // Validate milestones
    let totalMilestoneAmount = 0;
    const campaignEndDate = new Date();
    campaignEndDate.setDate(campaignEndDate.getDate() + parseInt(formData.basics.projectDeadlineDate || 30));
    
    formData.milestones.forEach((milestone, index) => {
      if (!milestone.title) {
        errors[`milestones[${index}].title`] = true;
        isValid = false;
      }
      
      if (!milestone.targetAmount) {
        errors[`milestones[${index}].targetAmount`] = true;
        isValid = false;
      } else {
        totalMilestoneAmount += parseFloat(milestone.targetAmount);
      }
      
      // Validate milestone dates are after campaign end date
      if (milestone.dueDate) {
        const milestoneDate = new Date(milestone.dueDate);
        if (milestoneDate <= campaignEndDate) {
          errors[`milestones[${index}].dueDate`] = true;
          isValid = false;
          setError(`Milestone dates must be after the campaign end date (${campaignEndDate.toLocaleDateString()})`);
        }
      }
    });
    
    // Ensure milestone amounts add up to the total fund amount
    if (Math.abs(totalMilestoneAmount - parseFloat(formData.basics.projectFundAmount)) > 0.000001) {
      setError(`Milestone amounts must add up to the total fund amount of ${formData.basics.projectFundAmount}`);
      isValid = false;
    }
    
    // Validate token
    if (!formData.basics.tokenAddress || !tokenInfo) {
      setError('Please provide and validate a token address');
      isValid = false;
      invalidTabKey = invalidTabKey || 'basics';
    }
    
    // Validate contract owner address
    const contractOwnerAddress = formData.basics.contractOwnerAddress || connectedWallet;
    if (!contractOwnerAddress || !Web3.utils.isAddress(contractOwnerAddress)) {
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
  
  // Replace the blockchainChains array definition with this enhanced version
  const blockchainChains = [
    { 
      id: 'Ethereum', 
      name: 'Ethereum', 
      icon: <FaEthereum />,
      chainId: '0x1',
      description: 'Ethereum Mainnet' 
    },
    { 
      id: 'BSC', 
      name: 'BSC', 
      icon: <SiBinance />,
      chainId: '0x38',
      description: 'Binance Smart Chain' 
    },
    { 
      id: 'Base', 
      name: 'Base', 
      icon: <BsCoin />,
      chainId: '0x8453',
      description: 'Base Network' 
    }
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
          
          // Also set the contract owner address to the connected wallet by default if not already set
          if (!formData.basics.contractOwnerAddress) {
            handleInputChange('basics', 'contractOwnerAddress', account);
          }
          
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
  }, [provider, isConnected, account, formData.basics.contractOwnerAddress]);
  
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
    if (e) e.preventDefault();
    
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
      setFieldErrors(prev => ({...prev, tokenAddress: 'Token address is required'}));
      setActiveTab('basics');
      return;
    }
    
    // Verify token is validated
    if (!tokenInfo) {
      setError('Please validate your token address before submitting. Click the Validate button next to the token address field.');
      setFieldErrors(prev => ({...prev, tokenAddress: 'Token must be validated'}));
      setActiveTab('basics');
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
    
    // Show confirmation modal instead of immediately submitting
    setShowConfirmModal(true);
  };
  
  // Function to actually submit the form after confirmation
  const submitConfirmed = async () => {
    setSubmitting(true);
    setError('Deploying smart contract. Please confirm the transaction in MetaMask when prompted...');
    
    try {
      // Step 1: Deploy the smart contract through MetaMask
      const contractData = await deploySmartContract();
      if (!contractData) {
        setError('Smart contract deployment failed. Please try again.');
        setSubmitting(false);
        setShowConfirmModal(false);
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
        } else if (key === 'projectImageFile' && formDataWithWallet.basics[key]) {
          formDataToSend.append(`basics.${key}`, formDataWithWallet.basics[key]);
        } else {
        formDataToSend.append(`basics.${key}`, formDataWithWallet.basics[key]);
        }
      });
      
      // Add contract_owner field explicitly
      formDataToSend.append('contract_owner', formDataWithWallet.basics.contractOwnerAddress || connectedWallet);
      
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
      
      // Set status to active - no more admin approval needed
      formDataToSend.append('status', 'active');
      
      // Add contract data
      formDataToSend.append('contract_data', JSON.stringify(contractData));
      
      // Step 3: Send data to the backend
      console.log('Sending campaign data to backend with contract info:', contractData);
      
      try {
      // Make API call to create campaign
      const createResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/campaigns/`, formDataToSend, {
          headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Handle successful response
      console.log('Campaign created:', createResponse.data);
        
      // Clear form from localStorage
      clearPersistedForm();
      
      setSubmitSuccess(true);
      setShowConfirmModal(false);
      
      setError('Your campaign has been created successfully and is now live!');
        
        setTimeout(() => {
        // Navigate to the new campaign page
        navigate(`/campaigns/${createResponse.data.campaign_id}`);
      }, 2000);
      } catch (apiError) {
        console.error('Error creating campaign record:', apiError);
        // The contract was deployed but the backend record creation failed
        setError(`Smart contract was deployed successfully, but there was an error creating the campaign record: 
          ${apiError.response?.data?.message || apiError.message || 'Unknown error'}. 
          Please contact support with your transaction hash: ${contractData.transactionHash}`);
        setSubmitting(false);
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error('Error in contract deployment:', error);
      setError(`Error creating campaign: ${error.message || 'Unknown error'}`);
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };
  
  const deploySmartContract = async () => {
    try {
      if (!account) {
        setError('Wallet not connected. Please connect your wallet first.');
        return null;
      }
      
      // Get the blockchain from the form data
      const selectedBlockchain = formData.basics.blockchainChain || 'BSC';
      
      // Get the contract owner address from form data or use connected wallet
      const contractOwner = formData.basics.contractOwnerAddress || account;
      
      // Inform user about the transaction
      setError(`Please confirm the transaction in your wallet to deploy the campaign on ${selectedBlockchain}...`);
      
      // Ensure we have access to window.ethereum (MetaMask)
      if (!window.ethereum) {
        setError('MetaMask not detected! Please install MetaMask and refresh the page.');
        return null;
      }
      
      // Initialize Web3 directly with window.ethereum
      const web3 = new Web3(window.ethereum);
      
      // Get the bytecode and ABI from backend API
      const contractConfigResponse = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/contract-config/`,
        { 
          params: { blockchain: selectedBlockchain },
          headers: { 'Accept': 'application/json' }
        }
      );
      
      if (!contractConfigResponse.data.success) {
        throw new Error('Failed to get contract configuration from backend');
      }
      
      const { abi: stakingABI, bytecode } = contractConfigResponse.data;
      
      if (!bytecode || !bytecode.startsWith('0x')) {
        throw new Error('Invalid bytecode received from backend');
      }
      
      console.log('Received contract configuration from backend');
      
      // Create contract instance for deployment
      const stakingContract = new web3.eth.Contract(stakingABI);
      
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
      
      // Get the deployment transaction data
      const deploymentData = stakingContract.deploy({
        data: bytecode,
        arguments: [
            formData.basics.projectTitle,
            formData.basics.tokenAddress,
          contractOwner,
            fundAmountInWei,
            minContributionInWei,
            maxContributionInWei,
            durationInDays,
            formattedMilestones,
            formData.basics.enableAutoRefund
        ]
      }).encodeABI();
      
      // Send transaction to deploy
      const deployTxHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          gas: web3.utils.toHex(5000000), // Adjust gas as needed
          data: deploymentData
        }]
      });
      
      console.log('Deployment transaction submitted:', deployTxHash);
      setError('Transaction submitted! Waiting for confirmation...');
      
      // Wait for receipt
      const waitForReceipt = async (hash, attempts = 30) => {
        if (attempts <= 0) throw new Error('Transaction receipt not found after maximum attempts');
        
        const receipt = await web3.eth.getTransactionReceipt(hash);
        if (receipt) return receipt;
        
        // Wait 2 seconds before trying again
        await new Promise(resolve => setTimeout(resolve, 2000));
        return waitForReceipt(hash, attempts - 1);
      };
      
      const receipt = await waitForReceipt(deployTxHash);
      console.log('Deployment confirmed! Receipt:', receipt);
      
      // Get the contract address from the receipt
      const contractAddress = receipt.contractAddress;
      if (!contractAddress) {
        throw new Error('Contract address not found in transaction receipt');
      }
      
      // Get the explorer URL for the selected blockchain
      let explorerUrl;
      switch (selectedBlockchain) {
        case 'Ethereum':
          explorerUrl = 'https://etherscan.io';
          break;
        case 'BSC':
          explorerUrl = 'https://bscscan.com';
          break;
        case 'Base':
          explorerUrl = 'https://basescan.org';
          break;
        default:
          explorerUrl = 'https://bscscan.com';
      }
      
      // Return contract data
      return {
        contract_address: contractAddress,
        transaction_hash: deployTxHash,
        block_number: receipt.blockNumber,
        chain: selectedBlockchain,
        contract_url: `${explorerUrl}/address/${contractAddress}`
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
  
  // Manual save function with notification
  const handleManualSave = () => {
    persistForm();
    setSavedState('Saved');
    
    // Clear the saved notification after 3 seconds
    setTimeout(() => {
      setSavedState(null);
    }, 3000);
  };
  
  // Reset form to default state
  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
      clearPersistedForm();
      window.location.reload(); // Reload the page to reset all state
    }
  };
  
  // Enhanced function to handle tab change with validation
  const handleTabChange = (key) => {
    // If changing away from a tab, validate it first
    if (activeTab !== key) {
      validateSection(activeTab);
      
      // Save form state 
      persistForm();
    }
    
    setActiveTab(key);
  };
  
  // Update the validation functionality
  const validateField = (section, field, value) => {
    const validators = {
      basics: {
        projectTitle: (val) => val && val.trim().length > 0,
        projectDescription: (val) => val && val.trim().length > 10,
        projectFundAmount: (val) => val && !isNaN(val) && parseFloat(val) > 0,
        projectDeadlineDate: (val) => val && !isNaN(val) && parseInt(val) > 0,
        contractOwnerAddress: (val) => val && Web3.utils.isAddress(val),
        tokenAddress: (val) => val && tokenInfo, // Must be validated through the TokenSelector
        category: (val) => val && val.trim().length > 0,
      },
      story: {
        projectStory: (val) => val && val.trim().length >= 100,
      },
      legal: {
        termsAccepted: (val) => val === true,
        privacyAccepted: (val) => val === true,
      },
      milestones: {
        // Milestones are validated separately
      }
    };
    
    if (validators[section] && validators[section][field]) {
      const isValid = validators[section][field](value);
      
      if (!isValid) {
        setFieldErrors(prev => ({
          ...prev,
          [`${section}.${field}`]: `Invalid ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        }));
        return false;
      } else {
        // Clear the error if field is now valid
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`${section}.${field}`];
          return newErrors;
        });
        return true;
      }
    }
    
    return true; // If no validator exists, consider it valid
  };
  
  // Validate a form section
  const validateSection = (section) => {
    let isValid = true;
    
    if (section === 'basics') {
      const requiredFields = ['projectTitle', 'projectDescription', 'projectFundAmount', 'projectDeadlineDate', 'contractOwnerAddress', 'tokenAddress', 'category'];
      
      for (const field of requiredFields) {
        const value = formData.basics[field];
        if (!validateField('basics', field, value)) {
          isValid = false;
        }
      }
    } else if (section === 'story') {
      if (!validateField('story', 'projectStory', formData.story.projectStory)) {
        isValid = false;
      }
    } else if (section === 'milestones') {
      // Check if milestones sum up to the funding goal
      const totalMilestoneAmount = formData.milestones.reduce(
        (sum, m) => sum + parseFloat(m.targetAmount || 0),
        0
      );
      
      if (Math.abs(totalMilestoneAmount - parseFloat(formData.basics.projectFundAmount)) > 0.01) {
        setError(`Total milestone amounts (${totalMilestoneAmount}) must equal the fund amount (${formData.basics.projectFundAmount})`);
        isValid = false;
      }
      
      // Validate each milestone
      for (let i = 0; i < formData.milestones.length; i++) {
        const milestone = formData.milestones[i];
        if (!milestone.title || !milestone.description || !milestone.targetAmount) {
          setFieldErrors(prev => ({
            ...prev,
            [`milestones.${i}`]: 'Incomplete milestone'
          }));
          isValid = false;
        }
      }
    } else if (section === 'legal') {
      if (!validateField('legal', 'termsAccepted', formData.legal.termsAccepted) ||
          !validateField('legal', 'privacyAccepted', formData.legal.privacyAccepted)) {
        isValid = false;
      }
    }
    
    // If this section is valid, mark it as completed
    if (isValid && !completedSteps.includes(section)) {
      setCompletedSteps(prev => [...prev, section]);
    } else if (!isValid && completedSteps.includes(section)) {
      // If not valid but was previously marked as completed, remove it
      setCompletedSteps(prev => prev.filter(step => step !== section));
    }
    
    return isValid;
  };
  
  // Prevent form submission while still processing
  if (submitting) {
    return (
      <Container className="py-5 text-center">
        <Card>
          <Card.Body className="py-5">
            <Spinner animation="border" variant="primary" className="mb-4" />
            <h3>Creating your campaign</h3>
            <p className="text-muted">Please wait while we deploy your campaign contract and create your campaign...</p>
            {error && <Alert variant="info">{error}</Alert>}
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  // Show success state before redirecting
  if (submitSuccess) {
    return (
      <Container className="py-5">
        <Alert variant="success">
          <Alert.Heading>Campaign Created Successfully!</Alert.Heading>
          <p>Your campaign has been created. You will be redirected to the campaign page shortly.</p>
        </Alert>
      </Container>
    );
  }
  
  // Create more Web3-specific template content for existing tokens
  const tokenUtilityContent = {
    conservation: 'Our token already provides governance for conservation decisions, and this funding will expand our impact to new ecological initiatives.',
    education: 'Our educational token has built a solid content foundation, and this funding will help us expand our course offerings and improve platform features.',
    metaverse: 'Our metaverse token powers our growing virtual world, and this funding will support expanding our land area and enhancing user experiences.',
    cto: `Our community has successfully taken over this project after the original team departed, and this funding will support our roadmap implementation.`,
    ai: 'Our AI token currently powers our computation network, and this funding will allow us to upgrade our infrastructure and develop new AI models.',
    rwa: 'Our asset-backed token has successfully tokenized several properties, and this funding will expand our portfolio of real-world assets.',
    gamefi: 'Our game token powers an active player economy, and this funding will support new gameplay features and tournaments.',
    defi: 'Our DeFi protocol has demonstrated stable yields, and this funding will add new financial instruments and cross-chain capabilities.',
    custom: ''
  };
  
  // Update the budget allocation text to reflect existing projects
  const tokenDistributionContent = {
    conservation: '50% for new environmental projects, 20% for technology upgrades, 20% for operations, 10% for token holder rewards',
    education: '60% for new course development, 20% for platform scaling, 15% for creator rewards, 5% for community treasury',
    metaverse: '40% for world expansion, 25% for performance upgrades, 20% for user experience improvements, 15% for new partnerships',
    cto: '35% for development acceleration, 25% for marketing, 20% for partner integrations, 20% for community rewards',
    ai: '50% for computing resources upgrades, 30% for research & development, 15% for operations, 5% for community incentives',
    rwa: '75% for new asset acquisition, 10% for legal/compliance updates, 10% for operations, 5% for token holder benefits',
    gamefi: '35% for new game features, 25% for economy balancing, 20% for marketing, 20% for tournaments & rewards',
    defi: '40% for protocol expansion, 30% for liquidity incentives, 20% for security audits, 10% for DAO treasury',
    custom: ''
  };
  
  // Add collapsed state for templates
  const [templateSectionCollapsed, setTemplateSectionCollapsed] = useState(false);
  const [selectedTemplateData, setSelectedTemplateData] = useState(null);
  
  // Enhance the function to handle template selection
  const handleTemplateSelection = (template) => {
    // Allow template selection even without wallet connection
    console.log("Template selected:", template.id);
    
    // Store selected template and collapse section
    setSelectedTemplateData(template);
    setTemplateSectionCollapsed(true);
  
    // Create a new structured object that matches our form data structure
    const templateFormData = {
      basics: {
        projectTitle: template.id === 'custom' ? '' : `${template.title} Expansion Campaign`,
        projectDescription: template.description,
        projectFundAmount: template.goal || formData.basics.projectFundAmount,
        projectDeadlineDate: template.duration.toString(),
        category: template.categories[0] || '',
        tags: template.categories || []
      },
      story: {
        projectStory: template.detailedDescription || '',
        projectGoals: template.id === 'custom' ? '' : 
          `Our ${template.title.toLowerCase()} is already live and actively trading. ${tokenUtilityContent[template.id] || ''} This funding will help us implement features that were beyond our initial scope and accelerate our roadmap.`,
        projectRisks: template.id === 'custom' ? '' : 
          'Our team has already demonstrated capability by launching and maintaining our token in the market. The main risks include market volatility and technological challenges in implementing new features, but our proven track record shows we can overcome these obstacles.',
        projectTimeline: template.id === 'custom' ? '' : 
          `We will run this fundraising campaign for ${template.duration} days. Implementation of the new features will begin immediately after funding is secured, with regular updates to our community throughout the development process.`,
        projectBudget: template.id === 'custom' ? '' : 
          `Our fundraising goal of $${template.goal} will be allocated as follows: ${tokenDistributionContent[template.id] || ''}`
      },
      milestones: [
        {
          title: template.id === 'custom' ? 'Initial Phase' : `${template.title} - Phase 1: Enhancement`,
          description: template.id === 'custom' ? 'Initial development phase' : 
            getPhaseOneDescription(template.id),
          targetAmount: template.id === 'custom' ? '' : (parseFloat(template.goal) * 0.3).toString(),
          dueDate: ''
        },
        {
          title: template.id === 'custom' ? '' : `${template.title} - Phase 2: Implementation`,
          description: template.id === 'custom' ? '' : 
            getPhaseTwoDescription(template.id),
          targetAmount: template.id === 'custom' ? '' : (parseFloat(template.goal) * 0.4).toString(),
          dueDate: ''
        },
        {
          title: template.id === 'custom' ? '' : `${template.title} - Phase 3: Scaling`,
          description: template.id === 'custom' ? '' : 
            getPhaseThreeDescription(template.id),
          targetAmount: template.id === 'custom' ? '' : (parseFloat(template.goal) * 0.3).toString(),
          dueDate: ''
        }
      ]
    };
    
    // Helper functions for milestone descriptions for existing projects
    function getPhaseOneDescription(templateId) {
      switch(templateId) {
        case 'conservation': 
          return 'Strengthen our existing conservation partnerships and begin implementing new environmental project selection tools.';
        case 'education':
          return 'Expand our content creation tools and begin development of advanced learning modules.';
        case 'metaverse':
          return 'Optimize existing infrastructure and begin development of new virtual land expansion.';
        case 'cto':
          return 'Complete comprehensive code audit and implement core improvements identified by the community.';
        case 'ai':
          return 'Upgrade existing computing infrastructure and begin development of new AI model capabilities.';
        case 'rwa':
          return 'Complete legal framework updates and begin due diligence on new asset acquisitions.';
        case 'gamefi':
          return 'Implement economic balancing improvements and begin development of new game features.';
        case 'defi':
          return 'Complete additional security audits and begin development of new financial products.';
        default:
          return 'Begin enhancements to our existing product and infrastructure.';
      }
    }
    
    function getPhaseTwoDescription(templateId) {
      switch(templateId) {
        case 'conservation': 
          return 'Launch improved impact tracking system and implement new token holder benefits for active conservation supporters.';
        case 'education':
          return 'Release enhanced token reward system for content creators and deploy initial phase of platform improvements.';
        case 'metaverse':
          return 'Launch new virtual space expansion and implement enhanced user experience features.';
        case 'cto':
          return 'Deploy updated token utility features and implement new governance mechanisms requested by the community.';
        case 'ai':
          return 'Launch beta access to new AI models and implement improved token utility for computation access.';
        case 'rwa':
          return 'Acquire new assets for the portfolio and implement enhanced token holder benefits.';
        case 'gamefi':
          return 'Release new gameplay features and implement enhanced tournament system with token rewards.';
        case 'defi':
          return 'Deploy new financial products and implement enhanced yield optimization strategies.';
        default:
          return 'Implement the core new features and enhancements to our existing product.';
      }
    }
    
    function getPhaseThreeDescription(templateId) {
      switch(templateId) {
        case 'conservation': 
          return 'Scale our conservation impact with new partnership integrations and launch enhanced token holder governance features.';
        case 'education':
          return 'Launch cross-platform integration and implement enhanced credential verification system.';
        case 'metaverse':
          return 'Release new creator tools and implement cross-platform integration with other virtual worlds.';
        case 'cto':
          return 'Launch comprehensive marketing campaign for the revitalized project and implement long-term sustainability plan.';
        case 'ai':
          return 'Release full access to new AI models and implement enhanced revenue sharing for token holders.';
        case 'rwa':
          return 'Launch enhanced portfolio management features and implement additional asset classes.';
        case 'gamefi':
          return 'Launch integration with other blockchain games and implement enhanced token utility across the ecosystem.';
        case 'defi':
          return 'Implement cross-chain capabilities and launch institutional-grade features for larger participants.';
        default:
          return 'Scale our solution with additional features and optimizations based on user feedback.';
      }
    }

    // Merge template data with existing form data
    setFormData(prevData => {
      // Create a deep copy of the current form data
      const newData = JSON.parse(JSON.stringify(prevData));
      
      // Update basics
      if (templateFormData.basics) {
        Object.keys(templateFormData.basics).forEach(field => {
          // Don't overwrite token address, blockchain, contract owner
          if (!['tokenAddress', 'contractOwnerAddress', 'blockchainChain', 'walletAddress'].includes(field)) {
            newData.basics[field] = templateFormData.basics[field];
          }
        });
      }
      
      // Update story
      if (templateFormData.story) {
        Object.keys(templateFormData.story).forEach(field => {
          newData.story[field] = templateFormData.story[field];
        });
      }
      
      // Update milestones if they exist in the template
      if (templateFormData.milestones && templateFormData.milestones.length > 0) {
        // Only update for non-custom templates
        if (template.id !== 'custom') {
          newData.milestones = templateFormData.milestones;
        }
      }
      
      return newData;
    });
    
    // Immediately save to localStorage to persist the template selection
    persistForm();
    
    // Show success message
    setError(`${template.title} template applied! Connect your wallet to continue creating the campaign.`);
    
    // Clear the error message after 5 seconds
    setTimeout(() => {
      setError(null);
    }, 5000);
  };
  
  // Function to reset template selection
  const handleChangeTemplate = () => {
    setTemplateSectionCollapsed(false);
  }
  
  // Milestone tab content
  const renderMilestonesTab = () => {
  return (
      <div className="tab-content">
        <h3>Project Milestones</h3>
        <p className="text-muted mb-4">
          Define the key milestones for your project. These milestones will determine when funds are released to you.
          <br />
          <strong>Note: Milestone dates must be after the campaign end date to ensure proper fund release timing.</strong>
        </p>
        
        {formData.milestones.map((milestone, index) => (
          <Card className="mb-4 milestone-card" key={index}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Milestone {index + 1}</h5>
                {formData.milestones.length > 1 && (
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => removeMilestone(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>Milestone Title</Form.Label>
                <Form.Control
                  type="text"
                  value={milestone.title}
                  onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                  isInvalid={fieldErrors[`milestones[${index}].title`]}
                />
                {fieldErrors[`milestones[${index}].title`] && (
                  <Form.Control.Feedback type="invalid">
                    Milestone title is required
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={milestone.description}
                  onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Target Amount ({tokenInfo?.symbol || 'tokens'})</Form.Label>
                    <Form.Control
                      type="number"
                      value={milestone.targetAmount}
                      onChange={(e) => handleMilestoneChange(index, 'targetAmount', e.target.value)}
                      isInvalid={fieldErrors[`milestones[${index}].targetAmount`]}
                    />
                    {fieldErrors[`milestones[${index}].targetAmount`] && (
                      <Form.Control.Feedback type="invalid">
                        Target amount is required
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Due Date (Release Time)</Form.Label>
                    <Form.Control
                      type="date"
                      value={milestone.dueDate}
                      onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)}
                      min={formData.basics.projectDeadlineDate ? new Date(new Date().setDate(new Date().getDate() + parseInt(formData.basics.projectDeadlineDate))).toISOString().split('T')[0] : ''}
                      isInvalid={fieldErrors[`milestones[${index}].dueDate`]}
                    />
                    {fieldErrors[`milestones[${index}].dueDate`] && (
                      <Form.Control.Feedback type="invalid">
                        Due date must be after campaign end date
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
        
        <Button 
          variant="outline-primary" 
          onClick={addMilestone}
          className="mb-4"
        >
          <FaPlus className="me-2" />
          Add Another Milestone
        </Button>
        
        <div className="d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={() => setActiveTab('story')}>
            Back
          </Button>
          <Button variant="primary" onClick={() => setActiveTab('team')}>
            Next: Team
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Container className="py-5 campaign-creation-container">
      <h1 className="mb-3">Create New Campaign</h1>
      
      {/* Templates section - ALWAYS VISIBLE regardless of wallet connection status */}
      <Card className="mb-4 border-warning">
        <Card.Body>
          {templateSectionCollapsed && selectedTemplateData ? (
            <div className="selected-template">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <FontAwesomeIcon icon={faCheck} className="me-2 text-success" /> 
                  Template Selected: {selectedTemplateData.title}
                </h4>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={handleChangeTemplate}
                >
                  <FontAwesomeIcon icon={faExchangeAlt} className="me-1" /> Change Template
                </Button>
              </div>
              <p className="text-muted mt-2">
                {selectedTemplateData.description} Continue filling in the details below.
              </p>
            </div>
          ) : (
            <>
              <h3 className="mb-3">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-warning" /> Select a Template
              </h3>
              <p className="lead mb-4">
                Start with a pre-built template to make campaign creation easier. Templates provide suggested content, goals, and milestones.
              </p>
              <CampaignTemplates onSelectTemplate={handleTemplateSelection} />
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Status Alert Bar */}
      <div className="status-bar mb-4">
        {savedState && (
          <Alert variant="success" className="py-2 d-flex align-items-center justify-content-between fade-out">
            <span><FontAwesomeIcon icon={faCheckCircle} className="me-2" /> Campaign draft saved</span>
          </Alert>
        )}
        
        <div className="d-flex justify-content-end">
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="me-2"
            onClick={handleManualSave}
            title="Save draft"
          >
            <FontAwesomeIcon icon={faSave} className="me-1" /> Save Draft
          </Button>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={handleResetForm}
            title="Reset form"
          >
            <FontAwesomeIcon icon={faUndo} className="me-1" /> Reset
          </Button>
        </div>
      </div>
      
      <Card className="mb-4 border-info">
        <Card.Body>
          <Card.Title>Decentralized Campaign Ownership</Card.Title>
          <Card.Text>
            Lakkhi Fund uses a fully decentralized approach to campaign management. When you create a campaign:
            <ul className="mt-2">
              <li>Your wallet address becomes the campaign creator in our records</li>
              <li>A real smart contract is deployed directly on-chain</li>
              <li>You can designate a different wallet address as the "Contract Owner" who will receive the funds</li>
              <li>Only the contract owner wallet can withdraw or manage campaign funds</li>
              <li>Ownership cannot be transferred later, so ensure you have access to the contract owner wallet</li>
              <li>Your form data is auto-saved as you progress through each section</li>
              <li>You can preview your campaign before submitting to see exactly how it will appear</li>
              <li>All fields are validated in real-time to ensure your campaign is complete</li>
              <li>ENS names are supported for contract owner addresses on Ethereum mainnet</li>
              <li>Transaction gas fees are estimated before submission for better transparency</li>
            </ul>
          </Card.Text>
        </Card.Body>
      </Card>
      
      {renderWalletAlert()}
      
      {renderNetworkAlert()}
      
      {error && 
        <Alert variant="danger" className="d-flex align-items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" size="lg" />
          {error}
        </Alert>
      }
      
      {/* Progress Indicator */}
      <FormProgressBar 
        steps={formSteps} 
        activeStep={activeTab} 
        completedSteps={completedSteps}
        onStepClick={(stepKey) => {
          // Allow navigation to any section regardless of completion status
          setActiveTab(stepKey);
        }}
      />
      
      {/* Tabs Navigation - Only show Basics and Preview tabs */}
      <Tabs 
        activeKey={activeTab} 
        id="campaign-form-tabs" 
        className="mb-3"
        onSelect={handleTabChange}
      >
        {/* Only show Basics and Preview tab titles in the tab bar */}
        <Tab eventKey="basics" title="Basics">
        <Card className="mb-3">
          <Card.Body>
              <Form>
                <FormField
                  label="Campaign Title"
                type="text"
                value={formData.basics.projectTitle}
                onChange={(e) => handleInputChange('basics', 'projectTitle', e.target.value)}
                required
                placeholder="Enter a clear, descriptive title"
                  error={fieldErrors['basics.projectTitle']}
                  validate={(val) => val && val.trim().length > 0}
                  errorMessage="Campaign title is required"
              />
              
              <Form.Group className="mb-3">
                <Form.Label>Category*</Form.Label>
                <Form.Select
                  value={formData.basics.category}
                  onChange={(e) => handleInputChange('basics', 'category', e.target.value)}
                  required
                    className={fieldErrors['basics.category'] ? 'is-invalid' : ''}
                >
                    <option value="">Select a category</option>
                  {campaignCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
                  {fieldErrors['basics.category'] && (
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors['basics.category']}
                    </Form.Control.Feedback>
                  )}
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
            
                {/* Enhanced Contract Owner Selector */}
                <ContractOwnerSelector
                  value={formData.basics.contractOwnerAddress}
                  onChange={(value) => handleInputChange('basics', 'contractOwnerAddress', value)}
                  connectedWallet={connectedWallet}
                  onValidate={(isValid, address) => {
                    if (!isValid) {
                      setFieldErrors(prev => ({
                        ...prev,
                        'basics.contractOwnerAddress': 'Invalid wallet address'
                      }));
                    } else {
                      // Clear error if valid
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors['basics.contractOwnerAddress'];
                        return newErrors;
                      });
                    }
                  }}
                />
                
                {/* Enhanced Token Selector */}
            <TokenSelector 
              value={formData.basics.tokenAddress}
              onChange={(value) => handleInputChange('basics', 'tokenAddress', value)}
                onValidate={handleTokenValidation}
                onReset={() => {
                  setTokenInfo(null);
                  // Reset to BSC when token is cleared
                  handleInputChange('basics', 'blockchainChain', 'BSC');
                    
                    // Add field error
                    setFieldErrors(prev => ({
                      ...prev,
                      'basics.tokenAddress': 'Token is required'
                    }));
                }}
            />
            
            <Form.Group className="mb-3">
                  <Form.Label>Blockchain Network</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {blockchainChains.map(chain => (
                      <Card 
                        key={chain.id}
                        className={`blockchain-selector-card ${formData.basics.blockchainChain === chain.id ? 'selected' : ''}`}
                        style={{
                          cursor: 'default',
                          minWidth: '120px',
                          transition: 'all 0.2s',
                          border: formData.basics.blockchainChain === chain.id ? '2px solid #007bff' : '1px solid #dee2e6',
                          backgroundColor: formData.basics.blockchainChain === chain.id ? '#f0f7ff' : 'white',
                          opacity: formData.basics.blockchainChain === chain.id ? 1 : 0.5
                        }}
                      >
                        <Card.Body className="text-center p-3">
                          <div className="fs-3 mb-2">
                            {chain.icon}
                          </div>
                          <Card.Title className="mb-0">{chain.name}</Card.Title>
                          <small className="text-muted">{chain.description}</small>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                  <Form.Text className="text-muted mt-2">
                    The blockchain network will be automatically detected from your token address. Make sure your wallet is connected to the same network.
                </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Token Address*</Form.Label>
                <Form.Control 
                  type="text"
                value={formData.basics.tokenAddress}
                onChange={(e) => {
                  handleInputChange('basics', 'tokenAddress', e.target.value);
                  clearTokenInfo();
                }}
                onBlur={handleTokenBlur}
                required
                placeholder="0x... or ENS name"
                isInvalid={fieldErrors['basics.tokenAddress']}
                />
              <Form.Text className="text-muted mt-2">
                Enter the token address you want to use for this campaign.
                </Form.Text>
              {fieldErrors['basics.tokenAddress'] && (
                <Form.Control.Feedback type="invalid">
                  {fieldErrors['basics.tokenAddress']}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Important:</strong> The blockchain network will be automatically detected from your token address. Make sure your wallet is connected to the same network.
            </div>
            
            {/* Blockchain information will be shown automatically after token validation */}
            {tokenInfo && tokenInfo.blockchain && (
              <Alert variant="info" className="mb-3">
                <Row>
                  <Col xs={12}>
                    <strong>Blockchain Network:</strong> {tokenInfo.blockchain}
                    <div className="text-muted mt-1 small">
                      The blockchain is automatically detected from your token. Make sure your wallet is connected to the same network.
                    </div>
                  </Col>
                </Row>
              </Alert>
            )}
            
                <FormField
                  label="Brief Description"
                as="textarea"
                rows={3}
                value={formData.basics.projectDescription}
                onChange={(e) => handleInputChange('basics', 'projectDescription', e.target.value)}
                required
                placeholder="Briefly describe your project (max 300 characters)"
                maxLength={300}
                  validate={(val) => val && val.trim().length >= 10}
                  errorMessage="Description must be at least 10 characters"
                  error={fieldErrors['basics.projectDescription']}
              />
            
            <Row>
              <Col md={6}>
                    <FormField
                      label="Funding Goal"
                    type="number"
                    value={formData.basics.projectFundAmount}
                    onChange={(e) => handleInputChange('basics', 'projectFundAmount', e.target.value)}
                    required
                    min="1"
                    step="0.01"
                    placeholder="Enter amount"
                      validate={(val) => val && !isNaN(val) && parseFloat(val) > 0}
                      errorMessage="Funding goal must be greater than 0"
                      error={fieldErrors['basics.projectFundAmount']}
                      helpText={
                        loadingTokenPrice ? "Calculating token equivalent..." :
                        (tokenInfo && tokenEquivalent && tokenPriceUSD) ? 
                          `Approximately ${tokenEquivalent.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${tokenInfo.symbol} 
                          (1 ${tokenInfo.symbol} = $${parseFloat(tokenPriceUSD).toLocaleString(undefined, { maximumFractionDigits: 6 })} USD)` :
                        (tokenInfo && !tokenPriceUSD) ? 
                          "Unable to retrieve price information for this token." : 
                          undefined
                      }
                    />
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
                    <FormField
                      label="Campaign Duration (days)"
                      type="number"
                    value={formData.basics.projectDeadlineDate}
                    onChange={(e) => handleInputChange('basics', 'projectDeadlineDate', e.target.value)}
                    required
                      min="1"
                      max="365"
                      placeholder="Enter number of days"
                      validate={(val) => val && !isNaN(val) && parseInt(val) > 0}
                      errorMessage="Duration must be between 1 and 365 days"
                      error={fieldErrors['basics.projectDeadlineDate']}
                    />
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
                
                <div className="d-flex justify-content-between">
                  <div></div>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      if (validateSection('basics')) {
                        handleTabChange('story');
                      }
                    }}
                  >
                    Next: Detailed Story
                  </Button>
                </div>
              </Form>
          </Card.Body>
        </Card>
        </Tab>
        <Tab eventKey="preview" title="Preview">
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Final Preview</h4>
                <div>
                  <Button 
                    variant={showPreview ? 'primary' : 'outline-primary'}
                    onClick={() => setShowPreview(!showPreview)}
                    className="me-2"
                  >
                    {showPreview ? 'Hide Preview' : 'Show Live Preview'}
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={handleSubmit}
                    disabled={Object.keys(fieldErrors).length > 0 || !tokenInfo}
                  >
                    Create Campaign
                  </Button>
                </div>
              </div>
              
              {showPreview ? (
                <LivePreview formData={formData} tokenInfo={tokenInfo} />
              ) : (
                <>
                  <Alert variant="info" className="mb-4">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    Preview your campaign before creating it. Click "Show Live Preview" to see how your campaign will look to potential supporters.
                  </Alert>
                  
                  <h5>Campaign Summary</h5>
                  <ListGroup className="mb-4">
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Title</span>
                      <strong>{formData.basics.projectTitle || 'Not set'}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Funding Goal</span>
                      <strong>{formData.basics.projectFundAmount || '0'} {formData.basics.projectFundCurrency}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Blockchain</span>
                      <strong>{formData.basics.blockchainChain || 'Not set'}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Token</span>
                      <span>
                        {tokenInfo ? (
                          <>
                            <strong>{tokenInfo.symbol}</strong> ({tokenInfo.name})
                          </>
                        ) : 'Not validated'}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Duration</span>
                      <strong>{formData.basics.projectDeadlineDate || '0'} days</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Contract Owner</span>
                      <code>{formData.basics.contractOwnerAddress || connectedWallet}</code>
                    </ListGroup.Item>
                  </ListGroup>
                  
                  {Object.keys(fieldErrors).length > 0 && (
                    <Alert variant="danger">
                      <Alert.Heading>
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        There are errors in your form
                      </Alert.Heading>
                      <p>Please fix the following errors before creating your campaign:</p>
                      <ul>
                        {Object.entries(fieldErrors).map(([field, error]) => (
                          <li key={field}>{error}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}
                  
                  <div className="d-grid gap-2 col-md-6 mx-auto mt-4">
                    <Button 
                      variant="success" 
                      size="lg"
                      onClick={handleSubmit}
                      disabled={Object.keys(fieldErrors).length > 0 || !tokenInfo}
                    >
                      Create Campaign
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        {/* Hidden tabs - these will be accessed through the progress bar but not shown in the tab navigation */}
        <Tab eventKey="story" title={null} tabClassName="d-none">
          {/* Story tab content */}
          <Card className="mb-3">
            <Card.Body>
              <h4>Detailed Story</h4>
              <p className="text-muted">Tell potential supporters about your project in detail.</p>
              
              <Form>
                <FormField
                  label="Project Story"
                  as="textarea"
                  rows={8}
                  value={formData.story.projectStory}
                  onChange={(e) => handleInputChange('story', 'projectStory', e.target.value)}
                  required
                  placeholder="Provide a detailed description of your project. What inspired it? What will it achieve? Why is it important?"
                  validate={(val) => val && val.trim().length >= 100}
                  errorMessage="Story must be at least 100 characters"
                  error={fieldErrors['story.projectStory']}
                  helpText="This is the main content of your campaign page. Be detailed and thorough."
                />
                
                <FormField
                  label="Project Goals"
                  as="textarea"
                  rows={4}
                  value={formData.story.projectGoals}
                  onChange={(e) => handleInputChange('story', 'projectGoals', e.target.value)}
                  placeholder="What specific outcomes do you hope to achieve with this project?"
                />
                
                <FormField
                  label="Risks and Challenges"
                  as="textarea"
                  rows={4}
                  value={formData.story.projectRisks}
                  onChange={(e) => handleInputChange('story', 'projectRisks', e.target.value)}
                  placeholder="What obstacles might you face? How will you overcome them?"
                />
                
                <FormField
                  label="Project Timeline"
                  as="textarea"
                  rows={4}
                  value={formData.story.projectTimeline}
                  onChange={(e) => handleInputChange('story', 'projectTimeline', e.target.value)}
                  placeholder="What is your timeline for completing this project?"
                />
              
                <FormField
                  label="Budget Breakdown"
                  as="textarea"
                  rows={4}
                  value={formData.story.projectBudget}
                  onChange={(e) => handleInputChange('story', 'projectBudget', e.target.value)}
                  placeholder="How will the funds be allocated across different aspects of your project?"
                />
                
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => handleTabChange('basics')}
                  >
                    Back to Basics
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      if (validateSection('story')) {
                        handleTabChange('team');
                      }
                    }}
                  >
                    Next: Team
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="team" title={null} tabClassName="d-none">
          {/* Team tab content */}
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Team Members</h4>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={addTeamMember}
                >
                  Add Team Member
                </Button>
              </div>
              
              <Form>
              {formData.team.members.map((member, index) => (
                  <Card key={index} className="mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <h5>Team Member {index + 1}</h5>
                    {formData.team.members.length > 1 && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => removeTeamMember(index)}
                      >
                        Remove
                      </Button>
                    )}
                      </div>
                      
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
                              placeholder="e.g. Developer, Designer, Marketing"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                      
                    <Form.Group className="mb-3">
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                          rows={3}
                        value={member.bio}
                        onChange={(e) => handleTeamMemberChange(index, 'bio', e.target.value)}
                          placeholder="Brief description of this person's background and expertise"
                      />
                    </Form.Group>
                      
                    <Form.Group className="mb-3">
                        <Form.Label>Social Media Link</Form.Label>
                      <Form.Control
                        type="text"
                        value={member.social}
                        onChange={(e) => handleTeamMemberChange(index, 'social', e.target.value)}
                          placeholder="LinkedIn, Twitter, or GitHub profile URL"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              ))}
              
                <div className="d-flex justify-content-between">
                <Button 
                    variant="outline-secondary" 
                    onClick={() => handleTabChange('story')}
                  >
                    Back to Story
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      validateSection('team');
                      handleTabChange('social');
                    }}
                  >
                    Next: Social Links
                </Button>
              </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="social" title={null} tabClassName="d-none">
          {/* Social tab content */}
          <Card className="mb-3">
            <Card.Body>
              <h4>Social Media & Web Presence</h4>
              <p className="text-muted">Connect your project's online presence.</p>
              
              <Form>
              <Form.Group className="mb-3">
                  <Form.Label>Project Website</Form.Label>
                <Form.Control
                  type="url"
                  value={formData.social.website}
                  onChange={(e) => handleSocialChange('website', e.target.value)}
                    placeholder="https://yourproject.com"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                  <Form.Label>Twitter/X</Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.social.twitter}
                    onChange={(e) => handleSocialChange('twitter', e.target.value)}
                    placeholder="https://twitter.com/yourproject"
                  />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Telegram</Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.social.telegram}
                    onChange={(e) => handleSocialChange('telegram', e.target.value)}
                    placeholder="https://t.me/yourproject"
                  />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Discord</Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.social.discord}
                    onChange={(e) => handleSocialChange('discord', e.target.value)}
                    placeholder="https://discord.gg/yourproject"
                  />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>GitHub</Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.social.github}
                    onChange={(e) => handleSocialChange('github', e.target.value)}
                    placeholder="https://github.com/yourproject"
                  />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>LinkedIn</Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.social.linkedin}
                    onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/yourproject"
                  />
              </Form.Group>
                
                <div className="d-flex justify-content-between">
                    <Button 
                    variant="outline-secondary" 
                    onClick={() => handleTabChange('team')}
                  >
                    Back to Team
                    </Button>
                <Button 
                    variant="primary" 
                    onClick={() => {
                      validateSection('social');
                      handleTabChange('milestones');
                    }}
                  >
                    Next: Milestones
                </Button>
              </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="milestones" title={null} tabClassName="d-none">
          {/* Milestones tab content */}
          {renderMilestonesTab()}
        </Tab>
        <Tab eventKey="updates" title={null} tabClassName="d-none">
          {/* Updates tab content */}
          <Card className="mb-3">
            <Card.Body>
              <h4>Update Commitment</h4>
              <p className="text-muted">Let supporters know how often you'll provide progress updates.</p>
              
              <Form>
              <Form.Group className="mb-3">
                  <Form.Label>How often will you post updates about your campaign?</Form.Label>
                <Form.Select
                  value={formData.updates.scheduleCommitment}
                  onChange={(e) => handleInputChange('updates', 'scheduleCommitment', e.target.value)}
                >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
                </Form.Select>
                <Form.Text className="text-muted">
                    Regular updates help keep your supporters engaged and build trust.
                </Form.Text>
              </Form.Group>
              
                <Alert variant="info" className="mb-3">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  After your campaign launches, you can post updates through the campaign dashboard.
                  These updates will be visible to all supporters and can include text, images, and links.
              </Alert>
                
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => handleTabChange('milestones')}
                  >
                    Back to Milestones
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      validateSection('updates');
                      handleTabChange('legal');
                    }}
                  >
                    Next: Legal
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="legal" title={null} tabClassName="d-none">
          {/* Legal tab content */}
          <Card className="mb-3">
            <Card.Body>
              <h4>Legal Agreements</h4>
              <p className="text-muted">Review and accept the legal terms for your campaign.</p>
              
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label>Refund Policy</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={formData.legal.refundPolicy}
                    onChange={(e) => handleInputChange('legal', 'refundPolicy', e.target.value)}
                    placeholder="Describe your refund policy for supporters (optional)"
                  />
                  <Form.Text className="text-muted">
                    If left blank, the default refund policy will be used, which allows refunds within 14 days of contribution.
                  </Form.Text>
                </Form.Group>
                
                <Card className="mb-4">
                  <Card.Body>
                    <Card.Title>Terms of Service</Card.Title>
                    <Card.Text>
                      By creating a campaign on Lakkhi Fund, you agree to our Terms of Service,
                      which include:
                      <ul className="mt-2">
                        <li>You must provide accurate information about your project</li>
                        <li>You must use the funds for the stated purpose</li>
                        <li>You must provide regular updates to your supporters</li>
                        <li>You must fulfill any promised rewards or incentives</li>
                        <li>You must comply with all applicable laws and regulations</li>
                      </ul>
                    </Card.Text>
                <Form.Check 
                  type="checkbox"
                      id="terms-accepted"
                      label="I have read and agree to the Terms of Service"
                      checked={formData.legal.termsAccepted}
                      onChange={(e) => handleInputChange('legal', 'termsAccepted', e.target.checked)}
                      isInvalid={!!fieldErrors['legal.termsAccepted']}
                    />
                  </Card.Body>
                </Card>
                
                <Card className="mb-4">
                  <Card.Body>
                    <Card.Title>Privacy Policy</Card.Title>
                    <Card.Text>
                      Lakkhi Fund will collect and process personal information from you and your supporters.
                      We will handle this information in accordance with our Privacy Policy, which outlines:
                      <ul className="mt-2">
                        <li>What information we collect</li>
                        <li>How we use this information</li>
                        <li>Who we share this information with</li>
                        <li>Your rights regarding your personal information</li>
                        <li>How we protect your information</li>
                      </ul>
                    </Card.Text>
                    <Form.Check
                      type="checkbox"
                      id="privacy-accepted"
                      label="I have read and agree to the Privacy Policy"
                      checked={formData.legal.privacyAccepted}
                      onChange={(e) => handleInputChange('legal', 'privacyAccepted', e.target.checked)}
                      isInvalid={!!fieldErrors['legal.privacyAccepted']}
                    />
                  </Card.Body>
                </Card>
                
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => handleTabChange('updates')}
                  >
                    Back to Updates
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      if (validateSection('legal')) {
                        handleTabChange('rewards');
                      }
                    }}
                  >
                    Next: Rewards
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="rewards" title={null} tabClassName="d-none">
          {/* Rewards tab content */}
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4>Supporter Rewards</h4>
                  <p className="text-muted mb-0">Offer incentives to encourage supporters.</p>
                </div>
                <Form.Check
                  type="switch"
                  id="include-incentives"
                  label="Include Rewards"
                  checked={includeIncentives}
                  onChange={(e) => setIncludeIncentives(e.target.checked)}
                />
              </div>
              
              {includeIncentives ? (
                <Form>
                  {formData.rewards.projectRewards.map((reward, index) => (
                    <Card key={index} className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between">
                          <h5>Reward Tier {index + 1}</h5>
                          {formData.rewards.projectRewards.length > 1 && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                const updatedRewards = [...formData.rewards.projectRewards];
                                updatedRewards.splice(index, 1);
                                setFormData(prev => ({
                                  ...prev,
                                  rewards: {
                                    ...prev.rewards,
                                    projectRewards: updatedRewards
                                  }
                                }));
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        
                            <Form.Group className="mb-3">
                          <Form.Label>Title</Form.Label>
                              <Form.Control
                                type="text"
                                value={reward.title}
                                onChange={(e) => handleRewardChange(index, 'title', e.target.value)}
                            placeholder="e.g. Early Supporter, Premium Backer"
                              />
                            </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={reward.description}
                            onChange={(e) => handleRewardChange(index, 'description', e.target.value)}
                            placeholder="What will supporters receive at this level?"
                          />
                        </Form.Group>
                        
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Contribution Amount ({formData.basics.projectFundCurrency})</Form.Label>
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
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Available Items (0 for unlimited)</Form.Label>
                    <Form.Control
                      type="number"
                                value={reward.availableItems}
                                onChange={(e) => handleRewardChange(index, 'availableItems', e.target.value)}
                                min="0"
                                placeholder="How many of this reward are available?"
                    />
                  </Form.Group>
                </Col>
                        </Row>
                        
                            <Form.Group className="mb-3">
                          <Form.Label>Estimated Delivery Date</Form.Label>
                    <Form.Control
                      type="date"
                                value={reward.estimatedDelivery}
                                onChange={(e) => handleRewardChange(index, 'estimatedDelivery', e.target.value)}
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
                        displayOrder: formData.rewards.projectRewards.length + 1
                      });
                      setFormData(prev => ({
                        ...prev,
                        rewards: {
                          ...prev.rewards,
                          projectRewards: updatedRewards
                        }
                      }));
                    }}
                    className="mb-3"
                  >
                    Add Reward Tier
                  </Button>
                </Form>
              ) : (
                <Alert variant="info">
                  <Alert.Heading>Rewards Disabled</Alert.Heading>
                  <p>
                    You've chosen not to include rewards for your supporters. Toggle the switch above if you'd like to add reward tiers.
                  </p>
                  <p className="mb-0">
                    Rewards can help incentivize larger contributions and create a more engaging campaign.
                  </p>
                </Alert>
              )}
              
              <div className="d-flex justify-content-between">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => handleTabChange('legal')}
                >
                  Back to Legal
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    validateSection('rewards');
                    handleTabChange('preview');
                  }}
                >
                  Next: Preview
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      {/* Confirmation Modal */}
      <SubmitConfirmationModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={submitConfirmed}
        formData={formData}
        tokenInfo={tokenInfo}
        submitting={submitting}
        estimatedGas={gasEstimate}
      />
    </Container>
  );
};

export default CreateCampaignPage; 