import React from 'react';
import { Card, Container, Row, Col, Badge, ProgressBar } from 'react-bootstrap';

/**
 * LivePreview Component
 * 
 * Shows a preview of how the campaign will look when published
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - The campaign form data
 */
const LivePreview = ({ formData }) => {
  // Default image if none provided
  const defaultImage = 'https://via.placeholder.com/800x400?text=Campaign+Image';
  
  // Format dates for display
  const formatDate = (daysFromNow) => {
    const date = new Date();
    date.setDate(date.getDate() + parseInt(daysFromNow));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate funding progress (mock data for preview)
  const calculateProgress = () => {
    return 0; // Always 0% for preview
  };
  
  return (
    <Container className="preview-container py-4">
      <div className="preview-banner bg-light p-2 text-center mb-4 rounded">
        <strong>Preview Mode</strong> - This is how your campaign will appear to donors
      </div>
      
      <Card className="mb-4 shadow-sm">
        <Card.Img 
          variant="top" 
          src={formData.basics.projectImageUrl instanceof File 
            ? URL.createObjectURL(formData.basics.projectImageUrl) 
            : defaultImage
          } 
          style={{ maxHeight: '400px', objectFit: 'cover' }}
        />
        
        <Card.Body>
          <h1 className="campaign-title mb-3">{formData.basics.projectTitle || 'Campaign Title'}</h1>
          
          <div className="mb-3">
            {formData.basics.tags.map((tag, index) => (
              <Badge 
                key={index} 
                bg="primary" 
                className="me-2 mb-2"
              >{tag}</Badge>
            ))}
            {formData.basics.category && (
              <Badge 
                bg="secondary" 
                className="mb-2"
              >{formData.basics.category}</Badge>
            )}
          </div>
          
          <Card.Text className="campaign-description lead mb-4">
            {formData.basics.projectDescription || 'Campaign description will appear here...'}
          </Card.Text>
          
          <div className="funding-details mb-4">
            <Row>
              <Col md={9}>
                <h4 className="mb-2">
                  {parseFloat(formData.basics.projectFundAmount || 0).toFixed(2)} Tokens
                </h4>
                <ProgressBar 
                  now={calculateProgress()} 
                  label={`${calculateProgress()}%`}
                  variant="success" 
                  className="mb-2" 
                  style={{height: '25px'}}
                />
                <div className="d-flex justify-content-between text-muted">
                  <span>0% Funded</span>
                  <span>Target: {parseFloat(formData.basics.projectFundAmount || 0).toFixed(2)} Tokens</span>
                </div>
              </Col>
              <Col md={3} className="text-md-end">
                <div className="deadline-info mt-2">
                  <div className="text-muted">Campaign ends</div>
                  <div className="fs-5">{formatDate(formData.basics.projectDeadlineDate || 30)}</div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Rich content preview */}
          {formData.story && formData.story.projectStory && (
            <div className="campaign-story mb-4">
              <h3 className="mb-3">About This Project</h3>
              <div className="formatted-content">
                {/* Use a simple version for the preview */}
                <div style={{whiteSpace: 'pre-wrap'}}>
                  {formData.story.projectStory}
                </div>
              </div>
            </div>
          )}
          
          {/* Team section */}
          {formData.team && formData.team.members && formData.team.members.length > 0 && (
            <div className="team-section mb-4">
              <h3 className="mb-3">Meet The Team</h3>
              <Row>
                {formData.team.members.map((member, index) => (
                  <Col md={4} key={index} className="mb-3">
                    <Card className="team-member h-100">
                      <Card.Body>
                        <h5 className="member-name">{member.name || 'Team Member'}</h5>
                        <div className="member-role text-muted mb-2">{member.role || 'Role'}</div>
                        <p className="member-bio small">{member.bio || 'Biography'}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
          
          {/* Milestones section */}
          {formData.milestones && formData.milestones.length > 0 && (
            <div className="milestones-section mb-4">
              <h3 className="mb-3">Project Milestones</h3>
              <div className="milestone-timeline">
                {formData.milestones.map((milestone, index) => (
                  <Card key={index} className="milestone-card mb-3">
                    <Card.Body>
                      <h5 className="milestone-title d-flex justify-content-between">
                        <span>{milestone.title || `Milestone ${index + 1}`}</span>
                        <Badge bg="info">
                          {parseFloat(milestone.targetAmount || 0).toFixed(2)} Tokens
                        </Badge>
                      </h5>
                      <Card.Text>{milestone.description || 'Milestone description'}</Card.Text>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LivePreview; 