import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-panel-brand">
          <div className="auth-brand-accent" aria-hidden />
          <h2 className="auth-brand-headline">Start learning</h2>
          <p className="auth-brand-tagline">with Mini Learning</p>
          <p className="auth-brand-desc">
            Pick a topic, ask a question, and get a short lesson generated just for you—no signup hassle, just name and phone.
          </p>
        </div>
        <div className="auth-panel-form">
          <nav className="auth-tabs" aria-label="Auth mode">
            <Link
              to="/login"
              className={`auth-tab ${isLogin ? 'auth-tab--active' : ''}`}
            >
              Log in
            </Link>
            <Link
              to="/register"
              className={`auth-tab ${!isLogin ? 'auth-tab--active' : ''}`}
            >
              Register
            </Link>
          </nav>
          <div className="auth-card-inner">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
