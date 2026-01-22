import { Outlet, Link } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <nav>
          <Link to="/">Home</Link>
          <Link to="/app">App</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
