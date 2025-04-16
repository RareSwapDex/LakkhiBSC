import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import IncentiveCard from '../components/IncentiveCard';
import { FaEthereum } from 'react-icons/fa';
import { SiBinance } from 'react-icons/si';
import { BsCoin } from 'react-icons/bs';

// Explorer URL mapping
const EXPLORER_URLS = {
  'Ethereum': 'https://etherscan.io',
  'BSC': 'https://bscscan.com',
  'Base': 'https://basescan.org'
};

// Chain icons mapping
const ChainIcon = ({ chain }) => {
  switch(chain) {
    case 'Ethereum':
      return <FaEthereum className="me-2" />;
    case 'BSC':
      return <SiBinance className="me-2" />;
    case 'Base':
      return <BsCoin className="me-2" />;
    default:
      return null;
  }
};

const DonateProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [project, setProject] = useState(null);
  const [incentives, setIncentives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedIncentiveId, setSelectedIncentiveId] = useState(null);
  
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Check for success/failure query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get('success');
    const sessionId = queryParams.get('session_id');
    
    if (success && sessionId) {
      if (success === 'true') {
        // Payment was successful
        setPaymentSuccess(true);
        
        // Show success message for 3 seconds before redirecting
        setTimeout(() => {
          navigate(`/projects/${id}`);
        }, 3000);
      } else {
        // Payment was cancelled or failed
        setPaymentError('Your payment was not completed. Please try again.');
      }
    }
  }, [location, navigate, id]);
  
  // Fetch project details and incentives
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch project details
        const projectResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/${id}/`);
        setProject(projectResponse.data.project);
        
        // Fetch incentives
        const incentivesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/incentives/${id}/`);
        setIncentives(incentivesResponse.data.incentives);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [id]);
  
  // Get explorer URL for the current blockchain
  const getExplorerUrl = (address) => {
    const chain = project?.chain || 'BSC'; // Default to BSC if not specified
    const baseUrl = EXPLORER_URLS[chain] || EXPLORER_URLS.BSC;
    return `${baseUrl}/address/${address}`;
  };
  
  // Handle form submission for donation using Mercuryo
  const handleDonate = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setPaymentError('Email is required');
      return;
    }
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setPaymentError('Please enter a valid donation amount');
      return;
    }
    
    setProcessingPayment(true);
    setPaymentError(null);
    
    try {
      // Use the Mercuryo checkout endpoint directly
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/mercuryo/checkout_url/`, {
        contributionEmail: email,
        contributionAmount: parseFloat(amount),
        projectId: id,
        selectedIncentive: selectedIncentiveId,
        redirectURL: window.location.href,
        blockchain: project?.chain || 'BSC' // Send blockchain info for correct router selection
      });
      
      if (response.data.success && response.data.checkout_url) {
        // Redirect to Mercuryo's checkout page
        window.location.href = response.data.checkout_url;
      } else {
        setPaymentError(response.data.message || 'Payment processing failed');
        setProcessingPayment(false);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setPaymentError(err.response?.data?.message || 'An error occurred while processing your payment. Please try again.');
      setProcessingPayment(false);
    }
  };
  
  // Handle incentive selection
  const handleIncentiveSelect = (incentiveId) => {
    setSelectedIncentiveId(incentiveId);
    
    // Find the selected incentive and set the amount to match its price
    const incentive = incentives.find(i => i.id === incentiveId);
    if (incentive) {
      setAmount(incentive.price.toString());
    }
  };
  
  if (loading) {
    return <Container className="py-5 text-center"><p>Loading donation page...</p></Container>;
  }
  
  if (error) {
    return <Container className="py-5 text-center"><Alert variant="danger">{error}</Alert></Container>;
  }
  
  if (!project) {
    return <Container className="py-5 text-center"><Alert variant="warning">Project not found</Alert></Container>;
  }
  
  // If the project is not active, don't allow donations
  if (project.status !== 'active') {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          This campaign is not currently accepting donations
        </Alert>
        <Button 
          variant="primary" 
          onClick={() => navigate(`/projects/${id}`)}
          className="mt-3"
        >
          Back to Campaign
        </Button>
      </Container>
    );
  }
  
  // Determine which DEX router will be used
  const dexRouterName = project.chain === 'Ethereum' || project.chain === 'Base' 
    ? 'Uniswap' 
    : 'PancakeSwap';
  
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Support "{project.title}"</h1>
        
        {/* Blockchain Badge */}
        <Badge bg="info" className="p-2 d-inline-flex align-items-center">
          <ChainIcon chain={project.chain || 'BSC'} />
          Deployed on {project.chain || 'BSC'}
        </Badge>
      </div>
      
      {paymentSuccess ? (
        <Alert variant="success">
          <Alert.Heading>Thank you for your donation!</Alert.Heading>
          <p>Your donation has been processed successfully.</p>
          <p>You will be redirected back to the project page shortly.</p>
        </Alert>
      ) : (
        <Row>
          {/* Donation Form */}
          <Col md={6} className="mb-4">
            <Card>
              <Card.Header className="bg-primary text-white d-flex align-items-center">
                <h4 className="mb-0 me-auto">Make a Donation</h4>
                <ChainIcon chain={project.chain || 'BSC'} />
              </Card.Header>
              <Card.Body>
                {paymentError && (
                  <Alert variant="danger">{paymentError}</Alert>
                )}
                
                <Alert variant="info" className="mb-3">
                  <small>
                    Your donation will be converted to {project.token_symbol || 'tokens'} using {dexRouterName} and 
                    sent directly to the campaign's smart contract on the {project.chain || 'BSC'} blockchain.
                  </small>
                </Alert>
                
                <Form onSubmit={handleDonate}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Form.Text className="text-muted">
                      We'll create a wallet linked to this email.
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Donation Amount (USD)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min="1"
                      step="0.01"
                    />
                    <Form.Text className="text-muted">
                      Minimum donation amount is $1.00 USD
                    </Form.Text>
                  </Form.Group>
                  
                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={processingPayment}
                      size="lg"
                      className="py-2"
                    >
                      {processingPayment ? 'Processing...' : 'Donate by Card'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
              <Card.Footer>
                <small className="text-muted">
                  By donating, you agree to our <Link to="/terms">Terms of Service</Link>. 
                  A 3.5% processing fee will be applied to cover payment processor charges.
                </small>
              </Card.Footer>
            </Card>
            
            {/* Contract Information Card */}
            {project.contract_address && (
              <Card className="mt-3 border-info">
                <Card.Header className="bg-info text-white d-flex align-items-center">
                  <ChainIcon chain={project.chain || 'BSC'} />
                  <span>Contract Information</span>
                </Card.Header>
                <Card.Body>
                  <p className="mb-2">
                    <strong>Contract Address:</strong> <br />
                    <small>
                      <a 
                        href={getExplorerUrl(project.contract_address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-break"
                      >
                        {project.contract_address}
                      </a>
                    </small>
                  </p>
                  
                  {project.token_address && (
                    <p className="mb-0">
                      <strong>Token:</strong> <br />
                      <small>
                        {project.token_symbol || 'Custom Token'} 
                        <a 
                          href={getExplorerUrl(project.token_address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ms-2"
                        >
                          (View on Explorer)
                        </a>
                      </small>
                    </p>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
          
          {/* Incentives Panel */}
          <Col md={6}>
            <Card>
              <Card.Header className="bg-light">
                <h4 className="mb-0">Select a Reward (Optional)</h4>
              </Card.Header>
              <Card.Body>
                {incentives.length === 0 ? (
                  <p>No rewards available for this campaign.</p>
                ) : (
                  incentives.map(incentive => (
                    <IncentiveCard 
                      key={incentive.id}
                      incentive={incentive}
                      onSelect={handleIncentiveSelect}
                      isSelected={selectedIncentiveId === incentive.id}
                    />
                  ))
                )}
              </Card.Body>
            </Card>
            
            {/* Donation Process Card */}
            <Card className="mt-3">
              <Card.Header>How Donations Work</Card.Header>
              <Card.Body>
                <ol className="ps-3">
                  <li>Enter your email and donation amount above</li>
                  <li>You'll be redirected to our secure payment processor</li>
                  <li>Your funds will be converted to {project.token_symbol || 'tokens'} via {dexRouterName}</li>
                  <li>Tokens are sent directly to the campaign's smart contract</li>
                  <li>You'll receive a confirmation email with transaction details</li>
                </ol>
                <p className="mb-0 small">
                  <strong>Note:</strong> Card donations use {dexRouterName} on the {project.chain || 'BSC'} blockchain 
                  for token swaps. A small processing fee applies to cover exchange costs.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default DonateProjectPage; 