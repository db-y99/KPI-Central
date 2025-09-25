import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JWTPayload {
  uid: string;
  email: string;
  role: 'admin' | 'employee';
  department?: string;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'kpi-central',
    audience: 'kpi-central-users'
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'kpi-central',
      audience: 'kpi-central-users'
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const tokenCookie = request.cookies.get('auth-token');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  // Try query parameter (for specific cases)
  const url = new URL(request.url);
  const tokenParam = url.searchParams.get('token');
  if (tokenParam) {
    return tokenParam;
  }

  return null;
}

export function validateToken(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
  try {
    const payload = verifyToken(token);
    if (!payload) {
      return { valid: false, error: 'Invalid token' };
    }

    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: 'Token validation failed' };
  }
}

export function requireAuth(role?: 'admin' | 'employee') {
  return function authMiddleware(request: NextRequest) {
    const token = extractTokenFromRequest(request);
    
    if (!token) {
      return { 
        success: false, 
        error: 'No authentication token provided',
        status: 401 
      };
    }

    const validation = validateToken(token);
    if (!validation.valid) {
      return { 
        success: false, 
        error: validation.error || 'Invalid token',
        status: 401 
      };
    }

    if (role && validation.payload?.role !== role) {
      return { 
        success: false, 
        error: `Access denied. Required role: ${role}`,
        status: 403 
      };
    }

    return { 
      success: true, 
      user: validation.payload 
    };
  };
}
