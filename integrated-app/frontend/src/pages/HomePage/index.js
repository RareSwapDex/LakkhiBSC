import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faCoins, faExchangeAlt, faChartLine, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import TokenPriceDisplay from '../../components/TokenPriceDisplay';

const HomePage = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Set page title
    document.title = 'Lakkhi Fund - Decentralized Fundraising for Web3 Projects';
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Fundraise in Your Own Token</h1>
          <p>The decentralized platform that helps Web3 projects raise funds while boosting token utility and adoption.</p>
          <div className="hero-buttons">
            <Link to="/create-campaign" className="primary-button">Create Campaign</Link>
            <Link to="/campaigns" className="secondary-button">Explore Campaigns</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/hero-image.png" alt="Lakkhi Fund Platform" />
        </div>
      </section>

      {/* Token Price Section */}
      <section className="token-price-section">
        <TokenPriceDisplay />
      </section>
      
      {/* Whitepaper CTA Section */}
      <section className="whitepaper-cta">
        <div className="whitepaper-content">
          <div className="whitepaper-icon">
            <FontAwesomeIcon icon={faFileAlt} />
          </div>
          <div className="whitepaper-text">
            <h2>Learn More About Lakkhi Fund</h2>
            <p>Dive deep into our platform's architecture, token integration, and how we're revolutionizing Web3 fundraising.</p>
            <Link to="/whitepaper" className="whitepaper-button">Read Our Whitepaper</Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <h2>Why Use Lakkhi Fund for Your Token Project?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">
              <FontAwesomeIcon icon={faCoins} />
            </div>
            <h3>Fundraise in Your Own Token</h3>
            <p>Use your existing project token for fundraising instead of having to create a new token or use a platform token.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">
              <FontAwesomeIcon icon={faExchangeAlt} />
            </div>
            <h3>Dual Payment Options</h3>
            <p>Accept contributions directly in your token or via credit card - which automatically converts to your token.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <h3>Positive Token Price Impact</h3>
            <p>Create buying pressure and reduce circulating supply, potentially benefiting your token's economics.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">
              <FontAwesomeIcon icon={faRocket} />
            </div>
            <h3>Increase Token Utility</h3>
            <p>Add a meaningful use case for your token while exposing it to new potential holders.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Connect Your Wallet</h3>
            <p>Sign in with your Web3 wallet to verify ownership.</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Create Your Campaign</h3>
            <p>Specify your token, funding goals, and campaign details.</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Receive Contributions</h3>
            <p>Contributors can use crypto or credit card to support your project.</p>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <h3>Manage Your Funds</h3>
            <p>Funds are transferred directly to your wallet upon campaign completion.</p>
          </div>
        </div>
        <div className="cta-center">
          <Link to="/faq" className="secondary-button">Learn More in FAQ</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 