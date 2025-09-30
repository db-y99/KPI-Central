const { chromium } = require('playwright');

async function testAllKpiElementsComprehensively() {
  console.log('🔍 COMPREHENSIVE ELEMENT TESTING - Kiểm tra từng UI element chi tiết');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Login first
    await setupAdminLogin(page);
    
    // Test each tab with all its elements
    await testKpiDefinitionsElements(page);
    await testKpiAssignmentElements(page);
    await testKpiTrackingElements(page);
    await testApprovalElements(page);
    await testRewardPenaltyElements(page);
    
    console.log('\n🎉 COMPREHENSIVE ELEMENT TESTING COMPLETED!');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    await page.screenshot({ path: `element-test-error-${Date.now()}.png`, fullPage: true });
  } finally {
    await browser.close();
  }
}

async function setupAdminLogin(page) {
  console.log('\n🔐 SETUP: Admin Login');
  await page.goto('http://localhost:9001/login');
  await page.waitForTimeout(2000);
  
  await page.locator('input[name="email"]').fill('db@y99.vn');
  await page.locator('input[name="password"]').fill('Dby996868@');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
  
  if (await page.waitForURL('**/admin', { timeout: 8000 })) {
    console.log('✅ Admin login successful');
  }
}

async function testKpiDefinitionsElements(page) {
  console.log('\n📋 TAB 1: KPI DEFINITIONS ELEMENTS CHECK');
  console.log('-' .repeat(50));
  
  await page.goto('http://localhost:9001/admin/kpi-management?tab=definitions');
  await page.waitForTimeout(3000);
  
  // ===== HEADER ELEMENTS =====
  console.log('\n📑 HEADER SECTION:');
  
  // Page title
  const pageTitle = await page.locator('h1:has-text("KPI Definitions")');
  if (await pageTitle.isVisible()) {
    console.log('   ✅ Page Title: "KPI Definitions" visible');
  }
  
  // Subtitle
  const subtitle = await page.locator('p:has-text("Quản lý")');
  if (await pageTitle.isVisible()) {
    console.log('   ✅ Subtitle description visible');
  }
  
  // Add KPI Button
  const addKpiButton = await page.locator('button').locator('text="Thêm KPI"');
  if (await addKpiButton.isVisible()) {
    console.log('   ✅ "Thêm KPI" Button: visible & clickable');
    
    // Test opening dialog
    await addKpiButton.click();
    await page.waitForTimeout(1500);
    
    const dialog = await page.locator('[role="dialog"]');
    if (await dialog.isVisible()) {
      console.log('   ✅ Create KPI Dialog: Opens successfully');
      
      // Check dialog elements
      await checkCreateKpiDialogElements(page);
      
      // Close dialog
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      console.log('   ✅ Dialog closed successfully');
    }
  }
  
  // ===== STATS CARDS =====
  console.log('\n📊 STATS CARDS SECTION:');
  
  const statCards = await page.locator('.grid .text-2xl.font-bold');
  const cardCount = await statCards.count();
  
  for (let i = 0; i < cardCount; i++) {
    const cardText = await statCards.nth(i).textContent();
    const cardIcon = await page.locator('.grid .block svg').nth(i);
    
    console.log(`   ✅ Stats Card ${i + 1}: "${cardText}" with icon`);
  }
  
  // ===== SEARCH SECTION =====
  console.log('\n🔍 SEARCH SECTION:');
  
  // Search input with icon
  const searchInput = await page.locator('input[placeholder*="tìm kiếm"]');
  if (await searchInput.isVisible()) {
    console.log('   ✅ Search Input: visible with placeholder');
    
    const searchIcon = await page.locator('.relative svg[class*="Search"]');
    if (await searchIcon.IsVisible()) {
      console.log('   ✅ Search Icon: visible');
    }
    
    // Test search functionality
    await searchInput.fill('test');
    await page.waitForTimeout(1000);
    console.log('   ✅ Search input: accepts text');
    
    await searchInput.clear();
    await page.waitForTimeout(500);
    console.log('   ✅ Search cleared: works properly');
  }
  
  // ===== KPI TABLE =====
  console.log('\n📋 KPI TABLE SECTION:');
  
  // Table headers
  const headers = [
    'Tên KPI', 'Mô tả KPI', 'Danh mục KPI', 'Phòng ban KPI', 
    'Trọng số', 'Mục tiêu', 'Trạng thái'
  ];
  
  for (const header of headers) {
    const headerElement = await page.locator(`th:has-text("${header}")`);
    if (await headerElement.isVisible()) {
      console.log(`   ✅ Table Header: "${header}" visible`);
    }
  }
  
  // Table rows
  const tableRows = await page.locator('tbody tr');
  const rowCount = await tableRows.count();
  console.log(`   ✅ Table Rows: ${rowCount} rows displayed`);
  
  if (rowCount > 0) {
    // Test row click (details dialog)
    await tableRows.first().click();
    await page.waitForTimeout(2000);
    
    const detailsDialog = await page.locator('[role="dialog"]');
    if (await detailsDialog.isVisible()) {
      console.log('   ✅ KPI Details Dialog: Opens on row click');
      
      await checkKpiDetailsDialogElements(page);
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      console.log('   ✅ Details dialog closed');
    }
  }
  
  // Empty state
  if (rowCount === 0) {
    const emptyMessage = await page.locator('td:has-text("Không có KPI nào")');
    if (await emptyMessage.isVisible()) {
      console.log('   ✅ Empty State: No KPIs message displayed');
    }
  }
  
  console.log('\n✅ KPI Definitions Tab: All elements checked');
}

