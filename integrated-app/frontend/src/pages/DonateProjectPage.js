import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import IncentiveCard from '../components/IncentiveCard';

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
        redirectURL: window.location.href
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
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Support "{project.title}"</h1>
      
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
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">Make a Donation</h4>
              </Card.Header>
              <Card.Body>
                {paymentError && (
                  <Alert variant="danger">{paymentError}</Alert>
                )}
                
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
            </Card>
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
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default DonateProjectPage; 