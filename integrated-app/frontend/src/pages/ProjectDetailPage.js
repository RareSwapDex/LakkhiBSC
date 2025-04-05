import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert, ProgressBar } from 'react-bootstrap';
import * as projectService from '../services/projectService';
import { ProviderContext } from '../web3/ProviderContext';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { account, isConnected, connectWallet } = useContext(ProviderContext);
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isContractOwner, setIsContractOwner] = useState(false);
  
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProjectById(id);
        if (response.success) {
          setProject(response.project);
          // Check if current wallet address matches the project owner
          if (account && account.toLowerCase() === response.project.wallet_address?.toLowerCase()) {
            setIsOwner(true);
          }
          // Check if current wallet address matches the contract owner (who can release funds)
          if (account && response.project.contract_owner_address &&
              account.toLowerCase() === response.project.contract_owner_address?.toLowerCase()) {
            setIsContractOwner(true);
          }
        } else {
          setError(response.message || 'Failed to fetch project');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('An error occurred while fetching the project');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id, account]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <p>Loading project details...</p>
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
        <Col md={8}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>{project.title}</h1>
            <div>
              {isOwner && (
                <Link to={`/edit-campaign/${project.id}`} className="me-2">
                  <Button variant="outline-primary">Edit Campaign</Button>
                </Link>
              )}
              {isContractOwner && (
                <Link to={`/projects/${project.id}/releases`}>
                  <Button variant="success">Manage Fund Releases</Button>
                </Link>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <Badge bg="primary" className="me-2">{project.category}</Badge>
            <Badge bg="secondary" className="me-2">{project.blockchain_chain}</Badge>
            <small className="text-muted">Created on {formatDate(project.created_at)}</small>
          </div>
          
          {project.image && (
            <img
              src={project.image}
              alt={project.title}
              className="img-fluid mb-4 rounded"
              style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
            />
          )}
          
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>About This Project</Card.Title>
              <Card.Text>{project.description}</Card.Text>
            </Card.Body>
          </Card>
          
          {project.project_story && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Project Story</Card.Title>
                <div dangerouslySetInnerHTML={{ __html: project.project_story }} />
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col md={4}>
          <Card className="mb-4 border-primary">
            <Card.Body>
              <Card.Title>Funding Progress</Card.Title>
              <h3 className="mb-2">
                {project.raised_amount || 0} / {project.fund_amount} {project.fund_currency}
              </h3>
              
              <ProgressBar 
                now={project.fund_percentage || 0} 
                label={`${project.fund_percentage || 0}%`}
                variant="success" 
                className="mb-3" 
              />
              
              <div className="d-flex justify-content-between mb-3">
                <div>
                  <small className="text-muted d-block">Backers</small>
                  <strong>{project.number_of_donators || 0}</strong>
                </div>
                <div>
                  <small className="text-muted d-block">Days Left</small>
                  <strong>{project.days_left || 'N/A'}</strong>
                </div>
              </div>
              
              {isConnected ? (
                <Button variant="primary" size="lg" className="w-100 mt-2">
                  Support This Project
                </Button>
              ) : (
                <Button variant="primary" size="lg" className="w-100 mt-2" onClick={connectWallet}>
                  Connect Wallet to Support
                </Button>
              )}
            </Card.Body>
          </Card>
          
          {project.wallet_address && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Project Creator</Card.Title>
                <Card.Text>
                  <small className="text-muted">Campaign created by:</small>
                  <br />
                  <code className="user-select-all">{project.wallet_address}</code>
                </Card.Text>
              </Card.Body>
            </Card>
          )}
          
          {project.contract_owner_address && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Fund Controller</Card.Title>
                <Card.Text>
                  <small className="text-muted">Funds controlled by:</small>
                  <br />
                  <code className="user-select-all">{project.contract_owner_address}</code>
                  {project.contract_owner_address.toLowerCase() !== project.wallet_address.toLowerCase() && (
                    <div className="mt-2">
                      <Alert variant="info" className="p-2 small">
                        <i className="bi bi-info-circle me-2"></i>
                        This account is different from the campaign creator and has exclusive rights to release funds.
                      </Alert>
                    </div>
                  )}
                  {isContractOwner && (
                    <div className="mt-3">
                      <Link to={`/projects/${project.id}/releases`}>
                        <Button variant="success" size="sm" className="w-100">Release Funds</Button>
                      </Link>
                    </div>
                  )}
                </Card.Text>
              </Card.Body>
            </Card>
          )}
          
          {project.staking_address && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Staking Contract</Card.Title>
                <Card.Text>
                  <small className="text-muted">Contract address:</small>
                  <br />
                  <code className="user-select-all">{project.staking_address}</code>
                </Card.Text>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectDetailPage; 