import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './FeaturedCampaigns.css';

// Mock data - would come from an API in production
const featuredCampaigns = [
  {
    id: 1,
    title: "MetaVerse Gaming Hub",
    description: "A decentralized platform for gamers to earn, trade and build in the metaverse.",
    image: "/images/featured/gaming-hub.jpg",
    raised: 180000,
    goal: 250000,
    daysLeft: 12,
    token: {
      symbol: "META",
      icon: "🎮"
    }
  },
  {
    id: 2,
    title: "DeFi Yield Optimizer",
    description: "Automate your yield farming strategy across multiple blockchains with smart rebalancing.",
    image: "/images/featured/defi-yield.jpg",
    raised: 320000,
    goal: 400000,
    daysLeft: 8,
    token: {
      symbol: "YIELD",
      icon: "📈"
    }
  },
  {
    id: 3,
    title: "Green Blockchain Initiative",
    description: "Building carbon-neutral blockchain infrastructure for a sustainable future.",
    image: "/images/featured/green-blockchain.jpg",
    raised: 95000,
    goal: 150000,
    daysLeft: 21,
    token: {
      symbol: "GREEN",
      icon: "🌱"
    }
  }
];

const FeaturedCampaigns = () => {
  // Calculate progress percentage
  const calculateProgress = (raised, goal) => {
    const percentage = (raised / goal) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="featured-campaigns">
      <div className="featured-campaigns-grid">
        {featuredCampaigns.map(campaign => (
          <div key={campaign.id} className="campaign-card">
            <div className="campaign-image">
              <img 
                src={campaign.image} 
                alt={campaign.title}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x180?text=Campaign+Image";
                }}
              />
              <div className="campaign-days-left">
                <span>{campaign.daysLeft} days left</span>
              </div>
              <div className="campaign-example-tag">
                EXAMPLE
              </div>
            </div>
            
            <div className="campaign-content">
              <div className="campaign-token">
                <span className="token-icon">{campaign.token.icon}</span>
                <span className="token-symbol">{campaign.token.symbol}</span>
              </div>
              <h3 className="campaign-title">{campaign.title}</h3>
              <p className="campaign-description">{campaign.description}</p>
              
              <div className="campaign-progress-container">
                <div className="campaign-progress-bar">
                  <div 
                    className="campaign-progress-fill" 
                    style={{ width: `${calculateProgress(campaign.raised, campaign.goal)}%` }}
                  ></div>
                </div>
                <div className="campaign-progress-stats">
                  <span className="campaign-raised">{formatCurrency(campaign.raised)}</span>
                  <span className="campaign-goal">of {formatCurrency(campaign.goal)}</span>
                </div>
              </div>
              
              <Link to={`/projects/${campaign.id}`} className="campaign-view-button">
                Support Project <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="view-all-campaigns">
        <Link to="/projects" className="view-all-button">
          View All Campaigns <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </div>
    </div>
  );
};

export default FeaturedCampaigns; 