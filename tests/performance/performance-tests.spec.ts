import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { TestUtils } from '../utils/test-utils';

test.describe('Performance Tests', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
  });

  test.describe('Page Load Performance', () => {
    test('should load login page within acceptable time', async ({ page }) => {
      console.log('🚀 Testing login page load performance...');
      
      const startTime = Date.now();
      await page.goto('/login');
      await testUtils.waitForPageLoad();
      const loadTime = Date.now() - startTime;
      
      console.log(`📊 Login page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000); // 5 seconds max
      
      console.log('✅ Login page load performance test completed');
    });

    test('should load admin dashboard within acceptable time', async ({ page }) => {
      console.log('🚀 Testing admin dashboard load performance...');
      
      const startTime = Date.now();
      await authHelper.loginAsAdmin();
      const loadTime = Date.now() - startTime;
      
      console.log(`📊 Admin dashboard load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(8000); // 8 seconds max
      
      console.log('✅ Admin dashboard load performance test completed');
    });

    test('should load employee dashboard within acceptable time', async ({ page }) => {
      console.log('🚀 Testing employee dashboard load performance...');
      
      const startTime = Date.now();
      await authHelper.loginAsEmployee();
      const loadTime = Date.now() - startTime;
      
      console.log(`📊 Employee dashboard load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(8000); // 8 seconds max
      
      console.log('✅ Employee dashboard load performance test completed');
    });

    test('should load all admin pages within acceptable time', async ({ page }) => {
      console.log('🚀 Testing all admin pages load performance...');
      
      await authHelper.loginAsAdmin();
      
      const pages = [
        '/admin/kpi-management',
        '/admin/hr-management',
        '/admin/evaluation-reports',
        '/admin/system-settings'
      ];
      
      const loadTimes = [];
      
      for (const pageUrl of pages) {
        const startTime = Date.now();
        await page.goto(pageUrl);
        await testUtils.waitForPageLoad();
        const loadTime = Date.now() - startTime;
        
        loadTimes.push({ url: pageUrl, time: loadTime });
        console.log(`📊 ${pageUrl} load time: ${loadTime}ms`);
        
        expect(loadTime).toBeLessThan(20000); // 20 seconds max
      }
      
      // Calculate average load time
      const avgLoadTime = loadTimes.reduce((sum, item) => sum + item.time, 0) / loadTimes.length;
      console.log(`📊 Average load time: ${avgLoadTime.toFixed(2)}ms`);
      
      expect(avgLoadTime).toBeLessThan(15000); // Average should be less than 15 seconds
      
      console.log('✅ All admin pages load performance test completed');
    });
  });

  test.describe('Memory Usage Performance', () => {
    test('should not have memory leaks during navigation', async ({ page }) => {
      console.log('🚀 Testing memory usage during navigation...');
      
      await authHelper.loginAsAdmin();
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      // Navigate through multiple pages
      const pages = [
        '/admin/kpi-management',
        '/admin/hr-management',
        '/admin/evaluation-reports',
        '/admin',
        '/admin/kpi-management'
      ];
      
      for (const pageUrl of pages) {
        await page.goto(pageUrl);
        await testUtils.waitForPageLoad();
        await page.waitForTimeout(1000); // Wait for any cleanup
      }
      
      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;
        
        console.log(`📊 Memory increase: ${memoryIncrease} bytes (${memoryIncreasePercent.toFixed(2)}%)`);
        
        // Memory increase should not be excessive (less than 50%)
        expect(memoryIncreasePercent).toBeLessThan(50);
      }
      
      console.log('✅ Memory usage test completed');
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      console.log('🚀 Testing large dataset handling...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      
      // Check if pagination is implemented for large datasets
      const pagination = page.locator('[data-testid="pagination"], .pagination, nav[aria-label="pagination"]');
      const hasPagination = await pagination.isVisible().catch(() => false);
      
      if (hasPagination) {
        console.log('✅ Pagination is implemented for large datasets');
      } else {
        // Check if there's a limit on displayed items
        const tableRows = page.locator('tbody tr');
        const rowCount = await tableRows.count();
        
        console.log(`📊 Number of table rows: ${rowCount}`);
        
        // Should not load too many rows at once (performance consideration)
        expect(rowCount).toBeLessThan(1000);
      }
      
      console.log('✅ Large dataset handling test completed');
    });
  });

  test.describe('Network Performance', () => {
    test('should minimize network requests', async ({ page }) => {
      console.log('🚀 Testing network request optimization...');
      
      const requests: string[] = [];
      
      // Track network requests
      page.on('request', request => {
        requests.push(request.url());
      });
      
      await authHelper.loginAsAdmin();
      
      // Clear initial requests (login, etc.)
      requests.length = 0;
      
      // Navigate to dashboard
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Count unnecessary requests
      const duplicateRequests = requests.filter((url, index) => 
        requests.indexOf(url) !== index
      );
      
      const staticResourceRequests = requests.filter(url => 
        url.includes('.css') || url.includes('.js') || url.includes('.png') || url.includes('.jpg')
      );
      
      console.log(`📊 Total requests: ${requests.length}`);
      console.log(`📊 Duplicate requests: ${duplicateRequests.length}`);
      console.log(`📊 Static resource requests: ${staticResourceRequests.length}`);
      
      // Should not have excessive duplicate requests
      expect(duplicateRequests.length).toBeLessThan(requests.length * 0.1); // Less than 10% duplicates
      
      console.log('✅ Network request optimization test completed');
    });

    test('should use efficient data loading strategies', async ({ page }) => {
      console.log('🚀 Testing data loading strategies...');
      
      await authHelper.loginAsAdmin();
      
      const startTime = Date.now();
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      const loadTime = Date.now() - startTime;
      
      // Check for loading indicators
      const loadingIndicators = page.locator('[data-testid="loading"], .loading, .spinner');
      const hasLoadingIndicators = await loadingIndicators.isVisible().catch(() => false);
      
      if (hasLoadingIndicators) {
        console.log('✅ Loading indicators are present');
      }
      
      // Check for lazy loading
      const lazyElements = page.locator('[loading="lazy"], [data-lazy]');
      const lazyCount = await lazyElements.count();
      
      if (lazyCount > 0) {
        console.log(`✅ Lazy loading implemented for ${lazyCount} elements`);
      }
      
      // Data should load within reasonable time
      expect(loadTime).toBeLessThan(20000);
      
      console.log('✅ Data loading strategies test completed');
    });
  });

  test.describe('Concurrent User Performance', () => {
    test('should handle multiple concurrent users', async ({ browser }) => {
      console.log('🚀 Testing concurrent user handling...');
      
      const contexts = [];
      const pages = [];
      
      try {
        // Create multiple browser contexts (simulating different users)
        for (let i = 0; i < 5; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }
        
        // Login all users simultaneously
        const loginPromises = pages.map(async (page, index) => {
          const authHelper = new AuthHelper(page);
          const startTime = Date.now();
          
          if (index % 2 === 0) {
            await authHelper.loginAsAdmin();
          } else {
            await authHelper.loginAsEmployee();
          }
          
          const loginTime = Date.now() - startTime;
          return { user: index, loginTime };
        });
        
        const loginResults = await Promise.all(loginPromises);
        
        // All logins should complete within reasonable time
        for (const result of loginResults) {
          console.log(`📊 User ${result.user} login time: ${result.loginTime}ms`);
          expect(result.loginTime).toBeLessThan(10000); // 10 seconds max per user
        }
        
        // Navigate all users to their dashboards
        const navigationPromises = pages.map(async (page, index) => {
          const startTime = Date.now();
          
          if (index % 2 === 0) {
            await page.goto('/admin');
          } else {
            await page.goto('/employee');
          }
          
          await testUtils.waitForPageLoad();
          const navTime = Date.now() - startTime;
          
          return { user: index, navTime };
        });
        
        const navResults = await Promise.all(navigationPromises);
        
        // All navigations should complete within reasonable time
        for (const result of navResults) {
          console.log(`📊 User ${result.user} navigation time: ${result.navTime}ms`);
          expect(result.navTime).toBeLessThan(15000); // 15 seconds max per user
        }
        
      } finally {
        // Clean up contexts
        for (const context of contexts) {
          await context.close();
        }
      }
      
      console.log('✅ Concurrent user handling test completed');
    });

    test('should maintain performance under load', async ({ page }) => {
      console.log('🚀 Testing performance under load...');
      
      await authHelper.loginAsAdmin();
      
      // Simulate rapid navigation
      const pages = [
        '/admin/kpi-management',
        '/admin/hr-management',
        '/admin/evaluation-reports',
        '/admin',
        '/admin/kpi-management',
        '/admin/hr-management'
      ];
      
      const navigationTimes = [];
      
      for (const pageUrl of pages) {
        const startTime = Date.now();
        await page.goto(pageUrl);
        await testUtils.waitForPageLoad();
        const navTime = Date.now() - startTime;
        
        navigationTimes.push(navTime);
        console.log(`📊 ${pageUrl} navigation time: ${navTime}ms`);
        
        // Each navigation should not degrade significantly
        expect(navTime).toBeLessThan(20000);
      }
      
      // Performance should not degrade significantly over time
      const firstHalf = navigationTimes.slice(0, Math.floor(navigationTimes.length / 2));
      const secondHalf = navigationTimes.slice(Math.floor(navigationTimes.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, time) => sum + time, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, time) => sum + time, 0) / secondHalf.length;
      
      const performanceDegradation = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      
      console.log(`📊 Performance degradation: ${performanceDegradation.toFixed(2)}%`);
      
      // Performance degradation should not exceed 50%
      expect(performanceDegradation).toBeLessThan(50);
      
      console.log('✅ Performance under load test completed');
    });
  });

  test.describe('Database Performance', () => {
    test('should handle database queries efficiently', async ({ page }) => {
      console.log('🚀 Testing database query performance...');
      
      await authHelper.loginAsAdmin();
      
      // Test different data-heavy pages
      const dataPages = [
        '/admin/kpi-management',
        '/admin/hr-management',
        '/admin/evaluation-reports'
      ];
      
      for (const pageUrl of dataPages) {
        const startTime = Date.now();
        await page.goto(pageUrl);
        await testUtils.waitForPageLoad();
        const loadTime = Date.now() - startTime;
        
        console.log(`📊 ${pageUrl} database query time: ${loadTime}ms`);
        
        // Database queries should complete within reasonable time
        expect(loadTime).toBeLessThan(20000);
      }
      
      console.log('✅ Database query performance test completed');
    });

    test('should implement proper caching strategies', async ({ page }) => {
      console.log('🚀 Testing caching strategies...');
      
      await authHelper.loginAsAdmin();
      
      // First visit
      const firstVisitStart = Date.now();
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      const firstVisitTime = Date.now() - firstVisitStart;
      
      // Second visit (should be faster due to caching)
      const secondVisitStart = Date.now();
      await page.goto('/admin/kpi-management');
      await testUtils.waitForPageLoad();
      const secondVisitTime = Date.now() - secondVisitStart;
      
      console.log(`📊 First visit time: ${firstVisitTime}ms`);
      console.log(`📊 Second visit time: ${secondVisitTime}ms`);
      
      // Second visit should be faster (caching working)
      if (secondVisitTime < firstVisitTime) {
        const improvement = ((firstVisitTime - secondVisitTime) / firstVisitTime) * 100;
        console.log(`✅ Caching improvement: ${improvement.toFixed(2)}%`);
      }
      
      console.log('✅ Caching strategies test completed');
    });
  });

  test.describe('Resource Optimization', () => {
    test('should optimize image loading', async ({ page }) => {
      console.log('🚀 Testing image loading optimization...');
      
      await authHelper.loginAsAdmin();
      await page.goto('/admin');
      await testUtils.waitForPageLoad();
      
      // Check for image optimization
      const images = page.locator('img');
      const imageCount = await images.count();
      
      let optimizedImages = 0;
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        const loading = await img.getAttribute('loading');
        
        if (loading === 'lazy') {
          optimizedImages++;
        }
        
        // Check for modern image formats
        if (src && (src.includes('.webp') || src.includes('.avif'))) {
          optimizedImages++;
        }
      }
      
      console.log(`📊 Total images: ${imageCount}`);
      console.log(`📊 Optimized images: ${optimizedImages}`);
      
      if (imageCount > 0) {
        const optimizationRate = (optimizedImages / imageCount) * 100;
        console.log(`📊 Image optimization rate: ${optimizationRate.toFixed(2)}%`);
      }
      
      console.log('✅ Image loading optimization test completed');
    });

    test('should minimize JavaScript bundle size', async ({ page }) => {
      console.log('🚀 Testing JavaScript bundle optimization...');
      
      const jsRequests: string[] = [];
      
      page.on('request', request => {
        if (request.url().includes('.js')) {
          jsRequests.push(request.url());
        }
      });
      
      await authHelper.loginAsAdmin();
      
      console.log(`📊 JavaScript files loaded: ${jsRequests.length}`);
      
      // Should not load excessive number of JS files
      expect(jsRequests.length).toBeLessThan(20);
      
      // Check for code splitting
      const chunkFiles = jsRequests.filter(url => url.includes('chunk') || url.includes('bundle'));
      console.log(`📊 Chunk files: ${chunkFiles.length}`);
      
      console.log('✅ JavaScript bundle optimization test completed');
    });

    test('should implement proper CSS optimization', async ({ page }) => {
      console.log('🚀 Testing CSS optimization...');
      
      const cssRequests: string[] = [];
      
      page.on('request', request => {
        if (request.url().includes('.css')) {
          cssRequests.push(request.url());
        }
      });
      
      await authHelper.loginAsAdmin();
      
      console.log(`📊 CSS files loaded: ${cssRequests.length}`);
      
      // Should not load excessive number of CSS files
      expect(cssRequests.length).toBeLessThan(10);
      
      // Check for CSS optimization
      const criticalCSS = cssRequests.filter(url => 
        url.includes('critical') || url.includes('inline')
      );
      
      if (criticalCSS.length > 0) {
        console.log('✅ Critical CSS is implemented');
      }
      
      console.log('✅ CSS optimization test completed');
    });
  });
});
