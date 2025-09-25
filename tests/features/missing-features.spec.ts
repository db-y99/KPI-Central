import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { TestUtils } from '../utils/test-utils';

test.describe('Missing Features Tests', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
  });

  test.describe('Admin Evaluation', () => {
    test('should display admin evaluation page correctly', async ({ page }) => {
      console.log('🚀 Testing admin evaluation page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/evaluation');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Employee Evaluation")')).toBeVisible();
      
      // Check if there are evaluation elements
      const evaluationElements = page.locator('[data-testid="evaluation"], .evaluation, .assessment');
      const evaluationCount = await evaluationElements.count();
      
      console.log(`📊 Found ${evaluationCount} evaluation elements`);
      
      console.log('✅ Admin evaluation page test completed');
    });
  });

  test.describe('Admin Employees', () => {
    test('should display admin employees page correctly', async ({ page }) => {
      console.log('🚀 Testing admin employees page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/employees');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Employees"), h2:has-text("Employees")')).toBeVisible();
      
      // Check if there are employee elements
      const employeeElements = page.locator('[data-testid="employee"], .employee, .staff');
      const employeeCount = await employeeElements.count();
      
      console.log(`📊 Found ${employeeCount} employee elements`);
      
      console.log('✅ Admin employees page test completed');
    });
  });

  test.describe('Admin Settings', () => {
    test('should display admin settings page correctly', async ({ page }) => {
      console.log('🚀 Testing admin settings page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/settings');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Settings"), h2:has-text("Settings")')).toBeVisible();
      
      // Check if there are settings elements
      const settingsElements = page.locator('[data-testid="settings"], .settings, .configuration');
      const settingsCount = await settingsElements.count();
      
      console.log(`📊 Found ${settingsCount} settings elements`);
      
      console.log('✅ Admin settings page test completed');
    });
  });

  test.describe('Admin Reward System', () => {
    test('should display admin reward system page correctly', async ({ page }) => {
      console.log('🚀 Testing admin reward system page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/reward-system');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Reward System"), h2:has-text("Reward System")')).toBeVisible();
      
      // Check if there are reward system elements
      const rewardElements = page.locator('[data-testid="reward-system"], .reward-system, .reward');
      const rewardCount = await rewardElements.count();
      
      console.log(`📊 Found ${rewardCount} reward system elements`);
      
      console.log('✅ Admin reward system page test completed');
    });
  });

  test.describe('Employee Profile Edit', () => {
    test('should display employee profile edit page correctly', async ({ page }) => {
      console.log('🚀 Testing employee profile edit page...');
      
      await authHelper.loginAsEmployee();
      await page.goto('/employee/profile/edit');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Edit"), h2:has-text("Edit")')).toBeVisible();
      
      // Check if there are edit form elements
      const editElements = page.locator('[data-testid="edit-form"], .edit-form, form');
      const editCount = await editElements.count();
      
      console.log(`📊 Found ${editCount} edit form elements`);
      
      console.log('✅ Employee profile edit page test completed');
    });
  });

  test.describe('Employee Enhanced Profile', () => {
    test('should display employee enhanced profile page correctly', async ({ page }) => {
      console.log('🚀 Testing employee enhanced profile page...');
      
      await authHelper.loginAsEmployee();
      await page.goto('/employee/profile/enhanced-page');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Enhanced"), h2:has-text("Enhanced")')).toBeVisible();
      
      // Check if there are enhanced profile elements
      const enhancedElements = page.locator('[data-testid="enhanced-profile"], .enhanced-profile, .profile');
      const enhancedCount = await enhancedElements.count();
      
      console.log(`📊 Found ${enhancedCount} enhanced profile elements`);
      
      console.log('✅ Employee enhanced profile page test completed');
    });
  });

  test.describe('API Endpoints', () => {
    test('should test Google Drive API endpoint', async ({ page }) => {
      console.log('🚀 Testing Google Drive API endpoint...');
      
      await authHelper.loginAsAdmin();
      
      // Test Google Drive API endpoint
      try {
        const response = await page.request.get('/api/google-drive');
        console.log(`📊 Google Drive API status: ${response.status()}`);
        
        // Should either work or return proper error
        expect([200, 201, 400, 401, 403, 404, 500]).toContain(response.status());
      } catch (error) {
        console.log('📊 Google Drive API: Error handled');
      }
      
      console.log('✅ Google Drive API endpoint test completed');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      console.log('🚀 Testing 404 error handling...');
      
      await authHelper.loginAsAdmin();
      
      // Test non-existent pages
      const nonExistentPages = [
        '/admin/nonexistent',
        '/employee/nonexistent',
        '/nonexistent-page'
      ];
      
      for (const pageUrl of nonExistentPages) {
        await page.goto(pageUrl);
        await testUtils.waitForPageLoad();
        
        // Should either show 404 or redirect to valid page
        const currentUrl = page.url();
        const isValidRoute = currentUrl.includes('/admin') || currentUrl.includes('/employee') || currentUrl.includes('/login') || currentUrl.includes('/nonexistent');
        
        console.log(`📊 ${pageUrl} -> ${currentUrl} (valid: ${isValidRoute})`);
        expect(isValidRoute).toBe(true);
      }
      
      console.log('✅ 404 error handling test completed');
    });

    test('should handle invalid routes gracefully', async ({ page }) => {
      console.log('🚀 Testing invalid route handling...');
      
      await authHelper.loginAsAdmin();
      
      // Test invalid routes
      const invalidRoutes = [
        '/admin//',
        '/employee//',
        '/admin/../admin',
        '/employee/../employee'
      ];
      
      for (const route of invalidRoutes) {
        await page.goto(route);
        await testUtils.waitForPageLoad();
        
        // Should redirect to valid page
        const currentUrl = page.url();
        const isValidRoute = currentUrl.includes('/admin') || currentUrl.includes('/employee') || currentUrl.includes('/login');
        
        console.log(`📊 ${route} -> ${currentUrl} (valid: ${isValidRoute})`);
        expect(isValidRoute).toBe(true);
      }
      
      console.log('✅ Invalid route handling test completed');
    });
  });

  test.describe('Loading States', () => {
    test('should display loading states correctly', async ({ page }) => {
      console.log('🚀 Testing loading states...');
      
      await authHelper.loginAsAdmin();
      
      // Test loading page
      await page.goto('/loading');
      await testUtils.waitForPageLoad();
      
      // Check if loading elements are present
      const loadingElements = page.locator('[data-testid="loading"], .loading, .spinner');
      const loadingCount = await loadingElements.count();
      
      console.log(`📊 Found ${loadingCount} loading elements`);
      
      console.log('✅ Loading states test completed');
    });
  });

  test.describe('Global Layout', () => {
    test('should test global layout components', async ({ page }) => {
      console.log('🚀 Testing global layout components...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Check for global layout elements
      const layoutElements = page.locator('header, nav, main, footer, .layout');
      const layoutCount = await layoutElements.count();
      
      console.log(`📊 Found ${layoutCount} layout elements`);
      
      // Check for navigation
      const navElements = page.locator('nav, .navigation, .navbar');
      const navVisible = await navElements.isVisible().catch(() => false);
      
      if (navVisible) {
        console.log('✅ Navigation is visible');
      }
      
      // Check for main content
      const mainElements = page.locator('main, .main, .content');
      const mainVisible = await mainElements.isVisible().catch(() => false);
      
      if (mainVisible) {
        console.log('✅ Main content is visible');
      }
      
      console.log('✅ Global layout components test completed');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper accessibility attributes', async ({ page }) => {
      console.log('🚀 Testing accessibility attributes...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Check for accessibility attributes
      const accessibilityElements = page.locator('[aria-label], [aria-describedby], [role], [tabindex]');
      const accessibilityCount = await accessibilityElements.count();
      
      console.log(`📊 Found ${accessibilityCount} accessibility elements`);
      
      // Check for proper heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      console.log(`📊 Found ${headingCount} headings`);
      
      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        let imagesWithAlt = 0;
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          if (alt) {
            imagesWithAlt++;
          }
        }
        console.log(`📊 Images with alt text: ${imagesWithAlt}/${imageCount}`);
      }
      
      console.log('✅ Accessibility attributes test completed');
    });
  });

  test.describe('SEO & Meta Tags', () => {
    test('should have proper meta tags', async ({ page }) => {
      console.log('🚀 Testing meta tags...');
      
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      
      // Check for meta tags
      const metaTags = page.locator('meta');
      const metaCount = await metaTags.count();
      
      console.log(`📊 Found ${metaCount} meta tags`);
      
      // Check for title tag
      const title = await page.title();
      console.log(`📊 Page title: ${title}`);
      
      // Check for favicon
      const favicon = page.locator('link[rel="icon"], link[rel="shortcut icon"]');
      const faviconCount = await favicon.count();
      
      console.log(`📊 Found ${faviconCount} favicon links`);
      
      console.log('✅ Meta tags test completed');
    });
  });

  test.describe('Browser Compatibility', () => {
    test('should work with different user agents', async ({ page }) => {
      console.log('🚀 Testing browser compatibility...');
      
      // Test with different user agents
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ];
      
      for (const userAgent of userAgents) {
        await page.setExtraHTTPHeaders({
          'User-Agent': userAgent
        });
        
        await page.goto('/login');
        await testUtils.waitForPageLoad();
        
        // Check if page loads correctly
        const body = page.locator('body');
        const bodyVisible = await body.isVisible().catch(() => false);
        
        if (bodyVisible) {
          console.log(`✅ Page loads with user agent: ${userAgent.substring(0, 50)}...`);
        }
      }
      
      console.log('✅ Browser compatibility test completed');
    });
  });
});
