import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import './styles.css';

const FormProgressBar = ({ steps, activeStep, completedSteps, onStepClick }) => {
  // Calculate progress percentage
  const progress = Math.round((completedSteps.length / steps.length) * 100);
  
  return (
    <div className="form-progress-container mb-4">
      <ProgressBar 
        now={progress} 
        variant="primary" 
        className="mb-3"
        label={`${progress}% Complete`}
      />
      
      <div className="form-progress-steps">
        {steps.map((step, index) => {
          const isActive = activeStep === step.key;
          const isCompleted = completedSteps.includes(step.key);
          
          return (
            <div 
              key={step.key} 
              className={`form-progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => onStepClick && onStepClick(step.key)}
              role="button"
              tabIndex={0}
              aria-label={`Go to ${step.label} section`}
              title={`Click to navigate to the ${step.label} section`}
            >
              <div className="form-progress-indicator">
                {isCompleted ? (
                  <span className="completed-check">✓</span>
                ) : (
                  index + 1
                )}
              </div>
              <div className="form-progress-label">{step.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormProgressBar; 