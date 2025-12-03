import { Navigate } from 'react-router-dom';
import { useRequireAuth } from '../hooks/useRequireAuth';

/**
 * Protected Route Component
 * Wraps routes that require authentication
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.redirectTo - Path to redirect if not authenticated (default: '/login')
 * @param {React.ReactNode} props.fallback - Component to show while checking auth (optional)
 * @returns {React.ReactNode} Protected content or redirect
 * 
 * @example
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 */
const ProtectedRoute = ({ children, redirectTo = '/login', fallback = null }) => {
  const { isAuthenticated, loading, authenticatedUser } = useRequireAuth({ redirectTo });

  // Show loading state while checking authentication
  if (loading) {
    return fallback || (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // Redirect if not authenticated (useRequireAuth handles this, but we check here too)
  if (!isAuthenticated || !authenticatedUser) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;

