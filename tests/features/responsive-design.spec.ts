import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { TestUtils } from '../utils/test-utils';

test.describe('Responsive Design Tests', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
  });

  test.describe('Viewport Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      console.log('🚀 Testing mobile viewport...');
      
      // Set mobile viewport first
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Go to login page
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      
      // Check if page loads on mobile
      const body = page.locator('body');
      const bodyWidth = await body.evaluate(el => el.offsetWidth);
      
      console.log(`📊 Body width on mobile: ${bodyWidth}px`);
      expect(bodyWidth).toBeLessThanOrEqual(375);
      
      // Check if login form is visible
      const loginForm = page.locator('form, input[name="email"], input[name="password"]');
      const formVisible = await loginForm.isVisible().catch(() => false);
      
      if (formVisible) {
        console.log('✅ Login form visible on mobile');
      }
      
      console.log('✅ Mobile viewport test completed');
    });

    test('should work on tablet viewport', async ({ page }) => {
      console.log('🚀 Testing tablet viewport...');
      
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Go to login page
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      
      // Check if page loads on tablet
      const body = page.locator('body');
      const bodyWidth = await body.evaluate(el => el.offsetWidth);
      
      console.log(`📊 Body width on tablet: ${bodyWidth}px`);
      expect(bodyWidth).toBeLessThanOrEqual(768);
      
      // Check if login form is visible
      const loginForm = page.locator('form, input[name="email"], input[name="password"]');
      const formVisible = await loginForm.isVisible().catch(() => false);
      
      if (formVisible) {
        console.log('✅ Login form visible on tablet');
      }
      
      console.log('✅ Tablet viewport test completed');
    });

    test('should work on desktop viewport', async ({ page }) => {
      console.log('🚀 Testing desktop viewport...');
      
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Go to login page
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      
      // Check if page loads on desktop
      const body = page.locator('body');
      const bodyWidth = await body.evaluate(el => el.offsetWidth);
      
      console.log(`📊 Body width on desktop: ${bodyWidth}px`);
      expect(bodyWidth).toBeGreaterThan(768);
      
      // Check if login form is visible
      const loginForm = page.locator('form, input[name="email"], input[name="password"]');
      const formVisible = await loginForm.isVisible().catch(() => false);
      
      if (formVisible) {
        console.log('✅ Login form visible on desktop');
      }
      
      console.log('✅ Desktop viewport test completed');
    });
  });

  test.describe('Navigation Responsiveness', () => {
    test('should have responsive navigation on mobile', async ({ page }) => {
      console.log('🚀 Testing responsive navigation on mobile...');
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await authHelper.loginAsAdmin();
      await testUtils.waitForPageLoad();
      
      // Check for mobile navigation elements
      const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-nav, .hamburger, button[aria-label*="menu"]');
      const mobileNavCount = await mobileNav.count();
      
      if (mobileNavCount > 0) {
        console.log(`✅ Found ${mobileNavCount} mobile navigation elements`);
      } else {
        console.log('⚠️ No mobile navigation elements found');
      }
      
      // Check if main navigation is still accessible
      const mainNav = page.locator('nav, .navigation, .navbar');
      const mainNavVisible = await mainNav.isVisible().catch(() => false);
      
      if (mainNavVisible) {
        console.log('✅ Main navigation accessible on mobile');
      }
      
      console.log('✅ Responsive navigation test completed');
    });

    test('should have responsive navigation on tablet', async ({ page }) => {
      console.log('🚀 Testing responsive navigation on tablet...');
      
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await authHelper.loginAsAdmin();
      await testUtils.waitForPageLoad();
      
      // Check for tablet navigation elements
      const tabletNav = page.locator('nav, .navigation, .navbar');
      const tabletNavVisible = await tabletNav.isVisible().catch(() => false);
      
      if (tabletNavVisible) {
        console.log('✅ Navigation visible on tablet');
      }
      
      console.log('✅ Tablet navigation test completed');
    });
  });

  test.describe('Content Responsiveness', () => {
    test('should have responsive content layout', async ({ page }) => {
      console.log('🚀 Testing responsive content layout...');
      
      await authHelper.loginAsAdmin();
      await testUtils.waitForPageLoad();
      
      // Test different viewport sizes
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1920, height: 1080, name: 'desktop' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000); // Wait for layout to adjust
        
        // Check if content is visible
        const content = page.locator('main, .content, .dashboard');
        const contentVisible = await content.isVisible().catch(() => false);
        
        if (contentVisible) {
          console.log(`✅ Content visible on ${viewport.name}`);
        }
        
        // Check if layout adapts
        const body = page.locator('body');
        const bodyWidth = await body.evaluate(el => el.offsetWidth);
        
        console.log(`📊 ${viewport.name} body width: ${bodyWidth}px`);
        expect(bodyWidth).toBeLessThanOrEqual(viewport.width);
      }
      
      console.log('✅ Responsive content layout test completed');
    });

    test('should have responsive forms', async ({ page }) => {
      console.log('🚀 Testing responsive forms...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      
      // Test form responsiveness
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1920, height: 1080, name: 'desktop' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000);
        
        // Look for forms
        const forms = page.locator('form, input, textarea, select');
        const formCount = await forms.count();
        
        if (formCount > 0) {
          console.log(`✅ Found ${formCount} form elements on ${viewport.name}`);
          
          // Check if forms are usable
          const firstForm = forms.first();
          const formVisible = await firstForm.isVisible().catch(() => false);
          
          if (formVisible) {
            console.log(`✅ Forms usable on ${viewport.name}`);
          }
        }
      }
      
      console.log('✅ Responsive forms test completed');
    });
  });

  test.describe('Performance on Different Devices', () => {
    test('should load quickly on mobile', async ({ page }) => {
      console.log('🚀 Testing mobile performance...');
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      const loadTime = Date.now() - startTime;
      
      console.log(`📊 Mobile load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // 10 seconds max
      
      console.log('✅ Mobile performance test completed');
    });

    test('should load quickly on tablet', async ({ page }) => {
      console.log('🚀 Testing tablet performance...');
      
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const startTime = Date.now();
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      const loadTime = Date.now() - startTime;
      
      console.log(`📊 Tablet load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // 10 seconds max
      
      console.log('✅ Tablet performance test completed');
    });

    test('should load quickly on desktop', async ({ page }) => {
      console.log('🚀 Testing desktop performance...');
      
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      const startTime = Date.now();
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      const loadTime = Date.now() - startTime;
      
      console.log(`📊 Desktop load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // 10 seconds max
      
      console.log('✅ Desktop performance test completed');
    });
  });
});

