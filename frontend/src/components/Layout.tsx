import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`layout ${menuOpen ? 'menu-open' : ''}`}>
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
      >
        <span className="mobile-menu-icon" />
      </button>
      {menuOpen && (
        <div className="sidebar-overlay" onClick={closeMenu} aria-hidden="true" />
      )}
      <aside className="sidebar">
        <button type="button" className="sidebar-close" onClick={closeMenu} aria-label="Close menu">
          ×
        </button>
        <div className="sidebar-brand-wrap">
          <div className="sidebar-brand">Mini AI Learning</div>
          {user?.name && <div className="sidebar-greeting">Hi, {user.name}</div>}
        </div>
        <nav className="sidebar-nav" onClick={closeMenu}>
          <NavLink to="/dashboard" end>New Lesson</NavLink>
          <NavLink to="/history">Learning History</NavLink>
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-name">{user?.name ?? user?.email ?? '—'}</span>
            <span className="sidebar-user-phone">{user?.phone ?? user?.email ?? ''}</span>
          </div>
          <button type="button" className="btn sidebar-logout" onClick={handleLogout}>
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
