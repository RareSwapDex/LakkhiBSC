import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import TokenSelector from './TokenSelector';

const CreateCampaignForm = () => {
  const [formData, setFormData] = useState({
    blockchainChain: '',
  });

  const handleTokenValidation = (address, tokenInfo) => {
    setFormData(prev => ({
      ...prev,
      tokenAddress: address,
      blockchainChain: tokenInfo.network
    }));
  };

  const handleChainSelect = (network) => {
    setFormData(prev => ({
      ...prev,
      blockchainChain: network
    }));
  };

  return (
    <Form>
      <TokenSelector 
        onTokenSelect={handleTokenValidation}
        onChainSelect={handleChainSelect}
      />

      <Form.Group className="mb-3">
        <Form.Label>Blockchain Chain</Form.Label>
        <Form.Control
          type="text"
          value={formData.blockchainChain}
          disabled={true}
          placeholder="Chain will be auto-populated based on token"
        />
        <Form.Text className="text-muted">
          This field is automatically set based on the validated token's network.
        </Form.Text>
      </Form.Group>
    </Form>
  );
};

export default CreateCampaignForm; 