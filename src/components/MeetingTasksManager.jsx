import React, { useState } from 'react';
import { FiClipboard, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import './AddTask.css';

const MeetingTasksManager = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    if (editingId) {
      setTasks(prev => prev.map(t => t.id === editingId ? { ...t, title: title.trim(), description: description.trim() } : t));
      setEditingId(null);
    } else {
      setTasks(prev => [{ id: Date.now().toString(), title: title.trim(), description: description.trim() }, ...prev]);
    }
    setTitle('');
    setDescription('');
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
  };

  const handleDelete = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="add-task-container">
      <div className="add-task-header">
        <div className="header-left">
          <div className="add-icon"><FiClipboard /></div>
          <h1>Meetings Notes</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="add-task-form">
        <div className="form-group">
          <label className="form-label required">Title</label>
          <input
            type="text"
            className="form-input"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Description</label>
          <textarea
            className="form-textarea"
            rows="4"
            placeholder="Short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn">{editingId ? 'Update' : 'Add'} Meeting Task</button>
          {editingId && (
            <button type="button" className="cancel-btn" onClick={() => { setEditingId(null); setTitle(''); setDescription(''); }}>Cancel</button>
          )}
        </div>
      </form>

      <div className="perks-grid" style={{ marginTop: 24 }}>
        {tasks.length === 0 && (
          <div style={{ color: '#6b7280' }}>No meeting tasks added yet.</div>
        )}
        {tasks.map(task => (
          <div key={task.id} className="perk-card" style={{ textAlign: 'left', border: '1px solid #e5e7eb' }}>
            <h3 className="perk-title" style={{ marginBottom: 6 }}>{task.title}</h3>
            <p className="perk-description" style={{ marginBottom: 12 }}>{task.description}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" onClick={() => handleEdit(task)} style={{ padding: '8px 12px', borderWidth: 2, borderColor: 'var(--coral-orange)', color: 'var(--coral-orange)', background: 'transparent' }}>
                <FiEdit2 style={{ marginRight: 6 }} /> Edit
              </button>
              <button className="btn-primary" onClick={() => handleDelete(task.id)} style={{ padding: '8px 12px', background: 'var(--coral-orange)' }}>
                <FiTrash2 style={{ marginRight: 6 }} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingTasksManager;


