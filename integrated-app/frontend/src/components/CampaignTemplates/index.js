import React, { useState } from 'react';
import { Row, Col, Card, Container, Badge, Button } from 'react-bootstrap';
import { 
  FaLeaf, 
  FaGraduationCap, 
  FaVrCardboard, 
  FaPeopleCarry, 
  FaRobot, 
  FaBuilding, 
  FaGamepad,
  FaChartLine,
  FaPencilAlt,
  FaCheck,
  FaMousePointer,
  FaHandHoldingHeart,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import './CampaignTemplates.css';

const CampaignTemplates = ({ onSelectTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showAllTemplates, setShowAllTemplates] = useState(false);

  const templates = [
    {
      id: 'conservation',
      icon: <FaLeaf size={32} />,
      title: 'Conservation Token',
      description: 'Fund environmental initiatives with a token that supports conservation efforts.',
      goal: '8000',
      duration: 30,
      categories: ['Conservation', 'Environment', 'Impact'],
      detailedDescription: 'Create a conservation-focused token that generates ongoing funding for environmental projects. Donors receive tokens that provide governance rights and unique ecosystem benefits.',
      priority: 1
    },
    {
      id: 'charity',
      icon: <FaHandHoldingHeart size={32} />,
      title: 'Charity Token',
      description: `Support animal shelters, rescue centers, children's causes and more.`,
      goal: '10000',
      duration: 30,
      categories: ['Charity', 'Nonprofit', 'Social Impact'],
      detailedDescription: `Expand your charity-focused token that supports animal welfare, children's causes, and humanitarian efforts. Token holders participate in decision-making for fund allocation and gain access to impact reports.`,
      priority: 2
    },
    {
      id: 'education',
      icon: <FaGraduationCap size={32} />,
      title: 'Education Token',
      description: 'Fund educational platforms and content with a token that supports learning.',
      goal: '13000',
      duration: 30,
      categories: ['Education', 'Knowledge', 'Learning'],
      detailedDescription: 'Build an education-focused token that funds course development, educational infrastructure, and knowledge sharing platforms. Token holders gain access to premium content and governance rights.',
      priority: 3
    },
    {
      id: 'metaverse',
      icon: <FaVrCardboard size={32} />,
      title: 'Metaverse Token',
      description: 'Scale your virtual world with a token that powers the metaverse experience.',
      goal: '25000',
      duration: 60,
      categories: ['Metaverse', 'Virtual Worlds', 'Gaming'],
      detailedDescription: 'Expand your metaverse project with token-based funding that enables virtual land expansion, infrastructure development, and immersive experiences. Token holders receive exclusive access and metaverse benefits.',
      priority: 4
    },
    {
      id: 'cto',
      icon: <FaPeopleCarry size={32} />,
      title: 'Community Takeover',
      description: 'Revitalize an abandoned project through community-led development.',
      goal: '6000',
      duration: 14,
      categories: ['DAO', 'Community', 'Governance'],
      detailedDescription: 'Rejuvenate a project where the original team has left through community governance and distributed leadership. CTO token holders guide the project\'s future development and direction.',
      priority: 5
    },
    {
      id: 'ai',
      icon: <FaRobot size={32} />,
      title: 'AI Token',
      description: 'Fund AI research and infrastructure with a token that powers innovation.',
      goal: '40000',
      duration: 30,
      categories: ['AI', 'Technology', 'Computing'],
      detailedDescription: 'Develop cutting-edge AI solutions with token-based funding that supports computational resources, research, and model development. Token holders gain early access to AI capabilities.',
      priority: 6
    },
    {
      id: 'rwa',
      icon: <FaBuilding size={32} />,
      title: 'Real World Assets',
      description: 'Tokenize real world assets to enable fractional ownership and liquidity.',
      goal: '50000',
      duration: 30,
      categories: ['RWA', 'Assets', 'Finance'],
      detailedDescription: 'Create tokens backed by real-world assets such as real estate, art, or commodities, enabling fractional ownership and investment opportunities. Token holders receive proportional ownership benefits.',
      priority: 7
    },
    {
      id: 'gamefi',
      icon: <FaGamepad size={32} />,
      title: 'GameFi Token',
      description: 'Fund game development with tokens that power in-game economies.',
      goal: '20000',
      duration: 60,
      categories: ['Gaming', 'Play-to-Earn', 'NFTs'],
      detailedDescription: 'Support blockchain game development with token funding that enables play-to-earn mechanics, in-game assets, and community-owned virtual economies. Token holders enjoy exclusive gaming privileges.',
      priority: 8
    },
    {
      id: 'defi',
      icon: <FaChartLine size={32} />,
      title: 'DeFi Protocol',
      description: 'Fund decentralized finance protocols with governance tokens.',
      goal: '35000',
      duration: 30,
      categories: ['DeFi', 'Finance', 'Yield'],
      detailedDescription: 'Develop decentralized finance protocols with token funding that supports liquidity provision, yield generation, and financial innovation. Token holders participate in governance and protocol earnings.',
      priority: 9
    },
    {
      id: 'custom',
      icon: <FaPencilAlt size={32} />,
      title: 'Custom Token Project',
      description: 'Create a campaign for your unique token with specific utility and goals.',
      goal: '',
      duration: 60,
      categories: [],
      detailedDescription: '',
      priority: 10
    }
  ];

  // Sort templates by priority
  const sortedTemplates = [...templates].sort((a, b) => a.priority - b.priority);

  // Split templates into priority (first 3) and others
  const priorityTemplates = sortedTemplates.slice(0, 3);
  const otherTemplates = sortedTemplates.slice(3);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template.id);
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const toggleShowAllTemplates = () => {
    setShowAllTemplates(!showAllTemplates);
  };

  return (
    <Container className="campaign-templates">
      <h4 className="mb-2">Start with a Template</h4>
      <p className="text-muted mb-4">
        Choose a template to quickly set up your token-based fundraising campaign with pre-filled content, or create a custom campaign from scratch.
      </p>
      
      {/* Priority Templates */}
      <Row className="template-grid">
        {priorityTemplates.map((template) => (
          <Col key={template.id} xs={12} sm={6} md={4} className="mb-4">
            <div 
              className="template-item" 
              onClick={() => handleSelectTemplate(template)}
              title="Click to select this template"
            >
              <Card 
                className="template-card h-100" 
                border={selectedTemplate === template.id ? 'warning' : 'light'}
              >
                {selectedTemplate === template.id && (
                  <div className="template-selected-badge">
                    <Badge bg="warning" className="position-absolute top-0 end-0 m-2">
                      <FaCheck className="me-1" /> Selected
                    </Badge>
                  </div>
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="template-icon">
                    {template.icon}
                  </div>
                  <Card.Title>{template.title}</Card.Title>
                  <Card.Text>{template.description}</Card.Text>
                  
                  {template.id !== 'custom' && (
                    <div className="mt-2 text-muted">
                      <small>
                        Suggested goal: ${template.goal} • Duration: {template.duration} days
                      </small>
                    </div>
                  )}
                  
                  <div className="template-select-indicator mt-2 text-center">
                    <small className="text-muted">
                      <FaMousePointer className="me-1" /> Click to select
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        ))}
      </Row>
      
      {/* Show More Toggle Button */}
      <div className="text-center mb-4">
        <Button 
          variant="outline-secondary" 
          onClick={toggleShowAllTemplates}
          className="more-templates-btn"
        >
          {showAllTemplates ? (
            <>
              <FaChevronUp className="me-2" /> Show Less Templates
            </>
          ) : (
            <>
              <FaChevronDown className="me-2" /> Show More Templates
              <p className="text-muted more-templates-hint mt-1 mb-0">
                <small>AI, Real World Assets, Community Takeovers and more</small>
              </p>
            </>
          )}
        </Button>
      </div>
      
      {/* Additional Templates (collapsible) */}
      {showAllTemplates && (
        <Row className="template-grid additional-templates">
          {otherTemplates.map((template) => (
            <Col key={template.id} xs={12} sm={6} md={4} className="mb-4">
              <div 
                className="template-item" 
                onClick={() => handleSelectTemplate(template)}
                title="Click to select this template"
              >
                <Card 
                  className="template-card h-100" 
                  border={selectedTemplate === template.id ? 'warning' : 'light'}
                >
                  {selectedTemplate === template.id && (
                    <div className="template-selected-badge">
                      <Badge bg="warning" className="position-absolute top-0 end-0 m-2">
                        <FaCheck className="me-1" /> Selected
                      </Badge>
                    </div>
                  )}
                  <Card.Body className="d-flex flex-column">
                    <div className="template-icon">
                      {template.icon}
                    </div>
                    <Card.Title>{template.title}</Card.Title>
                    <Card.Text>{template.description}</Card.Text>
                    
                    {template.id !== 'custom' && (
                      <div className="mt-2 text-muted">
                        <small>
                          Suggested goal: ${template.goal} • Duration: {template.duration} days
                        </small>
                      </div>
                    )}
                    
                    <div className="template-select-indicator mt-2 text-center">
                      <small className="text-muted">
                        <FaMousePointer className="me-1" /> Click to select
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CampaignTemplates; 