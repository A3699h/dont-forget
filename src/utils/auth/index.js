/**
 * Authentication utilities barrel export
 * Centralized export for all authentication utilities
 */

// Token management
export {
  getToken,
  setToken,
  removeToken,
  hasToken,
  clearAuthData,
} from './token';

// Validation utilities
export {
  isValidEmail,
  validatePassword,
  isValidPhoneNumber,
  validateRegistration,
  validateLogin,
} from './validation';

// Helper utilities
export {
  isAuthenticated,
  getUserDisplayName,
  getUserInitials,
  hasRole,
  isAdmin,
  formatAuthError,
  isAuthError,
} from './helpers';








