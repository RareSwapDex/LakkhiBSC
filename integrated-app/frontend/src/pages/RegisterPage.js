import React, { useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProvider } from '../web3/ProviderContext';

const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  const { connectWallet, account } = useProvider();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h3>Register with Lakkhi Fund</h3>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <p>Lakkhi Fund uses Web3 wallet authentication for secure account management.</p>
                <p>Connect your wallet to get started:</p>
              </div>
              
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={connectWallet}
                >
                  {account ? `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect Wallet'}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-muted">
                  By connecting your wallet, you'll be able to create campaigns, 
                  contribute to projects, and track your activity on the platform.
                </p>
                <p className="mt-3">
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
