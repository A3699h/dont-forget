import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getUserDisplayName } from '../utils/auth/helpers';
import './ProfileDropdown.css';

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = getUserDisplayName(user);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button 
        className="profile-button" 
        onClick={() => setIsOpen(!isOpen)}
        title={displayName}
      >
        <FiUser />
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-info">
            <div className="profile-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="profile-details">
              <div className="profile-name-full">{displayName}</div>
              <div className="profile-email">{user?.email}</div>
            </div>
          </div>
          
          <div className="dropdown-divider" />
          
          <button className="dropdown-item" onClick={handleProfileClick}>
            <FiUser /> Profile Settings
          </button>
          
          <button className="dropdown-item" onClick={() => { navigate('/dashboard/settings'); setIsOpen(false); }}>
            <FiSettings /> Settings
          </button>
          
          <div className="dropdown-divider" />
          
          <button className="dropdown-item logout" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      )}

      {isOpen && (
        <div className="dropdown-overlay" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default ProfileDropdown;

