import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button, Spinner, Badge, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSearch, faWallet, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Web3 from 'web3';
import './styles.css';

/**
 * ContractOwnerSelector Component
 * 
 * Allows user to select a wallet address as contract owner
 * with validation and option to use connected wallet
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current wallet address
 * @param {Function} props.onChange - Change handler function
 * @param {string} props.connectedWallet - Current connected wallet address
 * @param {Function} props.onValidate - Validation callback
 */
const ContractOwnerSelector = ({ 
  value,
  onChange,
  connectedWallet, 
  onValidate 
}) => {
  const [address, setAddress] = useState(value || connectedWallet || '');
  const [ensName, setEnsName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [error, setError] = useState('');
  const [useConnectedWallet, setUseConnectedWallet] = useState(true);
  
  // When connectedWallet changes and useConnectedWallet is true, update the address
  useEffect(() => {
    if (useConnectedWallet && connectedWallet) {
      setAddress(connectedWallet);
      onChange(connectedWallet);
      validateAddress(connectedWallet);
    }
  }, [connectedWallet, useConnectedWallet, onChange]);
  
  // When external value changes, update our internal state
  useEffect(() => {
    if (value !== address) {
      setAddress(value || '');
      if (value) {
        validateAddress(value);
        setUseConnectedWallet(value === connectedWallet);
      }
    }
  }, [value, connectedWallet]);
  
  const validateAddress = async (addressToValidate) => {
    if (!addressToValidate) {
      setIsValidAddress(false);
      setError('Contract owner address is required');
      return false;
    }
    
    setIsValidating(true);
    setError('');
    
    try {
      // Check if it's a valid address
      if (Web3.utils.isAddress(addressToValidate)) {
        setIsValidAddress(true);
        
        // Look up ENS name if available
        await lookupEns(addressToValidate);
        
        // Call validation callback if provided
        if (onValidate) {
          onValidate(true, addressToValidate);
        }
        
        return true;
      } else if (addressToValidate.endsWith('.eth')) {
        // This looks like an ENS name, try to resolve it
        const resolvedAddress = await resolveEns(addressToValidate);
        if (resolvedAddress) {
          setAddress(resolvedAddress);
          onChange(resolvedAddress);
          setIsValidAddress(true);
          setEnsName(addressToValidate);
          
          if (onValidate) {
            onValidate(true, resolvedAddress);
          }
          
          return true;
        } else {
          setError('Could not resolve ENS name');
          setIsValidAddress(false);
        }
      } else {
        setError('Invalid Ethereum address format');
        setIsValidAddress(false);
      }
    } catch (err) {
      console.error('Error validating address:', err);
      setError('Error validating address');
      setIsValidAddress(false);
    } finally {
      setIsValidating(false);
    }
    
    if (onValidate) {
      onValidate(false);
    }
    
    return false;
  };
  
  const lookupEns = async (addressToLookup) => {
    // Only available if window.ethereum exists and we're on mainnet
    if (window.ethereum) {
      try {
        const provider = new Web3(window.ethereum);
        // This is a simplified example - actual ENS resolution requires additional methods
        // or libraries like ethers.js
        // For demo purposes, we'll just check if we're on mainnet
        const chainId = await provider.eth.getChainId();
        if (chainId === 1) { // Ethereum mainnet
          // Normally we would use provider.lookupAddress or ethers.js equivalent
          // This is a placeholder implementation - in a real app you'd use a proper ENS library
          setEnsName(''); // Clear any previous ENS name
        }
      } catch (err) {
        console.error('Error looking up ENS name:', err);
        setEnsName('');
      }
    }
  };
  
  const resolveEns = async (name) => {
    // Only available if window.ethereum exists and we're on mainnet
    if (window.ethereum) {
      try {
        const provider = new Web3(window.ethereum);
        const chainId = await provider.eth.getChainId();
        if (chainId === 1) { // Ethereum mainnet
          // Normally we would use provider.resolveName or ethers.js equivalent
          // This is a placeholder implementation - in a real app you'd use a proper ENS library
          return null; // Placeholder - actually returning null here to represent ENS lookup not implemented
        }
      } catch (err) {
        console.error('Error resolving ENS name:', err);
      }
    }
    return null;
  };
  
  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    setUseConnectedWallet(newAddress === connectedWallet);
    onChange(newAddress);
    
    // Clear validation state
    setIsValidAddress(false);
    setError('');
  };
  
  const handleValidate = () => {
    validateAddress(address);
  };
  
  const handleUseConnectedWallet = () => {
    if (connectedWallet) {
      setAddress(connectedWallet);
      onChange(connectedWallet);
      setUseConnectedWallet(true);
      validateAddress(connectedWallet);
    }
  };
  
  return (
    <div className="contract-owner-selector mb-3">
      <Form.Label>
        Contract Owner Address (for fund management)
        {isValidAddress && ensName && (
          <Badge bg="info" className="ms-2">{ensName}</Badge>
        )}
      </Form.Label>
      
      <InputGroup className="mb-2">
        <InputGroup.Text>
          <FontAwesomeIcon icon={faWallet} />
        </InputGroup.Text>
        <Form.Control
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="0x... or ENS name"
          className={error ? 'is-invalid' : isValidAddress ? 'is-valid' : ''}
        />
        {isValidating ? (
          <Button variant="outline-secondary" disabled>
            <Spinner animation="border" size="sm" />
          </Button>
        ) : (
          <Button 
            variant={isValidAddress ? 'success' : 'outline-secondary'} 
            onClick={handleValidate}
          >
            {isValidAddress ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faSearch} />}
          </Button>
        )}
        
        {connectedWallet && (
          <Button 
            variant={useConnectedWallet ? 'primary' : 'outline-primary'}
            onClick={handleUseConnectedWallet}
            title="Use connected wallet"
          >
            My Wallet
          </Button>
        )}
      </InputGroup>
      
      {error && (
        <div className="text-danger mb-2">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
          {error}
        </div>
      )}
      
      <Alert variant="info" className="contract-owner-info">
        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
        <strong>Important:</strong> This wallet will be the owner of the campaign's smart contract. Only this wallet address 
        will be able to withdraw or manage funds. Make sure it's correct as ownership cannot be transferred later.
        {connectedWallet && (
          <div className="mt-2">
            <strong>Tip:</strong> {useConnectedWallet 
              ? "You're using your connected wallet. Funds will be sent to your wallet." 
              : "You've specified a different wallet than your connected one. Funds will be sent to that wallet."}
          </div>
        )}
      </Alert>
    </div>
  );
};

export default ContractOwnerSelector; 