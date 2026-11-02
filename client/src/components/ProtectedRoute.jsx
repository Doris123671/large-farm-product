import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();
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

  return children;
}
