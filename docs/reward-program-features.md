# Tính Năng Chương Trình Thưởng - Hướng Dẫn Sử Dụng

## Tổng Quan

Hệ thống chương trình thưởng đã được nâng cấp với các tính năng mới cho phép xem chi tiết, chỉnh sửa và cấu hình điều kiện thưởng một cách trực quan và dễ sử dụng.

## 🎯 Các Tính Năng Chính

### 1. Xem Chi Tiết Chương Trình Thưởng

#### Cách truy cập:
- Vào `/admin/rewards` 
- Click vào nút **"Xem chi tiết"** trong dropdown menu của bất kỳ chương trình nào

#### Tính năng:
- **Modal toàn màn hình** với thông tin đầy đủ
- **Tabs phân loại** rõ ràng:
  - 🟢 **Thưởng quý** - Màu xanh lá
  - 🔵 **Thưởng tháng** - Màu xanh dương  
  - 🟣 **Thưởng năm** - Màu tím
  - 🔴 **Hình phạt** - Màu đỏ
- **Hiển thị điều kiện** chi tiết cho từng khoản thưởng/phạt
- **Format tiền tệ** Việt Nam (VND)
- **Nút chỉnh sửa** tích hợp ngay trong modal

### 2. Chỉnh Sửa Chương Trình Thưởng

#### Cách truy cập:
- Từ modal xem chi tiết: Click **"Chỉnh sửa"**
- Hoặc từ danh sách: Click **"Sửa"** trong dropdown menu

#### Cấu trúc form:
1. **Thông tin cơ bản:**
   - Tên chương trình
   - Vị trí áp dụng
   - Mô tả chi tiết
   - Năm áp dụng
   - Tần suất thưởng (tháng/quý/năm)
   - Trạng thái hoạt động

2. **Quản lý thưởng:**
   - **Thưởng quý:** Danh sách thưởng hàng quý
   - **Thưởng tháng:** Danh sách thưởng hàng tháng
   - **Thưởng năm:** Danh sách thưởng hàng năm
   - **Hình phạt:** Danh sách các khoản phạt

3. **Cấu hình điều kiện:**
   - Quản lý điều kiện cho từng khoản thưởng/phạt
   - Toán tử linh hoạt (≥, >, ≤, <, =, ≠, trong khoảng, chứa)
   - Đơn vị đo lường tùy chỉnh
   - Giá trị tối đa (tùy chọn)

### 3. Quản Lý Điều Kiện Thưởng

#### Component `RewardConditionManager`:
- **Giao diện trực quan** để thêm/sửa/xóa điều kiện
- **Toán tử phong phú:**
  - `>=` Lớn hơn hoặc bằng
  - `>` Lớn hơn
  - `<=` Nhỏ hơn hoặc bằng
  - `<` Nhỏ hơn
  - `==` Bằng
  - `!=` Khác
  - `between` Trong khoảng
  - `contains` Chứa
  - `not_contains` Không chứa

#### Chỉ số phổ biến:
- Số lượng khách hàng
- Tỷ lệ hoàn thành
- Doanh thu
- Lợi nhuận
- Thời gian phản hồi
- Chất lượng dịch vụ
- Số lượng sản phẩm
- Tỷ lệ chuyển đổi
- Điểm đánh giá
- Số giờ làm việc
- Tỷ lệ tăng trưởng
- Số lỗi
- Thời gian chết hệ thống
- Tỷ lệ nợ xấu
- Số hồ sơ xử lý

#### Đơn vị đo lường:
- VND (tiền tệ)
- % (phần trăm)
- khách hàng
- sản phẩm
- giờ, ngày, tháng, năm
- lần, điểm, file, báo cáo

## 🚀 Hướng Dẫn Sử Dụng

### Bước 1: Xem Chương Trình Thưởng
1. Vào `/admin/rewards`
2. Tìm chương trình muốn xem
3. Click vào nút **"⋮"** (More actions)
4. Chọn **"Xem chi tiết"**
5. Khám phá thông tin trong các tabs

### Bước 2: Chỉnh Sửa Chương Trình
1. Từ modal xem chi tiết, click **"Chỉnh sửa"**
2. Hoặc từ danh sách, click **"Sửa"**
3. Cập nhật thông tin cơ bản
4. Thêm/sửa/xóa thưởng trong các tabs
5. Cấu hình điều kiện cho từng khoản thưởng
6. Click **"Lưu thay đổi"**

### Bước 3: Quản Lý Điều Kiện
1. Trong form chỉnh sửa, scroll xuống phần điều kiện
2. Click **"Thêm điều kiện"**
3. Chọn chỉ số từ dropdown
4. Chọn toán tử phù hợp
5. Nhập giá trị và đơn vị
6. Click **"Thêm điều kiện"** để lưu

## 💡 Mẹo Sử Dụng

### Tối Ưu Hóa Hiệu Suất:
- Sử dụng **batch operations** khi thêm nhiều điều kiện
- **Lưu thường xuyên** để tránh mất dữ liệu
- **Kiểm tra validation** trước khi lưu

### Best Practices:
- **Đặt tên rõ ràng** cho các khoản thưởng/phạt
- **Mô tả chi tiết** để dễ hiểu
- **Sử dụng đơn vị** phù hợp với từng chỉ số
- **Kiểm tra logic** của điều kiện trước khi áp dụng

### Troubleshooting:
- **Lỗi validation:** Kiểm tra các trường bắt buộc
- **Lỗi lưu:** Kiểm tra kết nối mạng và quyền truy cập
- **Hiển thị sai:** Refresh trang và thử lại

## 🔧 Cấu Trúc Kỹ Thuật

### Components:
- `RewardProgramDetailModal` - Modal xem chi tiết
- `EditRewardProgramForm` - Form chỉnh sửa
- `RewardConditionManager` - Quản lý điều kiện
- `RewardProgramsTab` - Tab danh sách chương trình

### Data Flow:
1. **Context:** `DataContext` quản lý state
2. **API:** Firebase Firestore cho persistence
3. **Validation:** Client-side validation với TypeScript
4. **UI:** Shadcn/ui components với Tailwind CSS

### State Management:
- `rewardPrograms` - Danh sách chương trình
- `editingProgram` - Chương trình đang chỉnh sửa
- `isEditOpen` - Trạng thái modal chỉnh sửa
- `demoConditions` - Điều kiện demo

## 📊 Ví Dụ Sử Dụng

### Tạo Điều Kiện Thưởng Quý:
```
Chỉ số: Số lượng khách hàng
Toán tử: >=
Giá trị: 50
Đơn vị: khách hàng
```

### Tạo Điều Kiện Khoảng:
```
Chỉ số: Tỷ lệ hoàn thành
Toán tử: between
Giá trị: 80
Giá trị thứ 2: 100
Đơn vị: %
```

### Tạo Điều Kiện Chứa:
```
Chỉ số: Loại sản phẩm
Toán tử: contains
Giá trị: "Premium"
Đơn vị: (không cần)
```

## 🎉 Kết Luận

Hệ thống chương trình thưởng mới cung cấp:
- ✅ **Giao diện trực quan** và dễ sử dụng
- ✅ **Tính năng đầy đủ** cho quản lý thưởng/phạt
- ✅ **Cấu hình linh hoạt** điều kiện thưởng
- ✅ **Tích hợp hoàn hảo** với hệ thống KPI
- ✅ **Performance tối ưu** với batch operations
- ✅ **Type safety** với TypeScript

Hệ thống đã sẵn sàng để sử dụng trong môi trường production! 🚀
