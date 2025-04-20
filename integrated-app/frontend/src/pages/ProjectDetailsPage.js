import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Badge, Alert, Form } from 'react-bootstrap';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import IncentiveCard from '../components/IncentiveCard';
import { useProvider } from '../web3/ProviderContext';
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

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { account, isConnected, connectWallet, donateToProject, isInitialized } = useProvider();
  
  const [project, setProject] = useState(null);
  const [incentives, setIncentives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Card donation states
  const [showCardDonation, setShowCardDonation] = useState(false);
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedIncentiveId, setSelectedIncentiveId] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Token donation states
  const [tokenDonationAmount, setTokenDonationAmount] = useState('');
  const [tokenDonationError, setTokenDonationError] = useState(null);
  const [showTokenDonation, setShowTokenDonation] = useState(false);
  const [tokenDonationProcessing, setTokenDonationProcessing] = useState(false);
  const [tokenDonationSuccess, setTokenDonationSuccess] = useState(false);
  
  // Check if user has MetaMask installed
  const hasMetaMask = typeof window !== 'undefined' && window.ethereum;
  
  // Check for success/failure query parameters from Mercuryo
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get('success');
    const sessionId = queryParams.get('session_id');
    
    if (success && sessionId) {
      if (success === 'true') {
        // Payment was successful
        setPaymentSuccess(true);
        
        // Clear form after success
        setTimeout(() => {
          setPaymentSuccess(false);
          setShowCardDonation(false);
          setEmail('');
          setAmount('');
          setSelectedIncentiveId(null);
          
          // Reload project data to get updated stats
          fetchProjectData();
        }, 5000);
      } else {
        // Payment was cancelled or failed
        setPaymentError('Your payment was not completed. Please try again.');
      }
    }
  }, [location]);
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setShowTokenDonation(true);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    }
  };
  
  // Handle token donation
  const handleTokenDonation = async (e) => {
    e.preventDefault();
    
    if (!tokenDonationAmount || isNaN(tokenDonationAmount) || parseFloat(tokenDonationAmount) <= 0) {
      setTokenDonationError('Please enter a valid donation amount');
      return;
    }
    
    setTokenDonationProcessing(true);
    setTokenDonationError(null);
    
    try {
      const result = await donateToProject(project.contract_address, tokenDonationAmount);
      
      if (result.success) {
        setTokenDonationSuccess(true);
        setTokenDonationAmount('');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setTokenDonationSuccess(false);
          setShowTokenDonation(false);
          
          // Reload project data to get updated stats
          fetchProjectData();
        }, 5000);
      }
    } catch (err) {
      console.error('Error making token donation:', err);
      setTokenDonationError(err.message || 'Failed to process donation. Please try again.');
    } finally {
      setTokenDonationProcessing(false);
    }
  };
  
  // Handle card donation via Mercuryo
  const handleCardDonation = async (e) => {
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
      // Use the Mercuryo checkout endpoint
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/mercuryo/checkout_url/`, {
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
  
  // Get explorer URL for the current blockchain
  const getExplorerUrl = (address) => {
    const chain = project?.chain || 'BSC'; // Default to BSC if not specified
    const baseUrl = EXPLORER_URLS[chain] || EXPLORER_URLS.BSC;
    return `${baseUrl}/address/${address}`;
  };
  
  const fetchProjectData = async () => {
    try {
      // Fetch project details
      const projectResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/projects/${id}/`);
      
      if (projectResponse.data.project) {
        setProject(projectResponse.data.project);
      } else {
        setProject(projectResponse.data);
      }
      
      // Fetch incentives
      const incentivesResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/incentives/${id}/`);
      setIncentives(incentivesResponse.data.incentives);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching project data:', err);
      setError('Failed to load project details. Please try again later.');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProjectData();
  }, [id]);
  
  if (loading) {
    return <Container className="py-5 text-center"><p>Loading project details...</p></Container>;
  }
  
  if (error) {
    return <Container className="py-5 text-center"><Alert variant="danger">{error}</Alert></Container>;
  }
  
  if (!project) {
    return <Container className="py-5 text-center"><Alert variant="warning">Project not found</Alert></Container>;
  }
  
  // Calculate funding progress
  const progressPercentage = 
    project.fund_amount > 0 
      ? Math.min(100, (project.raised_amount / project.fund_amount) * 100) 
      : 0;
  
  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Determine which DEX router will be used
  const dexRouterName = (project.chain === 'Ethereum' || project.chain === 'Base') 
    ? 'Uniswap' 
    : 'PancakeSwap';
  
  return (
    <Container className="py-4">
      {/* Project Header */}
      <Card className="mb-4">
        <Row className="g-0">
          <Col md={4}>
            <img 
              src={project.thumbnail || 'https://via.placeholder.com/400x300'} 
              alt={project.title}
              className="img-fluid rounded-start"
              style={{ height: '100%', objectFit: 'cover' }}
            />
          </Col>
          <Col md={8}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <Card.Title as="h1">{project.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    by {project.owner_username}
                  </Card.Subtitle>
                </div>
                
                <div className="d-flex">
                  {project.chain && (
                    <Badge bg="info" className="me-2 p-2 d-inline-flex align-items-center">
                      <ChainIcon chain={project.chain} />
                      {project.chain}
                    </Badge>
                  )}
                  
                  {project.category && (
                    <Badge bg="secondary">{project.category}</Badge>
                  )}
                </div>
              </div>
              
              <Card.Text>{project.head}</Card.Text>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong>${project.raised_amount.toFixed(2)} raised of ${project.fund_amount.toFixed(2)}</strong>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </div>
                <ProgressBar 
                  now={progressPercentage} 
                  variant={progressPercentage >= 100 ? "success" : "primary"}
                />
              </div>
              
              <div className="d-flex flex-wrap justify-content-between">
                <div className="mb-2 me-3">
                  <small className="text-muted d-block">Supporters</small>
                  <strong>{project.number_of_donators || 0}</strong>
                </div>
                <div className="mb-2 me-3">
                  <small className="text-muted d-block">Followers</small>
                  <strong>{project.number_of_subscribed_users || 0}</strong>
                </div>
                <div className="mb-2">
                  <small className="text-muted d-block">Status</small>
                  <Badge bg={project.live ? "success" : "secondary"}>
                    {project.live ? "Live" : "Not Live"}
                  </Badge>
                </div>
              </div>
              
              {project.live && (
                <div className="d-grid gap-2 mt-3">
                  <Button 
                    onClick={() => setShowCardDonation(!showCardDonation)}
                    variant="primary"
                  >
                    <i className="bi bi-credit-card me-1"></i> Donate with Card
                  </Button>
                  
                  <Button 
                    onClick={handleConnectWallet}
                    variant="outline-primary"
                    disabled={!hasMetaMask}
                  >
                    <i className="bi bi-wallet2 me-1"></i> Donate with {project.token_symbol || 'Token'}
                  </Button>
                </div>
              )}
              
              {!project.live && (
                <div className="mt-3">
                  <Alert variant="secondary">
                    <Alert.Heading>Campaign Not Active</Alert.Heading>
                    <p>
                      This campaign is currently not accepting contributions.
                    </p>
                  </Alert>
                  <div className="d-grid gap-2 mt-2">
                    <Button 
                      variant="secondary"
                      disabled
                    >
                      Campaign Unavailable
                    </Button>
                  </div>
                </div>
              )}

              {/* Card Donation Form */}
              {showCardDonation && project.live && (
                <Card className="mt-4">
                  <Card.Header className="bg-primary text-white d-flex align-items-center">
                    <h4 className="mb-0 me-auto">Donate with Card</h4>
                    <ChainIcon chain={project.chain || 'BSC'} />
                  </Card.Header>
                  <Card.Body>
                    {paymentSuccess ? (
                      <Alert variant="success">
                        <Alert.Heading>Thank you for your donation!</Alert.Heading>
                        <p>Your donation has been processed successfully.</p>
                      </Alert>
                    ) : (
                      <>
                        {paymentError && (
                          <Alert variant="danger">{paymentError}</Alert>
                        )}
                        
                        <Alert variant="info" className="mb-3">
                          <small>
                            Your donation will be converted to {project.token_symbol || 'tokens'} using {dexRouterName} and 
                            sent directly to the campaign's smart contract on the {project.chain || 'BSC'} blockchain.
                          </small>
                        </Alert>
                        
                        <Form onSubmit={handleCardDonation}>
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
                              className="py-2"
                            >
                              {processingPayment ? 'Processing...' : 'Donate by Card'}
                            </Button>
                            <Button 
                              variant="outline-secondary" 
                              onClick={() => setShowCardDonation(false)}
                              className="py-2"
                            >
                              Cancel
                            </Button>
                          </div>
                        </Form>
                      </>
                    )}
                  </Card.Body>
                  <Card.Footer>
                    <small className="text-muted">
                      By donating, you agree to our <Link to="/terms">Terms of Service</Link>. 
                      A 3.5% processing fee will be applied to cover payment processor charges.
                    </small>
                  </Card.Footer>
                </Card>
              )}
              
              {/* Token Donation Form */}
              {showTokenDonation && project.live && (
                <Card className="mt-4">
                  <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">Donate with {project.token_symbol || 'Token'}</h4>
                  </Card.Header>
                  <Card.Body>
                    {tokenDonationSuccess ? (
                      <Alert variant="success">
                        <Alert.Heading>Thank you for your donation!</Alert.Heading>
                        <p>Your token donation has been processed successfully.</p>
                      </Alert>
                    ) : (
                      <>
                        {tokenDonationError && (
                          <Alert variant="danger">{tokenDonationError}</Alert>
                        )}
                        
                        {isConnected ? (
                          <>
                            <Alert variant="info" className="mb-3">
                              <small>Connected Wallet: {account}</small>
                            </Alert>
                            
                            <Form onSubmit={handleTokenDonation}>
                              <Form.Group className="mb-3">
                                <Form.Label>Donation Amount ({project.token_symbol || 'Tokens'})</Form.Label>
                                <Form.Control
                                  type="number"
                                  placeholder="Enter token amount"
                                  value={tokenDonationAmount}
                                  onChange={(e) => setTokenDonationAmount(e.target.value)}
                                  required
                                  min="0.000001"
                                  step="0.000001"
                                />
                              </Form.Group>
                              
                              <div className="d-grid gap-2">
                                <Button 
                                  variant="primary" 
                                  type="submit"
                                  disabled={tokenDonationProcessing}
                                  className="py-2"
                                >
                                  {tokenDonationProcessing ? 'Processing...' : `Donate ${project.token_symbol || 'Tokens'}`}
                                </Button>
                                <Button 
                                  variant="outline-secondary" 
                                  onClick={() => setShowTokenDonation(false)}
                                  className="py-2"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </Form>
                          </>
                        ) : (
                          <div className="text-center py-3">
                            <p>Please connect your wallet to donate tokens.</p>
                            <Button
                              onClick={handleConnectWallet}
                              variant="primary"
                            >
                              Connect Wallet
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Col>
        </Row>
      </Card>
      
      <Row>
        {/* Project Details */}
        <Col md={8} className="mb-4">
          <Card>
            <Card.Header>
              <h3 className="mb-0">About This Campaign</h3>
            </Card.Header>
            <Card.Body>
              <div dangerouslySetInnerHTML={{ __html: project.description }} />
            </Card.Body>
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
        <Col md={4}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">Rewards</h3>
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
              
              {/* Donation Process Card */}
              <Card className="mt-3">
                <Card.Header>How Donations Work</Card.Header>
                <Card.Body>
                  <ol className="ps-3">
                    <li>Choose your donation method (card or tokens)</li>
                    <li>Card donations will use {dexRouterName} to convert funds to {project.token_symbol || 'tokens'}</li>
                    <li>Token donations use your connected wallet to send tokens directly</li>
                    <li>All tokens are sent to the campaign's smart contract</li>
                    <li>The campaign owner can only withdraw funds according to milestones</li>
                  </ol>
                  <p className="mb-0 small">
                    <strong>Note:</strong> Card donations use {dexRouterName} on the {project.chain || 'BSC'} blockchain 
                    for token swaps. A small processing fee applies to cover exchange costs.
                  </p>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectDetailsPage; 