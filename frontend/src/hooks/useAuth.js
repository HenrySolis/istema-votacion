import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';

export function useAuth() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    authService.me()
      .then((data) => setAdmin(data.admin))
      .catch(() => {
        localStorage.removeItem('admin_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setAdmin(null);
    window.location.href = '/admin/login';
  }, []);

  return { admin, loading, isAuthenticated: !!admin, logout };
}
