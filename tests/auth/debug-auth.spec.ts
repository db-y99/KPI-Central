import { test, expect } from '@playwright/test';

test.describe('Debug Authentication', () => {
  test('should check login form and console errors', async ({ page }) => {
    console.log('🚀 Starting debug test...');
    
    // Listen to console messages
    page.on('console', msg => {
      console.log('Browser console:', msg.text());
    });
    
    // Listen to page errors
    page.on('pageerror', error => {
      console.log('Page error:', error.message);
    });
    
    // Go to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded');
    
    // Check if login form is visible
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    console.log('✅ Form is visible');
    
    // Fill login form
    await page.fill('input[type="email"]', 'db@y99.vn');
    await page.fill('input[type="password"]', 'Dby996868@');
    
    console.log('✅ Form filled');
    
    // Submit form and wait for response
    const [response] = await Promise.all([
      page.waitForResponse(response => response.url().includes('firebase') || response.url().includes('auth')),
      page.click('button[type="submit"]')
    ]);
    
    console.log('Response status:', response.status());
    console.log('Response URL:', response.url());
    
    // Wait a bit more to see what happens
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('Current URL after login attempt:', currentUrl);
    
    // Check for any error messages on the page
    const errorElements = await page.locator('[role="alert"], .error, .toast, [data-sonner-toaster]').all();
    for (const element of errorElements) {
      const text = await element.textContent();
      console.log('Error element found:', text);
    }
    
    // Check if there are any validation errors
    const validationErrors = await page.locator('.text-red-500, .text-destructive, [role="alert"]').all();
    for (const element of validationErrors) {
      const text = await element.textContent();
      console.log('Validation error:', text);
    }
    
    console.log('✅ Debug test completed');
  });
});
