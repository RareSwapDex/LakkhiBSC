import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';

const HomePage = () => {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/projects/`);
        // Limit to 3 featured projects for homepage
        const featured = response.data.projects ? response.data.projects.slice(0, 3) : [];
        setFeaturedProjects(featured);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching featured projects:', err);
        setError('Error loading projects. Please try again later.');
        setLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section py-5" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)' }}>
        <Container>
          <Row className="align-items-center">
            <Col md={7}>
              <Badge bg="success" className="mb-2">First Multi-Chain Platform</Badge>
              <h1 className="display-4 mb-3">The First Decentralized Donation Platform for All Blockchains</h1>
              <p className="lead mb-4">
                Support blockchain projects with direct wallet donations - 
                <strong> helping projects succeed while increasing token value</strong>
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/projects">
                  <Button variant="primary" size="lg">
                    Explore Projects
                  </Button>
                </Link>
                <Link to="/admin/create-campaign">
                  <Button variant="outline-primary" size="lg">
                    Create Campaign
                  </Button>
                </Link>
              </div>
            </Col>
            <Col md={5} className="text-center d-none d-md-block">
              {/* Placeholder for an illustration or image */}
              <img
                src="https://via.placeholder.com/500x400?text=Crowdfunding+Illustration"
                alt="Crowdfunding Illustration"
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Key Benefits Section */}
      <Container className="py-5">
        <Row className="mb-4">
          <Col className="text-center">
            <h2>Why Choose Our Platform?</h2>
            <p className="text-muted">Boost your project's success with our unique blockchain crowdfunding model</p>
          </Col>
        </Row>
        
        <Row>
          <Col md={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="mb-3">🌐</div>
                <h4>Multi-Chain Support</h4>
                <p>Supporting all major blockchains with direct wallet integration</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="mb-3">🔑</div>
                <h4>Direct Wallet Connection</h4>
                <p>No middlemen - direct wallet-to-wallet transactions</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="mb-3">📈</div>
                <h4>Increase Token Value</h4>
                <p>Donations create buy pressure, increasing your token's price</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="mb-3">🛡️</div>
                <h4>Fully Decentralized</h4>
                <p>True decentralization with transparent fund management</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Featured Projects Section */}
      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <h2>Featured Projects</h2>
            <p className="text-muted">Discover exciting campaigns that need your support</p>
          </Col>
          <Col xs="auto">
            <Link to="/projects">
              <Button variant="outline-primary">View All</Button>
            </Link>
          </Col>
        </Row>
        
        {loading ? (
          <p className="text-center">Loading featured projects...</p>
        ) : error ? (
          <p className="text-center text-danger">{error}</p>
        ) : (
          <Row>
            {featuredProjects.length > 0 ? (
              featuredProjects.map((project) => (
                <Col md={4} key={project.id} className="mb-4">
                  <ProjectCard project={project} />
                </Col>
              ))
            ) : (
              <Col>
                <Card className="text-center p-5">
                  <Card.Body>
                    <h3>No projects yet</h3>
                    <p>Be the first to create a project!</p>
                    <Link to="/admin/create-campaign">
                      <Button variant="primary">Create Campaign</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        )}
      </Container>

      {/* How It Works Section */}
      <Container className="py-5 bg-light" fluid>
        <Container>
          <Row className="mb-5">
            <Col className="text-center">
              <h2>How It Works</h2>
              <p className="text-muted">Our innovative blockchain donation process</p>
            </Col>
          </Row>
          
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="display-4 mb-3">1</div>
                  <h4>Connect Your Wallet</h4>
                  <p>Connect your crypto wallet to browse and support projects</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="display-4 mb-3">2</div>
                  <h4>Create or Support</h4>
                  <p>Create your own campaign or support existing projects with tokens</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="display-4 mb-3">3</div>
                  <h4>Track Progress</h4>
                  <p>Monitor campaign progress in real-time with blockchain verification</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  );
};

export default HomePage; 