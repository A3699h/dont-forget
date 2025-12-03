import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiUser, FiMail, FiLink, FiX, FiRefreshCw, FiEye } from 'react-icons/fi';
import { api } from '../utils/api';
import './Bookings.css';

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getBookings();
      setBookings(response.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.updateBooking(bookingId, { status: newStatus });
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));
    } catch (err) {
      setError(err.message || 'Failed to update booking status');
      console.error('Error updating booking:', err);
    }
  };


  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }
    
    try {
      await api.deleteBooking(bookingId);
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      setError(err.message || 'Failed to delete booking');
      console.error('Error deleting booking:', err);
    }
  };

  const filteredBookings = useMemo(() => {
    if (filterStatus === 'all') return bookings;
    return bookings.filter(b => b.status === filterStatus);
  }, [bookings, filterStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      case 'completed': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="bookings-page">
        <div className="content-header">
          <div className="section-title">
            <span className="title-icon"><FiCalendar /></span>
            <h2>Bookings</h2>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="content-header">
        <div className="section-title">
          <span className="title-icon"><FiCalendar /></span>
          <h2>Bookings</h2>
        </div>
        <p className="section-desc">Manage your bookings, activate them, and connect tasks.</p>
      </div>

      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div className="bookings-controls">
        <div className="filter-controls">
          <label>Filter by status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button 
          className="refresh-btn" 
          onClick={fetchBookings}
          disabled={loading}
        >
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.id}>
                  <td>
                    <div className="guest-info">
                      <div className="guest-name">
                        <FiUser size={14} /> {booking.guest_name}
                      </div>
                      <div className="guest-details">
                        <span><FiMail size={12} /> {booking.guest_email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="datetime-info">
                      <div>{formatDate(booking.date)}</div>
                      <div className="time-slot">{booking.time_slot}</div>
                    </div>
                  </td>
                  <td>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      className="status-select"
                      style={{ 
                        background: getStatusColor(booking.status),
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td>
                    <span className={`payment-badge ${booking.payment_status}`}>
                      {booking.payment_status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      {booking.meeting_link && (
                        <a 
                          href={booking.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="meeting-link-btn"
                          title="Meeting Link"
                        >
                          <FiLink />
                        </a>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteBooking(booking.id)}
                        title="Delete"
                      >
                        <FiX />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default Bookings;

