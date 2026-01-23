import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ErrorNotice } from '@/components';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, error } = useAuth();
  const location = useLocation();
  const [showError, setShowError] = useState(false);

  // Show error briefly before redirecting
  useEffect(() => {
    if (error && !loading && !user) {
      // Intentionally setting state in effect: this is a synchronous initialization from
      // auth context state changes, used to show a brief error message before redirect
      /* eslint-disable react-hooks/set-state-in-effect */
      setShowError(true);
      /* eslint-enable react-hooks/set-state-in-effect */
      const timer = setTimeout(() => {
        setShowError(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, loading, user]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    // If there's an auth error, show it briefly before redirecting
    if (showError && error) {
      return (
        <div className="protected-route-error">
          <ErrorNotice
            title="Authentication Required"
            message={error.message || 'Please log in to access this page'}
            severity="error"
            variant="inline"
          />
        </div>
      );
    }

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
