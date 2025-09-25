import { test, expect } from '@playwright/test';

/**
 * Example test file demonstrating Playwright testing patterns
 * This file serves as a template for creating new tests
 */
test.describe('Example Test Suite', () => {
  test('should demonstrate basic Playwright usage', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:9001');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page title is correct
    await expect(page).toHaveTitle(/KPI Central/);
    
    // Check if login form is visible
    await expect(page.locator('form')).toBeVisible();
    
    // Take a screenshot for documentation
    await page.screenshot({ path: 'test-results/screenshots/example-test.png' });
  });

  test('should demonstrate form interaction', async ({ page }) => {
    await page.goto('http://localhost:9001/login');
    
    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Check if form fields have correct values
    await expect(page.locator('input[type="email"]')).toHaveValue('test@example.com');
    await expect(page.locator('input[type="password"]')).toHaveValue('password123');
    
    // Click submit button
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForLoadState('networkidle');
  });

  test('should demonstrate element waiting', async ({ page }) => {
    await page.goto('http://localhost:9001');
    
    // Wait for specific element to be visible
    await page.waitForSelector('form', { state: 'visible' });
    
    // Wait for element to be hidden
    await page.waitForSelector('.loading-spinner', { state: 'hidden' });
    
    // Wait for text content
    await page.waitForSelector('text=Đăng nhập');
  });

  test('should demonstrate assertions', async ({ page }) => {
    await page.goto('http://localhost:9001/login');
    
    // Text assertions
    await expect(page.locator('h1')).toContainText('Y99 KPI Dashboard');
    
    // Visibility assertions
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('.hidden-element')).toBeHidden();
    
    // Attribute assertions
    await expect(page.locator('input[type="email"]')).toHaveAttribute('type', 'email');
    
    // Count assertions
    await expect(page.locator('button')).toHaveCount(2);
    
    // URL assertions
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should demonstrate keyboard and mouse interactions', async ({ page }) => {
    await page.goto('http://localhost:9001/login');
    
    // Keyboard interactions
    await page.press('input[type="email"]', 'Tab');
    await page.keyboard.type('test@example.com');
    
    // Mouse interactions
    await page.hover('button[type="submit"]');
    await page.click('button[type="submit"]');
    
    // Right click
    await page.click('form', { button: 'right' });
    
    // Double click
    await page.dblclick('input[type="email"]');
  });

  test('should demonstrate file uploads', async ({ page }) => {
    await page.goto('http://localhost:9001/employee/profile');
    
    // File upload
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles('test-file.txt');
    }
  });

  test('should demonstrate API mocking', async ({ page }) => {
    // Mock API response
    await page.route('**/api/kpis', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Test KPI', target: 100 }
        ])
      });
    });
    
    await page.goto('http://localhost:9001/admin/kpi-management');
    
    // Verify mocked data is displayed
    await expect(page.locator('text=Test KPI')).toBeVisible();
  });

  test('should demonstrate mobile testing', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:9001');
    
    // Check mobile-specific elements
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('should demonstrate error handling', async ({ page }) => {
    // Handle page errors
    page.on('pageerror', error => {
      console.log('Page error:', error.message);
    });
    
    // Handle console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    await page.goto('http://localhost:9001');
  });
});

