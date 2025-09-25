import { Page, expect } from '@playwright/test';

/**
 * Test data constants for consistent testing
 */
export const TEST_DATA = {
  // Admin user credentials - using admin test user
  ADMIN: {
    email: 'admin-test@y99.vn',
    password: 'admin123456',
    name: 'Test Administrator',
    role: 'admin'
  },
  
  // Employee user credentials - using regular test user
  EMPLOYEE: {
    email: 'test@y99.vn',
    password: 'test123456',
    name: 'Test Employee',
    role: 'employee'
  },
  
  // Test department data
  DEPARTMENT: {
    name: 'Test Department',
    description: 'Test department for automation testing',
    managerId: 'test-manager-id'
  },
  
  // Test KPI data
  KPI: {
    name: 'Test KPI',
    description: 'Test KPI for automation testing',
    target: 100,
    unit: 'units',
    weight: 25,
    category: 'Performance'
  },
  
  // Test KPI record data
  KPI_RECORD: {
    actual: 75,
    status: 'pending',
    notes: 'Test KPI record for automation'
  }
} as const;

/**
 * Common selectors used across tests
 */
export const SELECTORS = {
  // Authentication
  LOGIN_FORM: 'form',
  EMAIL_INPUT: 'input[type="email"]',
  PASSWORD_INPUT: 'input[type="password"]',
  LOGIN_BUTTON: 'button[type="submit"]',
  LOGOUT_BUTTON: 'button:has-text("Đăng xuất")',
  
  // Navigation
  NAV_MENU: '[data-testid="nav-menu"]',
  ADMIN_MENU: '[data-testid="admin-menu"]',
  EMPLOYEE_MENU: '[data-testid="employee-menu"]',
  
  // Dashboard - Updated to match actual UI
  DASHBOARD_STATS: '.grid.gap-4.md\\:grid-cols-4',
  KPI_CARDS: '[data-testid="kpi-card"]',
  EMPLOYEE_CARDS: '[data-testid="employee-card"]',
  
  // Forms
  FORM_SUBMIT: 'button[type="submit"]',
  FORM_CANCEL: 'button:has-text("Hủy")',
  FORM_SAVE: 'button:has-text("Lưu")',
  
  // Modals
  MODAL: '[role="dialog"]',
  MODAL_CLOSE: 'button[aria-label="Close"]',
  
  // Tables
  DATA_TABLE: '[data-testid="data-table"]',
  TABLE_ROW: 'tr[data-testid="table-row"]',
  
  // Notifications - Updated to match actual toast implementation
  TOAST: '[data-sonner-toaster]',
  ALERT: '[role="alert"]',
  
  // Loading states
  LOADING_SPINNER: '[data-testid="loading-spinner"]',
  SKELETON: '[data-testid="skeleton"]'
} as const;

/**
 * Common test utilities
 */
export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (error) {
      // If networkidle times out, just wait for domcontentloaded
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    }
    await this.page.waitForSelector('body', { state: 'visible', timeout: 10000 });
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { 
      state: 'visible', 
      timeout 
    });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { 
      state: 'hidden', 
      timeout 
    });
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete() {
    // Wait for loading spinners to disappear
    await this.page.waitForSelector(SELECTORS.LOADING_SPINNER, { 
      state: 'hidden', 
      timeout: 15000 
    }).catch(() => {
      // Ignore if loading spinner doesn't exist
    });
    
    // Wait for skeleton loaders to disappear
    await this.page.waitForSelector(SELECTORS.SKELETON, { 
      state: 'hidden', 
      timeout: 15000 
    }).catch(() => {
      // Ignore if skeleton doesn't exist
    });
  }

  /**
   * Take a screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Fill form field with validation
   */
  async fillFormField(selector: string, value: string) {
    await this.waitForElement(selector);
    await this.page.fill(selector, value);
    
    // Verify the value was set
    const fieldValue = await this.page.inputValue(selector);
    expect(fieldValue).toBe(value);
  }

  /**
   * Click button with retry logic
   */
  async clickButton(selector: string, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await this.waitForElement(selector);
        await this.page.click(selector);
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Wait for toast notification
   */
  async waitForToast(message?: string) {
    // Try multiple toast selectors
    const toastSelectors = [
      SELECTORS.TOAST,
      '[data-sonner-toaster]',
      '[data-sonner-toast]',
      '.toast',
      '[role="alert"]'
    ];
    
    let toastFound = false;
    for (const selector of toastSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 5000 });
        toastFound = true;
        break;
      } catch (error) {
        // Continue to next selector
      }
    }
    
    if (!toastFound) {
      throw new Error('Toast notification not found');
    }
    
    if (message) {
      // Try to find the message in any of the toast elements
      for (const selector of toastSelectors) {
        try {
          await expect(this.page.locator(selector)).toContainText(message, { timeout: 2000 });
          return;
        } catch (error) {
          // Continue to next selector
        }
      }
    }
  }

  /**
   * Wait for alert to appear
   */
  async waitForAlert(message?: string) {
    await this.waitForElement(SELECTORS.ALERT);
    
    if (message) {
      await expect(this.page.locator(SELECTORS.ALERT)).toContainText(message);
    }
  }

  /**
   * Check if element exists without throwing
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get text content safely
   */
  async getTextContent(selector: string): Promise<string> {
    await this.waitForElement(selector);
    return await this.page.textContent(selector) || '';
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }
}
