import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './WhitepaperPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import whitepaperContent from '../../data/whitepaper';

const WhitepaperPage = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Set page title
    document.title = 'Lakkhi Fund - Whitepaper';
  }, []);

  // Function to render markdown content with basic formatting
  const renderMarkdownSection = (section) => {
    return (
      <div className="whitepaper-section" key={section.id}>
        <h2 id={section.id}>{section.title}</h2>
        {section.content.map((paragraph, idx) => {
          if (paragraph.type === 'paragraph') {
            return <p key={idx}>{paragraph.text}</p>;
          } else if (paragraph.type === 'list') {
            return (
              <ul key={idx}>
                {paragraph.items.map((item, itemIdx) => (
                  <li key={itemIdx}>{item}</li>
                ))}
              </ul>
            );
          } else if (paragraph.type === 'heading') {
            return <h3 key={idx}>{paragraph.text}</h3>;
          } else if (paragraph.type === 'subheading') {
            return <h4 key={idx}>{paragraph.text}</h4>;
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="whitepaper-page">
      <div className="whitepaper-container">
        <div className="whitepaper-header">
          <Link to="/" className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
          </Link>
          <a href="/whitepaper.pdf" download className="download-button">
            <FontAwesomeIcon icon={faDownload} /> Download PDF
          </a>
        </div>
        
        <div className="whitepaper-title">
          <h1>Lakkhi Fund: A Decentralized Fundraising Platform for Web3 Token Projects</h1>
        </div>

        <div className="whitepaper-toc">
          <h3>Table of Contents</h3>
          <ul>
            {whitepaperContent.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="whitepaper-abstract">
          <h2>Abstract</h2>
          <p>
            This whitepaper introduces Lakkhi Fund, a decentralized crowdfunding platform designed specifically for Web3 projects and token creators. Unlike traditional fundraising platforms, Lakkhi Fund allows projects to raise funds in their own tokens while enabling contributions from both crypto and non-crypto users. The platform incorporates advanced gas fee optimization, wallet-based authentication, and token customization to create a seamless fundraising experience while providing tangible benefits to token economies.
          </p>
        </div>

        <div className="whitepaper-content">
          {whitepaperContent.sections.map(renderMarkdownSection)}
        </div>
      </div>
    </div>
  );
};

export default WhitepaperPage; 