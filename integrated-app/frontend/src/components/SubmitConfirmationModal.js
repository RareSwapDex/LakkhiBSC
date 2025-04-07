import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

/**
 * SubmitConfirmationModal Component
 * 
 * Confirms campaign submission with user
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether modal is visible
 * @param {Function} props.onHide - Function to hide modal
 * @param {Function} props.onConfirm - Function to confirm submission
 * @param {Object} props.formData - Campaign form data
 * @param {Object} props.gasEstimate - Estimated gas costs
 */
const SubmitConfirmationModal = ({ show, onHide, onConfirm, formData, gasEstimate }) => {
  // Format currency display
  const formatCurrency = (value, decimals = 2) => {
    return parseFloat(value).toFixed(decimals);
  };
  
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Campaign Submission</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Alert variant="info">
          <p className="mb-0">
            <strong>Important:</strong> Submitting this campaign will deploy a real
            smart contract on the blockchain. This requires gas fees and cannot be undone.
          </p>
        </Alert>
        
        <h5 className="mt-4 mb-3">Campaign Summary</h5>
        
        <div className="summary-container p-3 border rounded mb-4">
          <div className="mb-2"><strong>Title:</strong> {formData.basics.projectTitle}</div>
          <div className="mb-2"><strong>Funding Goal:</strong> {formatCurrency(formData.basics.projectFundAmount)} tokens</div>
          <div className="mb-2"><strong>Deadline:</strong> {formData.basics.projectDeadlineDate} days</div>
          <div className="mb-2"><strong>Contract Owner:</strong> {formData.basics.contractOwnerAddress}</div>
          <div><strong>Token Address:</strong> {formData.basics.tokenAddress}</div>
        </div>
        
        {gasEstimate && (
          <div className="gas-estimate p-3 border rounded bg-light mb-4">
            <h5 className="mb-3">Estimated Gas Fees</h5>
            <div className="mb-2"><strong>Gas Amount:</strong> {gasEstimate.gas_amount} units</div>
            <div className="mb-2"><strong>Gas Price:</strong> {gasEstimate.gas_price_gwei} Gwei</div>
            <div className="mb-2"><strong>Cost (ETH):</strong> {gasEstimate.cost_eth}</div>
            <div><strong>Estimated Cost (USD):</strong> ${gasEstimate.cost_usd.toFixed(2)}</div>
          </div>
        )}
        
        <Alert variant="warning">
          <p className="mb-0">
            By clicking "Submit Campaign", you agree that you have reviewed all the details
            and understand that this will deploy a real contract on-chain.
          </p>
        </Alert>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Submit Campaign
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SubmitConfirmationModal; 