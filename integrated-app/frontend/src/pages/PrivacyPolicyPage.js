import React from 'react';
import { Container } from 'react-bootstrap';

const PrivacyPolicyPage = () => {
  return (
    <Container className="my-5">
      <h1 className="mb-4">Privacy Policy</h1>
      
      <p>Last updated: March 28, 2023</p>
      
      <h2 className="mt-4">1. Introduction</h2>
      <p>
        Welcome to Lakkhi Fund. We respect your privacy and are committed to protecting your personal data.
        This privacy policy will inform you as to how we look after your personal data when you visit our website
        and tell you about your privacy rights and how the law protects you.
      </p>
      
      <h2 className="mt-4">2. Data We Collect</h2>
      <p>
        We may collect, use, store and transfer different kinds of personal data about you including:
      </p>
      <ul>
        <li>Identity Data: includes wallet address, username or similar identifier</li>
        <li>Contact Data: includes email address</li>
        <li>Technical Data: includes internet protocol (IP) address, browser type and version, etc.</li>
        <li>Usage Data: includes information about how you use our website and services</li>
        <li>Transaction Data: includes details about payments to and from you and other details of services you have purchased</li>
      </ul>
      
      <h2 className="mt-4">3. How We Use Your Data</h2>
      <p>
        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
      </p>
      <ul>
        <li>To provide our services to you</li>
        <li>To improve our website and user experience</li>
        <li>To communicate with you about our services</li>
        <li>To comply with legal obligations</li>
      </ul>
      
      <h2 className="mt-4">4. Data Security</h2>
      <p>
        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
        used or accessed in an unauthorized way, altered or disclosed. We limit access to your personal data to those employees, 
        agents, contractors and other third parties who have a business need to know.
      </p>
      
      <h2 className="mt-4">5. Your Legal Rights</h2>
      <p>
        Under certain circumstances, you have rights under data protection laws in relation to your personal data, including:
      </p>
      <ul>
        <li>Request access to your personal data</li>
        <li>Request correction of your personal data</li>
        <li>Request erasure of your personal data</li>
        <li>Object to processing of your personal data</li>
        <li>Request restriction of processing your personal data</li>
        <li>Request transfer of your personal data</li>
        <li>Right to withdraw consent</li>
      </ul>
      
      <h2 className="mt-4">6. Contact Us</h2>
      <p>
        If you have any questions about this privacy policy or our privacy practices, please contact us at:
        privacy@lakkhifund.com
      </p>
    </Container>
  );
};

export default PrivacyPolicyPage; 