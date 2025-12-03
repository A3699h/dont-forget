import React, { useState, useMemo } from 'react';
import { FiClipboard, FiCalendar, FiClock, FiAlertTriangle, FiRefreshCw, FiAlertOctagon, FiSearch, FiFileText, FiArchive, FiCheckSquare, FiX } from 'react-icons/fi';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { getUserDisplayName } from '../utils/auth/helpers';
import TaskCard from './TaskCard';
import ViewTaskModal from './ViewTaskModal';
import EditTaskModal from './EditTaskModal';
import ArchivedTasksModal from './ArchivedTasksModal';
import './Dashboard.css';

const Dashboard = ({ tasks, setTasks, onNavigate, refreshTasks, loading }) => {
  const { user } = useAuth();
  const displayName = getUserDisplayName(user);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isArchiveMode, setIsArchiveMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Search + filter logic - exclude archived tasks from main view
  const filteredTasks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const now = new Date();
    const todayDateStr = now.toISOString().slice(0, 10);

    return tasks.filter((task) => {
      // Exclude archived tasks from main dashboard
      if (task.status === 'archived') {
        return false;
      }
      const {
        dateTime,
        status,
        priority,
        followUps = [],
        taskType,
      } = task;

      const isCompleted = status === 'completed';

      // Map filter options to same logic used in stats
      let matchesFilter = true;
      if (filterPriority === 'due-today') {
        matchesFilter = false;
        if (dateTime && !isCompleted) {
          const parsed = new Date(dateTime);
          if (!Number.isNaN(parsed.getTime())) {
            const taskDateStr = parsed.toISOString().slice(0, 10);
            matchesFilter = taskDateStr === todayDateStr;
          }
        }
      } else if (filterPriority === 'follow-up') {
        matchesFilter =
          taskType === 'Follow-up' ||
          (Array.isArray(followUps) && followUps.length > 0);
      } else if (filterPriority === 'late') {
        matchesFilter = false;
        if (dateTime && !isCompleted) {
          const parsed = new Date(dateTime);
          if (!Number.isNaN(parsed.getTime())) {
            matchesFilter = parsed < now;
          }
        }
      } else if (filterPriority === 'upcoming') {
        matchesFilter = false;
        if (dateTime && !isCompleted) {
          const parsed = new Date(dateTime);
          if (!Number.isNaN(parsed.getTime())) {
            matchesFilter = parsed > now;
          }
        }
      } else if (filterPriority === 'low-priority') {
        matchesFilter = priority === 'low';
      } else if (filterPriority === 'medium-priority') {
        matchesFilter = priority === 'medium';
      } else if (filterPriority === 'high-priority') {
        matchesFilter = priority === 'high' || priority === 'urgent';
      } else {
        // 'all' or unknown → no extra filtering
        matchesFilter = true;
      }

      if (!matchesFilter) return false;

      // If no search term, only apply filter
      if (!term) return true;

      const parts = [
        task.name,
        task.title,
        task.description,
        task.invitee,
        task.tags,
        task.taskType,
        task.platform,
        task.keyPoints,
      ];

      if (Array.isArray(followUps)) {
        parts.push(...followUps.map((f) => f.text || ''));
      }

      const haystack = parts.filter(Boolean).join(' ').toLowerCase();

      return haystack.includes(term);
    });
  }, [tasks, searchTerm, filterPriority]);

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.deleteTask(taskId);
        // Update local state
        setTasks(tasks.filter(task => task.id !== taskId));
        // Refresh from API to ensure consistency
        if (refreshTasks) {
          await refreshTasks();
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  const handleSaveEdit = async (updatedTask) => {
    try {
      // Transform UI format to API format
      // Convert key_points to array if it's a string or use keyPointsList
      let keyPointsArray = null;
      if (updatedTask.keyPointsList && Array.isArray(updatedTask.keyPointsList)) {
        keyPointsArray = updatedTask.keyPointsList;
      } else if (updatedTask.keyPoints) {
        if (Array.isArray(updatedTask.keyPoints)) {
          keyPointsArray = updatedTask.keyPoints;
        } else if (typeof updatedTask.keyPoints === 'string') {
          // Split by newlines and clean up bullet points
          keyPointsArray = updatedTask.keyPoints
            .split(/\n+/)
            .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
            .filter(line => line.length > 0);
        }
      }
      
      const apiData = {
        title: updatedTask.title || updatedTask.name,
        name: updatedTask.name || updatedTask.title,
        invitee: updatedTask.invitees && updatedTask.invitees.length > 0 
          ? updatedTask.invitees.join(', ') 
          : (updatedTask.invitee || ''),
        task_type: updatedTask.taskType || 'Regular',
        platform: updatedTask.platform || 'Zoom',
        meeting_link: updatedTask.meetingLink,
        date_time: updatedTask.dateTime,
        key_points: keyPointsArray,
        description: updatedTask.description || (keyPointsArray ? keyPointsArray.join('\n') : ''),
        repeat: updatedTask.repeat || 'None',
        repeat_days: updatedTask.repeatDays || [],
        repeat_months: updatedTask.repeatMonths || [],
        yearly_dates: updatedTask.yearlyDates || [],
        priority: updatedTask.priority?.charAt(0).toUpperCase() + updatedTask.priority?.slice(1) || 'Medium',
        tags: updatedTask.tags,
        follow_up_link: updatedTask.followUpLink,
        redirect_url: updatedTask.redirectUrl,
        booking_limit: updatedTask.bookingLimit,
        reminder: updatedTask.reminder || '15 minutes',
      };

      await api.updateTask(updatedTask.id, apiData);
      
      // Update local state
      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      setIsEditModalOpen(false);
      setSelectedTask(null);
      
      // Refresh from API to ensure consistency
      if (refreshTasks) {
        await refreshTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleToggleArchiveMode = () => {
    setIsArchiveMode(!isArchiveMode);
    setSelectedTaskIds(new Set());
  };

  const handleTaskSelect = (taskId) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.size === filteredTasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(filteredTasks.map(task => task.id)));
    }
  };

  const handleArchiveSelected = async () => {
    if (selectedTaskIds.size === 0) {
      alert('Please select at least one task to archive');
      return;
    }

    if (!window.confirm(`Are you sure you want to archive ${selectedTaskIds.size} task(s)?`)) {
      return;
    }

    setIsArchiving(true);
    try {
      const taskIdsArray = Array.from(selectedTaskIds);
      await api.archiveTasks(taskIdsArray);
      
      // Update local state
      setTasks(tasks.map(task => 
        selectedTaskIds.has(task.id) 
          ? { ...task, status: 'archived' }
          : task
      ));
      
      // Clear selection and exit archive mode
      setSelectedTaskIds(new Set());
      setIsArchiveMode(false);
      
      // Refresh from API
      if (refreshTasks) {
        await refreshTasks();
      }
      
      alert(`Successfully archived ${taskIdsArray.length} task(s)`);
    } catch (error) {
      console.error('Error archiving tasks:', error);
      alert('Failed to archive tasks. Please try again.');
    } finally {
      setIsArchiving(false);
    }
  };
  
  // Compute statistics from real task data coming from the database
  const counts = useMemo(() => {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return {
        total: 0,
        dueToday: 0,
        followUp: 0,
        late: 0,
        highPriority: 0,
        upcoming: 0,
      };
    }

    const now = new Date();
    const todayDateStr = now.toISOString().slice(0, 10);

    let dueToday = 0;
    let followUp = 0;
    let late = 0;
    let highPriority = 0;
    let upcoming = 0;

    tasks.forEach((task) => {
      const {
        dateTime,
        status,
        priority,
        followUps = [],
        taskType,
      } = task;

      const isCompleted = status === 'completed';

      // High priority count from priority coming from DB (High/Urgent)
      if (priority === 'high' || priority === 'urgent') {
        highPriority += 1;
      }

      // Follow-up count based on follow-up tasks or existing follow-up notes
      if (
        taskType === 'Follow-up' ||
        (Array.isArray(followUps) && followUps.length > 0)
      ) {
        followUp += 1;
      }

      // Date-based stats (due today, late, upcoming)
      if (dateTime && !isCompleted) {
        const parsed = new Date(dateTime);
        if (!Number.isNaN(parsed.getTime())) {
          const taskDateStr = parsed.toISOString().slice(0, 10);

          if (taskDateStr === todayDateStr) {
            dueToday += 1;
          } else if (parsed < now) {
            // Past date → late
            late += 1;
          } else if (parsed > now) {
            // Future date → upcoming
            upcoming += 1;
          }
        }
      }
    });

    return {
      total: tasks.length,
      dueToday,
      followUp,
      late,
      highPriority,
      upcoming,
    };
  }, [tasks]);

  return (
    <div className="dashboard">
      <div className="dashboard-header bg-brand">
        <div className="header-content">
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome, {displayName}</h1>
            <p className="welcome-date">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-header">
          <div className="section-title">
            <span className="title-icon"><FiClipboard /></span>
            <h2>Review Your Dashboard</h2>
          </div>
          <div className="header-actions">
            <button 
              className="archive-view-btn"
              onClick={() => setIsArchivedModalOpen(true)}
              title="View archived tasks"
            >
              <FiArchive /> Review Archived Tasks
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card due-today">
            <div className="stat-icon"><FiCalendar /></div>
            <div className="stat-content">
              <div className="stat-number">{counts.dueToday}</div>
              <div className="stat-label">Due Today</div>
            </div>
          </div>
          <div className="stat-card follow-up">
            <div className="stat-icon"><FiClock /></div>
            <div className="stat-content">
              <div className="stat-number">{counts.followUp}</div>
              <div className="stat-label">Follow Up</div>
            </div>
          </div>
          <div className="stat-card late">
            <div className="stat-icon"><FiAlertTriangle /></div>
            <div className="stat-content">
              <div className="stat-number">{counts.late}</div>
              <div className="stat-label">Late</div>
            </div>
          </div>
          <div className="stat-card upcoming">
            <div className="stat-icon"><FiRefreshCw /></div>
            <div className="stat-content">
              <div className="stat-number">{counts.upcoming}</div>
              <div className="stat-label">Upcoming</div>
            </div>
          </div>
          <div className="stat-card high-priority">
            <div className="stat-icon"><FiAlertOctagon /></div>
            <div className="stat-content">
              <div className="stat-number">{counts.highPriority}</div>
              <div className="stat-label">High Priority</div>
            </div>
          </div>
        </div>


        <div className="tasks-section">
          <div className="tasks-header">
            <h3>Tasks List</h3>
            <div className="tasks-controls">
              {!isArchiveMode ? (
                <button 
                  className="archive-mode-btn"
                  onClick={handleToggleArchiveMode}
                  title="Archive tasks"
                >
                  <FiArchive /> Archive Tasks
                </button>
              ) : (
                <div className="archive-mode-controls">
                  <button 
                    className="select-all-btn"
                    onClick={handleSelectAll}
                  >
                    <FiCheckSquare /> {selectedTaskIds.size === filteredTasks.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button 
                    className="archive-selected-btn"
                    onClick={handleArchiveSelected}
                    disabled={selectedTaskIds.size === 0 || isArchiving}
                  >
                    <FiArchive /> {isArchiving ? 'Archiving...' : `Archive Selected (${selectedTaskIds.size})`}
                  </button>
                  <button 
                    className="cancel-archive-btn"
                    onClick={handleToggleArchiveMode}
                  >
                    <FiX /> Cancel
                  </button>
                </div>
              )}
              <div className="search-box">
                <span className="search-icon"><FiSearch /></span>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Tasks</option>
                <option value="due-today">Due Today</option>
                {/* <option value="follow-up">Follow Up</option> */}

                <option value="late">Late</option>
                <option value="upcoming">Upcoming</option>
                <option value="low-priority">Low Priority</option>
                <option value="medium-priority">Medium Priority</option>
                <option value="high-priority">High Priority</option>
              </select>
              <button className="primary-btn" onClick={() => onNavigate && onNavigate('follow-up')}>
                Follow-ups
              </button>
            </div>
          </div>

          {loading ? (
            <div className="no-tasks">
              <div className="no-tasks-icon"><FiRefreshCw /></div>
              <h3>Loading tasks...</h3>
            </div>
          ) : (
            <>
              <div className="tasks-grid">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onView={handleViewTask}
                    isArchiveMode={isArchiveMode}
                    isSelected={selectedTaskIds.has(task.id)}
                    onSelect={() => handleTaskSelect(task.id)}
                  />
                ))}
              </div>

              {filteredTasks.length === 0 && (
                <div className="no-tasks">
                  <div className="no-tasks-icon"><FiFileText /></div>
                  <h3>No tasks found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {isViewModalOpen && selectedTask && (
        <ViewTaskModal
          task={selectedTask}
          onClose={handleCloseModals}
        />
      )}

      {isEditModalOpen && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={handleCloseModals}
          onSave={handleSaveEdit}
        />
      )}

      {isArchivedModalOpen && (
        <ArchivedTasksModal
          onClose={() => setIsArchivedModalOpen(false)}
          refreshTasks={refreshTasks}
        />
      )}
    </div>
  );
};

export default Dashboard;
