import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faCoins, faCreditCard, faExchangeAlt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './TokenExplainer.css';

const TokenExplainer = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  
  const steps = [
    {
      id: 0,
      title: "Create Campaign with Your Token",
      description: "Set up your fundraising campaign with your own existing project token",
      icon: faCoins
    },
    {
      id: 1,
      title: "Supporters Contribute",
      description: "Supporters can donate using crypto or credit card",
      icon: faCreditCard
    },
    {
      id: 2,
      title: "Automatic Token Purchase",
      description: "Credit card payments automatically purchase your token on exchanges",
      icon: faExchangeAlt
    },
    {
      id: 3,
      title: "Zero Platform Fees",
      description: "100% of all tokens are sent to your project wallet",
      icon: faWallet
    },
    {
      id: 4,
      title: "Boost Token Utility",
      description: "Increase token adoption and create buy pressure",
      icon: faCheckCircle
    }
  ];
  
  // Auto-play functionality
  useEffect(() => {
    let interval;
    
    if (autoPlay) {
      interval = setInterval(() => {
        setActiveStep(prev => (prev + 1) % steps.length);
      }, 3000);
    }
    
    return () => clearInterval(interval);
  }, [autoPlay, steps.length]);
  
  // Pause auto-play when user interacts
  const handleStepClick = (stepId) => {
    setActiveStep(stepId);
    setAutoPlay(false);
  };
  
  // Resume auto-play after 10 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      setAutoPlay(true);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [activeStep]);
  
  return (
    <div className="token-explainer">
      <div className="token-flow-diagram">
        <div className="diagram-content">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`diagram-step ${activeStep === step.id ? 'active' : ''} ${activeStep > step.id ? 'completed' : ''}`}
              onClick={() => handleStepClick(step.id)}
            >
              <div className="step-icon">
                <FontAwesomeIcon icon={step.icon} />
              </div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {step.id < steps.length - 1 && (
                <div className="connector">
                  <div className="connector-line"></div>
                  <div className="connector-arrow"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="token-explainer-navigation">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={`nav-indicator ${activeStep === step.id ? 'active' : ''}`}
            onClick={() => handleStepClick(step.id)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default TokenExplainer; 