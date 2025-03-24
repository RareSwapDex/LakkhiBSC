import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
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
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/projects/`);
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
      <div className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col md={7}>
              <h1 className="display-4 mb-4">Fund Projects with LAKKHI Tokens</h1>
              <p className="lead mb-4">
                Support innovative projects and earn rewards with our blockchain-powered crowdfunding platform
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
                className="img-fluid rounded"
              />
            </Col>
          </Row>
        </Container>
      </div>

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
              <p className="text-muted">Fund projects using LAKKHI tokens on BSC blockchain</p>
            </Col>
          </Row>
          
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="display-4 mb-3">1</div>
                  <h4>Create a Campaign</h4>
                  <p>Set up your funding campaign with project details, funding goals, and rewards</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="display-4 mb-3">2</div>
                  <h4>Receive Donations</h4>
                  <p>Donors contribute BNB which gets converted to LAKKHI tokens via PancakeSwap</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="display-4 mb-3">3</div>
                  <h4>Meet Your Goals</h4>
                  <p>Once your funding goal is reached, funds are released to your project wallet</p>
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