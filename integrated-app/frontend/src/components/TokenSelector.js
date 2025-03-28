import React, { useState } from 'react';
import { useProvider } from '../web3/ProviderContext';

/**
 * TokenSelector component for selecting tokens from a list of popular options or entering a custom address
 * 
 * @param {string} value - Current token address value
 * @param {function} onTokenSelect - Function to call when token is selected
 * @returns {JSX.Element} TokenSelector component
 */
const TokenSelector = ({ onTokenSelect }) => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { web3, chainId, validateNetworkCompatibility } = useProvider();

  const validateToken = async () => {
    if (!tokenAddress) {
      setError('Please enter a token address');
      return;
    }

    setIsLoading(true);
    setError('');
    setTokenInfo(null);

    try {
      // First validate the token contract exists and get its chain
      const response = await fetch('/api/token/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token_address: tokenAddress })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Invalid token address');
        setIsLoading(false);
        return;
      }

      // Check network compatibility
      const networkValidation = validateNetworkCompatibility(data.token_info.chainId);
      if (!networkValidation.isValid) {
        setError(networkValidation.message);
        setIsLoading(false);
        return;
      }

      // If we get here, token is valid and on the correct network
      setTokenInfo(data.token_info);
      onTokenSelect(tokenAddress, data.token_info);
    } catch (error) {
      console.error('Error validating token:', error);
      setError('Error validating token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="token-selector">
      <div className="input-group">
        <input
          type="text"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="Enter token contract address"
          className={error ? 'error' : ''}
        />
        <button 
          onClick={validateToken}
          disabled={isLoading}
        >
          {isLoading ? 'Validating...' : 'Validate Token'}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {tokenInfo && (
        <div className="token-info">
          <h4>Token Information</h4>
          <p>Name: {tokenInfo.name}</p>
          <p>Symbol: {tokenInfo.symbol}</p>
          <p>Decimals: {tokenInfo.decimals}</p>
          <p>Network: {tokenInfo.network}</p>
        </div>
      )}
    </div>
  );
};

export default TokenSelector; 