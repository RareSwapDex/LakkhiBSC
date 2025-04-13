import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCoins, faHandHoldingHeart } from '@fortawesome/free-solid-svg-icons';
import './StatsCounter.css';

// These would typically come from an API in production
const platformStats = {
  projectsFunded: 124,
  totalRaised: 2500000, // In USD
  uniqueDonors: 7850
};

const StatsCounter = () => {
  const [counters, setCounters] = useState({
    projectsFunded: 0,
    totalRaised: 0,
    uniqueDonors: 0
  });
  
  const [inView, setInView] = useState(false);
  
  // Format number with commas as thousands separators
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Format currency in USD
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  useEffect(() => {
    // Add intersection observer to start counter animation when in view
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    const statsSection = document.querySelector('.stats-counter');
    if (statsSection) {
      observer.observe(statsSection);
    }
    
    return () => {
      if (statsSection) {
        observer.unobserve(statsSection);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!inView) return;
    
    // Duration of count animation in ms
    const duration = 2000;
    // Number of steps in the animation
    const steps = 60;
    // Time between steps
    const stepTime = duration / steps;
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      
      const progress = Math.min(currentStep / steps, 1);
      
      setCounters({
        projectsFunded: Math.floor(platformStats.projectsFunded * progress),
        totalRaised: Math.floor(platformStats.totalRaised * progress),
        uniqueDonors: Math.floor(platformStats.uniqueDonors * progress)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [inView]);
  
  return (
    <div className="stats-counter">
      <div className="stats-container">
        <div className="stat-item">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faHandHoldingHeart} />
          </div>
          <div className="stat-value">{formatNumber(counters.projectsFunded)}</div>
          <div className="stat-label">Projects Funded</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCoins} />
          </div>
          <div className="stat-value">{formatCurrency(counters.totalRaised)}</div>
          <div className="stat-label">Total Raised</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="stat-value">{formatNumber(counters.uniqueDonors)}</div>
          <div className="stat-label">Unique Donors</div>
        </div>
      </div>
    </div>
  );
};

export default StatsCounter; 