import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useProvider } from '../web3/ProviderContext';

/**
 * TokenSelector component for selecting tokens from a list of popular options or entering a custom address
 * 
 * @param {string} value - Current token address value
 * @param {function} onTokenSelect - Function to call when token is selected
 * @param {function} onChainSelect - Function to call when chain is selected
 * @returns {JSX.Element} TokenSelector component
 */
const TokenSelector = ({ onTokenSelect, onChainSelect }) => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { web3, isConnected, account } = useProvider();

  const validateToken = async () => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!tokenAddress) {
      setError('Please enter a token address');
      return;
    }

    setIsLoading(true);
    setError('');
    setTokenInfo(null);

    try {
      // First try to validate the token contract exists
      const tokenContract = new web3.eth.Contract([
        {
          "constant": true,
          "inputs": [],
          "name": "symbol",
          "outputs": [{ "name": "", "type": "string" }],
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "name",
          "outputs": [{ "name": "", "type": "string" }],
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "decimals",
          "outputs": [{ "name": "", "type": "uint8" }],
          "type": "function"
        }
      ], tokenAddress);

      // Get token details
      const [symbol, name, decimals] = await Promise.all([
        tokenContract.methods.symbol().call(),
        tokenContract.methods.name().call(),
        tokenContract.methods.decimals().call()
      ]);

      // Get chain information
      const chainId = await web3.eth.getChainId();
      let network = 'Unknown';
      
      // Map chain IDs to network names
      switch (chainId.toString()) {
        case '1':
          network = 'Ethereum Mainnet';
          break;
        case '56':
          network = 'BSC Mainnet';
          break;
        case '97':
          network = 'BSC Testnet';
          break;
        default:
          network = `Chain ID: ${chainId}`;
      }

      const tokenData = {
        address: tokenAddress,
        symbol,
        name,
        decimals: parseInt(decimals),
        network,
        chainId: chainId.toString()
      };

      setTokenInfo(tokenData);
      onTokenSelect(tokenAddress, tokenData);
      
      // Update the blockchain chain field
      if (onChainSelect) {
        onChainSelect(network);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setError('Invalid token address or contract. Please verify the address and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>Token Address <span className="text-danger">*</span></Form.Label>
      <div className="d-flex gap-2">
        <Form.Control
          type="text"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="Enter token contract address (0x...)"
          style={{ minWidth: '400px' }}
          className={error ? 'is-invalid' : ''}
        />
        <Button 
          variant="primary"
          onClick={validateToken}
          disabled={isLoading || !isConnected}
        >
          {isLoading ? 'Validating...' : 'Validate Token'}
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mt-2">
          {error}
        </Alert>
      )}

      {tokenInfo && (
        <Alert variant="success" className="mt-2">
          <h6>Token Information</h6>
          <p className="mb-0">
            <strong>Name:</strong> {tokenInfo.name}<br />
            <strong>Symbol:</strong> {tokenInfo.symbol}<br />
            <strong>Decimals:</strong> {tokenInfo.decimals}<br />
            <strong>Network:</strong> {tokenInfo.network}
          </p>
        </Alert>
      )}

      {!isConnected && (
        <Alert variant="warning" className="mt-2">
          Please connect your wallet to validate tokens.
        </Alert>
      )}
    </Form.Group>
  );
};

export default TokenSelector; 