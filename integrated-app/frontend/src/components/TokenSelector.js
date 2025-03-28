import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useProvider } from '../web3/ProviderContext';
import Web3 from 'web3';

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

  // Hardcoded RPC endpoints for fallback validation
  const RPC_ENDPOINTS = {
    ETH: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    BSC: 'https://bsc-dataseed.binance.org/',
    BSC_TESTNET: 'https://data-seed-prebsc-1-s1.binance.org:8545/'
  };

  const validateToken = async () => {
    if (!tokenAddress) {
      setError('Please enter a token address');
      return;
    }

    setValidating(true);
    setError('');
    setTokenInfo(null);

    // First try with connected wallet if available
    if (isConnected && web3) {
      try {
        const result = await validateWithWeb3(web3, tokenAddress, chainId);
        if (result) {
          setTokenInfo(result);
          onTokenSelect(tokenAddress, result);
          setValidating(false);
          return;
        }
      } catch (err) {
        console.error('Error validating with connected wallet:', err);
        // Continue to fallback methods
      }
    }

    // Fallback: Try with public RPC endpoints
    try {
      // Try Ethereum
      const ethWeb3 = new Web3(RPC_ENDPOINTS.ETH);
      try {
        const result = await validateWithWeb3(ethWeb3, tokenAddress, '0x1');
        if (result) {
          setTokenInfo(result);
          onTokenSelect(tokenAddress, result);
          setValidating(false);
          return;
        }
      } catch (ethErr) {
        console.error('Error validating with ETH:', ethErr);
      }

      // Try BSC
      const bscWeb3 = new Web3(RPC_ENDPOINTS.BSC);
      try {
        const result = await validateWithWeb3(bscWeb3, tokenAddress, '0x38');
        if (result) {
          setTokenInfo(result);
          onTokenSelect(tokenAddress, result);
          setValidating(false);
          return;
        }
      } catch (bscErr) {
        console.error('Error validating with BSC:', bscErr);
      }

      // Try BSC Testnet
      const bscTestWeb3 = new Web3(RPC_ENDPOINTS.BSC_TESTNET);
      try {
        const result = await validateWithWeb3(bscTestWeb3, tokenAddress, '0x61');
        if (result) {
          setTokenInfo(result);
          onTokenSelect(tokenAddress, result);
          setValidating(false);
          return;
        }
      } catch (bscTestErr) {
        console.error('Error validating with BSC Testnet:', bscTestErr);
      }

      // If all validation attempts failed
      setError('Invalid token contract or address. Please check the address and try again.');
    } catch (err) {
      console.error('Error in validation fallbacks:', err);
      setError('Could not validate token. Please check the address and try again.');
    } finally {
      setValidating(false);
    }
  };

  const validateWithWeb3 = async (web3Instance, address, networkChainId) => {
    // Simple ERC20 ABI (just the functions we need)
    const minABI = [
      { constant: true, inputs: [], name: 'name', outputs: [{ name: '', type: 'string' }], type: 'function' },
      { constant: true, inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], type: 'function' },
      { constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], type: 'function' }
    ];

    // Create token contract instance
    const tokenContract = new web3Instance.eth.Contract(minABI, address);
    
    // Call contract methods
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.methods.name().call(),
      tokenContract.methods.symbol().call(),
      tokenContract.methods.decimals().call()
    ]);

    // Create result object with network chain
    return {
      address: address,
      name,
      symbol,
      decimals: parseInt(decimals),
      chainId: networkChainId
    };
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
          disabled={validating}
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
    </Form.Group>
  );
};

export default TokenSelector; 