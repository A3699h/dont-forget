import React from 'react';
import { Link } from 'react-router-dom';
import { FiFeather } from 'react-icons/fi';
import { FaRegCopyright } from 'react-icons/fa';

const SiteFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="foot-brand">
          <div className="foot-logo"><FiFeather /></div>
          <div className="foot-name">Don't Forget</div>
          <div className="foot-contact">+1 (234) 567 89 00</div>
          <div className="foot-email">outerweb@email.com</div>
        </div>
        <div className="foot-col">
          <div className="foot-title">Navigation</div>
          <Link to="/blog" className="foot-item">Blog</Link>
          <Link to="/contact" className="foot-item">Contact</Link>
          <Link to="/faq" className="foot-item">FAQ</Link>
        </div>
        <div className="foot-col">
          <div className="foot-title">Pages</div>
          <Link to="/privacy" className="foot-item">Terms of Service</Link>
        </div>
        <div className="foot-subscribe">
          <div className="foot-title">Subscribe</div>
          <div className="foot-note">Stay up to date with our news!</div>
          <form className="sub-form" onSubmit={(e)=>e.preventDefault()}>
            <input className="sub-input" placeholder="Email" />
            <button className="sub-btn">Subscribe</button>
          </form>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '8px auto 0', paddingTop: 8, borderTop: '1px solid #374151', textAlign: 'center', opacity: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
        <FaRegCopyright aria-label="Copyright" />
        <span>{currentYear} Don’t Forget — All rights reserved.</span>
        <Link to="/privacy" className="foot-item" style={{ marginLeft: 6 }}>Privacy & Terms</Link>
      </div>
    </footer>
  );
};

export default SiteFooter;


