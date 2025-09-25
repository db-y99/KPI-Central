import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { TestUtils } from '../utils/test-utils';

test.describe('Core Functionality Tests', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
  });

  test.describe('Authentication & Basic Navigation', () => {
    test('should login and access admin dashboard', async ({ page }) => {
      console.log('🚀 Testing admin login and dashboard access...');
      
      await authHelper.loginAsAdmin();
      
      // Verify we're on admin dashboard
      expect(page.url()).toContain('/admin');
      
      // Check that we can see some basic elements
      await expect(page.locator('h3:has-text("KPI Management")')).toBeVisible();
      
      console.log('✅ Admin login and dashboard access test completed');
    });

    test('should login and access employee dashboard', async ({ page }) => {
      console.log('🚀 Testing employee login and dashboard access...');
      
      await authHelper.loginAsEmployee();
      
      // Verify we're on employee dashboard
      expect(page.url()).toContain('/employee');
      
      // Check that we can see some basic elements
      await expect(page.locator('text=KPI của tôi')).toBeVisible();
      
      console.log('✅ Employee login and dashboard access test completed');
    });

    test('should logout successfully', async ({ page }) => {
      console.log('🚀 Testing logout functionality...');
      
      await authHelper.loginAsAdmin();
      expect(page.url()).toContain('/admin');
      
      await authHelper.logout();
      
      // Should be redirected to login page
      expect(page.url()).toContain('/login');
      
      console.log('✅ Logout test completed');
    });
  });

  test.describe('Page Navigation', () => {
    test('should navigate to KPI management page', async ({ page }) => {
      console.log('🚀 Testing KPI management navigation...');
      
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      
      // Should be on KPI management page
      expect(page.url()).toContain('/admin/kpi-management');
      
      console.log('✅ KPI management navigation test completed');
    });

    test('should navigate to HR management page', async ({ page }) => {
      console.log('🚀 Testing HR management navigation...');
      
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin/hr-management');
      await testUtils.waitForPageLoad();
      
      // Should be on HR management page
      expect(page.url()).toContain('/admin/hr-management');
      
      console.log('✅ HR management navigation test completed');
    });

    test('should navigate to evaluation reports page', async ({ page }) => {
      console.log('🚀 Testing evaluation reports navigation...');
      
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin/evaluation-reports');
      await testUtils.waitForPageLoad();
      
      // Should be on evaluation reports page
      expect(page.url()).toContain('/admin/evaluation-reports');
      
      console.log('✅ Evaluation reports navigation test completed');
    });

    test('should navigate to employee profile page', async ({ page }) => {
      console.log('🚀 Testing employee profile navigation...');
      
      await authHelper.loginAsEmployee();
      
      await page.goto('/employee/profile');
      await testUtils.waitForPageLoad();
      
      // Should be on employee profile page
      expect(page.url()).toContain('/employee/profile');
      
      console.log('✅ Employee profile navigation test completed');
    });
  });

  test.describe('Data Consistency', () => {
    test('should maintain session across page navigation', async ({ page }) => {
      console.log('🚀 Testing session consistency...');
      
      await authHelper.loginAsAdmin();
      
      // Navigate through fewer pages to avoid timeout
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      expect(page.url()).toContain('/admin/kpi-management');
      
      await page.goto('/admin/hr-management');
      await testUtils.waitForPageLoad();
      expect(page.url()).toContain('/admin/hr-management');
      
      // Should still be logged in (no redirect to login)
      expect(page.url()).not.toContain('/login');
      expect(page.url()).toContain('/admin');
      
      console.log('✅ Session consistency test completed');
    });

    test('should handle page refresh gracefully', async ({ page }) => {
      console.log('🚀 Testing page refresh handling...');
      
      await authHelper.loginAsAdmin();
      
      // Navigate to a page
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      
      // Refresh the page
      await page.reload();
      await testUtils.waitForPageLoad();
      
      // Should still be on the same page and logged in
      expect(page.url()).toContain('/admin/kpi-management');
      expect(page.url()).not.toContain('/login');
      
      console.log('✅ Page refresh handling test completed');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid routes gracefully', async ({ page }) => {
      console.log('🚀 Testing invalid route handling...');
      
      await authHelper.loginAsAdmin();
      
      // Try to access invalid route
      await page.goto('/admin/invalid-route');
      await testUtils.waitForPageLoad();
      
      // Should still be in admin area (either 404 or redirect)
      expect(page.url()).toContain('/admin');
      
      console.log('✅ Invalid route handling test completed');
    });

    test('should handle unauthorized access', async ({ page }) => {
      console.log('🚀 Testing unauthorized access handling...');
      
      // Try to access admin page without login
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Should be redirected to login page
      expect(page.url()).toContain('/login');
      
      console.log('✅ Unauthorized access handling test completed');
    });
  });

  test.describe('Performance', () => {
    test('should load pages within reasonable time', async ({ page }) => {
      console.log('🚀 Testing page load performance...');
      
      await authHelper.loginAsAdmin();
      
      const pages = [
        '/admin/kpi-management',
        '/admin/hr-management',
        '/admin/evaluation-reports'
      ];
      
      for (const pageUrl of pages) {
        const startTime = Date.now();
        await page.goto(pageUrl);
        await testUtils.waitForPageLoad();
        const loadTime = Date.now() - startTime;
        
        console.log(`📊 ${pageUrl} load time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(30000); // 30 seconds max for CI/CD
      }
      
      console.log('✅ Page load performance test completed');
    });
  });
});
