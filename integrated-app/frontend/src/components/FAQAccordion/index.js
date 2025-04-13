import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import './FAQAccordion.css';

const faqItems = [
  {
    id: 1,
    question: "What is Lakkhi Fund?",
    answer: "Lakkhi Fund is a decentralized fundraising platform that allows Web3 projects to raise funds using their own existing tokens with zero platform fees on donations."
  },
  {
    id: 2,
    question: "How does zero-fee fundraising work?",
    answer: "Unlike traditional platforms that take a percentage of donations, 100% of the tokens contributed on Lakkhi Fund go directly to the project creator. We're supported by the Lakkhi ecosystem instead of charging fees."
  },
  {
    id: 3,
    question: "Can donors contribute with credit cards?",
    answer: "Yes! Contributors can donate using either cryptocurrency or credit cards. Credit card payments are automatically converted to the project's token and sent to the creator."
  },
  {
    id: 4,
    question: "What tokens can I use for my campaign?",
    answer: "You can create a campaign with any BEP-20 token on the BNB Chain. The token must be listed on a decentralized exchange for the conversion process to work with credit card payments."
  },
  {
    id: 5,
    question: "How do I get my funds after the campaign?",
    answer: "Your funds are transferred directly to your connected wallet as they come in. There's no waiting period or manual withdrawal process required."
  }
];

const FAQAccordion = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  
  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  
  return (
    <div className="faq-accordion">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      
      <div className="faq-items">
        {faqItems.map((item, index) => (
          <div key={item.id} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
            <div 
              className="faq-question" 
              onClick={() => toggleAccordion(index)}
              role="button"
              aria-expanded={activeIndex === index}
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggleAccordion(index);
                }
              }}
            >
              <span>{item.question}</span>
              <FontAwesomeIcon 
                icon={activeIndex === index ? faChevronUp : faChevronDown} 
                className="icon"
              />
            </div>
            
            <div 
              className="faq-answer"
              style={{ 
                maxHeight: activeIndex === index ? '500px' : '0'
              }}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQAccordion; 