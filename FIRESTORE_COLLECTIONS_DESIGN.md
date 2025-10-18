# 🗄️ Firestore Collections Design - Simplified & Scalable

## 📋 Overview
Thiết kế lại các collections Firestore để phục vụ nhiều nhân viên, phòng ban và dễ kiểm tra dữ liệu.

## 🏗️ Core Collections Structure

### 1. **organizations** (Công ty/Tổ chức)
```typescript
interface Organization {
  id: string; // Auto-generated
  name: string; // "Công ty ABC"
  code: string; // "ABC" - mã công ty
  description?: string;
  settings: {
    currency: string; // "VND"
    timezone: string; // "Asia/Ho_Chi_Minh"
    language: string; // "vi"
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
```

### 2. **departments** (Phòng ban)
```typescript
interface Department {
  id: string; // Auto-generated
  organizationId: string; // Reference to organizations
  name: string; // "Phòng IT"
  code: string; // "IT" - mã phòng ban
  description?: string;
  managerId?: string; // Reference to employees
  parentId?: string; // Reference to departments (for hierarchy)
  level: number; // 1 = Top level, 2 = Sub-department
  budget?: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
```

### 3. **employees** (Nhân viên)
```typescript
interface Employee {
  id: string; // Auto-generated
  organizationId: string; // Reference to organizations
  departmentId: string; // Reference to departments
  employeeCode: string; // "EMP001" - mã nhân viên
  personalInfo: {
    fullName: string; // "Nguyễn Văn A"
    email: string;
    phone?: string;
    avatar?: string;
    position: string; // "Developer"
    level: string; // "Senior", "Junior"
  };
  workInfo: {
    startDate: string;
    endDate?: string;
    salary?: number;
    managerId?: string; // Reference to employees
    employmentType: 'full-time' | 'part-time' | 'contract';
  };
  systemInfo: {
    role: 'admin' | 'manager' | 'employee';
    isActive: boolean;
    lastLoginAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### 4. **kpiCategories** (Danh mục KPI)
```typescript
interface KpiCategory {
  id: string; // Auto-generated
  organizationId: string; // Reference to organizations
  name: string; // "Hiệu suất", "Chất lượng"
  description?: string;
  color: string; // "#3B82F6"
  icon?: string;
  weight: number; // 0.4 = 40%
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
```

### 5. **kpis** (Chỉ số KPI)
```typescript
interface Kpi {
  id: string; // Auto-generated
  organizationId: string; // Reference to organizations
  departmentId?: string; // Optional: department-specific KPI
  categoryId: string; // Reference to kpiCategories
  name: string; // "Số lượng sản phẩm"
  code: string; // "PRODUCT_COUNT"
  description?: string;
  type: 'number' | 'percentage' | 'currency' | 'text';
  unit: string; // "sản phẩm", "%", "VND"
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  
  // Targets
  targets: {
    minimum: number; // 0
    target: number; // 100
    excellent: number; // 120
  };
  
  // Settings
  settings: {
    isActive: boolean;
    requiresApproval: boolean;
    autoCalculation: boolean;
  };
  
  createdAt: string;
  updatedAt: string;
}
```

### 6. **kpiRecords** (Bản ghi KPI)
```typescript
interface KpiRecord {
  id: string; // Auto-generated
  organizationId: string; // Reference to organizations
  employeeId: string; // Reference to employees
  departmentId: string; // Reference to departments
  kpiId: string; // Reference to kpis
  period: string; // "2024-01", "2024-Q1"
  
  // Values
  targetValue: number;
  actualValue: number;
  achievementRate: number; // Calculated: (actualValue / targetValue) * 100
  score: number; // Calculated based on achievement rate
  
  // Status
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string; // Reference to employees
  
  // Additional
  notes?: string;
  attachments?: string[]; // File URLs
  
  createdAt: string;
  updatedAt: string;
}
```

### 7. **rewardPrograms** (Chương trình thưởng)
```typescript
interface RewardProgram {
  id: string; // Auto-generated
  organizationId: string; // Reference to organizations
  name: string; // "Thưởng quý 1"
  description?: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  
  // Eligibility
  eligibility: {
    departments?: string[]; // Department IDs
    minPerformance?: number; // Minimum KPI score
  };
  
  // Reward structure
  structure: {
    baseAmount: number; // 1,000,000 VND
    multipliers: {
      excellent: number; // 1.5x
      good: number; // 1.2x
      average: number; // 1.0x
      poor: number; // 0.5x
    };
  };
  
  settings: {
    isActive: boolean;
    autoCalculate: boolean;
  };
  
  createdAt: string;
  updatedAt: string;
}
```

### 8. **rewardCalculations** (Tính toán thưởng)
```typescript
interface RewardCalculation {
  id: string; // Auto-generated
  organizationId: string; // Reference to organizations
  employeeId: string; // Reference to employees
  departmentId: string; // Reference to departments
  programId: string; // Reference to rewardPrograms
  period: string; // "2024-01"
  
  // Performance
  performance: {
    kpiScore: number; // Average KPI score
    achievementRate: number; // Overall achievement rate
    grade: 'excellent' | 'good' | 'average' | 'poor';
  };
  
  // Calculation
  calculation: {
    baseAmount: number;
    multiplier: number;
    totalReward: number;
    penalties: number;
    netAmount: number; // Final amount
  };
  
  // Status
  status: 'calculated' | 'approved' | 'paid' | 'rejected';
  calculatedAt: string;
  approvedAt?: string;
  approvedBy?: string; // Reference to employees
  paidAt?: string;
  
