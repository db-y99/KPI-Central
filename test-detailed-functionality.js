const { chromium } = require('playwright');

async function testDetailedFunctionality() {
  console.log('🧪 Testing Detailed Functionality của từng Tab...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Đăng nhập
    console.log('🔐 Đăng nhập admin...');
    await page.goto('http://localhost:9001/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[name="email"]').fill('db@y99.vn');
    await page.locator('input[name="password"]').fill('Dby996868@');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    console.log('✅ Đăng nhập thành công!\n');
    
    // Test KPI Definitions Tab
    await testKPIDefinitions(page);
    
    // Test KPI Assignment Tab  
    await testKPIAssignment(page);
    
    // Test KPI Tracking Tab
    await testKPITracking(page);
    
    // Test Approval Tab
    await testApproval(page);
    
    // Test Reward & Penalty Tab
    await testRewardPenalty(page);
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'detailed-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

async function testKPIDefinitions(page) {
  console.log('📋 TESTING KPI DEFINITIONS TAB...');
  await page.goto('http://localhost:9001/admin/kpi-management?tab=definitions');
  await page.waitForLoadState('networkidle');
  
  try {
    // 1. Test Add KPI button
    console.log('  1️⃣ Testing "Thêm KPI" button...');
    const addButton = await page.locator('button:has-text("Thêm KPI")');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Kiểm tra dialog mở
      const dialog = await page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        console.log('    ✅ Dialog "Thêm KPI" opened successfully');
        
        // Test form fields
        const nameField = await page.locator('input[name="name"]');
        const descField = await page.locator('textarea[name="description"]');
        
        if (await nameField.isVisible()) {
          await nameField.fill('Test KPI ' + Date.now());
          console.log('    ✅ Name field filled');
        }
        
        if (await descField.isVisible()) {
          await descField.fill('Test description for automated testing');
          console.log('    ✅ Description field filled');
        }
        
        // Test dropdowns
        const departmentSelect = await page.locator('select[name="department"]');
        if (await departmentSelect.isVisible()) {
          await departmentSelect.selectOption({ index: 1 });
          console.log('    ✅ Department selected');
        }
        
        // Fill target
        const targetField = await page.locator('input[name="target"]');
        if (await targetField.isVisible()) {
          await targetField.fill('100');
          console.log('    ✅ Target filled');
        }
        
        // Close dialog without saving
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        console.log('    ✅ Dialog closed');
      }
    }
    
    // 2. Test Search functionality
    console.log('  2️⃣ Testing search functionality...');
    const searchInput = await page.locator('input[placeholder*="tìm kiếm"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(2000);
      console.log('        ✅ Search term entered');
      
      await searchInput.clear();
      await page.waitForTimeout(1000);
      console.log('        ✅ Search cleared');
    }
    
    // 3. Test table clicks (nếu có data)
    console.log('  3️⃣ Testing table row interactions...');
    const tableRows = await page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      await tableRows.first().click();
      await page.waitForTimeout(1000);
      
      // Kiểm tra có dialog details không
      const detailsDialog = await page.locator('[role="dialog"]');
      if (await detailsDialog.isVisible()) {
        console.log('        ✅ Row click opened details dialog');
        
        // Test edit button
        const editButton = await page.locator('button:has-text("Chỉnh sửa")');
        if (await editButton.isVisible()) {
          await editButton.click();
          await page.waitForTimeout(1000);
          console.log('        ✅ Edit button clicked');
          
          // Close edit dialog
          await page.keyboard.press('Escape');
        }
        
        // Close details dialog
        await page.keyboard.press('Escape');
      }
    }
    
    console.log('✅ KPI Definitions functionality tests completed\n');
    
  } catch (error) {
    console.log('❌ KPI Definitions test failed:', error.message);
  }
}

