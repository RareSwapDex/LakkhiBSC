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
  isInitialized: false,
  isLoading: false,
  connectWallet: () => {},
  disconnectWallet: () => {},
  donateToProject: async () => {},
  switchChain: async () => {},
});

// Hook to use the provider context
export const useProvider = () => useContext(ProviderContext);

// Campaign ABI for interacting with deployed contracts 
const CAMPAIGN_ABI = [
  {
    "inputs": [
      {"name": "amount", "type": "uint256"}
    ],
    "name": "stake",
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
    "name": "targetAmount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "beneficiary",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// ERC20 ABI for token approvals
const ERC20_ABI = [
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize provider on component mount - with optimizations
  useEffect(() => {
    let mounted = true;
    
    // Define detection in a non-blocking way
    const initProvider = async () => {
      try {
        // Fast path: Check for window.ethereum immediately
        if (window.ethereum) {
          if (!mounted) return;
          console.log('Provider detected: window.ethereum');
          setupProvider(window.ethereum);
          return;
        }
        
        // Fallback path: Use detectEthereumProvider (slower but more thorough)
        console.log('Using detectEthereumProvider as fallback...');
        const detectedProvider = await detectEthereumProvider({ 
          mustBeMetaMask: false,
          timeout: 3000 // Timeout after 3 seconds to prevent long waits
        });
        
        if (!mounted) return;
        
        if (detectedProvider) {
          console.log('Provider detected via detectEthereumProvider');
          setupProvider(detectedProvider);
        } else {
          console.log('No Ethereum provider detected');
          setIsInitialized(true); // Mark as initialized even if no provider
        }
      } catch (error) {
        console.error('Error during provider initialization:', error);
        if (mounted) {
          setIsInitialized(true); // Mark as initialized even on error
        }
      }
    };
    
    // Setup provider with event listeners and initial state
    const setupProvider = async (detectedProvider) => {
      try {
        // Set up event listeners
        detectedProvider.on('accountsChanged', handleAccountsChanged);
        detectedProvider.on('chainChanged', handleChainChanged);
        detectedProvider.on('connect', handleConnect);
        detectedProvider.on('disconnect', handleDisconnect);
        
        // Initialize Web3 with the detected provider
        const web3Instance = new Web3(detectedProvider);
        setWeb3(web3Instance);
        setProvider(detectedProvider);
        
        // Check for existing connection - use non-blocking pattern
        try {
          // Use eth_accounts which doesn't trigger a popup
          const accounts = await detectedProvider.request({ 
            method: 'eth_accounts',
            // Adding a short timeout to prevent hanging
            timeout: 2000
          });
          
          if (!mounted) return;
          
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            
            // Get chainId
            try {
              const chainId = await detectedProvider.request({ method: 'eth_chainId' });
              if (mounted) setChainId(chainId);
            } catch (chainError) {
              console.warn('Error getting chainId:', chainError);
            }
          }
        } catch (accountsError) {
          console.warn('Error checking accounts:', accountsError);
        }
        
        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error setting up provider:', error);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };
    
    // Start initialization
    initProvider();
    
    // Clean up event listeners on unmount
    return () => {
      mounted = false;
      if (provider) {
        try {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
          provider.removeListener('connect', handleConnect);
          provider.removeListener('disconnect', handleDisconnect);
        } catch (error) {
          console.warn('Error removing event listeners:', error);
        }
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
    console.log('Chain changed to:', chainId);
    setChainId(chainId);
    // Don't reload the page, just update the state
    // This improves UX by avoiding a full reload
    // window.location.reload();
  };

  // Handle connect event
  const handleConnect = (connectInfo) => {
    console.log('Wallet connected:', connectInfo);
    setIsConnected(true);
    // Update chainId on connect
    if (connectInfo && connectInfo.chainId) {
      setChainId(connectInfo.chainId);
    }
  };

  // Handle disconnect event
  const handleDisconnect = (error) => {
    console.log('Wallet disconnected:', error);
    setIsConnected(false);
    setAccount(null);
  };

  // Connect wallet function - with better error handling and loading state
  const connectWallet = async () => {
    if (isLoading) return; // Prevent multiple connection attempts
    
    setIsLoading(true);
    console.log('Connecting wallet...', { provider, window_ethereum: window.ethereum });
    
    // Try to use window.ethereum directly if provider is not set
    const providerToUse = provider || window.ethereum;
    
    if (!providerToUse) {
      console.error('No provider available. Please install MetaMask!');
      alert('MetaMask is not installed. Please install MetaMask to connect your wallet.');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Requesting accounts...');
      const accounts = await providerToUse.request({ 
        method: 'eth_requestAccounts',
        // Timeout after 30 seconds
        timeout: 30000
      });
      console.log('Accounts received:', accounts);
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // If we used window.ethereum but provider wasn't set, update it
        if (!provider && window.ethereum) {
          setProvider(window.ethereum);
          setWeb3(new Web3(window.ethereum));
        }
        
        // Get chainId
        try {
          const chainId = await providerToUse.request({ method: 'eth_chainId' });
          setChainId(chainId);
        } catch (chainError) {
          console.warn('Error getting chainId:', chainError);
        }
        
        setIsLoading(false);
        return accounts[0];
      } else {
        console.error('No accounts found or user rejected the request');
        setIsLoading(false);
        throw new Error('No accounts found or user rejected the request');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setIsLoading(false);
      throw error;
    }
  };

  // Disconnect wallet function (for UI purposes)
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
  };
  
  // Switch chain function
  const switchChain = async (targetChainId) => {
    if (!provider || !isConnected) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }
    
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
      
      // The chain changed event should update our chainId
      return true;
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (error.code === 4902 || error.message.includes('wallet_addEthereumChain')) {
        try {
          // Add the chain based on chainId
          const chainConfig = getChainConfig(targetChainId);
          if (chainConfig) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [chainConfig],
            });
            return true;
          } else {
            throw new Error(`Unknown chain ID: ${targetChainId}`);
          }
        } catch (addError) {
          console.error('Error adding chain:', addError);
          throw addError;
        }
      }
      
      console.error('Error switching chain:', error);
      throw error;
    }
  };
  
  // Helper function to get chain configuration
  const getChainConfig = (chainId) => {
    const chains = {
      '0x1': {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://etherscan.io']
      },
      '0x38': {
        chainId: '0x38',
        chainName: 'Binance Smart Chain',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com']
      },
      '0x8453': {
        chainId: '0x8453',
        chainName: 'Base Mainnet',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org']
      }
    };
    
    return chains[chainId];
  };
  
  // Donate to a project - This follows RareFnd's pattern
  const donateToProject = async (contractAddress, amount, projectChain) => {
    if (!web3 || !account) {
      throw new Error('Wallet not connected');
    }
    
    // Validate that we're on the correct chain
    if (projectChain && chainId) {
      const chainMap = {
        'Ethereum': '0x1',
        'BSC': '0x38',
        'Base': '0x8453'
      };
      
      const expectedChainId = chainMap[projectChain];
      
      if (expectedChainId && expectedChainId !== chainId) {
        throw new Error(`Please switch to ${projectChain} network to donate. Current network does not match the project's blockchain.`);
      }
    }
    
    try {
      // Create campaign contract instance
      const campaignContract = new web3.eth.Contract(CAMPAIGN_ABI, contractAddress);
      
      // Convert amount to wei
      const amountWei = web3.utils.toWei(amount.toString(), 'ether');
      
      // Get token address from contract
      const tokenAddress = await campaignContract.methods.token().call();
      
      if (!tokenAddress) {
        throw new Error('Could not determine token address from contract');
      }
      
      console.log(`Donating ${amount} tokens to project at ${contractAddress}`);
      console.log(`Project token address: ${tokenAddress}`);
      
      // Step 1: Create token contract instance
      const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
      
      // Step 2: Check token balance
      const balance = await tokenContract.methods.balanceOf(account).call();
      const balanceInEther = web3.utils.fromWei(balance, 'ether');
      
      if (parseFloat(balanceInEther) < parseFloat(amount)) {
        throw new Error(`Insufficient token balance. You have ${balanceInEther} tokens but trying to donate ${amount} tokens.`);
      }
      
      console.log(`User has sufficient balance: ${balanceInEther} tokens`);
      
      // Step 3: Check allowance
      const allowance = await tokenContract.methods.allowance(account, contractAddress).call();
      
      // Step 4: Approve tokens if necessary
      if (BigInt(allowance) < BigInt(amountWei)) {
        console.log('Approving tokens for spending...');
        
        const approveTx = await tokenContract.methods.approve(contractAddress, amountWei).send({
          from: account
        });
        
        console.log('Token approval successful:', approveTx.transactionHash);
      } else {
        console.log('Token allowance already sufficient');
      }
      
      // Step 5: Stake tokens
      console.log('Staking tokens...');
      
      // Prepare staking transaction
      const tx = campaignContract.methods.stake(amountWei);
      
      // Estimate gas
      const gasEstimate = await tx.estimateGas({ from: account });
      
      // Send transaction - THIS TRIGGERS METAMASK
      const receipt = await tx.send({
        from: account,
        gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer
      });
      
      console.log('Staking transaction successful:', receipt.transactionHash);
      
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
    isInitialized,
    isLoading,
    connectWallet,
    disconnectWallet,
    donateToProject,
    switchChain,
  };

  return (
    <ProviderContext.Provider value={contextValue}>
      {children}
    </ProviderContext.Provider>
  );
};

export default ProviderContextProvider; 