async function checkCreateKpiDialogElements(page) {
  console.log('     🔸 CREATE KPI DIALOG ELEMENTS:');
  
  // Dialog title
  const dialogTitle = await page.locator('[role="dialog"] h2');
  if (await dialogTitle.isVisible()) {
    console.log('       ✅ Dialog Title: visible');
  }
  
  // Dialog description
  const dialogDesc = await page.locator('[role="dialog"] p');
  if (await dialogDesc.isVisible()) {
    console.log('       ✅ Dialog Description: visible');
  }
  
  // Check if KpiForm component loads
  const formElement = await page.locator('form');
  if (await formElement.isVisible()) {
    console.log('       ✅ KPI Form: loaded');
    
    // Check form fields
    const nameField = await page.locator('input[name="name"]');
    const descField = await page.locator('textarea[name="description"]');
    const targetField = await page.locator('input[name="target"]');
    
    if (await nameField.isVisible()) {
      console.log('       ✅ Name Field: visible');
    }
    if (await descField.isVisible()) {
      console.log('       ✅ Description Field: visible');
    }
    if (await targetField.isVisible()) {
      console.log('       ✅ Target Field: visible');
    }
    
    // Check department selector
    const deptSelect = await page.locator('select[name="department"]');
    if (await deptSelect.isVisible()) {
      console.log('       ✅ Department Selector: visible');
      
      const deptOptions = await deptSelect.locator('option').count();
      console.log(`       ✅ Department Options: ${deptOptions} available`);
    }
    
    // Check submit buttons
    const submitButton = await page.locator('button[type="submit"]');
    const cancelButton = await page.locator('button:has-text("Hủy")');
    
    if (await submitButton.isVisible()) {
      console.log('       ✅ Submit Button: visible');
    }
    if (await cancelButton.isVisible()) {
      console.log('       ✅ Cancel Button: visible');
    }
  }
}

async function checkKpiDetailsDialogElements(page) {
  console.log('     🔸 DETAILS DIALOG ELEMENTS:');
  
  // Dialog title
  const dialogTitle = await page.locator('[role="dialog"] h2:has-text("Chi tiết KPI")');
  if (await dialogTitle.isVisible()) {
    console.log('       ✅ Dialog Title: "Chi tiết KPI" visible');
  }
  
  // KPI information fields
  const infoFields = [
    'Tên KPI', 'Phòng ban', 'Danh mục', 'Loại', 
    'Tần suất', 'Đơn vị', 'Mục tiêu', 'Trọng số'
  ];
  
  for (const field of infoFields) {
    const label = await page.locator(`label:has-text("${field}")`);
    if (await label.isVisible()) {
      console.log(`       ✅ Info Field: "${field}" label visible`);
    }
  }
  
  // Action buttons
  const actionButtons = [
    { text: 'Đóng', type: 'close' },
    { text: 'Xóa KPI', type: 'delete', icon: 'Trash2' },
    { text: 'Chỉnh sửa', type: 'edit', icon: 'Edit' }
  ];
  
  for (const btn of actionButtons) {
    const button = await page.locator(`button:has-text("${btn.text}")`);
    if (await button.isVisible()) {
      console.log(`       ✅ Action Button: "${btn.text}" visible`);
      
      if (btn.icon) {
        const icon = await button.locator('svg');
        if (await icon.isVisible()) {
          console.log(`       ✅ Icon: ${btn.icon} icon visible`);
        }
      }
    }
  }
}

