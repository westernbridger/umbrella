import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from './api';

interface AuthContextProps {
  token: string | null;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string; user?: any }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    if (!token) return;
    localStorage.setItem('token', token);
    if (!user) {
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setUser(data.user))
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
        });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Login failed');
    }
    setToken(data.token);
    setUser(data.user);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
