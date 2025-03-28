import React, { createContext, useState, useEffect, useContext } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

// Context for Web3 provider
export const ProviderContext = createContext({
  provider: null,
  web3: null,
  account: null,
  chainId: null,
  isConnected: false,
  connectWallet: () => {},
  disconnectWallet: () => {},
  donateToProject: async () => {},
});

// Hook to use the provider context
export const useProvider = () => useContext(ProviderContext);

// Campaign ABI for interacting with deployed contracts 
const CAMPAIGN_ABI = [
  {
    "inputs": [
      {"name": "amount", "type": "uint256"}
    ],
    "name": "donate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTargetAmount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBeneficiary",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDonators",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const ProviderContextProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize provider on component mount
  useEffect(() => {
    const initProvider = async () => {
      console.log('Initializing Web3 provider...');
      // Use window.ethereum directly first as a faster check
      let detectedProvider = window.ethereum;
      
      // If not found directly, use detectEthereumProvider as fallback
      if (!detectedProvider) {
        console.log('window.ethereum not found directly, using detectEthereumProvider...');
        try {
          detectedProvider = await detectEthereumProvider({ mustBeMetaMask: false });
        } catch (error) {
          console.error('Error detecting provider:', error);
        }
      }
      
      if (detectedProvider) {
        console.log('Provider detected:', detectedProvider);
        // Set up event listeners for MetaMask
        detectedProvider.on('accountsChanged', handleAccountsChanged);
        detectedProvider.on('chainChanged', handleChainChanged);
        detectedProvider.on('connect', handleConnect);
        detectedProvider.on('disconnect', handleDisconnect);
        
        // Initialize Web3 with the detected provider
        const web3Instance = new Web3(detectedProvider);
        setWeb3(web3Instance);
        setProvider(detectedProvider);
        
        // Check if already connected
        try {
          const accounts = await detectedProvider.request({ method: 'eth_accounts' });
          console.log('Found accounts:', accounts);
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            
            // Get chainId
            const chainId = await detectedProvider.request({ method: 'eth_chainId' });
            setChainId(chainId);
          }
        } catch (error) {
          console.error('Error checking accounts:', error);
        }
      } else {
        console.log('No Ethereum provider detected. Please install MetaMask!');
      }
    };
    
    initProvider();
    
    // Clean up event listeners on unmount
    return () => {
      if (provider) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
        provider.removeListener('connect', handleConnect);
        provider.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  // Handle account change
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setAccount(null);
      setIsConnected(false);
    } else {
      // User switched accounts
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };

  // Handle chain change
  const handleChainChanged = (chainId) => {
    setChainId(chainId);
    window.location.reload(); // Recommended by MetaMask
  };

  // Handle connect event
  const handleConnect = (connectInfo) => {
    setIsConnected(true);
  };

  // Handle disconnect event
  const handleDisconnect = (error) => {
    setIsConnected(false);
    setAccount(null);
  };

  // Connect wallet function
  const connectWallet = async () => {
    console.log('Connecting wallet...', { provider, window_ethereum: window.ethereum });
    
    try {
      // First check if window.ethereum exists
      if (!window.ethereum) {
        console.error('MetaMask not installed!');
        alert('MetaMask is not installed. Please install MetaMask to connect your wallet.');
        return null;
      }
      
      // Always use window.ethereum directly for connection requests
      // This is more reliable than using the cached provider
      console.log('Requesting accounts directly from window.ethereum');
      
      try {
        // Request accounts - this will prompt the user to connect if not already connected
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Accounts received:', accounts);
        
        if (accounts && accounts.length > 0) {
          // Set the account and connection state
          setAccount(accounts[0]);
          setIsConnected(true);
          
          // Make sure provider and web3 are set
          setProvider(window.ethereum);
          setWeb3(new Web3(window.ethereum));
          
          // Get chain ID
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(chainId);
          
          console.log('Successfully connected to wallet:', accounts[0]);
          return accounts[0];
        } else {
          console.error('No accounts found or user rejected the request');
          return null;
        }
      } catch (requestError) {
        console.error('Error requesting accounts:', requestError);
        
        // If the user rejected the request, don't show an error
        if (requestError.code === 4001) {
          console.log('User rejected the connection request');
          return null;
        }
        
        // For other errors
        alert('Error connecting to wallet: ' + (requestError.message || 'Unknown error'));
        return null;
      }
    } catch (error) {
      console.error('Unexpected error in connectWallet:', error);
      alert('Unexpected error connecting to wallet. Please try again or reload the page.');
      return null;
    }
  };

  // Disconnect wallet function (for UI purposes)
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
  };
  
  // Donate to a project - This follows RareFnd's pattern
  const donateToProject = async (contractAddress, amount) => {
    if (!web3 || !account) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Create contract instance
      const campaignContract = new web3.eth.Contract(CAMPAIGN_ABI, contractAddress);
      
      // Convert amount to wei
      const amountWei = web3.utils.toWei(amount.toString(), 'ether');
      
      // Prepare transaction
      const tx = campaignContract.methods.donate(amountWei);
      
      // Estimate gas
      const gasEstimate = await tx.estimateGas({ from: account });
      
      // Send transaction - THIS TRIGGERS METAMASK
      const receipt = await tx.send({
        from: account,
        gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer
      });
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error donating to project:', error);
      throw error;
    }
  };

  const contextValue = {
    provider,
    web3,
    account,
    chainId,
    isConnected,
    connectWallet,
    disconnectWallet,
    donateToProject,
  };

  return (
    <ProviderContext.Provider value={contextValue}>
      {children}
    </ProviderContext.Provider>
  );
};

export default ProviderContextProvider; 