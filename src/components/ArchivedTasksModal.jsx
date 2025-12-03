import React, { useState, useEffect } from 'react';
import { FiX, FiArchive, FiRefreshCw, FiFileText, FiTrash2 } from 'react-icons/fi';
import { api } from '../utils/api';
import TaskCard from './TaskCard';
import ViewTaskModal from './ViewTaskModal';
import './ArchivedTasksModal.css';

const ArchivedTasksModal = ({ onClose, refreshTasks }) => {
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArchivedTasks();
  }, []);

  const fetchArchivedTasks = async () => {
    try {
      setLoading(true);
      const response = await api.getArchivedTasks();
      setArchivedTasks(response.tasks || response || []);
    } catch (error) {
      console.error('Error fetching archived tasks:', error);
      alert('Failed to load archived tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (taskId) => {
    if (!window.confirm('Are you sure you want to unarchive this task?')) {
      return;
    }

    try {
      const response = await api.unarchiveTask(taskId);
      // Remove the task from archived list
      setArchivedTasks(archivedTasks.filter(task => task.id !== taskId));
      // Refresh main tasks list to show the unarchived task
      if (refreshTasks) {
        await refreshTasks();
      }
      alert('Task unarchived successfully');
    } catch (error) {
      console.error('Error unarchiving task:', error);
      const errorMessage = error.message || 'Failed to unarchive task';
      alert(errorMessage);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to permanently delete this archived task?')) {
      return;
    }

    try {
      await api.deleteTask(taskId);
      setArchivedTasks(archivedTasks.filter(task => task.id !== taskId));
      alert('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const handleView = (task) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  const filteredTasks = archivedTasks.filter(task => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (task.name || '').toLowerCase().includes(term) ||
      (task.title || '').toLowerCase().includes(term) ||
      (task.description || '').toLowerCase().includes(term) ||
      (task.invitee || '').toLowerCase().includes(term) ||
      (task.tags || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="archived-tasks-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title">
            <FiArchive size={24} />
            <h2>Archived Tasks</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="archived-tasks-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search archived tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button 
              className="refresh-btn"
              onClick={fetchArchivedTasks}
              title="Refresh"
            >
              <FiRefreshCw />
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <FiRefreshCw className="spinning" />
              <p>Loading archived tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <FiFileText size={48} />
              <h3>No archived tasks</h3>
              <p>{searchTerm ? 'No tasks match your search' : 'You haven\'t archived any tasks yet'}</p>
            </div>
          ) : (
            <div className="archived-tasks-grid">
              {filteredTasks.map(task => (
                <div key={task.id} className="archived-task-item">
                  <TaskCard
                    task={task}
                    onView={handleView}
                    onEdit={() => {}}
                    onDelete={() => handleDelete(task.id)}
                  />
                  <div className="archived-task-actions">
                    <button
                      className="unarchive-btn"
                      onClick={() => handleUnarchive(task.id)}
                      title="Unarchive task"
                    >
                      <FiArchive /> Unarchive
                    </button>
                    <button
                      className="delete-permanent-btn"
                      onClick={() => handleDelete(task.id)}
                      title="Permanently delete"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isViewModalOpen && selectedTask && (
        <ViewTaskModal
          task={selectedTask}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

export default ArchivedTasksModal;

