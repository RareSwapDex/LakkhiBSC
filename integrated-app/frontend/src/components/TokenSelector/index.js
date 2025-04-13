import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup, Badge, Card, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faSearch, faExchangeAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './styles.css';

// Popular tokens by chain
const POPULAR_TOKENS = {
  'BSC': [
    { address: '0x55d398326f99059fF775485246999027B3197955', name: 'USDT', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
    { address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', name: 'BUSD', logo: 'https://cryptologos.cc/logos/binance-usd-busd-logo.png' },
    { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', name: 'WBNB', logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png' },
  ],
  'Ethereum': [
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'USDT', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USDC', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', name: 'WETH', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  ],
  'Polygon': [
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', name: 'USDT', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', name: 'USDC', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
    { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', name: 'WMATIC', logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
  ]
};

const TokenSelector = ({ value, onChange, onValidate, onReset }) => {
  const [tokenAddress, setTokenAddress] = useState(value || '');
  const [validating, setValidating] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState('');
  const [selectedChain, setSelectedChain] = useState('BSC');
  const [showPopularTokens, setShowPopularTokens] = useState(false);
  const [marketData, setMarketData] = useState(null);
  
  // When external value changes, update internal state
  useEffect(() => {
    if (value !== tokenAddress) {
      setTokenAddress(value || '');
    }
  }, [value]);
  
  const validateToken = async () => {
    if (!tokenAddress.trim()) {
      setError('Please enter a token address');
      return;
    }
    
    setValidating(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/token/validate/`,
        { 
          token_address: tokenAddress,
          blockchain: selectedChain
        }
      );
      
      if (response.data.success) {
        const tokenData = response.data.token_info;
        setTokenInfo(tokenData);
        
        // If API provided a blockchain, update the selected chain
        if (tokenData.blockchain) {
          setSelectedChain(tokenData.blockchain);
        }
        
        // Fetch additional market data if available
        fetchMarketData(tokenData.symbol);
        
        // Call the onValidate callback if provided
        if (onValidate) {
          onValidate(tokenData);
        }
      } else {
        setError(response.data.message || 'Invalid token address');
        setTokenInfo(null);
      }
    } catch (err) {
      console.error('Error validating token:', err);
      setError(err.response?.data?.message || 'Failed to validate token');
      setTokenInfo(null);
    } finally {
      setValidating(false);
    }
  };
  
  const fetchMarketData = async (symbol) => {
    if (!symbol) return;
    
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${symbol.toLowerCase()}&order=market_cap_desc&per_page=1&page=1&sparkline=false`
      );
      
      if (response.data && response.data.length > 0) {
        setMarketData(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setMarketData(null);
    }
  };
  
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setTokenAddress(newValue);
    onChange(newValue);
    
    // Clear token info when input changes
    if (tokenInfo) {
      setTokenInfo(null);
      setMarketData(null);
    }
  };
  
  const handleSelectPopularToken = (token) => {
    setTokenAddress(token.address);
    onChange(token.address);
    setShowPopularTokens(false);
    
    // Automatically validate after selecting
    setTimeout(validateToken, 100);
  };
  
  const handleReset = () => {
    setTokenAddress('');
    setTokenInfo(null);
    setMarketData(null);
    setError('');
    
    onChange('');
    
    if (onReset) {
      onReset();
    }
  };
  
  return (
    <div className="token-selector mb-4">
      <Form.Group className="mb-3">
        <Form.Label>Token Address*</Form.Label>
        
        <InputGroup>
          <Form.Control
            type="text"
            value={tokenAddress}
            onChange={handleInputChange}
            placeholder="Enter the token contract address (0x...)"
            className={error ? 'is-invalid' : tokenInfo ? 'is-valid' : ''}
          />
          
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowPopularTokens(!showPopularTokens)}
            title="Show popular tokens"
          >
            <FontAwesomeIcon icon={faSearch} />
          </Button>
          
          <Button 
            variant="primary" 
            onClick={validateToken}
            disabled={validating || !tokenAddress.trim()}
          >
            {validating ? (
              <Spinner animation="border" size="sm" />
            ) : tokenInfo ? (
              <FontAwesomeIcon icon={faCheck} />
            ) : (
              'Validate'
            )}
          </Button>
        </InputGroup>
        
        {error && (
          <Form.Control.Feedback type="invalid" className="d-block">
            {error}
          </Form.Control.Feedback>
        )}
        
        <Form.Text className="text-muted">
          Enter the token contract address you want to use for fundraising.
        </Form.Text>
      </Form.Group>
      
      {showPopularTokens && (
        <Card className="mb-3 token-selector-popular">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              Popular Tokens
              <Badge bg="primary" className="ms-2">{selectedChain}</Badge>
            </div>
            <div>
              {Object.keys(POPULAR_TOKENS).map(chain => (
                <Badge 
                  key={chain}
                  bg={chain === selectedChain ? 'primary' : 'secondary'}
                  className="me-1 chain-badge"
                  onClick={() => setSelectedChain(chain)}
                  style={{ cursor: 'pointer' }}
                >
                  {chain}
                </Badge>
              ))}
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              {POPULAR_TOKENS[selectedChain].map(token => (
                <Col key={token.address} xs={12} sm={6} md={4}>
                  <div 
                    className="popular-token-item"
                    onClick={() => handleSelectPopularToken(token)}
                  >
                    <img 
                      src={token.logo} 
                      alt={token.name} 
                      className="token-logo"
                    />
                    <div className="token-info">
                      <div className="token-name">{token.name}</div>
                      <div className="token-address text-muted">
                        {token.address.substring(0, 6)}...{token.address.substring(token.address.length - 4)}
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}
      
      {tokenInfo && (
        <Card className="mb-3 token-info-card">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="token-validation-success">
                <FontAwesomeIcon icon={faCheck} className="me-2" />
                Token Validated
              </div>
              <Badge bg="primary" className="ms-2">{tokenInfo.blockchain || selectedChain}</Badge>
            </div>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleReset}
            >
              <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
              Change
            </Button>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col xs={12} md={6}>
                <h5>{tokenInfo.name} ({tokenInfo.symbol})</h5>
                <p className="mb-1">
                  <strong>Decimals:</strong> {tokenInfo.decimals}
                </p>
                <p className="mb-1">
                  <strong>Address:</strong> <code className="token-address-code">{tokenInfo.address}</code>
                </p>
                {tokenInfo.total_supply && (
                  <p className="mb-1">
                    <strong>Total Supply:</strong> {parseFloat(tokenInfo.total_supply).toLocaleString()}
                  </p>
                )}
              </Col>
              
              {marketData && (
                <Col xs={12} md={6}>
                  <div className="market-data">
                    <h6>Market Data <FontAwesomeIcon icon={faInfoCircle} /></h6>
                    <p className="mb-1">
                      <strong>Price:</strong> ${marketData.current_price?.toLocaleString() || 'N/A'}
                    </p>
                    <p className="mb-1">
                      <strong>Market Cap:</strong> ${marketData.market_cap?.toLocaleString() || 'N/A'}
                    </p>
                    <p className="mb-1">
                      <strong>24h Change:</strong> <span className={marketData.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'}>
                        {marketData.price_change_percentage_24h?.toFixed(2) || 0}%
                      </span>
                    </p>
                  </div>
                </Col>
              )}
            </Row>
            
            {tokenInfo.warnings && tokenInfo.warnings.length > 0 && (
              <Alert variant="warning" className="mt-3 mb-0">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                <strong>Note:</strong> {tokenInfo.warnings[0]}
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default TokenSelector; 