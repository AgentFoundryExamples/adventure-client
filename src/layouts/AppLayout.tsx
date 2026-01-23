import { Outlet, Link } from 'react-router-dom';
import AccountMenu from '@/components/AccountMenu';
import { useAuth } from '@/hooks/useAuth';
import { config } from '@/config/env';

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <header className="app-header">
        <nav>
          <Link to="/">Home</Link>
          <Link to="/app">App</Link>
          <Link to="/login">Login</Link>
          {config.isDevelopment && (
            <Link to="/debug" className="debug-link">
              🔧 Debug
            </Link>
          )}
        </nav>
        <div className="header-actions">
          {user && (
            <Link to="/characters/new" className="new-character-button">
              + New Character
            </Link>
          )}
          <AccountMenu />
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
