import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import Web3 from 'web3';

/**
 * TokenSelector component for selecting tokens from a list of popular options or entering a custom address
 * 
 * @param {string} value - Current token address value
 * @param {function} onChange - Function to call when token address changes
 * @param {function} onValidate - Function to call when token is validated
 * @param {function} onReset - Function to call when token is reset
 * @returns {JSX.Element} TokenSelector component
 */
const TokenSelector = ({ value, onChange, onValidate, onReset }) => {
  const [tokenAddress, setTokenAddress] = useState(value || '');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  
  useEffect(() => {
    // When value changes from parent component
    setTokenAddress(value || '');
  }, [value]);
  
  useEffect(() => {
    // If token info changes, call the onValidate callback
    if (tokenInfo && onValidate) {
      onValidate(tokenInfo);
      setValidated(true);
    }
  }, [tokenInfo, onValidate]);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setTokenAddress(newValue);
    setValidated(false);
    setError(null);
    
    if (onReset) {
      onReset();
    }
    
    if (onChange) {
      onChange(newValue);
    }
  };
  
  const validateToken = async () => {
    if (!tokenAddress) {
      setError('Please enter a token address');
      return;
    }
    
    setIsValidating(true);
    setError(null);
    setTokenInfo(null); // Clear any previous token info
    console.log('Starting token validation for address:', tokenAddress);
    
    try {
      // Frontend validation for proper address format
      if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
        throw new Error('Invalid token address format. Must be a valid BSC address.');
      }
      
      console.log('Starting Web3 validation');
      
      // Try with multiple reliable RPC endpoints for BSC
      const bscRpcUrls = [
        'https://bsc-dataseed.binance.org/',
        'https://bsc-dataseed1.binance.org/',
        'https://bsc-dataseed2.binance.org/',
        'https://bsc-dataseed3.binance.org/',
        'https://bsc-dataseed4.binance.org/',
        'https://rpc.ankr.com/bsc'
      ];
      
      // Use the connected wallet provider if available, otherwise try RPC URLs
      let web3;
      if (window.ethereum) {
        console.log('Using connected wallet provider');
        web3 = new Web3(window.ethereum);
      } else {
        // Try each RPC URL until one works
        for (const rpcUrl of bscRpcUrls) {
          try {
            console.log(`Trying RPC URL: ${rpcUrl}`);
            web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
            // Test the connection
            await web3.eth.getBlockNumber();
            console.log(`Connected to ${rpcUrl} successfully`);
            break;
          } catch (rpcError) {
            console.warn(`Failed to connect to ${rpcUrl}:`, rpcError);
            web3 = null;
          }
        }
      }
      
      if (!web3) {
        throw new Error('Could not connect to any BSC node. Please try again later.');
      }
      
      // Convert to checksum address
      const checksumAddress = web3.utils.toChecksumAddress(tokenAddress);
      
      // Check if it's a contract
      console.log('Checking if address is a contract');
      const code = await web3.eth.getCode(checksumAddress);
      
      if (code === '0x' || code === '0x0') {
        throw new Error('The address is not a contract. Please enter a valid token contract address.');
      }
      
      // Standard ERC20 ABI with all necessary methods
      const tokenABI = [
        { "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "type": "function" },
        { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "type": "function" },
        { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "type": "function" }
      ];
      
      const tokenContract = new web3.eth.Contract(tokenABI, checksumAddress);
      
      try {
        // Try to get token data with longer timeout
        const [name, symbol, decimals] = await Promise.all([
          tokenContract.methods.name().call().catch(e => { 
            console.error('Failed to get name:', e); 
            return null; 
          }),
          tokenContract.methods.symbol().call().catch(e => { 
            console.error('Failed to get symbol:', e); 
            return null; 
          }),
          tokenContract.methods.decimals().call().catch(e => { 
            console.error('Failed to get decimals:', e); 
            return null; 
          })
        ]);
        
        console.log('Token data from blockchain:', { name, symbol, decimals });
        
        // Only proceed if we successfully got at least name and symbol
        if (name && symbol) {
          setTokenInfo({
            name: name,
            symbol: symbol,
            decimals: decimals ? parseInt(decimals) : 18,
            address: checksumAddress
          });
        } else {
          throw new Error('Could not retrieve token information. This may not be a standard token contract.');
        }
      } catch (contractError) {
        console.error('Error getting token data from contract:', contractError);
        throw new Error('Failed to validate token. The contract does not appear to be a standard token.');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      setError(error.message || 'Failed to validate token. Please check the address and try again.');
      // Don't set any fallback token info - leave it as null
      setTokenInfo(null);
    } finally {
      setIsValidating(false);
    }
  };
  
  const resetToken = () => {
    setTokenAddress('');
    setTokenInfo(null);
    setValidated(false);
    setError(null);
    
    if (onChange) {
      onChange('');
    }
    
    if (onReset) {
      onReset();
    }
  };
  
  return (
    <Form.Group className="mb-3">
      <Form.Label>Token Address (Required) <span className="text-danger">*</span></Form.Label>
      <div className="d-flex mb-2">
        <Form.Control
          type="text"
          placeholder="0x..."
          value={tokenAddress}
          onChange={handleChange}
          className={validated ? 'border-success' : ''}
          required
        />
        <Button 
          variant="outline-primary" 
          onClick={validateToken} 
          disabled={isValidating || !tokenAddress}
          className="ms-2"
        >
          {isValidating ? <Spinner size="sm" animation="border" /> : 'Validate'}
        </Button>
        
        {tokenAddress && (
          <Button 
            variant="outline-danger" 
            onClick={resetToken} 
            className="ms-2"
          >
            Clear
          </Button>
        )}
      </div>
      
      <Form.Text className="text-muted">
        Enter the token address for this campaign. This is required to specify how funds will be raised.
      </Form.Text>
      
      {error && (
        <Alert variant="danger" className="mt-2 mb-0 py-2">
          {error}
        </Alert>
      )}
      
      {tokenInfo && (
        <Alert variant="success" className="mt-2 mb-0">
          <Alert.Heading className="h6">Token validated successfully</Alert.Heading>
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