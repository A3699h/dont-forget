import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiUser, FiMail, FiPhone, FiLink, FiSave, FiX, FiArrowLeft, FiEdit2, FiCheck } from 'react-icons/fi';
import { api } from '../utils/api';
import './BookingDetail.css';

const defaultTimeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:30', '12:00', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [packages, setPackages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guest_comment: '',
    package_id: '',
    date: '',
    time_slot: '',
    status: 'pending',
    payment_status: 'pending',
    task_id: '',
    meeting_link: ''
  });

  useEffect(() => {
    fetchBooking();
    fetchPackages();
    fetchTasks();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getBooking(id);
      const bookingData = response.booking;
      setBooking(bookingData);
      setFormData({
        guest_name: bookingData.guest_name || '',
        guest_email: bookingData.guest_email || '',
        guest_phone: bookingData.guest_phone || '',
        guest_comment: bookingData.guest_comment || '',
        package_id: bookingData.package_id || '',
        date: bookingData.date ? bookingData.date.split('T')[0] : '',
        time_slot: bookingData.time_slot || '',
        status: bookingData.status || 'pending',
        payment_status: bookingData.payment_status || 'pending',
        task_id: bookingData.task_id || '',
        meeting_link: bookingData.meeting_link || ''
      });
    } catch (err) {
      setError(err.message || 'Failed to load booking');
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await api.getPackages();
      setPackages(response.packages || []);
    } catch (err) {
      console.error('Error fetching packages:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.getTasks();
      setTasks(response.tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      const updateData = { ...formData };
      // Convert empty strings to null for optional fields
      if (!updateData.package_id) updateData.package_id = null;
      if (!updateData.task_id) updateData.task_id = null;
      if (!updateData.guest_comment) updateData.guest_comment = null;
      if (!updateData.meeting_link) updateData.meeting_link = null;

      await api.updateBooking(id, updateData);
      await fetchBooking();
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update booking');
      console.error('Error updating booking:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }
    
    try {
      await api.deleteBooking(id);
      navigate('/dashboard/bookings');
    } catch (err) {
      setError(err.message || 'Failed to delete booking');
      console.error('Error deleting booking:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      case 'completed': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="booking-detail-page">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading booking...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="booking-detail-page">
        <div className="error-message">Booking not found</div>
        <button onClick={() => navigate('/dashboard/bookings')} className="back-btn">
          <FiArrowLeft /> Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="booking-detail-page">
      <div className="booking-detail-header">
        <button onClick={() => navigate('/dashboard/bookings')} className="back-btn">
          <FiArrowLeft /> Back to Bookings
        </button>
        <div className="header-actions">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              <FiEdit2 /> Edit Booking
            </button>
          ) : (
            <div className="edit-actions">
              <button onClick={handleSave} className="save-btn" disabled={saving}>
                <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => { setIsEditing(false); fetchBooking(); }} className="cancel-btn">
                <FiX /> Cancel
              </button>
            </div>
          )}
          <button onClick={handleDelete} className="delete-btn">
            <FiX /> Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="booking-detail-content">
        <div className="booking-detail-card">
          <h2 className="card-title">Guest Information</h2>
          <div className="form-grid">
            <div className="form-field">
              <label>
                <FiUser /> Guest Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="guest_name"
                  value={formData.guest_name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              ) : (
                <div className="field-value">{booking.guest_name}</div>
              )}
            </div>

            <div className="form-field">
              <label>
                <FiMail /> Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="guest_email"
                  value={formData.guest_email}
                  onChange={handleInputChange}
                  className="form-input"
                />
              ) : (
                <div className="field-value">{booking.guest_email}</div>
              )}
            </div>

            <div className="form-field">
              <label>
                <FiPhone /> Phone
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="guest_phone"
                  value={formData.guest_phone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              ) : (
                <div className="field-value">{booking.guest_phone}</div>
              )}
            </div>

            <div className="form-field full">
              <label>Comment</label>
              {isEditing ? (
                <textarea
                  name="guest_comment"
                  value={formData.guest_comment || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  rows="3"
                />
              ) : (
                <div className="field-value">{booking.guest_comment || 'No comment'}</div>
              )}
            </div>
          </div>
        </div>

        <div className="booking-detail-card">
          <h2 className="card-title">Booking Details</h2>
          <div className="form-grid">
            <div className="form-field">
              <label>
                <FiCalendar /> Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-input"
                />
              ) : (
                <div className="field-value">{formatDate(booking.date)}</div>
              )}
            </div>

            <div className="form-field">
              <label>Time Slot</label>
              {isEditing ? (
                <select
                  name="time_slot"
                  value={formData.time_slot}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select time</option>
                  {defaultTimeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              ) : (
                <div className="field-value">{booking.time_slot}</div>
              )}
            </div>

            <div className="form-field">
              <label>Package</label>
              {isEditing ? (
                <select
                  name="package_id"
                  value={formData.package_id || ''}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">No package</option>
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — ${Number(pkg.price).toFixed(2)} • {pkg.duration}m
                    </option>
                  ))}
                </select>
              ) : (
                <div className="field-value">
                  {booking.package ? (
                    <div>
                      <strong>{booking.package.name}</strong>
                      <div className="package-meta">
                        ${Number(booking.package.price).toFixed(2)} • {booking.package.duration}m
                      </div>
                    </div>
                  ) : (
                    'No package'
                  )}
                </div>
              )}
            </div>

            <div className="form-field">
              <label>Status</label>
              {isEditing ? (
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ 
                    background: getStatusColor(formData.status),
                    color: 'white',
                    border: 'none'
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              ) : (
                <div className="field-value">
                  <span 
                    className="status-badge"
                    style={{ background: getStatusColor(booking.status) }}
                  >
                    {booking.status}
                  </span>
                </div>
              )}
            </div>

            <div className="form-field">
              <label>Payment Status</label>
              {isEditing ? (
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              ) : (
                <div className="field-value">
                  <span className={`payment-badge ${booking.payment_status}`}>
                    {booking.payment_status}
                  </span>
                </div>
              )}
            </div>

            <div className="form-field full">
              <label>
                <FiLink /> Meeting Link
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="meeting_link"
                  value={formData.meeting_link || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://..."
                />
              ) : (
                <div className="field-value">
                  {booking.meeting_link ? (
                    <a 
                      href={booking.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="meeting-link"
                    >
                      {booking.meeting_link}
                    </a>
                  ) : (
                    'No meeting link'
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="booking-detail-card">
          <h2 className="card-title">Connected Task</h2>
          <div className="form-field">
            {isEditing ? (
              <select
                name="task_id"
                value={formData.task_id || ''}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">No task</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title || task.name} {task.date_time ? `(${formatDate(task.date_time)})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="field-value">
                {booking.task ? (
                  <div className="connected-task-info">
                    <div className="task-title">
                      <FiLink size={16} color="#3b82f6" />
                      <strong>{booking.task.title || booking.task.name}</strong>
                    </div>
                    {booking.task.date_time && (
                      <div className="task-meta">
                        Date: {formatDate(booking.task.date_time)}
                      </div>
                    )}
                    {booking.task.status && (
                      <div className="task-meta">
                        Status: {booking.task.status}
                      </div>
                    )}
                  </div>
                ) : (
                  'No task connected'
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;

