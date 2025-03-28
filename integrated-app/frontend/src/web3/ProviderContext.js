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
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (accounts[0]) {
          setWeb3(web3Instance);
          setAccount(accounts[0]);
          setChainId(chainId);
          setIsConnected(true);
          return accounts[0];
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
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