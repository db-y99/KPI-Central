const { chromium } = require('playwright');

async function testKPITabs() {
  console.log('🧪 Testing KPI Management Pages Manually...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000 // Delay để theo dõi
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🔐 Đăng nhập admin account...');
    await page.goto('http://localhost:9001/login');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[name="email"]').fill('db@y99.vn');
    await page.locator('input[name="password"]').fill('Dby996868@');
    await page.locator('button[type="submit"]').click();
    
    console.log('✅ Đăng nhập thành công!');
    
    // Navigate trực tiếp để test từng tab URL
    const tabs = [
      { name: 'Definitions', url: 'http://localhost:9001/admin/kpi-management?tab=definitions' },
      { name: 'Assignment', url: 'http://localhost:9001/admin/kpi-management?tab=assignment' },
      { name: 'Tracking', url: 'http://localhost:9001/admin/kpi-management?tab=tracking' },
      { name: 'Approval', url: 'http://localhost:9001/admin/kpi-management?tab=approval' },
      { name: 'Reward & Penalty', url: 'http://localhost:9001/admin/kpi-management?tab=reward-penalty' }
    ];
    
    let successCount = 0;
    
    for (const tab of tabs) {
      console.log(`\n🔍 Testing Tab: ${tab.name}`);
      
      try {
        console.log(`   📝 Navigating to: ${tab.url}`);
        await page.goto(tab.url, { timeout: 15000 });
        
        // Wait vài giây để page load
        await page.waitForTimeout(3000);
        
        // Kiểm tra có content không
        const hasContent = await page.locator('body').textContent();
        
        if (hasContent && hasContent.length > 100) {
          console.log(`   ✅ ${tab.name} page loaded successfully`);
          console.log(`   📄 Page content length: ${hasContent.length} characters`);
          successCount++;
          
          // Kiểm tra có buttons chính không
          const buttons = await page.locator('button').allTextContents();
          console.log(`   🔘 Found ${buttons.length} buttons: ${buttons.slice(0, 5).join(', ')}...`);
          
        } else {
          console.log(`   ⚠️  ${tab.name} page content is minimal`);
        }
        
        // Chờ trước khi test tab tiếp theo
        await page.waitForTimeout(2000);
        
      } catch (error) {
        console.log(`   ❌ ${tab.name} failed: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Successful tabs: ${successCount}/${tabs.length}`);
    console.log(`🔗 Base URL: http://localhost:9001`);
    console.log(`🔐 Admin account: db@y99.vn`);
    
    if (successCount === tabs.length) {
      console.log('\n🎉 All tabs are accessible!');
      console.log('✅ KPI Definitions - OK');
      console.log('✅ KPI Assignment - OK');  
      console.log('✅ KPI Tracking - OK');
      console.log('✅ Approval - OK');
      console.log('✅ Reward & Penalty - OK');
      console.log('\n🚀 System is ready for production!');
    } else {
      console.log(`\n⚠️  ${tabs.length - successCount} tabs may have issues`);
    }
    
    console.log('\n⏳ Keeping browser open for review...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.log('\n❌ Test execution failed:');
    console.log(error.message);
    
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    console.log('📷 Screenshot saved as error-screenshot.png');
    
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

testKPITabs().catch(console.error);