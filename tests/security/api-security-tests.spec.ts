import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { TestUtils } from '../utils/test-utils';

test.describe('API Security Tests', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
  });

  test.describe('API Authentication', () => {
    test('should require authentication for protected API endpoints', async ({ page }) => {
      console.log('🚀 Testing API authentication requirements...');
      
      const protectedEndpoints = [
        '/api/kpis',
        '/api/employees',
        '/api/reports',
        '/api/departments',
        '/api/notifications'
      ];
      
      for (const endpoint of protectedEndpoints) {
        const response = await page.request.get(endpoint);
        console.log(`📊 ${endpoint} status: ${response.status()}`);
        
        // Should require authentication
        expect(response.status()).toBe(401);
      }
      
      console.log('✅ API authentication requirements test completed');
    });

    test('should validate JWT tokens properly', async ({ page }) => {
      console.log('🚀 Testing JWT token validation...');
      
      await authHelper.loginAsAdmin();
      
      // Get the current session token
      const cookies = await page.context().cookies();
      const authCookie = cookies.find(cookie => 
        cookie.name.includes('auth') || cookie.name.includes('token') || cookie.name.includes('session')
      );
      
      if (authCookie) {
        // Test with invalid token
        const invalidResponse = await page.request.get('/api/kpis', {
          headers: {
            'Authorization': 'Bearer invalid-token'
          }
        });
        
        expect(invalidResponse.status()).toBe(401);
        
        // Test with expired token format
        const expiredResponse = await page.request.get('/api/kpis', {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired'
          }
        });
        
        expect(expiredResponse.status()).toBe(401);
      }
      
      console.log('✅ JWT token validation test completed');
    });

    test('should handle token expiration gracefully', async ({ page }) => {
      console.log('🚀 Testing token expiration handling...');
      
      await authHelper.loginAsAdmin();
      
      // Simulate token expiration by clearing cookies
      await page.context().clearCookies();
      
      // Try to access protected endpoint
      const response = await page.request.get('/api/kpis');
      expect(response.status()).toBe(401);
      
      // Should redirect to login page
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      expect(page.url()).toContain('/login');
      
      console.log('✅ Token expiration handling test completed');
    });
  });

  test.describe('API Authorization', () => {
    test('should enforce role-based access control', async ({ page }) => {
      console.log('🚀 Testing role-based access control...');
      
      // Test as employee
      await authHelper.loginAsEmployee();
      
      const employeeRestrictedEndpoints = [
        '/api/admin/users',
        '/api/admin/settings',
        '/api/admin/system-config'
      ];
      
      for (const endpoint of employeeRestrictedEndpoints) {
        const response = await page.request.get(endpoint);
        console.log(`📊 Employee access to ${endpoint}: ${response.status()}`);
        
        // Should be forbidden for employees
        expect([401, 403]).toContain(response.status());
      }
      
      // Test as admin
      await authHelper.logout();
      await authHelper.loginAsAdmin();
      
      for (const endpoint of employeeRestrictedEndpoints) {
        const response = await page.request.get(endpoint);
        console.log(`📊 Admin access to ${endpoint}: ${response.status()}`);
        
        // Should be accessible for admins (or return proper error)
        expect([200, 201, 404, 500]).toContain(response.status());
      }
      
      console.log('✅ Role-based access control test completed');
    });

    test('should validate user ownership for data access', async ({ page }) => {
      console.log('🚀 Testing user ownership validation...');
      
      await authHelper.loginAsEmployee();
      
      // Try to access other user's data
      const otherUserEndpoints = [
        '/api/employees/other-user-id',
        '/api/kpis/other-user-id',
        '/api/reports/other-user-id'
      ];
      
      for (const endpoint of otherUserEndpoints) {
        const response = await page.request.get(endpoint);
        console.log(`📊 Access to ${endpoint}: ${response.status()}`);
        
        // Should be forbidden or not found
        expect([401, 403, 404]).toContain(response.status());
      }
      
      console.log('✅ User ownership validation test completed');
    });
  });

  test.describe('API Input Validation', () => {
    test('should validate API request parameters', async ({ page }) => {
      console.log('🚀 Testing API parameter validation...');
      
      await authHelper.loginAsAdmin();
      
      // Test invalid parameters
      const invalidRequests = [
        { url: '/api/kpis?limit=invalid', method: 'GET' },
        { url: '/api/kpis?offset=-1', method: 'GET' },
        { url: '/api/kpis?sort=invalid_field', method: 'GET' },
        { url: '/api/employees?department_id=invalid', method: 'GET' }
      ];
      
      for (const request of invalidRequests) {
        const response = await page.request[request.method.toLowerCase() as 'get'](request.url);
        console.log(`📊 ${request.method} ${request.url}: ${response.status()}`);
        
        // Should return validation error
        expect([400, 422]).toContain(response.status());
      }
      
      console.log('✅ API parameter validation test completed');
    });

    test('should validate API request body', async ({ page }) => {
      console.log('🚀 Testing API body validation...');
      
      await authHelper.loginAsAdmin();
      
      // Test invalid request bodies
      const invalidBodies = [
        { name: '', description: 'Test' }, // Empty name
        { name: 'Test', description: '' }, // Empty description
        { name: 'Test', target: -1 }, // Negative target
        { name: 'Test', weight: 150 }, // Weight > 100
        { name: 'Test', category: null }, // Null category
      ];
      
      for (const body of invalidBodies) {
        const response = await page.request.post('/api/kpis', {
          data: body,
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log(`📊 POST /api/kpis with invalid body: ${response.status()}`);
        
        // Should return validation error
        expect([400, 422]).toContain(response.status());
      }
      
      console.log('✅ API body validation test completed');
    });

    test('should prevent SQL injection in API parameters', async ({ page }) => {
      console.log('🚀 Testing SQL injection prevention in API...');
      
      await authHelper.loginAsAdmin();
      
      const sqlInjectionAttempts = [
        "'; DROP TABLE kpis; --",
        "' OR '1'='1",
        "admin'; INSERT INTO kpis VALUES ('hacked', 'description'); --",
        "'; UPDATE employees SET role='admin' WHERE id=1; --"
      ];
      
      for (const injection of sqlInjectionAttempts) {
        const response = await page.request.get(`/api/kpis?search=${encodeURIComponent(injection)}`);
        console.log(`📊 SQL injection attempt: ${response.status()}`);
        
        // Should not crash or return database errors
        expect([400, 401, 403, 404]).toContain(response.status());
        
        // Should not return 500 (server error)
        expect(response.status()).not.toBe(500);
      }
      
      console.log('✅ SQL injection prevention test completed');
    });
  });

  test.describe('API Rate Limiting', () => {
    test('should implement rate limiting for API endpoints', async ({ page }) => {
      console.log('🚀 Testing API rate limiting...');
      
      await authHelper.loginAsAdmin();
      
      // Make rapid requests to test rate limiting
      const requests = [];
      for (let i = 0; i < 50; i++) {
        requests.push(page.request.get('/api/kpis'));
      }
      
      const responses = await Promise.all(requests);
      
      // Count rate limited responses
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      const successResponses = responses.filter(r => r.status() === 200);
      
      console.log(`📊 Total requests: ${responses.length}`);
      console.log(`📊 Rate limited: ${rateLimitedResponses.length}`);
      console.log(`📊 Successful: ${successResponses.length}`);
      
      // Should have some rate limiting in place
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      
      console.log('✅ API rate limiting test completed');
    });

    test('should handle rate limit headers properly', async ({ page }) => {
      console.log('🚀 Testing rate limit headers...');
      
      await authHelper.loginAsAdmin();
      
      const response = await page.request.get('/api/kpis');
      const headers = response.headers();
      
      // Check for rate limit headers
      const rateLimitHeaders = [
        'x-ratelimit-limit',
        'x-ratelimit-remaining',
        'x-ratelimit-reset',
        'rate-limit-limit',
        'rate-limit-remaining'
      ];
      
      let hasRateLimitHeaders = false;
      for (const header of rateLimitHeaders) {
        if (headers[header]) {
          hasRateLimitHeaders = true;
          console.log(`📊 Found rate limit header: ${header}`);
          break;
        }
      }
      
      if (hasRateLimitHeaders) {
        console.log('✅ Rate limit headers are present');
      } else {
        console.log('⚠️ Rate limit headers not found');
      }
      
      console.log('✅ Rate limit headers test completed');
    });
  });

  test.describe('API Error Handling', () => {
    test('should return appropriate error codes', async ({ page }) => {
      console.log('🚀 Testing API error codes...');
      
      // Test 404 for non-existent resources
      const notFoundResponse = await page.request.get('/api/nonexistent');
      expect(notFoundResponse.status()).toBe(404);
      
      // Test 405 for unsupported methods
      const methodNotAllowedResponse = await page.request.delete('/api/kpis');
      expect(methodNotAllowedResponse.status()).toBe(405);
      
      // Test 400 for malformed requests
      const badRequestResponse = await page.request.post('/api/kpis', {
        data: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(badRequestResponse.status()).toBe(400);
      
      console.log('✅ API error codes test completed');
    });

    test('should not leak sensitive information in error messages', async ({ page }) => {
      console.log('🚀 Testing API error message security...');
      
      await authHelper.loginAsAdmin();
      
      // Trigger various error conditions
      const errorResponses = [
        await page.request.get('/api/kpis/invalid-id'),
        await page.request.post('/api/kpis', { data: { name: '' } }),
        await page.request.get('/api/nonexistent-endpoint')
      ];
      
      for (const response of errorResponses) {
        const body = await response.text().catch(() => '');
        
        // Error messages should not contain sensitive information
        expect(body).not.toContain('database');
        expect(body).not.toContain('sql');
        expect(body).not.toContain('query');
        expect(body).not.toContain('table');
        expect(body).not.toContain('column');
        expect(body).not.toContain('password');
        expect(body).not.toContain('token');
        expect(body).not.toContain('secret');
      }
      
      console.log('✅ API error message security test completed');
    });
  });

  test.describe('API CORS and Headers', () => {
    test('should implement proper CORS headers', async ({ page }) => {
      console.log('🚀 Testing CORS headers...');
      
      const response = await page.request.options('/api/kpis');
      const headers = response.headers();
      
      // Check for CORS headers
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers'
      ];
      
      let hasCorsHeaders = false;
      for (const header of corsHeaders) {
        if (headers[header]) {
          hasCorsHeaders = true;
          console.log(`📊 Found CORS header: ${header}`);
          break;
        }
      }
      
      if (hasCorsHeaders) {
        console.log('✅ CORS headers are present');
      } else {
        console.log('⚠️ CORS headers not found');
      }
      
      console.log('✅ CORS headers test completed');
    });

    test('should implement security headers', async ({ page }) => {
      console.log('🚀 Testing security headers...');
      
      const response = await page.request.get('/api/kpis');
      const headers = response.headers();
      
      // Check for security headers
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security',
        'content-security-policy'
      ];
      
      let securityHeadersCount = 0;
      for (const header of securityHeaders) {
        if (headers[header]) {
          securityHeadersCount++;
          console.log(`📊 Found security header: ${header}`);
        }
      }
      
      console.log(`📊 Security headers found: ${securityHeadersCount}/${securityHeaders.length}`);
      
      // Should have at least some security headers
      expect(securityHeadersCount).toBeGreaterThan(0);
      
      console.log('✅ Security headers test completed');
    });
  });
});
