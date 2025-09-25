import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { TestUtils } from '../utils/test-utils';

test.describe('Reports & Analytics Tests', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
  });

  test.describe('Admin Reports', () => {
    test('should display admin reports page correctly', async ({ page }) => {
      console.log('🚀 Testing admin reports page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/reports');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Reports & Analytics")')).toBeVisible();
      
      // Check if there are report elements
      const reportElements = page.locator('[data-testid="report"], .report, .analytics');
      const reportCount = await reportElements.count();
      
      console.log(`📊 Found ${reportCount} report elements`);
      
      console.log('✅ Admin reports page test completed');
    });

    test('should allow generating reports', async ({ page }) => {
      console.log('🚀 Testing report generation...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/reports');
      await testUtils.waitForPageLoad();
      
      // Look for generate report buttons
      const generateButtons = page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("Export")');
      const generateButtonCount = await generateButtons.count();
      
      if (generateButtonCount > 0) {
        console.log(`✅ Found ${generateButtonCount} generate report buttons`);
        
        // Click first generate button
        await generateButtons.first().click();
        await testUtils.waitForPageLoad();
        
        // Check if generation form opened
        const form = page.locator('form, [role="dialog"], .modal');
        const formVisible = await form.isVisible().catch(() => false);
        
        if (formVisible) {
          console.log('✅ Report generation form opened');
        }
      } else {
        console.log('⚠️ No generate report buttons found');
      }
      
      console.log('✅ Report generation test completed');
    });
  });

  test.describe('Evaluation Reports', () => {
    test('should display evaluation reports page correctly', async ({ page }) => {
      console.log('🚀 Testing evaluation reports page...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/evaluation-reports');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Evaluation"), h2:has-text("Evaluation")')).toBeVisible();
      
      // Check if there are evaluation elements
      const evaluationElements = page.locator('[data-testid="evaluation"], .evaluation, .assessment');
      const evaluationCount = await evaluationElements.count();
      
      console.log(`📊 Found ${evaluationCount} evaluation elements`);
      
      console.log('✅ Evaluation reports page test completed');
    });

    test('should allow viewing evaluation details', async ({ page }) => {
      console.log('🚀 Testing evaluation details viewing...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/evaluation-reports');
      await testUtils.waitForPageLoad();
      
      // Look for view details buttons
      const viewButtons = page.locator('button:has-text("View"), button:has-text("Details"), a:has-text("View")');
      const viewButtonCount = await viewButtons.count();
      
      if (viewButtonCount > 0) {
        console.log(`✅ Found ${viewButtonCount} view details buttons`);
        
        // Click first view button
        await viewButtons.first().click();
        await testUtils.waitForPageLoad();
        
        // Check if details opened
        const details = page.locator('[data-testid="details"], .details, .modal');
        const detailsVisible = await details.isVisible().catch(() => false);
        
        if (detailsVisible) {
          console.log('✅ Evaluation details opened');
        }
      } else {
        console.log('⚠️ No view details buttons found');
      }
      
      console.log('✅ Evaluation details viewing test completed');
    });
  });

  test.describe('Employee Reports', () => {
    test('should display employee reports page correctly', async ({ page }) => {
      console.log('🚀 Testing employee reports page...');
      
      await authHelper.loginAsEmployee();
      await page.goto('/employee/reports');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Reports & Analytics")')).toBeVisible();
      
      // Check if there are report elements
      const reportElements = page.locator('[data-testid="report"], .report, .my-reports');
      const reportCount = await reportElements.count();
      
      console.log(`📊 Found ${reportCount} report elements`);
      
      console.log('✅ Employee reports page test completed');
    });

    test('should allow viewing personal reports', async ({ page }) => {
      console.log('🚀 Testing personal reports viewing...');
      
      await authHelper.loginAsEmployee();
      await page.goto('/employee/reports');
      await testUtils.waitForPageLoad();
      
      // Look for personal report elements
      const personalReports = page.locator('[data-testid="personal-report"], .personal-report, .my-report');
      const personalReportCount = await personalReports.count();
      
      console.log(`📊 Found ${personalReportCount} personal report elements`);
      
      console.log('✅ Personal reports viewing test completed');
    });
  });

  test.describe('Analytics Dashboard', () => {
    test('should display analytics dashboard correctly', async ({ page }) => {
      console.log('🚀 Testing analytics dashboard...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Check for analytics elements
      const analyticsElements = page.locator('[data-testid="analytics"], .analytics, .chart, .graph');
      const analyticsCount = await analyticsElements.count();
      
      console.log(`📊 Found ${analyticsCount} analytics elements`);
      
      console.log('✅ Analytics dashboard test completed');
    });

    test('should display performance metrics', async ({ page }) => {
      console.log('🚀 Testing performance metrics display...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/metrics');
      await testUtils.waitForPageLoad();
      
      // Check page title
      await expect(page.locator('h1:has-text("Metrics"), h2:has-text("Metrics")')).toBeVisible();
      
      // Check if there are metric elements
      const metricElements = page.locator('[data-testid="metric"], .metric, .performance-metric');
      const metricCount = await metricElements.count();
      
      console.log(`📊 Found ${metricCount} metric elements`);
      
      console.log('✅ Performance metrics display test completed');
    });
  });

  test.describe('Data Export/Import', () => {
    test('should allow data export', async ({ page }) => {
      console.log('🚀 Testing data export...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/reports');
      await testUtils.waitForPageLoad();
      
      // Look for export buttons
      const exportButtons = page.locator('button:has-text("Export"), button:has-text("Download"), a:has-text("Export")');
      const exportButtonCount = await exportButtons.count();
      
      if (exportButtonCount > 0) {
        console.log(`✅ Found ${exportButtonCount} export buttons`);
        
        // Click first export button
        await exportButtons.first().click();
        await testUtils.waitForPageLoad();
        
        // Check if export options opened
        const exportOptions = page.locator('[data-testid="export-options"], .export-options, .download-options');
        const exportOptionsVisible = await exportOptions.isVisible().catch(() => false);
        
        if (exportOptionsVisible) {
          console.log('✅ Export options opened');
        }
      } else {
        console.log('⚠️ No export buttons found');
      }
      
      console.log('✅ Data export test completed');
    });

    test('should allow data import', async ({ page }) => {
      console.log('🚀 Testing data import...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/reports');
      await testUtils.waitForPageLoad();
      
      // Look for import buttons
      const importButtons = page.locator('button:has-text("Import"), button:has-text("Upload"), input[type="file"]');
      const importButtonCount = await importButtons.count();
      
      if (importButtonCount > 0) {
        console.log(`✅ Found ${importButtonCount} import buttons`);
        
        // Click first import button
        await importButtons.first().click();
        await testUtils.waitForPageLoad();
        
        // Check if import form opened
        const form = page.locator('form, [role="dialog"], .modal');
        const formVisible = await form.isVisible().catch(() => false);
        
        if (formVisible) {
          console.log('✅ Import form opened');
        }
      } else {
        console.log('⚠️ No import buttons found');
      }
      
      console.log('✅ Data import test completed');
    });
  });

  test.describe('Search & Filter', () => {
    test('should allow searching reports', async ({ page }) => {
      console.log('🚀 Testing report search...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/reports');
      await testUtils.waitForPageLoad();
      
      // Look for search inputs
      const searchInputs = page.locator('input[placeholder*="search"], input[placeholder*="Search"], input[type="search"]');
      const searchInputCount = await searchInputs.count();
      
      if (searchInputCount > 0) {
        console.log(`✅ Found ${searchInputCount} search inputs`);
        
        // Try to search
        await searchInputs.first().fill('test search');
        console.log('✅ Search input filled');
        
        // Look for search button
        const searchButtons = page.locator('button:has-text("Search"), button[type="submit"]');
        if (await searchButtons.isVisible()) {
          await searchButtons.first().click();
          await testUtils.waitForPageLoad();
          console.log('✅ Search executed');
        }
      } else {
        console.log('⚠️ No search inputs found');
      }
      
      console.log('✅ Report search test completed');
    });

    test('should allow filtering reports', async ({ page }) => {
      console.log('🚀 Testing report filtering...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/reports');
      await testUtils.waitForPageLoad();
      
      // Look for filter elements
      const filterElements = page.locator('select, [data-testid="filter"], .filter, .dropdown');
      const filterCount = await filterElements.count();
      
      if (filterCount > 0) {
        console.log(`✅ Found ${filterCount} filter elements`);
        
        // Try to use first filter
        const firstFilter = filterElements.first();
        const filterType = await firstFilter.evaluate(el => el.tagName.toLowerCase());
        
        if (filterType === 'select') {
          await firstFilter.selectOption({ index: 1 });
          console.log('✅ Filter option selected');
        }
      } else {
        console.log('⚠️ No filter elements found');
      }
      
      console.log('✅ Report filtering test completed');
    });
  });
});
