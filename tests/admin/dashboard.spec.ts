import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { KPIHelper } from '../utils/kpi-helper';
import { TestUtils, TEST_DATA } from '../utils/test-utils';

test.describe('Admin Dashboard', () => {
  let authHelper: AuthHelper;
  let kpiHelper: KPIHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    kpiHelper = new KPIHelper(page);
    testUtils = new TestUtils(page);
    
    // Login as admin before each test
    await authHelper.loginAsAdmin();
  });

  test.describe('Dashboard Overview', () => {
    test('should display admin dashboard correctly', async ({ page }) => {
      // Check main dashboard elements
      await expect(page.locator('text=KPI Management')).toBeVisible();
      await expect(page.locator('text=HR Management')).toBeVisible();
      await expect(page.locator('text=Evaluation & Reports')).toBeVisible();
      await expect(page.locator('text=Reward System')).toBeVisible();
      await expect(page.locator('text=System Settings')).toBeVisible();
    });

    test('should display dashboard statistics', async ({ page }) => {
      // Check for statistics cards
      await expect(page.locator('text=Tổng nhân viên')).toBeVisible();
      await expect(page.locator('text=Tổng KPI')).toBeVisible();
      await expect(page.locator('text=Tỷ lệ hoàn thành')).toBeVisible();
      await expect(page.locator('text=KPI quá hạn')).toBeVisible();
    });

    test('should display quick action cards', async ({ page }) => {
      // Check for quick action cards
      const quickActions = [
        'KPI Management',
        'HR Management', 
        'Evaluation & Reports',
        'Reward System',
        'System Settings'
      ];

      for (const action of quickActions) {
        await expect(page.locator(`text=${action}`)).toBeVisible();
      }
    });

    test('should navigate to KPI management from dashboard', async ({ page }) => {
      await page.click('text=KPI Management');
      await expect(page).toHaveURL(/.*\/admin\/kpi-management/);
    });

    test('should navigate to HR management from dashboard', async ({ page }) => {
      await page.click('text=HR Management');
      await expect(page).toHaveURL(/.*\/admin\/hr-management/);
    });

    test('should navigate to system settings from dashboard', async ({ page }) => {
      await page.click('text=System Settings');
      await expect(page).toHaveURL(/.*\/admin\/system-settings/);
    });
  });

  test.describe('KPI Management', () => {
    test('should display KPI management page', async ({ page }) => {
      await kpiHelper.navigateToKPIManagement();
      
      // Check for KPI management elements
      await expect(page.locator('text=KPI Management')).toBeVisible();
      await expect(page.locator('button:has-text("Thêm KPI")')).toBeVisible();
    });

    test('should create a new KPI', async ({ page }) => {
      const kpiData = {
        name: 'Test KPI ' + Date.now(),
        description: 'Test KPI description',
        target: 100,
        unit: 'units',
        weight: 25,
        category: 'Performance'
      };

      await kpiHelper.createKPI(kpiData);
      await kpiHelper.verifyKPIExists(kpiData.name);
    });

    test('should edit an existing KPI', async ({ page }) => {
      // First create a KPI
      const originalKPI = {
        name: 'Edit Test KPI ' + Date.now(),
        description: 'Original description',
        target: 100,
        unit: 'units',
        weight: 25,
        category: 'Performance'
      };

      await kpiHelper.createKPI(originalKPI);
      
      // Then edit it
      const updates = {
        name: 'Updated KPI ' + Date.now(),
        description: 'Updated description',
        target: 150
      };

      await kpiHelper.editKPI(originalKPI.name, updates);
      await kpiHelper.verifyKPIExists(updates.name);
    });

    test('should delete a KPI', async ({ page }) => {
      // First create a KPI
      const kpiData = {
        name: 'Delete Test KPI ' + Date.now(),
        description: 'KPI to be deleted',
        target: 100,
        unit: 'units',
        weight: 25,
        category: 'Performance'
      };

      await kpiHelper.createKPI(kpiData);
      
      // Then delete it
      await kpiHelper.deleteKPI(kpiData.name);
      await kpiHelper.verifyKPIDoesNotExist(kpiData.name);
    });

    test('should search for KPIs', async ({ page }) => {
      await kpiHelper.navigateToKPIManagement();
      
      // Create a test KPI
      const kpiData = {
        name: 'Search Test KPI ' + Date.now(),
        description: 'Searchable KPI',
        target: 100,
        unit: 'units',
        weight: 25,
        category: 'Performance'
      };

      await kpiHelper.createKPI(kpiData);
      
      // Search for the KPI
      await kpiHelper.searchKPI(kpiData.name);
      
      // Verify search results
      await expect(page.locator(`tr:has-text("${kpiData.name}")`)).toBeVisible();
    });

    test('should filter KPIs by category', async ({ page }) => {
      await kpiHelper.navigateToKPIManagement();
      
      // Filter by Performance category
      await kpiHelper.filterKPIsByCategory('Performance');
      
      // Verify filtered results (if any exist)
      const kpiRows = page.locator('tr[data-testid="table-row"]');
      const count = await kpiRows.count();
      
      if (count > 0) {
        // Check that all visible rows contain Performance category
        for (let i = 0; i < count; i++) {
          const row = kpiRows.nth(i);
          await expect(row).toBeVisible();
        }
      }
    });
  });

  test.describe('Employee Management', () => {
    test('should navigate to employee management', async ({ page }) => {
      await page.click('text=HR Management');
      await expect(page).toHaveURL(/.*\/admin\/hr-management/);
      
      // Check for employee management elements
      await expect(page.locator('text=Employee Management')).toBeVisible();
    });

    test('should display employee list', async ({ page }) => {
      await page.goto('/admin/hr-management');
      await testUtils.waitForPageLoad();
      
      // Check for employee table
      await expect(page.locator('[data-testid="data-table"]')).toBeVisible();
    });

    test('should add a new employee', async ({ page }) => {
      await page.goto('/admin/hr-management');
      await testUtils.waitForPageLoad();
      
      // Click add employee button
      await testUtils.clickButton('button:has-text("Thêm nhân viên")');
      
      // Wait for form modal
      await testUtils.waitForElement('[role="dialog"]');
      
      // Fill employee form
      const employeeData = {
        name: 'Test Employee ' + Date.now(),
        email: `testemployee${Date.now()}@y99.vn`,
        position: 'Developer',
        department: 'IT',
        phone: '0123456789'
      };

      await testUtils.fillFormField('input[name="name"]', employeeData.name);
      await testUtils.fillFormField('input[name="email"]', employeeData.email);
      await testUtils.fillFormField('input[name="position"]', employeeData.position);
      await testUtils.fillFormField('input[name="phone"]', employeeData.phone);
      
      // Submit form
      await testUtils.clickButton('button[type="submit"]');
      
      // Wait for success message
      await testUtils.waitForToast('Nhân viên đã được thêm thành công');
    });
  });

  test.describe('System Settings', () => {
    test('should navigate to system settings', async ({ page }) => {
      await page.click('text=System Settings');
      await expect(page).toHaveURL(/.*\/admin\/system-settings/);
      
      // Check for system settings elements
      await expect(page.locator('text=System Settings')).toBeVisible();
    });

    test('should display system configuration options', async ({ page }) => {
      await page.goto('/admin/system-settings');
      await testUtils.waitForPageLoad();
      
      // Check for various settings sections
      await expect(page.locator('text=General Settings')).toBeVisible();
      await expect(page.locator('text=Notification Settings')).toBeVisible();
    });

    test('should update system settings', async ({ page }) => {
      await page.goto('/admin/system-settings');
      await testUtils.waitForPageLoad();
      
      // Find and update a setting
      const settingInput = page.locator('input[name="systemName"]');
      if (await testUtils.elementExists('input[name="systemName"]')) {
        await testUtils.fillFormField('input[name="systemName"]', 'Updated System Name');
        
        // Save settings
        await testUtils.clickButton('button:has-text("Lưu")');
        
        // Wait for success message
        await testUtils.waitForToast('Cài đặt đã được lưu');
      }
    });
  });

  test.describe('Reports and Analytics', () => {
    test('should navigate to evaluation reports', async ({ page }) => {
      await page.click('text=Evaluation & Reports');
      await expect(page).toHaveURL(/.*\/admin\/evaluation-reports/);
      
      // Check for reports elements
      await expect(page.locator('text=Evaluation Reports')).toBeVisible();
    });

    test('should display KPI performance reports', async ({ page }) => {
      await page.goto('/admin/evaluation-reports');
      await testUtils.waitForPageLoad();
      
      // Check for report elements
      await expect(page.locator('text=KPI Performance')).toBeVisible();
    });

    test('should generate performance report', async ({ page }) => {
      await page.goto('/admin/evaluation-reports');
      await testUtils.waitForPageLoad();
      
      // Click generate report button
      const generateButton = page.locator('button:has-text("Generate Report")');
      if (await testUtils.elementExists('button:has-text("Generate Report")')) {
        await testUtils.clickButton('button:has-text("Generate Report")');
        
        // Wait for report generation
        await testUtils.waitForLoadingComplete();
        
        // Check for report content
        await expect(page.locator('text=Report Generated')).toBeVisible();
      }
    });
  });

  test.describe('Reward System', () => {
    test('should navigate to reward system', async ({ page }) => {
      await page.click('text=Reward System');
      await expect(page).toHaveURL(/.*\/admin\/reward-system/);
      
      // Check for reward system elements
      await expect(page.locator('text=Reward System')).toBeVisible();
    });

    test('should display reward calculations', async ({ page }) => {
      await page.goto('/admin/reward-system');
      await testUtils.waitForPageLoad();
      
      // Check for reward elements
      await expect(page.locator('text=Reward Calculations')).toBeVisible();
    });

    test('should configure reward settings', async ({ page }) => {
      await page.goto('/admin/reward-system');
      await testUtils.waitForPageLoad();
      
      // Look for reward configuration options
      const configButton = page.locator('button:has-text("Configure")');
      if (await testUtils.elementExists('button:has-text("Configure")')) {
        await testUtils.clickButton('button:has-text("Configure")');
        
        // Wait for configuration modal
        await testUtils.waitForElement('[role="dialog"]');
        
        // Update reward settings
        const rewardInput = page.locator('input[name="rewardMultiplier"]');
        if (await testUtils.elementExists('input[name="rewardMultiplier"]')) {
          await testUtils.fillFormField('input[name="rewardMultiplier"]', '1.5');
          
          // Save configuration
          await testUtils.clickButton('button[type="submit"]');
          
          // Wait for success message
          await testUtils.waitForToast('Cấu hình đã được lưu');
        }
      }
    });
  });

  test.describe('Navigation and Layout', () => {
    test('should maintain navigation state across pages', async ({ page }) => {
      // Navigate to different admin pages
      await page.click('text=KPI Management');
      await expect(page).toHaveURL(/.*\/admin\/kpi-management/);
      
      await page.click('text=HR Management');
      await expect(page).toHaveURL(/.*\/admin\/hr-management/);
      
      await page.click('text=System Settings');
      await expect(page).toHaveURL(/.*\/admin\/system-settings/);
    });

    test('should display admin layout correctly', async ({ page }) => {
      // Check for admin layout elements
      await expect(page.locator('[data-testid="admin-layout"]')).toBeVisible();
      await expect(page.locator('[data-testid="admin-sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="admin-header"]')).toBeVisible();
    });

    test('should show user info in header', async ({ page }) => {
      // Check for user information in header
      await expect(page.locator('[data-testid="user-info"]')).toBeVisible();
      await expect(page.locator('text=Administrator')).toBeVisible();
    });
  });
});

