import React, { useContext, useEffect } from 'react';
import { Navbar as BootstrapNavbar, Container, Nav, Button, Badge } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { ProviderContext } from '../web3/ProviderContext';

const Navbar = () => {
  const { account, isConnected, connectWallet, disconnectWallet } = useContext(ProviderContext);

  // Format the wallet address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check for wallet connection on component mount
  useEffect(() => {
    // Check localStorage for verified wallet
    const verifiedWallet = localStorage.getItem('lakkhi_verified_wallet');
    if (verifiedWallet && !isConnected) {
      // Try to reconnect wallet
      connectWallet();
    }
  }, [connectWallet, isConnected]);

  return (
    <BootstrapNavbar bg="light" expand="lg" className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          Lakkhi Funding
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
              <Button variant="primary" size="sm" onClick={connectWallet}>
                Connect Wallet
              </Button>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 