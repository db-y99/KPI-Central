import { test, expect } from '@playwright/test';

test.describe('Admin Login Test', () => {
  test('should login as admin and redirect to admin dashboard', async ({ page }) => {
    console.log('🚀 Starting admin login test...');
    
    // Go to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check if login form is visible
    await expect(page.locator('form')).toBeVisible();
    
    console.log('✅ Login form is visible');
    
    // Fill login form with admin credentials
    await page.fill('input[type="email"]', 'admin-test@y99.vn');
    await page.fill('input[type="password"]', 'admin123456');
    
    console.log('✅ Form filled with admin credentials');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    console.log('✅ Form submitted');
    
    // Wait for redirect
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('Current URL after admin login:', currentUrl);
    
    // Check if we're redirected to admin page
    expect(currentUrl).toContain('/admin');
    
    // Check if admin dashboard elements are visible
    await expect(page.locator('.grid.gap-4.md\\:grid-cols-4')).toBeVisible();
    
    console.log('✅ Admin login test completed successfully');
  });
});


