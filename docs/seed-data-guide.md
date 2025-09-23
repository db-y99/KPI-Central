# 🌱 Seed Data Guide - KPI Central

Hướng dẫn sử dụng tính năng seed data để thêm dữ liệu mẫu vào hệ thống KPI Central.

## 📋 Tổng quan

Hệ thống KPI Central đã được tích hợp sẵn các tính năng seed data để giúp bạn nhanh chóng thiết lập dữ liệu mẫu cho việc test và demo.

## 🚀 Cách sử dụng

### 1. Qua giao diện Web (Khuyến nghị)

1. **Đăng nhập với tài khoản admin:**
   - Email: `db@y99.vn`
   - Password: `123456`

2. **Truy cập trang Seed Data:**
   - Vào menu sidebar → **Seed Data**
   - Hoặc truy cập trực tiếp: `http://localhost:9001/admin/seed-data`

3. **Thực hiện các thao tác:**
   - **Initialize Policies**: Khởi tạo phòng ban, chương trình thưởng và KPIs
   - **Seed Sample Data**: Thêm nhân viên mẫu và KPI records
   - **Reset & Seed All**: Reset toàn bộ và seed lại từ đầu

### 2. Qua Command Line

```bash
# Khởi tạo chính sách công ty
npm run seed:policies

# Thêm dữ liệu mẫu
npm run seed:data

# Reset và seed lại toàn bộ
npm run seed:reset

# Xóa toàn bộ dữ liệu
npm run seed:clear

# Test dữ liệu đã tạo
npm run test:data
```

## 📊 Dữ liệu được tạo

### Phòng ban (6 phòng ban)
- **IT**: Phòng Công nghệ thông tin
- **Marketing**: Phòng Marketing  
- **Customer Service**: Phòng Chăm sóc khách hàng
- **Credit**: Phòng Thẩm định tín dụng
- **HR**: Phòng Hành chính - Nhân sự
- **Accounting**: Phòng Kế toán

### Nhân viên mẫu (13 nhân viên)
- **IT Staff**: 2 nhân viên (it_001, it_002)
- **Head of Marketing**: 1 nhân viên (marketing_001)
- **Marketing Assistant**: 2 nhân viên (marketing_002, marketing_003)
- **Customer Service Officer**: 2 nhân viên (cs_001, cs_002)
- **Credit Appraisal Staff**: 2 nhân viên (credit_001, credit_002)
- **HR/Admin Staff**: 2 nhân viên (hr_001, hr_002)
- **Accountant**: 2 nhân viên (accounting_001, accounting_002)

### Chương trình thưởng (7 chương trình)
- Chương trình thưởng cho từng vị trí công việc
- Bao gồm thưởng hàng tháng, quý và năm
- Hệ thống phạt và cảnh cáo

### KPIs (19 KPIs)
- KPIs cho từng phòng ban và vị trí
- Bao gồm target, reward và penalty
- Đa dạng các loại metric

### KPI Records (28 records)
- Dữ liệu KPI records cho tháng 12/2024
- Mỗi nhân viên có 2 KPI records phù hợp với vị trí
- Bao gồm actual values và target values với kết quả đa dạng
- Trạng thái completed với một số records vượt/không đạt target

### Metric Data (13 records)
- Dữ liệu metric thực tế để test tracking
- Mỗi nhân viên có 1 metric data phù hợp với vị trí
- Bao gồm system uptime, customer acquisition, service points, loan approval rate, v.v.

## 🎯 Tính năng có thể test

Sau khi seed dữ liệu, bạn có thể test các tính năng sau:

### Cho Admin
- ✅ Quản lý nhân viên và phòng ban
- ✅ Theo dõi KPI và performance
- ✅ Duyệt báo cáo từ nhân viên
- ✅ Tính toán thưởng phạt
- ✅ Tạo báo cáo tổng hợp
- ✅ Quản lý chương trình thưởng

### Cho Employee
- ✅ Xem profile cá nhân
- ✅ Cập nhật metric data
- ✅ Tạo báo cáo KPI
- ✅ Xem lịch sử performance
- ✅ Theo dõi điểm thưởng

## 🔧 Troubleshooting

### Lỗi Firebase Connection
```bash
# Kiểm tra file .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... các config khác
```

### Lỗi Permission
- Đảm bảo đã đăng nhập với tài khoản admin
- Kiểm tra Firebase Security Rules
- Đảm bảo Firestore đã được enable

### Lỗi Seed Data
- Chạy `npm run seed:clear` để xóa dữ liệu cũ
- Sau đó chạy lại `npm run seed:policies` và `npm run seed:data`
- Sử dụng `npm run test:data` để kiểm tra tính toàn vẹn của dữ liệu

## 📝 Lưu ý quan trọng

1. **Backup dữ liệu**: Trước khi chạy reset, hãy backup dữ liệu quan trọng
2. **Environment**: Đảm bảo đang chạy trong môi trường development
3. **Firebase**: Cần có Firebase project đã setup đầy đủ
4. **Permissions**: Cần quyền admin để truy cập trang seed data

## 🎉 Kết quả mong đợi

Sau khi seed thành công, bạn sẽ có:
- Hệ thống đầy đủ dữ liệu để test với sự liên kết chính xác
- 13 nhân viên từ 6 phòng ban với ID rõ ràng
- 6 phòng ban với chương trình thưởng riêng
- 19 KPIs đa dạng cho các vị trí khác nhau
- 28 KPI records với dữ liệu thực tế đa dạng
- 13 metric data records liên kết với từng nhân viên
- Tất cả dữ liệu có sự liên kết logic và đồng bộ

Chúc bạn test hệ thống thành công! 🚀