  createdAt: string;
  updatedAt: string;
}
```

## 🔍 **Firestore Indexes** (firestore.indexes.json)

```json
{
  "indexes": [
    {
      "collectionGroup": "departments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "employees",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "departmentId", "order": "ASCENDING" },
        { "fieldPath": "systemInfo.isActive", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "kpis",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "categoryId", "order": "ASCENDING" },
        { "fieldPath": "settings.isActive", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "kpiRecords",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "employeeId", "order": "ASCENDING" },
        { "fieldPath": "period", "order": "DESCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "kpiRecords",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "departmentId", "order": "ASCENDING" },
        { "fieldPath": "period", "order": "DESCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "rewardCalculations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "employeeId", "order": "ASCENDING" },
        { "fieldPath": "period", "order": "DESCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## 🔒 **Security Rules** (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin(organizationId) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/employees/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.organizationId == organizationId &&
        get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.systemInfo.role == 'admin';
    }
    
    function belongsToOrganization(organizationId) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/employees/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.organizationId == organizationId;
    }
    
    // Organization rules
    match /organizations/{organizationId} {
      allow read, write: if isAdmin(organizationId);
    }
    
    // Department rules
    match /departments/{departmentId} {
      allow read: if belongsToOrganization(resource.data.organizationId);
      allow write: if isAdmin(resource.data.organizationId);
    }
    
    // Employee rules
    match /employees/{employeeId} {
      allow read: if belongsToOrganization(resource.data.organizationId);
      allow write: if isAdmin(resource.data.organizationId);
    }
    
    // KPI rules
    match /kpis/{kpiId} {
      allow read: if belongsToOrganization(resource.data.organizationId);
      allow write: if isAdmin(resource.data.organizationId);
    }
    
    // KPI Records rules
    match /kpiRecords/{recordId} {
      allow read, write: if belongsToOrganization(resource.data.organizationId) &&
        (resource.data.employeeId == request.auth.uid || isAdmin(resource.data.organizationId));
    }
    
    // Reward Calculations rules
    match /rewardCalculations/{calculationId} {
      allow read: if belongsToOrganization(resource.data.organizationId) &&
        (resource.data.employeeId == request.auth.uid || isAdmin(resource.data.organizationId));
      allow write: if isAdmin(resource.data.organizationId);
    }
  }
}
```

## 📊 **Sample Data Structure**

### **Organizations Collection**
```
organizations/
├── org-001/
│   ├── name: "Công ty ABC"
│   ├── code: "ABC"
│   └── settings: { currency: "VND", timezone: "Asia/Ho_Chi_Minh" }
└── org-002/
    ├── name: "Công ty XYZ"
    ├── code: "XYZ"
    └── settings: { currency: "VND", timezone: "Asia/Ho_Chi_Minh" }
```

### **Departments Collection**
```
departments/
├── dept-001/
│   ├── organizationId: "org-001"
│   ├── name: "Phòng IT"
│   ├── code: "IT"
│   └── managerId: "emp-001"
└── dept-002/
    ├── organizationId: "org-001"
    ├── name: "Phòng Marketing"
    ├── code: "MKT"
    └── managerId: "emp-002"
```

### **Employees Collection**
```
employees/
├── emp-001/
│   ├── organizationId: "org-001"
│   ├── departmentId: "dept-001"
│   ├── employeeCode: "EMP001"
│   ├── personalInfo: { fullName: "Nguyễn Văn A", email: "a@abc.com" }
│   └── systemInfo: { role: "admin", isActive: true }
└── emp-002/
    ├── organizationId: "org-001"
    ├── departmentId: "dept-002"
    ├── employeeCode: "EMP002"
    ├── personalInfo: { fullName: "Trần Thị B", email: "b@abc.com" }
    └── systemInfo: { role: "employee", isActive: true }
```

## 🔍 **Easy Database Inspection Queries**

### **1. Get all employees in a department**
```javascript
// Firestore query
const employees = await getDocs(query(
  collection(db, 'employees'),
  where('organizationId', '==', 'org-001'),
  where('departmentId', '==', 'dept-001'),
  where('systemInfo.isActive', '==', true)
));
```

### **2. Get all KPIs for an organization**
```javascript
const kpis = await getDocs(query(
  collection(db, 'kpis'),
  where('organizationId', '==', 'org-001'),
  where('settings.isActive', '==', true)
));
```

### **3. Get KPI records for a period**
```javascript
const records = await getDocs(query(
  collection(db, 'kpiRecords'),
  where('organizationId', '==', 'org-001'),
  where('period', '==', '2024-01'),
  where('status', '==', 'approved')
));
```

### **4. Get reward calculations for an employee**
```javascript
const rewards = await getDocs(query(
  collection(db, 'rewardCalculations'),
  where('organizationId', '==', 'org-001'),
  where('employeeId', '==', 'emp-001'),
  orderBy('period', 'desc')
));
```

## ✅ **Benefits of This Design**

### **🎯 Easy to Inspect**
- Clear collection structure
- Consistent field naming
- Easy to query and filter

### **📈 Scalable**
- Supports multiple organizations
- Hierarchical departments
- Efficient indexing

### **🔒 Secure**
- Organization-based access control
- Role-based permissions
- Data isolation

### **🚀 Performance**
- Optimized indexes
- Efficient queries
- Minimal data redundancy

## 🔄 **Migration from Current Structure**

1. **Add organizationId** to all existing documents
2. **Restructure employee data** with personalInfo and systemInfo
3. **Add categoryId** to KPIs
4. **Enhance KPI records** with better status tracking
5. **Create reward programs** and calculations

Thiết kế này sẽ giúp bạn dễ dàng kiểm tra và quản lý dữ liệu cho nhiều nhân viên và phòng ban!
