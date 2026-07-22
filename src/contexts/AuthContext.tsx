import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { API_BASE_URL } from '../utils/constants';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('payload-token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `JWT ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('payload-token');
        }
      } catch (err) {
        console.warn('Session check failed', err);
      }
    };
    checkUserSession();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('payload-token');
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
