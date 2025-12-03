import React from 'react';
import './Homepage.css';
import Header from './Header';
import SiteFooter from './SiteFooter';

const PrivacyPolicy = () => {
  return (
    <div className="homepage" style={{ backgroundColor: '#FAFAFA', color: '#000000' }}>
      <Header />
      <div className="homepage-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', marginTop:'90px' }}>
        <h2 style={{
          fontSize: '40px',
          fontWeight: 800,
          margin: '0 0 12px 0',
          textAlign: 'center',
          color: '#A9B8FF'
        }}>Don’t Forget – Privacy Policy & Terms</h2>
        <div style={{ width: '80px', height: '3px', backgroundColor: '#A9B8FF', margin: '0 auto 24px auto', borderRadius: '2px' }} />

        <h3 style={{ color: '#A9B8FF', marginTop: '20px' }}>Privacy Policy</h3>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E6EAFF',
          borderRadius: '14px',
          padding: '18px 20px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
          margin: '12px 0'
        }}>
          <p style={{ margin: '0 0 10px 0' }}>At Don’t Forget, your privacy and security come first.</p>
          <p style={{ margin: '0 0 10px 0' }}>You connect your own accounts (Zoom, Google Meet, Stripe, PayPal, Canva, ChatGPT, Zapier).</p>
          <p style={{ margin: '0 0 10px 0' }}>We do not store, see, share, or have access to your logins, passwords, payment details, or integration data.</p>
          <p style={{ margin: '0 0 10px 0' }}>All payments are processed directly through your Stripe or PayPal account. Don’t Forget does not collect or process payment information and never adds extra fees.</p>
          <p style={{ margin: '0 0 10px 0' }}>Any information you enter (tasks, notes, follow-ups) belongs to you and remains private to your account unless you choose to share it via guest access.</p>
          <p style={{ margin: 0 }}>We do not sell, rent, or share your personal data with third parties.</p>
        </div>

        <h3 style={{ color: '#A9B8FF', marginTop: '28px' }}>Terms of Use</h3>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E6EAFF',
          borderRadius: '14px',
          padding: '18px 20px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
          margin: '12px 0'
        }}>
          <p style={{ marginTop: 0 }}>By using Don’t Forget, you agree to:</p>
          <ul style={{ paddingLeft: '18px', margin: '8px 0 0 0' }}>
            <li>You are responsible for your own tasks, bookings, payments, and follow-ups.</li>
            <li>Guest access is video-only. Guests cannot see your dashboard, notes, or private data. Guest links automatically expire after the call ends.</li>
            <li>You are solely responsible for your third-party accounts (Zoom, Stripe, PayPal, Canva, etc.). Don’t Forget only provides tools to connect them.</li>
            <li>We are not responsible for outages, billing issues, or problems with third-party providers.</li>
            <li>You must keep your login and password secure. We provide reset options, but we do not keep or store your password.</li>
            <li>You may export your data at any time, and you are responsible for storing and managing your exported files.</li>
          </ul>
        </div>

        <h3 style={{ color: '#A9B8FF', marginTop: '28px' }}>Disclaimer</h3>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E6EAFF',
          borderRadius: '14px',
          padding: '18px 20px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
          margin: '12px 0'
        }}>
          <p style={{ marginTop: 0 }}>Don’t Forget is an organizational tool.</p>
          <ul style={{ paddingLeft: '18px', margin: '8px 0 0 0' }}>
            <li>We are not legally, ethically, or financially responsible for missed deadlines, meetings, payments, or outcomes from your use of the platform.</li>
            <li>We do not provide legal, financial, or professional advice.</li>
            <li>We do not guarantee the performance of third-party apps. Stripe, PayPal, Zoom, Google, Canva, and others are independent services with their own policies.</li>
            <li>We do not have access to, and cannot recover, lost information or funds from your third-party accounts.</li>
            <li>All integrations and transactions occur entirely in your own accounts, under your control.</li>
          </ul>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
};

export default PrivacyPolicy;


