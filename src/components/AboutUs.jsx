import React from 'react';
import Header from './Header';
import SiteFooter from './SiteFooter';
import './AboutUs.css';

export default function AboutUs() {
  return (
    <>
      <Header />
      <section className="benefits-section">
        <div className="benefits-container">
          <div className="benefits-content">
            <div className="section-tag">- About -</div>
            <h2 className="section-title">About Don’t Forget</h2>
            <p className="section-subtitle">See everything in one clean, organized space.</p>
            <p className="benefits-description">No more scattered tools. No more missed opportunities. With Don’t Forget, you can work smarter, stay prepared, and protect your time. Don’t just manage your schedule. Own it.</p>

            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-check">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span>Entrepreneurs: Drive more paid bookings and reduce no‑shows.</span>
              </div>
              <div className="benefit-item">
                <div className="benefit-check">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span>Students & families: Schedule study groups and family events without chaos.</span>
              </div>
              <div className="benefit-item">
                <div className="benefit-check">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span>Supervisors & VAs: Manage multiple calendars without losing track.</span>
              </div>
            </div>
          </div>
          
          <div className="benefits-image">
            <div className="image-main large">
              <img
                src="https://imageio.forbes.com/specials-images/imageserve/676d5e469dbbcf09f3f0c2ca/Attractive-young-businesswoman-sitting-alone-in-the-office/960x0.jpg?height=474&width=711&fit=bounds"
                alt="Focused professional"
                className="image-fill"
              />
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}


