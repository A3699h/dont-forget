import React, { useMemo, useState } from 'react';
import './Meetings.css';

const Meetings = ({ tasks = [], setTasks = () => { } }) => {
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState('google');
  const [selectedType, setSelectedType] = useState('all');
  const selectedTask = useMemo(() => tasks.find(t => String(t.id) === String(selectedTaskId)), [tasks, selectedTaskId]);

  const tasksByRelevance = useMemo(() => {
    const priorityOrder = {
      'due-today': 1,
      'late': 2,
      'upcoming': 3,
      'follow-up': 4,
      'high-priority': 5,
      'other': 6
    };
    return [...tasks]
      .filter(t => selectedType === 'all' || t.priority === selectedType)
      .sort((a, b) => {
        const aKey = priorityOrder[a.priority] || priorityOrder.other;
        const bKey = priorityOrder[b.priority] || priorityOrder.other;
        if (aKey !== bKey) return aKey - bKey;
        return (a.dateTime || '').localeCompare(b.dateTime || '');
      });
  }, [tasks, selectedType]);

  const taskTypes = useMemo(() => {
    const set = new Set(tasks.map(t => t.priority).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [tasks]);

  const fallbackNotes = [
    { id: 'n1', text: 'Prepared agenda and materials' },
    { id: 'n2', text: 'Confirmed attendee availability' }
  ];

  return (
    <div className="meetings-page">
      {/* Meeting Platform Section - Top 70% */}
      <div className="meeting-platform-section">
        <div className="meet-card">
          <div className="meet-card-head head-with-actions">
            <div className="head-title">{selectedMeeting === 'google' ? 'Google Meet' : 'Zoom'}</div>
            <div className="head-actions">
              <button
                className={`meeting-btn ${selectedMeeting === 'google' ? 'active' : ''}`}
                onClick={() => setSelectedMeeting('google')}
              >
                Google Meet
              </button>
              <button
                className={`meeting-btn ${selectedMeeting === 'zoom' ? 'active' : ''}`}
                onClick={() => setSelectedMeeting('zoom')}
              >
                Zoom
              </button>
            </div>
          </div>
          <iframe
            title={selectedMeeting === 'google' ? 'Google Meet' : 'Zoom'}
            src={selectedMeeting === 'google' ? 'https://meet.google.com/' : 'https://zoom.us/'}
            className="meet-iframe"
            allow="camera; microphone; display-capture; clipboard-write;"
          />
        </div>
      </div>

      {/* Task Notes Section - Bottom 30% */}
      <div className="task-notes-section">
        <div className="notes-card">
          <div className="notes-head">
            <h3 className="notes-title">Task Notes</h3>
            <div className="selection-row top">
              <select
                className="filter-select"
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setSelectedTaskId(''); }}
              >
                {taskTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Task Types' : type.replace('-', ' ')}
                  </option>
                ))}
              </select>
              <select className="tasks-select" value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)}>
                <option value="">Select a task...</option>
                {tasksByRelevance.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.name} {task.dateTime ? `— ${new Date(task.dateTime).toLocaleString()}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedTask && (
            <div className="notes-body">
              <ul className="notes-list">
                {((selectedTask.followUps && selectedTask.followUps.length > 0) ? selectedTask.followUps : fallbackNotes).map(note => (
                  <li key={note.id} className="note-item">
                    {note.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Meetings;


