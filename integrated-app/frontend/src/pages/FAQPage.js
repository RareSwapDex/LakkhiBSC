import React from 'react';
import { Container, Accordion } from 'react-bootstrap';

const FAQPage = () => {
  return (
    <Container className="my-5">
      <h1 className="text-center mb-5">Frequently Asked Questions</h1>
      
      <Accordion defaultActiveKey="0" className="mb-5">
        <Accordion.Item eventKey="0">
          <Accordion.Header>What is Lakkhi Fund?</Accordion.Header>
          <Accordion.Body>
            Lakkhi Fund is a decentralized crowdfunding platform designed specifically for Web3 projects and token creators. Unlike traditional fundraising platforms, Lakkhi Fund allows projects to raise funds in their own tokens while enabling contributions from both crypto and non-crypto users.
          </Accordion.Body>
        </Accordion.Item>
        
        <Accordion.Item eventKey="1">
          <Accordion.Header>How do I start a campaign?</Accordion.Header>
          <Accordion.Body>
            To start a campaign, connect your wallet, navigate to the "Create Campaign" page, and fill out the required information including your project details and token address. Once submitted, your campaign will be deployed to the blockchain.
          </Accordion.Body>
        </Accordion.Item>
        
        <Accordion.Item eventKey="2">
          <Accordion.Header>How do I contribute to a project?</Accordion.Header>
          <Accordion.Body>
            You can contribute to projects either using cryptocurrency through your Web3 wallet or via credit card. The platform will automatically convert your contribution to the project's token.
          </Accordion.Body>
        </Accordion.Item>
        
        <Accordion.Item eventKey="3">
          <Accordion.Header>What are the fees?</Accordion.Header>
          <Accordion.Body>
            Lakkhi Fund charges a small fee for campaign creation and a percentage of each contribution. The exact fee structure can be found in our documentation.
          </Accordion.Body>
        </Accordion.Item>
        
        <Accordion.Item eventKey="4">
          <Accordion.Header>Is my data secure?</Accordion.Header>
          <Accordion.Body>
            Yes, we take security seriously. We use wallet-based authentication and don't store private keys. All transactions are secured by blockchain technology.
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      
      <h3 className="mb-3">Still have questions?</h3>
      <p>If you couldn't find the answer to your question, please contact our support team at support@lakkhifund.com</p>
    </Container>
  );
};

export default FAQPage; 