import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header';
import SiteFooter from '../SiteFooter';
import { api } from '../../utils/api';
import './Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.forgotPassword(email);
      setSuccess(response.message || 'If that email address exists in our system, we have emailed a password reset link.');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
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
            <h1>Reset your password</h1>
            <p>Enter your email to get a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                  if (success) setSuccess('');
                }}
                required
                placeholder="Enter your email"
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
              {loading ? 'Sending link...' : 'Send reset link'}
            </button>
          </form>

          <div className="toggle-mode">
            <p>
              Remembered your password?
              <Link to="/login" className="toggle-button">Back to login</Link>
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
};

export default ForgotPassword;







