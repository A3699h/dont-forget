import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiX, FiChevronLeft, FiChevronRight, FiZap, FiSave, FiFileText } from 'react-icons/fi';
import { api } from '../utils/api';
import { generateKeyPoints, suggestTaskPriority, isIntegrationConnected, notifyTaskCreated } from '../utils/integrations';
import './AddTask.css';

// Chip Input Component for Invitees
const InviteeChipInput = ({ invitees, onChange, maxInvitees = 10 }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidNameOrEmail = (value) => {
    // Allow names (any non-empty string) or valid emails
    return value.trim().length > 0;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addInvitee();
    } else if (e.key === 'Backspace' && inputValue === '' && invitees.length > 0) {
      // Remove last chip when backspace is pressed on empty input
      removeInvitee(invitees.length - 1);
    }
  };

  const handleBlur = () => {
    // Add invitee when input loses focus if there's a value
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

    // Check if already exists
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

// Simple Yearly Options Component
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

const AddTask = ({ tasks, setTasks, refreshTasks }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    invitees: [],
    taskType: 'Regular',
    platform: 'Zoom',
    meetingLink: '',
    dateTime: '',
    keyPoints: '',
    repeat: 'None',
    repeatDays: [],
    repeatMonths: [],
    yearlyDates: [],
    priority: 'Medium',
    tags: '',
    followUpLink: '',
    redirectUrl: '',
    bookingLimit: '',
    reminder: '15 minutes'
  });

  const generateMeetingLink = (platform) => {
    const token = Math.random().toString(36).slice(2, 10);
    const meetingId = Math.floor(Math.random() * 900000000) + 100000000;
    
    if (platform === 'Zoom') {
      // Generate Zoom-style meeting link
      return `https://zoom.us/j/${meetingId}?pwd=${token}`;
    } else if (platform === 'Google Meet') {
      // Generate Google Meet-style meeting link
      return `https://meet.google.com/${token.slice(0, 3)}-${token.slice(3, 6)}-${token.slice(6, 9)}`;
    }
    
    // Fallback
    return `https://meet.dontforget.app/${token}`;
  };

  const [showKeyPointsPanel, setShowKeyPointsPanel] = useState(false);
  const [showKeyPointsPopup, setShowKeyPointsPopup] = useState(false);
  const [keyPointsList, setKeyPointsList] = useState([]);
  const [currentKeyPoint, setCurrentKeyPoint] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const autoSaveTimeoutRef = useRef(null);
  
  // AI Features state
  const [aiLoading, setAiLoading] = useState(false);
  const isChatGPTConnected = isIntegrationConnected('chatgpt');

  const DRAFT_STORAGE_KEY = 'task_draft';

  // Define draft functions before useEffects
  const saveDraft = () => {
    try {
      const draftData = {
        formData,
        keyPointsList,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      setHasDraft(true);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000); // Hide message after 3 seconds
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  };

  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        // Handle backward compatibility: convert old invitee string to invitees array
        if (draft.formData.invitee && !draft.formData.invitees) {
          draft.formData.invitees = draft.formData.invitee 
            ? draft.formData.invitee.split(',').map(i => i.trim()).filter(i => i)
            : [];
          delete draft.formData.invitee;
        }
        // Ensure invitees is an array
        if (!Array.isArray(draft.formData.invitees)) {
          draft.formData.invitees = [];
        }
        setFormData(draft.formData);
        setKeyPointsList(draft.keyPointsList || []);
        setShowDraftBanner(false);
        setHasDraft(false);
      }
    } catch (err) {
      console.error('Error loading draft:', err);
      alert('Failed to load draft');
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
    setShowDraftBanner(false);
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    saveDraft();
  };

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setHasDraft(true);
        setShowDraftBanner(true);
        // Don't auto-load, let user choose
      } catch (err) {
        console.error('Error loading draft:', err);
      }
    }
  }, []);

  // Auto-save draft when form data changes (debounced)
  useEffect(() => {
    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Only auto-save if there's some content
    const hasContent = formData.title.trim() || formData.invitees.length > 0 || 
                      formData.keyPoints.trim() || keyPointsList.length > 0 ||
                      formData.dateTime || formData.tags.trim();

    if (hasContent) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveDraft();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, keyPointsList]);

  // Warn user before leaving if there's unsaved changes
  useEffect(() => {
    const hasContent = formData.title.trim() || formData.invitees.length > 0 || 
                      formData.keyPoints.trim() || keyPointsList.length > 0 ||
                      formData.dateTime || formData.tags.trim();

    const handleBeforeUnload = (e) => {
      if (hasContent && !draftSaved) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, keyPointsList, draftSaved]);

  // AI Feature: Generate Key Points
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
      const points = await generateKeyPoints(formData.title, '');
      setKeyPointsList(points);
      alert(`AI generated ${points.length} key points!`);
    } catch (error) {
      alert('AI Error: ' + error.message);
      console.error('AI Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Feature: Suggest Priority
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


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      
      // Handle task type change
      if (name === 'taskType') {
        if (value === 'Video') {
          // Generate meeting link when switching to Video type
          next.meetingLink = generateMeetingLink(prev.platform);
        } else {
          // Clear meeting link and platform when switching away from Video
          next.meetingLink = '';
        }
      }
      
      // Handle platform change - regenerate link with new platform
      if (name === 'platform' && prev.taskType === 'Video') {
        next.meetingLink = generateMeetingLink(value);
      }
      
      // Handle date/time change - regenerate link to ensure it's fresh
      if (name === 'dateTime' && prev.taskType === 'Video' && prev.platform) {
        next.meetingLink = generateMeetingLink(prev.platform);
      }
      
      // Handle repeat change - reset repeat options when changing repeat type
      if (name === 'repeat') {
        next.repeatDays = [];
        next.repeatMonths = [];
        next.yearlyDates = [];
      }
      
      return next;
    });
  };
  
  // Handle repeat day selection
  const handleRepeatDayChange = (dayValue, checked) => {
    setFormData(prev => {
      const newDays = checked 
        ? [...prev.repeatDays, dayValue]
        : prev.repeatDays.filter(day => day !== dayValue);
      return { ...prev, repeatDays: newDays };
    });
  };
  
  // Handle repeat month selection
  const handleRepeatMonthChange = (monthValue, checked) => {
    setFormData(prev => {
      const newMonths = checked 
        ? [...prev.repeatMonths, monthValue]
        : prev.repeatMonths.filter(month => month !== monthValue);
      return { ...prev, repeatMonths: newMonths };
    });
  };

  // Handle yearly date selection (toggle behavior for calendar)
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
    if (currentKeyPoint.trim()) {
      setKeyPointsList(prev => [...prev, currentKeyPoint.trim()]);
      setCurrentKeyPoint('');
    }
  };

  const handleKeyPointInputChange = (e) => {
    setCurrentKeyPoint(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyPoint();
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Combine key points list into description for display
      const description = keyPointsList.length > 0 
        ? keyPointsList.map(point => `• ${point}`).join('\n')
        : (formData.keyPoints || 'No description provided');
      
      // Transform UI format to API format
      // Map UI task types to API task types: Video -> Meeting, Follow-up -> Follow-up, others -> Regular
      let taskType = 'Regular';
      if (formData.taskType === 'Video') {
        taskType = 'Meeting';
      } else if (formData.taskType === 'Follow-up') {
        taskType = 'Follow-up';
      }
      
      // Prepare key_points as array (for JSON column)
      const keyPointsArray = keyPointsList.length > 0 
        ? keyPointsList 
        : (formData.keyPoints ? [formData.keyPoints] : null);
      
      const apiData = {
        title: formData.title,
        name: formData.title,
        invitee: formData.invitees.length > 0 ? formData.invitees.join(', ') : '',
        task_type: taskType,
        platform: formData.platform,
        meeting_link: formData.meetingLink,
        date_time: formData.dateTime,
        key_points: keyPointsArray,
        description: description,
        repeat: formData.repeat,
        repeat_days: formData.repeatDays,
        repeat_months: formData.repeatMonths,
        yearly_dates: formData.yearlyDates,
        priority: formData.priority,
        tags: formData.tags,
        follow_up_link: formData.followUpLink,
        redirect_url: formData.redirectUrl,
        booking_limit: formData.bookingLimit ? parseInt(formData.bookingLimit) : null,
        reminder: formData.reminder,
      };

      const response = await api.createTask(apiData);
      
      // Transform API response to UI format
      const newTask = {
        id: response.task.id,
        name: response.task.name || response.task.title,
        title: response.task.title,
        description: response.task.description || response.task.key_points || '',
        dateTime: response.task.date_time || '',
        priority: response.task.priority?.toLowerCase() || 'medium',
        status: 'pending',
        repeat: response.task.repeat || 'None',
        repeatDays: response.task.repeat_days || [],
        repeatMonths: response.task.repeat_months || [],
        yearlyDates: response.task.yearly_dates || [],
        invitees: response.task.invitee ? response.task.invitee.split(',').map(i => i.trim()).filter(i => i) : [],
        taskType: response.task.task_type || 'Regular',
        platform: response.task.platform || 'Zoom',
        meetingLink: response.task.meeting_link || '',
        tags: response.task.tags || '',
        followUpLink: response.task.follow_up_link || '',
        redirectUrl: response.task.redirect_url || '',
        bookingLimit: response.task.booking_limit || '',
        reminder: response.task.reminder || '15 minutes',
        keyPoints: keyPointsList
      };
      
      // Update local state
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      console.log('Task created successfully:', newTask);
      
      // Send to Zapier if connected (async, don't wait)
      notifyTaskCreated(newTask).then(result => {
        if (result.sent) {
          console.log('✅ Zapier notification sent successfully!');
        }
      }).catch(err => {
        console.log('Zapier notification skipped or failed:', err);
      });
      
      // Clear draft after successful submission
      clearDraft();
      
      // Refresh tasks from API
      if (refreshTasks) {
        await refreshTasks();
      }
      
      // Show success message
      alert('Task saved successfully!');
      
      // Clear draft before navigating
      clearDraft();
      
      // Navigate back to dashboard
      navigate('/dashboard');
      
      // Reset form
      setFormData({
        title: '',
        invitees: [],
        taskType: 'Regular',
        platform: 'Zoom',
        meetingLink: '',
        dateTime: '',
        keyPoints: '',
        repeat: 'None',
        repeatDays: [],
        repeatMonths: [],
        yearlyDates: [],
        priority: 'Medium',
        tags: '',
        followUpLink: '',
        redirectUrl: '',
        bookingLimit: '',
        reminder: '15 minutes'
      });
      setKeyPointsList([]);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const taskTypes = ['Regular', 'Video', 'Phone', 'Note'];
  const repeatOptions = ['None', 'Daily', 'Weekly', 'Monthly', 'Yearly'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];
  const reminderOptions = ['5 minutes', '15 minutes', '30 minutes', '1 hour', '2 hours', '1 day'];
  
  // Days of the week for weekly repeat
  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];
  
  // Months for monthly/yearly repeat
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
    <div className="add-task-container">
      <div className="add-task-header">
        <div className="header-left">
          <div className="add-icon"><FiPlus /></div>
          <h1>Don't Forget To Create a Task</h1>
        </div>
      </div>

      {/* Draft Banner */}
      {showDraftBanner && (
        <div className="draft-banner">
          <div className="draft-banner-content">
            <FiFileText size={18} />
            <span>You have a saved draft. Would you like to load it?</span>
            <div className="draft-banner-actions">
              <button 
                type="button" 
                className="draft-btn load-draft"
                onClick={loadDraft}
              >
                Load Draft
              </button>
              <button 
                type="button" 
                className="draft-btn dismiss-draft"
                onClick={() => setShowDraftBanner(false)}
              >
                Dismiss
              </button>
              <button 
                type="button" 
                className="draft-btn clear-draft"
                onClick={clearDraft}
              >
                Clear Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft Saved Indicator */}
      {draftSaved && (
        <div className="draft-saved-indicator">
          <FiSave size={16} />
          <span>Draft saved</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-task-form">
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
                value={currentKeyPoint}
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

        {/* Follow-Up link (optional) */}
        <div className="form-group">
          {/* <label className="form-label">Follow-Up Link</label> */}
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

        {/* Guest Access removed */}

        {/* Redirect URL (optional) */}
        {/* <div className="form-group">
          <label className="form-label">Redirect URL</label>
          <input
            type="url"
            name="redirectUrl"
            value={formData.redirectUrl}
            onChange={handleChange}
            className="form-input"
            placeholder="Optional redirect URL"
          />
        </div> */}

        {/* Booking Limit (optional) */}
        {/* <div className="form-group">
          <label className="form-label">Booking Limit</label>
          <input
            type="number"
            name="bookingLimit"
            value={formData.bookingLimit}
            onChange={handleChange}
            className="form-input"
            placeholder="Maximum number of bookings"
          />
        </div> */}

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

        {/* Save Task button */}
        <div className="form-actions">
          <button type="submit" className="save-btn btn-primary">Save Task</button>
          <button 
            type="button" 
            className="save-draft-btn" 
            onClick={handleSaveDraft}
            title="Save your progress as a draft"
          >
            <FiSave /> Save as Draft
          </button>
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={() => {
              clearDraft();
              navigate('/dashboard');
            }}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Key Points Side Panel */}
      {showKeyPointsPanel && (
        <div className="key-points-side-panel">
          <div className="panel-header">
            <h3>Key Points</h3>
            <button 
              className="close-panel"
              onClick={() => setShowKeyPointsPanel(false)}
            >
              <FiX />
            </button>
          </div>
          <div className="panel-content">
            {keyPointsList.length > 0 ? (
              <ul className="key-points-list">
                {keyPointsList.map((point, index) => (
                  <li key={index}>• {point}</li>
                ))}
              </ul>
            ) : (
              <p className="no-points">No key points added yet</p>
            )}
          </div>
        </div>
      )}

      {/* Key Points Floating Window */}
      {showKeyPointsPopup && (
        <div className="popup-overlay" onClick={() => setShowKeyPointsPopup(false)}>
          <div className="key-points-popup" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-popup-top-right"
              onClick={() => setShowKeyPointsPopup(false)}
            >
              <FiX />
            </button>
            <div className="popup-header">
              <h3>Key Points</h3>
            </div>
            <div className="popup-content">
              {keyPointsList.length > 0 ? (
                <ul className="key-points-list">
                  {keyPointsList.map((point, index) => (
                    <li key={index}>• {point}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-points">No key points added yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTask;
