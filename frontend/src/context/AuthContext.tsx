import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  loginAs: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const DEFAULT_USERS: Record<UserRole, { email: string; pass: string; name: string }> = {
  ADMIN: {
    email: 'admin@assettrack.io',
    pass: 'Admin123!Secure',
    name: 'Sarah Connor (CIO)',
  },
  ASSET_MANAGER: {
    email: 'manager@assettrack.io',
    pass: 'Manager123!Secure',
    name: 'Marcus Vance (Asset Mgr)',
  },
  TECHNICIAN: {
    email: 'technician@assettrack.io',
    pass: 'Tech123!Secure',
    name: 'Elena Rostova (Lead Tech)',
  },
  READ_ONLY: {
    email: 'auditor@assettrack.io',
    pass: 'Auditor123!Secure',
    name: 'David Chen (Auditor)',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('assettrack_theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('assettrack_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const loginAs = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const creds = DEFAULT_USERS[targetRole];
      const authData = await api.login(creds.email, creds.pass);
      setUser({
        id: authData.user_id,
        email: authData.email,
        full_name: authData.full_name,
        role: authData.role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setRole(authData.role);
    } catch (err) {
      console.warn('API login failed, using simulated session for demonstration:', err);
      // Fallback demo user if backend is booting or demo mode
      setUser({
        id: `mock-${targetRole.toLowerCase()}`,
        email: DEFAULT_USERS[targetRole].email,
        full_name: DEFAULT_USERS[targetRole].name,
        role: targetRole,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setRole(targetRole);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial auto-login as ADMIN for portfolio evaluation
    loginAs('ADMIN');
  }, []);

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoading,
        theme,
        toggleTheme,
        loginAs,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
