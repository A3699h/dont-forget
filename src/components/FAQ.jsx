import React, { useState } from 'react';
import './Homepage.css';
import Header from './Header';
import SiteFooter from './SiteFooter';

const faqs = [
  {
    q: 'What is the Create Task Page?',
    a: 'This is where you set up new tasks with meeting links, key points, reminders, and priorities so everything is organized and easy to track.'
  },
  {
    q: 'What is the Dashboard Page?',
    a: 'Your main hub that shows tasks as cards, grouped by status (Upcoming, Due Today, Late, Follow-Ups, High Priority). It gives you an instant overview of what needs attention.'
  },
  {
    q: 'What is the Follow-Up Page?',
    a: 'Follow-ups always connect to an existing task. The page shows the original task details alongside your follow-up notes, keeping all updates and history together in one place.'
  },
  {
    q: 'What is the Public Booking Page?',
    a: 'A personal link where others can book time with you, make payments if needed, and get instant on-screen confirmation. No back-and-forth emails required.'
  },
  {
    q: 'What is the Settings Page?',
    a: 'The Settings page is where you connect your own accounts, such as Zoom, Google Meet, Stripe, PayPal, Canva, ChatGPT, and Zapier. Don’t Forget does not provide these accounts—you bring yours. Everything you connect stays private: we do not have access to your logins, payment details, or any of your integration data. All activity runs directly through your own accounts, with no extra fees added by us.'
  },
  {
    q: 'Why is there a Guest Access Feature?',
    a: 'Guests can join video calls with a temporary link and code. They don’t see your dashboard or notes, making it simple for them and secure for you.'
  },
  {
    q: 'What is the Analytics Snapshot?',
    a: 'You can view daily, weekly, or monthly stats on your tasks, bookings, and payments whenever you need them. This helps you track progress and stay organized.'
  },
  {
    q: 'Why is there a FAQ and Blog Section?',
    a: 'The FAQ gives quick answers to common questions, and the blog shares helpful tips and updates to make the most of the platform.'
  },
  {
    q: 'Why is the Logo a Finger with a Ribbon?',
    a: 'In the past, people tied a string or ribbon around their finger as a reminder. Our logo reimagines that classic symbol in modern colors, showing that this is the place where you’ll never forget important things.'
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(-1);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <div className="homepage">
      <Header />
      <div className="homepage-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem'
        ,marginTop:'100px'}}>
        <h2 style={{
          fontSize: '44px',
          fontWeight: 800,
          textAlign: 'center',
          letterSpacing: '0.2px',
          margin: '0 0 20px 0',
          color: 'var(--black)'
        }}>Don’t Forget To Read Our FAQ</h2>

        <div style={{
          background: '#F5F7FF',
          border: '1px solid #E6EAFF',
          borderRadius: '16px',
          padding: '24px',
          margin: '24px 0 72px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
        }}>
          <div className="accordion">
            {faqs.map((item, idx) => (
              <div className="acc-item" key={idx}>
                <div className="acc-head" onClick={() => toggle(idx)}>
                  {item.q} <span>{openIndex === idx ? '−' : '+'}</span>
                </div>
                {openIndex === idx && (
                  <div className="acc-body">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default FAQ;


