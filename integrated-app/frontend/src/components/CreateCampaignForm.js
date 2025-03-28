import React, { useState } from 'react';
import { Form, Container, Row, Col, Button } from 'react-bootstrap';
import TokenSelector from './TokenSelector';

const CreateCampaignForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tokenAddress: '',
    blockchainChain: '',
    description: '',
    fundingGoal: '',
    currency: 'USD'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTokenValidation = (address, tokenInfo) => {
    // Map chainId to network name
    let network = '';
    const chainIdHex = tokenInfo.chainId.toString().startsWith('0x') 
      ? tokenInfo.chainId 
      : '0x' + Number(tokenInfo.chainId).toString(16);
      
    switch (chainIdHex) {
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
        network = `Chain ID: ${tokenInfo.chainId}`;
    }

    setFormData(prev => ({
      ...prev,
      tokenAddress: address,
      blockchainChain: network
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic here
    console.log('Submitting form with data:', formData);
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Campaign Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a clear, descriptive title"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Category <span className="text-danger">*</span></Form.Label>
              <Form.Select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                <option value="NFT">NFT</option>
                <option value="DeFi">DeFi</option>
                <option value="GameFi">GameFi</option>
                <option value="DAO">DAO</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <TokenSelector onTokenSelect={handleTokenValidation} />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Blockchain Chain <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="blockchainChain"
                value={formData.blockchainChain}
                readOnly
                disabled
                placeholder="Chain will be auto-populated when token is validated"
                className="bg-light"
              />
              <Form.Text className="text-muted">
                This field is automatically determined based on the token's network
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Brief Description <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe your project (max 300 characters)"
                rows={3}
                maxLength={300}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Funding Goal <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="fundingGoal"
                value={formData.fundingGoal}
                onChange={handleChange}
                placeholder="Enter amount"
                min="1"
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Currency <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col className="d-flex justify-content-end">
            <Button variant="primary" type="submit">
              Create Campaign
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default CreateCampaignForm; 