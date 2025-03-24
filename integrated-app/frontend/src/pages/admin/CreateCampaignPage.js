import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const CreateCampaignPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [activeTab, setActiveTab] = useState('basics');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    basics: {
      projectTitle: '',
      projectHead: '',
      blockchainChain: 'BSC',
      projectImageFile: null,
      projectLaunchDate: '',
      projectDeadlineDate: '30',
      activateImmediately: true,
      projectFundAmount: '',
      projectFundCurrency: 'USD',
    },
    story: {
      projectStory: '',
    },
    rewards: {
      projectRewards: [
        {
          title: '',
          description: '',
          price: '',
          availableItems: '',
          estimatedDelivery: '',
          displayOrder: 1,
        }
      ]
    }
  });
  
  // Blockchain chains
  const blockchainChains = [
    { id: 'BSC', name: 'BSC' },
    { id: 'Solana', name: 'Solana' },
    { id: 'Ethereum', name: 'Ethereum' },
    { id: 'Base', name: 'Base' }
  ];
  
  // Handle form field changes
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  // Handle file upload
  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      basics: {
        ...prev.basics,
        projectImageFile: e.target.files[0]
      }
    }));
  };
  
  // Handle reward form changes
  const handleRewardChange = (index, field, value) => {
    const updatedRewards = [...formData.rewards.projectRewards];
    updatedRewards[index] = {
      ...updatedRewards[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      rewards: {
        ...prev.rewards,
        projectRewards: updatedRewards
      }
    }));
  };
  
  // Add a new reward
  const addReward = () => {
    const rewards = [...formData.rewards.projectRewards];
    rewards.push({
      title: '',
      description: '',
      price: '',
      availableItems: '',
      estimatedDelivery: '',
      displayOrder: rewards.length + 1
    });
    
    setFormData(prev => ({
      ...prev,
      rewards: {
        ...prev.rewards,
        projectRewards: rewards
      }
    }));
  };
  
  // Remove a reward
  const removeReward = (index) => {
    if (formData.rewards.projectRewards.length <= 1) return;
    
    const updatedRewards = formData.rewards.projectRewards.filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      rewards: {
        ...prev.rewards,
        projectRewards: updatedRewards
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add basics
      Object.keys(formData.basics).forEach(key => {
        formDataToSend.append(`basics.${key}`, formData.basics[key]);
      });
      
      // Add story
      formDataToSend.append('story.projectStory', formData.story.projectStory);
      
      // Add rewards
      formDataToSend.append('rewards.projectRewards', JSON.stringify(formData.rewards.projectRewards));
      
      // Always create contract immediately
      formDataToSend.append('create_contract', 'true');
      
      // Set publish state based on immediate activation
      formDataToSend.append('publish', formData.basics.activateImmediately ? 'true' : 'false');
      
      // Send data to the server
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/projects/add/`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setSubmitSuccess(true);
        
        // Redirect to the new project page after a delay
        setTimeout(() => {
          navigate(`/projects/${response.data.project_id}`);
        }, 2000);
      } else {
        setError(response.data.message || 'An error occurred while creating the campaign');
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError(err.response?.data?.message || 'An error occurred while creating the campaign');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (submitting) {
    return <Container className="py-5 text-center"><p>Creating campaign...</p></Container>;
  }
  
  if (submitSuccess) {
    return (
      <Container className="py-5">
        <Alert variant="success">
          <Alert.Heading>Campaign Created Successfully!</Alert.Heading>
          <p>Your campaign has been created. You will be redirected to the campaign page shortly.</p>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Create New Campaign</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Tabs
          activeKey={activeTab}
          onSelect={(key) => setActiveTab(key)}
          className="mb-4"
        >
          <Tab eventKey="basics" title="Campaign Details">
            <Card className="mb-4">
              <Card.Body>
                <h3 className="mb-3">Campaign Basics</h3>
                
                <Form.Group className="mb-3">
                  <Form.Label>Campaign Title*</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.basics.projectTitle}
                    onChange={(e) => handleInputChange('basics', 'projectTitle', e.target.value)}
                    required
                    placeholder="Enter a clear, descriptive title"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Campaign Creator*</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.basics.projectHead}
                    onChange={(e) => handleInputChange('basics', 'projectHead', e.target.value)}
                    required
                    placeholder="Enter the creator's name"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Blockchain Chain*</Form.Label>
                  <Form.Select 
                    value={formData.basics.blockchainChain}
                    onChange={(e) => handleInputChange('basics', 'blockchainChain', e.target.value)}
                    required
                  >
                    {blockchainChains.map(chain => (
                      <option key={chain.id} value={chain.id}>
                        {chain.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Funding Goal (Target Amount)*</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.basics.projectFundAmount}
                        onChange={(e) => handleInputChange('basics', 'projectFundAmount', e.target.value)}
                        required
                        min="1"
                        step="0.01"
                        placeholder="Enter funding target amount"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Currency*</Form.Label>
                      <Form.Select
                        value={formData.basics.projectFundCurrency}
                        onChange={(e) => handleInputChange('basics', 'projectFundCurrency', e.target.value)}
                        required
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Campaign Image*</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    required={!formData.basics.projectImageFile}
                  />
                  <Form.Text className="text-muted">
                    Upload a high-quality image to represent your campaign.
                  </Form.Text>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Launch Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.basics.projectLaunchDate}
                        onChange={(e) => handleInputChange('basics', 'projectLaunchDate', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Campaign Duration*</Form.Label>
                      <Form.Select
                        value={formData.basics.projectDeadlineDate}
                        onChange={(e) => handleInputChange('basics', 'projectDeadlineDate', e.target.value)}
                        required
                      >
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="activateImmediately"
                    label="Activate campaign immediately"
                    checked={formData.basics.activateImmediately}
                    onChange={(e) => handleInputChange('basics', 'activateImmediately', e.target.checked)}
                  />
                  <Form.Text className="text-muted">
                    If checked, the campaign will be published immediately. Otherwise, it will be created but published on the launch date.
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Body>
                <h3 className="mb-3">Campaign Incentives</h3>
                <p className="text-muted mb-4">Add rewards that backers will receive for supporting your campaign</p>
                
                {formData.rewards.projectRewards.map((reward, index) => (
                  <Card key={index} className="mb-3 border-primary">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <span>Incentive #{index + 1}</span>
                      {formData.rewards.projectRewards.length > 1 && (
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => removeReward(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>Title*</Form.Label>
                        <Form.Control
                          type="text"
                          value={reward.title}
                          onChange={(e) => handleRewardChange(index, 'title', e.target.value)}
                          required
                          placeholder="Enter a title for this reward"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Description*</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={reward.description}
                          onChange={(e) => handleRewardChange(index, 'description', e.target.value)}
                          required
                          placeholder="Describe what backers will receive"
                        />
                      </Form.Group>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Price*</Form.Label>
                            <Form.Control
                              type="number"
                              value={reward.price}
                              onChange={(e) => handleRewardChange(index, 'price', e.target.value)}
                              required
                              min="1"
                              step="0.01"
                              placeholder="Enter the price"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Available Quantity*</Form.Label>
                            <Form.Control
                              type="number"
                              value={reward.availableItems}
                              onChange={(e) => handleRewardChange(index, 'availableItems', e.target.value)}
                              required
                              min="1"
                              placeholder="Enter the available quantity"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Estimated Delivery Date*</Form.Label>
                        <Form.Control
                          type="date"
                          value={reward.estimatedDelivery}
                          onChange={(e) => handleRewardChange(index, 'estimatedDelivery', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                ))}
                
                <Button variant="secondary" onClick={addReward} className="w-100">
                  + Add Another Incentive
                </Button>
              </Card.Body>
            </Card>
            
            <div className="d-flex justify-content-between">
              <div></div>
              <Button variant="primary" onClick={() => setActiveTab('story')}>
                Next: Campaign Story
              </Button>
            </div>
          </Tab>
          
          <Tab eventKey="story" title="Campaign Story">
            <Card className="mb-4">
              <Card.Body>
                <h3 className="mb-3">Campaign Story</h3>
                <p className="text-muted mb-4">Tell potential backers about your project, goals, and plans</p>
                
                <Form.Group className="mb-3">
                  <Form.Label>Project Story*</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={10}
                    value={formData.story.projectStory}
                    onChange={(e) => handleInputChange('story', 'projectStory', e.target.value)}
                    required
                    placeholder="Share your project's story, goals, and plans for the funds"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
            
            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" onClick={() => setActiveTab('basics')}>
                Back: Campaign Details
              </Button>
              <Button type="submit" variant="success" disabled={submitting}>
                {submitting ? 'Creating Campaign...' : 'Create Campaign'}
              </Button>
            </div>
          </Tab>
        </Tabs>
      </Form>
    </Container>
  );
};

export default CreateCampaignPage; 