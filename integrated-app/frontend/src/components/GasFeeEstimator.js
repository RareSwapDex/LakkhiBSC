import React, { useState, useEffect } from 'react';
import { Card, Badge, ProgressBar, Spinner, Button } from 'react-bootstrap';
import axios from 'axios';

/**
 * GasFeeEstimator component for displaying estimated gas fees for blockchain operations
 * 
 * @param {string} tokenAddress - Address of the token being used for the transaction
 * @param {string} operationType - Type of operation (deploy, stake, approve, etc.)
 * @param {number} amount - Amount of tokens involved in the transaction (if applicable)
 * @param {function} onConfirm - Callback when user confirms the transaction
 * @returns {JSX.Element} GasFeeEstimator component
 */
const GasFeeEstimator = ({ tokenAddress, operationType, amount, onConfirm }) => {
  const [loading, setLoading] = useState(true);
  const [gasInfo, setGasInfo] = useState(null);
  const [error, setError] = useState(null);
  const [networkCongestion, setNetworkCongestion] = useState('normal'); // low, normal, high
  
  // Fetch gas estimates from an API endpoint
  useEffect(() => {
    const fetchGasEstimates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // This would typically call your backend gas estimation endpoint
        // For demo purposes, we'll create some mock data based on the operation type
        
        // In a real implementation, you would make an API call like:
        // const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/estimate_gas/`, {
        //   token_address: tokenAddress,
        //   operation_type: operationType,
        //   amount: amount
        // });
        // const data = response.data;
        
        // Mock data for different operation types
        let mockEstimate;
        switch (operationType) {
          case 'deploy_contract':
            mockEstimate = {
              gas_amount: 3000000,
              cost_usd: 12.50,
              is_complex_token: false,
              time_estimate: '2-5 minutes'
            };
            break;
          case 'stake':
            mockEstimate = {
              gas_amount: 210000, // Approve + stake
              cost_usd: 3.25,
              is_complex_token: false,
              time_estimate: '30-60 seconds'
            };
            break;
          case 'approve':
            mockEstimate = {
              gas_amount: 60000,
              cost_usd: 0.95,
              is_complex_token: false,
              time_estimate: '15-30 seconds'
            };
            break;
          default:
            mockEstimate = {
              gas_amount: 100000,
              cost_usd: 1.50,
              is_complex_token: false,
              time_estimate: '30-60 seconds'
            };
        }
        
        // Simulate complexity effect for certain tokens
        if (tokenAddress && 
            (tokenAddress === '0x8f8dd7db1bda5ed3da8c9daf3bfa471c12d58486' || // Imaginary reflection token
             tokenAddress === '0x23396cf899ca06c4472205fc903bdb4de249d6fc')) { // Imaginary fee token
          mockEstimate.is_complex_token = true;
          mockEstimate.gas_amount *= 1.5;
          mockEstimate.cost_usd *= 1.5;
        }
        
        // Set mock network congestion
        const randomFactor = Math.random();
        if (randomFactor < 0.2) {
          setNetworkCongestion('low');
          mockEstimate.cost_usd *= 0.8;
        } else if (randomFactor > 0.8) {
          setNetworkCongestion('high');
          mockEstimate.cost_usd *= 1.2;
        } else {
          setNetworkCongestion('normal');
        }
        
        setGasInfo(mockEstimate);
      } catch (err) {
        console.error("Error fetching gas estimates:", err);
        setError("Failed to get fee estimates");
      } finally {
        setLoading(false);
      }
    };
    
    fetchGasEstimates();
  }, [tokenAddress, operationType, amount]);
  
  // Get the appropriate badge color for network congestion
  const getCongestionBadge = () => {
    switch (networkCongestion) {
      case 'low':
        return 'success';
      case 'normal':
        return 'info';
      case 'high':
        return 'warning';
      default:
        return 'secondary';
    }
  };
  
  // Get fee assessment text based on USD amount
  const getFeeAssessment = (usdAmount) => {
    if (!usdAmount) return '';
    
    if (usdAmount < 1) {
      return 'Very low fees';
    } else if (usdAmount < 3) {
      return 'Low fees';
    } else if (usdAmount < 8) {
      return 'Moderate fees';
    } else if (usdAmount < 15) {
      return 'High fees';
    } else {
      return 'Very high fees';
    }
  };
  
  return (
    <Card className="mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <strong>Gas Fee Estimate</strong>
        </div>
        <Badge bg={getCongestionBadge()}>
          {networkCongestion === 'low' && 'Low Congestion'}
          {networkCongestion === 'normal' && 'Normal Network Traffic'}
          {networkCongestion === 'high' && 'High Network Congestion'}
        </Badge>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Calculating fees...</span>
          </div>
        ) : error ? (
          <div className="text-danger">{error}</div>
        ) : (
          <>
            <div className="d-flex justify-content-between mb-2">
              <div>Estimated Transaction Fee:</div>
              <div className="fw-bold">${gasInfo.cost_usd.toFixed(2)} USD</div>
            </div>
            
            <div className="d-flex justify-content-between mb-3">
              <div>Estimated Confirmation Time:</div>
              <div>{gasInfo.time_estimate}</div>
            </div>
            
            {gasInfo.is_complex_token && (
              <div className="alert alert-warning py-2 mb-3">
                <small>
                  <strong>Note:</strong> This token has complex mechanics that require higher gas fees.
                </small>
              </div>
            )}
            
            <div className="mb-2 small text-muted">
              {getFeeAssessment(gasInfo.cost_usd)}
            </div>
            
            <Button 
              variant="primary" 
              className="w-100 mt-2"
              onClick={() => onConfirm && onConfirm(gasInfo)}
            >
              Confirm Transaction
            </Button>
          </>
        )}
      </Card.Body>
      <Card.Footer className="bg-white py-2">
        <small className="text-muted">
          Fees shown are estimates and may vary based on network conditions at time of transaction.
        </small>
      </Card.Footer>
    </Card>
  );
};

export default GasFeeEstimator; 