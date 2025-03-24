import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Badge, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import IncentiveCard from '../components/IncentiveCard';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  
  const [project, setProject] = useState(null);
  const [incentives, setIncentives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch project details
        const projectResponse = await axios.get(`http://localhost:8000/api/projects/${id}/`);
        setProject(projectResponse.data);
        
        // Fetch incentives
        const incentivesResponse = await axios.get(`http://localhost:8000/api/incentives/${id}/`);
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
                
                {project.category && (
                  <Badge bg="secondary">{project.category}</Badge>
                )}
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
                <div className="mt-3">
                  <Button 
                    as={Link} 
                    to={`/donate/${project.id}`} 
                    variant="primary"
                    size="lg"
                    className="w-100"
                  >
                    Support This Campaign
                  </Button>
                </div>
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
                    onSelect={() => {}}
                  />
                ))
              )}
              
              {project.live && (
                <div className="d-grid gap-2 mt-3">
                  <Button 
                    as={Link} 
                    to={`/donate/${project.id}`} 
                    variant="primary"
                  >
                    Support This Campaign
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectDetailsPage; 