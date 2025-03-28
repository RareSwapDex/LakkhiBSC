import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import TokenSelector from './TokenSelector';

const CreateCampaignForm = () => {
  const [formData, setFormData] = useState({
    tokenAddress: '',
    blockchainChain: '',
  });

  const handleTokenValidation = (address, tokenInfo) => {
    let network = '';
    switch (tokenInfo.chainId) {
      case '0x1':
        network = 'Ethereum';
        break;
      case '0x38':
        network = 'BSC';
        break;
      case '0x61':
        network = 'BSC Testnet';
        break;
      default:
        network = 'Unknown';
    }

    setFormData(prev => ({
      ...prev,
      tokenAddress: address,
      blockchainChain: network
    }));
  };

  return (
    <Form>
      <TokenSelector onTokenSelect={handleTokenValidation} />

      <Form.Group className="mb-3">
        <Form.Label>Blockchain Chain</Form.Label>
        <Form.Control
          type="text"
          value={formData.blockchainChain}
          disabled={true}
          placeholder="Chain will be auto-populated when token is validated"
          className="bg-light"
        />
        <Form.Text className="text-muted">
          This field is automatically set based on the token's network
        </Form.Text>
      </Form.Group>
    </Form>
  );
};

export default CreateCampaignForm; 