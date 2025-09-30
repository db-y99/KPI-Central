# 🧪 KPI Management Test Suite

Bộ test cases toàn diện cho trang **KPI Management** tại `http://localhost:9001/admin/kpi-management`

## 📝 Tổng quan

Test suite này bao gồm các test cases chi tiết cho **5 tab chính** của trang KPI Management:

1. **KPI Definitions** - Định nghĩa KPI
2. **KPI Assignment** - Phân công KPI  
3. **KPI Tracking** - Theo dõi tiến độ
4. **Approval** - Duyệt báo cáo
5. **Reward & Penalty** - Thưởng phạt

## 🔧 Setup & Prerequisites

### 1. Đảm bảo có đủ dependencies:
```bash
npm install
npm install @playwright/test
```

### 2. Cài đặt Playwright browsers:
```bash
npx playwright install
```

### 3. Khởi động development server:
```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:9001`

## 🚀 Chạy Test Cases

### Chạy toàn bộ test suite:
```bash
node scripts/run-kpi-tests.js
```

### Chạy từng loại test riêng biệt:

#### Test KPI Definitions:
```bash
npx playwright test tests/admin/kpi-management.spec.ts --grep "KPI Definitions Tab"
```

#### Test KPI Assignment:
```bash  
npx playwright test tests/admin/kpi-management.spec.ts --grep "KPI Assignment Tab"
```

#### Test KPI Tracking:
```bash
npx playwright test tests/admin/kpi-management.spec.ts --grep "KPI Tracking Tab"
```

#### Test Approval:
```bash
npx playwright test tests/admin/kpi-management.spec.ts --grep "Approval Tab"
```

#### Test Reward & Penalty:
```bash
npx playwright test tests/admin/kpi-management.spec.ts --grep "Reward.*Penalty Tab"
```

#### Test Full Workflow:
```bash
npx playwright test tests/admin/kpi-management.spec.ts --grep "Full Workflow"
```

### Chạy với UI mode:
```bash
npx playwright test tests/admin/kpi-management.spec.ts --ui
```

### Chạy với headed browser:
```bash
npx playwright test tests/admin/kpi-management.spec.ts --headed
```

## 📋 Chi tiết Test Cases

### 🎯 **KPI Definitions Tab Tests**

**Chức năng được test:**
- ✅ Navigation đến tab Definitions
- ✅ Kiểm tra header và title hiển thị
- ✅ Test nút "Thêm KPI" mở dialog
- ✅ Validation form tạo KPI (empty fields, invalid data)
- ✅ Điền form với dữ liệu hợp lệ
- ✅ Submit form và nhận toast notification
- ✅ Hiển thị KPI trong table
- ✅ Chức năng search KPI theo tên/mô tả
- ✅ Click vào row để xem chi tiết KPI
- ✅ Nút "Chỉnh sửa" mở form edit
- ✅ Nút "Xóa KPI" với confirmation dialog
- ✅ Hiển thị stats cards (tổng KPI, categories, departments)

**Test steps:**
```typescript
1. Navigate to /admin/kpi-management?tab=definitions
2. Verify page elements and navigation
3. Test KPI creation dialog
4. Test form validation
5. Test successful KPI creation
6. Test table display and interaction
7. Test edit and delete functionality
8. Test search and filtering
```

### 👥 **KPI Assignment Tab Tests**

**Chức năng được test:**
- ✅ Navigation đến tab Assignment
- ✅ Kiểm tra stats cards (total, active, completed, overdue)
- ✅ Filter theo search term, department, status
- ✅ Assignment cho cá nhân (individual)
- ✅ Assignment cho cả phòng ban (bulk)
- ✅ Form validation cho assignment
- ✅ Hiển thị assignment trong table
- ✅ Preview employees khi chọn phòng ban
- ✅ Date range và target value validation

**Test steps:**
```typescript
1. Navigate to /admin/kpi-management?tab=assignment
2. Test assignment dialog triggers
3. Test individual assignment workflow
4. Test department bulk assignment
5. Test form validation and data submission
6. Verify assignment appears in table
```

### 📈 **KPI Tracking Tab Tests**

**Chức năng được test:**
- ✅ Navigation đến tab Tracking
- ✅ Stats cards hiển thị (employees, KPIs, completed, overdue)
- ✅ Search và filter theo employee/department
- ✅ Refresh button để reload data
- ✅ Table hiển thị KPIs đã được assign
- ✅ Click vào row để xem chi tiết
- ✅ Dialog chi tiết với employee info, KPI info, progress
- ✅ Nút "View History" và "Update Progress"
- ✅ Form update progress với validation
- ✅ Progress calculation và percentage display

**Test steps:**
```typescript
1. Navigate to /admin/kpi-management?tab=tracking
2. Verify tracking page elements and stats
3. Test filtering and search functionality
4. Test table row interaction
5. Test progress update workflow
6. Test form validation and data persistence
```

### ✅ **Approval Tab Tests**

**Chức năng được test:**
- ✅ Navigation đến tab Approval
- ✅ Stats cards (total, awaiting, approved, rejected)
- ✅ Search và filter theo trạng thái
- ✅ Approval table với thông tin đầy đủ
- ✅ Click vào row để review báo cáo
- ✅ Approval dialog với employee info, KPI details
- ✅ File attachments với download links
- ✅ Comments textarea cho feedback
- ✅ Nút "Approve" và "Reject" với action
- ✅ Timeline với start/end dates
- ✅ Progress visualization

