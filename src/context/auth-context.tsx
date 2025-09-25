'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseAuthUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth as firebaseAuth } from '@/lib/firebase';
import type { Employee } from '@/types';

interface LoginResult {
  success: boolean;
  error?: string;
  user?: Employee;
}

interface AuthContextType {
  user: Employee | null;
  firebaseUser: FirebaseAuthUser | null;
  loading: boolean;
  isLoggingIn: boolean;
  login: (email: string, pass: string) => Promise<LoginResult>;
  logout: () => void;
  updateUser: (updates: Partial<Employee>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  isLoggingIn: false,
  login: async () => ({ success: false, error: 'Context not ready' }),
  logout: () => {},
  updateUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Debug user state changes
  useEffect(() => {
    console.log('🔄 User state changed:', user);
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      console.log('🔄 onAuthStateChanged triggered:', fbUser?.uid, 'isLoggingIn:', isLoggingIn);
      
      // Skip onAuthStateChanged if we're in the middle of logging in
      if (isLoggingIn) {
        console.log('⏸️ Skipping onAuthStateChanged during login process');
        return;
      }
      
      setFirebaseUser(fbUser);
      if (fbUser) {
        setLoading(true);
        try {
          // User is signed in, get their profile from Firestore
          const userDocRef = doc(db, 'employees', fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            // IMPORTANT: Add the uid to the user object from firestore data
            const userData = { ...userDoc.data(), uid: fbUser.uid } as Employee;
            console.log('📖 User found in Firestore via onAuthStateChanged:', userData);
            setUser(userData);
          } else {
            // This case might happen if a user exists in Auth but not Firestore.
            // For this app, we treat them as not logged in.
            console.log('❌ User not found in Firestore, signing out...');
            setUser(null);
            await signOut(firebaseAuth); // Sign out the invalid user
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        // User is signed out
        console.log('👋 User signed out');
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [isLoggingIn]);

  const login = async (email: string, pass: string): Promise<LoginResult> => {
    console.log('🔐 Starting login process for:', email);
    setIsLoggingIn(true);
    
    try {
      // Validate email format before attempting login
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('❌ Invalid email format');
        return { success: false, error: 'Email không hợp lệ.' };
      }

      // Validate password length
      if (pass.length < 6) {
        console.log('❌ Password too short');
        return { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' };
      }

      console.log('✅ Validation passed, attempting Firebase Auth...');
      
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, pass);
      const fbUser = userCredential.user;
      console.log('✅ Firebase Auth successful, UID:', fbUser.uid);
      
      // Create user object - check if admin
      let userData: Employee;
      
      try {
        console.log('🔍 Checking Firestore for user...');
        // Try to get user from Firestore
        const userDocRef = doc(db, 'employees', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          console.log('✅ User found in Firestore');
          userData = { ...userDoc.data(), uid: fbUser.uid } as Employee;
        } else {
          console.log('⚠️ User not in Firestore, creating new profile...');
          // If user not in Firestore, create default admin user for db@y99.vn
          if (email === 'db@y99.vn') {
            userData = {
              id: 'admin-1',
              uid: fbUser.uid,
              email: email,
              username: 'admin',
              name: 'Administrator',
              position: 'System Admin',
              departmentId: 'admin',
              avatar: '/avatars/admin.jpg',
              role: 'admin' as const,
              startDate: new Date().toISOString(),
              employeeId: 'EMP001',
              isActive: true,
              phone: '',
              address: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            console.log('👑 Created admin user:', userData);
            
            // Save admin user to Firestore
            try {
              console.log('💾 Saving admin user to Firestore...');
              await setDoc(doc(db, 'employees', fbUser.uid), userData);
              console.log('✅ Admin user saved to Firestore successfully');
              
              // Small delay to ensure Firestore write is complete
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (saveError) {
              console.warn('⚠️ Failed to save admin user to Firestore:', saveError);
            }
          } else {
            // For other users, create employee profile
            userData = {
              id: `emp-${fbUser.uid.slice(0, 8)}`,
              uid: fbUser.uid,
              email: email,
              username: email.split('@')[0],
              name: 'Employee',
              position: 'Staff',
              departmentId: 'general',
              avatar: '/avatars/default.jpg',
              role: 'employee' as const,
              startDate: new Date().toISOString(),
              employeeId: `EMP${fbUser.uid.slice(0, 6).toUpperCase()}`,
              isActive: true,
              phone: '',
              address: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            console.log('👤 Created employee user:', userData);
            
            // Save employee user to Firestore
            try {
              console.log('💾 Saving employee user to Firestore...');
              await setDoc(doc(db, 'employees', fbUser.uid), userData);
              console.log('✅ Employee user saved to Firestore successfully');
              
              // Small delay to ensure Firestore write is complete
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (saveError) {
              console.warn('⚠️ Failed to save employee user to Firestore:', saveError);
            }
          }
        }
      } catch (firestoreError) {
        console.warn('⚠️ Firestore error, using default user:', firestoreError);
        // Fallback: create user based on email
        userData = {
          id: email === 'db@y99.vn' ? 'admin-1' : `emp-${fbUser.uid.slice(0, 8)}`,
          uid: fbUser.uid,
          email: email,
          username: email.split('@')[0],
          name: email === 'db@y99.vn' ? 'Administrator' : 'Employee',
          position: email === 'db@y99.vn' ? 'System Admin' : 'Staff',
          departmentId: email === 'db@y99.vn' ? 'admin' : 'general',
          avatar: '/avatars/default.jpg',
          role: email === 'db@y99.vn' ? 'admin' as const : 'employee' as const,
          startDate: new Date().toISOString(),
          employeeId: email === 'db@y99.vn' ? 'EMP001' : `EMP${fbUser.uid.slice(0, 6).toUpperCase()}`,
          isActive: true,
          phone: '',
          address: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.log('🔄 Using fallback user:', userData);
      }
      
      console.log('📝 Setting user state...');
      // Set user state immediately
      setUser(userData);
      setFirebaseUser(fbUser);
      setIsLoggingIn(false);
      
      console.log('✅ User state set - user:', userData);
      console.log('✅ Login process completed successfully');
      return { success: true, user: userData };
    } catch (error: any) {
      console.error("❌ Login error:", error);
      let errorMessage = 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Không tìm thấy tài khoản với email này.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mật khẩu không chính xác.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Email hoặc mật khẩu không chính xác.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Quá nhiều lần thử không thành công. Vui lòng thử lại sau 15 phút.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Tài khoản này đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Phương thức đăng nhập này không được phép.';
          break;
        default:
          errorMessage = 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.';
      }
      
      setIsLoggingIn(false);
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

  const updateUser = async (updates: Partial<Employee>) => {
    if (!user || !firebaseUser) {
      throw new Error('No user logged in');
    }

    try {
      // Update user document in Firestore
      const userDocRef = doc(db, 'employees', firebaseUser.uid);
      
      // Filter out undefined values to prevent Firebase errors
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );
      
      await setDoc(userDocRef, filteredUpdates, { merge: true });
      
      // Update local user state
      setUser({ ...user, ...filteredUpdates });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };
  
  // The provider now simply provides the context value without rendering a loading screen itself.
  // The consuming components will decide what to render based on the loading state.
  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, isLoggingIn, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
