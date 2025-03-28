import React, { createContext, useState, useEffect, useContext } from 'react';
import Web3 from 'web3';

// Context for Web3 provider
export const ProviderContext = createContext({
  provider: null,
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
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        // Get the chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        // Set up Web3
        const web3Instance = new Web3(window.ethereum);
        
        // Update state
        setWeb3(web3Instance);
        setProvider(window.ethereum);
        setAccount(accounts[0]);
        setChainId(chainId);
        setIsConnected(true);
        
        // Set up event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('disconnect', handleDisconnect);
        
        return accounts[0];
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      if (error.code === 4001) {
        // User rejected request
        alert('Please connect your wallet to continue.');
      } else {
        alert('Error connecting to wallet. Please try again.');
      }
    }
  };

  const disconnectWallet = () => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    }
    setWeb3(null);
    setProvider(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else {
      // User switched accounts
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = (chainId) => {
    setChainId(chainId);
    // Reload the page as recommended by MetaMask
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  return (
    <ProviderContext.Provider
      value={{
        provider,
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