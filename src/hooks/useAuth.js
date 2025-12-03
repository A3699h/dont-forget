import { useCallback } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';

/**
 * Custom hook for authentication
 * Provides authentication state and methods
 * 
 * @returns {Object} Authentication state and methods
 * @example
 * const { user, isAuthenticated, loading, login, register, logout } = useAuth();
 */
export const useAuth = () => {
  const authContext = useAuthContext();

  /**
   * Login with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Result object with success status and data/error
   */
  const login = useCallback(async (credentials) => {
    return await authContext.login(credentials);
  }, [authContext]);

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Result object with success status and data/error
   */
  const register = useCallback(async (userData) => {
    return await authContext.register(userData);
  }, [authContext]);

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    return await authContext.logout();
  }, [authContext]);

  return {
    // State
    user: authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    loading: authContext.loading,
    
    // Methods
    login,
    register,
    logout,
    
    // Helper methods
    isAdmin: authContext.user?.role === 'admin',
    isUser: authContext.user?.id !== undefined,
  };
};








