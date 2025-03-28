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
    console.log('Connecting wallet...', { windowEthereum: window.ethereum });
    
    try {
      // First check if any provider exists - look for various wallet options
      if (!window.ethereum && !window.web3) {
        console.error('No Web3 wallet detected!');
        alert('No Web3 wallet detected. Please install MetaMask, TrustWallet, or another Web3 wallet.');
        return null;
      }
      
      // If we have Ethereum provider available
      if (window.ethereum) {
        try {
          // Force enable the ethereum provider
          // This helps when multiple wallets are installed
          if (window.ethereum.enable) {
            try {
              await window.ethereum.enable();
              console.log('Ethereum provider enabled');
            } catch (enableError) {
              console.error('Error enabling ethereum provider:', enableError);
              // Continue anyway as eth_requestAccounts might still work
            }
          }
          
          console.log('Requesting accounts directly from window.ethereum');
          // Request accounts - this will prompt the user to connect if not already connected
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts',
            params: []
          });
          console.log('Accounts received from eth_requestAccounts:', accounts);
          
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
            console.error('Accounts array is empty');
          }
        } catch (ethereumRequestError) {
          console.error('Error with eth_requestAccounts:', ethereumRequestError);
          
          // Try fallback to legacy web3 method
          try {
            console.log('Trying fallback to legacy web3 method...');
            if (window.ethereum.sendAsync || window.ethereum.send) {
              const sendMethod = window.ethereum.sendAsync || window.ethereum.send;
              const accountsResult = await new Promise((resolve, reject) => {
                sendMethod.call(window.ethereum, {
                  method: 'eth_requestAccounts',
                  params: [],
                  jsonrpc: '2.0',
                  id: new Date().getTime()
                }, (error, response) => {
                  if (error) {
                    reject(error);
                  } else if (response.error) {
                    reject(response.error);
                  } else {
                    resolve(response.result);
                  }
                });
              });
              
              console.log('Accounts from fallback method:', accountsResult);
              if (accountsResult && accountsResult.length > 0) {
                setAccount(accountsResult[0]);
                setIsConnected(true);
                setProvider(window.ethereum);
                setWeb3(new Web3(window.ethereum));
                
                // Get chain ID
                try {
                  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                  setChainId(chainId);
                } catch (chainIdError) {
                  console.warn('Could not get chain ID:', chainIdError);
                }
                
                console.log('Successfully connected to wallet via fallback:', accountsResult[0]);
                return accountsResult[0];
              }
            }
          } catch (fallbackError) {
            console.error('Fallback method also failed:', fallbackError);
          }
          
          // If we've gotten here, all methods failed - try one last approach for Trust Wallet and others
          try {
            console.log('Trying direct web3 connection...');
            // Create a fresh web3 instance directly
            const directWeb3 = new Web3(window.ethereum);
            const accounts = await directWeb3.eth.getAccounts();
            console.log('Accounts from direct web3 call:', accounts);
            
            if (accounts && accounts.length > 0) {
              setAccount(accounts[0]);
              setIsConnected(true);
              setProvider(window.ethereum);
              setWeb3(directWeb3);
              
              // Don't worry about chainId for this fallback
              console.log('Successfully connected to wallet via direct web3:', accounts[0]);
              return accounts[0];
            }
          } catch (directWeb3Error) {
            console.error('Direct web3 connection failed:', directWeb3Error);
          }
        }
      } 
      // Legacy web3 support for older wallets
      else if (window.web3 && window.web3.currentProvider) {
        try {
          console.log('Using legacy web3 provider...');
          const legacyWeb3 = new Web3(window.web3.currentProvider);
          const accounts = await legacyWeb3.eth.getAccounts();
          
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            setProvider(window.web3.currentProvider);
            setWeb3(legacyWeb3);
            
            // Chain ID is harder to get with legacy providers, so we'll skip it
            console.log('Successfully connected to wallet via legacy web3:', accounts[0]);
            return accounts[0];
          }
        } catch (legacyError) {
          console.error('Legacy web3 connection failed:', legacyError);
        }
      }
      
      // If we get here, all methods failed
      alert('Could not connect to wallet. Please ensure your wallet is unlocked and try again.');
      return null;
      
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