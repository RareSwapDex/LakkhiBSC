import React, { useState } from 'react';
import { Card, Button, Badge, Tabs, Tab, ProgressBar, ListGroup, Row, Col, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faMobile, faWallet, faCalendarAlt, faUsers, faClock } from '@fortawesome/free-solid-svg-icons';
import './styles.css';

const LivePreview = ({ formData, tokenInfo }) => {
  const [previewMode, setPreviewMode] = useState('desktop');
  const [activeTab, setActiveTab] = useState('overview');
  
  const placeholder = {
    image: 'https://via.placeholder.com/800x400?text=Campaign+Image',
    avatar: 'https://via.placeholder.com/150?text=User',
  };
  
  const daysRemaining = () => {
    const days = parseInt(formData.basics.projectDeadlineDate || '30');
    return isNaN(days) ? 30 : days;
  };
  
  const progress = () => {
    // This is just a preview, so we'll show a random progress
    return Math.floor(Math.random() * 40) + 10;
  };
  
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const formatDate = () => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + daysRemaining());
    return endDate.toLocaleDateString();
  };
  
  return (
    <div className="live-preview">
      <div className="preview-mode-selector mb-3">
        <Button 
          variant={previewMode === 'desktop' ? 'primary' : 'outline-secondary'} 
          className="me-2"
          size="sm"
          onClick={() => setPreviewMode('desktop')}
        >
          <FontAwesomeIcon icon={faDesktop} className="me-1" /> Desktop
        </Button>
        <Button 
          variant={previewMode === 'mobile' ? 'primary' : 'outline-secondary'} 
          size="sm"
          onClick={() => setPreviewMode('mobile')}
        >
          <FontAwesomeIcon icon={faMobile} className="me-1" /> Mobile
        </Button>
      </div>
      
      <div className={`preview-container ${previewMode}`}>
        <div className="preview-content">
          {previewMode === 'mobile' ? (
            <Card className="campaign-preview-card">
              <Card.Img 
                variant="top" 
                src={formData.basics.projectImageFile ? URL.createObjectURL(formData.basics.projectImageFile) : placeholder.image} 
                className="preview-image"
              />
              <Card.Body>
                <Card.Title>
                  {formData.basics.projectTitle || 'Your Campaign Title'}
                </Card.Title>
                
                <div className="preview-created-by mb-2">
                  <Image src={placeholder.avatar} roundedCircle className="preview-avatar me-2" />
                  <span className="text-muted">by <strong>You</strong></span>
                </div>
                
                <div className="mb-3">
                  <Badge bg="primary" className="me-1">{formData.basics.category || 'Category'}</Badge>
                  <Badge bg="secondary">{formData.basics.blockchainChain || 'BSC'}</Badge>
                </div>
                
                <Card.Text>
                  {formData.basics.projectDescription || 'Your campaign description will appear here.'}
                </Card.Text>
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Raised: $0</span>
                    <span>Goal: ${formData.basics.projectFundAmount || '0'}</span>
                  </div>
                  <ProgressBar now={progress()} label={`${progress()}%`} />
                </div>
                
                <div className="preview-stats mb-3">
                  <div className="preview-stat-item">
                    <FontAwesomeIcon icon={faUsers} />
                    <div className="stat-value">0</div>
                    <div className="stat-label">Backers</div>
                  </div>
                  <div className="preview-stat-item">
                    <FontAwesomeIcon icon={faClock} />
                    <div className="stat-value">{daysRemaining()}</div>
                    <div className="stat-label">Days Left</div>
                  </div>
                  <div className="preview-stat-item">
                    <FontAwesomeIcon icon={faWallet} />
                    <div className="stat-value">
                      {tokenInfo ? tokenInfo.symbol : 'Token'}
                    </div>
                    <div className="stat-label">Currency</div>
                  </div>
                </div>
                
                <Button variant="primary" block>Support This Project</Button>
              </Card.Body>
            </Card>
          ) : (
            <Card className="campaign-preview-card">
              <Row>
                <Col md={8}>
                  <Card.Img 
                    variant="top" 
                    src={formData.basics.projectImageFile ? URL.createObjectURL(formData.basics.projectImageFile) : placeholder.image} 
                    className="preview-image"
                  />
                </Col>
                <Col md={4}>
                  <Card.Body>
                    <Card.Title className="preview-title">
                      {formData.basics.projectTitle || 'Your Campaign Title'}
                    </Card.Title>
                    
                    <div className="preview-created-by mb-2">
                      <Image src={placeholder.avatar} roundedCircle className="preview-avatar me-2" />
                      <span className="text-muted">by <strong>You</strong></span>
                    </div>
                    
                    <div className="mb-3">
                      <Badge bg="primary" className="me-1">{formData.basics.category || 'Category'}</Badge>
                      <Badge bg="secondary">{formData.basics.blockchainChain || 'BSC'}</Badge>
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Raised: $0</span>
                        <span>Goal: ${formData.basics.projectFundAmount || '0'}</span>
                      </div>
                      <ProgressBar now={progress()} label={`${progress()}%`} />
                    </div>
                    
                    <ListGroup variant="flush" className="mb-3">
                      <ListGroup.Item className="d-flex justify-content-between">
                        <span>
                          <FontAwesomeIcon icon={faUsers} className="me-2" />
                          Backers
                        </span>
                        <strong>0</strong>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between">
                        <span>
                          <FontAwesomeIcon icon={faClock} className="me-2" />
                          End Date
                        </span>
                        <strong>{formatDate()}</strong>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between">
                        <span>
                          <FontAwesomeIcon icon={faWallet} className="me-2" />
                          Token
                        </span>
                        <strong>{tokenInfo ? tokenInfo.symbol : 'Token'}</strong>
                      </ListGroup.Item>
                    </ListGroup>
                    
                    <Button variant="primary" block className="w-100">Support This Project</Button>
                  </Card.Body>
                </Col>
              </Row>
              
              <Card.Body>
                <Tabs 
                  activeKey={activeTab} 
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-3"
                >
                  <Tab eventKey="overview" title="Overview">
                    <Card.Text>
                      {formData.basics.projectDescription || 'Your campaign description will appear here.'}
                    </Card.Text>
                    
                    {formData.story.projectStory && (
                      <div>
                        <h5>Story</h5>
                        <Card.Text>{formData.story.projectStory}</Card.Text>
                      </div>
                    )}
                    
                    {formData.story.projectGoals && (
                      <div>
                        <h5>Goals</h5>
                        <Card.Text>{formData.story.projectGoals}</Card.Text>
                      </div>
                    )}
                  </Tab>
                  <Tab eventKey="milestones" title="Milestones">
                    <ListGroup variant="flush">
                      {formData.milestones.map((milestone, index) => (
                        <ListGroup.Item key={index}>
                          <div className="d-flex justify-content-between">
                            <h5>{milestone.title || `Milestone ${index + 1}`}</h5>
                            <Badge bg="info">{milestone.targetAmount || '0'} {formData.basics.projectFundCurrency}</Badge>
                          </div>
                          <p>{milestone.description || 'Milestone description'}</p>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Tab>
                  <Tab eventKey="team" title="Team">
                    <Row>
                      {formData.team.members.map((member, index) => (
                        <Col md={4} key={index} className="mb-3">
                          <Card>
                            <Card.Body>
                              <div className="text-center mb-3">
                                <Image src={placeholder.avatar} roundedCircle width={80} height={80} />
                              </div>
                              <Card.Title className="text-center">{member.name || `Team Member ${index + 1}`}</Card.Title>
                              <Card.Subtitle className="mb-2 text-muted text-center">{member.role || 'Role'}</Card.Subtitle>
                              <Card.Text>{member.bio || 'Team member bio'}</Card.Text>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivePreview; 