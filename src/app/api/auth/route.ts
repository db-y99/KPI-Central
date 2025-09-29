import { NextRequest } from 'next/server';
import { withSecurity, createSuccessResponse, createErrorResponse, defaultRateLimit, logApiAccess } from '@/lib/api-security';
import { generateToken } from '@/lib/jwt';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

// Authentication API
async function handleLogin(request: NextRequest) {
  try {
    logApiAccess(request, undefined, 'login-attempt');
    
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400);
    }

    // Query user from Firestore using employees collection
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return createErrorResponse('Invalid credentials', 401);
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Simple password validation - in production, use proper hashing
    if (userData.password !== password) {
      return createErrorResponse('Invalid credentials', 401);
    }

    // Check if user is active
    if (!userData.isActive) {
      return createErrorResponse('Account is deactivated', 401);
    }

    // Generate JWT token
    const token = generateToken({
      uid: userDoc.id,
      email: userData.email,
      role: userData.role,
      department: userData.department
    });

    // Update last login
    await updateDoc(doc(db, 'employees', userDoc.id), {
      lastLogin: new Date().toISOString()
    });

    logApiAccess(request, { uid: userDoc.id, email: userData.email, role: userData.role }, 'login-success');

    return createSuccessResponse({
      token,
      user: {
        uid: userDoc.id,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        name: userData.name
      }
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('Login failed', 500);
  }
}

async function handleLogout(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'logout');
    
    // In a real app, you would invalidate the token
    // For now, we'll just log the logout
    return createSuccessResponse({}, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return createErrorResponse('Logout failed', 500);
  }
}

async function handleRefreshToken(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'token-refresh');
    
    if (!user) {
      return createErrorResponse('User not authenticated', 401);
    }

    // Generate new token
    const newToken = generateToken({
      uid: user.uid,
      email: user.email,
      role: user.role,
      department: user.department
    });

    return createSuccessResponse({
      token: newToken
    }, 'Token refreshed successfully');

  } catch (error) {
    console.error('Token refresh error:', error);
    return createErrorResponse('Token refresh failed', 500);
  }
}

// Export handlers with security
export const POST = withSecurity(handleLogin, {
  requireAuth: false,
  rateLimit: defaultRateLimit
});

export const PUT = withSecurity(handleLogout, {
  requireAuth: true,
  rateLimit: defaultRateLimit
});

export const PATCH = withSecurity(handleRefreshToken, {
  requireAuth: true,
  rateLimit: defaultRateLimit
});
