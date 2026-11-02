import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { getErrorMessage } from '../lib/api.js';

export default function RegisterPage() {
  const { register, status } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={location.state?.from?.pathname || '/booking'} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({ username: username.trim(), email: email.trim(), password });
      navigate('/login?registered=1', { replace: true });
    } catch (registrationError) {
      setError(getErrorMessage(registrationError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow"><span className="eyebrow-line" /> MAKE YOURSELF AT HOME</p>
        <h1>A fresh <em>start.</em></h1>
        <p className="auth-intro">Create a patron account and keep your next good read close.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Username</span>
            <input
              autoComplete="username"
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <small>3–30 letters, numbers, or underscores.</small>
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <small>At least 8 characters.</small>
          </label>
          <button className="button button-dark auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'} <span aria-hidden="true">→</span>
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        <Link className="auth-back" to="/">← Back to the collection</Link>
      </div>
    </section>
  );
}
