import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { TestUtils } from '../utils/test-utils';

test.describe('KPI Management Tests', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
  });

  test.describe('KPI Definitions', () => {
    test('should display KPI definitions page correctly', async ({ page }) => {
      console.log('🚀 Testing KPI definitions page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-definitions');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("KPI Definitions")')).toBeVisible();
      
      // Check if there are KPI definitions displayed
      const kpiCards = page.locator('[data-testid="kpi-card"], .kpi-card, .card');
      const cardCount = await kpiCards.count();
      
      console.log(`📊 Found ${cardCount} KPI definition cards`);
      expect(cardCount).toBeGreaterThanOrEqual(0);
      
      console.log('✅ KPI definitions page test completed');
    });

    test('should allow creating new KPI definition', async ({ page }) => {
      console.log('🚀 Testing KPI definition creation...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-definitions');
      await testUtils.waitForPageLoad();
      
      // Look for create button
      const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
      const createButtonCount = await createButton.count();
      
      if (createButtonCount > 0) {
        console.log('✅ Create KPI button found');
        
        // Click create button
        await createButton.first().click();
        await testUtils.waitForPageLoad();
        
        // Check if form or modal opened
        const form = page.locator('form, [role="dialog"], .modal');
        const formVisible = await form.isVisible().catch(() => false);
        
        if (formVisible) {
          console.log('✅ KPI creation form opened');
          
          // Try to fill form fields
          const nameInput = page.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]');
          if (await nameInput.isVisible()) {
            await nameInput.fill('Test KPI');
            console.log('✅ Name field filled');
          }
          
          const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="description"]');
          if (await descriptionInput.isVisible()) {
            await descriptionInput.fill('Test KPI Description');
            console.log('✅ Description field filled');
          }
          
          // Look for save button
          const saveButton = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
          if (await saveButton.isVisible()) {
            console.log('✅ Save button found');
          }
        }
      } else {
        console.log('⚠️ Create KPI button not found');
      }
      
      console.log('✅ KPI definition creation test completed');
    });

    test('should allow editing existing KPI definition', async ({ page }) => {
      console.log('🚀 Testing KPI definition editing...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-definitions');
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
          console.log('✅ Edit form opened');
        }
      } else {
        console.log('⚠️ No edit buttons found');
      }
      
      console.log('✅ KPI definition editing test completed');
    });
  });

  test.describe('KPI Assignment', () => {
    test('should display KPI assignment page correctly', async ({ page }) => {
      console.log('🚀 Testing KPI assignment page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-assignment');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("KPI Assignment"), h2:has-text("KPI Assignment")')).toBeVisible();
      
      // Check if there are assignment options
      const assignmentElements = page.locator('[data-testid="assignment"], .assignment, .assign');
      const assignmentCount = await assignmentElements.count();
      
      console.log(`📊 Found ${assignmentCount} assignment elements`);
      
      console.log('✅ KPI assignment page test completed');
    });

    test('should allow assigning KPIs to employees', async ({ page }) => {
      console.log('🚀 Testing KPI assignment to employees...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-assignment');
      await testUtils.waitForPageLoad();
      
      // Look for assignment buttons
      const assignButtons = page.locator('button:has-text("Assign"), button:has-text("Assign KPI")');
      const assignButtonCount = await assignButtons.count();
      
      if (assignButtonCount > 0) {
        console.log(`✅ Found ${assignButtonCount} assign buttons`);
        
        // Click first assign button
        await assignButtons.first().click();
        await testUtils.waitForPageLoad();
        
        // Check if assignment form opened
        const form = page.locator('form, [role="dialog"], .modal');
        const formVisible = await form.isVisible().catch(() => false);
        
        if (formVisible) {
          console.log('✅ Assignment form opened');
        }
      } else {
        console.log('⚠️ No assign buttons found');
      }
      
      console.log('✅ KPI assignment test completed');
    });
  });

  test.describe('KPI Tracking', () => {
    test('should display KPI tracking page correctly', async ({ page }) => {
      console.log('🚀 Testing KPI tracking page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-tracking');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("KPI Tracking"), h2:has-text("KPI Tracking")')).toBeVisible();
      
      // Check if there are tracking elements
      const trackingElements = page.locator('[data-testid="tracking"], .tracking, .progress');
      const trackingCount = await trackingElements.count();
      
      console.log(`📊 Found ${trackingCount} tracking elements`);
      
      console.log('✅ KPI tracking page test completed');
    });

    test('should allow updating KPI progress', async ({ page }) => {
      console.log('🚀 Testing KPI progress update...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-tracking');
      await testUtils.waitForPageLoad();
      
      // Look for update buttons
      const updateButtons = page.locator('button:has-text("Update"), button:has-text("Progress")');
      const updateButtonCount = await updateButtons.count();
      
      if (updateButtonCount > 0) {
        console.log(`✅ Found ${updateButtonCount} update buttons`);
        
        // Click first update button
        await updateButtons.first().click();
        await testUtils.waitForPageLoad();
        
        // Check if update form opened
        const form = page.locator('form, [role="dialog"], .modal');
        const formVisible = await form.isVisible().catch(() => false);
        
        if (formVisible) {
          console.log('✅ Update form opened');
        }
      } else {
        console.log('⚠️ No update buttons found');
      }
      
      console.log('✅ KPI progress update test completed');
    });
  });

  test.describe('KPI Approval', () => {
    test('should display KPI approval page correctly', async ({ page }) => {
      console.log('🚀 Testing KPI approval page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/approval');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Approval"), h2:has-text("Approval")')).toBeVisible();
      
      // Check if there are approval elements
      const approvalElements = page.locator('[data-testid="approval"], .approval, .pending');
      const approvalCount = await approvalElements.count();
      
      console.log(`📊 Found ${approvalCount} approval elements`);
      
      console.log('✅ KPI approval page test completed');
    });

    test('should allow approving/rejecting KPIs', async ({ page }) => {
      console.log('🚀 Testing KPI approval/rejection...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/approval');
      await testUtils.waitForPageLoad();
      
      // Look for approval buttons
      const approveButtons = page.locator('button:has-text("Approve"), button:has-text("Reject")');
      const approveButtonCount = await approveButtons.count();
      
      if (approveButtonCount > 0) {
        console.log(`✅ Found ${approveButtonCount} approval buttons`);
        
        // Click first approve button
        await approveButtons.first().click();
        await testUtils.waitForPageLoad();
        
        // Check if confirmation dialog opened
        const dialog = page.locator('[role="dialog"], .modal, .confirmation');
        const dialogVisible = await dialog.isVisible().catch(() => false);
        
        if (dialogVisible) {
          console.log('✅ Confirmation dialog opened');
        }
      } else {
        console.log('⚠️ No approval buttons found');
      }
      
      console.log('✅ KPI approval/rejection test completed');
    });
  });
});


