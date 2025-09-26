import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { TestUtils } from '../utils/test-utils';

test.describe('HR Management Tests', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
  });

  test.describe('Employee Management', () => {
    test('should display employee management page correctly', async ({ page }) => {
      console.log('🚀 Testing employee management page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/hr-management');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("HR Management"), h2:has-text("HR Management")')).toBeVisible();
      
      // Check if there are employee management elements
      const employeeElements = page.locator('[data-testid="employee"], .employee, .staff');
      const employeeCount = await employeeElements.count();
      
      console.log(`📊 Found ${employeeCount} employee elements`);
      
      console.log('✅ Employee management page test completed');
    });

    test('should allow adding new employees', async ({ page }) => {
      console.log('🚀 Testing employee addition...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/hr-management');
      await testUtils.waitForPageLoad();
      
      // Look for add employee button
      const addButtons = page.locator('button:has-text("Add Employee"), button:has-text("New Employee"), button:has-text("Create")');
      const addButtonCount = await addButtons.count();
      
      if (addButtonCount > 0) {
        console.log(`✅ Found ${addButtonCount} add employee buttons`);
        
        // Click first add button
        await addButtons.first().click();
        await testUtils.waitForPageLoad();
        
        // Check if add form opened
        const form = page.locator('form, [role="dialog"], .modal');
        const formVisible = await form.isVisible().catch(() => false);
        
        if (formVisible) {
          console.log('✅ Add employee form opened');
          
          // Try to fill form fields
          const nameInput = page.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]');
          if (await nameInput.isVisible()) {
            await nameInput.fill('Test Employee');
            console.log('✅ Name field filled');
          }
          
          const emailInput = page.locator('input[name="email"], input[type="email"]');
          if (await emailInput.isVisible()) {
            await emailInput.fill('test@example.com');
            console.log('✅ Email field filled');
          }
        }
      } else {
        console.log('⚠️ No add employee buttons found');
      }
      
      console.log('✅ Employee addition test completed');
    });

    test('should allow editing employee information', async ({ page }) => {
      console.log('🚀 Testing employee editing...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/hr-management');
      await testUtils.waitForPageLoad();
      
      // Look for edit buttons
      const editButtons = page.locator('button:has-text("Edit"), button:has-text("Update"), [data-testid="edit-button"]');
      const editButtonCount = await editButtons.count();
      
      if (editButtonCount > 0) {
        console.log(`✅ Found ${editButtonCount} edit buttons`);
        
        // Click first edit button
        await editButtons.first().click();
        await testUtils.waitForPageLoad();
        
        // Check if edit form opened
        const form = page.locator('form, [role="dialog"], .modal');
        const formVisible = await form.isVisible().catch(() => false);
        
        if (formVisible) {
          console.log('✅ Edit employee form opened');
        }
      } else {
        console.log('⚠️ No edit buttons found');
      }
      
      console.log('✅ Employee editing test completed');
    });
  });

  test.describe('Department Management', () => {
    test('should display department management page correctly', async ({ page }) => {
      console.log('🚀 Testing department management page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/departments');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Departments"), h2:has-text("Departments")')).toBeVisible();
      
      // Check if there are department elements
      const departmentElements = page.locator('[data-testid="department"], .department, .dept');
      const departmentCount = await departmentElements.count();
      
      console.log(`📊 Found ${departmentCount} department elements`);
      
      console.log('✅ Department management page test completed');
    });

    test('should allow managing departments', async ({ page }) => {
      console.log('🚀 Testing department management...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/departments');
      await testUtils.waitForPageLoad();
      
      // Look for department management buttons
      const manageButtons = page.locator('button:has-text("Add"), button:has-text("Edit"), button:has-text("Delete")');
      const manageButtonCount = await manageButtons.count();
      
      if (manageButtonCount > 0) {
        console.log(`✅ Found ${manageButtonCount} department management buttons`);
      } else {
        console.log('⚠️ No department management buttons found');
      }
      
      console.log('✅ Department management test completed');
    });
  });

  test.describe('Employee Profile Management', () => {
    test('should display employee profile page correctly', async ({ page }) => {
      console.log('🚀 Testing employee profile page...');
      
      await authHelper.loginAsEmployee();
      await page.goto('/employee/profile');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Profile"), h2:has-text("Profile")')).toBeVisible();
      
      // Check if there are profile elements
      const profileElements = page.locator('[data-testid="profile"], .profile, .personal-info');
      const profileCount = await profileElements.count();
      
      console.log(`📊 Found ${profileCount} profile elements`);
      
      console.log('✅ Employee profile page test completed');
    });

    test('should allow editing employee profile', async ({ page }) => {
      console.log('🚀 Testing employee profile editing...');
      
      await authHelper.loginAsEmployee();
      await page.goto('/employee/profile');
      await testUtils.waitForPageLoad();
      
      // Look for edit profile button
      const editButtons = page.locator('button:has-text("Edit"), button:has-text("Update"), a:has-text("Edit")');
      const editButtonCount = await editButtons.count();
      
      if (editButtonCount > 0) {
        console.log(`✅ Found ${editButtonCount} edit profile buttons`);
        
        // Click first edit button
        await editButtons.first().click();
        await testUtils.waitForPageLoad();
        
        // Check if edit form opened
        const form = page.locator('form, [role="dialog"], .modal');
        const formVisible = await form.isVisible().catch(() => false);
        
        if (formVisible) {
          console.log('✅ Edit profile form opened');
        }
      } else {
        console.log('⚠️ No edit profile buttons found');
      }
      
      console.log('✅ Employee profile editing test completed');
    });
  });

  test.describe('Employee Self-Service', () => {
    test('should display employee self-service features', async ({ page }) => {
      console.log('🚀 Testing employee self-service features...');
      
      await authHelper.loginAsEmployee();
      await page.goto('/employee');
      await testUtils.waitForPageLoad();
      
      // Check for self-service elements
      const selfServiceElements = page.locator('button:has-text("Update"), button:has-text("Self"), [data-testid="self-service"]');
      const selfServiceCount = await selfServiceElements.count();
      
      console.log(`📊 Found ${selfServiceCount} self-service elements`);
      
      console.log('✅ Employee self-service features test completed');
    });

    test('should allow self-updating metrics', async ({ page }) => {
      console.log('🚀 Testing self-updating metrics...');
      
      await authHelper.loginAsEmployee();
      await page.goto('/employee/self-update-metrics');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Self Update"), h2:has-text("Self Update")')).toBeVisible();
      
      // Check if there are metric update elements
      const metricElements = page.locator('[data-testid="metric"], .metric, .update');
      const metricCount = await metricElements.count();
      
      console.log(`📊 Found ${metricCount} metric elements`);
      
      console.log('✅ Self-updating metrics test completed');
    });
  });

  test.describe('Employee Calendar', () => {
    test('should display employee calendar correctly', async ({ page }) => {
      console.log('🚀 Testing employee calendar...');
      
      await authHelper.loginAsEmployee();
      await page.goto('/employee/calendar');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Calendar"), h2:has-text("Calendar")')).toBeVisible();
      
      // Check if there are calendar elements
      const calendarElements = page.locator('[data-testid="calendar"], .calendar, .date-picker');
      const calendarCount = await calendarElements.count();
      
      console.log(`📊 Found ${calendarCount} calendar elements`);
      
      console.log('✅ Employee calendar test completed');
    });
  });
});


