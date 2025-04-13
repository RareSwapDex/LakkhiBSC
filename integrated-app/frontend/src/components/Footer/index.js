import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faFileAlt, faChartLine, faDollarSign, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Lakkhi Fund</h3>
          <p>The decentralized fundraising platform for Web3 projects and token creators.</p>
        </div>
        
        <div className="footer-section">
          <h3>Platform</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/campaigns">Explore Campaigns</Link></li>
            <li><Link to="/create-campaign">Start a Campaign</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Resources</h3>
          <ul>
            <li><Link to="/whitepaper"><FontAwesomeIcon icon={faFileAlt} /> Whitepaper</Link></li>
            <li><a href="https://www.coingecko.com/en/coins/new-born-rhino" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faChartLine} /> CoinGecko
            </a></li>
            <li><a href="https://dexscreener.com/solana/DeahPCSdY8JY92jtc451xyjP6HgVg7ZUeapUuF7yrDc2" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faChartLine} /> DexScreener
            </a></li>
            <li><a href="https://raydium.io/swap/?inputMint=sol&outputMint=97WQm8aUu2gprFzEYfGmdJ7wcF4NSDPgvn3hvbDHpump" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faDollarSign} /> Buy $LAKKHI
            </a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Connect</h3>
          <div className="social-links">
            <a href="mailto:support@lakkhifoundation.org" className="social-link">
              <FontAwesomeIcon icon={faEnvelope} /> support@lakkhifoundation.org
            </a>
            <a href="https://t.me/lakkhirhino" target="_blank" rel="noopener noreferrer" className="social-link">
              <FontAwesomeIcon icon={faTelegram} /> @lakkhirhino
            </a>
            <a href="https://x.com/Lakkhi_FanPage" target="_blank" rel="noopener noreferrer" className="social-link">
              <FontAwesomeIcon icon={faTwitter} /> Twitter
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Lakkhi Fund. All rights reserved.</p>
        <div className="footer-legal-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 