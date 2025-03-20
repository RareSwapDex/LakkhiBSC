import React, { createContext, useContext, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Define clusterApiUrl function locally instead of importing it
const clusterApiUrl = (cluster) => `https://api.${cluster || 'devnet'}.solana.com`;

// Default styles
require('@solana/wallet-adapter-react-ui/styles.css');

const WalletContext = createContext({});

export const useWallet = () => useContext(WalletContext);

export const WalletContextProvider = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork || WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      // Add other wallet adapters here
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContext.Provider value={{}}>
            {children}
          </WalletContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}; 