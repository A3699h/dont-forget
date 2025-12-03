import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook to protect routes that require authentication
 * Redirects to login if user is not authenticated
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.redirectTo - Path to redirect if not authenticated (default: '/login')
 * @param {boolean} options.waitForAuth - Wait for auth check to complete before redirecting (default: true)
 * @returns {Object} Authentication state
 * 
 * @example
 * function ProtectedComponent() {
 *   const { user, loading } = useRequireAuth();
 *   
 *   if (loading) return <Loading />;
 *   return <div>Protected content for {user.email}</div>;
 * }
 */
export const useRequireAuth = (options = {}) => {
  const { redirectTo = '/login', waitForAuth = true } = options;
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth check to complete if waitForAuth is true
    if (waitForAuth && loading) {
      return;
    }

    // Redirect if not authenticated
    if (!isAuthenticated && !loading) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, redirectTo, waitForAuth]);

  return {
    user,
    isAuthenticated,
    loading,
    // Only return user if authenticated to prevent rendering protected content
    authenticatedUser: isAuthenticated ? user : null,
  };
};








