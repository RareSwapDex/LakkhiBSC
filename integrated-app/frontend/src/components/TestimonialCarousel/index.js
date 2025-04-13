import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteLeft, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './TestimonialCarousel.css';

const testimonials = [
  {
    id: 1,
    name: "Alex Smith",
    role: "Founder, MetaToken",
    quote: "Lakkhi Fund helped us reach our funding goal in half the time we expected. The zero-fee structure meant more resources for our project development.",
    avatar: "/images/testimonials/avatar1.png"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "CEO, DeFi Innovations",
    quote: "Using our own token for fundraising created a positive feedback loop. As contributions came in, our token's market presence grew exponentially.",
    avatar: "/images/testimonials/avatar2.png"
  },
  {
    id: 3,
    name: "Michael Wong",
    role: "CTO, BlockchainX",
    quote: "The dual payment options were crucial for our success. Many supporters preferred using credit cards, which automatically converted to our token.",
    avatar: "/images/testimonials/avatar3.png"
  }
];

const TestimonialCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  
  useEffect(() => {
    let interval;
    if (isAutoplay) {
      interval = setInterval(() => {
        setCurrent(current => (current === testimonials.length - 1 ? 0 : current + 1));
      }, 5000);
    }
    
    return () => clearInterval(interval);
  }, [isAutoplay]);
  
  const handlePrev = () => {
    setIsAutoplay(false);
    setCurrent(current === 0 ? testimonials.length - 1 : current - 1);
  };
  
  const handleNext = () => {
    setIsAutoplay(false);
    setCurrent(current === testimonials.length - 1 ? 0 : current + 1);
  };
  
  return (
    <div className="testimonial-carousel">
      <div className="testimonial-quotes">
        <FontAwesomeIcon icon={faQuoteLeft} className="quote-icon" />
      </div>
      
      <div className="testimonial-container">
        {testimonials.map((testimonial, index) => (
          <div 
            key={testimonial.id} 
            className={`testimonial ${index === current ? 'active' : ''}`}
          >
            <div className="testimonial-content">
              <p className="testimonial-quote">{testimonial.quote}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/50";
                    }}
                  />
                </div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="testimonial-controls">
        <button className="control-btn prev" onClick={handlePrev}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className="testimonial-indicators">
          {testimonials.map((_, index) => (
            <span 
              key={index} 
              className={`indicator ${index === current ? 'active' : ''}`}
              onClick={() => {
                setIsAutoplay(false);
                setCurrent(index);
              }}
            />
          ))}
        </div>
        <button className="control-btn next" onClick={handleNext}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default TestimonialCarousel; 