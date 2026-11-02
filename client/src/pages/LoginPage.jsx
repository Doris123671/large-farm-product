import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { getErrorMessage } from '../lib/api.js';

export default function LoginPage() {
  const { login, status } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState('');
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
      await login({ identifier: identifier.trim(), password });
      navigate(location.state?.from || '/booking', { replace: true });
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow"><span className="eyebrow-line" /> GOOD TO SEE YOU</p>
        <h1>Welcome <em>back.</em></h1>
        <p className="auth-intro">Sign in to keep your reading list close and plan your next visit.</p>
        {searchParams.get('registered') === '1' && (
          <p className="form-success" role="status">Your account is ready. Sign in to continue.</p>
        )}
        {error && <p className="form-error" role="alert">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email or username</span>
            <input
              autoComplete="username"
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="button button-dark auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'} <span aria-hidden="true">→</span>
          </button>
        </form>
        <p className="auth-switch">New to Fieldnotes? <Link to="/register">Create an account</Link></p>
        <Link className="auth-back" to="/">← Back to the collection</Link>
      </div>
    </section>
  );
}
