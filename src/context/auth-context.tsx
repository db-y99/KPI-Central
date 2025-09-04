'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Employee } from '@/types';
import { employees } from '@/lib/data';
import Loading from '@/app/loading';

interface AuthContextType {
  user: Employee | null;
  loading: boolean;
  login: (employeeId: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        const foundUser = employees.find(e => e.id === storedUserId);
        if (foundUser) {
          setUser(foundUser);
        }
      }
    } catch (e) {
      console.error('Failed to access localStorage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (employeeId: string): boolean => {
    const foundUser = employees.find(e => e.id === employeeId.toLowerCase());
    if (foundUser) {
      try {
        localStorage.setItem('userId', foundUser.id);
      } catch (e) {
        console.error('Failed to access localStorage:', e);
      }
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    try {
      localStorage.removeItem('userId');
    } catch (e) {
      console.error('Failed to access localStorage:', e);
    }
    setUser(null);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
