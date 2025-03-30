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
    setTokenInfo(null);
    
    try {
      // Frontend validation for proper address format
      if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
        throw new Error('Invalid token address format. Must be a valid BSC address.');
      }
      
      // Try with more reliable BSC endpoints - public RPC endpoints can be unreliable
      const bscRpcUrls = [
        'https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3', // More reliable enterprise endpoint
        'https://rpc.ankr.com/bsc',
        'https://binance.nodereal.io',
        'https://bsc-mainnet.public.blastapi.io',
        'https://bsc-dataseed1.defibit.io/'
      ];
      
      let web3 = null;
      let connectionSuccessful = false;
      
      // First try using the connected wallet's provider - most reliable
      if (window.ethereum) {
        try {
          web3 = new Web3(window.ethereum);
          // Test the connection with a small call
          await web3.eth.net.isListening();
          connectionSuccessful = true;
          console.log('Connected using wallet provider');
        } catch (walletError) {
          console.warn('Wallet provider connection failed:', walletError);
          web3 = null;
        }
      }
      
      // If wallet connection failed, try public RPC endpoints
      if (!connectionSuccessful) {
        for (const rpcUrl of bscRpcUrls) {
          if (connectionSuccessful) break;
          
          try {
            const tempWeb3 = new Web3(new Web3.providers.HttpProvider(rpcUrl, {
              timeout: 5000, // 5 second timeout
              headers: [
                { name: 'Access-Control-Allow-Origin', value: '*' }
              ]
            }));
            
            // Test the connection with a small call
            await tempWeb3.eth.net.isListening();
            web3 = tempWeb3;
            connectionSuccessful = true;
            console.log(`Connected to ${rpcUrl} successfully`);
          } catch (rpcError) {
            console.warn(`Failed to connect to ${rpcUrl}:`, rpcError);
          }
        }
      }
      
      if (!web3 || !connectionSuccessful) {
        throw new Error('Unable to connect to the blockchain. Please try again later.');
      }
      
      // Rest of the code to validate token
      try {
        // Convert to checksum address
        const checksumAddress = web3.utils.toChecksumAddress(tokenAddress);
        
        // Check if address is a contract
        const code = await web3.eth.getCode(checksumAddress).catch(e => {
          console.error('Error getting code:', e);
          throw new Error('Network connection issue. Please try again.');
        });
        
        if (code === '0x' || code === '0x0') {
          throw new Error('The address is not a token contract.');
        }
        
        // Standard ERC20 ABI
        const tokenABI = [
          { "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "type": "function" },
          { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "type": "function" },
          { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "type": "function" }
        ];
        
        const tokenContract = new web3.eth.Contract(tokenABI, checksumAddress);
        
        // Try to get token data
        let name, symbol, decimals;
        
        try {
          name = await tokenContract.methods.name().call();
        } catch (e) {
          console.error('Error getting token name:', e);
          name = null;
        }
        
        try {
          symbol = await tokenContract.methods.symbol().call();
        } catch (e) {
          console.error('Error getting token symbol:', e);
          symbol = null;
        }
        
        try {
          decimals = await tokenContract.methods.decimals().call();
        } catch (e) {
          console.error('Error getting token decimals:', e);
          decimals = '18'; // Default to 18 decimals
        }
        
        if (name && symbol) {
          setTokenInfo({
            name: name,
            symbol: symbol,
            decimals: parseInt(decimals || '18', 10),
            address: checksumAddress
          });
        } else {
          throw new Error('Could not retrieve token information. This may not be a standard token.');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      setError(error.message || 'Failed to validate token');
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