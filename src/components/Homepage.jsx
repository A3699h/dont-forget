import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiCreditCard, FiMail, FiAlertCircle, FiBook, FiTrendingUp, FiBookOpen, FiUsers, FiGrid, FiLayers, FiShield, FiClock, FiTarget, FiArrowRight } from 'react-icons/fi';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from './Header';
import NewsletterPopup from './NewsletterPopup';
import SiteFooter from './SiteFooter';
import './Homepage.css';

gsap.registerPlugin(ScrollTrigger);

const Homepage = () => {
  const navigate = useNavigate();
  
  // Refs for animations
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const heroContentRef = useRef(null);
  const whatIsRef = useRef(null);
  const featuresRef = useRef(null);
  const audiencesRef = useRef(null);
  const ctaRef = useRef(null);

  const handleSignup = () => {
    navigate('/signup');
  };
  // Removed CTA navigation to dashboard for logged-out users

  // GSAP Animations
  useEffect(() => {
    // Hero Section Animation - Title slides from left
    gsap.fromTo(heroTitleRef.current,
      { opacity: 0, x: -80, scale: 0.9 },
      { 
        opacity: 1, 
        x: 0, 
        scale: 1,
        duration: 1, 
        ease: "power3.out",
        delay: 0.2
      }
    );

    // Hero Section Animation - Subtitle slides from left
    gsap.fromTo(heroSubtitleRef.current,
      { opacity: 0, x: -60 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.8, 
        ease: "power2.out",
        delay: 0.5
      }
    );

    // Hero Section Animation - Content slides from left to right
    gsap.fromTo(heroContentRef.current,
      { opacity: 0, x: -100 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 1.2, 
        ease: "power3.out",
        delay: 0.8
      }
    );

    // What Is Section Animation
    gsap.fromTo(whatIsRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: whatIsRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Features Section Animation
    gsap.fromTo(featuresRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Feature Cards Animation
    const featureCards = gsap.utils.toArray('.feature-row');
    featureCards.forEach((card, index) => {
      gsap.fromTo(card,
        { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Audiences Section Animation
    gsap.fromTo(audiencesRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: audiencesRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Audience Cards Animation
    const audienceCards = gsap.utils.toArray('.audience-card');
    audienceCards.forEach((card, index) => {
      gsap.fromTo(card,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // CTA Section Animation
    gsap.fromTo(ctaRef.current,
      { opacity: 0, y: 60, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Benefit Cards Animation (What Is Section)
    const benefitCards = gsap.utils.toArray('.benefit-item');
    benefitCards.forEach((card, index) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40, rotationY: 15 },
        {
          opacity: 1,
          y: 0,
          rotationY: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });


    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  

  return (
    <div className="homepage">
      <Header />

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title" ref={heroTitleRef}>Don't Forget — Take Control Today</h1>
            <p className="hero-subtitle" ref={heroSubtitleRef}>Stay Organized. Stay Ahead. Never Miss a Thing.</p>
            
            <div className="hero-text-content" ref={heroContentRef}>
              <p className="hero-paragraph">Ever missed something important… and felt the fallout immediately? A meeting you forgot. A deadline you blew past. A client you lost because the follow-up never happened. One small slip can cost time, money, and trust.</p>
              <p className="hero-paragraph">Let's be honest.</p>
              <p className="hero-paragraph">Life is coming at you fast — clients to manage, meetings to schedule, deadlines to hit, and personal responsibilities you can't drop. Whether you're an entrepreneur, a consultant, a student organizing study groups, a virtual assistant juggling multiple clients, a busy supervisor, or a parent trying to keep the family calendar from falling apart… one thing is certain:</p>
              <p className="hero-paragraph">You can't afford to forget.</p>
              <p className="hero-paragraph">That's where Don't Forget comes in.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="what-is-section" ref={whatIsRef}>
        <div className="what-is-container">
          <div className="what-is-header">
            <div className="what-is-icon">
              <FiTarget />
            </div>
            <h2 className="what-is-title">Why Use Don't Forget?</h2>
          </div>
          <p className="what-is-subtitle">No more scattered tools. No more missed opportunities.</p>
          <p className="what-is-description">With Don't Forget, you see everything in one clean, organized space — so you can work smarter, stay prepared, and protect your time. Don't just manage your schedule. Own it.</p>
          
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">
                <FiLayers />
              </div>
              <div className="benefit-content">
                <h3 className="benefit-title">All-in-One Solution</h3>
                <p className="benefit-text">Consolidate your tools into one powerful platform that handles everything you need.</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon">
                <FiShield />
              </div>
              <div className="benefit-content">
                <h3 className="benefit-title">Never Miss Again</h3>
                <p className="benefit-text">Intelligent reminders and automated workflows ensure nothing falls through the cracks.</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon">
                <FiTrendingUp />
              </div>
              <div className="benefit-content">
                <h3 className="benefit-title">Boost Productivity</h3>
                <p className="benefit-text">Streamlined processes and smart automation help you accomplish more in less time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" ref={featuresRef}>
        <div className="features-container">
          <div className="features-content">
            <div className="features-intro">With Don't Forget, you can:</div>

            <div className="features-list">
              <div className="feature-row">
                <div className="feature-media">
                  <figure className="feature-figure">
                    <img className="image-fill" src="https://makingmoveslondon.co.uk/wp-content/uploads/2019/03/AdobeStock_239027622-e1553244136278.jpeg" alt="Online booking and calendar management" />
                  </figure>
                </div>
                <div className="feature-content">
                  <div className="feature-card">
                    <span className="feature-icon" aria-hidden="true"><FiCalendar /></span>
                    <div className="feature-text">Book and manage appointments online with a personalized public booking page.</div>
                  </div>
                  <div className="feature-description">
                    <p>Create a professional booking experience that works around your schedule. Clients can see your availability in real-time and book appointments instantly without back-and-forth emails or phone calls.</p>
                    <p>Your personalized booking page includes your branding, service descriptions, pricing, and availability. Set up automated confirmations, reminders, and rescheduling options to reduce no-shows and administrative work.</p>
                  </div>
                </div>
              </div>

              <div className="feature-row feature-row-reverse">
                <div className="feature-media">
                  <figure className="feature-figure">
                    <img className="image-fill" src="https://cdn.mos.cms.futurecdn.net/YdtUvYoYvzAb9Zj6NNKC6X.jpg" alt="Payment processing and invoicing" />
                  </figure>
                </div>
                <div className="feature-content">
                  <div className="feature-card">
                    <span className="feature-icon" aria-hidden="true"><FiCreditCard /></span>
                    <div className="feature-text">Accept payments instantly through secure Stripe or PayPal integration — no extra steps, no chasing invoices.</div>
                  </div>
                  <div className="feature-description">
                    <p>Get paid faster with integrated payment processing that handles everything automatically. Collect deposits, full payments, or recurring subscriptions directly through your booking system.</p>
                    <p>No more manual invoicing or chasing late payments. Set up automatic payment collection, send professional receipts, and track your revenue all in one place. Your clients get a seamless payment experience while you get paid on time.</p>
                  </div>
                </div>
              </div>

              <div className="feature-row">
                <div className="feature-media">
                  <figure className="feature-figure">
                    <img className="image-fill" src="https://images.pexels.com/photos/3183186/pexels-photo-3183186.jpeg" alt="Email confirmations and communication" />
                  </figure>
                </div>
                <div className="feature-content">
                  <div className="feature-card">
                    <span className="feature-icon" aria-hidden="true"><FiMail /></span>
                    <div className="feature-text">Send and receive confirmations right inside the platform — no outside email required.</div>
                  </div>
                  <div className="feature-description">
                    <p>Streamline your communication with built-in messaging that keeps all client interactions organized. Send appointment confirmations, updates, and follow-ups without leaving the platform.</p>
                    <p>Reduce email clutter and never miss important messages. All communications are automatically linked to specific appointments and clients, making it easy to maintain context and provide excellent customer service.</p>
                  </div>
                </div>
              </div>

              <div className="feature-row feature-row-reverse">
                <div className="feature-media">
                  <figure className="feature-figure">
                    <img className="image-fill" src="https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg" alt="Task tracking and reminders" />
                  </figure>
                </div>
                <div className="feature-content">
                  <div className="feature-card">
                    <span className="feature-icon" aria-hidden="true"><FiAlertCircle /></span>
                    <div className="feature-text">Track tasks with color-coded reminders so you instantly know what's urgent, due today, or overdue.</div>
                  </div>
                  <div className="feature-description">
                    <p>Never miss important deadlines with intelligent task management that prioritizes your workload. Color-coded system helps you quickly identify urgent tasks, upcoming deadlines, and overdue items at a glance.</p>
                    <p>Set up automatic reminders for follow-ups, preparation tasks, and client communications. The system learns your patterns and suggests optimal timing for different types of tasks, helping you stay organized and productive.</p>
                  </div>
                </div>
              </div>

              <div className="feature-row">
                <div className="feature-media">
                  <figure className="feature-figure">
                    <img className="image-fill" src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg" alt="Follow-ups and important notes organization" />
                  </figure>
                </div>
                <div className="feature-content">
                  <div className="feature-card">
                    <span className="feature-icon" aria-hidden="true"><FiBook /></span>
                    <div className="feature-text">Organize follow-ups and important notes so every client, project, or event stays on your radar.</div>
                  </div>
                  <div className="feature-description">
                    <p>Keep detailed notes and action items for every client interaction. Track project progress, client preferences, and important details that help you deliver personalized service consistently.</p>
                    <p>Set up automated follow-up sequences and never lose track of important client relationships. The system reminds you of upcoming check-ins, anniversaries, and opportunities to strengthen your client connections.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="audiences-section" ref={audiencesRef}>
        <div className="audiences-container">
          <div className="audiences-header">
            <h2 className="audiences-title">Perfect for Everyone</h2>
            <p className="audiences-subtitle">Don't Forget adapts to your unique needs, no matter your role or lifestyle.</p>
          </div>
          
          <div className="audiences-grid">
            <div className="audience-card audience-entrepreneur">
              <div className="audience-card-header">
                <div className="audience-icon">
                  <FiTrendingUp />
                </div>
                <h3 className="audience-role">Entrepreneur</h3>
              </div>
              <p className="audience-description">More paid bookings and fewer no-shows. Streamline your client management and grow your business efficiently.</p>
            </div>
            
            <div className="audience-card audience-student">
              <div className="audience-card-header">
                <div className="audience-icon">
                  <FiBookOpen />
                </div>
                <h3 className="audience-role">Student</h3>
              </div>
              <p className="audience-description">Schedule study groups without messy group chats. Keep your academic life organized and collaborative.</p>
            </div>
            
            <div className="audience-card audience-parent">
              <div className="audience-card-header">
                <div className="audience-icon">
                  <FiUsers />
                </div>
                <h3 className="audience-role">Busy Parent</h3>
              </div>
              <p className="audience-description">Keep family events, appointments, and reminders in one place. Never miss a soccer game or parent-teacher conference again.</p>
            </div>
            
            <div className="audience-card audience-professional">
              <div className="audience-card-header">
                <div className="audience-icon">
                  <FiGrid />
                </div>
                <h3 className="audience-role">Supervisor or VA</h3>
              </div>
              <p className="audience-description">Manage multiple calendars without losing track. Coordinate teams and clients with ease and precision.</p>
            </div>
          </div>
        </div>
      </section>


      <section className="cta-section" ref={ctaRef}>
        <div className="cta-container">
          <div className="cta-content">
            <h3 className="cta-heading">Don't Forget — Take Control Today!</h3>
            <p className="cta-copy">Start Now — Keep Every Detail on Track!</p>
          </div>
        </div>
      </section>

      <SiteFooter />
      <NewsletterPopup />
    </div>
  );
};

export default Homepage;