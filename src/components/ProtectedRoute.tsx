import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, error } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login, preserving the intended destination and error context
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: error?.message || 'Please log in to continue',
          reason: error?.reason
        }}
      />
    );
  }

  return <>{children}</>;
}
