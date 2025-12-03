import React from 'react';
import { FiX, FiCalendar, FiClock, FiUser, FiVideo, FiPhone, FiFileText, FiTag, FiLink, FiRepeat, FiBell, FiExternalLink } from 'react-icons/fi';
import { openZoomMeeting, openGoogleMeet, openCanva, requestStripePayment, requestPayPalPayment, isIntegrationConnected } from '../utils/integrations';
import './ViewTaskModal.css';
import { useEffect, useState } from 'react';

const ViewTaskModal = ({ task, onClose }) => {
  if (!task) return null;

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const { date, time } = formatDateTime(task.dateTime);

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#28A745',
      'medium': '#FFC107',
      'high': '#DC3545',
      'urgent': '#E83E8C'
    };
    return colors[priority] || '#28A745';
  };

  const getTaskTypeIcon = (type) => {
    switch(type) {
      case 'Video': return <FiVideo />;
      case 'Phone': return <FiPhone />;
      case 'Note': return <FiFileText />;
      default: return <FiFileText />;
    }
  };

  

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="view-task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottomColor: getPriorityColor(task.priority) }}>
          <h2>Task Details</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="task-detail-section">
            {/* Title */}
            <div className="detail-row">
              <div className="detail-label">
                <FiFileText className="detail-icon" />
                <span>Title</span>
              </div>
              <div className="detail-value title">{task.name || task.title}</div>
            </div>

            {/* Invitees */}
            {(task.invitee || (task.invitees && task.invitees.length > 0)) && (
              <div className="detail-row">
                <div className="detail-label">
                  <FiUser className="detail-icon" />
                  <span>Invitees</span>
                </div>
                <div className="detail-value">
                  {(() => {
                    let inviteesArray = [];
                    if (task.invitees && Array.isArray(task.invitees)) {
                      inviteesArray = task.invitees;
                    } else if (task.invitee) {
                      inviteesArray = task.invitee.split(',').map(i => i.trim()).filter(i => i);
                    }
                    return inviteesArray.length > 0 ? (
                      <div className="invitees-list">
                        {inviteesArray.map((invitee, index) => (
                          <span key={index} className="invitee-chip-view">{invitee}</span>
                        ))}
                      </div>
                    ) : task.invitee;
                  })()}
                </div>
              </div>
            )}

            {/* Task Type */}
            <div className="detail-row">
              <div className="detail-label">
                {getTaskTypeIcon(task.taskType)}
                <span>Task Type</span>
              </div>
              <div className="detail-value">{task.taskType || 'Regular'}</div>
            </div>

            {/* Video Platform */}
            {task.taskType === 'Video' && task.platform && (
              <div className="detail-row">
                <div className="detail-label">
                  <FiVideo className="detail-icon" />
                  <span>Video Platform</span>
                </div>
                <div className="detail-value">{task.platform}</div>
              </div>
            )}

            {/* Meeting Link */}
            {task.taskType === 'Video' && task.meetingLink && (
              <div className="detail-row">
                <div className="detail-label">
                  <FiLink className="detail-icon" />
                  <span>Meeting Link</span>
                </div>
                <div className="detail-value">
                  <a href={task.meetingLink} target="_blank" rel="noopener noreferrer">
                    {task.meetingLink}
                  </a>
                </div>
              </div>
            )}

            {/* Date & Time */}
            <div className="detail-row">
              <div className="detail-label">
                <FiCalendar className="detail-icon" />
                <span>Date & Time</span>
              </div>
              <div className="detail-value">{date} at {time}</div>
            </div>

            {/* Key Points */}
            <div className="detail-row">
              <div className="detail-label">
                <FiFileText className="detail-icon" />
                <span>Key Points</span>
              </div>
              <div className="detail-value description">
                {(() => {
                  // Handle keyPoints - could be array, JSON string, or plain string
                  let keyPointsArray = null;
                  
                  if (task.keyPoints) {
                    if (Array.isArray(task.keyPoints)) {
                      keyPointsArray = task.keyPoints;
                    } else if (typeof task.keyPoints === 'string') {
                      // Try to parse as JSON first
                      try {
                        const parsed = JSON.parse(task.keyPoints);
                        if (Array.isArray(parsed)) {
                          keyPointsArray = parsed;
                        }
                      } catch (e) {
                        // If not JSON, treat as plain string and split by newlines
                        const lines = task.keyPoints.split(/\n+/).map(line => 
                          line.replace(/^[•\-\*]\s*/, '').trim()
                        ).filter(line => line.length > 0);
                        keyPointsArray = lines.length > 0 ? lines : null;
                      }
                    }
                  }
                  
                  if (keyPointsArray && keyPointsArray.length > 0) {
                    return (
                      <ul className="key-points-list">
                        {keyPointsArray.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    );
                  } else if (task.description) {
                    // Fallback to description if keyPoints doesn't exist
                    const descLines = task.description.split(/\n+/).map(line => 
                      line.replace(/^[•\-\*]\s*/, '').trim()
                    ).filter(line => line.length > 0);
                    if (descLines.length > 0) {
                      return (
                        <ul className="key-points-list">
                          {descLines.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p>{task.description}</p>;
                  } else {
                    return <p>No key points provided</p>;
                  }
                })()}
              </div>
            </div>

            {/* Repeat */}
            {task.repeat && task.repeat !== 'None' && (
              <div className="detail-row">
                <div className="detail-label">
                  <FiRepeat className="detail-icon" />
                  <span>Repeat</span>
                </div>
                <div className="detail-value">{task.repeat}</div>
              </div>
            )}

            {/* Priority */}
            <div className="detail-row">
              <div className="detail-label">
                <FiTag className="detail-icon" />
                <span>Priority</span>
              </div>
              <div className="detail-value">
                <span 
                  className="priority-badge" 
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                >
                  {task.priority ? task.priority.toUpperCase() : 'MEDIUM'}
                </span>
              </div>
            </div>

            {/* Tags */}
            {task.tags && (
              <div className="detail-row">
                <div className="detail-label">
                  <FiTag className="detail-icon" />
                  <span>Tags</span>
                </div>
                <div className="detail-value">{task.tags}</div>
              </div>
            )}

            {/* Resources Link */}
            {task.followUpLink && (
              <div className="detail-row">
                <div className="detail-label">
                  <FiLink className="detail-icon" />
                  <span>Resources Link</span>
                </div>
                <div className="detail-value">
                  <a href={task.followUpLink} target="_blank" rel="noopener noreferrer">
                    {task.followUpLink}
                  </a>
                </div>
              </div>
            )}

            {/* Reminder */}
            {task.reminder && (
              <div className="detail-row">
                <div className="detail-label">
                  <FiBell className="detail-icon" />
                  <span>Reminder</span>
                </div>
                <div className="detail-value">{task.reminder}</div>
              </div>
            )}

            <div className="detail-row">
              <div className="detail-label">
                <FiFileText className="detail-icon" />
                <span>Status</span>
              </div>
              <div className="detail-value">
                <span className={`status-badge-view ${task.status}`}>
                  {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="integration-actions">
            {/* Zoom Meeting Button */}
            {task.taskType === 'Video' && task.platform === 'Zoom' && task.meetingLink && (
              <button 
                className="integration-btn zoom-btn"
                onClick={() => openZoomMeeting(task.meetingLink)}
                title="Join Zoom Meeting"
              >
                <FiVideo /> Join Zoom Meeting
              </button>
            )}

            {/* Google Meet Button */}
            {task.taskType === 'Video' && task.platform === 'Google Meet' && task.meetingLink && (
              <button 
                className="integration-btn meet-btn"
                onClick={() => openGoogleMeet(task.meetingLink)}
                title="Join Google Meet"
              >
                <FiVideo /> Join Google Meet
              </button>
            )}

            {/* Canva Button */}
            {isIntegrationConnected('canva') && (
              <button 
                className="integration-btn canva-btn"
                onClick={() => openCanva(task.name)}
                title="Open in Canva"
              >
                <FiExternalLink /> Design in Canva
              </button>
            )}

            {/* Stripe Payment Button */}
            {isIntegrationConnected('stripe') && (
              <button 
                className="integration-btn stripe-btn"
                onClick={() => requestStripePayment(task)}
                title="Request Payment via Stripe"
              >
                💳 Request Payment (Stripe)
              </button>
            )}

            {/* PayPal Payment Button */}
            {isIntegrationConnected('paypal') && (
              <button 
                className="integration-btn paypal-btn"
                onClick={() => requestPayPalPayment(task)}
                title="Request Payment via PayPal"
              >
                💰 Request Payment (PayPal)
              </button>
            )}
          </div>

          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ViewTaskModal;
