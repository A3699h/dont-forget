import React from 'react';
import './About.css';

const About = () => {

  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-content">
          <h2 className="about-title">
            More About
            <br />
            The Best Task
            <br />
            Management Platform
          </h2>
          
          <p className="about-description">
            You can find the most efficient and user-friendly task management tools at the best prices with special discounts. 
            Choose your preferred features and we will guide you all the way through the setup process. 
            Get your perfect organized life now with our curated selection of professional productivity tools.
          </p>
        </div>
        
        <div className="about-images">
          <div className="image-container image-1">
            <div className="placeholder-image">
              <div className="image-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="white"/>
                </svg>
              </div>
              <div className="image-text">Task Management</div>
            </div>
          </div>
          
          <div className="image-container image-2">
            <div className="placeholder-image">
              <div className="image-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill="white"/>
                  <path d="M12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="white"/>
                </svg>
              </div>
              <div className="image-text">Smart Scheduling</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
