import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('payload-token');
      if (!token) return;
      try {
        // Need to figure out API_BASE_URL. In Directory.tsx it was imported from constants or just a variable.
        // For now I'll use a relative path if it's the same domain, or we'll inject it.
        // Wait, Directory.tsx has const API_BASE_URL = 'http://localhost:3000';
        const API_BASE_URL = 'http://localhost:3000'; // Hardcoding for now based on Directory.tsx
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
