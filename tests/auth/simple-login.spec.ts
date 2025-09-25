import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('Simple Login Test', () => {
  test('should login successfully', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    
    console.log('🚀 Starting simple login test...');
    
    // Go to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Hide NextJS dev overlay if present
    await page.evaluate(() => {
      const overlay = document.querySelector('[data-nextjs-dev-overlay]');
      if (overlay) {
        (overlay as HTMLElement).style.display = 'none';
      }
    });
    
    // Check if login form is visible
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    console.log('✅ Login form is visible');
    
    // Fill login form
    await page.fill('input[type="email"]', 'test@y99.vn');
    await page.fill('input[type="password"]', 'test123456');
    
    console.log('✅ Form filled');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    console.log('✅ Form submitted');
    
    // Wait for redirect or check current URL
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    // Check if we're redirected away from login page
    expect(currentUrl).not.toContain('/login');
    
    console.log('✅ Login test completed successfully');
  });
});
