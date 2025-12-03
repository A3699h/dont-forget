/**
 * Authentication utility functions
 * @deprecated Use './auth' (directory) instead for better organization
 * This file is kept for backward compatibility
 * Re-exports from the auth directory index
 */

export {
  getToken,
  setToken,
  removeToken,
  hasToken,
  clearAuthData,
  isValidEmail,
  validatePassword,
  isValidPhoneNumber,
  validateRegistration,
  validateLogin,
  isAuthenticated,
  getUserDisplayName,
  getUserInitials,
  hasRole,
  isAdmin,
  formatAuthError,
  isAuthError,
} from './auth/index';

