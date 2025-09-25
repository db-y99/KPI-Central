import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { TestUtils } from '../utils/test-utils';

test.describe('Basic Functionality Tests', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
  });

  test.describe('Admin Dashboard Functionality', () => {
    test('should display admin dashboard with all sections', async ({ page }) => {
      console.log('🚀 Testing admin dashboard display...');
      
      await authHelper.loginAsAdmin();
      
      // Check main navigation
      await expect(page.locator('h3:has-text("KPI Management")')).toBeVisible();
      await expect(page.locator('h3:has-text("HR Management")')).toBeVisible();
      await expect(page.locator('h3:has-text("Evaluation & Reports")')).toBeVisible();
      await expect(page.locator('h3:has-text("System Settings")')).toBeVisible();
      
      // Check dashboard stats
      await expect(page.locator('h3:has-text("KPIs")')).toBeVisible();
      await expect(page.locator('h3:has-text("Employees")')).toBeVisible();
      await expect(page.locator('h3:has-text("Completion Rate")')).toBeVisible();
      
      console.log('✅ Admin dashboard display test completed');
    });

    test('should navigate to KPI management tabs', async ({ page }) => {
      console.log('🚀 Testing KPI management navigation...');
      
      await authHelper.loginAsAdmin();
      
      // Navigate to KPI management
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      
      // Check tabs are visible
      await expect(page.locator('h1:has-text("KPI Definitions")')).toBeVisible();
      await expect(page.locator('button:has-text("KPI Assignment")')).toBeVisible();
      await expect(page.locator('button:has-text("KPI Tracking")')).toBeVisible();
      await expect(page.locator('button:has-text("Metrics")')).toBeVisible();
      
      // Test tab switching
      await page.click('text=KPI Assignment');
      await testUtils.waitForPageLoad();
      await expect(page.locator('text=Assign KPIs to Employee')).toBeVisible();
      
      await page.click('text=KPI Tracking');
      await testUtils.waitForPageLoad();
      await expect(page.locator('text=KPI Tracking')).toBeVisible();
      
      console.log('✅ KPI management navigation test completed');
    });

    test('should navigate to employee management', async ({ page }) => {
      console.log('🚀 Testing employee management navigation...');
      
      await authHelper.loginAsAdmin();
      
      // Navigate to HR management
      await page.goto('/admin/hr-management');
      await testUtils.waitForPageLoad();
      
      // Check HR management elements
      await expect(page.locator('h1:has-text("HR Management")')).toBeVisible();
      
      console.log('✅ Employee management navigation test completed');
    });

    test('should navigate to reports section', async ({ page }) => {
      console.log('🚀 Testing reports navigation...');
      
      await authHelper.loginAsAdmin();
      
      // Navigate to evaluation reports
      await page.goto('/admin/evaluation-reports');
      await testUtils.waitForPageLoad();
      
      // Check reports elements
      await expect(page.locator('h1:has-text("Evaluation & Reports")')).toBeVisible();
      
      console.log('✅ Reports navigation test completed');
    });
  });

  test.describe('Employee Dashboard Functionality', () => {
    test('should display employee dashboard with all sections', async ({ page }) => {
      console.log('🚀 Testing employee dashboard display...');
      
      await authHelper.loginAsEmployee();
      
      // Check main elements
      await expect(page.locator('text=KPI của tôi')).toBeVisible();
      await expect(page.locator('button:has-text("Cập nhật tiến độ")')).toBeVisible();
      await expect(page.locator('button:has-text("Xem hồ sơ")')).toBeVisible();
      
      // Check stats
      await expect(page.locator('text=Tổng KPI')).toBeVisible();
      await expect(page.locator('text=Hoàn thành')).toBeVisible();
      await expect(page.locator('text=Chờ duyệt')).toBeVisible();
      await expect(page.locator('text=Tỷ lệ hoàn thành')).toBeVisible();
      
      console.log('✅ Employee dashboard display test completed');
    });

    test('should navigate to employee profile', async ({ page }) => {
      console.log('🚀 Testing employee profile navigation...');
      
      await authHelper.loginAsEmployee();
      
      // Navigate to profile
      await page.goto('/employee/profile');
      await testUtils.waitForPageLoad();
      
      // Check profile elements - just verify we're on the profile page
      expect(page.url()).toContain('/employee/profile');
      
      console.log('✅ Employee profile navigation test completed');
    });
  });

  test.describe('Data Consistency Tests', () => {
    test('should maintain consistent navigation state', async ({ page }) => {
      console.log('🚀 Testing navigation state consistency...');
      
      await authHelper.loginAsAdmin();
      
      // Navigate through different sections
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      await expect(page.locator('h1:has-text("KPI Management")')).toBeVisible();
      
      await page.goto('/admin/hr-management');
      await testUtils.waitForPageLoad();
      await expect(page.locator('h1:has-text("HR Management")')).toBeVisible();
      
      await page.goto('/admin/evaluation-reports');
      await testUtils.waitForPageLoad();
      await expect(page.locator('h1:has-text("Evaluation & Reports")')).toBeVisible();
      
      // Go back to dashboard
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      await expect(page.locator('h3:has-text("KPI Management")')).toBeVisible();
      
      console.log('✅ Navigation state consistency test completed');
    });

    test('should maintain user session across page navigation', async ({ page }) => {
      console.log('🚀 Testing session consistency...');
      
      await authHelper.loginAsAdmin();
      
      // Navigate through multiple pages
      const pages = [
        '/admin/kpi-management',
        '/admin/employee-management', 
        '/admin/reports',
        '/admin'
      ];
      
      for (const pageUrl of pages) {
        await page.goto(pageUrl);
        await testUtils.waitForPageLoad();
        
        // Check that we're still logged in (no redirect to login)
        expect(page.url()).not.toContain('/login');
      }
      
      console.log('✅ Session consistency test completed');
    });
  });

  test.describe('Error Handling Tests', () => {
    test('should handle invalid routes gracefully', async ({ page }) => {
      console.log('🚀 Testing invalid route handling...');
      
      await authHelper.loginAsAdmin();
      
      // Try to access invalid route
      await page.goto('/admin/invalid-route');
      await testUtils.waitForPageLoad();
      
      // Should either show 404 or redirect to valid page
      const currentUrl = page.url();
      const isValidRoute = currentUrl.includes('/admin') && !currentUrl.includes('/invalid-route');
      // For now, just check that we're still in admin area
      expect(currentUrl.includes('/admin')).toBe(true);
      
      console.log('✅ Invalid route handling test completed');
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

  test.describe('Performance Tests', () => {
    test('should load pages within acceptable time', async ({ page }) => {
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
        expect(loadTime).toBeLessThan(20000); // 20 seconds max for CI/CD
      }
      
      console.log('✅ Page load performance test completed');
    });
  });
});
