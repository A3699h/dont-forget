import React, { useMemo, useState, useEffect } from 'react';
import { FiRefreshCw, FiSave, FiFileText } from 'react-icons/fi';
import { api } from '../utils/api';
import './FollowUp.css';

const FollowUp = ({ tasks, refreshTasks }) => {
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [taskQuery, setTaskQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    dateTime: '',
    taskType: 'Regular',
    priority: 'Medium',
    followUpLink: '',
    repeat: 'None',
    reminder: '15 minutes',
  });

  const [keyPointsList, setKeyPointsList] = useState([]);
  const [currentKeyPoint, setCurrentKeyPoint] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);

  const tasksByRelevance = useMemo(() => {
    const term = taskQuery.trim().toLowerCase();
    return [...tasks]
      .filter(t => selectedType === 'all' || (t.priority || '').toLowerCase() === selectedType.toLowerCase())
      .filter(t =>
        !term ||
        (t.name || '').toLowerCase().includes(term) ||
        (t.title || '').toLowerCase().includes(term) ||
        (t.description || '').toLowerCase().includes(term)
      )
      .sort((a, b) => {
        const aDate = a.dateTime || '';
        const bDate = b.dateTime || '';
        return aDate.localeCompare(bDate);
      });
  }, [tasks, selectedType, taskQuery]);

  const selectedTask = useMemo(() => {
    return tasks.find(t => String(t.id) === String(selectedTaskId));
  }, [tasks, selectedTaskId]);

  const DRAFT_STORAGE_KEY = selectedTask ? `followup_draft_${selectedTask.id}` : null;

  // Load draft when selected task changes
  useEffect(() => {
    if (!selectedTask || !DRAFT_STORAGE_KEY) return;
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        setFormData(draft.formData);
        setKeyPointsList(draft.keyPointsList || []);
      } else {
        // Reset form for new selection
        setFormData({
          dateTime: '',
          taskType: 'Regular',
          priority: selectedTask.priority
            ? selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)
            : 'Medium',
          followUpLink: selectedTask.followUpLink || '',
          repeat: 'None',
          reminder: '15 minutes',
        });
        setKeyPointsList([]);
        setCurrentKeyPoint('');
      }
    } catch (err) {
      console.error('Error loading follow-up draft:', err);
    }
  }, [selectedTaskId, selectedTask, DRAFT_STORAGE_KEY]);

  const saveDraft = () => {
    if (!selectedTask || !DRAFT_STORAGE_KEY) return;
    try {
      const draftData = {
        formData,
        keyPointsList,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (err) {
      console.error('Error saving follow-up draft:', err);
    }
  };

  const clearDraft = () => {
    if (!DRAFT_STORAGE_KEY) return;
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftSaved(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const getOriginalKeyPoints = (task) => {
    if (!task) return [];
    let keyPointsArray = null;

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
          const lines = task.keyPoints
            .split(/\n+/)
            .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
            .filter(line => line.length > 0);
          keyPointsArray = lines.length > 0 ? lines : null;
        }
      }
    }

    if (!keyPointsArray && task.description) {
      const lines = task.description
        .split(/\n+/)
        .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
        .filter(line => line.length > 0);
      keyPointsArray = lines.length > 0 ? lines : null;
    }

    return keyPointsArray || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) {
      alert('Please select a task to follow up on.');
      return;
    }

    if (!formData.dateTime) {
      alert('Please choose a new date & time for the follow-up.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const description = keyPointsList.length > 0
        ? keyPointsList.map(point => `• ${point}`).join('\n')
        : 'Follow-up created without specific key points.';

      let taskType = 'Regular';
      if (formData.taskType === 'Video') {
        taskType = 'Meeting';
      } else if (formData.taskType === 'Follow-up') {
        taskType = 'Follow-up';
      }

      const apiData = {
        title: `Follow-up: ${selectedTask.name || selectedTask.title}`,
        name: `Follow-up: ${selectedTask.name || selectedTask.title}`,
        invitee: selectedTask.invitee || '',
        task_type: taskType,
        platform: formData.taskType === 'Video' ? (selectedTask.platform || 'Zoom') : (selectedTask.platform || 'Zoom'),
        meeting_link: selectedTask.meetingLink || '',
        date_time: formData.dateTime,
        key_points: keyPointsList.length > 0 ? keyPointsList : null,
        description,
        repeat: formData.repeat,
        repeat_days: [],
        repeat_months: [],
        yearly_dates: [],
        priority: formData.priority,
        tags: selectedTask.tags || '',
        follow_up_link: formData.followUpLink,
        redirect_url: null,
        booking_limit: null,
        reminder: formData.reminder,
      };

      await api.createTask(apiData);

      clearDraft();

      if (refreshTasks) {
        await refreshTasks();
      }

      alert('Follow-up task created successfully!');
    } catch (err) {
      console.error('Error creating follow-up task:', err);
      setError(err.message || 'Failed to create follow-up task');
    } finally {
      setLoading(false);
    }
  };

  const taskTypesOptions = ['Regular', 'Video', 'Phone', 'Note'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];
  const repeatOptions = ['None', 'Daily', 'Weekly', 'Monthly', 'Yearly'];
  const reminderOptions = ['5 minutes', '15 minutes', '30 minutes', '1 hour', '2 hours', '1 day'];

  const originalKeyPoints = selectedTask ? getOriginalKeyPoints(selectedTask) : [];

  return (
    <div className="followup-page">
      <div className="content-header">
        <div className="section-title">
          <span className="title-icon"><FiRefreshCw /></span>
          <h2>Follow-Up</h2>
        </div>
        {error && (
          <div className="error-message" style={{ color: 'red', marginTop: '10px', padding: '10px', background: '#fee', borderRadius: '4px' }}>
            {error}
          </div>
        )}
      </div>

      <div className="followup-picker">
        <label className="picker-label">Which task do you want to follow up on?</label>
        <div className="picker-row">
          <div className="picker-field">
            <label className="field-label">Priority Filter</label>
            <select
              className="filter-select"
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setSelectedTaskId(''); }}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="picker-field">
            <label className="field-label">Search</label>
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks by title, description, or tags..."
              value={taskQuery}
              onChange={(e) => setTaskQuery(e.target.value)}
            />
          </div>
          <div className="picker-field">
            <label className="field-label">Task</label>
            <select
              id="taskSelect"
              className="filter-select"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
            >
              <option value="">Select a task...</option>
              {tasksByRelevance.map(task => (
                <option key={task.id} value={task.id}>
                  {task.name} {task.dateTime ? `— ${new Date(task.dateTime).toLocaleString()}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedTask && (
        <div className="followup-content">
          <div className="task-summary">
            <div className="task-card-header">
              <div className="task-title-row">
                <h3 className="task-title">Original Task</h3>
              </div>
            </div>
            <div className="original-details">
              <div className="original-field">
                <label>Original Title</label>
                <div className="original-value">
                  {selectedTask.name || selectedTask.title}
                </div>
              </div>

              <div className="original-field">
                <label>Original Date</label>
                <div className="original-value">
                  {selectedTask.dateTime ? new Date(selectedTask.dateTime).toLocaleString() : 'Not set'}
                </div>
              </div>

              <div className="original-field">
                <label>Original Priority</label>
                <div className="original-value">
                  {(selectedTask.priority || 'medium').toUpperCase()}
                </div>
              </div>

              <div className="original-field">
                <label>Original Key Points</label>
                <div className="original-value">
                  {originalKeyPoints.length > 0 ? (
                    <ul className="key-points-list">
                      {originalKeyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No key points recorded for this task.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="followup-panel">
            <h4 className="panel-title">Create Follow-Up Task</h4>
            {draftSaved && (
              <div className="draft-saved-indicator">
                <FiSave size={16} />
                <span>Draft saved</span>
              </div>
            )}
            <form className="followup-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">New Date &amp; Time</label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleFormChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Task Type</label>
                <select
                  name="taskType"
                  value={formData.taskType}
                  onChange={handleFormChange}
                  className="form-select"
                >
                  {taskTypesOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleFormChange}
                  className="form-select"
                >
                  {priorityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Resources Link</label>
                <input
                  type="url"
                  name="followUpLink"
                  value={formData.followUpLink}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="Optional resources or follow-up link"
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Key Points</label>
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
                  {keyPointsList.length > 0 && (
                    <ul className="key-points-list">
                      {keyPointsList.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Repeat</label>
                <select
                  name="repeat"
                  value={formData.repeat}
                  onChange={handleFormChange}
                  className="form-select"
                >
                  {repeatOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reminder</label>
                <select
                  name="reminder"
                  value={formData.reminder}
                  onChange={handleFormChange}
                  className="form-select"
                >
                  {reminderOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="save-draft-btn"
                  onClick={saveDraft}
                  disabled={!selectedTask}
                  title={selectedTask ? 'Save this follow-up as a draft' : 'Select a task first'}
                >
                  <FiSave /> Save as Draft
                </button>
                <button
                  type="submit"
                  className="save-btn btn-primary"
                  disabled={loading || !selectedTask}
                >
                  {loading ? 'Saving...' : 'Save Follow-Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUp;
