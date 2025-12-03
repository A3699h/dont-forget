import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiBell, 
  FiCalendar, 
  FiDollarSign, 
  FiAlertTriangle, 
  FiCheck, 
  FiX,
  FiClock,
  FiUser
} from 'react-icons/fi';
import { api } from '../utils/api';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [settings, setSettings] = useState({ notifications: { reminders: true, payments: true, overdue: true } });
  const [loading, setLoading] = useState(true);
  const [seenNotifications, setSeenNotifications] = useState(new Set());

  useEffect(() => {
    fetchData();
    loadSeenNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, tasksRes, settingsRes] = await Promise.all([
        api.getBookings(),
        api.getTasks(),
        api.getSettings()
      ]);
      
      setBookings(bookingsRes.bookings || []);
      setTasks(tasksRes.tasks || []);
      // Always set settings, even if empty, to ensure defaults are used
      if (settingsRes.settings) {
        setSettings(settingsRes.settings);
      } else {
        // Use defaults if no settings found
        setSettings({ 
          notifications: { reminders: true, payments: true, overdue: true } 
        });
      }
    } catch (err) {
      console.error('Error fetching notification data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSeenNotifications = () => {
    const seen = localStorage.getItem('seenNotifications');
    if (seen) {
      setSeenNotifications(new Set(JSON.parse(seen)));
    }
  };

  const markAsSeen = (notificationId) => {
    const newSeen = new Set(seenNotifications);
    newSeen.add(notificationId);
    setSeenNotifications(newSeen);
    localStorage.setItem('seenNotifications', JSON.stringify([...newSeen]));
  };

  const markAllAsSeen = () => {
    const allIds = notifications.map(n => n.id);
    const newSeen = new Set([...seenNotifications, ...allIds]);
    setSeenNotifications(newSeen);
    localStorage.setItem('seenNotifications', JSON.stringify([...newSeen]));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const getTimeUntil = (dateString, timeString) => {
    if (!dateString || !timeString) return '';
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const bookingDate = new Date(dateString);
    bookingDate.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    const diffMs = bookingDate - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffMs < 0) {
      return 'Past';
    } else if (diffHours < 1) {
      return `in ${diffMins} min`;
    } else if (diffHours < 24) {
      return `in ${diffHours}h`;
    } else {
      const days = Math.floor(diffHours / 24);
      return `in ${days}d`;
    }
  };

  const notifications = useMemo(() => {
    const notifs = [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Booking reminders (upcoming bookings within 24 hours)
    if (settings.notifications?.reminders) {
      bookings.forEach(booking => {
        if (booking.status === 'cancelled') return;
        
        const bookingDate = new Date(booking.date);
        const [hours, minutes] = (booking.time_slot || '00:00').split(':').map(Number);
        bookingDate.setHours(hours, minutes, 0, 0);
        
        if (bookingDate > now && bookingDate <= oneDayAhead) {
          notifs.push({
            id: `reminder-${booking.id}`,
            type: 'reminder',
            title: 'Upcoming Booking',
            message: `${booking.guest_name} - ${formatDate(booking.date)} at ${booking.time_slot}`,
            time: getTimeUntil(booking.date, booking.time_slot),
            icon: <FiCalendar />,
            color: '#3b82f6',
            onClick: () => {
              navigate(`/dashboard/bookings/${booking.id}`);
              setIsOpen(false);
            },
            bookingId: booking.id
          });
        }
      });
    }

    // Payment alerts (unpaid bookings)
    if (settings.notifications?.payments) {
      bookings.forEach(booking => {
        if (booking.payment_status === 'pending' && booking.status !== 'cancelled') {
          notifs.push({
            id: `payment-${booking.id}`,
            type: 'payment',
            title: 'Payment Pending',
            message: `${booking.guest_name} - ${formatDate(booking.date)}`,
            time: '',
            icon: <FiDollarSign />,
            color: '#f59e0b',
            onClick: () => {
              navigate(`/dashboard/bookings/${booking.id}`);
              setIsOpen(false);
            },
            bookingId: booking.id
          });
        }
      });
    }

    // Overdue tasks
    if (settings.notifications?.overdue) {
      tasks.forEach(task => {
        if (task.status !== 'completed' && task.date_time) {
          const taskDate = new Date(task.date_time);
          if (taskDate < now) {
            notifs.push({
              id: `overdue-${task.id}`,
              type: 'overdue',
              title: 'Overdue Task',
              message: task.title || task.name || 'Untitled Task',
              time: formatDate(task.date_time),
              icon: <FiAlertTriangle />,
              color: '#ef4444',
              onClick: () => {
                navigate('/dashboard');
                setIsOpen(false);
              },
              taskId: task.id
            });
          }
        }
      });
    }

    // New bookings (created within last 24 hours)
    bookings.forEach(booking => {
      if (booking.created_at) {
        const createdDate = new Date(booking.created_at);
        if (createdDate > oneDayAgo) {
          notifs.push({
            id: `new-${booking.id}`,
            type: 'new',
            title: 'New Booking',
            message: `${booking.guest_name} booked for ${formatDate(booking.date)}`,
            time: formatDate(booking.created_at),
            icon: <FiUser />,
            color: '#10b981',
            onClick: () => {
              navigate(`/dashboard/bookings/${booking.id}`);
              setIsOpen(false);
            },
            bookingId: booking.id
          });
        }
      }
    });

    // Sort by priority: overdue > payment > reminder > new
    const priorityOrder = { overdue: 0, payment: 1, reminder: 2, new: 3 };
    return notifs.sort((a, b) => {
      return priorityOrder[a.type] - priorityOrder[b.type];
    });
  }, [bookings, tasks, settings, navigate]);

  const unreadCount = notifications.filter(n => !seenNotifications.has(n.id)).length;

  const handleNotificationClick = (notification) => {
    markAsSeen(notification.id);
    if (notification.onClick) {
      notification.onClick();
    }
  };

  return (
    <div className="notification-center">
      <button 
        className="notification-bell" 
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)} />
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button className="mark-all-read" onClick={markAllAsSeen}>
                  Mark all as read
                </button>
              )}
              <button className="close-notifications" onClick={() => setIsOpen(false)}>
                <FiX />
              </button>
            </div>

            <div className="notification-list">
              {loading ? (
                <div className="notification-loading">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">
                  <FiBell size={32} />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map(notification => {
                  const isUnread = !seenNotifications.has(notification.id);
                  return (
                    <div
                      key={notification.id}
                      className={`notification-item ${isUnread ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div 
                        className="notification-icon" 
                        style={{ background: `${notification.color}20`, color: notification.color }}
                      >
                        {notification.icon}
                      </div>
                      <div className="notification-content">
                        <div className="notification-title-row">
                          <h4>{notification.title}</h4>
                          {isUnread && <span className="unread-dot" />}
                        </div>
                        <p className="notification-message">{notification.message}</p>
                        {notification.time && (
                          <span className="notification-time">
                            <FiClock size={12} /> {notification.time}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;

