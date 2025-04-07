import React, { useState } from 'react';
import { Card, Button, Badge, Tabs, Tab, ProgressBar, ListGroup, Row, Col, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faMobile, faWallet, faCalendarAlt, faUsers, faClock, faEye } from '@fortawesome/free-solid-svg-icons';
import './styles.css';

const LivePreview = ({ campaignData }) => {
  const [previewMode, setPreviewMode] = useState('desktop');
  const [activeTab, setActiveTab] = useState('overview');
  
  const placeholder = {
    image: 'https://via.placeholder.com/800x400?text=Campaign+Image',
    avatar: 'https://via.placeholder.com/150?text=User',
  };
  
  const daysRemaining = () => {
    const days = parseInt(campaignData.basics.projectDeadlineDate || '30');
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
  
  const renderHTML = (html) => {
    if (!html) return <p className="text-muted">No content yet...</p>;
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };
  
  // Truncate text to a certain length
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    
    // Remove HTML tags if present
    const plainText = text.replace(/<[^>]*>?/gm, '');
    
    if (plainText.length <= maxLength) return plainText;
    
    // Find the last space before maxLength
    const lastSpace = plainText.substring(0, maxLength).lastIndexOf(' ');
    return plainText.substring(0, lastSpace) + '...';
  };
  
  // Default placeholder image
  const placeholderImage = 'https://via.placeholder.com/800x450?text=Campaign+Image';
  
  return (
    <div className="live-preview">
      <div className="preview-mode-selector mb-2">
        <ButtonGroup size="sm">
          <Button
            variant={previewMode === 'desktop' ? 'primary' : 'outline-primary'}
            onClick={() => setPreviewMode('desktop')}
            title="Desktop View"
          >
            <FontAwesomeIcon icon={faDesktop} />
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'primary' : 'outline-primary'}
            onClick={() => setPreviewMode('mobile')}
            title="Mobile View"
          >
            <FontAwesomeIcon icon={faMobile} />
          </Button>
        </ButtonGroup>
      </div>
      
      <div className={`preview-container ${previewMode}`}>
        <div className="preview-content">
          <Card className="campaign-preview-card">
            <div className="preview-image-container">
              <img
                src={campaignData?.basics?.projectImageUrl || placeholderImage}
                className="preview-image"
                alt="Campaign"
                onError={(e) => {
                  e.target.src = placeholderImage;
                }}
              />
            </div>
            
            <Card.Body>
              <h4 className="preview-title">
                {campaignData?.basics?.projectTitle || 'Your Campaign Title'}
              </h4>
              
              <p className="preview-description">
                {truncateText(campaignData?.basics?.projectDescription, 120) || 'Campaign description will appear here...'}
              </p>
              
              <div className="preview-details">
                <div className="preview-goal">
                  <strong>Goal:</strong> {campaignData?.basics?.projectFundAmount || '0'} Tokens
                </div>
                <div className="preview-duration">
                  <strong>Duration:</strong> {campaignData?.basics?.projectDeadlineDate || '30'} days
                </div>
                {campaignData?.basics?.category && (
                  <div className="preview-category">
                    <strong>Category:</strong> {campaignData.basics.category}
                  </div>
                )}
              </div>
              
              <div className="preview-tags mt-2">
                {campaignData?.basics?.tags && campaignData.basics.tags.map((tag, index) => (
                  <span key={index} className="preview-tag">#{tag}</span>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LivePreview; 