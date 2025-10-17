/**
 * Simplified Authentication Service
 * Handles both username/password and email/password authentication
 */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseAuthUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Employee } from '@/types';

export interface AuthUser extends Employee {
  firebaseUser?: FirebaseAuthUser;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
}

export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login with username/email and password
   */
  async login(emailOrUsername: string, password: string): Promise<LoginResult> {
    try {
      console.log('🔐 AuthService: Starting login for:', emailOrUsername);
      
      // Validate input
      if (!emailOrUsername || !password) {
        return { success: false, error: 'Vui lòng nhập đầy đủ thông tin.' };
      }
      
      if (password.length < 6) {
        return { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' };
      }

      // Try to find user in employees collection
      const user = await this.findUser(emailOrUsername);
      if (!user) {
        return { success: false, error: 'Tài khoản không tồn tại.' };
      }

      // Verify password
      if (user.password !== password) {
        return { success: false, error: 'Mật khẩu không đúng.' };
      }

      console.log('✅ AuthService: User found and password verified');

      // Handle Firebase Auth if needed
      let firebaseUser: FirebaseAuthUser | null = null;
      
      if (user.uid) {
        // User already has Firebase UID, try to sign in
        try {
          const userCredential = await signInWithEmailAndPassword(auth, user.email, password);
          firebaseUser = userCredential.user;
          console.log('✅ AuthService: Firebase Auth successful with existing UID');
        } catch (error) {
          console.log('⚠️ AuthService: Firebase Auth failed, continuing with username auth');
        }
      } else {
        // Create Firebase Auth user if email exists and UID is empty
        if (user.email && user.email.includes('@')) {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, user.email, password);
            firebaseUser = userCredential.user;
            
            // Update employee document with Firebase UID
            await updateDoc(doc(db, 'employees', user.id), {
              uid: firebaseUser.uid,
              updatedAt: new Date().toISOString()
            });
            
            user.uid = firebaseUser.uid;
            console.log('✅ AuthService: Created Firebase Auth user and updated document');
          } catch (error) {
            console.log('⚠️ AuthService: Failed to create Firebase Auth user:', error);
          }
        }
      }

      const authUser: AuthUser = {
        ...user,
        firebaseUser
      };

      console.log('✅ AuthService: Login successful for user:', user.username || user.email);
      return { success: true, user: authUser };

    } catch (error: any) {
      console.error('❌ AuthService: Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Đã xảy ra lỗi khi đăng nhập.' 
      };
    }
  }

  /**
   * Find user by username or email
   */
  private async findUser(emailOrUsername: string): Promise<Employee | null> {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (emailRegex.test(emailOrUsername)) {
        // Search by email
        const emailQuery = query(collection(db, 'employees'), where('email', '==', emailOrUsername));
        const emailSnapshot = await getDocs(emailQuery);
        
        if (!emailSnapshot.empty) {
          const doc = emailSnapshot.docs[0];
          return { ...doc.data(), id: doc.id } as Employee;
        }
      }
      
      // Search by username
      const usernameQuery = query(collection(db, 'employees'), where('username', '==', emailOrUsername));
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        const doc = usernameSnapshot.docs[0];
        return { ...doc.data(), id: doc.id } as Employee;
      }
      
      return null;
    } catch (error) {
      console.error('❌ AuthService: Error finding user:', error);
      return null;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Sign out from Firebase Auth if user is signed in
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      console.log('✅ AuthService: Logout successful');
    } catch (error) {
      console.error('❌ AuthService: Logout error:', error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<Employee>): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'employees', userId), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ AuthService: Profile updated successfully');
      return true;
    } catch (error) {
      console.error('❌ AuthService: Profile update error:', error);
      return false;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Get user document
      const userDoc = await getDoc(doc(db, 'employees', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      
      // Verify current password
      if (userData.password !== currentPassword) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password in Firestore
      await updateDoc(doc(db, 'employees', userId), {
        password: newPassword,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ AuthService: Password changed successfully');
      return true;
    } catch (error) {
      console.error('❌ AuthService: Password change error:', error);
      return false;
    }
  }

  /**
   * Check if user exists
   */
  async userExists(emailOrUsername: string): Promise<boolean> {
    const user = await this.findUser(emailOrUsername);
    return user !== null;
  }

  /**
   * Get current Firebase Auth user
   */
  getCurrentFirebaseUser(): FirebaseAuthUser | null {
    return auth.currentUser;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
