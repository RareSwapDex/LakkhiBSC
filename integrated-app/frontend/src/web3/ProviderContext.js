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
  validateNetworkCompatibility: () => {},
});

// Hook to use the provider context
export const useProvider = () => useContext(ProviderContext);

// Network constants - but we don't enforce them during connection
const NETWORKS = {
  ETH: {
    MAINNET: '0x1',
    TESTNET: '0x5' // Goerli
  },
  BSC: {
    MAINNET: '0x38',
    TESTNET: '0x61'
  }
};

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
      try {
        const provider = await detectEthereumProvider();
        
        if (provider) {
          // Set up event listeners
          provider.on('accountsChanged', handleAccountsChanged);
          provider.on('chainChanged', handleChainChanged);
          provider.on('connect', handleConnect);
          provider.on('disconnect', handleDisconnect);
          
          setProvider(provider);
          setWeb3(new Web3(provider));
          
          // Check if already connected
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const chainId = await provider.request({ method: 'eth_chainId' });
            setAccount(accounts[0]);
            setChainId(chainId);
            setIsConnected(true);
          }
        }
      } catch (error) {
        console.error('Error initializing provider:', error);
      }
    };

    initProvider();
    
    return () => {
      if (provider) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
        provider.removeListener('connect', handleConnect);
        provider.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setIsConnected(false);
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };

  const handleChainChanged = async (newChainId) => {
    setChainId(newChainId);
  };

  const handleConnect = (connectInfo) => {
    setIsConnected(true);
  };

  const handleDisconnect = (error) => {
    setIsConnected(false);
    setAccount(null);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet');
      return null;
    }

    try {
      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Get chain ID without validation
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      if (accounts[0]) {
        setAccount(accounts[0]);
        setChainId(chainId);
        setIsConnected(true);
        setWeb3(new Web3(window.ethereum));
        return accounts[0];
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Error connecting wallet. Please try again.');
      return null;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
  };

  // Helper function to check if networks are compatible
  const validateNetworkCompatibility = (tokenChainId) => {
    const currentChainId = chainId;
    
    // Check if both chains are on the same network type (both ETH or both BSC)
    const isCurrentBSC = currentChainId === NETWORKS.BSC.MAINNET || currentChainId === NETWORKS.BSC.TESTNET;
    const isTokenBSC = tokenChainId === NETWORKS.BSC.MAINNET || tokenChainId === NETWORKS.BSC.TESTNET;
    
    if (isCurrentBSC !== isTokenBSC) {
      return {
        isValid: false,
        message: `Network mismatch: Your wallet is connected to ${isCurrentBSC ? 'BSC' : 'Ethereum'} but the token is on ${isTokenBSC ? 'BSC' : 'Ethereum'}. Please switch networks to continue.`
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  };

  const donateToProject = async (contractAddress, amount) => {
    if (!web3 || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      const campaignContract = new web3.eth.Contract(CAMPAIGN_ABI, contractAddress);
      const amountWei = web3.utils.toWei(amount.toString(), 'ether');
      const tx = campaignContract.methods.donate(amountWei);
      const gasEstimate = await tx.estimateGas({ from: account });
      
      const receipt = await tx.send({
        from: account,
        gas: Math.floor(gasEstimate * 1.2)
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
    validateNetworkCompatibility, // Expose this for token validation
  };

  return (
    <ProviderContext.Provider value={contextValue}>
      {children}
    </ProviderContext.Provider>
  );
};

export default ProviderContextProvider; 