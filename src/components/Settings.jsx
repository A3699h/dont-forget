import React, { useMemo, useState, useEffect } from 'react';
import { FiSettings } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { getUserDisplayName, getUserInitials } from '../utils/auth/helpers';
import IntegrationModal from './IntegrationModal';
import './Settings.css';

const SETTINGS_SECTIONS = [
  { id: 'integrations', label: 'Integrations' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'branding', label: 'Branding' },
  { id: 'booking-caps', label: 'Booking Caps' },
  { id: 'guest-access', label: 'Guest Access' },
  { id: 'account', label: 'Account' }
];

const availableIntegrations = [
  { id: 'zoom', name: 'Zoom' },
  { id: 'gmeet', name: 'Google Meet' },
  { id: 'stripe', name: 'Stripe' },
  { id: 'paypal', name: 'PayPal' },
  { id: 'canva', name: 'Canva' },
  { id: 'chatgpt', name: 'ChatGPT' },
  { id: 'zapier', name: 'Zapier' }
];

const Settings = () => {
  const { user } = useAuth();
  const displayName = getUserDisplayName(user);
  const userInitials = getUserInitials(user);
  const [active, setActive] = useState('integrations');
  const [connections, setConnections] = useState({});
  const [notify, setNotify] = useState({ reminders: true, payments: true, overdue: true });
  const [branding, setBranding] = useState({ color: '#0e7a92', logo: '' });
  const [caps, setCaps] = useState({ daily: 3, weekly: 10, monthly: 40 });
  const [guest, setGuest] = useState({ link: '', username: '', passcode: '' });
  const [guestAccesses, setGuestAccesses] = useState([]);
  const [reportData, setReportData] = useState({ daily: null, weekly: null, monthly: null });
  const [loadingReports, setLoadingReports] = useState({ daily: false, weekly: false, monthly: false });
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load settings from API on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await api.getSettings();
        const settings = response.settings || {};
        
        // Set notifications - merge with defaults to ensure all keys exist
        const defaultNotifications = { reminders: true, payments: true, overdue: true };
        setNotify({
          ...defaultNotifications,
          ...(settings.notifications || {})
        });
        
        // Set branding - merge with defaults
        const defaultBranding = { color: '#0e7a92', logo: '' };
        setBranding({
          ...defaultBranding,
          ...(settings.branding || {})
        });
        
        // Set booking caps - merge with defaults
        const defaultCaps = { daily: 3, weekly: 10, monthly: 40 };
        setCaps({
          ...defaultCaps,
          ...(settings.booking_caps || {})
        });
        
        // Set integrations
        if (settings.integrations) {
          const loadedConnections = {};
          Object.keys(settings.integrations).forEach(integrationId => {
            if (settings.integrations[integrationId]?.hasCredentials) {
              loadedConnections[integrationId] = settings.integrations[integrationId];
            }
          });
          setConnections(loadedConnections);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Fallback to localStorage for integrations (backward compatibility)
    const loadedConnections = {};
    availableIntegrations.forEach(integration => {
      const saved = localStorage.getItem(`integration_${integration.id}`);
      if (saved) {
        try {
          loadedConnections[integration.id] = { connectedAt: new Date().toISOString(), hasCredentials: true };
        } catch (e) {
          console.error('Failed to load integration');
        }
      }
    });
    setConnections(loadedConnections);
      } finally {
        setLoading(false);
      }
    };

    const fetchGuestAccess = async () => {
      try {
        const response = await api.getGuestAccess();
        setGuestAccesses(response.guest_accesses || []);
      } catch (error) {
        console.error('Error fetching guest access:', error);
      }
    };

    fetchSettings();
    fetchGuestAccess();
  }, []);

  // Auto-load analytics when analytics section is first opened
  useEffect(() => {
    if (active === 'analytics' && !analyticsLoaded) {
      // Load all three report types automatically on first open
      const loadAllReports = async () => {
        const loadReport = async (type) => {
          try {
            setLoadingReports(prev => ({ ...prev, [type]: true }));
            const response = await api.generateReport({ type });
            
            if (response && response.metrics && response.type) {
              setReportData(prev => ({ ...prev, [type]: response }));
            }
          } catch (error) {
            console.error(`Error loading ${type} report:`, error);
          } finally {
            setLoadingReports(prev => ({ ...prev, [type]: false }));
          }
        };

        // Load all reports in parallel
        await Promise.all([
          loadReport('daily'),
          loadReport('weekly'),
          loadReport('monthly')
        ]);
        
        setAnalyticsLoaded(true);
      };
      
      loadAllReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]); // Only run when active section changes


  const handleConnect = async (id) => {
    const isConnected = !!connections[id];
    if (isConnected) {
      // Disconnect - remove credentials
      if (window.confirm('Are you sure you want to disconnect? Your API keys will be removed.')) {
        try {
          setSaving(true);
          await api.updateIntegration(id, { connected: false, credentials: {} });
          const updated = { ...connections };
          delete updated[id];
          setConnections(updated);
          // Also remove from localStorage for backward compatibility
        localStorage.removeItem(`integration_${id}`);
          setSaveMessage('Integration disconnected successfully');
          setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
          console.error('Error disconnecting integration:', error);
          alert('Failed to disconnect integration. Please try again.');
        } finally {
          setSaving(false);
        }
      }
    } else {
      // Connect - open modal
      const integration = availableIntegrations.find(i => i.id === id);
      setSelectedIntegration(integration);
      setShowIntegrationModal(true);
    }
  };

  const handleSaveIntegration = async (integrationId, credentials) => {
    try {
      setSaving(true);
      await api.updateIntegration(integrationId, { 
        connected: true, 
        credentials: credentials 
      });
      setConnections({ 
        ...connections, 
        [integrationId]: { 
          connectedAt: new Date().toISOString(), 
          hasCredentials: true 
        } 
      });
      // Also save to localStorage for backward compatibility
      localStorage.setItem(`integration_${integrationId}`, JSON.stringify(credentials));
    setShowIntegrationModal(false);
    setSelectedIntegration(null);
      setSaveMessage('Integration connected successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving integration:', error);
      alert('Failed to save integration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async (newNotify) => {
    try {
      setSaving(true);
      await api.updateSettingsSection('notifications', { notifications: newNotify });
      setSaveMessage('Notification settings saved');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving notifications:', error);
      alert('Failed to save notification settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveBranding = async (newBranding) => {
    try {
      setSaving(true);
      await api.updateSettingsSection('branding', { branding: newBranding });
      setSaveMessage('Branding settings saved');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving branding:', error);
      alert('Failed to save branding settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    try {
      setSaving(true);
      const response = await api.uploadLogo(file);
      const newBranding = { ...branding, logo: response.logo_url };
      setBranding(newBranding);
      setSaveMessage('Logo uploaded successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!branding.logo) return;
    
    if (window.confirm('Are you sure you want to delete the logo?')) {
      try {
        setSaving(true);
        await api.deleteLogo();
        const newBranding = { ...branding, logo: '' };
        setBranding(newBranding);
        setSaveMessage('Logo deleted successfully');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting logo:', error);
        alert('Failed to delete logo. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const saveBookingCaps = async (newCaps) => {
    try {
      setSaving(true);
      await api.updateSettingsSection('booking_caps', { booking_caps: newCaps });
      setSaveMessage('Booking limits saved');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving booking caps:', error);
      alert('Failed to save booking limits. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowIntegrationModal(false);
    setSelectedIntegration(null);
  };

  const handleGenerateGuestAccess = async () => {
    try {
      setSaving(true);
      const response = await api.createGuestAccess({ expires_in_days: 30 });
      setGuest({
        username: response.guest_access.username,
        passcode: response.guest_access.passcode,
        link: response.guest_access.link,
      });
      // Refresh guest access list
      const guestResponse = await api.getGuestAccess();
      setGuestAccesses(guestResponse.guest_accesses || []);
      setSaveMessage('Guest access created successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error creating guest access:', error);
      alert('Failed to create guest access. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGuestAccess = async (id) => {
    if (window.confirm('Are you sure you want to delete this guest access?')) {
      try {
        setSaving(true);
        await api.deleteGuestAccess(id);
        const response = await api.getGuestAccess();
        setGuestAccesses(response.guest_accesses || []);
        setSaveMessage('Guest access deleted successfully');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting guest access:', error);
        alert('Failed to delete guest access. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleGenerateReport = async (type) => {
    try {
      setLoadingReports(prev => ({ ...prev, [type]: true }));
      setSaveMessage('');
      
      const response = await api.generateReport({ type });
      
      // Validate response structure
      if (response && response.metrics && response.type) {
        setReportData(prev => ({ ...prev, [type]: response }));
        setSaveMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} analytics refreshed successfully`);
        setTimeout(() => setSaveMessage(''), 3000);
        setAnalyticsLoaded(true); // Mark as loaded after manual refresh
      } else {
        console.error('Invalid response structure:', response);
        setSaveMessage('Invalid response from server. Please try again.');
        setTimeout(() => setSaveMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setSaveMessage(`Failed to refresh ${type} analytics. Please try again.`);
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setLoadingReports(prev => ({ ...prev, [type]: false }));
    }
  };

  const handlePrintReport = (type) => {
    const report = reportData[type];
    if (!report || !report.metrics) {
      alert('No data available to print. Please refresh the report first.');
      return;
    }

    // Create a print-friendly HTML content
    let content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${type.charAt(0).toUpperCase() + type.slice(1)} Analytics Report</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .no-print { display: none; }
            }
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #111827; margin-bottom: 10px; }
            .report-date { color: #6b7280; margin-bottom: 30px; font-size: 14px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; }
            .metric-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb; }
            .metric-label { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
            .metric-value { font-size: 28px; font-weight: 600; color: #111827; }
            .period-info { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 6px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>${type === 'daily' ? 'Daily Snapshot' : type === 'weekly' ? 'Weekly Summary' : 'Monthly Overview'}</h1>
          <div class="report-date">Generated: ${report.generated_at ? new Date(report.generated_at).toLocaleString() : 'N/A'}</div>
          <div class="period-info">
            Period: ${report.period?.start ? new Date(report.period.start).toLocaleDateString() : 'N/A'} 
            ${report.period?.end ? ' - ' + new Date(report.period.end).toLocaleDateString() : ''}
          </div>
          <div class="metrics-grid">
    `;

    // Add metrics based on type
    if (type === 'daily') {
      content += `
        <div class="metric-card">
          <div class="metric-label">Total Tasks Created Today</div>
          <div class="metric-value">${report.metrics.tasks_created_today || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Tasks Completed Today</div>
          <div class="metric-value" style="color: #059669;">${report.metrics.tasks_completed_today || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Tasks Due Today</div>
          <div class="metric-value" style="color: #2563eb;">${report.metrics.tasks_due_today || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Tasks Marked Late Today</div>
          <div class="metric-value" style="color: #dc2626;">${report.metrics.tasks_late_today || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Follow-ups Created Today</div>
          <div class="metric-value" style="color: #7c3aed;">${report.metrics.follow_ups_created_today || 0}</div>
        </div>
      `;
    } else if (type === 'weekly') {
      content += `
        <div class="metric-card">
          <div class="metric-label">Total Tasks Created This Week</div>
          <div class="metric-value">${report.metrics.tasks_created_this_week || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total Tasks Completed This Week</div>
          <div class="metric-value" style="color: #059669;">${report.metrics.tasks_completed_this_week || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total Overdue Tasks This Week</div>
          <div class="metric-value" style="color: #dc2626;">${report.metrics.tasks_overdue_this_week || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total Follow-ups Created This Week</div>
          <div class="metric-value" style="color: #7c3aed;">${report.metrics.follow_ups_created_this_week || 0}</div>
        </div>
      `;
    } else if (type === 'monthly') {
      content += `
        <div class="metric-card">
          <div class="metric-label">Total Tasks Created This Month</div>
          <div class="metric-value">${report.metrics.tasks_created_this_month || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total Tasks Completed This Month</div>
          <div class="metric-value" style="color: #059669;">${report.metrics.tasks_completed_this_month || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total Overdue Tasks This Month</div>
          <div class="metric-value" style="color: #dc2626;">${report.metrics.tasks_overdue_this_month || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total Follow-ups Created This Month</div>
          <div class="metric-value" style="color: #7c3aed;">${report.metrics.follow_ups_created_this_month || 0}</div>
        </div>
      `;
    }

    content += `
          </div>
        </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handlePrintAllReports = () => {
    // Check if all reports are available
    const hasDaily = reportData.daily && reportData.daily.metrics;
    const hasWeekly = reportData.weekly && reportData.weekly.metrics;
    const hasMonthly = reportData.monthly && reportData.monthly.metrics;

    if (!hasDaily && !hasWeekly && !hasMonthly) {
      alert('No data available to print. Please refresh the reports first.');
      return;
    }

    // Create a print-friendly HTML content with all reports
    let content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Complete Analytics Report</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .no-print { display: none; }
              .report-section { page-break-after: always; }
              .report-section:last-child { page-break-after: auto; }
            }
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
            h1 { color: #111827; margin-bottom: 10px; font-size: 32px; }
            .report-title { color: #111827; margin: 40px 0 20px 0; font-size: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
            .report-date { color: #6b7280; margin-bottom: 10px; font-size: 14px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; margin-bottom: 40px; }
            .metric-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb; }
            .metric-label { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
            .metric-value { font-size: 28px; font-weight: 600; color: #111827; }
            .period-info { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 6px; font-size: 12px; color: #6b7280; }
            .report-section { margin-bottom: 60px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Complete Analytics Report</h1>
            <div class="report-date">Generated: ${new Date().toLocaleString()}</div>
          </div>
    `;

    // Add Daily Snapshot
    if (hasDaily) {
      const report = reportData.daily;
      content += `
        <div class="report-section">
          <h2 class="report-title">Daily Snapshot</h2>
          <div class="report-date">Generated: ${report.generated_at ? new Date(report.generated_at).toLocaleString() : 'N/A'}</div>
          <div class="period-info">
            Period: ${report.period?.start ? new Date(report.period.start).toLocaleDateString() : 'N/A'} 
            ${report.period?.end ? ' - ' + new Date(report.period.end).toLocaleDateString() : ''}
          </div>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-label">Total Tasks Created Today</div>
              <div class="metric-value">${report.metrics.tasks_created_today || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Tasks Completed Today</div>
              <div class="metric-value" style="color: #059669;">${report.metrics.tasks_completed_today || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Tasks Due Today</div>
              <div class="metric-value" style="color: #2563eb;">${report.metrics.tasks_due_today || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Tasks Marked Late Today</div>
              <div class="metric-value" style="color: #dc2626;">${report.metrics.tasks_late_today || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Follow-ups Created Today</div>
              <div class="metric-value" style="color: #7c3aed;">${report.metrics.follow_ups_created_today || 0}</div>
            </div>
          </div>
        </div>
      `;
    }

    // Add Weekly Summary
    if (hasWeekly) {
      const report = reportData.weekly;
      content += `
        <div class="report-section">
          <h2 class="report-title">Weekly Summary</h2>
          <div class="report-date">Generated: ${report.generated_at ? new Date(report.generated_at).toLocaleString() : 'N/A'}</div>
          <div class="period-info">
            Period: ${report.period?.start ? new Date(report.period.start).toLocaleDateString() : 'N/A'} 
            ${report.period?.end ? ' - ' + new Date(report.period.end).toLocaleDateString() : ''}
          </div>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-label">Total Tasks Created This Week</div>
              <div class="metric-value">${report.metrics.tasks_created_this_week || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Total Tasks Completed This Week</div>
              <div class="metric-value" style="color: #059669;">${report.metrics.tasks_completed_this_week || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Total Overdue Tasks This Week</div>
              <div class="metric-value" style="color: #dc2626;">${report.metrics.tasks_overdue_this_week || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Total Follow-ups Created This Week</div>
              <div class="metric-value" style="color: #7c3aed;">${report.metrics.follow_ups_created_this_week || 0}</div>
            </div>
          </div>
        </div>
      `;
    }

    // Add Monthly Overview
    if (hasMonthly) {
      const report = reportData.monthly;
      content += `
        <div class="report-section">
          <h2 class="report-title">Monthly Overview</h2>
          <div class="report-date">Generated: ${report.generated_at ? new Date(report.generated_at).toLocaleString() : 'N/A'}</div>
          <div class="period-info">
            Period: ${report.period?.start ? new Date(report.period.start).toLocaleDateString() : 'N/A'} 
            ${report.period?.end ? ' - ' + new Date(report.period.end).toLocaleDateString() : ''}
          </div>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-label">Total Tasks Created This Month</div>
              <div class="metric-value">${report.metrics.tasks_created_this_month || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Total Tasks Completed This Month</div>
              <div class="metric-value" style="color: #059669;">${report.metrics.tasks_completed_this_month || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Total Overdue Tasks This Month</div>
              <div class="metric-value" style="color: #dc2626;">${report.metrics.tasks_overdue_this_month || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Total Follow-ups Created This Month</div>
              <div class="metric-value" style="color: #7c3aed;">${report.metrics.follow_ups_created_this_month || 0}</div>
            </div>
          </div>
        </div>
      `;
    }

    content += `
        </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const sectionTitle = useMemo(() => SETTINGS_SECTIONS.find(s => s.id === active)?.label || '', [active]);

  if (loading) {
    return (
      <div className="settings-page">
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <aside className="settings-side">
        <div className="settings-side-header">Settings</div>
        <ul className="settings-nav">
          {SETTINGS_SECTIONS.map(s => (
            <li key={s.id}>
              <button className={`settings-link ${active === s.id ? 'active' : ''}`} onClick={() => setActive(s.id)}>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="settings-content">
        <div className="settings-header">
          <div className="section-title">
            <span className="title-icon"><FiSettings /></span>
            <h2>{sectionTitle}</h2>
          </div>
          <p className="section-desc">
            Configure your workspace. Changes are saved automatically.
          </p>
          {saveMessage && (
            <div style={{ 
              padding: '8px 16px', 
              background: '#10b981', 
              color: 'white', 
              borderRadius: '6px',
              marginTop: '12px',
              fontSize: '14px'
            }}>
              {saveMessage}
            </div>
          )}
          {saving && (
            <div style={{ 
              padding: '8px 16px', 
              background: '#f59e0b', 
              color: 'white', 
              borderRadius: '6px',
              marginTop: '12px',
              fontSize: '14px'
            }}>
              Saving...
            </div>
          )}
        </div>

        {active === 'integrations' && (
          <div className="card-grid">
            {availableIntegrations.map(item => {
              const connected = !!connections[item.id];
              return (
                <div key={item.id} className="setting-card">
                  <div className="card-head">
                    <div className="card-title">{item.name}</div>
                    <span className={`status-badge ${connected ? 'connected' : ''}`}>{connected ? 'Connected' : 'Not connected'}</span>
                  </div>
                  <p className="card-desc">Connect your own {item.name} account. We do not provide this service.</p>
                  <div className="card-actions">
                    <button className={`primary-btn`} onClick={() => handleConnect(item.id)}>
                      {connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {active === 'notifications' && (
          <div className="setting-card">
            <div className="card-title">Platform Notifications</div>
            <p className="card-desc">In-app notifications only. No SMS or email.</p>
            <div className="toggle-list">
              <label className="toggle-item">
                <input 
                  type="checkbox" 
                  checked={notify.reminders} 
                  onChange={(e) => {
                    const newNotify = { ...notify, reminders: e.target.checked };
                    setNotify(newNotify);
                    saveNotifications(newNotify);
                  }}
                /> 
                Show reminders
              </label>
              <label className="toggle-item">
                <input 
                  type="checkbox" 
                  checked={notify.payments} 
                  onChange={(e) => {
                    const newNotify = { ...notify, payments: e.target.checked };
                    setNotify(newNotify);
                    saveNotifications(newNotify);
                  }}
                /> 
                Show payment alerts
              </label>
              <label className="toggle-item">
                <input 
                  type="checkbox" 
                  checked={notify.overdue} 
                  onChange={(e) => {
                    const newNotify = { ...notify, overdue: e.target.checked };
                    setNotify(newNotify);
                    saveNotifications(newNotify);
                  }}
                /> 
                Show task overdue warning
              </label>
            </div>
          </div>
        )}

        {active === 'analytics' && (
          <div className="setting-card">
            <div className="card-title">Analytics</div>
            <p className="card-desc">On-demand only: click "Refresh" buttons to update metrics. No auto-refresh to save bandwidth. Data updates only when you click refresh.</p>
            
            {/* Refresh All and Print All Buttons */}
            <div style={{ marginTop: '20px', marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                className="primary-btn" 
                onClick={() => {
                  handleGenerateReport('daily');
                  handleGenerateReport('weekly');
                  handleGenerateReport('monthly');
                }}
                disabled={loadingReports.daily || loadingReports.weekly || loadingReports.monthly}
                style={{ fontSize: '14px', padding: '10px 20px' }}
              >
                {loadingReports.daily || loadingReports.weekly || loadingReports.monthly 
                  ? 'Refreshing...' 
                  : 'Refresh All Analytics'}
              </button>
              <button 
                className="secondary-btn" 
                onClick={handlePrintAllReports}
                disabled={(!reportData.daily || !reportData.daily.metrics) && 
                          (!reportData.weekly || !reportData.weekly.metrics) && 
                          (!reportData.monthly || !reportData.monthly.metrics)}
                style={{ fontSize: '14px', padding: '10px 20px' }}
                title="Print all available reports together"
              >
                Print All Reports
              </button>
            </div>
            
            {/* Daily Snapshot */}
            <div style={{ marginTop: '30px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Daily Snapshot</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="secondary-btn" 
                    onClick={() => handlePrintReport('daily')}
                    disabled={!reportData.daily || !reportData.daily.metrics}
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                    title="Print Daily Report"
                  >
                    Print
                  </button>
                  <button 
                    className="secondary-btn" 
                    onClick={() => handleGenerateReport('daily')}
                    disabled={loadingReports.daily}
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                  >
                    {loadingReports.daily ? 'Loading...' : 'Refresh Daily'}
                  </button>
                </div>
              </div>
              {reportData.daily && reportData.daily.metrics ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Tasks Created Today</div>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                        {reportData.daily.metrics.tasks_created_today || 0}
                      </div>
                    </div>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Tasks Completed Today</div>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: '#059669' }}>
                        {reportData.daily.metrics.tasks_completed_today || 0}
                      </div>
                    </div>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Tasks Due Today</div>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: '#2563eb' }}>
                        {reportData.daily.metrics.tasks_due_today || 0}
                      </div>
                    </div>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Tasks Marked Late Today</div>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: '#dc2626' }}>
                        {reportData.daily.metrics.tasks_late_today || 0}
                      </div>
                    </div>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Follow-ups Created Today</div>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: '#7c3aed' }}>
                        {reportData.daily.metrics.follow_ups_created_today || 0}
                      </div>
                    </div>
                  </div>
                  {reportData.daily.generated_at && (
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                      Last updated: {new Date(reportData.daily.generated_at).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '8px' }}>
                  Click "Refresh Daily" to load daily analytics
                </div>
              )}
            </div>

            {/* Weekly Summary */}
            <div style={{ marginTop: '30px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Weekly Summary</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="secondary-btn" 
                    onClick={() => handlePrintReport('weekly')}
                    disabled={!reportData.weekly || !reportData.weekly.metrics}
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                    title="Print Weekly Report"
                  >
                    Print
                  </button>
                  <button 
                    className="secondary-btn" 
                    onClick={() => handleGenerateReport('weekly')}
                    disabled={loadingReports.weekly}
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                  >
                    {loadingReports.weekly ? 'Loading...' : 'Refresh Weekly'}
                  </button>
                </div>
              </div>
              {reportData.weekly && reportData.weekly.metrics ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Tasks Created This Week</div>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                        {reportData.weekly.metrics.tasks_created_this_week || 0}
                      </div>
                    </div>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Tasks Completed This Week</div>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: '#059669' }}>
                        {reportData.weekly.metrics.tasks_completed_this_week || 0}
                      </div>
                    </div>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Overdue Tasks This Week</div>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: '#dc2626' }}>
                        {reportData.weekly.metrics.tasks_overdue_this_week || 0}
                      </div>
                    </div>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Follow-ups Created This Week</div>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: '#7c3aed' }}>
                        {reportData.weekly.metrics.follow_ups_created_this_week || 0}
                      </div>
                    </div>
                  </div>
                  {reportData.weekly.generated_at && (
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                      Last updated: {new Date(reportData.weekly.generated_at).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '8px' }}>
                  Click "Refresh Weekly" to load weekly analytics
                </div>
              )}
            </div>

            {/* Monthly Overview */}
            <div style={{ marginTop: '30px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Monthly Overview</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="secondary-btn" 
                    onClick={() => handlePrintReport('monthly')}
                    disabled={!reportData.monthly || !reportData.monthly.metrics}
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                    title="Print Monthly Report"
                  >
                    Print
                  </button>
                  <button 
                    className="secondary-btn" 
                    onClick={() => handleGenerateReport('monthly')}
                    disabled={loadingReports.monthly}
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                  >
                    {loadingReports.monthly ? 'Loading...' : 'Refresh Monthly'}
                  </button>
                </div>
              </div>
              {reportData.monthly && reportData.monthly.metrics ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Tasks Created This Month</div>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                        {reportData.monthly.metrics.tasks_created_this_month || 0}
                      </div>
                    </div>
                     <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                       <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Tasks Completed This Month</div>
                       <div style={{ fontSize: '24px', fontWeight: '600', color: '#059669' }}>
                         {reportData.monthly.metrics.tasks_completed_this_month || 0}
                       </div>
                     </div>
                     <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                       <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Overdue Tasks This Month</div>
                       <div style={{ fontSize: '24px', fontWeight: '600', color: '#dc2626' }}>
                         {reportData.monthly.metrics.tasks_overdue_this_month || 0}
                       </div>
                     </div>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Follow-ups Created This Month</div>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: '#7c3aed' }}>
                        {reportData.monthly.metrics.follow_ups_created_this_month || 0}
                      </div>
                    </div>
                  </div>
                  {reportData.monthly.generated_at && (
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                      Last updated: {new Date(reportData.monthly.generated_at).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '8px' }}>
                  Click "Refresh Monthly" to load monthly analytics
                </div>
              )}
            </div>
          </div>
        )}

        {active === 'branding' && (
          <div className="setting-card">
            <div className="card-title">Workspace Branding</div>
            <p className="card-desc">Upload a logo and choose a color to personalize booking pages and dashboards.</p>
            <div className="form-row">
              <div className="form-field">
                <label>Logo</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload}
                  disabled={saving}
                />
                {branding.logo && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <img 
                        src={branding.logo} 
                        alt="Branding Logo" 
                        style={{ 
                          maxWidth: '150px', 
                          maxHeight: '150px', 
                          objectFit: 'contain',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px',
                          background: '#fff'
                        }} 
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={handleDeleteLogo}
                        disabled={saving}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Delete Logo
                      </button>
                    </div>
                    <div className="hint" style={{ fontSize: '12px', color: '#6b7280' }}>
                      Current logo: {branding.logo.split('/').pop()}
                    </div>
                  </div>
                )}
                {!branding.logo && (
                  <div className="hint" style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                    Upload a logo image (max 2MB, formats: JPEG, PNG, GIF, SVG, WebP)
                  </div>
                )}
              </div>
              <div className="form-field">
                <label>Primary Color</label>
                <input 
                  type="color" 
                  value={branding.color} 
                  onChange={(e) => {
                    const newBranding = { ...branding, color: e.target.value };
                    setBranding(newBranding);
                    saveBranding(newBranding);
                  }} 
                />
              </div>
            </div>
          </div>
        )}

        {active === 'booking-caps' && (
          <div className="setting-card">
            <div className="card-title">Booking Limits</div>
            <p className="card-desc">Prevent overbooking and manage workload with caps.</p>
            <div className="form-row">
              <div className="form-field">
                <label>Daily limit</label>
                <input 
                  type="number" 
                  min="0" 
                  value={caps.daily} 
                  onChange={(e) => {
                    const newCaps = { ...caps, daily: Number(e.target.value) };
                    setCaps(newCaps);
                    saveBookingCaps(newCaps);
                  }} 
                />
              </div>
              <div className="form-field">
                <label>Weekly limit</label>
                <input 
                  type="number" 
                  min="0" 
                  value={caps.weekly} 
                  onChange={(e) => {
                    const newCaps = { ...caps, weekly: Number(e.target.value) };
                    setCaps(newCaps);
                    saveBookingCaps(newCaps);
                  }} 
                />
              </div>
              <div className="form-field">
                <label>Monthly limit</label>
                <input 
                  type="number" 
                  min="0" 
                  value={caps.monthly} 
                  onChange={(e) => {
                    const newCaps = { ...caps, monthly: Number(e.target.value) };
                    setCaps(newCaps);
                    saveBookingCaps(newCaps);
                  }} 
                />
              </div>
            </div>
          </div>
        )}

        {active === 'guest-access' && (
          <div className="setting-card">
            <div className="card-title">Guest Access</div>
            <p className="card-desc">Generate a temporary username, passcode, and link for meetings. No email invites.</p>
            <div className="guest-grid">
              <button 
                className="primary-btn" 
                onClick={handleGenerateGuestAccess}
                disabled={saving}
              >
                Generate Guest Access
              </button>
              {guest.link && (
                <div className="guest-info">
                  <div><strong>Username:</strong> {guest.username}</div>
                  <div><strong>Passcode:</strong> {guest.passcode}</div>
                  <div><strong>Link:</strong> <span className="mono">{guest.link}</span></div>
                </div>
              )}
            </div>
            
            {guestAccesses.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '12px' }}>Active Guest Access</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {guestAccesses.map((access) => (
                    <div 
                      key={access.id} 
                      style={{ 
                        padding: '12px', 
                        background: '#f9fafb', 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <div><strong>Username:</strong> {access.username}</div>
                          <div><strong>Passcode:</strong> {access.passcode}</div>
                          <div><strong>Link:</strong> <span className="mono">{access.link}</span></div>
                          {access.expires_at && (
                            <div><strong>Expires:</strong> {new Date(access.expires_at).toLocaleDateString()}</div>
                          )}
                          <div><strong>Usage:</strong> {access.usage_count} times</div>
                          {access.last_used_at && (
                            <div><strong>Last Used:</strong> {new Date(access.last_used_at).toLocaleString()}</div>
                          )}
                          <div>
                            <strong>Status:</strong> 
                            <span style={{ 
                              color: access.is_active ? '#10b981' : '#ef4444',
                              marginLeft: '8px'
                            }}>
                              {access.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <button
                          className="danger-btn"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleDeleteGuestAccess(access.id)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {active === 'account' && (
          <div className="setting-card">
            <div className="card-title">Account</div>
            <p className="card-desc">View payment history via Stripe/PayPal links, export data, or manage your account.</p>
            
            {/* User Profile Info */}
            {user && (
              <div className="account-profile">
                <div className="profile-avatar">
                  {userInitials}
                </div>
                <div className="profile-info">
                  <div className="profile-name">{displayName}</div>
                  {user.full_name && (
                    <div className="profile-full-name">{user.full_name}</div>
                  )}
                  {user.email && (
                    <div className="profile-email">{user.email}</div>
                  )}
                  {user.role_title && (
                    <div className="profile-role">{user.role_title}</div>
                  )}
                  {user.business_name && (
                    <div className="profile-business">{user.business_name}</div>
                  )}
                </div>
              </div>
            )}
            
            <div className="account-actions">
              <button className="secondary-btn">View Stripe/PayPal Transactions</button>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  className="secondary-btn" 
                  onClick={async () => {
                    try {
                      setSaving(true);
                      const data = await api.exportData('json');
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `dont-forget-data-${new Date().toISOString().split('T')[0]}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setSaveMessage('Data exported successfully (JSON)');
                      setTimeout(() => setSaveMessage(''), 3000);
                    } catch (error) {
                      console.error('Error exporting data:', error);
                      alert('Failed to export data. Please try again.');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                >
                  Export Data (JSON)
                </button>
                <button 
                  className="secondary-btn" 
                  onClick={async () => {
                    try {
                      setSaving(true);
                      const response = await api.exportDataCsv();
                      const blob = new Blob([response], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `dont-forget-data-${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setSaveMessage('Data exported successfully (CSV)');
                      setTimeout(() => setSaveMessage(''), 3000);
                    } catch (error) {
                      console.error('Error exporting data:', error);
                      alert('Failed to export data. Please try again.');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                >
                  Export Data (CSV)
                </button>
              </div>
              <button 
                className="danger-btn" 
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone. All your tasks and data will be permanently deleted.')) {
                    if (window.confirm('This is your last chance. Are you absolutely sure?')) {
                      try {
                        await api.deleteAccount();
                        alert('Account deleted successfully. You will be redirected to the homepage.');
                        window.location.href = '/';
                      } catch (error) {
                        console.error('Error deleting account:', error);
                        alert('Failed to delete account. Please try again.');
                      }
                    }
                  }
                }}
              >
                Delete Account
              </button>
              <button className="secondary-btn">Cancel Subscription</button>
            </div>
          </div>
        )}
      </section>

      {/* Integration Modal */}
      {showIntegrationModal && selectedIntegration && (
        <IntegrationModal
          integration={selectedIntegration}
          onClose={handleCloseModal}
          onSave={handleSaveIntegration}
        />
      )}
    </div>
  );
};

export default Settings;
