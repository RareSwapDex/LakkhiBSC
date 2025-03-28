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

  useEffect(() => {
    // Check if already connected on component mount
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const web3Instance = new Web3(window.ethereum);
            
            setWeb3(web3Instance);
            setAccount(accounts[0]);
            setChainId(chainId);
            setIsConnected(true);
          }
        } catch (error) {
          console.error("Failed to check existing connection:", error);
        }
      }
    };
    
    checkConnection();
    
    // Set up event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }
    
    // Cleanup listeners on unmount
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
    
    // Refresh web3 instance to avoid issues
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      console.error("No Ethereum wallet detected");
      return null;
    }

    try {
      // Request accounts access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        // Get chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        // Create web3 instance
        const web3Instance = new Web3(window.ethereum);
        
        // Update state
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setChainId(chainId);
        setIsConnected(true);
        
        return accounts[0];
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      return null;
    }
  };

  const disconnectWallet = () => {
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