import React from 'react';
import { FiMail, FiPhone } from 'react-icons/fi';
import './Contact.css';
import Header from './Header';
import SiteFooter from './SiteFooter';

export default function Contact() {
  return (
    <>
    <Header/>
    <section className="contact-section" id="contact">
      <div className="contact-wrapper">
        <div className="contact-left">
          <h2 className="contact-left-title">Don’t Forget To Contact Us</h2>
          <p className="contact-left-desc">
            Not sure what you need? Our team will be happy to listen and
            suggest ideas you may not have considered.
          </p>
          <div className="contact-left-items">
            <div className="contact-left-item">
              <span className="contact-left-icon"><FiMail /></span>
              <span>info@dontforget.com</span>
            </div>
            <div className="contact-left-item">
              <span className="contact-left-icon"><FiPhone /></span>
              <span>Support: (+21) 123 456 586</span>
            </div>
          </div>
        </div>

        <div className="contact-card">
          <div className="contact-card-header">
            <h3 className="contact-card-title">We’d love to hear from you!</h3>
            <p className="contact-card-sub">Let’s get in touch</p>
          </div>
          <form className="contact-form-grid" onSubmit={(e) => { e.preventDefault(); alert('Thanks! Your message has been sent.'); }}>
            <div className="grid-2">
              <div className="form-field">
                <label htmlFor="contact-name">Full Name</label>
                <input id="contact-name" name="name" type="text" placeholder="Your full name" required />
              </div>
              <div className="form-field">
                <label htmlFor="contact-email">Email</label>
                <input id="contact-email" name="email" type="email" placeholder="you@example.com" required />
              </div>
            </div>
            <div className="grid-1">
              <div className="form-field">
                <label htmlFor="contact-subject">Subject</label>
                <input id="contact-subject" name="subject" type="text" placeholder="How can we help?" required />
              </div>
            </div>
            <div className="grid-1">
              <div className="form-field">
                <label htmlFor="contact-message">Your Message</label>
                <textarea id="contact-message" name="message" placeholder="Type your message here" rows="6" required />
              </div>
            </div>
            <div className="contact-card-actions">
              <button type="submit" className="contact-send-btn">Send Message</button>
            </div>
          </form>
        </div>
      </div>
    </section>
    <SiteFooter/>
    </>
  );
}
