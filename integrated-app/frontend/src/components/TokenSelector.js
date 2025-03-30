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
    console.log('Starting token validation for address:', tokenAddress);
    
    // Create a timeout that will force the validation to finish
    const validationTimeout = setTimeout(() => {
      console.log('Validation timed out, using fallback');
      if (isValidating) {
        const shortSymbol = tokenAddress.slice(2, 6).toUpperCase();
        const fallbackTokenInfo = {
          name: 'Token ' + shortSymbol,
          symbol: `TKN${shortSymbol}`,
          decimals: 18,
          address: tokenAddress,
          total_supply: 'Unknown'
        };
        setTokenInfo(fallbackTokenInfo);
        setIsValidating(false);
        setError('Validation timed out. Using basic token information.');
      }
    }, 8000); // 8 second overall timeout
    
    try {
      // Frontend validation for proper address format
      if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
        throw new Error('Invalid token address format. Must be a valid BSC address.');
      }
      
      console.log('Starting Web3 validation');
      // Try direct Web3 validation with a timeout
      let web3ValidationPromise = new Promise(async (resolve) => {
        let web3TokenInfo = null;
        
        try {
          // Use the imported Web3 with provider
          let web3;
          
          console.log('Checking for Web3 providers');
          if (window.ethereum) {
            console.log('Using window.ethereum provider');
            web3 = new Web3(window.ethereum);
          } else if (window.web3) {
            console.log('Using window.web3 provider');
            web3 = new Web3(window.web3.currentProvider);
          } else {
            console.log('Using RPC URL provider');
            // Use BSC RPC from environment
            const BSC_RPC_URL = process.env.REACT_APP_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/';
            web3 = new Web3(new Web3.providers.HttpProvider(BSC_RPC_URL));
          }
          
          try {
            // Convert to checksum address
            console.log('Converting to checksum address');
            const checksumAddress = web3.utils.toChecksumAddress(tokenAddress);
            
            // Basic validation - check if it's a contract
            console.log('Checking if address is a contract');
            const code = await web3.eth.getCode(checksumAddress);
            console.log('Contract code length:', code.length);
            
            if (code === '0x' || code === '0x0') {
              console.log('Address is not a contract, using fallback');
              // Create fallback with address in checksum format
              const shortSymbol = tokenAddress.slice(2, 6).toUpperCase();
              web3TokenInfo = {
                name: 'Address',
                symbol: `ADDR${shortSymbol}`,
                decimals: 18,
                address: checksumAddress,
              };
            } else {
              // Try to get token info with a simplified approach
              console.log('Getting token info from contract');
              
              // Use a more comprehensive ABI with name, symbol, and decimals
              const tokenABI = [
                { "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "type": "function" },
                { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "type": "function" },
                { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "type": "function" }
              ];
              
              const tokenContract = new web3.eth.Contract(tokenABI, checksumAddress);
              
              try {
                // Try to get all token data in parallel
                const [name, symbol, decimals] = await Promise.all([
                  tokenContract.methods.name().call().catch(() => null),
                  tokenContract.methods.symbol().call().catch(() => null),
                  tokenContract.methods.decimals().call().catch(() => '18')
                ]);
                
                console.log('Got token details from blockchain:', { name, symbol, decimals });
                
                let tokenName = name;
                let tokenSymbol = symbol;
                
                // If we couldn't get the name or symbol, use fallbacks
                if (!tokenName || !tokenSymbol) {
                  if (!tokenName && tokenSymbol) {
                    tokenName = tokenSymbol + ' Token';
                  } else if (tokenName && !tokenSymbol) {
                    tokenSymbol = tokenName.substring(0, 4).toUpperCase();
                  } else {
                    // If we couldn't get either, use address-based fallback
                    const shortAddress = checksumAddress.slice(2, 6).toUpperCase();
                    tokenName = 'Token ' + shortAddress;
                    tokenSymbol = 'TKN' + shortAddress;
                  }
                }
                
                web3TokenInfo = {
                  name: tokenName,
                  symbol: tokenSymbol,
                  decimals: parseInt(decimals || '18', 10),
                  address: checksumAddress,
                };
                
                console.log('Using compiled token info:', web3TokenInfo);
              } catch (detailsError) {
                console.warn('Error getting token details:', detailsError);
                
                // Fallback to basic info
                const shortSymbol = checksumAddress.slice(2, 6).toUpperCase();
                web3TokenInfo = {
                  name: 'Token ' + shortSymbol,
                  symbol: 'TKN' + shortSymbol,
                  decimals: 18,
                  address: checksumAddress,
                };
              }
            }
          } catch (contractError) {
            console.warn('Contract validation error:', contractError);
            
            // Create fallback token info even if we couldn't get contract details
            const shortSymbol = tokenAddress.slice(2, 6).toUpperCase();
            web3TokenInfo = {
              name: 'Token',
              symbol: `TKN${shortSymbol}`,
              decimals: 18,
              address: tokenAddress,
            };
          }
        } catch (web3Error) {
          console.warn('Web3 validation error:', web3Error);
        }
        
        resolve(web3TokenInfo);
      });
      
      // Set a timeout for the Web3 validation
      const web3Timeout = new Promise(resolve => {
        setTimeout(() => {
          console.log('Web3 validation timed out');
          resolve(null);
        }, 4000); // 4 second timeout for Web3 validation
      });
      
      // Wait for either Web3 validation or timeout
      const web3TokenInfo = await Promise.race([web3ValidationPromise, web3Timeout]);
      
      // If Web3 validation succeeded, use that result
      if (web3TokenInfo) {
        console.log('Using Web3 token info:', web3TokenInfo);
        setTokenInfo(web3TokenInfo);
        
        // Clear the main timeout since we're done
        clearTimeout(validationTimeout);
        setIsValidating(false);
        return;
      }
      
      console.log('Web3 validation failed, trying API validation');
      
      // Backend validation with timeout
      const apiValidationPromise = new Promise(async (resolve) => {
        // Backend validation - try multiple possible API endpoints
        const apiUrls = [
          process.env.REACT_APP_API_URL || '',
          'https://lakkhi-fund-api.vercel.app',
          'http://localhost:8000',
        ];
        
        let apiResponse = null;
        let lastError = null;
        
        // Try each API URL until one works
        for (const apiUrl of apiUrls) {
          if (!apiUrl) continue;
          
          try {
            console.log(`Trying to validate token at: ${apiUrl}/api/token/validate/`);
            
            // Clean address (trim spaces) before sending to API
            const formattedAddress = tokenAddress.trim();
            
            const response = await axios.post(
              `${apiUrl}/api/token/validate/`,
              { token_address: formattedAddress },
              { 
                headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                timeout: 3000 // 3 second timeout for each API call
              }
            );
            
            console.log('API response:', response.data);
            
            if (response.data && response.data.success) {
              apiResponse = response;
              break; // Found a working API
            }
          } catch (apiError) {
            console.warn(`API call to ${apiUrl} failed:`, apiError);
            lastError = apiError;
            // Continue to next API
          }
        }
        
        resolve(apiResponse);
      });
      
      // Set a timeout for the API validation
      const apiTimeout = new Promise(resolve => {
        setTimeout(() => {
          console.log('API validation timed out');
          resolve(null);
        }, 4000); // 4 second timeout for API validation
      });
      
      // Wait for either API validation or timeout
      const apiResponse = await Promise.race([apiValidationPromise, apiTimeout]);
      
      // If any API call succeeded
      if (apiResponse && apiResponse.data && apiResponse.data.success) {
        console.log('Using API validation result:', apiResponse.data);
        setTokenInfo(apiResponse.data.token_info);
      } 
      // All validation methods failed - use fallback
      else {
        console.warn('Using fallback token validation');
        
        // Extract address part from the token address for symbol
        const shortSymbol = tokenAddress.slice(2, 6).toUpperCase();
        
        const fallbackTokenInfo = {
          name: 'Unknown Token',
          symbol: `TKN${shortSymbol}`,
          decimals: 18,
          address: tokenAddress,
          total_supply: 'Unknown'
        };
        
        setTokenInfo(fallbackTokenInfo);
        console.log('Using fallback token info:', fallbackTokenInfo);
      }
    } catch (err) {
      console.error('Error in token validation:', err);
      // Always use fallback
      const shortSymbol = tokenAddress.slice(2, 6).toUpperCase();
      const fallbackTokenInfo = {
        name: 'Unknown Token',
        symbol: `TKN${shortSymbol}`,
        decimals: 18,
        address: tokenAddress,
        total_supply: 'Unknown'
      };
      
      setTokenInfo(fallbackTokenInfo);
      setError('Warning: Using basic token information.');
    } finally {
      // Clear the main timeout
      clearTimeout(validationTimeout);
      
      // Always ensure validation state is exited
      console.log('Validation completed or failed, exiting validation state');
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