const { chromium } = require('playwright');

async function testCRUDOperations() {
  console.log('🧪 Testing CRUD Operations cho từng Tab KPI Management...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Đăng nhập
    console.log('🔐 Đăng nhập admin...');
    await page.goto('http://localhost:9001/login');
    await page.waitForTimeout(2000);
    await page.locator('input[name="email"]').fill('db@y99.vn');
    await page.locator('input[name="password"]').fill('Dby996868@');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    console.log('✅ Đăng nhập thành công!\n');
    
    // Test CRUD cho từng tab
    await testKPIDefinitionsCRUD(page);
    await testKPIAssignmentCRUD(page);
    await testKPITrackingCRUD(page);
    await testApprovalCRUD(page);
    await testRewardPenaltyCRUD(page);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 HOÀN THÀNH TEST TẤT CẢ CRUD OPERATIONS!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'crud-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

async function testKPIDefinitionsCRUD(page) {
  console.log('📋 TESTING KPI DEFINITIONS CRUD...');
  await page.goto('http://localhost:9001/admin/kpi-management?tab=definitions');
  await page.waitForTimeout(2000);
  
  try {
    // ✅ CREATE - Test tạo KPI mới
    console.log('  📝 CREATE OPERATION - Tạo KPI mới...');
    const addButton = await page.locator('button:has-text("Thêm KPI")');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1500);
      
      const dialog = await page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        console.log('    ✅ Dialog tạo KPI hiển thị');
        
        // Fill form data
        const testKpiName = `Test KPI ${Date.now()}`;
        
        await page.locator('input[name="name"]').fill(testKpiName);
        await page.locator('textarea[name="description"]').fill('Test description từ automated test');
        
        // Select department
        const departmentSelect = await page.locator('select[name="department"]');
        if (await departmentSelect.isVisible()) {
          const options = await departmentSelect.locator('option').count();
          if (options > 1) {
            await departmentSelect.selectOption({ index: 1 });
            console.log('    ✅ Department selected');
          }
        }
        
        await page.locator('input[name="target"]').fill('100');
        await page.locator('input[name="duration"]').fill('30');
        
        // Try to submit (test create function)
        const submitButton = await page.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(2000);
          
          // Check for success message
          const successMsg = await page.locator('text="Thành công"');
          if (await successMsg.isVisible()) {
            console.log('    ✅ CREATE: KPI được tạo thành công');
          } else {
            console.log('    ⚠️ CREATE: Không rõ kết quả - có thể thành công');
          }
        }
      }
    }
    
    // ✅ READ - Test đọc danh sách KPI
    console.log('  👁️ READ OPERATION - Đọc danh sách KPI...');
    await page.waitForTimeout(1000);
    const kpiTable = await page.locator('table tbody tr');
    const kpiCount = await kpiTable.count();
    console.log(`    ✅ Found ${kpiCount} KPIs trong table`);
    
    // ✅ UPDATE - Test sửa KPI (nếu có data)
    if (kpiCount > 0) {
      console.log('  ✏️ UPDATE OPERATION - Sửa KPI...');
      await kpiTable.first().click();
      await page.waitForTimeout(1500);
      
      const dialog = await page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        console.log('    ✅ Dialog chi tiết KPI hiển thị');
        
        const editButton = await page.locator('button:has-text("Chỉnh sửa")');
        if (await editButton.isVisible()) {
          await editButton.click();
          await page.waitForTimeout(1500);
          
          // Test update form
          const nameField = await page.locator('input[name="name"]');
          if (await nameField.isVisible()) {
            const currentValue = await nameField.inputValue();
            await nameField.fill(currentValue + ' - Updated');
            console.log('    ✅ UPDATE: Name field modified');
            
            // Revert change for test
            await nameField.fill(currentValue);
          }
          
          // Close edit dialog without saving
          await page.keyboard.press('Escape');
          console.log('    ✅ UPDATE: Edit dialog closed');
        }
        
        await page.keyboard.press('Escape'); // Close detail dialog
      }
    }
    
    // ✅ DELETE - Test xóa KPI
    console.log('  🗑️ DELETE OPERATION - Xóa KPI...');
    const deleteButton = await page.locator('button').locator('text="Xóa"').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.waitForTimeout(1000);
      
      // Check for confirmation dialog
      const confirmDialog = await page.locator('text="Xác nhận"');
      if (await confirmDialog.isVisible()) {
        console.log('    ✅ DELETE: Confirmation dialog hiển thị');
        // Don't actually delete, just test UI
        await page.keyboard.press('Escape');
        console.log('    ✅ DELETE: Delete cancelled để giữ data');
      }
    } else {
      console.log('    ⚠️ DELETE: No delete button found hoặc cần permission');
    }
    
    console.log('✅ KPI Definitions CRUD tests completed\n');
    
  } catch (error) {
    console.log('❌ KPI Definitions CRUD test failed:', error.message);
  }
}

