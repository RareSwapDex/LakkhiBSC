import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="not-found-container mt-5">
            <h1 className="display-1">404</h1>
            <h2 className="mb-4">Page Not Found</h2>
            
            <p className="lead mb-5">
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            <Link to="/">
              <Button variant="primary" size="lg">
                Return to Home Page
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage; 