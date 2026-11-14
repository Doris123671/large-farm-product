import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

export default function ProtectedRoute({ children, requiredRole }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="detail-state" role="status">
        <span className="loading-spinner" />
        <h1>Checking your account...</h1>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <section className="detail-state" role="alert">
        <h1>This page is for library staff.</h1>
        <p>Your account does not have permission to view this page.</p>
      </section>
    );
  }

  return children;
}
