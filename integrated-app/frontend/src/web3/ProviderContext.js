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
      const detectedProvider = await detectEthereumProvider();
      
      if (detectedProvider) {
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
          if (accounts.length > 0) {
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
        console.log('Please install MetaMask!');
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
    if (!provider) {
      console.log('MetaMask not installed');
      return;
    }
    
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setIsConnected(true);
      
      // Get chainId
      const chainId = await provider.request({ method: 'eth_chainId' });
      setChainId(chainId);
      
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
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