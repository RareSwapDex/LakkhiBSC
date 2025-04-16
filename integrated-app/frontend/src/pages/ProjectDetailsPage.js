import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Badge, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import IncentiveCard from '../components/IncentiveCard';
import Web3 from 'web3';
import { FaEthereum } from 'react-icons/fa';
import { SiBinance } from 'react-icons/si';
import { BsCoin } from 'react-icons/bs';

// Explorer URL mapping
const EXPLORER_URLS = {
  'Ethereum': 'https://etherscan.io',
  'BSC': 'https://bscscan.com',
  'Base': 'https://basescan.org'
};

// Chain icons mapping
const ChainIcon = ({ chain }) => {
  switch(chain) {
    case 'Ethereum':
      return <FaEthereum className="me-2" />;
    case 'BSC':
      return <SiBinance className="me-2" />;
    case 'Base':
      return <BsCoin className="me-2" />;
    default:
      return null;
  }
};

const ProjectDetailsPage = () => {
  const { id } = useParams();
  
  const [project, setProject] = useState(null);
  const [incentives, setIncentives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [refundStatus, setRefundStatus] = useState(null);
  const [hasContributed, setHasContributed] = useState(false);
  
  // Check if user has MetaMask installed
  const hasMetaMask = typeof window !== 'undefined' && window.ethereum;
  
  // Connect wallet function
  const connectWallet = async () => {
    if (!hasMetaMask) {
      setError('Please install MetaMask to connect your wallet');
      return;
    }
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const connectedWallet = accounts[0];
      setWallet(connectedWallet);
      
      // Check if the user has contributed to this project
      if (project && project.contract_address) {
        checkContribution(connectedWallet, project.contract_address);
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    }
  };
  
  // Check if the connected wallet has contributed to this project
  const checkContribution = async (userWallet, contractAddress) => {
    try {
      if (!userWallet || !contractAddress) return;
      
      const web3 = new Web3(window.ethereum);
      
      // Define minimal ABI to check contributions
      const minABI = [
        {
          "inputs": [{"name": "contributor", "type": "address"}],
          "name": "getContribution",
          "outputs": [{"name": "amount", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
      const contract = new web3.eth.Contract(minABI, contractAddress);
      const contribution = await contract.methods.getContribution(userWallet).call();
      
      setHasContributed(parseInt(contribution) > 0);
    } catch (err) {
      console.error('Error checking contribution:', err);
    }
  };
  
  // Claim refund function
  const claimRefund = async () => {
    if (!wallet || !project || !project.contract_address) {
      setError('Please connect your wallet first');
      return;
    }
    
    setIsProcessingRefund(true);
    setRefundStatus(null);
    
    try {
      const web3 = new Web3(window.ethereum);
      
      // Define minimal ABI for refund claim
      const minABI = [
        {
          "inputs": [],
          "name": "claimRefund",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];
      
      const contract = new web3.eth.Contract(minABI, project.contract_address);
      
      // Request transaction to claim refund
      const tx = await contract.methods.claimRefund().send({
        from: wallet
      });
      
      if (tx.status) {
        setRefundStatus({
          success: true,
          message: 'Refund claimed successfully!',
          txHash: tx.transactionHash
        });
        setHasContributed(false);
      } else {
        setRefundStatus({
          success: false,
          message: 'Transaction failed. Please try again.'
        });
      }
    } catch (err) {
      console.error('Error claiming refund:', err);
      setRefundStatus({
        success: false,
        message: err.message || 'Failed to claim refund. Please try again.'
      });
    } finally {
      setIsProcessingRefund(false);
    }
  };
  
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch project details
        const projectResponse = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/projects/${id}/`);
        setProject(projectResponse.data);
        
        // Fetch incentives
        const incentivesResponse = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/incentives/${id}/`);
        setIncentives(incentivesResponse.data.incentives);
        
        setLoading(false);
        
        // If wallet is already connected, check contribution
        if (wallet && projectResponse.data.contract_address) {
          checkContribution(wallet, projectResponse.data.contract_address);
        }
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [id, wallet]);
  
  // Listen for wallet changes
  useEffect(() => {
    if (hasMetaMask) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setWallet(null);
          setHasContributed(false);
        } else {
          // User switched accounts
          setWallet(accounts[0]);
          if (project && project.contract_address) {
            checkContribution(accounts[0], project.contract_address);
          }
        }
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [hasMetaMask, project]);
  
  if (loading) {
    return <Container className="py-5 text-center"><p>Loading project details...</p></Container>;
  }
  
  if (error) {
    return <Container className="py-5 text-center"><Alert variant="danger">{error}</Alert></Container>;
  }
  
  if (!project) {
    return <Container className="py-5 text-center"><Alert variant="warning">Project not found</Alert></Container>;
  }
  
  // Calculate funding progress
  const progressPercentage = 
    project.fund_amount > 0 
      ? Math.min(100, (project.raised_amount / project.fund_amount) * 100) 
      : 0;
  
  // Check if project has failed to reach its target and ended
  const projectFailed = project.end_date && 
                        new Date(project.end_date) < new Date() && 
                        progressPercentage < 100 &&
                        project.enable_auto_refund === true;
  
  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Get explorer URL for the current blockchain
  const getExplorerUrl = (address) => {
    const chain = project.chain || 'BSC'; // Default to BSC if not specified
    const baseUrl = EXPLORER_URLS[chain] || EXPLORER_URLS.BSC;
    return `${baseUrl}/address/${address}`;
  };
  
  // Get transaction explorer URL
  const getTransactionExplorerUrl = (txHash) => {
    const chain = project.chain || 'BSC'; // Default to BSC if not specified
    const baseUrl = EXPLORER_URLS[chain] || EXPLORER_URLS.BSC;
    return `${baseUrl}/tx/${txHash}`;
  };
  
  return (
    <Container className="py-4">
      {/* Project Header */}
      <Card className="mb-4">
        <Row className="g-0">
          <Col md={4}>
            <img 
              src={project.thumbnail || 'https://via.placeholder.com/400x300'} 
              alt={project.title}
              className="img-fluid rounded-start"
              style={{ height: '100%', objectFit: 'cover' }}
            />
          </Col>
          <Col md={8}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <Card.Title as="h1">{project.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    by {project.owner_username}
                  </Card.Subtitle>
                  
                  {/* Blockchain Badge */}
                  <div className="mt-2">
                    <Badge bg="info" className="p-2 d-inline-flex align-items-center">
                      <ChainIcon chain={project.chain || 'BSC'} />
                      Deployed on {project.chain || 'BSC'}
                    </Badge>
                  </div>
                </div>
                
                {project.category && (
                  <Badge bg="secondary">{project.category}</Badge>
                )}
              </div>
              
              <Card.Text>{project.head}</Card.Text>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong>${project.raised_amount.toFixed(2)} raised of ${project.fund_amount.toFixed(2)}</strong>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </div>
                <ProgressBar 
                  now={progressPercentage} 
                  variant={progressPercentage >= 100 ? "success" : "primary"}
                />
              </div>
              
              <div className="d-flex flex-wrap justify-content-between">
                <div className="mb-2 me-3">
                  <small className="text-muted d-block">Supporters</small>
                  <strong>{project.number_of_donators || 0}</strong>
                </div>
                <div className="mb-2 me-3">
                  <small className="text-muted d-block">Followers</small>
                  <strong>{project.number_of_subscribed_users || 0}</strong>
                </div>
                <div className="mb-2">
                  <small className="text-muted d-block">Status</small>
                  <Badge bg={project.live ? "success" : projectFailed ? "danger" : "secondary"}>
                    {project.live ? "Live" : projectFailed ? "Failed" : "Ended"}
                  </Badge>
                </div>
              </div>
              
              {/* Funding buttons based on project state */}
              <div className="mt-3">
                {project.live && (
                  <Button 
                    as={Link} 
                    to={`/donate/${project.id}`} 
                    variant="primary"
                    size="lg"
                    className="w-100"
                  >
                    Support This Campaign
                  </Button>
                )}
                
                {/* Refund claim button for failed projects */}
                {projectFailed && (
                  <>
                    {wallet ? (
                      <>
                        {hasContributed ? (
                          <Button 
                            variant="warning"
                            size="lg"
                            className="w-100"
                            onClick={claimRefund}
                            disabled={isProcessingRefund}
                          >
                            {isProcessingRefund ? 'Processing...' : 'Claim Refund'}
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary"
                            size="lg"
                            className="w-100"
                            disabled
                          >
                            No Refund Available
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button 
                        variant="primary"
                        size="lg"
                        className="w-100"
                        onClick={connectWallet}
                      >
                        Connect Wallet to Claim Refund
                      </Button>
                    )}
                    
                    {refundStatus && (
                      <Alert 
                        variant={refundStatus.success ? "success" : "danger"}
                        className="mt-2"
                      >
                        {refundStatus.message}
                        {refundStatus.txHash && (
                          <div className="mt-1">
                            <small>
                              Transaction: <a 
                                href={getTransactionExplorerUrl(refundStatus.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View on {project.chain || 'BSC'} Explorer
                              </a>
                            </small>
                          </div>
                        )}
                      </Alert>
                    )}
                  </>
                )}
              </div>
            </Card.Body>
          </Col>
        </Row>
      </Card>
      
      <Row>
        {/* Project Details */}
        <Col md={8} className="mb-4">
          <Card>
            <Card.Header>
              <h3 className="mb-0">About This Campaign</h3>
            </Card.Header>
            <Card.Body>
              <div dangerouslySetInnerHTML={{ __html: project.description }} />
              
              {/* Contract information */}
              {project.contract_address && (
                <div className="mt-4 pt-4 border-top">
                  <h5 className="d-flex align-items-center">
                    <ChainIcon chain={project.chain || 'BSC'} />
                    Contract Information
                  </h5>
                  <p>
                    This campaign is deployed on the <strong>{project.chain || 'BSC'}</strong> blockchain.
                  </p>
                  <p className="mb-2">
                    <strong>Contract Address:</strong> <br />
                    <code className="d-block mt-1">
                      <a 
                        href={getExplorerUrl(project.contract_address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-break"
                      >
                        {project.contract_address}
                      </a>
                    </code>
                  </p>
                  <Alert variant="info" className="mt-3">
                    <small>
                      When you donate to this campaign with your credit card, your funds will be converted to {project.token_symbol || 'tokens'} using 
                      {project.chain === 'Ethereum' || project.chain === 'Base' ? ' Uniswap ' : ' PancakeSwap '}
                      and sent directly to the campaign smart contract.
                    </small>
                  </Alert>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        {/* Incentives Panel */}
        <Col md={4}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">Rewards</h3>
            </Card.Header>
            <Card.Body>
              {incentives.length === 0 ? (
                <p>No rewards available for this campaign.</p>
              ) : (
                incentives.map(incentive => (
                  <IncentiveCard 
                    key={incentive.id}
                    incentive={incentive}
                    onSelect={() => {}}
                  />
                ))
              )}
              
              {project.live && (
                <div className="d-grid gap-2 mt-3">
                  <Button 
                    as={Link} 
                    to={`/donate/${project.id}`} 
                    variant="primary"
                  >
                    Support This Campaign
                  </Button>
                </div>
              )}
              
              {/* Show refund info for failed projects */}
              {projectFailed && (
                <Alert variant="info" className="mt-3">
                  <Alert.Heading>Refund Available</Alert.Heading>
                  <p>
                    This campaign did not reach its funding goal and has ended. 
                    If you contributed to this campaign, you can claim a refund.
                  </p>
                  {!wallet && (
                    <Button 
                      variant="outline-primary"
                      onClick={connectWallet}
                      className="mt-2"
                    >
                      Connect Wallet
                    </Button>
                  )}
                </Alert>
              )}
              
              {/* Blockchain info card */}
              <Card className="mt-3 border-info">
                <Card.Header className="bg-info text-white d-flex align-items-center">
                  <ChainIcon chain={project.chain || 'BSC'} />
                  <span>{project.chain || 'BSC'} Network</span>
                </Card.Header>
                <Card.Body>
                  <small className="text-muted">
                    To interact directly with this campaign, make sure your wallet is connected to the {project.chain || 'BSC'} network.
                    {project.token_symbol && (
                      <span> Donations will be converted to {project.token_symbol} tokens.</span>
                    )}
                  </small>
                  
                  {project.token_address && (
                    <div className="mt-2">
                      <small>
                        <strong>Token:</strong> {project.token_symbol || 'Custom Token'} 
                        {project.token_address && (
                          <a 
                            href={getExplorerUrl(project.token_address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ms-2 text-decoration-none"
                          >
                            <small>(View on Explorer)</small>
                          </a>
                        )}
                      </small>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectDetailsPage; 