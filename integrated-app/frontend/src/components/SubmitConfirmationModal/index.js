import React, { useState } from 'react';
import { Modal, Button, ListGroup, Badge, Spinner, Alert, Row, Col, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faInfoCircle, faGasPump, faWallet } from '@fortawesome/free-solid-svg-icons';
import './styles.css';

const SubmitConfirmationModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  formData, 
  tokenInfo,
  submitting,
  estimatedGas
}) => {
  const [checklist, setChecklist] = useState({
    reviewedDetails: false,
    confirmedOwner: false,
    walletConnected: false,
    hasEnoughGas: false
  });
  
  const toggleChecklistItem = (key) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const allChecked = Object.values(checklist).every(Boolean);
  
  const getGasFeeSummary = () => {
    const gasFee = estimatedGas || {
      low: { gas: '0.05', usd: '100' },
      medium: { gas: '0.07', usd: '140' },
      high: { gas: '0.09', usd: '180' }
    };
    
    const nativeCurrency = formData.basics.blockchainChain === 'BSC' ? 'BNB' : 
                           formData.basics.blockchainChain === 'Ethereum' ? 'ETH' :
                           formData.basics.blockchainChain === 'Polygon' ? 'MATIC' : 'ETH';
    
    return (
      <div className="gas-fee-container">
        <div className="mb-2">Estimated deployment cost:</div>
        <Row>
          <Col xs={4}>
            <div className="gas-option">
              <Badge bg="success">Low</Badge>
              <div className="gas-price">{gasFee.low.gas} {nativeCurrency}</div>
              <div className="gas-usd">${gasFee.low.usd}</div>
            </div>
          </Col>
          <Col xs={4}>
            <div className="gas-option recommended">
              <Badge bg="warning">Medium</Badge>
              <div className="gas-price">{gasFee.medium.gas} {nativeCurrency}</div>
              <div className="gas-usd">${gasFee.medium.usd}</div>
              <div className="recommended-badge">Recommended</div>
            </div>
          </Col>
          <Col xs={4}>
            <div className="gas-option">
              <Badge bg="danger">High</Badge>
              <div className="gas-price">{gasFee.high.gas} {nativeCurrency}</div>
              <div className="gas-usd">${gasFee.high.usd}</div>
            </div>
          </Col>
        </Row>
      </div>
    );
  };
  
  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="submit-confirmation-modal">
      <Modal.Header closeButton>
        <Modal.Title>Review & Confirm Campaign Creation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {submitting ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <h4 className="mt-3">Creating Campaign</h4>
            <p className="text-muted">Please confirm the transaction in your wallet when prompted...</p>
            <ProgressBar animated now={45} className="mt-4" />
          </div>
        ) : (
          <>
            <Alert variant="info" className="mb-4">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              You're about to deploy a campaign smart contract on the {formData.basics.blockchainChain} blockchain. Please review the details carefully.
            </Alert>
            
            <h5>Campaign Summary</h5>
            <ListGroup className="mb-4">
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <span>Title</span>
                <strong>{formData.basics.projectTitle}</strong>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <span>Funding Goal</span>
                <strong>{formData.basics.projectFundAmount} {formData.basics.projectFundCurrency}</strong>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <span>Blockchain</span>
                <Badge bg="primary">{formData.basics.blockchainChain}</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <span>Token</span>
                <span>
                  {tokenInfo ? (
                    <>
                      <strong>{tokenInfo.symbol}</strong> ({tokenInfo.name})
                    </>
                  ) : 'Not validated'}
                </span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <span>Duration</span>
                <strong>{formData.basics.projectDeadlineDate} days</strong>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <span>Contract Owner</span>
                <code className="contract-owner-code">{formData.basics.contractOwnerAddress}</code>
              </ListGroup.Item>
            </ListGroup>
            
            <h5>Milestones</h5>
            <ListGroup className="mb-4">
              {formData.milestones.map((milestone, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                  <span>{milestone.title}</span>
                  <strong>{milestone.targetAmount} {formData.basics.projectFundCurrency}</strong>
                </ListGroup.Item>
              ))}
            </ListGroup>
            
            <h5>Gas Fee Estimate</h5>
            {getGasFeeSummary()}
            
            <hr />
            
            <h5>Confirmation Checklist</h5>
            <ListGroup className="mb-4 checklist-group">
              <ListGroup.Item 
                action 
                onClick={() => toggleChecklistItem('reviewedDetails')}
                className={checklist.reviewedDetails ? 'checked' : ''}
              >
                <FontAwesomeIcon 
                  icon={checklist.reviewedDetails ? faCheckCircle : faExclamationTriangle} 
                  className={`me-2 ${checklist.reviewedDetails ? 'text-success' : 'text-warning'}`}
                />
                I have reviewed all campaign details and they are correct
              </ListGroup.Item>
              <ListGroup.Item 
                action 
                onClick={() => toggleChecklistItem('confirmedOwner')}
                className={checklist.confirmedOwner ? 'checked' : ''}
              >
                <FontAwesomeIcon 
                  icon={checklist.confirmedOwner ? faCheckCircle : faExclamationTriangle} 
                  className={`me-2 ${checklist.confirmedOwner ? 'text-success' : 'text-warning'}`}
                />
                I confirm the contract owner address is correct (this wallet will receive funds)
              </ListGroup.Item>
              <ListGroup.Item 
                action 
                onClick={() => toggleChecklistItem('walletConnected')}
                className={checklist.walletConnected ? 'checked' : ''}
              >
                <FontAwesomeIcon 
                  icon={checklist.walletConnected ? faCheckCircle : faExclamationTriangle} 
                  className={`me-2 ${checklist.walletConnected ? 'text-success' : 'text-warning'}`}
                />
                My wallet is connected and I am on the {formData.basics.blockchainChain} network
              </ListGroup.Item>
              <ListGroup.Item 
                action 
                onClick={() => toggleChecklistItem('hasEnoughGas')}
                className={checklist.hasEnoughGas ? 'checked' : ''}
              >
                <FontAwesomeIcon 
                  icon={checklist.hasEnoughGas ? faCheckCircle : faExclamationTriangle} 
                  className={`me-2 ${checklist.hasEnoughGas ? 'text-success' : 'text-warning'}`}
                />
                I have enough funds in my wallet to cover the gas fees
              </ListGroup.Item>
            </ListGroup>
            
            <Alert variant="warning">
              <FontAwesomeIcon icon={faWallet} className="me-2" />
              <strong>Important:</strong> Once created, your campaign will be live on the blockchain. The contract's ownership cannot be transferred after deployment.
            </Alert>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!submitting && (
          <>
            <Button variant="outline-secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={onConfirm} 
              disabled={!allChecked || submitting}
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creating...
                </>
              ) : (
                'Create Campaign'
              )}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default SubmitConfirmationModal; 