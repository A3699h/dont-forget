import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook to redirect authenticated users away from auth pages (login/signup)
 * Redirects to dashboard if user is already authenticated
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.redirectTo - Path to redirect if authenticated (default: '/dashboard')
 * @param {boolean} options.waitForAuth - Wait for auth check to complete (default: true)
 * 
 * @example
 * function LoginPage() {
 *   useAuthRedirect(); // Will redirect to /dashboard if already logged in
 *   return <LoginForm />;
 * }
 */
export const useAuthRedirect = (options = {}) => {
  const { redirectTo = '/dashboard', waitForAuth = true } = options;
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth check to complete if waitForAuth is true
    if (waitForAuth && loading) {
      return;
    }

    // Redirect if authenticated
    if (isAuthenticated && !loading) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, redirectTo, waitForAuth]);
};








