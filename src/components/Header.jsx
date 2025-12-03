import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { FiFeather } from 'react-icons/fi';
import { gsap } from 'gsap';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Refs for animations
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const navLinksRef = useRef(null);
  const buttonsRef = useRef(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // GSAP Animations
  useEffect(() => {
    // Header slides down from top
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: -50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        ease: "power2.out",
        delay: 0.1
      }
    );

    // Logo slides from left
    gsap.fromTo(logoRef.current,
      { opacity: 0, x: -30 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.6, 
        ease: "power2.out",
        delay: 0.3
      }
    );

    // Navigation links slide from center
    gsap.fromTo(navLinksRef.current,
      { opacity: 0, y: -20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        ease: "power2.out",
        delay: 0.5
      }
    );

    // Buttons slide from right
    gsap.fromTo(buttonsRef.current,
      { opacity: 0, x: 30 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.6, 
        ease: "power2.out",
        delay: 0.7
      }
    );
  }, []);

  return (
    <header className="header nav-pill" ref={headerRef}>
      <div
        className="pill-left-icon"
        ref={logoRef}
        onClick={()=>navigate('/')}
        role="button"
        aria-label="Go to homepage"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}
      >
        {/* Feather/pen icon as logo */}
        <FiFeather size={22} />
        <span className="brand-text" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Don't Forget</span>
      </div>
      
      {/* Desktop Navigation */}
      <nav className="pill-nav desktop-nav" ref={navLinksRef}>
        <Link to="/faq" className="pill-link">FAQs</Link>
        <Link to="/blog" className="pill-link">Blogs</Link>
        <Link to="/contact" className="pill-link">Contact Us</Link>
      </nav>
      
      {/* Desktop Header Right */}
      <div className="header-right desktop-header-right" ref={buttonsRef} style={{ display: 'flex', gap: 8 }}>
        {!loading && (
          <>
            {isAuthenticated ? (
              <Link to='/dashboard' className="signup-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>Dashboard</Link>
            ) : (
              <>
                <Link to='/login' className="signin-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>Login</Link>
                <Link to="/signup" className="signup-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>Signup</Link>
              </>
            )}
          </>
        )}
      </div>


      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Navigation Overlay */}
      <div 
        className={`mobile-nav-overlay ${isMobileMenuOpen ? 'mobile-nav-open' : ''}`}
        onClick={closeMobileMenu}
      >
        <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
          <Link to="/faq" className="mobile-nav-link" onClick={closeMobileMenu}>FAQs</Link>
          <Link to="/blog" className="mobile-nav-link" onClick={closeMobileMenu}>Blogs</Link>
          <Link to="/contact" className="mobile-nav-link" onClick={closeMobileMenu}>Contact Us</Link>
          
          <div className="mobile-nav-buttons">
            {!loading && (
              <>
                {isAuthenticated ? (
                  <Link to='/dashboard' className="mobile-signup-btn" onClick={closeMobileMenu}>Dashboard</Link>
                ) : (
                  <>
                    <Link to='/login' className="mobile-signin-btn" onClick={closeMobileMenu}>Login</Link>
                    <Link to="/signup" className="mobile-signup-btn" onClick={closeMobileMenu}>Signup</Link>
                  </>
                )}
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;