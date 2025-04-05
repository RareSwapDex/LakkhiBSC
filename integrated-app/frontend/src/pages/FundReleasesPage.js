import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Form, Table, Spinner, Badge } from 'react-bootstrap';
import * as projectService from '../services/projectService';
import { ProviderContext } from '../web3/ProviderContext';
import axios from 'axios';

const FundReleasesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, isConnected, connectWallet } = useContext(ProviderContext);
  
  const [project, setProject] = useState(null);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isContractOwner, setIsContractOwner] = useState(false);
  
  // Form state for new release
  const [releaseForm, setReleaseForm] = useState({
    title: '',
    description: '',
    amount: '',
  });
  
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Get project details
        const projectResponse = await projectService.getProjectById(id);
        if (projectResponse.success) {
          setProject(projectResponse.project);
          
          // Check if current wallet address matches the contract owner
          if (account && 
              projectResponse.project.contract_owner_address &&
              account.toLowerCase() === projectResponse.project.contract_owner_address.toLowerCase()) {
            setIsContractOwner(true);
          } else {
            // Redirect if not contract owner
            setError('You do not have permission to manage fund releases for this project');
            setTimeout(() => {
              navigate(`/projects/${id}`);
            }, 3000);
          }
          
          // Fetch existing releases if we have campaign data
          if (projectResponse.project.contract_address) {
            try {
              const releasesResponse = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/campaigns/${projectResponse.project.contract_address}/releases/`,
                {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  },
                }
              );
              
              if (releasesResponse.data) {
                setReleases(releasesResponse.data);
              }
            } catch (releaseError) {
              console.error('Error fetching releases:', releaseError);
            }
          }
        } else {
          setError(projectResponse.message || 'Failed to fetch project');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('An error occurred while fetching project data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [id, account, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReleaseForm({
      ...releaseForm,
      [name]: value,
    });
  };
  
  const handleCreateRelease = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      await connectWallet();
      return;
    }
    
    if (!isContractOwner) {
      setError('Only the contract owner can request fund releases');
      return;
    }
    
    try {
      setReleaseLoading(true);
      setError(null);
      
      // Create the release request
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/campaigns/${project.contract_address}/releases/`,
        {
          title: releaseForm.title,
          description: releaseForm.description,
          amount: releaseForm.amount,
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data) {
        setSuccess('Fund release request created successfully');
        
        // Reset the form
        setReleaseForm({
          title: '',
          description: '',
          amount: '',
        });
        
        // Refresh releases list
        const releasesResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/campaigns/${project.contract_address}/releases/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        
        if (releasesResponse.data) {
          setReleases(releasesResponse.data);
        }
      }
    } catch (err) {
      console.error('Error creating release request:', err);
      setError(err.response?.data?.message || 'Failed to create release request');
    } finally {
      setReleaseLoading(false);
    }
  };
  
  const handleExecuteRelease = async (releaseId) => {
    if (!isConnected || !isContractOwner) {
      setError('You must be connected with the contract owner wallet to execute fund releases');
      return;
    }
    
    try {
      setReleaseLoading(true);
      setError(null);
      
      // Execute the on-chain release (this is a mock for now)
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/campaigns/${project.contract_address}/releases/${releaseId}/execute/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data) {
        setSuccess('Funds successfully released');
        
        // Refresh releases list
        const releasesResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/campaigns/${project.contract_address}/releases/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        
        if (releasesResponse.data) {
          setReleases(releasesResponse.data);
        }
      }
    } catch (err) {
      console.error('Error executing release:', err);
      setError(err.response?.data?.message || 'Failed to execute release');
    } finally {
      setReleaseLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading project and release data...</p>
      </Container>
    );
  }
  
  if (error && !project) {
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
      <Row className="mb-4">
        <Col>
          <h1>Fund Release Management</h1>
          <p className="text-muted">
            Project: <strong>{project.title}</strong>
          </p>
          
          {!isContractOwner && (
            <Alert variant="warning">
              You must be the designated contract owner to manage fund releases.
              <br />
              Contract Owner: <code>{project.contract_owner_address}</code>
            </Alert>
          )}
        </Col>
      </Row>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4">{success}</Alert>}
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h3 className="mb-0">Create Fund Release Request</h3>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreateRelease}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={releaseForm.title}
                    onChange={handleInputChange}
                    required
                    placeholder="E.g., Development Phase 1"
                    disabled={!isContractOwner}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={releaseForm.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    placeholder="Explain what these funds will be used for"
                    disabled={!isContractOwner}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Amount (in {project.fund_currency})</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={releaseForm.amount}
                    onChange={handleInputChange}
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="Amount to release"
                    disabled={!isContractOwner}
                  />
                  <Form.Text className="text-muted">
                    Available: {project.raised_amount || 0} {project.fund_currency}
                  </Form.Text>
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={releaseLoading || !isContractOwner}
                  className="w-100"
                >
                  {releaseLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    'Create Release Request'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">Fund Release History</h3>
            </Card.Header>
            <Card.Body>
              {releases.length > 0 ? (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {releases.map((release) => (
                      <tr key={release.id}>
                        <td>{release.title}</td>
                        <td>{release.amount} {project.fund_currency}</td>
                        <td>
                          <Badge bg={
                            release.status === 'completed' ? 'success' :
                            release.status === 'pending' ? 'warning' :
                            release.status === 'rejected' ? 'danger' : 'secondary'
                          }>
                            {release.status}
                          </Badge>
                        </td>
                        <td>{formatDate(release.request_date)}</td>
                        <td>
                          {release.status === 'pending' && isContractOwner && (
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => handleExecuteRelease(release.id)}
                              disabled={releaseLoading}
                            >
                              Execute
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center text-muted">No fund releases have been requested yet.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col>
          <Button variant="outline-primary" onClick={() => navigate(`/projects/${id}`)}>
            Back to Project
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default FundReleasesPage; 