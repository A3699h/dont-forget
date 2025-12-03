import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Header from '../Header';
import SiteFooter from '../SiteFooter';
import { api } from '../../utils/api';
import './Login.css';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token') || '';
    const emailParam = params.get('email') || '';
    setToken(tokenParam);
    setEmail(emailParam);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !token) {
      setError('The reset link is invalid. Please request a new one.');
      return;
    }

    if (!password || !passwordConfirmation) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(response.message || 'Password has been reset successfully.');

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may be invalid or expired.');
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
            <h1>Set a new password</h1>
            <p>Choose a strong password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="password">New password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirmation">Confirm new password</label>
              <input
                type="password"
                id="passwordConfirmation"
                name="passwordConfirmation"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </div>

            {error && (
              <div className="error-message" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            {success && (
              <div className="success-message" style={{ color: 'green', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {success}
              </div>
            )}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Updating password...' : 'Reset password'}
            </button>
          </form>

          <div className="toggle-mode">
            <p>
              Back to
              <Link to="/login" className="toggle-button">Login</Link>
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
};

export default ResetPassword;







