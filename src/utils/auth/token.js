/**
 * Token management utilities
 * Handles storage and retrieval of authentication tokens
 */

const TOKEN_KEY = 'auth_token';

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Set the authentication token in localStorage
 * @param {string} token - The authentication token to store
 * @returns {boolean} True if successful, false otherwise
 */
export const setToken = (token) => {
  try {
    if (!token) {
      console.warn('Attempted to set empty token');
      return false;
    }
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error setting token:', error);
    return false;
  }
};

/**
 * Remove the authentication token from localStorage
 * @returns {boolean} True if successful, false otherwise
 */
export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

/**
 * Check if a token exists
 * @returns {boolean} True if token exists, false otherwise
 */
export const hasToken = () => {
  return !!getToken();
};

/**
 * Clear all authentication-related data
 * @returns {boolean} True if successful
 */
export const clearAuthData = () => {
  return removeToken();
};








