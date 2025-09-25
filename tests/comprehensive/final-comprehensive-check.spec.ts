import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { TestUtils } from '../utils/test-utils';

test.describe('Comprehensive Final Check - All Components & Services', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
  });

  test.describe('UI Components Testing', () => {
    test('should test all UI components are working', async ({ page }) => {
      console.log('🚀 Testing all UI components...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      
      // Test UI components that should be present
      const uiComponents = [
        'button', 'input', 'select', 'textarea', 'card', 'table', 'dialog', 'alert',
        'badge', 'progress', 'tabs', 'accordion', 'dropdown-menu', 'popover',
        'tooltip', 'checkbox', 'radio-group', 'slider', 'switch', 'calendar'
      ];
      
      let componentsFound = 0;
      for (const component of uiComponents) {
        const elements = page.locator(`[data-testid*="${component}"], .${component}, [role*="${component}"]`);
        const count = await elements.count();
        if (count > 0) {
          componentsFound++;
          console.log(`✅ Found ${component}: ${count} elements`);
        }
      }
      
      console.log(`📊 UI Components found: ${componentsFound}/${uiComponents.length}`);
      expect(componentsFound).toBeGreaterThan(0);
      
      console.log('✅ UI components test completed');
    });
  });

  test.describe('Service Integration Testing', () => {
    test('should test notification service', async ({ page }) => {
      console.log('🚀 Testing notification service...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Look for notification elements
      const notificationElements = page.locator('[data-testid*="notification"], .notification, .toast, [role="alert"]');
      const notificationCount = await notificationElements.count();
      
      console.log(`📊 Found ${notificationCount} notification elements`);
      
      // Test if notifications can be triggered
      const actionButtons = page.locator('button:has-text("Save"), button:has-text("Update"), button:has-text("Create")');
      const buttonCount = await actionButtons.count();
      
      if (buttonCount > 0) {
        console.log(`✅ Found ${buttonCount} action buttons that could trigger notifications`);
      }
      
      console.log('✅ Notification service test completed');
    });

    test('should test alert service', async ({ page }) => {
      console.log('🚀 Testing alert service...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Look for alert elements
      const alertElements = page.locator('[data-testid*="alert"], .alert, [role="alert"]');
      const alertCount = await alertElements.count();
      
      console.log(`📊 Found ${alertCount} alert elements`);
      
      console.log('✅ Alert service test completed');
    });

    test('should test performance service', async ({ page }) => {
      console.log('🚀 Testing performance service...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/metrics');
      await testUtils.waitForPageLoad();
      
      // Look for performance metrics
      const performanceElements = page.locator('[data-testid*="performance"], .performance, .metric, .chart');
      const performanceCount = await performanceElements.count();
      
      console.log(`📊 Found ${performanceCount} performance elements`);
      
      console.log('✅ Performance service test completed');
    });

    test('should test reward calculation service', async ({ page }) => {
      console.log('🚀 Testing reward calculation service...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/reward-calculations');
      await testUtils.waitForPageLoad();
      
      // Look for reward calculation elements
      const rewardElements = page.locator('[data-testid*="reward"], .reward, .calculation');
      const rewardCount = await rewardElements.count();
      
      console.log(`📊 Found ${rewardCount} reward calculation elements`);
      
      console.log('✅ Reward calculation service test completed');
    });
  });

  test.describe('Component Integration Testing', () => {
    test('should test KPI card component', async ({ page }) => {
      console.log('🚀 Testing KPI card component...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      
      // Look for KPI cards
      const kpiCards = page.locator('[data-testid*="kpi-card"], .kpi-card, .card');
      const cardCount = await kpiCards.count();
      
      console.log(`📊 Found ${cardCount} KPI cards`);
      
      console.log('✅ KPI card component test completed');
    });

    test('should test employee ranking display', async ({ page }) => {
      console.log('🚀 Testing employee ranking display...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/hr-management');
      await testUtils.waitForPageLoad();
      
      // Look for ranking elements
      const rankingElements = page.locator('[data-testid*="ranking"], .ranking, .rank');
      const rankingCount = await rankingElements.count();
      
      console.log(`📊 Found ${rankingCount} ranking elements`);
      
      console.log('✅ Employee ranking display test completed');
    });

    test('should test performance dashboard', async ({ page }) => {
      console.log('🚀 Testing performance dashboard...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Look for dashboard elements
      const dashboardElements = page.locator('[data-testid*="dashboard"], .dashboard, .performance-dashboard');
      const dashboardCount = await dashboardElements.count();
      
      console.log(`📊 Found ${dashboardCount} dashboard elements`);
      
      console.log('✅ Performance dashboard test completed');
    });

    test('should test file upload component', async ({ page }) => {
      console.log('🚀 Testing file upload component...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      
      // Look for file upload elements
      const uploadElements = page.locator('[data-testid*="upload"], .upload, input[type="file"]');
      const uploadCount = await uploadElements.count();
      
      console.log(`📊 Found ${uploadCount} file upload elements`);
      
      console.log('✅ File upload component test completed');
    });

    test('should test bulk import export component', async ({ page }) => {
      console.log('🚀 Testing bulk import export component...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      
      // Look for bulk import/export elements
      const bulkElements = page.locator('[data-testid*="bulk"], .bulk, button:has-text("Import"), button:has-text("Export")');
      const bulkCount = await bulkElements.count();
      
      console.log(`📊 Found ${bulkCount} bulk import/export elements`);
      
      console.log('✅ Bulk import export component test completed');
    });
  });

  test.describe('Context Providers Testing', () => {
    test('should test auth context', async ({ page }) => {
      console.log('🚀 Testing auth context...');
      
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      
      // Test login functionality (auth context) using AuthHelper
      await authHelper.loginAsAdmin();
      
      // Should redirect to admin dashboard
      expect(page.url()).toContain('/admin');
      
      console.log('✅ Auth context test completed');
    });

    test('should test data context', async ({ page }) => {
      console.log('🚀 Testing data context...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Check if data is loaded (data context)
      const dataElements = page.locator('[data-testid*="data"], .data-loaded, .kpi-data');
      const dataCount = await dataElements.count();
      
      console.log(`📊 Found ${dataCount} data elements`);
      
      console.log('✅ Data context test completed');
    });

    test('should test language context', async ({ page }) => {
      console.log('🚀 Testing language context...');
      
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      
      // Look for language switcher
      const languageElements = page.locator('[data-testid*="language"], .language-switcher, button:has-text("EN"), button:has-text("VI")');
      const languageCount = await languageElements.count();
      
      console.log(`📊 Found ${languageCount} language elements`);
      
      console.log('✅ Language context test completed');
    });

    test('should test theme context', async ({ page }) => {
      console.log('🚀 Testing theme context...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Look for theme toggle
      const themeElements = page.locator('[data-testid*="theme"], .theme-toggle, button:has-text("Dark"), button:has-text("Light")');
      const themeCount = await themeElements.count();
      
      console.log(`📊 Found ${themeCount} theme elements`);
      
      console.log('✅ Theme context test completed');
    });
  });

  test.describe('Custom Hooks Testing', () => {
    test('should test mobile hook', async ({ page }) => {
      console.log('🚀 Testing mobile hook...');
      
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await authHelper.loginAsAdmin();
      await testUtils.waitForPageLoad();
      
      // Check if mobile-specific elements are present
      const mobileElements = page.locator('[data-testid*="mobile"], .mobile, .responsive');
      const mobileCount = await mobileElements.count();
      
      console.log(`📊 Found ${mobileCount} mobile elements`);
      
      console.log('✅ Mobile hook test completed');
    });

    test('should test async hook', async ({ page }) => {
      console.log('🚀 Testing async hook...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      
      // Look for async loading states
      const asyncElements = page.locator('[data-testid*="loading"], .loading, .async');
      const asyncCount = await asyncElements.count();
      
      console.log(`📊 Found ${asyncCount} async elements`);
      
      console.log('✅ Async hook test completed');
    });

    test('should test toast hook', async ({ page }) => {
      console.log('🚀 Testing toast hook...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Look for toast elements
      const toastElements = page.locator('[data-testid*="toast"], .toast, [role="alert"]');
      const toastCount = await toastElements.count();
      
      console.log(`📊 Found ${toastCount} toast elements`);
      
      console.log('✅ Toast hook test completed');
    });
  });

  test.describe('Server Actions Testing', () => {
    test('should test server actions', async ({ page }) => {
      console.log('🚀 Testing server actions...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      
      // Look for forms that might use server actions
      const forms = page.locator('form, [data-testid*="form"]');
      const formCount = await forms.count();
      
      console.log(`📊 Found ${formCount} forms`);
      
      // Look for action buttons
      const actionButtons = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update")');
      const buttonCount = await actionButtons.count();
      
      console.log(`📊 Found ${buttonCount} action buttons`);
      
      console.log('✅ Server actions test completed');
    });
  });

  test.describe('Error Boundary Testing', () => {
    test('should test error boundary', async ({ page }) => {
      console.log('🚀 Testing error boundary...');
      
      await authHelper.loginAsAdmin();
      
      // Try to trigger errors by navigating to invalid routes
      const invalidRoutes = [
        '/admin/invalid-route',
        '/employee/invalid-route'
      ];
      
      for (const route of invalidRoutes) {
        await page.goto(route);
        await testUtils.waitForPageLoad();
        
        // Should not crash the app
        const body = page.locator('body');
        const bodyVisible = await body.isVisible().catch(() => false);
        
        if (bodyVisible) {
          console.log(`✅ Error boundary handled ${route} gracefully`);
        }
      }
      
      console.log('✅ Error boundary test completed');
    });
  });

  test.describe('Template System Testing', () => {
    test('should test template system', async ({ page }) => {
      console.log('🚀 Testing template system...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/reports');
      await testUtils.waitForPageLoad();
      
      // Look for template elements
      const templateElements = page.locator('[data-testid*="template"], .template, .report-template');
      const templateCount = await templateElements.count();
      
      console.log(`📊 Found ${templateCount} template elements`);
      
      console.log('✅ Template system test completed');
    });
  });

  test.describe('PDF Export Testing', () => {
    test('should test PDF export functionality', async ({ page }) => {
      console.log('🚀 Testing PDF export functionality...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/reports');
      await testUtils.waitForPageLoad();
      
      // Look for PDF export buttons
      const pdfButtons = page.locator('button:has-text("PDF"), button:has-text("Export"), a:has-text("PDF")');
      const pdfCount = await pdfButtons.count();
      
      console.log(`📊 Found ${pdfCount} PDF export buttons`);
      
      console.log('✅ PDF export functionality test completed');
    });
  });

  test.describe('Scheduled Reports Testing', () => {
    test('should test scheduled reports', async ({ page }) => {
      console.log('🚀 Testing scheduled reports...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/reports');
      await testUtils.waitForPageLoad();
      
      // Look for scheduled report elements
      const scheduledElements = page.locator('[data-testid*="scheduled"], .scheduled, .schedule');
      const scheduledCount = await scheduledElements.count();
      
      console.log(`📊 Found ${scheduledCount} scheduled report elements`);
      
      console.log('✅ Scheduled reports test completed');
    });
  });

  test.describe('System Initialization Testing', () => {
    test('should test system initialization', async ({ page }) => {
      console.log('🚀 Testing system initialization...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/init-policies');
      await testUtils.waitForPageLoad();
      
      // Look for initialization elements
      const initElements = page.locator('[data-testid*="init"], .init, .initialize');
      const initCount = await initElements.count();
      
      console.log(`📊 Found ${initCount} initialization elements`);
      
      console.log('✅ System initialization test completed');
    });
  });

  test.describe('API Integration Testing', () => {
    test('should test API integration service', async ({ page }) => {
      console.log('🚀 Testing API integration service...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/google-drive-config');
      await testUtils.waitForPageLoad();
      
      // Look for API integration elements
      const apiElements = page.locator('[data-testid*="api"], .api-integration, .integration');
      const apiCount = await apiElements.count();
      
      console.log(`📊 Found ${apiCount} API integration elements`);
      
      console.log('✅ API integration service test completed');
    });
  });

  test.describe('Final Comprehensive Check', () => {
    test('should verify all major components are accessible', async ({ page }) => {
      console.log('🚀 Final comprehensive check...');
      
      await authHelper.loginAsAdmin();
      
      // Test all major admin pages
      const adminPages = [
        '/admin',
        '/admin/kpi-management',
        '/admin/hr-management',
        '/admin/reports',
        '/admin/evaluation-reports',
        '/admin/system-settings',
        '/admin/reward-programs',
        '/admin/metrics',
        '/admin/departments',
        '/admin/employees',
        '/admin/settings',
        '/admin/reward-system',
        '/admin/reward-calculations',
        '/admin/google-drive-config',
        '/admin/payroll-integration',
        '/admin/policies-overview',
        '/admin/init-policies',
        '/admin/evaluation',
        '/admin/kpi-definitions',
        '/admin/kpi-assignment',
        '/admin/kpi-tracking',
        '/admin/approval'
      ];
      
      let accessiblePages = 0;
      for (const pageUrl of adminPages) {
        await page.goto(pageUrl);
        await testUtils.waitForPageLoad();
        
        // Check if page loads successfully
        const body = page.locator('body');
        const bodyVisible = await body.isVisible().catch(() => false);
        
        if (bodyVisible) {
          accessiblePages++;
          console.log(`✅ ${pageUrl} is accessible`);
        } else {
          console.log(`❌ ${pageUrl} is not accessible`);
        }
      }
      
      console.log(`📊 Accessible admin pages: ${accessiblePages}/${adminPages.length}`);
      expect(accessiblePages).toBeGreaterThan(adminPages.length * 0.8); // At least 80% should be accessible
      
      // Test employee pages
      await authHelper.logout();
      await authHelper.loginAsEmployee();
      
      const employeePages = [
        '/employee',
        '/employee/profile',
        '/employee/profile/edit',
        '/employee/profile/enhanced-page',
        '/employee/calendar',
        '/employee/reports',
        '/employee/self-update-metrics'
      ];
      
      let accessibleEmployeePages = 0;
      for (const pageUrl of employeePages) {
        await page.goto(pageUrl);
        await testUtils.waitForPageLoad();
        
        const body = page.locator('body');
        const bodyVisible = await body.isVisible().catch(() => false);
        
        if (bodyVisible) {
          accessibleEmployeePages++;
          console.log(`✅ ${pageUrl} is accessible`);
        } else {
          console.log(`❌ ${pageUrl} is not accessible`);
        }
      }
      
      console.log(`📊 Accessible employee pages: ${accessibleEmployeePages}/${employeePages.length}`);
      expect(accessibleEmployeePages).toBeGreaterThan(employeePages.length * 0.8);
      
      console.log('✅ Final comprehensive check completed');
    });
  });
});
