import React, { useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faCoins, faExchangeAlt, faChartLine, faFileAlt, faHandHoldingUsd } from '@fortawesome/free-solid-svg-icons';
import TokenPriceDisplay from '../../components/TokenPriceDisplay';
import TokenExplainer from '../../components/TokenExplainer';
import NewsletterSignup from '../../components/NewsletterSignup';
import FAQAccordion from '../../components/FAQAccordion';
import './HomePage.css';

// Lazy loaded components
const StatsCounter = lazy(() => import('../../components/StatsCounter'));
const TestimonialCarousel = lazy(() => import('../../components/TestimonialCarousel'));
const FeaturedCampaigns = lazy(() => import('../../components/FeaturedCampaigns'));

// Loading placeholder
const LoadingPlaceholder = () => (
  <div className="loading-placeholder">
    <div className="loading-spinner"></div>
  </div>
);

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
          <p>The decentralized platform that helps Web3 projects raise funds with <span className="highlight">zero fees on donations</span>, boosting token utility and adoption.</p>
          <div className="hero-buttons">
            <Link to="/admin/create-campaign" className="primary-button">Create Campaign</Link>
            <Link to="/projects" className="secondary-button">Explore Projects</Link>
          </div>
        </div>
        <div className="hero-image">
          <img 
            src="/images/hero-banner.svg" 
            alt="Lakkhi Fund Platform" 
            loading="lazy"
          />
        </div>
      </section>

      {/* Token Price Section */}
      <section className="token-price-section">
        <TokenPriceDisplay />
      </section>
      
      {/* Platform Stats Section */}
      <section className="platform-stats-section">
        <h2>Our Impact</h2>
        <p className="section-subtitle">Join the growing community of projects and donors</p>
        <Suspense fallback={<LoadingPlaceholder />}>
          <StatsCounter />
        </Suspense>
      </section>
      
      {/* Token Explainer Section */}
      <section className="token-explainer-section">
        <h2>How Token Fundraising Works</h2>
        <p className="section-subtitle">A simple explanation of our token-based fundraising model</p>
        <TokenExplainer />
      </section>
      
      {/* Whitepaper CTA Section */}
      <section className="whitepaper-cta">
        <div className="whitepaper-content">
          <div className="whitepaper-icon">
            <FontAwesomeIcon icon={faFileAlt} />
          </div>
          <div className="whitepaper-text">
            <h2>Learn More About Lakkhi Fund</h2>
            <p>Dive deep into our platform's architecture, token integration, and how we're revolutionizing Web3 fundraising with 0% fees on donations.</p>
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
              <FontAwesomeIcon icon={faHandHoldingUsd} />
            </div>
            <h3>100% of Donations Go to Projects</h3>
            <p>Unlike other platforms, we take 0% fees from donor contributions. Every token donated goes directly to the project.</p>
          </div>
          
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
        </div>
      </section>
      
      {/* Featured Campaigns Section */}
      <section className="featured-campaigns-section">
        <h2>Featured Campaigns</h2>
        <p className="section-subtitle">Support these innovative projects raising funds on Lakkhi Fund</p>
        <Suspense fallback={<LoadingPlaceholder />}>
          <FeaturedCampaigns />
        </Suspense>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>Success Stories</h2>
        <p className="section-subtitle">Hear from projects that have successfully raised funds on our platform</p>
        <Suspense fallback={<LoadingPlaceholder />}>
          <TestimonialCarousel />
        </Suspense>
      </section>
      
      {/* FAQ Section */}
      <section className="faq-section">
        <FAQAccordion />
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
            <p>Contributors can use crypto or credit card to support your project with 0% platform fees.</p>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <h3>Manage Your Funds</h3>
            <p>100% of funds are transferred directly to your wallet upon campaign completion.</p>
          </div>
        </div>
        <div className="cta-center">
          <Link to="/admin/create-campaign" className="primary-button">Start Your Campaign</Link>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="newsletter-section">
        <NewsletterSignup />
      </section>
    </div>
  );
};

export default HomePage; 