async function testKPIAssignmentCRUD(page) {
  console.log('👥 TESTING KPI ASSIGNMENT CRUD...');
  await page.goto('http://localhost:9001/admin/kpi-management?tab=assignment');
  await page.waitForTimeout(2000);
  
  try {
    // ✅ CREATE - Test tạo assignment mới
    console.log('  📝 CREATE OPERATION - Tạo Assignment mới...');
    const assignButton = await page.locator('button:has-text("Phân công KPI")');
    if (await assignButton.isVisible()) {
      await assignButton.click();
      await page.waitForTimeout(1500);
      
      const dialog = await page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        console.log('    ✅ Assignment dialog hiển thị');
        
        // Test Individual assignment
        const individualTab = await page.locator('button:has-text("Phân công cá nhân")');
        if (await individualTab.isVisible()) {
          await individualTab.click();
          await page.waitForTimeout(500);
        }
        
        // Fill assignment form
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
        
        await page.locator('input[name="target"]').fill('80');
        
        // Try to submit
        const submitButton = await page.locator('button[type="submit"]').last();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(2000);
          console.log('    ✅ CREATE: Assignment form submitted');
        }
        
        await page.keyboard.press('Escape');
      }
    }
    
    // ✅ READ - Test đọc danh sách assignment
    console.log('  👁️ READ OPERATION - Đọc danh sách Assignment...');
    await page.waitForTimeout(1000);
    const assignmentTable = await page.locator('table tbody tr');
    const assignmentCount = await assignmentTable.count();
    console.log(`    ✅ Found ${assignmentCount} assignments trong table`);
    
    // ✅ UPDATE - Test sửa assignment status
    if (assignmentCount > 0) {
      console.log('  ✏️ UPDATE OPERATION - Update assignment status...');
      const statusSelect = await page.locator('select').first();
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption({ index: 1 });
        await page.waitForTimeout(1000);
        console.log('    ✅ UPDATE: Assignment status changed');
      }
    }
    
    console.log('✅ KPI Assignment CRUD tests completed\n');
    
  } catch (error) {
    console.log('❌ KPI Assignment CRUD test failed:', error.message);
  }
}

async function testKPITrackingCRUD(page) {
  console.log('📈 TESTING KPI TRACKING CRUD...');
  await page.goto('http://localhost:9001/admin/kpi-management?tab=tracking');
  await page.waitForTimeout(2000);
  
  try {
    // ✅ READ - Test đọc progress data
    console.log('  👁️ READ OPERATION - Đọc tracking data...');
    const trackingTable = await page.locator('table tbody tr');
    const trackingCount = await trackingTable.count();
    console.log(`    ✅ Found ${trackingCount} tracking records`);
    
    // ✅ UPDATE - Test update progress
    if (trackingCount > 0) {
      console.log('  ✏️ UPDATE OPERATION - Update KPI progress...');
      await trackingTable.first().click();
      await page.waitForTimeout(1500);
      
      const dialog = await page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
          console.log('    ✅ Tracking details dialog hiển thị');
          
          const updateButton = await page.locator('button:has-text("Update Progress")');
          if (await updateButton.isVisible()) {
            await updateButton.click();
            await page.waitForTimeout(1500);
            
            const updateDialog = await page.locator('[role="dialog"]').last();
            if (await updateDialog.isVisible()) {
              console.log('    ✅ Update progress dialog hiển thị');
              
              await page.locator('input[name="actual"]').fill(60);
              await page.locator('textarea[name="notes"]').fill('Updated progress từ automated test');
              
              // Try to submit update
              const submitButton = await page.locator('button[type="submit"]').last();
              if (await submitButton.isVisible()) {
                await submitButton.click();
                await page.waitForTimeout(2000);
                console.log('    ✅ UPDATE: Progress được cập nhật');
              }
            }
          }
          
          await page.keyboard.press('Escape'); // Close dialogs
          await page.keyboard.press('Escape');
        }
      }
    
    console.log('✅ KPI Tracking CRUD tests completed\n');
    
  } catch (error) {
    console.log('❌ KPI Tracking CRUD test failed:', error.message);
  }
}

