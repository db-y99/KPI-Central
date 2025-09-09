# Hệ thống Phạt (Penalties) - Cập nhật KPI Central

## Tổng quan

Đã triển khai đầy đủ **hệ thống phạt (penalties)** và **2 vị trí mới** dựa trên chương trình KPI chi tiết của công ty. Hệ thống hiện tại đã hoàn thiện với cả rewards và penalties cho tất cả các vị trí.

## Tính năng mới được thêm

### 1. Hệ thống Phạt (Penalties)

#### Cấu trúc dữ liệu mới:
- **`PenaltyCriteria`** - Tiêu chí phạt với các loại:
  - `fixed` - Phạt cố định
  - `variable` - Phạt biến động
  - `percentage` - Phạt theo phần trăm
  - `warning` - Cảnh cáo (không phạt tiền)

- **`PenaltyCondition`** - Điều kiện để bị phạt
- **`PenaltyBreakdown`** - Chi tiết tính toán phạt
- **`severity`** - Mức độ nghiêm trọng: `low`, `medium`, `high`

#### Logic tính toán mới:
- **Tổng thưởng (totalReward)**
- **Tổng phạt (totalPenalty)** 
- **Thực nhận (netAmount)** = totalReward - totalPenalty (≥ 0)

### 2. Penalties cho từng vị trí

#### **IT Staff**
- 🚨 **300.000 VND** cho thời gian chết hệ thống
- 🚨 **500.000 VND** cho nhật ký không đầy đủ

#### **Head of Marketing** 
- ⚠️ **Không thưởng** nếu < 20 leads
- 🚨 **500.000 VND** cho leads giả mạo

#### **Marketing Assistant**
- ⚠️ **Không thưởng** nếu < 20 leads  
- ⚠️ **Cảnh cáo** cho leads giả mạo

#### **Customer Service Officer (CSO)**
- 🚨 **500.000 VND/lỗi** chứng từ
- ⚠️ **Cảnh cáo** bỏ lỡ follow-up khách hàng

#### **Credit Appraiser (CA)**
- 🚨 **500.000 VND** nếu tỷ lệ nợ xấu > 10%
- 🔶 **200.000 VND** cho nhật ký thu hồi nợ không đầy đủ

#### **HR/Admin Staff** (MỚI)
- 🚨 **300.000 VND** chậm trả lương
- 🔶 **200.000 VND** nộp hồ sơ muộn

#### **Accountant** (MỚI)  
- 🚨 **300.000 VND** nộp thuế muộn
- 🔶 **200.000 VND** chênh lệch tiền mặt/ngân hàng

### 3. Hai vị trí mới

#### **HR/Admin Staff - Nhân Viên Hành Chính**
**Thưởng hàng quý:**
- 300.000 VND - Hồ sơ nhân sự hoàn thiện
- 300.000 VND - Bảng lương chính xác 
- 200.000 VND - Tuân thủ đầy đủ
- 200.000 VND - Sáng kiến HR

**Thưởng hàng năm:**
- 1-2 triệu VND - Không vi phạm tuân thủ
- 2-5 triệu VND - Cải tiến hệ thống HR  
- Lương tháng 13

#### **Accountant - Kế Toán**
**Thưởng hàng quý:**
- 300.000 VND - Báo cáo tài chính đầy đủ
- 300.000 VND - Đối chiếu chính xác
- 200.000 VND - Tiết kiệm chi phí
- 300.000 VND - Khai thuế đúng hạn

**Thưởng hàng năm:**
- 2-5 triệu VND - Kết quả kiểm toán tốt
- 1-2 triệu VND - Tiết kiệm dự báo
- Lương tháng 13

## Cập nhật UI/UX

### 1. Reward Calculation Display
- **5 cards thống kê**: Tổng thưởng, Tổng phạt, Thực nhận, Tiêu chí đạt, Vi phạm
- **Penalty section**: Hiển thị chi tiết vi phạm với severity badges
- **Detail dialog**: Breakdown đầy đủ cả rewards và penalties

