import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { fetchJson } from '../lib/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const refreshUser = useCallback(async () => {
    setStatus('loading');
    try {
      const profile = await fetchJson('/api/users/profile');
      setUser(profile);
      setStatus('authenticated');
      return profile;
    } catch (error) {
      setUser(null);
      setStatus(error.message === 'Authentication required.' ? 'unauthenticated' : 'error');
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    const result = await fetchJson('/api/auth/login', {
      method: 'POST',
      body: credentials,
    });
    if (!result.user) throw new Error('Login succeeded, but the API did not return a user profile.');
    setUser(result.user);
    setStatus('authenticated');
    return result.user;
  }, []);

  const register = useCallback((details) => fetchJson('/api/auth/register', {
    method: 'POST',
    body: details,
  }), []);

  const logout = useCallback(async () => {
    await fetchJson('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({ user, status, login, register, logout, refreshUser }),
    [user, status, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
