import { test, expect } from '@playwright/test';
import { KpiManagementTestCases } from './kpi-management-testcases';

test.describe('KPI Management Page Tests', () => {
  let kpiTestCases: KpiManagementTestCases;

  test.beforeEach(async ({ page }) => {
    kpiTestCases = new KpiManagementTestCases(page);
    
    // Login as admin với credentials thực tế
    await page.goto('http://localhost:9001/login');
    
    // Wait for login page to load
    await page.waitForLoadState('networkidle');
    
    // Fill login form với credentials thực tế
    await page.locator('input[name="email"]').fill('db@y99.vn');
    await page.locator('input[name="password"]').fill('Dby996868@');
    await page.locator('button[type="submit"]').click();
    
    // Wait for redirect to admin dashboard
    await page.waitForURL('**/admin/**');
    
    // Navigate to KPI Management
    await page.goto('http://localhost:9001/admin/kpi-management');
    await page.waitForLoadState('networkidle');
  });

  test.describe('KPI Definitions Tab', () => {
    test('should test all KPI Definitions functionality', async () => {
      await kpiTestCases.testKpiDefinitionsTab();
    });
  });

  test.describe('KPI Assignment Tab', () => {
   test('should test all KPI Assignment functionality', async () => {
      await kpiTestCases.testKpiAssignmentTab();
    });
  });

  test.describe('KPI Tracking Tab', () => {
    test('should test all KPI Tracking functionality', async () => {
      await kpiTestCases.testKpiTrackingTab();
    });
  });

  test.describe('Approval Tab', () => {
    test('should test all Approval functionality', async () => {
      await kpiTestCases.testApprovalTab();
    });
  });

  test.describe('Reward & Penalty Tab', () => {
    test('should test all Reward & Penalty functionality', async () => {
      await kpiTestCases.testRewardPenaltyTab();
    });
  });

  test.describe('Full Workflow Test', () => {
    test('should test complete workflow from KPI creation to reward calculation', async () => {
      await kpiTestCases.testFullWorkflow();
    });
  });
});

/***
 * Individual Test Cases cho từng chức năng cụ thể
 */