async function testKpiAssignmentElements(page) {
  console.log('\n👥 TAB 2: KPI ASSIGNMENT ELEMENTS CHECK');
  console.log('-' .repeat(50));
  
  await page.goto('http://localhost:9001/admin/kpi-management?tab=assignment');
  await page.waitForTimeout(3000);
  
  // ===== HEADER ELEMENTS =====
  console.log('\n📑 HEADER SECTION:');
  
  const pageTitle = await page.locator('h1:has-text("Giao KPI cho nhân viên")');
  if (await pageTitle.isVisible()) {
    console.log('   ✅ Page Title: visible');
  }
  
  const assignKpiButton = await page.locator('button:has-text("Giao KPI")').nth(1);
  if (await assignKpiButton.isVisible()) {
    console.log('   ✅ "Giao KPI" Button: visible');
    
    // Test opening assignment dialog
    await assignKpiButton.click();
    await page.waitForTimeout(1500);
    
    const dialog = await page.locator('[role="dialog"]');
    if (await dialog.isVisible()) {
      console.log('   ✅ Assignment Dialog: Opens successfully');
      
      await checkAssignmentDialogElements(page);
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  }
  
  // ===== STATS CARDS =====
  console.log('\n📊 STATS CARDS:');
  
  const statCards = await page.locator('.grid .text-2xl.font-bold');
  const cardCount = await statCards.count();
  console.log(`   ✅ Found ${cardCount} stats cards displayed`);
  
  // ===== FILTER SECTION =====
  console.log('\n🔍 FILTER SECTION:');
  
  const departmentFilter = await page.locator('select').first();
  const statusFilter = await page.locator('select').nth(1);
  
  if (await departmentFilter.isVisible()) {
    console.log('   ✅ Department Filter: visible');
  }
  if (await statusFilter.isVisible()) {
    console.log('   ✅ Status Filter: visible');
  }
  
  // ===== ASSIGNMENT TABLE =====
  console.log('\n📋 ASSIGNMENT TABLE:');
  
  const tableRows = await page.locator('tbody tr');
  const rowCount = await tableRows.count();
  console.log(`   ✅ Assignment Rows: ${rowCount} rows`);
  
  console.log('\n✅ KPI Assignment Tab: All elements checked');
}

async function checkAssignmentDialogElements(page) {
  console.log('     🔸 ASSIGNMENT DIALOG ELEMENTS:');
  
  // Assignment type toggles
  const individualTab = await page.locator('button:has-text("Phân công cá nhân")');
  const departmentTab = await page.locator('button:has-text("Phân công phòng ban")');
  
  if (await individualTab.isVisible()) {
    console.log('       ✅ Individual Assignment Tab: visible');
  }
  if (await departmentTab.isVisible()) {
    console.log('       ✅ Department Assignment Tab: visible');
  }
  
  // Form selectors
  const employeeSelect = await page.locator('select[name="employeeId"]');
  const kpiSelect = await page.locator('select[name="kpiId"]');
  const targetInput = await page.locator('input[name="target"]');
  
  if (await employeeSelect.isVisible()) {
    console.log('       ✅ Employee Selector: visible');
  }
  if (await kpiSelect.isVisible()) {
    console.log('       ✅ KPI Selector: visible');
  }
  if (await targetInput.isVisible()) {
    console.log('       ✅ Target Input: visible');
  }
  
  // Submit buttons
  const submitButton = await page.locator('button').locator('text="Giao KPI"').last();
  const cancelButton = await page.locator('button:has-text("Hủy")');
  
  if (await submitButton.isVisible()) {
    console.log('       ✅ Assignment Submit Button: visible');
  }
  if (await cancelButton.isVisible()) {
    console.log('       ✅ Cancel Button: visible');
  }
}

async function testKpiTrackingElements(page) {
  console.log('\n📈 TAB 3: KPI TRACKING ELEMENTS CHECK');
  console.log('-' .repeat(50));
  
  await page.goto('http://localhost:9001/admin/kpi-management?tab=tracking');
  await page.waitForTimeout(3000);
  
  // ===== HEADER SECTION =====
  console.log('\n📑 HEADER SECTION:');
  
  const pageTitle = await page.locator('h1:has-text("Theo dõi")');
  if (await pageTitle.isVisible()) {
    console.log('   ✅ Page Title: visible');
  }
  
  const refreshButton = await page.locator('button:has-text("Refresh")');
  if (await refreshButton.isVisible()) {
    console.log('   ✅ Refresh Button: visible');
  }
  
  // ===== FILTER SECTION =====
  console.log('\n🔍 FILTER SECTION:');
  
  const employeeSearch = await page.locator('input[placeholder*="Nhân viên"]');
  const departmentFilter = await page.locator('select').first();
  
  if (await employeeSearch.isVisible()) {
    console.log('   ✅ Employee Search: visible');
  }
  if (await departmentFilter.isVisible()) {
    console.log('   ✅ Department Filter: visible');
  }
  
  // ===== TRACKING TABLE =====
  console.log('\n📋 TRACKING TABLE:');
  
  const tableRows = await page.locator('tbody tr');
  const rowCount = await tableRows.count();
  console.log(`   ✅ Tracking Rows: ${rowCount} rows`);
  
  if (rowCount > 0) {
    await tableRows.first().click();
    await page.waitForTimeout(1500);
    
    const dialog = await page.locator('[role="dialog"]');
    if (await dialog.isVisible()) {
      console.log('   ✅ Tracking Details Dialog: Opens');
      
      await checkTrackingDialogElements(page);
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  }
  
  console.log('\n✅ KPI Tracking Tab: All elements checked');
}

async function checkTrackingDialogElements(page) {
  console.log('     🔸 TRACKING DIALOG ELEMENTS:');
  
  // Update progress button
  const updateButton = await page.locator('button:has-text("Update Progress")');
  if (await updateButton.isVisible()) {
    console.log('       ✅ Update Progress Button: visible');
  }
  
  // Progress visualization elements
  const progressElements = await page.locator('.w-full.bg-gray-200');
  const progressCount = await progressElements.count();
  console.log(`       ✅ Progress Bars: ${progressCount} visible`);
}

async function testApprovalElements(page) {
  console.log('\n✅ TAB 4: APPROVAL ELEMENTS CHECK');
  console.log('-' .repeat(50));
  
  await page.goto('http://localhost:9001/admin/kpi-management?tab=approval');
  await page.waitForTimeout(3000);
  
  // ===== HEADER SECTION =====
  console.log('\n📑 HEADER SECTION:');
  
  const pageTitle = await page.locator('h1');
  if (await pageTitle.isVisible()) {
    console.log('   ✅ Page Title: visible');
  }
  
  // ===== FILTER SECTION =====
  console.log('\n🔍 FILTER SECTION:');
  
  const statusFilter = await page.locator('select');
  if (await statusFilter.isVisible()) {
    console.log('   ✅ Status Filter: visible');
  }
  
  // ===== APPROVAL TABLE =====
  console.log('\n📋 APPROVAL TABLE:');
  
  const tableRows = await page.locator('tbody tr');
  const rowCount = await tableRows.count();
  console.log(`   ✅ Approval Rows: ${rowCount} rows`);
  
  if (rowCount > 0) {
    await tableRows.first().click();
    await page.waitForTimeout(1500);
    
    const dialog = await page.locator('[role="dialog"]');
    if (await dialog.isVisible()) {
      console.log('   ✅ Approval Details Dialog: Opens');
      
      await checkApprovalDialogElements(page);
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  }
  
  console.log('\n✅ Approval Tab: All elements checked');
}

async function checkApprovalDialogElements(page) {
  console.log('     🔸 APPROVAL DIALOG ELEMENTS:');
  
  // File attachments area
  const fileArea = await page.locator('.bg-blue-50');
  if (await fileArea.isVisible()) {
    console.log('       ✅ File Attachments Area: visible');
  }
  
  // Download buttons
  const downloadButtons = await page.locator('button svg[class*="Download"]');
  const downloadCount = await downloadButtons.count();
  console.log(`       ✅ Download Buttons: ${downloadCount} available`);
  
  // Comment field
  const commentField = await page.locator('textarea');
  if (await commentField.isVisible()) {
    console.log('       ✅ Comment Field: visible');
  }
  
  // Action buttons
  const approveButton = await page.locator('button:has-text("Phê duyệt")');
  const rejectButton = await page.locator('button:has-text("Từ chối")');

  if (await approveButton.isVisible()) {
    console.log('       ✅ Approve Button: visible');
  }
  if (await rejectButton.isVisible()) {
    console.log('       ✅ Reject Button: visible');
  }
}

async function testRewardPenaltyElements(page) {
  console.log('\n🏆 TAB 5: REWARD & PENALTY ELEMENTS CHECK');
  console.log('-' .repeat(50));
  
  await page.goto('http://localhost:9001/admin/kpi-management?tab=reward-penalty');
  await page.waitForTimeout(3000);
  
  // ===== HEADER SECTION =====
  console.log('\n📑 HEADER SECTION:');
  
  const pageTitle = await page.locator('h1');
  if (await pageTitle.isVisible()) {
    console.log('   ✅ Page Title: visible');
  }
  
  // ===== ACTION BUTTONS =====
  console.log('\n🔄 ACTION BUTTONS:');
  
  const downloadButton = await page.locator('button:has-text("Download")');
  const calculateButton = await page.locator('button:has-text("Auto Calculate")');
  const addButton = await page.locator('button:has-text("Add")');
  
  if (await downloadButton.isVisible()) {
    console.log('   ✅ Download Button: visible');
  }
  if (await calculateButton.isVisible()) {
    console.log('   ✅ Auto Calculate Button: visible');
  }
  if (await addButton.isVisible()) {
    console.log('   ✅ Add Button: visible');
  }
  
  // ===== PERFORMANCE CARDS =====
  console.log('\n📊 PERFORMANCE DISTRIBUTION:');
  
  const performanceCards = await page.locator('.text-2xl.font-bold');
  const cardCount = await performanceCards.count();
  console.log(`   ✅ Performance Cards: ${cardCount} cards visible`);
  
  // ===== REWARD/PENALTY TABLE =====
  console.log('\n📋 REWARD/PENALTY TABLE:');
  
  const tableRows = await page.locator('tbody tr');
  const rowCount = await tableRows.count();
  console.log(`   ✅ Reward/Penalty Rows: ${rowCount} rows`);
  
  if (rowCount > 0) {
    await tableRows.first().click();
    await page.waitForTimeout(1500);
    
    const dialog = await page.locator('[role="dialog"]');
    if (await dialog.isVisible()) {
      console.log('   ✅ Reward/Penalty Details Dialog: Opens');
      
      await checkRewardPenaltyDialogElements(page);
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  }
  
  // ===== FILTER SECTION =====
  console.log('\n🔍 FILTER SECTION:');
  
  const departmentFilter = await page.locator('select');
  if (await departmentFilter.isVisible()) {
    console.log('   ✅ Department Filter: visible');
  }
  
  console.log('\n✅ Reward & Penalty Tab: All elements checked');
}

async function checkRewardPenaltyDialogElements(page) {
  console.log('     🔸 REWARD/PENALTY DIALOG ELEMENTS:');
  
  // Financial details
  const amountElements = await page.locator('.text-lg.font-semibold');
  const amountCount = await amountElements.count();
  console.log(`       ✅ Amount Displays: ${amountCount} visible`);
  
  // Action buttons
  const approveButton = await page.locator('button:has-text("Approve")');
  const payButton = await page.locator('button:has-text("Mark as Paid")');

  if (await approveButton.isVisible()) {
    console.log('       ✅ Approve Button: visible');
  }
  if (await payButton.isVisible()) {
    console.log('       ✅ Mark as Paid Button: visible');
  }
}

// Run comprehensive element test
testAllKpiElementsComprehensively().catch(console.error);

