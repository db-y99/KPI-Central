import { Page, expect } from '@playwright/test';
import { TestUtils, TEST_DATA, SELECTORS } from './test-utils';

/**
 * KPI management helper functions for testing
 */
export class KPIHelper extends TestUtils {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to KPI management page
   */
  async navigateToKPIManagement() {
    console.log('📊 Navigating to KPI management...');
    
    await this.page.goto('/admin/kpi-management');
    await this.waitForPageLoad();
    await this.waitForLoadingComplete();
    
    // Verify KPI management page is loaded
    await this.waitForElement('h1:has-text("KPI Management"), h2:has-text("KPI Management"), [data-testid="page-title"]:has-text("KPI Management")');
    
    console.log('✅ KPI management page loaded');
  }

  /**
   * Create a new KPI
   */
  async createKPI(kpiData = TEST_DATA.KPI) {
    console.log('➕ Creating new KPI...');
    
    await this.navigateToKPIManagement();
    
    // Click add KPI button
    await this.clickButton('button:has-text("Create KPI")');
    
    // Wait for form modal
    await this.waitForElement(SELECTORS.MODAL);
    
    // Fill KPI form
    await this.fillFormField('input[name="name"]', kpiData.name);
    await this.fillFormField('textarea[name="description"]', kpiData.description);
    await this.fillFormField('input[name="target"]', kpiData.target.toString());
    await this.fillFormField('input[name="unit"]', kpiData.unit);
    await this.fillFormField('input[name="weight"]', kpiData.weight.toString());
    
    // Select category if dropdown exists
    const categorySelect = this.page.locator('select[name="category"]');
    if (await this.elementExists('select[name="category"]')) {
      await categorySelect.selectOption(kpiData.category);
    }
    
    // Submit form
    await this.clickButton(SELECTORS.FORM_SUBMIT);
    
    // Wait for success message
    await this.waitForToast('KPI đã được tạo thành công');
    
    // Wait for modal to close
    await this.waitForElementHidden(SELECTORS.MODAL);
    
    console.log('✅ KPI created successfully');
  }

  /**
   * Edit an existing KPI
   */
  async editKPI(kpiName: string, updates: Partial<typeof TEST_DATA.KPI>) {
    console.log(`✏️ Editing KPI: ${kpiName}`);
    
    await this.navigateToKPIManagement();
    
    // Find and click edit button for the KPI
    const kpiRow = this.page.locator(`tr:has-text("${kpiName}")`);
    await kpiRow.locator('button:has-text("Sửa")').click();
    
    // Wait for edit form
    await this.waitForElement(SELECTORS.MODAL);
    
    // Update fields if provided
    if (updates.name) {
      await this.fillFormField('input[name="name"]', updates.name);
    }
    if (updates.description) {
      await this.fillFormField('textarea[name="description"]', updates.description);
    }
    if (updates.target) {
      await this.fillFormField('input[name="target"]', updates.target.toString());
    }
    if (updates.unit) {
      await this.fillFormField('input[name="unit"]', updates.unit);
    }
    if (updates.weight) {
      await this.fillFormField('input[name="weight"]', updates.weight.toString());
    }
    
    // Submit form
    await this.clickButton(SELECTORS.FORM_SUBMIT);
    
    // Wait for success message
    await this.waitForToast('KPI đã được cập nhật');
    
    // Wait for modal to close
    await this.waitForElementHidden(SELECTORS.MODAL);
    
    console.log('✅ KPI updated successfully');
  }

  /**
   * Delete a KPI
   */
  async deleteKPI(kpiName: string) {
    console.log(`🗑️ Deleting KPI: ${kpiName}`);
    
    await this.navigateToKPIManagement();
    
    // Find and click delete button for the KPI
    const kpiRow = this.page.locator(`tr:has-text("${kpiName}")`);
    await kpiRow.locator('button:has-text("Xóa")').click();
    
    // Wait for confirmation dialog
    await this.waitForElement('text=Xác nhận xóa');
    
    // Confirm deletion
    await this.clickButton('button:has-text("Xác nhận")');
    
    // Wait for success message
    await this.waitForToast('KPI đã được xóa');
    
    console.log('✅ KPI deleted successfully');
  }

