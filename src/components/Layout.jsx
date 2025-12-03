import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import AddTask from './AddTask';
import FollowUp from './FollowUp';
import Settings from './Settings';
import MeetingTasksManager from './MeetingTasksManager';
import MeetingTemplates from './MeetingTemplates';
import Booking from './Booking';
import Bookings from './Bookings';
import BookingDetail from './BookingDetail';
import Meetings from './Meetings';
import NotificationCenter from './NotificationCenter';
import Profile from './Profile';
import ProfileDropdown from './ProfileDropdown';
import './Layout.css';
import FAQ from './FAQ';
import Contact from './Contact';
import Blog from './Blog';
import PrivacyPolicy from './PrivacyPolicy';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 500);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  
  // Redirect to login if not authenticated (additional check)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // Fetch tasks from API on mount and when authenticated
  useEffect(() => {
    const fetchTasks = async () => {
      if (!isAuthenticated || authLoading) {
        setTasksLoading(false);
        return;
      }

      try {
        setTasksLoading(true);
        const response = await api.getTasks();
        // Transform API response to match UI format
        const transformedTasks = response.tasks.map(task => ({
          id: task.id,
          name: task.name || task.title,
          title: task.title,
          description: task.description || (Array.isArray(task.key_points) 
            ? task.key_points.map(kp => `• ${kp}`).join('\n') 
            : (task.key_points || '')),
          dateTime: task.date_time || '',
          priority: task.priority?.toLowerCase() || 'medium',
          status: task.status || 'pending',
          repeat: task.repeat || 'None',
          repeatDays: task.repeat_days || [],
          repeatMonths: task.repeat_months || [],
          yearlyDates: task.yearly_dates || [],
          invitee: task.invitee || '',
          taskType: task.task_type || 'Regular',
          platform: task.platform || 'Zoom',
          meetingLink: task.meeting_link || '',
          tags: task.tags || '',
          followUpLink: task.follow_up_link || '',
          redirectUrl: task.redirect_url || '',
          bookingLimit: task.booking_limit || '',
          reminder: task.reminder || '15 minutes',
          keyPoints: Array.isArray(task.key_points) 
            ? task.key_points.join('\n') 
            : (task.key_points || ''),
          followUps: Array.isArray(task.follow_ups) ? task.follow_ups : [],
        }));
        setTasks(transformedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
  }, [isAuthenticated, authLoading]);
  
  // Don't render anything if auth is still loading or user is not authenticated
  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }
  
  // Refresh tasks from API
  const refreshTasks = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.getTasks();
      const transformedTasks = response.tasks.map(task => ({
        id: task.id,
        name: task.name || task.title,
        title: task.title,
        description: task.description || task.key_points || '',
        dateTime: task.date_time || '',
        priority: task.priority?.toLowerCase() || 'medium',
        status: task.status || 'pending',
        repeat: task.repeat || 'None',
        repeatDays: task.repeat_days || [],
        repeatMonths: task.repeat_months || [],
        yearlyDates: task.yearly_dates || [],
        invitee: task.invitee || '',
        taskType: task.task_type || 'Regular',
        platform: task.platform || 'Zoom',
        meetingLink: task.meeting_link || '',
        tags: task.tags || '',
        followUpLink: task.follow_up_link || '',
        redirectUrl: task.redirect_url || '',
        bookingLimit: task.booking_limit || '',
        reminder: task.reminder || '15 minutes',
        keyPoints: Array.isArray(task.key_points) 
          ? task.key_points.join('\n') 
          : (task.key_points || ''),
        followUps: Array.isArray(task.follow_ups) ? task.follow_ups : [],
      }));
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  };

  const sectionFromPath = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    // path: /dashboard/:section?
    return parts[1] || 'dashboard';
  }, [location.pathname]);

  // Keep state in sync with URL
  React.useEffect(() => {
    if (activeSection !== sectionFromPath) {
      setActiveSection(sectionFromPath);
    }
  }, [sectionFromPath]);

  // Handle window resize to manage sidebar state
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 500) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    navigate(`/dashboard/${section === 'dashboard' ? '' : section}`);
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 500) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`layout${sidebarOpen ? '' : ' sidebar-closed'}`}>
      {/* Mobile Top Bar with Burger - visible at 500px and below */}
      <div className="mobile-topbar">
        <button 
          className="mobile-menu-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>
      
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen(prev => !prev)}
      />
      <div className="main-content">
        <div className="layout-header">
          <NotificationCenter />
          <ProfileDropdown />
        </div>
        <Routes>
          <Route index element={<Dashboard tasks={tasks} setTasks={setTasks} onNavigate={handleSectionChange} refreshTasks={refreshTasks} loading={tasksLoading} />} />
          <Route path="dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="add-task" element={<AddTask tasks={tasks} setTasks={setTasks} refreshTasks={refreshTasks} />} />
          <Route path="follow-up" element={<FollowUp tasks={tasks} setTasks={setTasks} onNavigate={handleSectionChange} refreshTasks={refreshTasks} />} />
          <Route path="meetings" element={<Meetings tasks={tasks} setTasks={setTasks} refreshTasks={refreshTasks} />} />
          <Route path="meeting-tasks" element={<MeetingTasksManager />} />
          <Route path="meeting-templates" element={<MeetingTemplates />} />
          <Route path="settings" element={<Settings />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/:id" element={<BookingDetail />} />
          <Route path="booking" element={<Booking />} />
          <Route path="profile" element={<Profile />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="contact" element={<Contact />} />
          <Route path="blog" element={<Blog />} />
          {/* Temporarily route Privacy & Terms to PrivacyPolicy until separate Terms page exists */}
          <Route path="privacy-terms" element={<PrivacyPolicy />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      {sidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
