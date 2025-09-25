# KPI STATUS CONSISTENCY FIX - HỆ THỐNG KPI CENTRAL

## VẤN ĐỀ PHÁT HIỆN

### 1. Trạng thái KPI không nhất quán
- `approved` và `completed` có ý nghĩa tương tự
- `in-progress` và `pending` gây nhầm lẫn
- Logic chuyển đổi trạng thái thiếu validation

### 2. Hiển thị trạng thái không đồng nhất
- Các components hiển thị khác nhau cho cùng một trạng thái
- Thiếu business rules rõ ràng

## GIẢI PHÁP ĐỀ XUẤT

### 1. Chuẩn hóa trạng thái KPI

```typescript
// Cập nhật KpiRecord type
export type KpiRecord = {
  // ... other fields
  status: 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
}
```

**Workflow trạng thái mới:**
```
not_started → in_progress → submitted → approved
                    ↓           ↓
                 rejected ← rejected
```

### 2. Tạo KPI Status Service

```typescript
// src/lib/kpi-status-service.ts
export class KpiStatusService {
  static readonly VALID_TRANSITIONS = {
    'not_started': ['in_progress'],
    'in_progress': ['submitted', 'rejected'],
    'submitted': ['approved', 'rejected'],
    'approved': [], // Final state
    'rejected': ['in_progress'] // Can retry
  };

  static canTransition(from: string, to: string): boolean {
    return this.VALID_TRANSITIONS[from]?.includes(to) || false;
  }

  static validateTransition(record: KpiRecord, newStatus: string, userRole: string): boolean {
    // Business rules validation
    if (!this.canTransition(record.status, newStatus)) {
      return false;
    }

    // Role-based validation
    if (newStatus === 'submitted' && userRole !== 'employee') {
      return false;
    }

    if (['approved', 'rejected'].includes(newStatus) && userRole !== 'admin') {
      return false;
    }

    return true;
  }
}
```

### 3. Cập nhật Components

```typescript
// Cập nhật kpi-card.tsx
const getStatusConfig = (t: any) => ({
  not_started: { label: 'Chưa bắt đầu', color: 'bg-gray-500', icon: Clock },
  in_progress: { label: 'Đang thực hiện', color: 'bg-blue-500', icon: Play },
  submitted: { label: 'Đã nộp', color: 'bg-yellow-500', icon: AlertCircle },
  approved: { label: 'Đã duyệt', color: 'bg-green-500', icon: CheckCircle },
  rejected: { label: 'Từ chối', color: 'bg-red-500', icon: XCircle }
});

const handleUpdate = () => {
  const newActual = parseFloat(inputValue);
  if (!isNaN(newActual)) {
    const updates: Partial<KpiRecord> = { actual: newActual };
    
    // Sử dụng service để validate transition
    if (newActual > 0 && KpiStatusService.canTransition(record.status, 'in_progress')) {
      updates.status = 'in_progress';
    }
    
    updateKpiRecord(record.id, updates);
  }
};
```

### 4. Cập nhật DataContext

```typescript
// Cập nhật src/context/data-context.tsx
const updateKpiRecord = async (recordId: string, updates: Partial<KpiRecord>) => {
  // Validate status transition
  if (updates.status) {
    const currentRecord = kpiRecords.find(r => r.id === recordId);
    if (currentRecord && !KpiStatusService.validateTransition(currentRecord, updates.status, user?.role || '')) {
      throw new Error('Invalid status transition');
    }
  }

  // ... existing update logic
};
```

### 5. Cập nhật Translations

```typescript
// Cập nhật src/lib/translations/vi.ts
kpiStatus: {
  notStarted: 'Chưa bắt đầu',
  inProgress: 'Đang thực hiện', 
  submitted: 'Đã nộp',
  approved: 'Đã duyệt',
  rejected: 'Từ chối'
}
```

## IMPLEMENTATION PLAN

### Phase 1: Core Service (Ưu tiên cao)
1. Tạo `KpiStatusService` với validation logic
2. Cập nhật `KpiRecord` type definition
3. Thêm status transition validation vào `DataContext`

### Phase 2: UI Components (Ưu tiên trung bình)
1. Cập nhật `kpi-card.tsx` với status config mới
2. Cập nhật `kpi-list-row.tsx` với logic mới
3. Cập nhật `kpi-tracking-component.tsx` với hiển thị nhất quán

### Phase 3: Data Migration (Ưu tiên thấp)
1. Tạo migration script để cập nhật existing records
2. Map old statuses to new statuses:
   - `pending` → `not_started`
   - `awaiting_approval` → `submitted`
   - `completed` → `approved`
   - `in-progress` → `in_progress`

## TESTING CHECKLIST

- [ ] Status transitions work correctly
- [ ] Role-based permissions enforced
- [ ] UI displays consistent status labels
- [ ] Business rules validation works
- [ ] Migration script handles existing data
- [ ] Error handling for invalid transitions

## IMPACT ASSESSMENT

### Low Risk Changes:
- Adding new service class
- Updating translations
- UI label changes

### Medium Risk Changes:
- Type definition updates
- Component logic changes

### High Risk Changes:
- Database migration
- Existing data updates

## ROLLBACK PLAN

1. Keep old status values in database
2. Maintain backward compatibility in API
3. Feature flag for new status system
4. Gradual rollout with monitoring
