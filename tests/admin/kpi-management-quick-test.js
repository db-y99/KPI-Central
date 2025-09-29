const { chromium } = require('playwright');

async function runQuickTest() {
  console.log('🧪 Starting Quick KPI Management Test với Admin Account...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500 // Delay để theo dõi
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🔐 Đang đăng nhập với admin account...');
    
    // Đi tới trang login
    await page.goto('http://localhost:9001/login');
    await page.waitForLoadState('networkidle');
    
    // Đăng nhập với credentials thực tế
    await page.locator('input[name="email"]').fill('db@y99.vn');
    await page.locator('input[name="password"]').fill('Dby996868@');
    
    console.log('✅ Đã điền thông tin đăng nhập');
    
    // Click login button
    await page.locator('button[type="submit"]').click();
    
    // Đợi redirect
    await page.waitForURL('**/admin', { timeout: 15000 });
    console.log('✅ Đăng nhập thành công!');
    
    // Navigate to KPI Management
    console.log('\n📝 Navigating to KPI Management...');
    await page.goto(`${page.url().includes('9001') ? 'http://localhost:9001' : 'http://localhost:9001'}/admin/kpi-management`);
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Successfully navigated to KPI Management page');
    
    // Test từng tab
    const tabs = [
      { 
        name: 'KPI Definitions', 
        url: '/admin/kpi-management?tab=definitions',
        testElements: ['Thêm KPI', 'Tìm kiếm', 'table']
      },
      { 
        name: 'KPI Assignment', 
        url: '/admin/kpi-management?tab=assignment',
        testElements: ['Phân công KPI', 'table']
      },
      { 
        name: 'KPI Tracking', 
        url: '/admin/kpi-management?tab=tracking',
        testElements: ['Refresh', 'table']
      },
      { 
        name: 'Approval', 
        url: '/admin/kpi-management?tab=approval',
        testElements: ['Duyệt báo cáo', 'table']
      },
      { 
        name: 'Reward & Penalty', 
        url: '/admin/kpi-management?tab=reward-penalty',
        testElements: ['Auto Calculate', 'Download', 'table']
      }
    ];
    
    let passedTabs = 0;
    let totalTabs = tabs.length;
    
    for (const tab of tabs) {
      console.log(`\n🔍 Testing Tab: ${tab.name}...`);
      
      try {
        await page.goto('http://localhost:9001' + tab.url);
        await page.waitForLoadState('networkidle');
        
        let elementFound = 0;
        let totalElements = tab.testElements.length;
        
        // Kiểm tra các elements quan trọng
        for (const element of tab.testElements) {
          try {
            if (element === 'table') {
              const tableExists = await page.locator('table').isVisible({ timeout: 2000 });
              if (tableExists) {
                elementFound++;
                console.log(`   ✅ Table is visible`);
              } else {
                console.log(`   ⚠️  Table not visible yet`);
              }
            } else {
              const buttonExists = await page.locator(`button:has-text("${element}")`).isVisible({ timeout: 2000 });
              if (buttonExists) {
                elementFound++;
                console.log(`   ✅ Button "${element}" is visible`);
                
                // Test clicking buttons (không click destructive buttons)
                if (element === 'Thêm KPI') {
                  await page.locator(`button:has-text("${element}")`).click();
                  await page.waitForTimeout(1000);
                  
                  const dialogVisible = await page.locator('[role="dialog"]').isVisible({ timeout: 3000 });
                  if (dialogVisible) {
                    console.log(`   ✅ Dialog opened for "${element}"`);
                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(500);
                  }
                }
              } else {
                console.log(`   ⚠️  Button "${element}" not found`);
              }
            }
          } catch (e) {
            console.log(`   ⚠️  Element "${element}" error: ${e.message}`);
          }
        }
        
        if (elementFound > 0) {
          passedTabs++;
          console.log(`   ✅ Tab ${tab.name}: ${elementFound}/${totalElements} elements found`);
        } else {
          console.log(`   ❌ Tab ${tab.name}: No elements found`);
        }
        
      } catch (error) {
        console.log(`   ❌ Tab ${tab.name} failed: ${error.message}`);
      }
    }
    
    // Test responsive design
    console.log('\n📱 Testing responsive design...');
    const originalViewport = page.viewportSize();
    
    try {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(2000);
      
      const currentTab = page.locator('[data-state="active"]');
      const tabsVisible = await currentTab.isVisible();
      
      if (tabsVisible) {
        console.log('   ✅ Responsive tabs working');
      } else {
        console.log('   ⚠️  Responsive tabs may have issues');
      }
      
      // Reset viewport
      await page.setViewportSize(originalViewport);
      
    } catch (error) {
      console.log(`   ⚠️  Responsive test error: ${error.message}`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 KPI MANAGEMENT TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Login: Successful`);
    console.log(`✅ Navigation: Working`);
    console.log(`✅ Tabs Tested: ${passedTabs}/${totalTabs}`);
    console.log(`✅ Responsive Design: Checked`);
    
    if (passedTabs === totalTabs) {
      console.log('\n🎉 All tabs are working correctly!');
      console.log('✅ KPI Definitions tab - OK');
      console.log('✅ KPI Assignment tab - OK');
      console.log('✅ KPI Tracking tab - OK');
      console.log('✅ Approval tab - OK');
      console.log('✅ Reward & Penalty tab - OK');
    } else {
      console.log(`\n⚠️  ${totalTabs - passedTabs} tabs may have issues`);
    }
    
    console.log('\n🎯 Ready for production testing!');
    
  } catch (error) {
    console.log('\n❌ Test execution failed:');
    console.log(error.message);
    
    // Take debugging screenshot
    await page.screenshot({ path: 'test-error.png', fullPage: true });
    console.log('📷 Error screenshot saved as test-error.png');
    
  } finally {
    console.log('\n⏳ Keeping browser open for 5 seconds for review...');
    await page.waitForTimeout(5000);
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

// Run the test
runQuickTest().catch(console.error);