### 2. Reward Calculations Table  
- **Thêm cột**: Phạt, Thực nhận
- **Color coding**: 
  - 🟢 Tổng thưởng (xanh lá)
  - 🔴 Phạt (đỏ) 
  - 🔵 Thực nhận (xanh dương)

### 3. Severity Indicators
- 🚨 **High** (Nghiêm trọng) - Đỏ
- 🔶 **Medium** (Trung bình) - Vàng  
- ⚠️ **Low/Warning** (Nhẹ/Cảnh cáo) - Xám

## Technical Implementation

### Database Schema Updates
```
/rewardPrograms
  + penalties: PenaltyCriteria[]

/rewardCalculations  
  + totalPenalty: number
  + netAmount: number
  + penalties: PenaltyBreakdown[]
```

### New Position Configs
```
- HR/Admin Staff (hr-admin-config)
- Accountant (accountant-config)
```

### Enhanced Calculation Engine
- Kiểm tra điều kiện penalty song song với rewards
- Tính toán net amount = rewards - penalties
- Đảm bảo net amount ≥ 0 
- Hỗ trợ warning penalties (không trừ tiền)

## Metrics cần nhập cho vị trí mới

### HR/Admin Staff
- `personnel_records_completeness` - Hồ sơ nhân sự hoàn thiện
- `payroll_accuracy_percentage` - Độ chính xác bảng lương
- `compliance_requirements_met` - Tuân thủ quy định
- `late_salary_payments_count` - Số lần trả lương muộn
- `late_document_submissions_count` - Số lần nộp hồ sơ muộn

### Accountant  
- `financial_reports_completeness` - Báo cáo tài chính hoàn thiện
- `account_reconciliation_accuracy` - Độ chính xác đối chiếu
- `cost_savings_amount` - Số tiền tiết kiệm được
- `late_tax_submissions_count` - Số lần nộp thuế muộn
- `cash_bank_discrepancies_count` - Số lần chênh lệch tiền mặt/ngân hàng

## Workflow mới

1. **Nhập metrics** → Include penalty-related metrics
2. **Tính toán** → Engine xử lý cả rewards và penalties
3. **Review** → Xem chi tiết breakdown với severity levels
4. **Approve** → Phê duyệt dựa trên net amount
5. **Track** → Theo dõi penalties để cải thiện performance

## Testing Scenarios

### Test Cases cho Penalties:
✅ IT Staff với system downtime → Penalty applied  
✅ Marketing với fake leads → Penalty applied
✅ HR với late salary → Penalty applied  
✅ Accountant với late tax → Penalty applied
✅ Warning penalties → No money deduction
✅ Net amount calculation → Always ≥ 0

### Test Cases cho New Positions:
✅ HR/Admin quarterly rewards calculation
✅ Accountant annual performance bonus
✅ Position config metrics validation
✅ UI display for new positions

## Performance Impact

- ✅ **No breaking changes** - Existing data remains compatible
- ✅ **Backward compatibility** - Old calculations still work  
- ✅ **Graceful degradation** - Handles missing penalty data
- ✅ **Optimized queries** - Efficient penalty calculation

## Migration Guide

### For Existing Data:
```typescript
// Old calculations will show:
totalPenalty: 0
netAmount: totalReward
penalties: []
```

### For New Setup:
1. Initialize reward programs với penalties
2. Setup position configs cho HR/Admin & Accountant
3. Train users về penalty metrics input
4. Monitor penalty trends và adjust thresholds

## Summary

🎉 **Hệ thống KPI Central hiện đã hoàn thiện** với:

- ✅ **7 vị trí** với reward programs đầy đủ
- ✅ **Penalty system** với 4 loại phạt 
- ✅ **Smart calculation** engine với net amount
- ✅ **Rich UI** để manage và track penalties
- ✅ **Scalable architecture** cho future positions
- ✅ **Complete workflow** từ input → calculation → approval

Hệ thống giờ đây phản ánh chính xác chương trình KPI thực tế của công ty và sẵn sàng cho production deployment!
