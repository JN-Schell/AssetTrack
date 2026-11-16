import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, clearToken, setToken, setUnauthorizedHandler, getToken } from './api';
import type { SessionUser, TokenResponse, UserProfile } from './types';

interface AuthContextValue {
  user: SessionUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toSession(user: { id: string; email: string; full_name: string; role: string }): SessionUser {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    let cancelled = false;
    api<UserProfile>('/api/v1/auth/me')
      .then((profile) => {
        if (!cancelled) setUser(toSession(profile));
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      async login(email: string, password: string) {
        const body = new URLSearchParams();
        body.set('username', email.trim());
        body.set('password', password);
        const token = await api<TokenResponse>('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        });
        setToken(token.access_token);
        setUser(
          toSession({
            id: token.user_id,
            email: token.email,
            full_name: token.full_name,
            role: token.role,
          }),
        );
      },
      logout() {
        clearToken();
        setUser(null);
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
