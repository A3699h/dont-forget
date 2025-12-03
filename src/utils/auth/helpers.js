/**
 * Authentication helper utilities
 * General helper functions for authentication
 */

import { getToken } from './token';

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Format user display name
 * @param {Object} user - User object
 * @returns {string} Formatted display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'Guest';
  
  if (user.full_name) {
    return user.full_name;
  }
  
  if (user.username) {
    return user.username;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
};

/**
 * Get user initials for avatar
 * @param {Object} user - User object
 * @returns {string} User initials (e.g., "JD" for John Doe)
 */
export const getUserInitials = (user) => {
  if (!user) return '?';
  
  const name = user.full_name || user.username || user.email || '';
  const parts = name.trim().split(/\s+/);
  
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }
  
  return '?';
};

/**
 * Check if user has a specific role
 * @param {Object} user - User object
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export const hasRole = (user, role) => {
  if (!user) return false;
  return user.role === role || user.role_title === role;
};

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean} True if user is admin
 */
export const isAdmin = (user) => {
  return hasRole(user, 'admin');
};

/**
 * Format error message from API response
 * @param {Error|Object} error - Error object or API response
 * @returns {string} Formatted error message
 */
export const formatAuthError = (error) => {
  if (!error) return 'An unexpected error occurred';
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  if (error.error) {
    return typeof error.error === 'string' ? error.error : 'An error occurred';
  }
  
  if (error.errors && typeof error.errors === 'object') {
    // Laravel validation errors
    const firstError = Object.values(error.errors)[0];
    return Array.isArray(firstError) ? firstError[0] : firstError;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Check if error is an authentication error
 * @param {Error|Object} error - Error to check
 * @returns {boolean} True if error is authentication-related
 */
export const isAuthError = (error) => {
  if (!error) return false;
  
  const message = error.message || error.error || '';
  const authErrors = ['unauthorized', 'unauthenticated', 'token', 'login', 'session'];
  
  return authErrors.some(authError => 
    message.toLowerCase().includes(authError)
  );
};








