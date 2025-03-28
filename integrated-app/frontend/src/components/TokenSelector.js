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
const TokenSelector = ({ onTokenSelect }) => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [validating, setValidating] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState('');
  const { web3, isConnected, chainId } = useProvider();

  const validateToken = async () => {
    if (!isConnected || !web3) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!tokenAddress) {
      setError('Please enter a token address');
      return;
    }

    setValidating(true);
    setError('');
    setTokenInfo(null);

    try {
      // Simple ERC20 ABI (just the functions we need)
      const minABI = [
        { constant: true, inputs: [], name: 'name', outputs: [{ name: '', type: 'string' }], type: 'function' },
        { constant: true, inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], type: 'function' },
        { constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], type: 'function' }
      ];

      // Create token contract instance
      const tokenContract = new web3.eth.Contract(minABI, tokenAddress);
      
      // Call contract methods
      const [name, symbol, decimals] = await Promise.all([
        tokenContract.methods.name().call(),
        tokenContract.methods.symbol().call(),
        tokenContract.methods.decimals().call()
      ]);

      // Create result object with current chain
      const tokenData = {
        address: tokenAddress,
        name,
        symbol,
        decimals: parseInt(decimals),
        chainId
      };

      // Set local state
      setTokenInfo(tokenData);
      
      // Pass to parent component
      if (onTokenSelect) {
        onTokenSelect(tokenAddress, tokenData);
      }
    } catch (err) {
      console.error('Error validating token:', err);
      setError('Invalid token contract or address. Please check the address and try again.');
    } finally {
      setValidating(false);
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
          style={{ width: '100%', minWidth: '400px' }}
          className={error ? 'is-invalid' : ''}
        />
        <Button 
          variant="primary"
          onClick={validateToken}
          disabled={validating || !isConnected}
        >
          {validating ? 'Validating...' : 'Validate Token'}
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mt-2">
          {error}
        </Alert>
      )}

      {tokenInfo && (
        <Alert variant="success" className="mt-2">
          <h6>Token Validated Successfully</h6>
          <p className="mb-0">
            <strong>Name:</strong> {tokenInfo.name}<br />
            <strong>Symbol:</strong> {tokenInfo.symbol}<br />
            <strong>Decimals:</strong> {tokenInfo.decimals}
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