/**
 * API Service Utility
 * Handles all API requests with authentication token management
 */

import { getToken, setToken, removeToken } from './auth/token';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_BASE_URL = 'https://getdontforget.net/api';

/**
 * Make an API request with authentication
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    }

    const data = await response.json();

    // If unauthorized, clear token and redirect to login
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * API methods
 */
export const api = {
  // Authentication endpoints
  register: async (userData) => {
    const response = await apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  login: async (credentials) => {
    const response = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  logout: async () => {
    try {
      await apiRequest('/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
    }
  },

  getUser: async () => {
    return await apiRequest('/user');
  },

  updateProfile: async (profileData) => {
    return await apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Password reset endpoints
  forgotPassword: async (email) => {
    return await apiRequest('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (data) => {
    return await apiRequest('/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Task endpoints
  getTasks: async () => {
    return await apiRequest('/tasks');
  },

  getTask: async (id) => {
    return await apiRequest(`/tasks/${id}`);
  },

  createTask: async (taskData) => {
    return await apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  updateTask: async (id, taskData) => {
    return await apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  deleteTask: async (id) => {
    return await apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  archiveTask: async (id) => {
    // return await apiRequest(`/tasks/${id}/archive`, {
    //   method: 'POST',
    // });
    return await apiRequest(`/archive/${id}`, {
      method: 'POST',
    });
  },

  archiveTasks: async (ids) => {
    // return await apiRequest('/tasks/archive', {
    //   method: 'POST',
    //   body: JSON.stringify({ task_ids: ids }),
    // });
    return await apiRequest(`/archive`, {
      method: 'POST',
      body: JSON.stringify({ task_ids: ids }),
    });
  },

  unarchiveTask: async (id) => {
    return await apiRequest(`/unarchive/${id}`, {
      method: 'POST',
    });
  },

  getArchivedTasks: async () => {
    // return await apiRequest('/tasks/archived');
    return await apiRequest(`/archived`, {
      method: 'GET',
    });
  },

  // Follow-up endpoints
  addFollowUp: async (taskId, note) => {
    return await apiRequest(`/tasks/${taskId}/follow-up`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },

  updateFollowUp: async (taskId, noteId, note) => {
    return await apiRequest(`/tasks/${taskId}/follow-up/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify({ note }),
    });
  },

  markTaskComplete: async (taskId) => {
    return await apiRequest(`/tasks/${taskId}/complete`, {
      method: 'POST',
    });
  },

  // Settings endpoints
  getSettings: async () => {
    return await apiRequest('/settings');
  },

  updateSettings: async (settings) => {
    return await apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  updateSettingsSection: async (section, data) => {
    return await apiRequest(`/settings/${section}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getIntegrations: async () => {
    return await apiRequest('/settings/integrations');
  },

  updateIntegration: async (integrationId, data) => {
    return await apiRequest(`/settings/integrations/${integrationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  exportData: async (format = 'json') => {
    return await apiRequest(`/settings/export?format=${format}`);
  },

  exportDataCsv: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/export?format=csv`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Accept': 'text/csv',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to export data' }));
      throw new Error(errorData.message || 'Failed to export data');
    }

    return await response.text();
  },

  deleteAccount: async () => {
    return await apiRequest('/settings/account', {
      method: 'DELETE',
    });
  },

  // Analytics/Reports endpoints
  generateReport: async (reportData) => {
    return await apiRequest('/settings/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },

  // Guest Access endpoints
  getGuestAccess: async () => {
    return await apiRequest('/settings/guest-access');
  },

  createGuestAccess: async (data) => {
    return await apiRequest('/settings/guest-access', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateGuestAccess: async (id, data) => {
    return await apiRequest(`/settings/guest-access/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteGuestAccess: async (id) => {
    return await apiRequest(`/settings/guest-access/${id}`, {
      method: 'DELETE',
    });
  },

  // Branding image upload
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const token = getToken();
    const headers = {
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/settings/upload-logo`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      }

      const data = await response.json();

      if (response.status === 401) {
        removeToken();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload logo');
      }

      return data;
    } catch (error) {
      console.error('Logo upload error:', error);
      throw error;
    }
  },

  deleteLogo: async () => {
    return await apiRequest('/settings/delete-logo', {
      method: 'DELETE',
    });
  },

  // Package endpoints
  getPackages: async () => {
    return await apiRequest('/packages');
  },

  createPackage: async (packageData) => {
    return await apiRequest('/packages', {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  },

  updatePackage: async (id, packageData) => {
    return await apiRequest(`/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    });
  },

  deletePackage: async (id) => {
    return await apiRequest(`/packages/${id}`, {
      method: 'DELETE',
    });
  },

  getLinks: async () => {
    return await apiRequest('/links');
  },

  createLink: async (linkData) => {
    return await apiRequest('/links', {
      method: 'POST',
      body: JSON.stringify(linkData),
    });
  },

  // Booking endpoints
  getBookings: async () => {
    return await apiRequest('/bookings');
  },

  getBooking: async (id) => {
    return await apiRequest(`/bookings/${id}`);
  },

  createBooking: async (bookingData) => {
    return await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  updateBooking: async (id, bookingData) => {
    return await apiRequest(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  },

  deleteBooking: async (id) => {
    return await apiRequest(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },

  // Public booking endpoints (no auth required)
  getUserPackages: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/packages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch packages');
    }
    
    return await response.json();
  },

  getAvailability: async (userId, date) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/availability/${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch availability');
    }
    
    return await response.json();
  },

  getPublicLink: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/links/public/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch booking link');
    }
    
    return await response.json();
  },

  // Payment endpoints
  createStripeIntent: async (paymentData) => {
    const response = await fetch(`${API_BASE_URL}/payments/stripe/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create Stripe payment intent');
    }

    return await response.json();
  },

  createPayPalOrder: async (paymentData) => {
    const response = await fetch(`${API_BASE_URL}/payments/paypal/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create PayPal order');
    }

    return await response.json();
  },

  confirmStripePayment: async (paymentData) => {
    const response = await fetch(`${API_BASE_URL}/payments/stripe/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to confirm Stripe payment');
    }

    return await response.json();
  },

  capturePayPalPayment: async (paymentData) => {
    const response = await fetch(`${API_BASE_URL}/payments/paypal/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to capture PayPal payment');
    }

    return await response.json();
  },

  // Generic request methods
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

