import React, { useState, useEffect } from 'react';
import './NewsletterPopup.css';

const NewsletterPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Show popup after 8 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (email && email.includes('@')) {
      try {
        // Here you would typically send the email to your backend/database
        // For now, we'll just simulate the subscription
        console.log('Email subscribed:', email);
        
        // Store in localStorage as a simple example
        const existingEmails = JSON.parse(localStorage.getItem('newsletterEmails') || '[]');
        existingEmails.push(email);
        localStorage.setItem('newsletterEmails', JSON.stringify(existingEmails));
        
        setIsSubscribed(true);
        
        // Hide popup after 2 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 2000);
        
      } catch (error) {
        console.error('Error subscribing:', error);
        alert('Something went wrong. Please try again.');
      }
    } else {
      alert('Please enter a valid email address.');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="newsletter-overlay" onClick={handleOverlayClick}>
      <div className="newsletter-popup">
        <button className="close-button" onClick={handleClose}>
          ×
        </button>
        
        <div className="popup-content">
          <div className="popup-logo">
            <h2>Don't Forget</h2>
          </div>
          
          {!isSubscribed ? (
            <>
              <h3 className="popup-title">
                <span className="title-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#666666"/>
                  </svg>
                </span>
                DON'T FORGET TO SIGN UP NOW
              </h3>
              
              <p className="popup-description">
                Stay updated with our latest features and never miss important updates!
              </p>
              
              <form onSubmit={handleSubscribe} className="popup-form">
                <div className="input-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="email-input"
                    required
                  />
                  <button type="submit" className="subscribe-button">
                    Subscribe
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="success-message">
              <h3>
                <span className="success-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#8b4513"/>
                  </svg>
                </span>
                Thank you for subscribing!
              </h3>
              <p>You'll receive our latest updates soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterPopup;
