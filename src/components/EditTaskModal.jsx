import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSave, FiZap } from 'react-icons/fi';
import { isIntegrationConnected } from '../utils/integrations';
import './EditTaskModal.css';
import './AddTask.css';

// Chip Input Component for Invitees (copied from AddTask)
const InviteeChipInput = ({ invitees, onChange, maxInvitees = 10 }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidNameOrEmail = (value) => {
    return value.trim().length > 0;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addInvitee();
    } else if (e.key === 'Backspace' && inputValue === '' && invitees.length > 0) {
      removeInvitee(invitees.length - 1);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addInvitee();
    }
  };

  const addInvitee = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    if (invitees.length >= maxInvitees) {
      alert(`Maximum ${maxInvitees} invitees allowed`);
      return;
    }

    if (invitees.includes(trimmedValue)) {
      alert('This invitee is already added');
      setInputValue('');
      return;
    }

    if (isValidNameOrEmail(trimmedValue)) {
      onChange([...invitees, trimmedValue]);
      setInputValue('');
    } else {
      alert('Please enter a valid name or email address');
    }
  };

  const removeInvitee = (index) => {
    const newInvitees = invitees.filter((_, i) => i !== index);
    onChange(newInvitees);
  };

  return (
    <div className="invitee-chip-input">
      <div className="chip-container">
        {invitees.map((invitee, index) => (
          <span key={index} className="invitee-chip">
            {invitee}
            <button
              type="button"
              className="chip-remove"
              onClick={() => removeInvitee(index)}
              aria-label={`Remove ${invitee}`}
            >
              <FiX size={14} />
            </button>
          </span>
        ))}
        {invitees.length < maxInvitees && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="chip-input"
            placeholder={invitees.length === 0 ? "Enter name or email (press Enter or comma)" : ""}
          />
        )}
      </div>
      {invitees.length > 0 && (
        <div className="invitee-count">
          {invitees.length} / {maxInvitees} invitees
        </div>
      )}
    </div>
  );
};

