# Trọng Số KPI - Hướng Dẫn Chi Tiết

## 🎯 **Trọng số KPI là gì?**

**Trọng số (Weight)** là một giá trị số thể hiện **mức độ quan trọng tương đối** của từng KPI trong tổng thể đánh giá hiệu suất của một vị trí công việc.

## 📊 **Ví dụ thực tế:**

### **Nhân viên Marketing - Trưởng phòng**

| KPI | Trọng số | Lý do |
|-----|----------|-------|
| Số khách hàng tiềm năng | 40% | Mục tiêu chính - tăng trưởng |
| Tỷ lệ chuyển đổi | 30% | Hiệu quả hoạt động |
| Chi phí marketing | 20% | Kiểm soát ngân sách |
| Điểm hài lòng khách hàng | 10% | Chất lượng dịch vụ |

**Tổng = 100%**

### **Nhân viên IT**

| KPI | Trọng số | Lý do |
|-----|----------|-------|
| Thời gian hoạt động hệ thống | 50% | Quan trọng nhất - ổn định |
| Số công việc sửa chữa | 25% | Hiệu suất bảo trì |
| Tỷ lệ sao lưu thành công | 15% | Bảo mật dữ liệu |
| Thời gian phản hồi | 10% | Dịch vụ khách hàng |

## 🔢 **Cách tính điểm KPI có trọng số:**

### **Công thức:**
```
Điểm KPI tổng = Σ(KPIi × Trọng sối)
```

### **Ví dụ tính toán:**

**Nhân viên Marketing:**
- KPI1: Số khách hàng = 80 điểm (trọng số 40%)
- KPI2: Tỷ lệ chuyển đổi = 90 điểm (trọng số 30%)
- KPI3: Chi phí marketing = 70 điểm (trọng số 20%)
- KPI4: Điểm hài lòng = 85 điểm (trọng số 10%)

**Tính toán:**
```
Điểm tổng = (80 × 0.4) + (90 × 0.3) + (70 × 0.2) + (85 × 0.1)
         = 32 + 27 + 14 + 8.5
         = 81.5 điểm
```

## 🎯 **Tại sao cần trọng số?**

### 1. **Phản ánh ưu tiên chiến lược**
- KPI nào quan trọng hơn sẽ có trọng số cao hơn
- Giúp nhân viên tập trung vào những gì quan trọng nhất

### 2. **Tính điểm công bằng**
- Không phải tất cả KPI đều có tầm quan trọng như nhau
- Trọng số giúp đánh giá tổng thể chính xác hơn

### 3. **Điều chỉnh linh hoạt**
- Có thể thay đổi trọng số theo từng giai đoạn
- Phù hợp với mục tiêu kinh doanh hiện tại

## 📈 **Ví dụ trọng số cho các vị trí:**

### **Trưởng phòng Marketing:**
```
- Số khách hàng tiềm năng: 35%
- Tỷ lệ chuyển đổi: 25%
- Doanh thu từ marketing: 20%
- Chi phí marketing: 15%
- Điểm hài lòng khách hàng: 5%
```

### **Nhân viên Customer Service:**
```
- Điểm phục vụ khách hàng: 40%
- Số lỗi chứng từ: 30%
- Thời gian phản hồi: 20%
- Tỷ lệ giải quyết vấn đề: 10%
```

### **Nhân viên Credit Appraisal:**
```
- Tỷ lệ nợ xấu: 50%
- Điểm thẩm định: 30%
- Số hồ sơ xử lý: 15%
- Thời gian xử lý: 5%
```

## 🔧 **Cách thiết lập trọng số:**

### **Bước 1: Xác định mục tiêu chính**
- Mục tiêu nào quan trọng nhất cho vị trí này?
- KPI nào ảnh hưởng trực tiếp đến kết quả kinh doanh?

### **Bước 2: Phân loại KPI**
- **KPI chính (40-60%):** Mục tiêu cốt lõi
- **KPI phụ (20-30%):** Hỗ trợ mục tiêu chính
- **KPI bổ sung (10-20%):** Cải thiện chất lượng

### **Bước 3: Kiểm tra tổng trọng số**
- Tổng trọng số phải = 100%
- Không có KPI nào có trọng số = 0%

## 💡 **Mẹo thiết lập trọng số:**

### **1. Cân bằng giữa số lượng và chất lượng:**
- 60% cho KPI định lượng (số liệu)
- 40% cho KPI định tính (chất lượng)

### **2. Phù hợp với cấp độ:**
- **Cấp quản lý:** Trọng số cao cho KPI chiến lược
- **Cấp nhân viên:** Trọng số cao cho KPI thực thi

### **3. Điều chỉnh theo thời gian:**
- **Quý 1:** Tập trung vào tăng trưởng
- **Quý 2:** Cân bằng tăng trưởng và chất lượng
- **Quý 3:** Tối ưu hóa hiệu quả
- **Quý 4:** Chuẩn bị cho năm sau

## 📊 **Ví dụ trong hệ thống KPI-Central:**

### **Cấu hình trọng số cho IT Staff:**
```typescript
const itKpis = [
  {
    name: 'Thời gian hoạt động hệ thống',
    weight: 0.5,  // 50% - Quan trọng nhất
    target: 99
  },
  {
    name: 'Số công việc sửa chữa',
    weight: 0.25, // 25%
    target: 5
  },
  {
    name: 'Tỷ lệ sao lưu thành công',
    weight: 0.15, // 15%
    target: 95
  },
  {
    name: 'Thời gian phản hồi',
    weight: 0.1   // 10%
    target: 2
  }
];
```

### **Tính điểm thực tế:**
```
Nếu nhân viên IT đạt:
- Thời gian hoạt động: 98% (trọng số 50%)
- Số công việc sửa chữa: 6 (trọng số 25%)
- Tỷ lệ sao lưu: 97% (trọng số 15%)
- Thời gian phản hồi: 1.5 giờ (trọng số 10%)

Điểm tổng = (98 × 0.5) + (6 × 0.25) + (97 × 0.15) + (1.5 × 0.1)
         = 49 + 1.5 + 14.55 + 0.15
         = 65.2 điểm
```

## 🎉 **Kết luận:**

Trọng số KPI giúp:
- ✅ **Đánh giá chính xác** hiệu suất tổng thể
- ✅ **Tập trung ưu tiên** vào mục tiêu quan trọng
- ✅ **Công bằng** trong đánh giá
- ✅ **Linh hoạt** điều chỉnh theo nhu cầu
- ✅ **Động viên** nhân viên cải thiện KPI quan trọng

**Trọng số là chìa khóa để xây dựng hệ thống KPI hiệu quả!** 🚀
