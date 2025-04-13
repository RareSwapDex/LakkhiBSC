import React, { useContext } from 'react';
import { Navbar as BootstrapNavbar, Container, Nav, Button, Badge, Spinner } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { ProviderContext } from '../web3/ProviderContext';
import './Navbar.css';

const Navbar = () => {
  const { account, isConnected, isLoading, connectWallet, disconnectWallet } = useContext(ProviderContext);

  // Format the wallet address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <BootstrapNavbar bg="light" expand="lg" className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img 
            src="/images/logo-final.png" 
            alt="Lakkhi Fund" 
            height="70" 
            className="d-inline-block align-top"
          />
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/projects">
              Explore Campaigns
            </Nav.Link>
            <Nav.Link as={NavLink} to="/faq">
              FAQ
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={NavLink} to="/admin">
              Admin Dashboard
            </Nav.Link>
            {isConnected && account ? (
              <div className="d-flex align-items-center">
                <Badge bg="success" className="me-2">
                  {formatAddress(account)}
                </Badge>
                <Button variant="outline-danger" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={connectWallet}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                    Connecting...
                  </>
                ) : (
                  'Connect Wallet'
                )}
              </Button>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 