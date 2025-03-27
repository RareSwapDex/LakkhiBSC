import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TokenPriceDisplay.css';

const TokenPriceDisplay = () => {
  const [tokenData, setTokenData] = useState({
    price: null,
    change24h: null,
    loading: true,
    error: false
  });

  useEffect(() => {
    const fetchTokenPrice = async () => {
      try {
        // Try to fetch from Dexscreener API
        const response = await axios.get(
          'https://api.dexscreener.com/latest/dex/pairs/solana/DeahPCSdY8JY92jtc451xyjP6HgVg7ZUeapUuF7yrDc2'
        );
        
        if (response.data && response.data.pairs && response.data.pairs.length > 0) {
          const pair = response.data.pairs[0];
          setTokenData({
            price: parseFloat(pair.priceUsd),
            change24h: parseFloat(pair.priceChange.h24),
            loading: false,
            error: false
          });
        } else {
          // Fallback to a default value if the API doesn't return expected data
          setTokenData({
            price: 0.0000015,  // Example fallback price
            change24h: 5.2,     // Example fallback change
            loading: false,
            error: false
          });
        }
      } catch (error) {
        console.error("Failed to fetch token price:", error);
        // Fallback to a default value on error
        setTokenData({
          price: 0.0000015,  // Example fallback price
          change24h: 5.2,     // Example fallback change
          loading: false,
          error: true
        });
      }
    };

    fetchTokenPrice();
    
    // Set up interval to refresh price every 60 seconds
    const interval = setInterval(fetchTokenPrice, 60000);
    
    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    if (price === null) return 'Loading...';
    
    // For very small prices (like most new tokens)
    if (price < 0.00001) {
      return '$' + price.toExponential(4);
    }
    
    return '$' + price.toFixed(price < 0.01 ? 6 : 4);
  };

  const getPriceChangeClass = () => {
    if (tokenData.change24h === null) return '';
    return tokenData.change24h >= 0 ? 'price-up' : 'price-down';
  };

  return (
    <div className="token-price-display">
      <div className="token-info">
        <div className="token-logo">
          <img src="/images/lakkhi-token-logo.png" alt="LAKKHI" onError={(e) => {e.target.src = '/images/placeholder-token.png'}} />
        </div>
        <div className="token-name">$LAKKHI</div>
      </div>
      
      <div className="token-price-container">
        <div className="token-price">{formatPrice(tokenData.price)}</div>
        {tokenData.change24h !== null && (
          <div className={`token-price-change ${getPriceChangeClass()}`}>
            {tokenData.change24h >= 0 ? '+' : ''}{tokenData.change24h.toFixed(2)}%
          </div>
        )}
      </div>
      
      <a 
        href="https://raydium.io/swap/?inputMint=sol&outputMint=97WQm8aUu2gprFzEYfGmdJ7wcF4NSDPgvn3hvbDHpump" 
        target="_blank" 
        rel="noopener noreferrer"
        className="buy-token-button"
      >
        Buy $LAKKHI
      </a>
    </div>
  );
};

export default TokenPriceDisplay; 