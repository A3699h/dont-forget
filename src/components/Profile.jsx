import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiSave, FiX, FiArrowLeft, FiHome, FiTag, FiPhone, FiMap, FiVideo } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    current_password: '',
    password: '',
    password_confirmation: '',
    business_name: '',
    role_title: '',
    phone_number: '',
    timezone: '',
    video_platform: 'Zoom'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        current_password: '',
        password: '',
        password_confirmation: '',
        business_name: user.business_name || '',
        role_title: user.role_title || '',
        phone_number: user.phone_number || '',
        timezone: user.timezone || 'UTC',
        video_platform: user.video_platform || 'Zoom'
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Only include password fields if user wants to change password
      const updateData = { ...formData };
      
      if (!updateData.password) {
        // Remove password fields if not changing password
        delete updateData.current_password;
        delete updateData.password;
        delete updateData.password_confirmation;
      }

      // Remove empty fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '') {
          delete updateData[key];
        }
      });

      await api.updateProfile(updateData);
      
      // Refresh user data in context
      await refreshUser();
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setSuccess('');
      }, 3000);

      // Clear password fields after successful update
      if (updateData.password) {
        setFormData(prev => ({
          ...prev,
          current_password: '',
          password: '',
          password_confirmation: ''
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 
    'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo',
    'Asia/Shanghai', 'Australia/Sydney'
  ];

  if (!user) {
    return (
      <div className="profile-page">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <FiArrowLeft /> Back to Dashboard
        </button>
        <h1>Profile Settings</h1>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {success && (
        <div className="success-message">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-section">
          <h2 className="section-title">Personal Information</h2>
          <div className="form-grid">
            <div className="form-field">
              <label>
                <FiUser /> Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label>
                <FiMail /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label>
                <FiPhone /> Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Business Information</h2>
          <div className="form-grid">
            <div className="form-field">
              <label>
                <FiHome /> Business Name
              </label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label>
                <FiTag /> Role Title
              </label>
              <input
                type="text"
                name="role_title"
                value={formData.role_title}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Preferences</h2>
          <div className="form-grid">
            <div className="form-field">
              <label>
                <FiMap /> Timezone
              </label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="form-input"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>
                <FiVideo /> Video Platform
              </label>
              <select
                name="video_platform"
                value={formData.video_platform}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="Zoom">Zoom</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Change Password</h2>
          <p className="section-description">Leave blank if you don't want to change your password</p>
          <div className="form-grid">
            <div className="form-field">
              <label>
                <FiLock /> Current Password
              </label>
              <input
                type="password"
                name="current_password"
                value={formData.current_password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter current password to change"
              />
            </div>

            <div className="form-field">
              <label>
                <FiLock /> New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter new password"
                minLength="8"
              />
            </div>

            <div className="form-field">
              <label>
                <FiLock /> Confirm New Password
              </label>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Confirm new password"
                minLength="8"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={saving}>
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <FiX /> Logout
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