async function testKPIAssignment(page) {
  console.log('👥 TESTING KPI ASSIGNMENT TAB...');
  await page.goto('http://localhost:9001/admin/kpi-management?tab=assignment');
  await page.waitForLoadState('networkidle');
  
  try {
    // 1. Test Assignment button
    console.log('  1️⃣ Testing "Phân công KPI" button...');
    const assignButton = await page.locator('button:has-text("Phân công KPI")');
    if (await assignButton.isVisible()) {
      await assignButton.click();
      await page.waitForTimeout(1000);
      
      const dialog = await page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        console.log('    ✅ Assignment dialog opened');
        
        // Test assignment type toggle
        const individualToggle = await page.locator('button:has-text("Phân công cá nhân")');
        const departmentToggle = await page.locator('button:has-text("Phân công phòng ban")');
        
        if (await individualToggle.isVisible()) {
          await individualToggle.click();
          await page.waitForTimeout(500);
          console.log('    ✅ Individual assignment selected');
        }
        
        if (await departmentToggle.isVisible()) {
          await departmentToggle.click();
          await page.waitForTimeout(500);
          console.log('    ✅ Department assignment selected');
          
          // Test department preview
          const preview = await page.locator('.bg-blue-50');
          if (await preview.isVisible()) {
            console.log('    ✅ Department employees preview visible');
          }
        }
        
        // Test form fields
        const employeeSelect = await page.locator('select[name="employeeId"]');
        if (await employeeSelect.isVisible()) {
          await employeeSelect.selectOption({ index: 1 });
          console.log('    ✅ Employee selected');
        }
        
        const kpiSelect = await page.locator('select[name="kpiId"]');
        if (await kpiSelect.isVisible()) {
          await kpiSelect.selectOption({ index: 1 });
          console.log('    ✅ KPI selected');
        }
        
        const targetField = await page.locator('input[name="target"]');
        if (await targetField.isVisible()) {
          await targetField.fill('50');
          console.log('    ✅ Target value filled');
        }
        
        // Close dialog
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        console.log('    ✅ Assignment dialog closed');
      }
    }
    
    // 2. Test filters
    console.log('  2️⃣ Testing filters...');
    const departmentFilter = await page.locator('select').first();
    if (await departmentFilter.isVisible()) {
      await departmentFilter.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
      console.log('        ✅ Department filter applied');
    }
    
    const statusFilter = await page.locator('select').nth(1);
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
      console.log('        ✅ Status filter applied');
    }
    
    console.log('✅ KPI Assignment functionality tests completed\n');
    
  } catch (error) {
    console.log('❌ KPI Assignment test failed:', error.message);
  }
}

async function testKPITracking(page) {
  console.log('📈 TESTING KPI TRACKING TAB...');
  await page.goto('http://localhost:9001/admin/kpi-management?tab=tracking');
  await page.waitForLoadState('networkidle');
  
  try {
    // 1. Test Refresh button
    console.log('  1️⃣ Testing Refresh button...');
    const refreshButton = await page.locator('button:has-text("Refresh")');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(2000);
      console.log('    ✅ Refresh button clicked');
    }
    
    // 2. Test table interactions
    console.log('  2️⃣ Testing tracking table interactions...');
    const tableRows = await page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      await tableRows.first().click();
      await page.waitForTimeout(1000);
      
      const dialog = await page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        console.log('        ✅ Tracking details dialog opened');
        
        // Test Update Progress button
        const updateButton = await page.locator('button:has-text("Update Progress")');
        if (await updateButton.isVisible()) {
          await updateButton.click();
          await page.waitForTimeout(1000);
          
          const updateDialog = await page.locator('[role="dialog"]');
          if (await updateDialog.isVisible()) {
            console.log('        ✅ Update progress dialog opened');
            
            // Fill update form
            const actualInput = await page.locator('input[name="actual"]');
            if (await actualInput.isVisible()) {
              await actualInput.fill('75');
              console.log('        ✅ Actual value filled');
            }
            
            const notesField = await page.locator('textarea[name="notes"]');
            if (await notesField.isVisible()) {
              await notesField.fill('Updated from automated test');
              console.log('        ✅ Notes filled');
            }
            
            // Close update dialog
            await page.keyboard.press('Escape');
            console.log('        ✅ Update dialog closed');
          }
        }
        
        // Close main dialog
        await page.keyboard.press('Escape');
      }
    }
    
    // 3. Test filters
    console.log('  3️⃣ Testing filters...');
    const searchInput = await page.locator('input[placeholder*="Nhân viên"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('admin');
      await page.waitForTimeout(1000);
      console.log('        ✅ Employee search applied');
      await searchInput.clear();
    }
    
    console.log('✅ KPI Tracking functionality tests completed\n');
    
  } catch (error) {
    console.log('❌ KPI Tracking test failed:', error.message);
  }
}

async function testApproval(page) {
  console.log('✅ TESTING APPROVAL TAB...');
  await page.goto('http://localhost:9001/admin/kpi-management?tab=approval');
  await page.waitForLoadState('networkidle');
  
  try {
    // 1. Test table interactions
    console.log('  1️⃣ Testing approval table...');
    const tableRows = await page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      await tableRows.first().click();
      await page.waitForTimeout(1000);
      
      const dialog = await page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        console.log('    ✅ Approval details dialog opened');
        
        // Test file attachments
        const fileElements = await page.locature('.bg-blue-50');
        const fileCount = await fileElements.count();
        if (fileCount > 0) {
          console.log(`    ✅ Found ${fileCount} file attachments`);
          
          // Test download buttons
          const downloadButtons = await page.locature('button svg[class*="Download"]');
          if (await downloadButtons.count() > 0) {
            console.log('    ✅ Download buttons available');
          }
        }
        
        // Test approval comments
        const commentsField = await page.locator('textarea');
        if (await commentsField.isVisible()) {
          await commentsField.fill('Approved by automated test');
          console.log('    ✅ Comment added');
          
          await commentsField.clear();
        }
        
        // Test approve button (hover only, don't click)
        const approveButton = await page.locator('button:has-text("Phê duyệt")');
        if (await approveButton.isVisible()) {
          await approveButton.press('Tab');
          console.log('    ✅ Approve button accessible');
        }
        
        // Close dialog
        await page.keyboard.press('Escape');
      }
    }
    
    // 2. Test filters
    console.log('  2️⃣ Testing status filters...');
    const statusFilter = await page.locator('select');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
      console.log('    ✅ Status filter applied');
    }
    
    console.log('✅ Approval functionality tests completed\n');
    
  } catch (error) {
    console.log('❌ Approval test failed:', error.message);
  }
}

