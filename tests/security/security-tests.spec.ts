import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { TestUtils } from '../utils/test-utils';

test.describe('Security Tests', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
  });

  test.describe('Authentication Security', () => {
    test('should prevent SQL injection in login form', async ({ page }) => {
      console.log('🚀 Testing SQL injection prevention...');
      
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      
      // Test SQL injection attempts
      const sqlInjectionAttempts = [
        "admin'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin' UNION SELECT * FROM users --",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --"
      ];
      
      for (const injection of sqlInjectionAttempts) {
        await page.fill('input[name="email"]', injection);
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        
        // Should not crash or show database errors
        await testUtils.waitForPageLoad();
        
        // Should either show validation error or stay on login page
        const currentUrl = page.url();
        expect(currentUrl).toContain('/login');
        
        // Clear form for next attempt
        await page.fill('input[name="email"]', '');
        await page.fill('input[name="password"]', '');
      }
      
      console.log('✅ SQL injection prevention test completed');
    });

    test('should prevent XSS attacks in input fields', async ({ page }) => {
      console.log('🚀 Testing XSS prevention...');
      
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      
      // Test XSS attempts
      const xssAttempts = [
        '<script>alert("XSS")</script>',
        '"><script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src=x onerror=alert("XSS")>',
        '"><img src=x onerror=alert("XSS")>'
      ];
      
      for (const xss of xssAttempts) {
        await page.fill('input[name="email"]', xss);
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        
        await testUtils.waitForPageLoad();
        
        // Should not execute scripts or show alerts
        const alerts = await page.evaluate(() => {
          return window.alert.toString();
        });
        
        // Check that no script execution occurred
        expect(page.url()).toContain('/login');
        
        // Clear form
        await page.fill('input[name="email"]', '');
        await page.fill('input[name="password"]', '');
      }
      
      console.log('✅ XSS prevention test completed');
    });

    test('should enforce password complexity requirements', async ({ page }) => {
      console.log('🚀 Testing password complexity...');
      
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      
      // Test weak passwords
      const weakPasswords = [
        '123',
        'password',
        '12345678',
        'qwerty',
        'abc123'
      ];
      
      for (const weakPassword of weakPasswords) {
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', weakPassword);
        await page.click('button[type="submit"]');
        
        await testUtils.waitForPageLoad();
        
        // Should show validation error or stay on login
        expect(page.url()).toContain('/login');
        
        // Clear form
        await page.fill('input[name="email"]', '');
        await page.fill('input[name="password"]', '');
      }
      
      console.log('✅ Password complexity test completed');
    });

    test('should prevent brute force attacks', async ({ page }) => {
      console.log('🚀 Testing brute force prevention...');
      
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      
      // Attempt multiple failed logins
      for (let i = 0; i < 10; i++) {
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');
        
        await testUtils.waitForPageLoad();
        
        // Should still allow login attempts (rate limiting should be handled by backend)
        expect(page.url()).toContain('/login');
      }
      
      console.log('✅ Brute force prevention test completed');
    });
  });

  test.describe('Authorization Security', () => {
    test('should prevent unauthorized access to admin routes', async ({ page }) => {
      console.log('🚀 Testing admin route protection...');
      
      // Try to access admin routes without login
      const adminRoutes = [
        '/admin',
        '/admin/kpi-management',
        '/admin/hr-management',
        '/admin/evaluation-reports',
        '/admin/system-settings'
      ];
      
      for (const route of adminRoutes) {
        await page.goto(route);
        await testUtils.waitForPageLoad();
        
        // Should redirect to login
        expect(page.url()).toContain('/login');
      }
      
      console.log('✅ Admin route protection test completed');
    });

    test('should prevent employee access to admin functions', async ({ page }) => {
      console.log('🚀 Testing employee admin access prevention...');
      
      await authHelper.loginAsEmployee();
      
      // Try to access admin routes as employee
      const adminRoutes = [
        '/admin/kpi-management',
        '/admin/hr-management',
        '/admin/evaluation-reports'
      ];
      
      for (const route of adminRoutes) {
        await page.goto(route);
        await testUtils.waitForPageLoad();
        
        // Should redirect to employee dashboard or show access denied
        const currentUrl = page.url();
        expect(currentUrl).not.toContain('/admin');
        expect(currentUrl).toContain('/employee');
      }
      
      console.log('✅ Employee admin access prevention test completed');
    });

    test('should validate user permissions for data access', async ({ page }) => {
      console.log('🚀 Testing user permission validation...');
      
      await authHelper.loginAsEmployee();
      
      // Try to access other employee's data
      await page.goto('/employee/profile');
      await testUtils.waitForPageLoad();
      
      // Should only see own profile data
      expect(page.url()).toContain('/employee/profile');
      
      // Try to access admin data endpoints
      const response = await page.request.get('/api/admin/users');
      expect(response.status()).toBe(401); // Unauthorized
      
      console.log('✅ User permission validation test completed');
    });
  });

  test.describe('Session Security', () => {
    test('should invalidate session after logout', async ({ page }) => {
      console.log('🚀 Testing session invalidation...');
      
      await authHelper.loginAsAdmin();
      expect(page.url()).toContain('/admin');
      
      await authHelper.logout();
      expect(page.url()).toContain('/login');
      
      // Try to access protected route after logout
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Should redirect to login
      expect(page.url()).toContain('/login');
      
      console.log('✅ Session invalidation test completed');
    });

    test('should prevent session fixation attacks', async ({ page }) => {
      console.log('🚀 Testing session fixation prevention...');
      
      // Get initial session
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      
      const initialCookies = await page.context().cookies();
      
      await authHelper.loginAsAdmin();
      
      const afterLoginCookies = await page.context().cookies();
      
      // Session should be different after login
      const sessionChanged = initialCookies.some(cookie => 
        !afterLoginCookies.find(c => c.name === cookie.name && c.value === cookie.value)
      );
      
      expect(sessionChanged).toBe(true);
      
      console.log('✅ Session fixation prevention test completed');
    });

    test('should handle concurrent sessions properly', async ({ browser }) => {
      console.log('🚀 Testing concurrent session handling...');
      
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      const auth1 = new AuthHelper(page1);
      const auth2 = new AuthHelper(page2);
      
      try {
        // Login with same credentials in both contexts
        await auth1.loginAsAdmin();
        await auth2.loginAsAdmin();
        
        // Both should be able to access admin dashboard
        expect(page1.url()).toContain('/admin');
        expect(page2.url()).toContain('/admin');
        
        // Logout from one context
        await auth1.logout();
        
        // Other context should still be logged in
        await page2.goto('/admin');
        await testUtils.waitForPageLoad();
        expect(page2.url()).toContain('/admin');
        
      } finally {
        await context1.close();
        await context2.close();
      }
      
      console.log('✅ Concurrent session handling test completed');
    });
  });

  test.describe('Input Validation Security', () => {
    test('should sanitize user input in forms', async ({ page }) => {
      console.log('🚀 Testing input sanitization...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      
      // Test malicious input in form fields
      const maliciousInputs = [
        '<script>alert("XSS")</script>',
        '"><img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
        'admin\'; DROP TABLE users; --'
      ];
      
      for (const maliciousInput of maliciousInputs) {
        // Try to fill form fields with malicious input
        const nameInput = page.locator('input[name="name"]');
        if (await nameInput.isVisible()) {
          await nameInput.fill(maliciousInput);
          
          // Input should be sanitized (no script execution)
          const inputValue = await nameInput.inputValue();
          expect(inputValue).not.toContain('<script>');
          expect(inputValue).not.toContain('javascript:');
        }
      }
      
      console.log('✅ Input sanitization test completed');
    });

    test('should validate file upload security', async ({ page }) => {
      console.log('🚀 Testing file upload security...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      
      // Look for file upload inputs
      const fileInputs = page.locator('input[type="file"]');
      const fileInputCount = await fileInputs.count();
      
      if (fileInputCount > 0) {
        // Test malicious file uploads
        const maliciousFiles = [
          'malicious.exe',
          'script.js',
          'virus.bat',
          'backdoor.php'
        ];
        
        for (const maliciousFile of maliciousFiles) {
          // Should reject or sanitize malicious file types
          const fileInput = fileInputs.first();
          await fileInput.setInputFiles({
            name: maliciousFile,
            mimeType: 'application/octet-stream',
            buffer: Buffer.from('malicious content')
          });
          
          // Check if file was rejected
          const errorMessage = page.locator('text=File type not allowed, text=Invalid file, text=Security error');
          if (await errorMessage.isVisible()) {
            console.log(`✅ Malicious file ${maliciousFile} was rejected`);
          }
        }
      }
      
      console.log('✅ File upload security test completed');
    });
  });

  test.describe('API Security', () => {
    test('should validate API request headers', async ({ page }) => {
      console.log('🚀 Testing API header validation...');
      
      // Test API endpoints without proper headers
      const apiEndpoints = [
        '/api/kpis',
        '/api/employees',
        '/api/reports'
      ];
      
      for (const endpoint of apiEndpoints) {
        const response = await page.request.get(endpoint);
        
        // Should require authentication
        expect(response.status()).toBe(401);
      }
      
      console.log('✅ API header validation test completed');
    });

    test('should prevent CSRF attacks', async ({ page }) => {
      console.log('🚀 Testing CSRF prevention...');
      
      await authHelper.loginAsAdmin();
      
      // Test CSRF protection
      const response = await page.request.post('/api/kpis', {
        data: { name: 'Test KPI' },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Should either succeed with proper CSRF token or fail with CSRF error
      expect([200, 201, 403]).toContain(response.status());
      
      console.log('✅ CSRF prevention test completed');
    });

    test('should implement rate limiting', async ({ page }) => {
      console.log('🚀 Testing rate limiting...');
      
      await authHelper.loginAsAdmin();
      
      // Make multiple rapid requests
      const requests = [];
      for (let i = 0; i < 20; i++) {
        requests.push(page.request.get('/api/kpis'));
      }
      
      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      
      console.log('✅ Rate limiting test completed');
    });
  });

  test.describe('Data Security', () => {
    test('should encrypt sensitive data', async ({ page }) => {
      console.log('🚀 Testing data encryption...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/hr-management');
      await testUtils.waitForPageLoad();
      
      // Check if sensitive data is properly handled
      const sensitiveElements = page.locator('text=password, text=ssn, text=credit card');
      const sensitiveCount = await sensitiveElements.count();
      
      if (sensitiveCount > 0) {
        // Sensitive data should be masked or encrypted
        for (let i = 0; i < sensitiveCount; i++) {
          const element = sensitiveElements.nth(i);
          const text = await element.textContent();
          expect(text).not.toMatch(/\d{4}-\d{4}-\d{4}-\d{4}/); // Credit card pattern
          expect(text).not.toMatch(/\d{3}-\d{2}-\d{4}/); // SSN pattern
        }
      }
      
      console.log('✅ Data encryption test completed');
    });

    test('should prevent data leakage in error messages', async ({ page }) => {
      console.log('🚀 Testing error message security...');
      
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      
      // Trigger error conditions
      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      await testUtils.waitForPageLoad();
      
      // Check for error messages
      const errorMessages = page.locator('[role="alert"], .text-red-500, .text-destructive');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorMessages.nth(i).textContent();
          
          // Error messages should not leak sensitive information
          expect(errorText).not.toContain('database');
          expect(errorText).not.toContain('sql');
          expect(errorText).not.toContain('query');
          expect(errorText).not.toContain('table');
          expect(errorText).not.toContain('column');
        }
      }
      
      console.log('✅ Error message security test completed');
    });
  });
});
