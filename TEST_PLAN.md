# Test Plan - KPI Central System

## 🎯 Mục tiêu Test
Kiểm tra toàn bộ hệ thống KPI Central với cấu trúc database mới (multi-tenant) và các tính năng nâng cao.

## 📋 Test Cases

### 1. **Authentication & Authorization**
- [ ] Login với admin account
- [ ] Login với employee account
- [ ] Logout functionality
- [ ] Session persistence
- [ ] Role-based access control

### 2. **Database Migration**
- [ ] Truy cập trang migration: `/admin/migration`
- [ ] Kiểm tra UI migration page
- [ ] Test migration process (nếu có dữ liệu)
- [ ] Kiểm tra rollback functionality

### 3. **Admin Dashboard**
- [ ] Truy cập `/admin`
- [ ] Kiểm tra dashboard stats
- [ ] Test navigation giữa các tabs
- [ ] Kiểm tra responsive design

### 4. **Employee Management**
- [ ] Truy cập `/admin/hr-management`
- [ ] Test thêm employee mới
- [ ] Test edit employee
- [ ] Test delete employee
- [ ] Test bulk import/export

### 5. **KPI Management**
- [ ] Truy cập `/admin/kpi-management`
- [ ] Test thêm KPI mới
- [ ] Test edit KPI
- [ ] Test delete KPI
- [ ] Test KPI assignment
- [ ] Test reward-penalty tab

### 6. **Department Management**
- [ ] Test thêm department
- [ ] Test edit department
- [ ] Test delete department
- [ ] Test hierarchical structure

### 7. **Employee Portal**
- [ ] Truy cập `/employee`
- [ ] Test employee dashboard
- [ ] Test profile management
- [ ] Test self-update metrics
- [ ] Test reports submission

### 8. **Performance Distribution**
- [ ] Kiểm tra performance distribution card
- [ ] Test tính toán phân bố hiệu suất
- [ ] Test responsive layout

### 9. **Reward & Penalty System**
- [ ] Test reward calculation
- [ ] Test penalty calculation
- [ ] Test approval workflow
- [ ] Test statistics display

### 10. **Multi-tenant Features**
- [ ] Test organization context
- [ ] Test data isolation
- [ ] Test enhanced data structures

### 11. **API Endpoints**
- [ ] Test `/api/employees`
- [ ] Test `/api/kpis`
- [ ] Test `/api/metrics`
- [ ] Test `/api/migration`

### 12. **Error Handling**
- [ ] Test error boundaries
- [ ] Test validation errors
- [ ] Test network errors
- [ ] Test authentication errors

### 13. **Performance**
- [ ] Test page load times
- [ ] Test data fetching performance
- [ ] Test UI responsiveness

### 14. **Security**
- [ ] Test Firestore security rules
- [ ] Test data access permissions
- [ ] Test input validation

## 🔧 Test Tools & Commands

### Start Development Server
```bash
npm run dev
```

### Check Linting
```bash
npm run lint
```

### Build Test
```bash
npm run build
```

### Test Database Connection
- Kiểm tra Firebase connection
- Test Firestore operations

## 📊 Expected Results

### ✅ Success Criteria
- Tất cả pages load thành công
- Authentication hoạt động đúng
- CRUD operations hoạt động
- Migration process hoạt động
- Performance distribution hiển thị đúng
- Multi-tenant features hoạt động

### ❌ Failure Criteria
- Pages không load được
- Authentication lỗi
- CRUD operations fail
- Migration process lỗi
- Performance issues
- Security vulnerabilities

## 🚀 Test Execution

1. **Manual Testing**: Test từng feature một cách thủ công
2. **Automated Testing**: Sử dụng browser dev tools
3. **Performance Testing**: Monitor network và performance
4. **Security Testing**: Kiểm tra permissions và data access

## 📝 Test Report

Sau khi hoàn thành test, sẽ tạo report chi tiết về:
- Test results
- Issues found
- Performance metrics
- Recommendations
