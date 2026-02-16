import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div style={{ padding: '0 1rem 1rem', fontWeight: 600 }}>Mini Learning</div>
        <nav>
          <NavLink to="/dashboard" end>Dashboard</NavLink>
          <NavLink to="/history">Learning History</NavLink>
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>{user?.email}</span>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ display: 'block', marginTop: '0.5rem', width: '100%' }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
