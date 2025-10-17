'use client';

import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { authService, type AuthUser } from '@/lib/auth-service';
import type { Employee } from '@/types';

interface LoginResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isLoggingIn: boolean;
  login: (emailOrUsername: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<Employee>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoggingIn: false,
  login: async () => ({ success: false, error: 'Context not ready' }),
  logout: async () => {},
  updateUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Debug user state changes
  useEffect(() => {
    console.log('🔄 AuthContext: User state changed:', user);
  }, [user]);

  // Initialize user from localStorage on mount (before Firebase Auth listener)
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const storedUser = localStorage.getItem('kpi_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser) as AuthUser;
          // Verify the stored user still exists in Firestore
          const { doc, getDoc } = await import('firebase/firestore');
          const userDoc = await getDoc(doc(db, 'employees', userData.id));
          if (userDoc.exists()) {
            setUser(userData);
            console.log('✅ AuthContext: User initialized from localStorage');
          } else {
            localStorage.removeItem('kpi_user');
            console.log('❌ AuthContext: Stored user no longer exists in Firestore');
          }
        }
      } catch (error) {
        console.error('❌ AuthContext: Error initializing user from localStorage:', error);
        localStorage.removeItem('kpi_user');
      }
    };

    initializeUser();
  }, []);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    console.log('🔍 AuthContext: Setting up Firebase Auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 AuthContext: Firebase Auth state changed:', firebaseUser?.uid || 'null');
      
      if (firebaseUser) {
        // Try to find user in employees collection
        try {
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const emailQuery = query(collection(db, 'employees'), where('email', '==', firebaseUser.email));
          const emailSnapshot = await getDocs(emailQuery);
          
          if (!emailSnapshot.empty) {
            const userDoc = emailSnapshot.docs[0];
            const userData = { ...userDoc.data(), id: userDoc.id } as AuthUser;
            userData.firebaseUser = firebaseUser;
            setUser(userData);
            // Update localStorage with Firebase user data
            localStorage.setItem('kpi_user', JSON.stringify(userData));
            console.log('✅ AuthContext: User found via Firebase Auth');
          } else {
            // If Firebase user exists but not found in employees collection,
            // keep existing user from localStorage if available
            const storedUser = localStorage.getItem('kpi_user');
            if (!storedUser) {
              setUser(null);
              console.log('❌ AuthContext: User not found in employees collection');
            } else {
              console.log('⚠️ AuthContext: Firebase user not in employees, keeping stored user');
            }
          }
        } catch (error) {
          console.error('❌ AuthContext: Error finding user:', error);
          // Don't clear user on error, keep existing state
        }
      } else {
        // When Firebase user is null, only clear user if we don't have a stored user
        // This handles the case where user logged in with username/password (no Firebase Auth)
        const storedUser = localStorage.getItem('kpi_user');
        if (!storedUser) {
          setUser(null);
          console.log('👋 AuthContext: User signed out');
        } else {
          console.log('⚠️ AuthContext: Firebase user null but stored user exists, keeping stored user');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (emailOrUsername: string, password: string): Promise<LoginResult> => {
    console.log('🔐 AuthContext: Starting login for:', emailOrUsername);
    setIsLoggingIn(true);
    
    try {
      const result = await authService.login(emailOrUsername, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        // Store user in localStorage for persistence across page refreshes
        localStorage.setItem('kpi_user', JSON.stringify(result.user));
        console.log('✅ AuthContext: Login successful, user set:', result.user.username || result.user.email);
      } else {
        console.log('❌ AuthContext: Login failed:', result.error);
      }
      
      setIsLoggingIn(false);
      return result;
    } catch (error: any) {
      console.error('❌ AuthContext: Login error:', error);
      setIsLoggingIn(false);
      return { 
        success: false, 
        error: error.message || 'Đã xảy ra lỗi khi đăng nhập.' 
      };
    }
  };

  const logout = async (): Promise<void> => {
    console.log('👋 AuthContext: Logging out...');
    try {
      await authService.logout();
      setUser(null);
      // Remove user from localStorage
      localStorage.removeItem('kpi_user');
      console.log('✅ AuthContext: Logout successful');
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
    }
  };

  const updateUser = async (updates: Partial<Employee>): Promise<void> => {
    if (!user) {
      console.error('❌ AuthContext: Cannot update user - no user logged in');
      return;
    }
    
    try {
      const success = await authService.updateProfile(user.id, updates);
      if (success) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        // Update localStorage with updated user data
        localStorage.setItem('kpi_user', JSON.stringify(updatedUser));
        console.log('✅ AuthContext: User updated successfully');
      } else {
        console.error('❌ AuthContext: Failed to update user');
      }
    } catch (error) {
      console.error('❌ AuthContext: Update user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isLoggingIn,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
