'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Employee } from '@/types';
import Loading from '@/app/loading';

interface AuthContextType {
  user: Employee | null;
  loading: boolean;
  login: (employeeId: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (typeof window !== 'undefined') {
        try {
          const storedUserId = localStorage.getItem('userId');
          if (storedUserId) {
            const q = query(collection(db, 'employees'), where('id', '==', storedUserId));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              // Note: The document ID from firestore is used, not the 'id' field from the document data
              setUser({ id: userDoc.id, ...userDoc.data() } as Employee);
            }
          }
        } catch (e) {
          console.error('Failed to access localStorage or Firestore:', e);
        } finally {
          setLoading(false);
        }
      }
    };
    checkUser();
  }, []);

  const login = async (employeeId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const q = query(collection(db, 'employees'), where('id', '==', employeeId.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const foundUser = querySnapshot.docs[0];
        const userData = { id: foundUser.id, ...foundUser.data() } as Employee
        setUser(userData);
        localStorage.setItem('userId', userData.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error: ", error);
      return false;
    } finally {
      setLoading(false);
    }
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