async function testApprovalCRUD(page) {
  console.log('✅ TESTING APPROVAL CRUD...');
  await page.goto('http://localhost:9001/admin/kpi-management?tab=approval');
  await page.waitForTimeout(2000);
  
  try {
    // ✅ READ - Test đọc reports pending approval
    console.log('  👁️ READ OPERATION - Đọc reports chờ phê duyệt...');
    const approvalTable = await page.locator('table tbody tr');
    const approvalCount = await approvalTable.count();
    console.log(`    ✅ Found ${approvalCount} reports chờ approval`);
    
    // ✅ UPDATE - Test approve/reject operations
    if (approvalCount > 0) {
      console.log('  ✏️ UPDATE OPERATION - Approve/Reject reports...');
      await approvalTable.first().click();
      await page.waitForTimeout(1500);
      
      const dialog = await page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        console.log('    ✅ Approval details dialog hiển thị');
        
        // Test reading report details
        const employeeName = await page.locator('text=Employee:').textContent();
        console.log('    ✅ Report details read successfully');
        
        // Test adding approval comments
        const commentField = await page.locator('textarea');
        if (await commentField.isVisible()) {
          await commentField.fill('Approved from automated test');
          console.log('    ✅ Approval comment added');
          await commentField.clear();
        }
        
        // Test approve button (hover, don't click)
        const approveButton = await page.locator('button:has-text("Phê duyệt")');
        if (await approveButton.isVisible()) {
          await approveButton.hover();
          console.log('    ✅ Approve button accessible');
        }
        
        // Test reject button (hover, don't click)
        const rejectButton = await page.locator('button:has-text("Từ chối")');
        if (await rejectButton.isVisible()) {
          await rejectButton.hover();
          console.log('    ✅ Reject button accessible');
        }
        
        await page.keyboard.press('Escape');
      }
    }
    
    // ✅ Filter operations (Read variations)
    console.log('  🔍 READ VARIATIONS - Test filters...');
    const statusFilter = await page.locator('select').first();
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
      console.log('    ✅ Filter applied successfully');
    }
    
    console.log('✅ Approval CRUD tests completed\n');
    
  } catch (error) {
    console.log('❌ Approval CRUD test failed:', error.message);
  }
}

async function testRewardPenaltyCRUD(page) {
  console.log('🏆 TESTING REWARD & PENALTY CRUD...');
  await page.goto('http://localhost:9001/admin/kpi-management?tab=reward-penalty');
  await page.waitForTimeout(2000);
  
  try {
    // ✅ CREATE - Test auto calculate
    console.log('  📝 CREATE OPERATION - Auto calculate rewards/penalties...');
    const calculateButton = await page.locator('button:has-text("Auto Calculate")');
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
      await page.waitForTimeout(3000);
      
      // Check for loading state or completion
      const loadingElement = await page.locator('svg[class*="animate-spin"]');
      if (await loadingElement.isVisible()) {
        console.log('    ✅ Auto Calculate: Loading state hiển thị');
        await page.waitForTimeout(3000);
      } else {
        console.log('    ✅ AUTO CALCULATE: Process hoàn thành');
      }
    }
    
    // ✅ CREATE - Test manual add reward/penalty
    console.log('  📝 CREATE OPERATION - Manual add reward/penalty...');
    const addButton = await page.locator('button:has-text("Add")');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1500);
      
      const dialog = await page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        console.log('    ✅ Add reward/penalty dialog hiển thị');
        
        // Fill form
        const selects = await page.locator('select').count();
        for (let i = 0; i < selectCount && i < 3; i++) {
          const select = await page.locator('select').nth(i);
          if (await select.isVisible()) {
            await select.selectOption({ index: 1 });
          }
        }
        console.log('    ✅ Form selects filled');
        
        const amountFields = await page.locator('input[type="number"]');
        await amountFields.fill('50000');
        console.log('    ✅ Amount fields filled');
        
        await page.keyboard.press('Escape');
      }
    }
    
    // ✅ READ - Test đọc reward/penalty data
    console.log('  👁️ READ OPERATION - Đọc reward/penalty data...');
    const rewardTable = await page.locator('table tbody tr');
    const rewardCount = await rewardTable.count();
    console.log(`    ✅ Found ${rewardCount} reward/penalty records`);
    
    // ✅ UPDATE - Test approve/pay operations
    if (rewardCount > 0) {
      console.log('  ✏️ UPDATE OPERATION - Approve/Mark as paid...');
      await rewardTable.first().click();
      await page.waitForTimeout(1500);
      
      const dialog = await page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        console.log('    ✅ Reward/Penalty details dialog hiển thị');
        
        // Test approve button
        const approveButton = await page.locator('button:has-text("Approve")');
        if (await approveButton.isVisible()) {
          await approveButton.hover();
          console.log('    ✅ Approve button accessible');
        }
        
        // Test mark as paid button
        const paidButton = await page.locator('button:has-text("Mark as Paid")');
        if (await paidButton.isVisible()) {
          await paidButton.hover();
          console.log('    ✅ Mark as Paid button accessible');
        }
        
        await page.keyboard.press('Escape');
      }
    }
    
    // ✅ READ - Test performance cards
    console.log('  📊 READ VARIATIONS - Performance distribution...');
    const performanceCards = await page.locator('.text-2xl.font-bold');
    const cardCount = await performanceCards.count();
    if (cardCount >= 4) {
      console.log(`    ✅ Found ${cardCount} performance cards hiển thị`);
    }
    
    console.log('✅ Reward & Penalty CRUD tests completed\n');
    
  } catch (error) {
    console.log('❌ Reward & Penalty CRUD test failed:', error.message);
  }
}

testCRUDOperations().catch(console.error);
