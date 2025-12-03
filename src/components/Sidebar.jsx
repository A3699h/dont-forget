import React from 'react';
import { FiBarChart2, FiPlus, FiRepeat, FiCalendar, FiSettings, FiEdit3, FiVideo, FiClipboard, FiFileText, FiBookOpen, FiShield, FiUser, FiList } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getUserDisplayName, getUserInitials } from '../utils/auth/helpers';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeSection, onSectionChange, isOpen, onClose, onToggle }) => {
  const { user } = useAuth();
  const displayName = getUserDisplayName(user);
  const userInitials = getUserInitials(user);
  const navigate = useNavigate();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiBarChart2 /> },
    { id: 'add-task', label: 'Create a Task', icon: <FiPlus /> },
    { id: 'follow-up', label: 'Follow-Ups', icon: <FiRepeat /> },
    { id: 'bookings', label: 'Bookings', icon: <FiList /> },
    { id: 'booking', label: 'Public Booking Page', icon: <FiCalendar /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
    { id: 'meeting-templates', label: 'Communication Templates', icon: <FiFileText /> },
    { id: 'faq', label: 'FAQ', icon: <FiClipboard /> },
    { id: 'contact', label: 'Contact Us', icon: <FiEdit3 /> },
    { id: 'blog', label: 'Blog', icon: <FiBookOpen /> },
    { id: 'privacy-terms', label: 'Privacy & Terms', icon: <FiShield /> }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'collapsed'} bg-brand text-primary`}>
      <div className="sidebar-header">
        <div className="logo">
          <a
            className="logo-link"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open homepage in new tab"
          >
            <div className="logo-icon"><FiEdit3 /></div>
            <div className="logo-text">
              <div className="logo-title">DONT FORGET</div>
              <div className="logo-subtitle">Task Manager</div>
            </div>
          </a>
          <button
            aria-label="Toggle sidebar"
            className="sidebar-toggle"
            onClick={() => (onToggle ? onToggle() : onClose && onClose())}
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? '❯' : '❮'}
          </button>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => {
                  const openInNewTab = ['faq', 'contact', 'blog', 'privacy-terms'].includes(item.id);
                  const topLevelMap = {
                    'faq': '/faq',
                    'contact': '/contact',
                    'blog': '/blog',
                    'privacy-terms': '/privacy'
                  };
                  const path = openInNewTab
                    ? topLevelMap[item.id]
                    : `/dashboard/${item.id === 'dashboard' ? '' : item.id}`;
                  if (openInNewTab) {
                    window.open(path, '_blank', 'noopener,noreferrer');
                  } else {
                    onSectionChange(item.id);
                  }
                  // Do not auto-close/collapse the sidebar on item click
                }}
                title={`${item.label}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User Profile Section */}
      {isOpen && user && (
        <div className="sidebar-footer">
          <div className="user-profile" onClick={() => navigate('/dashboard/profile')}>
            <div className="user-avatar">
              {userInitials}
            </div>
            <div className="user-info">
              <div className="user-name">{displayName}</div>
              {user.email && (
                <div className="user-email">{user.email}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
