import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, JWTPayload } from '@/lib/jwt';

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

export function createRateLimit(config: RateLimitConfig) {
  return function rateLimitMiddleware(request: NextRequest) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Clean up expired entries
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }

    const key = `${ip}:${Math.floor(now / config.windowMs)}`;
    const current = rateLimitStore.get(key);

    if (!current) {
      rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
      return { success: true };
    }

    if (current.count >= config.maxRequests) {
      return {
        success: false,
        error: config.message || 'Too many requests',
        status: 429,
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      };
    }

    current.count++;
    return { success: true };
  };
}

// Default rate limits
export const defaultRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests, please try again later'
});

export const strictRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Rate limit exceeded for this endpoint'
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts'
});

// CORS configuration
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9001',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.firebase.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com;"
};

// API response wrapper
export function createApiResponse(
  data: any, 
  status: number = 200, 
  headers: Record<string, string> = {}
): NextResponse {
  const responseHeaders = {
    ...corsHeaders,
    ...securityHeaders,
    ...headers
  };

  return NextResponse.json(data, { 
    status, 
    headers: responseHeaders 
  });
}

export function createErrorResponse(
  error: string, 
  status: number = 400, 
  details?: any
): NextResponse {
  return createApiResponse({
    success: false,
    error,
    details,
    timestamp: new Date().toISOString()
  }, status);
}

export function createSuccessResponse(
  data: any, 
  message?: string, 
  status: number = 200
): NextResponse {
  return createApiResponse({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }, status);
}

// Middleware composer
export function withSecurity(
  handler: (request: NextRequest, user?: JWTPayload) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    requireRole?: 'admin' | 'employee';
    rateLimit?: ReturnType<typeof createRateLimit>;
  } = {}
) {
  return async function securedHandler(request: NextRequest): Promise<NextResponse> {
    try {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return createApiResponse({}, 200);
      }

      // Apply rate limiting
      if (options.rateLimit) {
        const rateLimitResult = options.rateLimit(request);
        if (!rateLimitResult.success) {
          return createErrorResponse(
            rateLimitResult.error || 'Rate limit exceeded',
            rateLimitResult.status || 429,
            { retryAfter: rateLimitResult.retryAfter }
          );
        }
      }

      // Apply authentication
      let user: JWTPayload | undefined;
      if (options.requireAuth) {
        const authMiddleware = requireAuth(options.requireRole);
        const authResult = authMiddleware(request);
        
        if (!authResult.success) {
          return createErrorResponse(
            authResult.error || 'Authentication required',
            authResult.status || 401
          );
        }
        
        user = authResult.user;
      }

      // Call the actual handler
      return await handler(request, user);
    } catch (error) {
      console.error('API Error:', error);
      return createErrorResponse(
        'Internal server error',
        500,
        process.env.NODE_ENV === 'development' ? error : undefined
      );
    }
  };
}

// Audit logging
export function logApiAccess(
  request: NextRequest, 
  user?: JWTPayload, 
  action?: string,
  details?: any
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent'),
    user: user ? {
      uid: user.uid,
      email: user.email,
      role: user.role
    } : null,
    action,
    details
  };

  // In production, send to logging service
  console.log('API Access:', JSON.stringify(logEntry, null, 2));
}