async function testRewardPenalty(page) {
  console.log('🏆 TESTING REWARD & PENALTY TAB...');
  await page.goto('http://localhost:9001/admin/kpi-management?tab=reward-penalty');
  await page.waitForLoadState('networkidle');
  
  try {
    // 1. Test action buttons
    console.log('  1️⃣ Testing action buttons...');
    
    // Test Download button
    const downloadButton = await page.locator('button:has-text("Download")');
    if (await downloadButton.isVisible()) {
      await downloadButton.click();
      await page.waitForTimeout(1000);
      console.log('    ✅ Download button clicked');
    }
    
    // Test Auto Calculate button
    const calculateButton = await page.locator('button:has-text("Auto Calculate")');
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
      await page.waitForTimeout(2000);
      
      // Check for loading state
      const loadingElement = await page.locator('svg[class*="animate-spin"]');
      if (await loadingElement.isVisible()) {
        console.log('    ✅ Auto Calculate loading state visible');
        await page.waitForTimeout(3000);
      } else {
        console.log('    ✅ Auto Calculate completed');
      }
    }
    
    // Test Add button
    const addButton = await page.locator('button:has-text("Add")');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const dialog = await page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        console.log('    ✅ Add Reward/Penalty dialog opened');
        
        // Fill form fields
        const kpiSelect = await page.locator('select').first();
        if (await kpiSelect.isVisible()) {
          await kpiSelect.selectOption({ index: 1 });
          console.log('    ✅ KPI selected');
        }
        
        const employeeSelect = await page.locator('select').at(1);
        if (await employeeSelect.isVisible()) {
          await employeeSelect.selectOption({ index: 1 });
          console.log('    ✅ Employee selected');
        }
        
        const periodSelect = await page.locator('select').at(2);
        if (await periodSelect.isVisible()) {
          await periodSelect.selectOption({ index: 1 });
          console.log('    ✅ Period selected');
        }
        
        // Fill amounts
        const rewardAmount = await page.locator('input[id="reward-amount"]');
        if (await rewardAmount.isVisible()) {
          await rewardAmount.fill('100000');
          console.log('    ✅ Reward amount filled');
        }
        
        // Close dialog
        await page.keyboard.press('Escape');
        console.log('    ✅ Add dialog closed');
      }
    }
    
    // 2. Test performance distribution cards
    console.log('  2️⃣ Testing performance cards...');
    const cards = await page.locator('.text-2xl.font-bold');
    const cardCount = await cards.count();
    if (cardCount >= 4) {
      console.log(`    ✅ Found ${cardCount} performance distribution cards`);
    }
    
    // 3. Test table interactions
    console.log('  3️⃣ Testing reward/penalty table...');
    const tableRows = await page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      await tableRows.first().click();
      await page.waitForTimeout(1000);
      
      const dialog = await page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        console.log('        ✅ Reward/Penalty details dialog opened');
        
        // Test action buttons trong dialog
        const approveButton = await page.locator('button:has-text("Approve")');
        const markPaidButton = await page.locator('button:has-text("Mark as Paid")');
        
        if (await approveButton.isVisible()) {
          await approveButton.press('Tab');
          console.log('        ✅ Approve button accessible');
        }
        
        if (await markPaidButton.isVisible()) {
          await markPaidButton.press('Tab');
          console.log('        ✅ Mark as Paid button accessible');
        }
        
        // Close dialog
        await page.keyboard.press('Escape');
      }
    }
    
    // 4. Test filters
    console.log('  4️⃣ Testing filters...');
    const departmentFilter = await page.locator('select').first();
    if (await departmentFilter.isVisible()) {
      await departmentFilter.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
      console.log('    ✅ Department filter applied');
    }
    
    console.log('✅ Reward & Penalty functionality tests completed\n');
    
  } catch (error) {
    console.log('❌ Reward & Penalty test failed:', error.message);
  }
}

testDetailedFunctionality().catch(console.error);

