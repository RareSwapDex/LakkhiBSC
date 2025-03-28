import React, { createContext, useState, useContext } from 'react';
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

  const connectWallet = async () => {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request accounts from MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts && accounts.length > 0) {
          // Create Web3 instance
          const web3 = new Web3(window.ethereum);
          
          // Get the network ID
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          
          // Update state
          setWeb3(web3);
          setAccount(accounts[0]);
          setChainId(chainId);
          setIsConnected(true);
          
          console.log('Wallet connected:', accounts[0]);
          return accounts[0];
        }
      } catch (error) {
        console.error('User denied account access or connection failed:', error);
      }
    } else {
      console.log('Please install MetaMask to use this feature');
    }
    
    return null;
  };

  const disconnectWallet = () => {
    setWeb3(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    console.log('Wallet disconnected');
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