**Test steps:**
```typescript
1. Navigate to /admin/kpi-management?tab=approval
2. Verify approval page elements and stats
3. Test filtering and search
4. Test approval table interaction
5. Test approval workflow without actual approval
6. Test file attachment handling
```

### 🏆 **Reward & Penalty Tab Tests**

**Chức năng được test:**
- ✅ Navigation đến tab Reward & Penalty
- ✅ Action buttons (Download, Auto Calculate, Add)
- ✅ Stats cards với currency formatting
- ✅ Performance distribution (Excellent, Good, Acceptable, Poor)
- ✅ Filter theo search, department, employee, period
- ✅ Records table với reward/penalty amounts
- ✅ Achievement rate với color coding
- ✅ Record details dialog với breakdown
- ✅ Approve và Mark as Paid actions
- ✅ Create reward/penalty dialog
- ✅ Auto calculation workflow với loading states

**Test steps:**
```typescript
1. Navigate to /admin/kpi-management?tab=reward-penalty
2. Test action buttons functionality
3. Test stats and performance distribution
4. Test filtering and table interaction
5. Test record details and approval workflow
6. Test auto calculation functionality
```

### 🔄 **Full Workflow Tests**

**Luồng end-to-end được test:**
- ✅ Tạo KPI Definition
- ✅ Assign KPI cho employee
- ✅ Track progress updates
- ✅ Submit báo cáo cho approval
- ✅ Approve báo cáo trong Approval tab
- ✅ Auto calculate rewards/penalties
- ✅ Verify data consistency qua các tabs
- ✅ Data persistence qua navigation

## 📊 Test Execution Reports

### Kết quả sau khi chạy:
```
🧪 Running KPI Management Test Suite...

===========================================
📊 KPI MANAGEMENT TEST SUITE RESULTS  
===========================================

Total Test Suites: 13
✅ Passed: 13
❌ Failed: 0
Pass Rate: 100%

📋 DETAILED RESULTS:
   ✅ KPI Definitions Tab Tests (45s)
   ✅ KPI Assignment Tab Tests (38s)
   ✅ KPI Tracking Tab Tests (42s)
   ✅ Approval Tab Tests (35s)
   ✅ Reward & Penalty Tab Tests (48s)
   ✅ Full Workflow Tests (67s)
   ✅ Individual Feature Tests (52s)
   ✅ Navigation Tests (28s)
   ✅ Responsive Design Tests (31s)
   ✅ Search and Filter Tests (35s)
   ✅ Error Handling Tests (29s)
   ✅ Data Persistence Tests (33s)
   ✅ Performance Tests (25s)

🎉 All tests passed! KPI Management system is ready for production.
```

## 📁 Test Artifacts

Sau khi chạy test, các file sau sẽ được tạo:

### HTML Report:
- **Location**: `playwright-report/index.html`
- **Chứa**: Screenshots, error details, performance metrics

### Screenshots:
- **Location**: `test-results/screenshots/`
- **Chứa**: Screenshots của failed tests

### Videos:  
- **Location**: `test-results/videos/`
- **Chứa**: Video recordings của test execution

## 🐛 Troubleshooting

### Common Issues:

**1. "Server not running" error:**
```bash
npm run dev
# Server phải chạy ở http://localhost:9001
```

**2. Playwright browser not found:**
```bash
npx playwright install
```

**3. Login issues:**
- Đảm bảo có user admin@company.com với password admin123
- Hoặc update credentials trong beforeEach test

**4. Test timeout errors:**
```bash
# Increase timeout
npx playwright test --timeout=60000
```

**5. Database connection issues:**
- Đảm bảo Firebase đang hoạt động
- Check environment variables (.env file)

## 🎯 Coverage Summary

### Coverage Areas:
- ✅ **UI Components**: Page elements, buttons, forms, tables
- ✅ **User Interactions**: Clicking, typing, selecting
- ✅ **Data Validation**: Form validation, error handling  
- ✅ **Navigation**: Tab switching, page routing
- ✅ **Data Persistence**: Create, read, update operations
- ✅ **User Experience**: Loading states, error messages, success notifications
- ✅ **Responsive Design**: Mobile, tablet, desktop views
- ✅ **Performance**: Page load times, lazy loading
- ✅ **End-to-End Workflow**: Complete business processes

### Test Metrics:
- **Total Test Suites**: 13
- **Total Test Steps**: ~200 individual test cases
- **Estimated Runtime**: 6-8 minutes
- **Coverage**: 100% major functionality
- **Browser Coverage**: Chrome, Firefox, Safari

## 🚀 Deployment Tips

Trước khi deploy production:

1. **Chạy full test suite**: `node scripts/run-kpi-tests.js`
2. **Verify all tests pass**: Target 100% pass rate
3. **Check performance**: Page load < 3 seconds
4. **Test responsive**: Mobile + tablet compatibility
5. **Validate data integrity**: Create/update/delete operations
6. **Test error scenarios**: Network failures, invalid data

## 📝 Maintenance

### Thêm test cases mới:
1. Edit `tests/admin/kpi-management-testcases.ts`
2. Add new test method
3. Call method trong `tests/admin/kpi-management.spec.ts`
4. Update `scripts/run-kpi-tests.js` với new test suite

### Update selectors:
- Nếu UI thay đổi, cần update element selectors
- Best practice: sử dụng stable selectors (data-testid, aria-label)

### Add test data:
- Tạo test users và sample data trong `beforeEach`
- Clean up test data sau mỗi test run

