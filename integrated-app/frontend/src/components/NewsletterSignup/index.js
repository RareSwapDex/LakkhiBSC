import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import './NewsletterSignup.css';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState({
    success: false,
    error: false,
    message: ''
  });
  
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous results
    setSubmitResult({
      success: false,
      error: false,
      message: ''
    });
    
    // Basic validation
    if (!email || !isValidEmail(email)) {
      setSubmitResult({
        success: false,
        error: true,
        message: 'Please enter a valid email address.'
      });
      return;
    }
    
    // Simulate API call
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call to your newsletter service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful submission
      setSubmitResult({
        success: true,
        error: false,
        message: 'Thanks for subscribing! You\'ll receive updates soon.'
      });
      
      // Clear form
      setEmail('');
    } catch (error) {
      setSubmitResult({
        success: false,
        error: true,
        message: 'An error occurred. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="newsletter-container">
      <h3>Stay Updated</h3>
      <p>Subscribe to our newsletter for updates on new campaigns, feature releases, and token news.</p>
      
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <div className="form-input-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className={`newsletter-input ${submitResult.error ? 'input-error' : ''}`}
            disabled={isSubmitting || submitResult.success}
          />
          <button 
            type="submit" 
            className="newsletter-button"
            disabled={isSubmitting || submitResult.success}
          >
            {isSubmitting ? (
              <span className="button-loader"></span>
            ) : submitResult.success ? (
              <FontAwesomeIcon icon={faCheckCircle} />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} />
            )}
          </button>
        </div>
        
        {submitResult.error && (
          <div className="form-message error">
            <FontAwesomeIcon icon={faExclamationCircle} /> {submitResult.message}
          </div>
        )}
        
        {submitResult.success && (
          <div className="form-message success">
            <FontAwesomeIcon icon={faCheckCircle} /> {submitResult.message}
          </div>
        )}
        
        <div className="newsletter-privacy">
          We respect your privacy and will never spam you.
        </div>
      </form>
    </div>
  );
};

export default NewsletterSignup; 