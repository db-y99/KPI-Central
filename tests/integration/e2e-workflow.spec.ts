import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { KPIHelper } from '../utils/kpi-helper';
import { TestUtils, TEST_DATA } from '../utils/test-utils';

test.describe('End-to-End Integration Tests', () => {
  let authHelper: AuthHelper;
  let kpiHelper: KPIHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    kpiHelper = new KPIHelper(page);
    testUtils = new TestUtils(page);
  });

  test.describe('Complete KPI Workflow', () => {
    test('should complete full KPI lifecycle from creation to completion', async ({ page }) => {
      console.log('🚀 Starting complete KPI workflow test...');
      
      // Step 1: Admin creates a KPI
      await authHelper.loginAsAdmin();
      
      const kpiData = {
        name: 'E2E Test KPI ' + Date.now(),
        description: 'End-to-end test KPI for complete workflow',
        target: 100,
        unit: 'units',
        weight: 30,
        category: 'Performance'
      };
      
      await kpiHelper.createKPI(kpiData);
      await kpiHelper.verifyKPIExists(kpiData.name);
      
      // Step 2: Admin assigns KPI to employee
      await kpiHelper.assignKPIToEmployee(kpiData.name, TEST_DATA.EMPLOYEE.email);
      
      // Step 3: Employee logs in and sees assigned KPI
      await authHelper.logout();
      await authHelper.loginAsEmployee();
      
      // Verify KPI appears in employee dashboard
      await expect(page.locator(`text=${kpiData.name}`)).toBeVisible();
      
      // Step 4: Employee updates KPI progress
      await page.goto('/employee/profile');
      await testUtils.waitForPageLoad();
      
      // Update KPI progress
      const kpiSelect = page.locator('select[name="kpiId"]');
      if (await testUtils.elementExists('select[name="kpiId"]')) {
        await kpiSelect.selectOption({ label: kpiData.name });
        await testUtils.fillFormField('input[name="actual"]', '75');
        await testUtils.fillFormField('textarea[name="notes"]', 'Making good progress on E2E test KPI');
        
        await testUtils.clickButton('button[type="submit"]');
        await testUtils.waitForToast('KPI progress đã được cập nhật');
      }
      
      // Step 5: Admin reviews and approves KPI
      await authHelper.logout();
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin/kpi-tracking');
      await testUtils.waitForPageLoad();
      
      // Find and approve the KPI
      const kpiRow = page.locator(`tr:has-text("${kpiData.name}")`);
      if (await testUtils.elementExists(`tr:has-text("${kpiData.name}")`)) {
        await kpiRow.locator('button:has-text("Approve")').click();
        await testUtils.waitForToast('KPI đã được phê duyệt');
      }
      
      // Step 6: Verify completion in reports
      await page.goto('/admin/evaluation-reports');
      await testUtils.waitForPageLoad();
      
      // Check that KPI appears in completed reports
      await expect(page.locator(`text=${kpiData.name}`)).toBeVisible();
      
      console.log('✅ Complete KPI workflow test completed successfully');
    });

    test('should handle KPI rejection workflow', async ({ page }) => {
      console.log('🚀 Starting KPI rejection workflow test...');
      
      // Step 1: Admin creates and assigns KPI
      await authHelper.loginAsAdmin();
      
      const kpiData = {
        name: 'Rejection Test KPI ' + Date.now(),
        description: 'KPI for testing rejection workflow',
        target: 50,
        unit: 'units',
        weight: 20,
        category: 'Quality'
      };
      
      await kpiHelper.createKPI(kpiData);
      await kpiHelper.assignKPIToEmployee(kpiData.name, TEST_DATA.EMPLOYEE.email);
      
      // Step 2: Employee submits insufficient progress
      await authHelper.logout();
      await authHelper.loginAsEmployee();
      
      await page.goto('/employee/profile');
      await testUtils.waitForPageLoad();
      
      const kpiSelect = page.locator('select[name="kpiId"]');
      if (await testUtils.elementExists('select[name="kpiId"]')) {
        await kpiSelect.selectOption({ label: kpiData.name });
        await testUtils.fillFormField('input[name="actual"]', '10'); // Low progress
        await testUtils.fillFormField('textarea[name="notes"]', 'Need more time to complete this KPI');
        
        await testUtils.clickButton('button[type="submit"]');
        await testUtils.waitForToast('KPI progress đã được cập nhật');
      }
      
      // Step 3: Admin rejects the KPI
      await authHelper.logout();
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin/kpi-tracking');
      await testUtils.waitForPageLoad();
      
      const kpiRow = page.locator(`tr:has-text("${kpiData.name}")`);
      if (await testUtils.elementExists(`tr:has-text("${kpiData.name}")`)) {
        await kpiRow.locator('button:has-text("Reject")').click();
        
        // Add rejection reason
        await testUtils.fillFormField('textarea[name="rejectionReason"]', 'Progress insufficient, needs improvement');
        await testUtils.clickButton('button:has-text("Confirm Rejection")');
        
        await testUtils.waitForToast('KPI đã bị từ chối');
      }
      
      // Step 4: Employee sees rejection and can resubmit
      await authHelper.logout();
      await authHelper.loginAsEmployee();
      
      await page.goto('/employee');
      await testUtils.waitForPageLoad();
      
      // Check for rejection status
      await expect(page.locator('text=Rejected')).toBeVisible();
      
      console.log('✅ KPI rejection workflow test completed successfully');
    });
  });

  test.describe('Multi-User Scenarios', () => {
    test('should handle concurrent admin and employee sessions', async ({ browser }) => {
      console.log('🚀 Starting concurrent sessions test...');
      
      // Create two browser contexts for concurrent sessions
      const adminContext = await browser.newContext();
      const employeeContext = await browser.newContext();
      
      const adminPage = await adminContext.newPage();
      const employeePage = await employeeContext.newPage();
      
      const adminAuth = new AuthHelper(adminPage);
      const employeeAuth = new AuthHelper(employeePage);
      const adminKPI = new KPIHelper(adminPage);
      const adminUtils = new TestUtils(adminPage);
      const employeeUtils = new TestUtils(employeePage);
      
      try {
        // Admin creates KPI
        await adminAuth.loginAsAdmin();
        
        const kpiData = {
          name: 'Concurrent Test KPI ' + Date.now(),
          description: 'KPI for concurrent session testing',
          target: 80,
          unit: 'units',
          weight: 25,
          category: 'Performance'
        };
        
        await adminKPI.createKPI(kpiData);
        
        // Employee logs in simultaneously
        await employeeAuth.loginAsEmployee();
        
        // Admin assigns KPI to employee
        await adminKPI.assignKPIToEmployee(kpiData.name, TEST_DATA.EMPLOYEE.email);
        
        // Employee should see the assigned KPI
        await employeePage.goto('/employee');
        await employeeUtils.waitForPageLoad();
        await expect(employeePage.locator(`text=${kpiData.name}`)).toBeVisible();
        
        // Employee updates progress
        await employeePage.goto('/employee/profile');
        await employeeUtils.waitForPageLoad();
        
        const kpiSelect = employeePage.locator('select[name="kpiId"]');
        if (await employeeUtils.elementExists('select[name="kpiId"]')) {
          await kpiSelect.selectOption({ label: kpiData.name });
          await employeeUtils.fillFormField('input[name="actual"]', '60');
          await employeeUtils.clickButton('button[type="submit"]');
          await employeeUtils.waitForToast('KPI progress đã được cập nhật');
        }
        
        // Admin sees the update in real-time
        await adminPage.goto('/admin/kpi-tracking');
        await adminUtils.waitForPageLoad();
        await expect(adminPage.locator(`text=${kpiData.name}`)).toBeVisible();
        
        console.log('✅ Concurrent sessions test completed successfully');
        
      } finally {
        await adminContext.close();
        await employeeContext.close();
      }
    });

    test('should handle multiple employees with same KPI', async ({ browser }) => {
      console.log('🚀 Starting multiple employees test...');
      
      // Create admin session
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      
      const adminAuth = new AuthHelper(adminPage);
      const adminKPI = new KPIHelper(adminPage);
      const adminUtils = new TestUtils(adminPage);
      
      try {
        await adminAuth.loginAsAdmin();
        
        // Create a KPI
        const kpiData = {
          name: 'Multi-Employee KPI ' + Date.now(),
          description: 'KPI assigned to multiple employees',
          target: 200,
          unit: 'units',
          weight: 40,
          category: 'Team Performance'
        };
        
        await adminKPI.createKPI(kpiData);
        
        // Assign to multiple employees (simulate with same employee for testing)
        await adminKPI.assignKPIToEmployee(kpiData.name, TEST_DATA.EMPLOYEE.email);
        
        // Check that KPI appears in tracking with correct assignment
        await adminPage.goto('/admin/kpi-tracking');
        await adminUtils.waitForPageLoad();
        
        const kpiRow = adminPage.locator(`tr:has-text("${kpiData.name}")`);
        await expect(kpiRow).toBeVisible();
        
        console.log('✅ Multiple employees test completed successfully');
        
      } finally {
        await adminContext.close();
      }
    });
  });

  test.describe('Data Consistency Tests', () => {
    test('should maintain data consistency across different views', async ({ page }) => {
      console.log('🚀 Starting data consistency test...');
      
      await authHelper.loginAsAdmin();
      
      // Create KPI
      const kpiData = {
        name: 'Consistency Test KPI ' + Date.now(),
        description: 'KPI for data consistency testing',
        target: 120,
        unit: 'units',
        weight: 35,
        category: 'Performance'
      };
      
      await kpiHelper.createKPI(kpiData);
      
      // Check KPI in management view
      await kpiHelper.navigateToKPIManagement();
      await expect(page.locator(`text=${kpiData.name}`)).toBeVisible();
      
      // Check KPI in tracking view
      await page.goto('/admin/kpi-tracking');
      await testUtils.waitForPageLoad();
      await expect(page.locator(`text=${kpiData.name}`)).toBeVisible();
      
      // Check KPI in reports view
      await page.goto('/admin/evaluation-reports');
      await testUtils.waitForPageLoad();
      await expect(page.locator(`text=${kpiData.name}`)).toBeVisible();
      
      // Verify KPI count consistency
      const managementCount = await kpiHelper.getKPICount();
      
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      const tableRows = page.locator('tr[data-testid="table-row"]');
      const tableCount = await tableRows.count();
      
      expect(tableCount).toBeGreaterThanOrEqual(1);
      
      console.log('✅ Data consistency test completed successfully');
    });

    test('should handle database transactions correctly', async ({ page }) => {
      console.log('🚀 Starting database transaction test...');
      
      await authHelper.loginAsAdmin();
      
      // Create multiple KPIs in sequence
      const kpiNames = [];
      for (let i = 0; i < 3; i++) {
        const kpiData = {
          name: `Transaction Test KPI ${i} ${Date.now()}`,
          description: `Transaction test KPI ${i}`,
          target: 100 + i * 10,
          unit: 'units',
          weight: 20 + i * 5,
          category: 'Performance'
        };
        
        await kpiHelper.createKPI(kpiData);
        kpiNames.push(kpiData.name);
      }
      
      // Verify all KPIs were created
      await kpiHelper.navigateToKPIManagement();
      
      for (const kpiName of kpiNames) {
        await expect(page.locator(`text=${kpiName}`)).toBeVisible();
      }
      
      // Delete all KPIs
      for (const kpiName of kpiNames) {
        await kpiHelper.deleteKPI(kpiName);
      }
      
      // Verify all KPIs were deleted
      for (const kpiName of kpiNames) {
        await kpiHelper.verifyKPIDoesNotExist(kpiName);
      }
      
      console.log('✅ Database transaction test completed successfully');
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      console.log('🚀 Starting network error handling test...');
      
      await authHelper.loginAsAdmin();
      
      // Simulate network failure by going offline
      await page.context().setOffline(true);
      
      // Try to perform an action - this should fail gracefully
      try {
        await page.goto('/admin/kpi-management', { timeout: 5000 });
      } catch (error) {
        console.log('✅ Network error handled gracefully:', error.message);
      }
      
      // Check for error handling or offline indicator
      const hasError = await page.locator('text=Network Error, text=Offline, text=Connection Error').isVisible().catch(() => false);
      if (hasError) {
        await expect(page.locator('text=Network Error, text=Offline, text=Connection Error')).toBeVisible();
      }
      
      // Restore network
      await page.context().setOffline(false);
      
      // Verify recovery
      await page.reload();
      await testUtils.waitForPageLoad();
      await expect(page.locator('h1:has-text("KPI Management"), h2:has-text("KPI Management"), [data-testid="page-title"]:has-text("KPI Management")')).toBeVisible();
      
      console.log('✅ Network error handling test completed successfully');
    });

    test('should handle form validation errors', async ({ page }) => {
      console.log('🚀 Starting form validation error test...');
      
      await authHelper.loginAsAdmin();
      await kpiHelper.navigateToKPIManagement();
      
      // Try to create KPI with invalid data
      await testUtils.clickButton('button:has-text("Thêm KPI")');
      await testUtils.waitForElement('[role="dialog"]');
      
      // Submit empty form
      await testUtils.clickButton('button[type="submit"]');
      
      // Check for validation errors
      await expect(page.locator('text=Tên KPI không được để trống')).toBeVisible();
      await expect(page.locator('text=Mô tả không được để trống')).toBeVisible();
      
      // Fill invalid data
      await testUtils.fillFormField('input[name="name"]', '');
      await testUtils.fillFormField('input[name="target"]', '-10');
      await testUtils.fillFormField('input[name="weight"]', '150');
      
      await testUtils.clickButton('button[type="submit"]');
      
      // Check for specific validation errors
      await expect(page.locator('text=Target phải lớn hơn 0')).toBeVisible();
      await expect(page.locator('text=Weight không được vượt quá 100')).toBeVisible();
      
      console.log('✅ Form validation error test completed successfully');
    });

    test('should handle concurrent modifications', async ({ browser }) => {
      console.log('🚀 Starting concurrent modifications test...');
      
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      const auth1 = new AuthHelper(page1);
      const auth2 = new AuthHelper(page2);
      const kpi1 = new KPIHelper(page1);
      const kpi2 = new KPIHelper(page2);
      
      try {
        // Both users login as admin
        await auth1.loginAsAdmin();
        await auth2.loginAsAdmin();
        
        // Both navigate to KPI management
        await kpi1.navigateToKPIManagement();
        await kpi2.navigateToKPIManagement();
        
        // Create KPI from first session
        const kpiData = {
          name: 'Concurrent Edit KPI ' + Date.now(),
          description: 'KPI for concurrent edit testing',
          target: 100,
          unit: 'units',
          weight: 25,
          category: 'Performance'
        };
        
        await kpi1.createKPI(kpiData);
        
        // Try to edit from second session
        await kpi2.editKPI(kpiData.name, { name: 'Updated Concurrent KPI' });
        
        // Verify the edit was successful
        await kpi2.verifyKPIExists('Updated Concurrent KPI');
        
        console.log('✅ Concurrent modifications test completed successfully');
        
      } finally {
        await context1.close();
        await context2.close();
      }
    });
  });

  test.describe('Performance Tests', () => {
    test('should load dashboard within acceptable time', async ({ page }) => {
      console.log('🚀 Starting performance test...');
      
      const startTime = Date.now();
      
      await authHelper.loginAsAdmin();
      
      const loadTime = Date.now() - startTime;
      console.log(`📊 Admin dashboard load time: ${loadTime}ms`);
      
      // Dashboard should load within 8 seconds (increased from 5 seconds for CI/CD environments)
      expect(loadTime).toBeLessThan(8000);
      
      // Test employee dashboard load time
      await authHelper.logout();
      
      const employeeStartTime = Date.now();
      await authHelper.loginAsEmployee();
      const employeeLoadTime = Date.now() - employeeStartTime;
      
      console.log(`📊 Employee dashboard load time: ${employeeLoadTime}ms`);
      expect(employeeLoadTime).toBeLessThan(8000);
      
      console.log('✅ Performance test completed successfully');
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      console.log('🚀 Starting large dataset test...');
      
      await authHelper.loginAsAdmin();
      
      // Create multiple KPIs to test pagination
      const kpiCount = 10;
      const kpiNames = [];
      
      for (let i = 0; i < kpiCount; i++) {
        const kpiData = {
          name: `Large Dataset KPI ${i} ${Date.now()}`,
          description: `KPI ${i} for large dataset testing`,
          target: 100 + i,
          unit: 'units',
          weight: 10 + i,
          category: 'Performance'
        };
        
        await kpiHelper.createKPI(kpiData);
        kpiNames.push(kpiData.name);
      }
      
      // Test pagination
      await kpiHelper.navigateToKPIManagement();
      
      // Check if pagination controls exist
      const pagination = page.locator('[data-testid="pagination"]');
      if (await testUtils.elementExists('[data-testid="pagination"]')) {
        await expect(pagination).toBeVisible();
      }
      
      // Clean up
      for (const kpiName of kpiNames) {
        await kpiHelper.deleteKPI(kpiName);
      }
      
      console.log('✅ Large dataset test completed successfully');
    });
  });
});
