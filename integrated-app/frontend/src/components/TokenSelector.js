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

      // Define RPC endpoints for different blockchains
      const blockchainRpcs = {
        BSC: [
          'https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3',
          'https://rpc.ankr.com/bsc',
          'https://binance.nodereal.io',
          'https://bsc-mainnet.public.blastapi.io',
          'https://bsc-dataseed1.defibit.io/'
        ],
        Ethereum: [
          'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Public Infura endpoint
          'https://ethereum.publicnode.com',
          'https://rpc.ankr.com/eth',
          'https://eth-mainnet.public.blastapi.io'
        ],
        Base: [
          'https://mainnet.base.org',
          'https://base-mainnet.public.blastapi.io',
          'https://base.blockpi.network/v1/rpc/public'
        ]
      };
      
      // Try the blockchains in preferred order
      const chainOrder = ['BSC', 'Ethereum', 'Base'];
      let detectedChain = null;
      let web3 = null;
      let checksumAddress = null;
      let tokenContractCode = null;
      
      // First try using the connected wallet's provider if available
      if (window.ethereum) {
        try {
            web3 = new Web3(window.ethereum);
          await web3.eth.net.isListening();
          
          // Try to get the address and code using wallet provider
          checksumAddress = web3.utils.toChecksumAddress(tokenAddress);
          tokenContractCode = await web3.eth.getCode(checksumAddress);
          
          if (tokenContractCode && tokenContractCode !== '0x' && tokenContractCode !== '0x0') {
            // Determine which network the wallet is connected to
            const chainId = await web3.eth.getChainId();
            
            // Map chainId to our chains
            if (chainId === 56) {
              detectedChain = 'BSC';
            } else if (chainId === 1) {
              detectedChain = 'Ethereum';
            } else if (chainId === 8453) {
              detectedChain = 'Base';
          } else {
              // Default to BSC if we can't determine
              detectedChain = 'BSC';
            }
            
            console.log(`Using wallet connection - detected chain: ${detectedChain}`);
          }
        } catch (walletError) {
          console.warn('Wallet connection failed, will try RPC endpoints:', walletError);
          web3 = null;
        }
      }
      
      // If wallet check didn't give us a result, try each chain's RPC endpoints
      if (!detectedChain) {
        for (const chain of chainOrder) {
          const rpcUrls = blockchainRpcs[chain];
          
          for (const rpcUrl of rpcUrls) {
            try {
              const tempWeb3 = new Web3(new Web3.providers.HttpProvider(rpcUrl, {
                timeout: 5000,
                headers: [{ name: 'Access-Control-Allow-Origin', value: '*' }]
              }));
              
              await tempWeb3.eth.net.isListening();
              
              const tempChecksumAddress = tempWeb3.utils.toChecksumAddress(tokenAddress);
              const code = await tempWeb3.eth.getCode(tempChecksumAddress);
              
              if (code && code !== '0x' && code !== '0x0') {
                web3 = tempWeb3;
                checksumAddress = tempChecksumAddress;
                tokenContractCode = code;
                detectedChain = chain;
                console.log(`Contract found on ${chain} using ${rpcUrl}`);
                break;
              }
            } catch (error) {
              console.warn(`Failed to check token on ${chain} using ${rpcUrl}:`, error);
            }
          }
          
          if (detectedChain) break;
        }
      }
      
      // If we still couldn't detect the chain, default to BSC
      if (!detectedChain) {
        detectedChain = 'BSC';
        console.log('Could not detect chain, defaulting to BSC');
      }
      
      if (!web3 || !checksumAddress || !tokenContractCode || tokenContractCode === '0x' || tokenContractCode === '0x0') {
        throw new Error('Unable to validate token. Please check the address and try again.');
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
        // Include the detected blockchain in the token info
        const tokenDetails = {
          name: name,
          symbol: symbol,
          decimals: parseInt(decimals || '18', 10),
          address: checksumAddress,
          blockchain: detectedChain  // Add the blockchain info
        };
        
        setTokenInfo(tokenDetails);
        setValidated(true);
        
        // Call the onValidate callback if provided
        if (onValidate) {
          onValidate(tokenDetails);
        }
      } else {
        throw new Error('Could not retrieve token information. This may not be a standard token.');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      setError(error.message || 'Failed to validate token');
      setTokenInfo(null);
      setValidated(false);
      
      // Call onValidate with null to indicate failure
      if (onValidate) {
        onValidate(null);
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
            <strong>Decimals:</strong> {tokenInfo.decimals}<br />
            <strong>Blockchain:</strong> {tokenInfo.blockchain || 'BSC'}
          </p>
        </Alert>
      )}
    </Form.Group>
  );
};

export default TokenSelector; 