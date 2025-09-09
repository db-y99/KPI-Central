# Hướng dẫn Setup KPI Central từ đầu

## 🎯 Tổng quan

Hệ thống KPI Central đã được làm sạch hoàn toàn, sẵn sàng cho việc setup thủ công. Bạn có thể tùy chỉnh hoàn toàn các KPI, thưởng và phạt theo nhu cầu của công ty.

## 📋 Quy trình Setup

### Tạo Chương trình Thưởng (Reward Programs)

1. **Truy cập:** `/admin/reward-programs`
2. **Nhấn:** "Tạo mới" 
3. **Điền thông tin:**
   - **Tên chương trình:** VD: "IT Staff - 2025 Reward Program"
   - **Mô tả:** Mô tả chi tiết chương trình
   - **Vị trí:** Chọn vị trí nhân viên
   - **Năm:** 2025

4. **Thêm tiêu chí thưởng:**
   - **Hàng quý:** Thưởng cố định hàng quý
   - **Hàng tháng:** Thưởng theo điểm (nếu có)
   - **Hàng năm:** Thưởng lớn cuối năm

5. **Thêm tiêu chí phạt:**
   - **Phạt cố định:** Số tiền phạt khi vi phạm
   - **Cảnh cáo:** Ghi nhận vi phạm không trừ tiền

### Cấu hình Vị trí (Position Configs)

1. **Truy cập:** `/admin/employees` 
2. **Thêm nhân viên** với vị trí tương ứng
3. **Hệ thống tự động** tạo position config

### Nhập Dữ liệu Metric

1. **Truy cập:** `/admin/metrics`
2. **Nhấn:** "Nhập dữ liệu"
3. **Chọn:**
   - **Nhân viên:** Chọn nhân viên cần nhập
   - **Metric:** Chọn chỉ số đo lường
   - **Kỳ:** Tháng/Quý/Năm
   - **Giá trị:** Số liệu thực tế

### Tính toán Thưởng

1. **Truy cập:** `/admin/reward-calculations`
2. **Chọn:**
   - **Nhân viên:** Chọn nhân viên
   - **Kỳ:** Chọn kỳ tính toán
   - **Tần suất:** Tháng/Quý/Năm
3. **Nhấn:** "Tính toán"
4. **Xem kết quả:** Thưởng + Phạt = Thực nhận
5. **Phê duyệt:** Approve/Reject

## 🛠️ Templates có sẵn

### Vị trí phổ biến:
- IT Staff
- Head of Marketing  
- Marketing Assistant
- Customer Service Officer
- Credit Appraiser
- HR/Admin Staff
- Accountant
- Sales Manager
- Operations Manager
- Finance Manager

### Loại thưởng:
- **Cố định:** Số tiền cố định khi đạt điều kiện
- **Biến động:** Thay đổi theo hiệu suất
- **Phần trăm:** Tính theo % của cơ sở
- **Điểm:** Hệ thống điểm, quy đổi thành tiền

### Loại phạt:
- **Cố định:** Số tiền phạt cố định
- **Biến động:** Thay đổi theo mức độ vi phạm
- **Phần trăm:** Tính theo % của cơ sở
- **Cảnh cáo:** Ghi nhận, không trừ tiền

## 📊 Metrics mẫu theo vị trí

### IT Staff:
- `system_uptime_percentage` - Tỷ lệ hoạt động hệ thống
- `system_downtime_incidents` - Số sự cố hệ thống
- `logs_completeness_percentage` - Tỷ lệ nhật ký đầy đủ

### Marketing:
- `qualified_leads_count` - Số leads đủ điều kiện
- `platform_loans_disbursed_count` - Số khoản vay giải ngân
- `marketing_loan_outstanding_total` - Tổng dư nợ marketing

### Customer Service:
- `approved_loan_outstanding_per_10m` - Điểm từ dư nợ (mỗi 10M)
- `loan_renewals_count` - Số lần gia hạn
- `document_errors_count` - Số lỗi chứng từ

### Credit Appraiser:
- `bad_debt_ratio_percentage` - Tỷ lệ nợ xấu
- `overdue_loan_recovery_per_10m_x2` - Thu hồi nợ quá hạn
- `collection_logs_completeness_percentage` - Nhật ký thu hồi

### HR/Admin:
- `personnel_records_completeness` - Hồ sơ nhân sự hoàn thiện
- `payroll_accuracy_percentage` - Độ chính xác bảng lương
- `late_salary_payments_count` - Số lần trả lương muộn

### Finance/Accountant:
- `financial_reports_completeness` - Báo cáo tài chính
- `audit_results_rating` - Đánh giá kiểm toán
- `late_tax_submissions_count` - Số lần nộp thuế muộn

## 🔧 Cấu hình nâng cao

### Điều kiện (Conditions):
- **Lớn hơn (>):** `value > 100`
- **Lớn hơn hoặc bằng (>=):** `value >= 50`
- **Nhỏ hơn (<):** `value < 10`
- **Bằng (=):** `value = 1`
- **Trong khoảng:** `value between 80-100`

### Tần suất:
- **Hàng tháng:** Tính toán mỗi tháng
- **Hàng quý:** Tính toán mỗi quý
- **Hàng năm:** Tính toán cuối năm
- **Theo sự kiện:** Khi có vi phạm xảy ra

### Mức độ nghiêm trọng (Penalties):
- **Nhẹ:** Vi phạm ít ảnh hưởng
- **Trung bình:** Cần chú ý
- **Nghiêm trọng:** Ảnh hưởng lớn

## 🚀 Bắt đầu ngay

1. **Tạo chương trình thưởng đầu tiên**
2. **Thêm nhân viên và vị trí**
3. **Nhập dữ liệu metric**
4. **Tính toán và phê duyệt thưởng**

## 💡 Tips

- **Bắt đầu đơn giản:** Tạo 1-2 vị trí trước
- **Test kỹ:** Kiểm tra tính toán trước khi áp dụng
- **Backup dữ liệu:** Export định kỳ
- **Monitor hiệu quả:** Theo dõi và điều chỉnh KPI

## 🆘 Hỗ trợ

Nếu cần hỗ trợ, hãy tham khảo:
- **Templates:** `/src/lib/templates.ts`
- **Types:** `/src/types/index.ts`
- **Components:** `/src/components/`

**Chúc bạn setup thành công!** 🎉
