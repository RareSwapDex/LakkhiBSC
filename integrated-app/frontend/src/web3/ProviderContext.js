import React, { createContext, useState, useEffect, useContext } from 'react';
import Web3 from 'web3';

// Context for Web3 provider
export const ProviderContext = createContext({
  web3: null,
  account: null,
  chainId: null,
  isConnected: false,
  connectWallet: () => {},
  disconnectWallet: () => {},
});

// Hook to use the provider context
export const useProvider = () => useContext(ProviderContext);

export const ProviderContextProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Auto-check for existing connections when the component mounts
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (window.ethereum) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts && accounts.length > 0) {
            // Get the chain ID
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            // Set up web3
            const web3Instance = new Web3(window.ethereum);
            
            // Update state
            setWeb3(web3Instance);
            setAccount(accounts[0]);
            setChainId(chainId);
            setIsConnected(true);
            
            // Set up event listeners
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            window.ethereum.on('disconnect', handleDisconnect);
          }
        } catch (error) {
          console.error('Error checking existing connection:', error);
        }
      }
    };
    
    checkExistingConnection();
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else {
      // User switched accounts
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = (newChainId) => {
    setChainId(newChainId);
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      console.error('No Ethereum provider detected');
      return null;
    }

    try {
      // Request account access - this will prompt MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        // Get chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        // Create web3 instance
        const web3Instance = new Web3(window.ethereum);
        
        // Set up event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('disconnect', handleDisconnect);
        
        // Update state
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setChainId(chainId);
        setIsConnected(true);
        
        return accounts[0];
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  };

  const disconnectWallet = () => {
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    }
    
    // Reset state
    setWeb3(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
  };

  return (
    <ProviderContext.Provider
      value={{
        web3,
        account,
        chainId,
        isConnected,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
};

export default ProviderContextProvider; 