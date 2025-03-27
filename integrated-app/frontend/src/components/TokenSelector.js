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
    
    try {
      // Frontend validation for proper address format
      if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
        throw new Error('Invalid token address format. Must be a valid BSC address.');
      }

      // Try to validate using Web3.js directly if available (fallback method)
      if (window.web3 || window.ethereum) {
        try {
          // Use the imported Web3 with provider
          let web3;
          if (window.ethereum) {
            web3 = new Web3(window.ethereum);
          } else if (window.web3) {
            web3 = new Web3(window.web3.currentProvider);
          } else {
            // Use BSC RPC from environment
            const BSC_RPC_URL = process.env.REACT_APP_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/';
            web3 = new Web3(new Web3.providers.HttpProvider(BSC_RPC_URL));
          }
          
          // Convert to checksum address
          const checksumAddress = web3.utils.toChecksumAddress(tokenAddress);
          
          // Basic validation - check if it's a contract
          const code = await web3.eth.getCode(checksumAddress);
          if (code === '0x' || code === '0x0') {
            throw new Error('Address is not a contract');
          }
        } catch (web3Error) {
          console.log('Web3 validation error:', web3Error);
          // Continue to backend validation even if this fails
        }
      }
      
      // Backend validation
      const apiUrl = process.env.REACT_APP_API_URL || '';
      console.log('Validating token at:', `${apiUrl}/api/token/validate/`);
      
      // Make sure token address is properly formatted for API call
      // Clean address (trim spaces, lowercase) before sending to API
      const formattedAddress = tokenAddress.trim();
      
      const response = await axios.post(
        `${apiUrl}/api/token/validate/`,
        { token_address: formattedAddress },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10 second timeout 
        }
      );
      
      if (response.data.success) {
        setTokenInfo(response.data.token_info);
      } else {
        setError(response.data.message || 'Invalid token address');
      }
    } catch (err) {
      console.error('Error validating token:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again later.');
      } else if (err.response) {
        // Server responded with error
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        // No response received
        setError('Network error. Please check your connection and try again.');
      } else {
        // Other error
        setError(err.message || 'Failed to validate token. Check network connection.');
      }
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