import React, { useContext, useEffect } from 'react';
import { Navbar as BootstrapNavbar, Container, Nav, Button, Badge, Spinner } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { ProviderContext } from '../web3/ProviderContext';

const Navbar = () => {
  const { account, isConnected, isInitialized, isLoading, connectWallet, disconnectWallet } = useContext(ProviderContext);

  // Format the wallet address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check for wallet connection on component mount
  useEffect(() => {
    // Only try auto-connect if wallet provider is initialized and not already connected
    if (isInitialized && !isConnected && !isLoading) {
      // Check localStorage for verified wallet
      const verifiedWallet = localStorage.getItem('lakkhi_verified_wallet');
      if (verifiedWallet) {
        // Try to reconnect wallet
        console.log('Auto-connecting wallet from localStorage');
        connectWallet().catch(err => {
          console.warn('Auto-connect failed:', err);
        });
      }
    }
  }, [connectWallet, isConnected, isInitialized, isLoading]);

  // Render the wallet connection button based on state
  const renderWalletButton = () => {
    if (!isInitialized) {
      // Provider not yet initialized, show loading state
      return (
        <Button variant="outline-secondary" size="sm" disabled>
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
          Initializing...
        </Button>
      );
    }

    if (isConnected && account) {
      // Wallet connected, show address and disconnect button
      return (
        <div className="d-flex align-items-center">
          <Badge bg="success" className="me-2">
            {formatAddress(account)}
          </Badge>
          <Button variant="outline-danger" size="sm" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </div>
      );
    }

    // Wallet not connected, show connect button (with loading state if applicable)
    return (
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
    );
  };

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
            {renderWalletButton()}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 