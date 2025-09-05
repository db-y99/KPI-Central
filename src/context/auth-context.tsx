'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseAuthUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth as firebaseAuth } from '@/lib/firebase';
import type { Employee } from '@/types';
import Loading from '@/app/loading';

interface LoginResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: Employee | null;
  firebaseUser: FirebaseAuthUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<LoginResult>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  login: async () => ({ success: false, error: 'Context not ready' }),
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // User is signed in, get their profile from Firestore
        const userDocRef = doc(db, 'employees', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          // IMPORTANT: Add the uid to the user object from firestore data
          setUser({ ...userDoc.data(), uid: fbUser.uid } as Employee);
        } else {
          // This case might happen if a user exists in Auth but not Firestore.
          // For this app, we treat them as not logged in.
          setUser(null);
           await signOut(firebaseAuth); // Sign out the invalid user
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<LoginResult> => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, pass);
      // onAuthStateChanged will handle setting the user state and loading state
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = 'Email hoặc mật khẩu không hợp lệ.';
       if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
         errorMessage = 'Email hoặc mật khẩu không chính xác.';
       } else if (error.code === 'auth/too-many-requests') {
           errorMessage = 'Quá nhiều lần thử không thành công. Vui lòng thử lại sau.';
       }
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(firebaseAuth);
      // onAuthStateChanged will handle cleanup and set user to null
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // We show a loading screen while the initial auth state is being determined.
  if (loading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
