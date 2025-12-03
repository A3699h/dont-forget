import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import Header from '../Header';
import SiteFooter from '../SiteFooter';
import { useAuth, useAuthRedirect } from '../../hooks';
import { validateLogin, formatAuthError } from '../../utils/auth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Redirect if already authenticated
  useAuthRedirect();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form data
    const validation = validateLogin(formData);
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0]);
      return;
    }
    
    setLoading(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="login-container">
      <Header />
      <div className="login-card">
        <div className="login-header">
          <h1>Don't Forget</h1>
          <p>Welcome back!</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
            <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
          </div>
          
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="toggle-mode">
          <p>
            Don't have an account?
            <Link to="/signup" className="toggle-button">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
      <SiteFooter />
      </>
  );
};

export default Login;
