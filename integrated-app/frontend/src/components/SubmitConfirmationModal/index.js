import React, { useState } from 'react';
import { Modal, Button, ListGroup, Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationTriangle, 
  faGasPump,
  faDollarSign,
  faCalendarAlt,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import './styles.css';

const SubmitConfirmationModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  campaignData,
  tokenInfo
}) => {
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onConfirm();
    setIsSubmitting(false);
  };
  
  // Format amount with commas
  const formatAmount = (amount) => {
    if (!amount) return '0';
    return parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };
  
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
      size="lg"
      className="confirmation-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Campaign Creation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="primary">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <strong>Important:</strong> Please review the details below before submitting your campaign.
        </Alert>
        
        <div className="campaign-details-summary">
          <h5>Campaign Summary</h5>
          <ListGroup variant="flush" className="mb-4">
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
              <span>Title</span>
              <strong>{campaignData.basics.projectTitle}</strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
              <span>Funding Goal</span>
              <strong>
                <FontAwesomeIcon icon={faDollarSign} className="me-1" />
                {formatAmount(campaignData.basics.projectFundAmount)} {tokenInfo?.symbol || 'Tokens'}
              </strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
              <span>Duration</span>
              <strong>
                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                {campaignData.basics.projectDeadlineDate} days
              </strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
              <span>Contract Owner</span>
              <strong className="text-truncate" style={{ maxWidth: '280px' }}>
                <FontAwesomeIcon icon={faShieldAlt} className="me-1" />
                {campaignData.basics.contractOwnerAddress}
              </strong>
            </ListGroup.Item>
          </ListGroup>
          
          <h5>Gas Fee Estimate</h5>
          <div className="gas-estimate-container p-3 mb-4 border rounded bg-light">
            <div className="d-flex align-items-center mb-2">
              <FontAwesomeIcon icon={faGasPump} className="me-2 text-warning" />
              <span>Estimated gas fee: <strong>0.001-0.003 ETH</strong></span>
            </div>
            <p className="text-muted small mb-0">
              Gas fees vary based on network conditions. You'll need to confirm the transaction in your wallet.
            </p>
          </div>
          
          <div className="confirmation-checklist mb-4">
            <h5>Final Checklist</h5>
            <ListGroup>
              <ListGroup.Item className="confirmation-item">
                <Form.Check
                  type="checkbox"
                  id="check-content"
                  label="I have reviewed all content for accuracy"
                  className="mb-0"
                />
              </ListGroup.Item>
              <ListGroup.Item className="confirmation-item">
                <Form.Check
                  type="checkbox"
                  id="check-legal"
                  label="I understand my legal obligations to my backers"
                  className="mb-0"
                />
              </ListGroup.Item>
              <ListGroup.Item className="confirmation-item">
                <Form.Check
                  type="checkbox"
                  id="check-wallet"
                  label="I have connected my wallet and have funds for gas fees"
                  className="mb-0"
                />
              </ListGroup.Item>
              <ListGroup.Item className="confirmation-item">
                <Form.Check
                  type="checkbox"
                  id="check-understand"
                  label="I understand that this will deploy a smart contract to the blockchain"
                  className="mb-0"
                />
              </ListGroup.Item>
            </ListGroup>
          </div>
          
          <Form.Group className="final-confirmation mb-0">
            <Form.Check
              type="checkbox"
              id="final-confirmation"
              label="I confirm that I want to create this campaign and deploy the associated smart contract"
              checked={confirmCheck}
              onChange={(e) => setConfirmCheck(e.target.checked)}
              className="fw-bold"
            />
          </Form.Group>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Go Back & Edit
        </Button>
        <Button 
          variant="primary" 
          disabled={!confirmCheck || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>Creating Campaign...</>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              Create Campaign
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SubmitConfirmationModal; 