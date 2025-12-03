import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const handleGetStarted = () => {
    // Navigate to dashboard or signup
    console.log('Get Started clicked');
  };

  const handleRequestDemo = () => {
    // Navigate to demo request
    console.log('Request Demo clicked');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          <div className="footer-section brand-section">
            <h3 className="footer-brand">Don't Forget</h3>
            <p className="footer-tagline">
              Manage tasks with confidence - all in one place.
            </p>
            <div className="social-icons">
              <div className="social-icon">
                <span className="icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#8b4513"/>
                  </svg>
                </span>
              </div>
              <div className="social-icon">
                <span className="icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 1.01L7 1C5.9 1 5 1.9 5 3V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V3C19 1.9 18.1 1.01 17 1.01ZM17 19H7V5H17V19Z" fill="#8b4513"/>
                    <path d="M8 6H16V8H8V6Z" fill="#8b4513"/>
                    <path d="M8 10H16V12H8V10Z" fill="#8b4513"/>
                    <path d="M8 14H13V16H8V14Z" fill="#8b4513"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div className="footer-section explore-section">
            <h4 className="footer-heading">EXPLORE</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
          </div>

          <div className="footer-section clients-section">
            <h4 className="footer-heading">FOR USERS</h4>
            <ul className="footer-links">
              <li><a href="#dashboard">Dashboard</a></li>
              <li><a href="#tasks">My Tasks</a></li>
              <li><a href="#calendar">Calendar</a></li>
            </ul>
            <div className="footer-cta-buttons">
              <button className="cta-button primary" onClick={handleRequestDemo}>
                Request Demo
              </button>
              <button className="cta-button secondary" onClick={handleGetStarted}>
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              © 2025 Don't Forget
            </div>
            <div className="legal-links">
              <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy & Terms</Link>
              <Link to="/faq" target="_blank" rel="noopener noreferrer">FAQ</Link>
              <a href="#contact">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
