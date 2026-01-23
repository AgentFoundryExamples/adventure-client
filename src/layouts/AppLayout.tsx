import { Outlet, Link } from 'react-router-dom';
import AccountMenu from '@/components/AccountMenu';
import { config } from '@/config/env';

export default function AppLayout() {
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
        <AccountMenu />
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
