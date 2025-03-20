import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Define clusterApiUrl function locally instead of importing it
const clusterApiUrl = (cluster) => `https://api.${cluster || 'devnet'}.solana.com`;

interface WalletConnectionProviderProps {
  children: ReactNode;
}

const WalletConnectionProvider: FC<WalletConnectionProviderProps> = ({ children }) => {
  // Use devnet cluster or environment variable if provided
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork || WalletAdapterNetwork.Devnet;
  
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network), [network]);
  
  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletConnectionProvider; 