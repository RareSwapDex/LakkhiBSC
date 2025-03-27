import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import * as projectService from '../services/projectService';
import { ProviderContext } from '../web3/ProviderContext';
import ProjectCurrentContributions from '../components/ProjectCurrentContributions';
import ProjectStatusBanner from '../components/ProjectStatusBanner';
import ProjectShareButtons from '../components/ProjectShareButtons';
import { notification } from 'antd';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { account, isConnected, connectWallet } = useContext(ProviderContext);
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [userTokenDonations, setUserTokenDonations] = useState(0);
  
  // Show notification
  const openNotification = (title, message) => {
    notification.open({
      message: title,
      description: message,
      placement: 'topRight',
      duration: 5,
    });
  };
  
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProjectById(id);
        
        if (response.success) {
          setProject(response.project);
          
          // Fetch token price and info
          if (response.project.token_address) {
            const tokenResponse = await projectService.getTokenPrice(response.project.token_address);
            if (tokenResponse.success) {
              setTokenData({
                price: tokenResponse.price,
                address: response.project.token_address,
                symbol: response.project.token_symbol || 'TOKEN'
              });
            }
          }
          
          // If user is connected, fetch their donation info
          if (isConnected && account) {
            const contributionsResponse = await projectService.getProjectContributions(id);
            if (contributionsResponse.success) {
              const userContributions = contributionsResponse.contributions.filter(
                c => c.contributor_wallet_address && c.contributor_wallet_address.toLowerCase() === account.toLowerCase()
              );
              
              const totalTokens = userContributions.reduce(
                (sum, contrib) => sum + (Number(contrib.token_amount) || 0), 0
              );
              
              setUserTokenDonations(totalTokens);
            }
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
  }, [id, isConnected, account]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format USD amount to 2 decimal places with comma separators
  const formatUSD = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Format token amount to 6 decimal places with comma separators
  const formatToken = (usdAmount, tokenPrice) => {
    if (!usdAmount || !tokenPrice) return 'N/A';
    const tokenAmount = parseFloat(usdAmount) / parseFloat(tokenPrice);
    return tokenAmount.toLocaleString(undefined, {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6
    });
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
        <Col md={8} className="mb-4 mb-md-0">
          {/* Project Main Card */}
          <Card className="shadow-sm mb-4 overflow-hidden">
            {/* Status Banner */}
            <ProjectStatusBanner project={project} />
            
            {/* Project Image */}
            {project.image && (
              <div style={{ height: '350px', overflow: 'hidden' }}>
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
            
            <Card.Body>
              <Card.Title as="h1" className="mb-3">{project.title}</Card.Title>
              
              <div className="mb-4 d-flex flex-wrap gap-2">
                <Badge bg="primary" className="me-2">{project.category || 'Technology'}</Badge>
                <Badge bg="secondary" className="me-2">{project.blockchain_chain || 'BSC'}</Badge>
                <small className="text-muted d-block mt-2">Created on {formatDate(project.created_at)}</small>
              </div>
              
              <Card.Text>{project.description}</Card.Text>
            </Card.Body>
          </Card>
          
          {/* Current Contributions Section with Gradient Background */}
          <ProjectCurrentContributions project={project} tokenData={tokenData} />
          
          {/* Project Details Section */}
          <Card className="mt-4 shadow-sm">
            <Card.Body>
              <Card.Title as="h2" className="mb-4">Project Details</Card.Title>
              
              {project.project_story && (
                <div dangerouslySetInnerHTML={{ __html: project.project_story }} className="mb-4" />
              )}
              
              <Row className="mt-4">
                <Col md={6}>
                  <h5>Project Timeline</h5>
                  <p><strong>Launch Date:</strong> {formatDate(project.created_at)}</p>
                  <p><strong>Deadline:</strong> {formatDate(project.deadline)}</p>
                </Col>
                <Col md={6}>
                  <h5>Project Owner</h5>
                  <p><strong>Created by:</strong> {project.owner_name || 'Anonymous'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          {/* Funding Card */}
          <Card className="mb-4 border-primary shadow">
            <Card.Body>
              <Card.Title>Funding Goal</Card.Title>
              <h3 className="mb-2">
                ${formatUSD(project.fund_amount)} {project.currency || 'USD'}
              </h3>
              
              {tokenData && (
                <div className="text-muted mb-3">
                  {formatToken(project.fund_amount, tokenData.price)} {tokenData.symbol}
                </div>
              )}
              
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
                <>
                  {userTokenDonations > 0 && (
                    <div className="mb-3 p-2 bg-light rounded text-center">
                      <small className="text-muted d-block">Your Contribution</small>
                      <strong>
                        {userTokenDonations.toLocaleString(undefined, {
                          minimumFractionDigits: 6,
                          maximumFractionDigits: 6
                        })} {tokenData?.symbol || 'tokens'}
                      </strong>
                    </div>
                  )}
                  <Link to={`/projects/${id}/donate`}>
                    <Button variant="primary" size="lg" className="w-100 mt-2">
                      Support This Project
                    </Button>
                  </Link>
                </>
              ) : (
                <Button variant="primary" size="lg" className="w-100 mt-2" onClick={connectWallet}>
                  Connect Wallet to Support
                </Button>
              )}
            </Card.Body>
          </Card>
          
          {/* Project Token Card */}
          {project.token_address && (
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Card.Title>Project Token</Card.Title>
                <Card.Text>
                  <small className="text-muted">Token Address:</small>
                  <br />
                  <code className="user-select-all">{project.token_address}</code>
                  {tokenData && (
                    <div className="mt-2">
                      <Badge bg="info">Current Price: ${formatUSD(tokenData.price)}</Badge>
                    </div>
                  )}
                </Card.Text>
              </Card.Body>
            </Card>
          )}
          
          {/* Project Wallet Card */}
          {project.wallet_address && (
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Card.Title>Project Wallet</Card.Title>
                <Card.Text>
                  <small className="text-muted">Funds go directly to:</small>
                  <br />
                  <code className="user-select-all">{project.wallet_address}</code>
                </Card.Text>
              </Card.Body>
            </Card>
          )}
          
          {/* Contract Card */}
          {project.staking_address && (
            <Card className="mb-4 shadow-sm">
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
          
          {/* Share Buttons */}
          <ProjectShareButtons project={project} />
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectDetailPage; 