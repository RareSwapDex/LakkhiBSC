import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ProviderContext } from '../web3/ProviderContext';
import * as projectService from '../services/projectService';
import { notification } from 'antd';

const DonateProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { account, isConnected, connectWallet, donateToProject } = useContext(ProviderContext);
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [donationType, setDonationType] = useState('usd'); // 'usd' or 'token'
  
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const [tokenData, setTokenData] = useState(null);
  
  // Show notification for successful/failed payment
  const openNotification = (type, title, message) => {
    notification[type]({
      message: title,
      description: message,
      placement: 'topRight',
      duration: 5,
    });
  };

  // Check for payment status in URL
  useEffect(() => {
    if (searchParams.get('payment_status') === 'success') {
      openNotification('success', 'Payment Successful', 'Your contribution was successfully processed!');
    } else if (searchParams.get('payment_status') === 'failed') {
      openNotification('error', 'Payment Failed', 'There was an issue processing your contribution. Please try again.');
    }
  }, [searchParams]);
  
  // Fetch project details
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Fetch project details
        const projectResponse = await projectService.getProjectById(id);
        
        if (projectResponse.success) {
          setProject(projectResponse.project);
          
          // Fetch token data if available
          if (projectResponse.project.token_address) {
            const tokenResponse = await projectService.getTokenPrice(projectResponse.project.token_address);
            if (tokenResponse.success) {
              setTokenData({
                address: projectResponse.project.token_address,
                price: tokenResponse.price,
                symbol: projectResponse.project.token_symbol || 'TOKEN'
              });
            }
          }
        } else {
          setError(projectResponse.message || 'Failed to load project details');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [id]);
  
  // Format USD and token values
  const formatCurrency = (amount, decimals = 2) => {
    if (!amount) return '0.00';
    return parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Calculate equivalent amount
  const calculateEquivalent = () => {
    if (!amount || !tokenData?.price) return null;
    
    if (donationType === 'usd') {
      // Calculate token amount from USD
      const tokenAmount = parseFloat(amount) / parseFloat(tokenData.price);
      return `${formatCurrency(tokenAmount, 6)} ${tokenData.symbol}`;
    } else {
      // Calculate USD amount from token
      const usdAmount = parseFloat(amount) * parseFloat(tokenData.price);
      return `$${formatCurrency(usdAmount)} USD`;
    }
  };
  
  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setAmount(value);
    }
  };
  
  // Toggle between USD and token input
  const toggleDonationType = () => {
    setDonationType(donationType === 'usd' ? 'token' : 'usd');
    setAmount(''); // Clear amount when switching
  };
  
  // Handle donation submission
  const handleDonate = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setPaymentError('Please connect your wallet to donate');
      return;
    }
    
    if (!email.trim()) {
      setPaymentError('Email is required for notifications');
      return;
    }
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setPaymentError('Please enter a valid amount');
      return;
    }
    
    setProcessingPayment(true);
    setPaymentError(null);
    
    try {
      let tokenAmount, usdAmount;
      
      if (donationType === 'usd') {
        usdAmount = parseFloat(amount);
        tokenAmount = usdAmount / parseFloat(tokenData.price);
      } else {
        tokenAmount = parseFloat(amount);
        usdAmount = tokenAmount * parseFloat(tokenData.price);
      }
      
      if (project.staking_address && tokenData?.address) {
        // Use blockchain to donate
        const result = await donateToProject(
          project.staking_address,
          tokenData.address,
          tokenAmount.toString()
        );
        
        if (result && result.success) {
          // Record the donation in backend
          await axios.post(`${process.env.REACT_APP_API_URL || ''}/api/projects/${id}/donate/`, {
            email,
            usd_amount: usdAmount,
            token_amount: tokenAmount,
            token_address: tokenData.address,
            transaction_hash: result.txHash,
            wallet_address: account
          });
          
          setPaymentSuccess(true);
          openNotification('success', 'Donation Successful', `Thank you for supporting this project with ${formatCurrency(tokenAmount, 6)} ${tokenData.symbol}!`);
          
          setTimeout(() => {
            navigate(`/projects/${id}`);
          }, 3000);
        } else {
          setPaymentError(result?.message || 'Transaction failed');
          openNotification('error', 'Donation Failed', result?.message || 'Transaction failed. Please try again.');
        }
      } else {
        // Use traditional payment method
        const response = await axios.post(`${process.env.REACT_APP_API_URL || ''}/api/payment/process/`, {
          email,
          amount: usdAmount,
          project_id: id,
          wallet_address: account || ''
        });
        
        if (response.data && response.data.success) {
          setPaymentSuccess(true);
          
          if (response.data.checkout_url) {
            window.location.href = response.data.checkout_url;
          } else {
            openNotification('success', 'Donation Successful', 'Thank you for your contribution!');
            setTimeout(() => {
              navigate(`/projects/${id}`);
            }, 3000);
          }
        } else {
          setPaymentError(response.data?.message || 'Payment processing failed');
          openNotification('error', 'Donation Failed', 'Payment processing failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error processing donation:', err);
      setPaymentError(err.response?.data?.message || 'An error occurred while processing your donation.');
      openNotification('error', 'Donation Failed', 'An error occurred while processing your donation.');
    } finally {
      setProcessingPayment(false);
    }
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading project details...</span>
        </Spinner>
        <p className="mt-3">Loading project details...</p>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  
  if (!project) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Project not found</Alert>
      </Container>
    );
  }
  
  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <h1 className="text-center mb-4">Support {project.title}</h1>
          
          {/* Project Summary */}
          <Card className="mb-4 border-primary">
            <Card.Body>
              <Card.Title>Project Summary</Card.Title>
              <Row>
                <Col md={7}>
                  <p>{project.description?.substring(0, 150)}...</p>
                </Col>
                <Col md={5} className="text-md-end">
                  <p className="mb-1">
                    <strong>Goal:</strong> ${formatCurrency(project.fund_amount)} {project.currency || 'USD'}
                  </p>
                  {tokenData && (
                    <p className="mb-1">
                      <strong>Goal in {tokenData.symbol}:</strong> {formatCurrency(Number(project.fund_amount) / Number(tokenData.price), 6)}
                    </p>
                  )}
                  <p className="mb-1">
                    <strong>Progress:</strong> {project.fund_percentage || 0}%
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {/* Donation Form */}
          <Card className="mb-4 shadow">
            <Card.Header style={{ background: 'linear-gradient(to right, #6c7fdd 0%, #cd77d3 54.09%, #e4bad0 100%)', color: 'white' }}>
              <h4 className="mb-0">Donation Details</h4>
            </Card.Header>
            <Card.Body>
              {paymentSuccess ? (
                <Alert variant="success">
                  <Alert.Heading>Thank you for your donation!</Alert.Heading>
                  <p>Your contribution is greatly appreciated. You'll be redirected to the project page shortly...</p>
                </Alert>
              ) : (
                <Form onSubmit={handleDonate}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email for receipt"
                      required
                    />
                    <Form.Text className="text-muted">
                      We'll send you updates about this project's progress.
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Donation Amount</Form.Label>
                    <InputGroup>
                      {donationType === 'usd' && (
                        <InputGroup.Text>$</InputGroup.Text>
                      )}
                      <Form.Control
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder={donationType === 'usd' ? "Amount in USD" : `Amount in ${tokenData?.symbol || 'tokens'}`}
                        required
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={toggleDonationType}
                        disabled={!tokenData}
                      >
                        {donationType === 'usd' ? (tokenData?.symbol || 'TOKEN') : 'USD'}
                      </Button>
                    </InputGroup>
                    
                    {amount && tokenData && (
                      <Form.Text className="text-muted">
                        Equivalent: {calculateEquivalent()}
                      </Form.Text>
                    )}
                  </Form.Group>
                  
                  {tokenData && (
                    <Alert variant="info" className="mb-3">
                      <small>
                        <strong>Token Information</strong><br />
                        Token: {tokenData.symbol}<br />
                        Current Price: ${formatCurrency(tokenData.price)} USD
                      </small>
                    </Alert>
                  )}
                  
                  {paymentError && (
                    <Alert variant="danger" className="mb-3">
                      {paymentError}
                    </Alert>
                  )}
                  
                  {!isConnected ? (
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="w-100" 
                      onClick={connectWallet}
                    >
                      Connect Wallet to Donate
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg" 
                      className="w-100" 
                      disabled={processingPayment}
                      style={{
                        background: "linear-gradient(to right, #6c7fdd 0%, #cd77d3 54.09%, #e4bad0 100%)",
                        border: "none"
                      }}
                    >
                      {processingPayment ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Processing...
                        </>
                      ) : (
                        `Donate ${donationType === 'usd' ? 
                          `$${amount || '0'} ${project.currency || 'USD'}` : 
                          `${amount || '0'} ${tokenData?.symbol || 'tokens'}`
                        }`
                      )}
                    </Button>
                  )}
                </Form>
              )}
            </Card.Body>
          </Card>
          
          {/* Additional Information */}
          <Card className="shadow">
            <Card.Body>
              <Card.Title>About This Donation</Card.Title>
              <Card.Text>
                Your donation will be directly transferred to the project's smart contract on the blockchain.
                The funds will be released to the project creator when funding goals are met.
              </Card.Text>
              
              <Alert variant="secondary">
                <small>
                  <strong>Note:</strong> You'll need to approve two transactions in your wallet:<br />
                  1. First to approve the token transfer<br />
                  2. Then to complete the donation
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DonateProjectPage; 