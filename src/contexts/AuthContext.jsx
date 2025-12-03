import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { getToken } from '../utils/auth/token';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getUser();
        setUser(response.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Token might be invalid, clear it
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.getUser();
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