// Simple Yearly Options Component (copied from AddTask)
const YearlyOptions = ({ selectedDates, onDateSelect }) => {
  const [newDate, setNewDate] = useState('');
  
  const handleAddDate = () => {
    if (newDate && !selectedDates.includes(newDate)) {
      onDateSelect(newDate);
      setNewDate('');
    }
  };
  
  const handleRemoveDate = (dateToRemove) => {
    onDateSelect(dateToRemove);
  };
  
  return (
    <div className="yearly-options">
      <div className="form-group">
        <label className="form-label">Select Specific Dates</label>
        <div className="date-input-section">
          <div className="button-row">
            <button
              type="button"
              onClick={handleAddDate}
              className="add-date-btn"
              disabled={!newDate}
            >
              Add Date
            </button>
          </div>
          
          <div className="date-input-row">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="form-input"
              placeholder="Select a date"
            />
          </div>
          
          {selectedDates.length > 0 && (
            <div className="selected-dates">
              <h4>Selected Dates:</h4>
              <div className="date-tags">
                {selectedDates.map((date, index) => (
                  <span key={index} className="date-tag">
                    {new Date(date).toLocaleDateString()}
                    <button
                      type="button"
                      onClick={() => handleRemoveDate(date)}
                      className="remove-date-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EditTaskModal = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    invitees: [],
    taskType: 'Regular',
    platform: 'Zoom',
    meetingLink: '',
    dateTime: '',
    keyPointsList: [],
    currentKeyPoint: '',
    repeat: 'None',
    repeatDays: [],
    repeatMonths: [],
    yearlyDates: [],
    priority: 'Medium',
    tags: '',
    followUpLink: '',
    reminder: '15 minutes',
    status: 'pending'
  });

  const [showKeyPointsPanel, setShowKeyPointsPanel] = useState(false);
  const [showKeyPointsPopup, setShowKeyPointsPopup] = useState(false);
  const isChatGPTConnected = isIntegrationConnected('chatgpt');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (task) {
      // Parse invitees from string or array
      let inviteesArray = [];
      if (task.invitee) {
        if (Array.isArray(task.invitee)) {
          inviteesArray = task.invitee;
        } else if (typeof task.invitee === 'string') {
          inviteesArray = task.invitee.split(',').map(i => i.trim()).filter(i => i);
        }
      }

      // Parse key points
      let keyPointsArray = [];
      if (task.keyPoints) {
        if (Array.isArray(task.keyPoints)) {
          keyPointsArray = task.keyPoints;
        } else if (typeof task.keyPoints === 'string') {
          try {
            const parsed = JSON.parse(task.keyPoints);
            if (Array.isArray(parsed)) {
              keyPointsArray = parsed;
            }
          } catch (e) {
            // Split by newlines and clean up bullet points
            keyPointsArray = task.keyPoints
              .split(/\n+/)
              .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
              .filter(line => line.length > 0);
          }
        }
      } else if (task.description) {
        // Fallback to description if keyPoints doesn't exist
        keyPointsArray = task.description
          .split(/\n+/)
          .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
          .filter(line => line.length > 0);
      }

      setFormData({
        title: task.name || task.title || '',
        invitees: inviteesArray,
        taskType: task.taskType || 'Regular',
        platform: task.platform || 'Zoom',
        meetingLink: task.meetingLink || '',
        dateTime: task.dateTime || '',
        keyPointsList: keyPointsArray,
        currentKeyPoint: '',
        repeat: task.repeat || 'None',
        repeatDays: task.repeatDays || [],
        repeatMonths: task.repeatMonths || [],
        yearlyDates: task.yearlyDates || [],
        priority: task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium',
        tags: task.tags || '',
        followUpLink: task.followUpLink || '',
        reminder: task.reminder || '15 minutes',
        status: task.status || 'pending'
      });
    }
  }, [task]);

  const generateMeetingLink = (platform) => {
    const token = Math.random().toString(36).slice(2, 10);
    const meetingId = Math.floor(Math.random() * 900000000) + 100000000;
    
    if (platform === 'Zoom') {
      return `https://zoom.us/j/${meetingId}?pwd=${token}`;
    } else if (platform === 'Google Meet') {
      return `https://meet.google.com/${token.slice(0, 3)}-${token.slice(3, 6)}-${token.slice(6, 9)}`;
    }
    
    return `https://meet.dontforget.app/${token}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      
      if (name === 'taskType') {
        if (value === 'Video') {
          next.meetingLink = generateMeetingLink(prev.platform);
        } else {
          next.meetingLink = '';
        }
      }
      
      if (name === 'platform' && prev.taskType === 'Video') {
        next.meetingLink = generateMeetingLink(value);
      }
      
      if (name === 'dateTime' && prev.taskType === 'Video' && prev.platform) {
        next.meetingLink = generateMeetingLink(prev.platform);
      }
      
      if (name === 'repeat') {
        next.repeatDays = [];
        next.repeatMonths = [];
        next.yearlyDates = [];
      }
      
      return next;
    });
  };

  const handleRepeatDayChange = (dayValue, checked) => {
    setFormData(prev => {
      const newDays = checked 
        ? [...prev.repeatDays, dayValue]
        : prev.repeatDays.filter(day => day !== dayValue);
      return { ...prev, repeatDays: newDays };
    });
  };

  const handleRepeatMonthChange = (monthValue, checked) => {
    setFormData(prev => {
      const newMonths = checked 
        ? [...prev.repeatMonths, monthValue]
        : prev.repeatMonths.filter(month => month !== monthValue);
      return { ...prev, repeatMonths: newMonths };
    });
  };

  const handleYearlyDateChange = (dateValue) => {
    setFormData(prev => {
      const isSelected = prev.yearlyDates.includes(dateValue);
      const newDates = isSelected 
        ? prev.yearlyDates.filter(date => date !== dateValue)
        : [...prev.yearlyDates, dateValue];
      return { ...prev, yearlyDates: newDates };
    });
  };

  const handleAddKeyPoint = () => {
    if (formData.currentKeyPoint.trim()) {
      setFormData(prev => ({
        ...prev,
        keyPointsList: [...prev.keyPointsList, prev.currentKeyPoint.trim()],
        currentKeyPoint: ''
      }));
    }
  };

  const handleKeyPointInputChange = (e) => {
    setFormData(prev => ({ ...prev, currentKeyPoint: e.target.value }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyPoint();
    }
  };

  const handleRemoveKeyPoint = (index) => {
    setFormData(prev => ({
      ...prev,
      keyPointsList: prev.keyPointsList.filter((_, i) => i !== index)
    }));
  };

  const handleAIGenerateKeyPoints = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a task title first!');
      return;
    }

    if (!isChatGPTConnected) {
      alert('ChatGPT is not connected. Go to Settings → Integrations to connect.');
      return;
    }

    setAiLoading(true);
    try {
      const { generateKeyPoints } = await import('../utils/integrations');
      const points = await generateKeyPoints(formData.title, '');
      setFormData(prev => ({ ...prev, keyPointsList: points }));
      alert(`AI generated ${points.length} key points!`);
    } catch (error) {
      alert('AI Error: ' + error.message);
      console.error('AI Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISuggestPriority = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a task title first!');
      return;
    }

    if (!isChatGPTConnected) {
      alert('ChatGPT is not connected. Go to Settings → Integrations to connect.');
      return;
    }

    setAiLoading(true);
    try {
      const { suggestTaskPriority } = await import('../utils/integrations');
      const result = await suggestTaskPriority(formData.title, '', formData.dateTime);
      setFormData(prev => ({ ...prev, priority: result.priority }));
      alert(`AI Recommendation: ${result.priority}\n\n${result.reasoning}`);
    } catch (error) {
      alert('AI Error: ' + error.message);
      console.error('AI Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedTask = {
      ...task,
      name: formData.title,
      title: formData.title,
      invitees: formData.invitees,
      invitee: formData.invitees.length > 0 ? formData.invitees.join(', ') : '',
      taskType: formData.taskType,
      platform: formData.platform,
      meetingLink: formData.meetingLink,
      dateTime: formData.dateTime,
      keyPoints: formData.keyPointsList,
      keyPointsList: formData.keyPointsList,
      description: formData.keyPointsList.length > 0 
        ? formData.keyPointsList.map(point => `• ${point}`).join('\n')
        : 'No description provided',
      priority: formData.priority.toLowerCase(),
      status: formData.status,
      repeat: formData.repeat,
      repeatDays: formData.repeatDays,
      repeatMonths: formData.repeatMonths,
      yearlyDates: formData.yearlyDates,
      tags: formData.tags,
      followUpLink: formData.followUpLink,
      reminder: formData.reminder
    };
    
    onSave(updatedTask);
  };

  if (!task) return null;

  const taskTypes = ['Regular', 'Video', 'Phone', 'Note'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];
  const statusOptions = ['pending', 'in-progress', 'completed', 'overdue'];
  const repeatOptions = ['None', 'Daily', 'Weekly', 'Monthly', 'Yearly'];
  const reminderOptions = ['5 minutes', '15 minutes', '30 minutes', '1 hour', '2 hours', '1 day'];
  
  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];
  
  const months = [
    { value: 'january', label: 'January' },
    { value: 'february', label: 'February' },
    { value: 'march', label: 'March' },
    { value: 'april', label: 'April' },
    { value: 'may', label: 'May' },
    { value: 'june', label: 'June' },
    { value: 'july', label: 'July' },
    { value: 'august', label: 'August' },
    { value: 'september', label: 'September' },
    { value: 'october', label: 'October' },
    { value: 'november', label: 'November' },
    { value: 'december', label: 'December' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Task</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content add-task-form">
          {/* Title (required) */}
          <div className="form-group full">
            <label className="form-label required">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="Task Title"
              required
            />
          </div>

          {/* Invitees (optional) */}
          <div className="form-group">
            <label className="form-label">Invitees (max 10)</label>
            <InviteeChipInput
              invitees={formData.invitees}
              onChange={(newInvitees) => setFormData(prev => ({ ...prev, invitees: newInvitees }))}
              maxInvitees={10}
            />
          </div>

          {/* Task Type */}
          <div className="form-group">
            <label className="form-label">Task Type</label>
            <select
              name="taskType"
              value={formData.taskType}
              onChange={handleChange}
              className="form-select"
            >
              {taskTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Video Platform Selection - only show when Video is selected */}
          {formData.taskType === 'Video' && (
            <div className="form-group">
              <label className="form-label">Video Platform</label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Zoom">Zoom</option>
                <option value="Google Meet">Google Meet</option>
              </select>
            </div>
          )}

          {/* Auto-generated meeting link for Video */}
          {formData.taskType === 'Video' && (
            <div className="form-group">
              <label className="form-label">Meeting Link (auto-generated)</label>
              <input
                type="text"
                name="meetingLink"
                value={formData.meetingLink || ''}
                readOnly
                className="form-input"
                placeholder="Select platform and date/time to generate link..."
              />
            </div>
          )}

          {/* Date/Time picker */}
          <div className="form-group">
            <label className="form-label">Date & Time</label>
            <input
              type="datetime-local"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          {/* Key Points (bullets) */}
          <div className="form-group">
            <label className="form-label">
              Key Points
              {isChatGPTConnected && (
                <button
                  type="button"
                  className="ai-btn-inline"
                  onClick={handleAIGenerateKeyPoints}
                  disabled={aiLoading || !formData.title.trim()}
                  title="Use AI to generate key points"
                >
                  <FiZap /> {aiLoading ? 'AI Thinking...' : 'AI Generate Key Points'}
                </button>
              )}
            </label>
            <div className="key-points-container">
              <div className="key-points-input-container">
                <input
                  type="text"
                  value={formData.currentKeyPoint}
                  onChange={handleKeyPointInputChange}
                  onKeyPress={handleKeyPress}
                  className="form-input"
                  placeholder="Enter a key point"
                />
                <button
                  type="button"
                  className="add-key-point-btn"
                  onClick={handleAddKeyPoint}
                >
                  Add Key Point
                </button>
              </div>
              {formData.keyPointsList.length > 0 && (
                <ul className="key-points-list">
                  {formData.keyPointsList.map((point, index) => (
                    <li key={index}>
                      • {point}
                      <button
                        type="button"
                        className="remove-key-point-btn"
                        onClick={() => handleRemoveKeyPoint(index)}
                      >
                        <FiX size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="key-points-actions">
                <button
                  type="button"
                  className="key-points-btn"
                  onClick={() => setShowKeyPointsPanel(!showKeyPointsPanel)}
                >
                  Show Key Points
                </button>
                <button
                  type="button"
                  className="key-points-btn popup"
                  onClick={() => setShowKeyPointsPopup(!showKeyPointsPopup)}
                >
                  Pop Out Key Points
                </button>
              </div>
            </div>
          </div>

          {/* Repeat */}
          <div className="form-group">
            <label className="form-label">Repeat</label>
            <select
              name="repeat"
              value={formData.repeat}
              onChange={handleChange}
              className="form-select"
            >
              {repeatOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Weekly Repeat Options */}
          {formData.repeat === 'Weekly' && (
            <div className="form-group">
              <label className="form-label">Select Days</label>
              <div className="repeat-options-grid">
                {daysOfWeek.map(day => (
                  <label key={day.value} className="repeat-option">
                    <input
                      type="checkbox"
                      checked={formData.repeatDays.includes(day.value)}
                      onChange={(e) => handleRepeatDayChange(day.value, e.target.checked)}
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Repeat Options */}
          {formData.repeat === 'Monthly' && (
            <div className="form-group">
              <label className="form-label">Select Months</label>
              <div className="repeat-options-grid">
                {months.map(month => (
                  <label key={month.value} className="repeat-option">
                    <input
                      type="checkbox"
                      checked={formData.repeatMonths.includes(month.value)}
                      onChange={(e) => handleRepeatMonthChange(month.value, e.target.checked)}
                    />
                    <span>{month.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Yearly Repeat Options */}
          {formData.repeat === 'Yearly' && (
            <div className="yearly-options-container">
              <YearlyOptions 
                selectedDates={formData.yearlyDates}
                onDateSelect={handleYearlyDateChange}
              />
            </div>
          )}

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">
              Priority
              {isChatGPTConnected && (
                <button
                  type="button"
                  className="ai-btn-inline"
                  onClick={handleAISuggestPriority}
                  disabled={aiLoading || !formData.title.trim()}
                  title="Use AI to suggest priority level"
                >
                  <FiZap /> {aiLoading ? 'AI Thinking...' : 'AI Suggest Priority'}
                </button>
              )}
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-select"
            >
              {priorityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter tags separated by commas"
            />
          </div>

          {/* Resources Link */}
          <div className="form-group">
            <label className="form-label">Resources Link</label>
            <input
              type="url"
              name="followUpLink"
              value={formData.followUpLink}
              onChange={handleChange}
              className="form-input"
              placeholder="Optional follow-up link"
            />
          </div>

          {/* Reminder */}
          <div className="form-group">
            <label className="form-label">Reminder</label>
            <select
              name="reminder"
              value={formData.reminder}
              onChange={handleChange}
              className="form-select"
            >
              {reminderOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <FiSave /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
