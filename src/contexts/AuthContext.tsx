import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authLogin, authRegister, authMe } from '../utils/api';

type User = { id: string; username: string; email: string } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const me = await authMe();
      setUser(me);
      setLoading(false);
    })();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    await authLogin(emailOrUsername, password);
    const me = await authMe();
    setUser(me);
  };

  const register = async (username: string, email: string, password: string) => {
    await authRegister(username, email, password);
    const me = await authMe();
    setUser(me);
  };

  const logout = () => {
    localStorage.removeItem('cipherstudio_token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


