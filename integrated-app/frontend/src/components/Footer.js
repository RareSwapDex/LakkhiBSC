import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaTelegram, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5>Lakkhi Fund</h5>
            <p>Empowering projects through blockchain fundraising with 100% donation pass-through.</p>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-light">Home</Link></li>
              <li><Link to="/projects" className="text-light">Explore Campaigns</Link></li>
              <li><Link to="/whitepaper" className="text-light">Whitepaper</Link></li>
              <li><Link to="/faq" className="text-light">FAQ</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <p><FaEnvelope className="me-2" /> <a href="mailto:support@lakkhifoundation.org" className="text-light">support@lakkhifoundation.org</a></p>
            <p><FaTelegram className="me-2" /> <a href="https://t.me/lakkhirhino" className="text-light" target="_blank" rel="noopener noreferrer">@lakkhirhino</a></p>
            <p><FaGithub className="me-2" /> <a href="https://github.com/lakkhi-fund" className="text-light" target="_blank" rel="noopener noreferrer">GitHub</a></p>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} Lakkhi Fund. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 