  /**
   * Assign KPI to employee
   */
  async assignKPIToEmployee(kpiName: string, employeeEmail: string) {
    console.log(`👤 Assigning KPI "${kpiName}" to employee: ${employeeEmail}`);
    
    await this.navigateToKPIManagement();
    
    // Find KPI and click assign button
    const kpiRow = this.page.locator(`tr:has-text("${kpiName}")`);
    await kpiRow.locator('button:has-text("Giao")').click();
    
    // Wait for assignment form
    await this.waitForElement(SELECTORS.MODAL);
    
    // Select employee
    const employeeSelect = this.page.locator('select[name="employeeId"]');
    await employeeSelect.selectOption({ label: employeeEmail });
    
    // Set assignment details
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // 3 months from now
    
    await this.fillFormField('input[name="startDate"]', startDate.toISOString().split('T')[0]);
    await this.fillFormField('input[name="endDate"]', endDate.toISOString().split('T')[0]);
    
    // Submit assignment
    await this.clickButton(SELECTORS.FORM_SUBMIT);
    
    // Wait for success message
    await this.waitForToast('KPI đã được giao thành công');
    
    // Wait for modal to close
    await this.waitForElementHidden(SELECTORS.MODAL);
    
    console.log('✅ KPI assigned successfully');
  }

  /**
   * Verify KPI exists in the list
   */
  async verifyKPIExists(kpiName: string) {
    console.log(`🔍 Verifying KPI exists: ${kpiName}`);
    
    await this.navigateToKPIManagement();
    
    // Check if KPI is visible in the table
    const kpiRow = this.page.locator(`tr:has-text("${kpiName}")`);
    await expect(kpiRow).toBeVisible();
    
    console.log('✅ KPI verification completed');
  }

  /**
   * Verify KPI does not exist in the list
   */
  async verifyKPIDoesNotExist(kpiName: string) {
    console.log(`🔍 Verifying KPI does not exist: ${kpiName}`);
    
    await this.navigateToKPIManagement();
    
    // Check if KPI is not visible in the table
    const kpiRow = this.page.locator(`tr:has-text("${kpiName}")`);
    await expect(kpiRow).not.toBeVisible();
    
    console.log('✅ KPI non-existence verification completed');
  }

  /**
   * Get KPI count from dashboard
   */
  async getKPICount(): Promise<number> {
    console.log('📊 Getting KPI count from dashboard...');
    
    await this.page.goto('/admin');
    await this.waitForPageLoad();
    
    // Find KPI count in dashboard stats
    const kpiCountElement = this.page.locator('[data-testid="kpi-count"]');
    const countText = await this.getTextContent('[data-testid="kpi-count"]');
    
    const count = parseInt(countText) || 0;
    console.log(`📊 KPI count: ${count}`);
    
    return count;
  }

  /**
   * Search for KPI by name
   */
  async searchKPI(searchTerm: string) {
    console.log(`🔍 Searching for KPI: ${searchTerm}`);
    
    await this.navigateToKPIManagement();
    
    // Find search input
    const searchInput = this.page.locator('input[placeholder*="Tìm kiếm"]');
    await this.fillFormField('input[placeholder*="Tìm kiếm"]', searchTerm);
    
    // Wait for search results
    await this.waitForNetworkIdle();
    
    console.log('✅ KPI search completed');
  }

  /**
   * Filter KPIs by category
   */
  async filterKPIsByCategory(category: string) {
    console.log(`🔍 Filtering KPIs by category: ${category}`);
    
    await this.navigateToKPIManagement();
    
    // Find category filter
    const categoryFilter = this.page.locator('select[name="category"]');
    if (await this.elementExists('select[name="category"]')) {
      await categoryFilter.selectOption(category);
      
      // Wait for filtered results
      await this.waitForNetworkIdle();
    }
    
    console.log('✅ KPI filtering completed');
  }
}
