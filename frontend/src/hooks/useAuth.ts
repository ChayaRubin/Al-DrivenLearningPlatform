import { useState, useCallback } from 'react';
import type { User } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const setUserAndStorage = useCallback((u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem('user', JSON.stringify(u));
    else localStorage.removeItem('user');
  }, []);

  const setToken = useCallback((token: string | null) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, [setToken]);

  const isAdmin = user?.role === 'ADMIN';

  return { user, setUser: setUserAndStorage, setToken, logout, isAdmin };
}
