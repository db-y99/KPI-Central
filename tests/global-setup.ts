import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright tests
 * This runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // Start browser for setup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...');
    await page.goto('http://localhost:9001', { waitUntil: 'networkidle' });
    
    // Check if the application is running
    const isAppReady = await page.locator('body').isVisible();
    if (!isAppReady) {
      throw new Error('Application is not ready');
    }
    
    console.log('✅ Application is ready for testing');
    
    // Set up test data if needed
    await setupTestData(page);
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global setup completed');
}

/**
 * Set up test data for the application
 */
async function setupTestData(page: any) {
  console.log('📊 Setting up test data...');
  
  try {
    // You can add test data setup here
    // For example, creating test users, departments, KPIs, etc.
    
    console.log('✅ Test data setup completed');
  } catch (error) {
    console.warn('⚠️ Test data setup failed:', error);
    // Don't fail the entire setup if test data setup fails
  }
}

export default globalSetup;