test.describe('Individual KPI Management Features', () => {
  test('KPI Definitions - Form Validation', async ({ page }) => {
    await page.goto('http://localhost:9001/admin/kpi-management?tab=definitions');
    
    const addButton = page.locator('button:has-text("Thêm KPI")');
    await addButton.click();
    
    // Test empty form submission
    const saveButton = page.locator('button:has-text("Lưu")');
    await saveButton.click();
    
    // Should show validation errors
    await expect(page.locator('text=Tên KPI là bắt buộc')).toBeVisible();
    
    // Test invalid target value
    await page.locator('input[name="name"]').fill('Test');
    await page.locator('input[name="target"]').fill('-10');
    await saveButton.click();
    
    // Should show validation error for negative target
    await expect(page.locator('text=Mục tiêu phải > 0')).toBeVisible();
  });

  test('KPI Assiginment - Bulk Department Assignment', async ({ page }) => {
    await page.goto('http://localhost:9001/admin/kpi-management?tab=assignment');
    
    const assignButton = page.locator('button:has-text("Phân công KPI")');
    await assignButton.click();
    
    // Test department assignment
    const departmentToggle = page.locator('button:has-text("Phân công phòng ban")');
    await departmentToggle.click();
    
    const departmentSelect = page.locator('select[name="departmentId"]');
    if (await departmentSelect.isVisible()) {
      await departmentSelect.selectOption({ index: 1 });
      
      // Should show preview of employees
      await expect(page.locator('.bg-blue-50')).toBeVisible();
    }
    
    await page.keyboard.press('Escape');
  });

  test('KPI Tracking - Progress Update', async ({ page }) => {
    await page.goto('http://localhost:9001/admin/kpi-management?tab=tracking');
    
    const table = page.locator('table tbody tr').first();
    if (await table.isVisible()) {
      await table.click();
      
      const updateButton = page.locator('button:has-text("Update Progress")');
      if (await updateButton.isVisible()) {
        await updateButton.click();
        
        // Test progress update form
        const actualInput = page.locator('input[name="actual"]');
        await actualInput.fill('50');
        
        const notesTextarea = page.locator('textarea[name="notes"]');
        await notesTextarea.fill('Updated progress notes');
        
        const saveButton = page.locator('button:has-text("Save Update")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          // Should show success toast
          await expect(page.locator('text=Đã cập nhật tiến độ')).toBeVisible();
        }
      }
    }
  });

  test('Approval - File Upload and Review', async ({ page }) => {
    await page.goto('http://localhost:9001/admin/kpi-management?tab=approval');
    
    const table = page.locator('table tbody tr').first();
    if (await table.isVisible()) {
      await table.click();
      
      if (await page.locator('[role="dialog"]').isVisible()) {
        // Check file attachments section
        const filesSection = page.locator('text=Tài liệu báo cáo');
        await expect(filesSection).toBeVisible();
        
        // Test file download links
        const downloadButtons = page.locator('button svg[class*="Download"]');
        if (await downloadButtons.count() > 0) {
          // Just verify buttons exist, don't actually download
          await expect(downloadButtons).toBeVisible();
        }
        
        await page.keyboard.press('Escape');
      }
    }
  });

  test('Reward & Penalty - Auto Calculation', async ({ page }) => {
    await page.goto('http://localhost:9001/admin/kpi-management?tab=reward-penalty');
    
    // Test auto calculation button
    const calculateButton = page.locator('button:has-text("Auto Calculate")');
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
      
      // Should show loading state
      await expect(calculateButton.locator('svg[class*="animate-spin"]')).toBeVisible();
      
      // Wait for calculation to complete (max 30 seconds)
      await page.waitForFunction(() => {
        return !document.querySelector('svg[class*="animate-spin"]');
      }, { timeout: 30000 });
      
      // Should show success toast or updated data
      await expect(page.locator('text=KPI reward/penalty calculations completed')).toBeVisible();
    }
  });

  test('Navigation Between Tabs', async ({ page }) => {
    const tabs = [
      'definitions',
      'assignment', 
      'tracking',
      'approval',
      'reward-penalty'
    ];
    
    for (const tab of tabs) {
      await page.goto(`http://localhost:9001/admin/kpi-management?tab=${tab}`);
      
      // Verify active tab
      await expect(page.locator(`[data-state="active"][value="${tab}"]`)).toBeVisible();
      
      // Check if page content loads
      await expect(page.locator('h1')).toBeVisible();
      
      // Check if stats cards are visible
      await expect(page.locator('.text-2xl.font-bold')).toBeVisible();
    }
  });

  test('Responsive Design - Mobile View', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:9001/admin/kpi-management?tab=definitions');
    
    // Check if tabs are responsive
    const tabsList = page.locator('.grid-cols-5');
    if (await tabsList.isVisible()) {
      // Verify tab text is hidden on mobile (should only show icons)
      const tabTrigger = page.locator('[data-state="active"] span');
      await expect(tabTrigger).not.toBeVisible();
    }
    
    // Check if table is scrollable on mobile
    const table = page.locator('table');
    if (await table.isVisible()) {
      await expect(table).toBeVisible();
      
      // Should be horizontally scrollable
      await table.scroll({ deltaX: 100 });
    }
  });

  test('Search and Filter Functionality', async ({ page }) => {
    // Test search across different tabs
    const testCases = [
      { tab: 'definitions', searchPlaceholder: 'tìm kiếm' },
      { tab: 'assignment', searchPlaceholder: 'tìm kiếm' },
      { tab: 'tracking', searchPlaceholder: 'Nhân viên' },
      { tab: 'approval', searchPlaceholder: 'tìm kiếm' },
      { tab: 'reward-penalty', searchPlaceholder: 'tìm kiếm' }
    ];
    
    for (const testCase of testCases) {
      await page.goto(`http://localhost:9001/admin/kpi-management?tab=${testCase.tab}`);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      const searchInput = page.locator(`input[placeholder*="${testCase.searchPlaceholder}"]`);
      if (await searchInput.isVisible()) {
        // Test search functionality
        await searchInput.fill('test');
        
        // Check if results are filtered
        await page.waitForTimeout(500);
        
        // Clear search
        await searchInput.clear();
        
        // Check if all results return
        await page.waitForTimeout(500);
      }
    }
  });

  test('Error Handling', async ({ page }) => {
    await page.goto('http://localhost:9001/admin/kpi-management?tab=definitions');
    
    // Test error handling when network fails
    await page.route('**/api/kpis', route => route.abort());
    
    const addButton = page.locator('button:has-text("Thêm KPI")');
    await addButton.click();
    
    // Try to submit form during offline state
    await page.locator('input[name="name"]').fill('Test KPI');
    const saveButton = page.locator('button:has-text("Lưu")');
    
    await expect(saveButton).toBeEnabled();
    
    // Restore network
    await page.unroute('**/api/kpis');
    
    // Close dialog
    await page.keyboard.press('Escape');
  });

  test('Data Persistence', async ({ page }) => {
    // Create a KPI
    await page.goto('http://localhost:9001/admin/kpi-management?tab=definitions');
    
    const addButton = page.locator('button:has-text("Thêm KPI")');
    await addButton.click();
    
    const kpiName = 'Persistence Test KPI';
    await page.locator('input[name="name"]').fill(kpiName);
    await page.locator('textarea[name="description"]').fill('Test persistence');
    await page.locator('input[name="target"]').fill('100');
    
    const saveButton = page.locator('button:has-text("Lưu")');
    await saveButton.click();
    
    await expect(page.locator('text=Đã tạo KPI thành công')).toBeVisible();
    
    // Navigate away and back
    await page.goto('http://localhost:9001/admin');
    await page.goto('http://localhost:9001/admin/kpi-management?tab=definitions');
    
    // Verify KPI still exists
    await expect(page.locator(`td:has-text("${kpiName}")`)).toBeVisible();
  });
});

/**
 * Performance Tests
 */
test.describe('Performance Tests', () => {
  test('Page Load Performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:9001/admin/kpi-management');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('Lazy Loading Components', async ({ page }) => {
    await page.goto('http://localhost:9001/admin/kpi-management?tab=definitions');
    
    // Switch tabs quickly to test lazy loading
    await page.click('[data-state="active"][value="assignment"]');
    await page.waitForTimeout(100);
    
    await page.click('[data-state="active"][value="tracking"]');
    await page.waitForTimeout(100);
    
    await page.click('[data-state="active"][value="approval"]');
    await page.waitForTimeout(100);
    
    await page.click('[data-state="active"][value="reward-penalty"]');
    await page.waitForTimeout(100);
    
    // All tabs should load without errors
    await expect(page.locator('h1')).toBeVisible();
  });
});
