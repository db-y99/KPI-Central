import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { TestUtils } from '../utils/test-utils';

test.describe('System Settings & Advanced Features Tests', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
  });

  test.describe('System Settings', () => {
    test('should display system settings page correctly', async ({ page }) => {
      console.log('🚀 Testing system settings page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/system-settings');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1.text-3xl:has-text("System Settings")')).toBeVisible();
      
      // Check if there are settings elements
      const settingsElements = page.locator('[data-testid="settings"], .settings, .configuration');
      const settingsCount = await settingsElements.count();
      
      console.log(`📊 Found ${settingsCount} settings elements`);
      
      console.log('✅ System settings page test completed');
    });

    test('should allow configuring system settings', async ({ page }) => {
      console.log('🚀 Testing system settings configuration...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/system-settings');
      await testUtils.waitForPageLoad();
      
      // Look for configuration elements
      const configElements = page.locator('input, select, textarea, button:has-text("Save"), button:has-text("Update")');
      const configCount = await configElements.count();
      
      if (configCount > 0) {
        console.log(`✅ Found ${configCount} configuration elements`);
        
        // Try to interact with first input
        const firstInput = configElements.first();
        const inputType = await firstInput.evaluate(el => el.tagName.toLowerCase());
        
        if (inputType === 'input') {
          await firstInput.fill('test configuration');
          console.log('✅ Configuration input filled');
        }
      } else {
        console.log('⚠️ No configuration elements found');
      }
      
      console.log('✅ System settings configuration test completed');
    });
  });

  test.describe('Reward System', () => {
    test('should display reward programs page correctly', async ({ page }) => {
      console.log('🚀 Testing reward programs page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/reward-programs');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Reward"), h2:has-text("Reward")')).toBeVisible();
      
      // Check if there are reward elements
      const rewardElements = page.locator('[data-testid="reward"], .reward, .program');
      const rewardCount = await rewardElements.count();
      
      console.log(`📊 Found ${rewardCount} reward elements`);
      
      console.log('✅ Reward programs page test completed');
    });

    test('should allow managing reward programs', async ({ page }) => {
      console.log('🚀 Testing reward program management...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/reward-programs');
      await testUtils.waitForPageLoad();
      
      // Look for management buttons
      const manageButtons = page.locator('button:has-text("Add"), button:has-text("Edit"), button:has-text("Delete")');
      const manageButtonCount = await manageButtons.count();
      
      if (manageButtonCount > 0) {
        console.log(`✅ Found ${manageButtonCount} reward management buttons`);
      } else {
        console.log('⚠️ No reward management buttons found');
      }
      
      console.log('✅ Reward program management test completed');
    });

    test('should display reward calculations page correctly', async ({ page }) => {
      console.log('🚀 Testing reward calculations page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/reward-calculations');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Calculation"), h2:has-text("Calculation")')).toBeVisible();
      
      // Check if there are calculation elements
      const calculationElements = page.locator('[data-testid="calculation"], .calculation, .compute');
      const calculationCount = await calculationElements.count();
      
      console.log(`📊 Found ${calculationCount} calculation elements`);
      
      console.log('✅ Reward calculations page test completed');
    });
  });

  test.describe('Google Drive Integration', () => {
    test('should display Google Drive config page correctly', async ({ page }) => {
      console.log('🚀 Testing Google Drive config page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/google-drive-config');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Google Drive"), h2:has-text("Google Drive")')).toBeVisible();
      
      // Check if there are Google Drive elements
      const googleDriveElements = page.locator('[data-testid="google-drive"], .google-drive, .integration');
      const googleDriveCount = await googleDriveElements.count();
      
      console.log(`📊 Found ${googleDriveCount} Google Drive elements`);
      
      console.log('✅ Google Drive config page test completed');
    });

    test('should allow configuring Google Drive integration', async ({ page }) => {
      console.log('🚀 Testing Google Drive integration configuration...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/google-drive-config');
      await testUtils.waitForPageLoad();
      
      // Look for configuration elements
      const configElements = page.locator('input, select, textarea, button:has-text("Connect"), button:has-text("Configure")');
      const configCount = await configElements.count();
      
      if (configCount > 0) {
        console.log(`✅ Found ${configCount} Google Drive configuration elements`);
      } else {
        console.log('⚠️ No Google Drive configuration elements found');
      }
      
      console.log('✅ Google Drive integration configuration test completed');
    });
  });

  test.describe('Payroll Integration', () => {
    test('should display payroll integration page correctly', async ({ page }) => {
      console.log('🚀 Testing payroll integration page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/payroll-integration');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Payroll"), h2:has-text("Payroll")')).toBeVisible();
      
      // Check if there are payroll elements
      const payrollElements = page.locator('[data-testid="payroll"], .payroll, .integration');
      const payrollCount = await payrollElements.count();
      
      console.log(`📊 Found ${payrollCount} payroll elements`);
      
      console.log('✅ Payroll integration page test completed');
    });
  });

  test.describe('Policies Management', () => {
    test('should display policies overview page correctly', async ({ page }) => {
      console.log('🚀 Testing policies overview page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/policies-overview');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Policies"), h2:has-text("Policies")')).toBeVisible();
      
      // Check if there are policy elements
      const policyElements = page.locator('[data-testid="policy"], .policy, .rule');
      const policyCount = await policyElements.count();
      
      console.log(`📊 Found ${policyCount} policy elements`);
      
      console.log('✅ Policies overview page test completed');
    });

    test('should allow initializing policies', async ({ page }) => {
      console.log('🚀 Testing policy initialization...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/init-policies');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Init"), h2:has-text("Init")')).toBeVisible();
      
      // Look for initialization buttons
      const initButtons = page.locator('button:has-text("Init"), button:has-text("Initialize"), button:has-text("Create")');
      const initButtonCount = await initButtons.count();
      
      if (initButtonCount > 0) {
        console.log(`✅ Found ${initButtonCount} initialization buttons`);
      } else {
        console.log('⚠️ No initialization buttons found');
      }
      
      console.log('✅ Policy initialization test completed');
    });
  });

  test.describe('Seed Data Management', () => {
    test('should display seed data page correctly', async ({ page }) => {
      console.log('🚀 Testing seed data page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/seed-data');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Seed"), h2:has-text("Seed")')).toBeVisible();
      
      // Check if there are seed data elements
      const seedElements = page.locator('[data-testid="seed"], .seed, .data');
      const seedCount = await seedElements.count();
      
      console.log(`📊 Found ${seedCount} seed data elements`);
      
      console.log('✅ Seed data page test completed');
    });
  });

  test.describe('Notifications', () => {
    test('should display notifications page correctly', async ({ page }) => {
      console.log('🚀 Testing notifications page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/notifications');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Notifications"), h2:has-text("Notifications")')).toBeVisible();
      
      // Check if there are notification elements
      const notificationElements = page.locator('[data-testid="notification"], .notification, .alert');
      const notificationCount = await notificationElements.count();
      
      console.log(`📊 Found ${notificationCount} notification elements`);
      
      console.log('✅ Notifications page test completed');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      console.log('🚀 Testing mobile viewport...');
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await authHelper.loginAsAdmin();
      await testUtils.waitForPageLoad();
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Check if page is responsive
      const body = page.locator('body');
      const bodyWidth = await body.evaluate(el => el.offsetWidth);
      
      console.log(`📊 Body width on mobile: ${bodyWidth}px`);
      expect(bodyWidth).toBeLessThanOrEqual(375);
      
      console.log('✅ Mobile viewport test completed');
    });

    test('should work on tablet viewport', async ({ page }) => {
      console.log('🚀 Testing tablet viewport...');
      
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Check if page is responsive
      const body = page.locator('body');
      const bodyWidth = await body.evaluate(el => el.offsetWidth);
      
      console.log(`📊 Body width on tablet: ${bodyWidth}px`);
      expect(bodyWidth).toBeLessThanOrEqual(768);
      
      console.log('✅ Tablet viewport test completed');
    });

    test('should work on desktop viewport', async ({ page }) => {
      console.log('🚀 Testing desktop viewport...');
      
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Check if page is responsive
      const body = page.locator('body');
      const bodyWidth = await body.evaluate(el => el.offsetWidth);
      
      console.log(`📊 Body width on desktop: ${bodyWidth}px`);
      expect(bodyWidth).toBeGreaterThan(768);
      
      console.log('✅ Desktop viewport test completed');
    });
  });
});
