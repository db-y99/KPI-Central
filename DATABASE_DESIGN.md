# 🗄️ Database Design for Multi-Employee & Multi-Department System

## 📋 Overview
Thiết kế cơ sở dữ liệu mới để hỗ trợ hệ thống KPI cho nhiều nhân viên và nhiều phòng ban với khả năng mở rộng cao.

## 🏗️ Core Collections

### 1. **Organizations** (Công ty/Tổ chức)
```typescript
interface Organization {
  id: string;
  name: string;
  code: string; // Mã công ty duy nhất
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  settings: {
    timezone: string;
    currency: string;
    language: string;
    fiscalYearStart: string; // MM-DD format
    workingDays: number[]; // [1,2,3,4,5] = Mon-Fri
  };
  subscription: {
    plan: 'basic' | 'premium' | 'enterprise';
    maxEmployees: number;
    maxDepartments: number;
    features: string[];
    expiresAt: string;
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
```

### 2. **Departments** (Phòng ban)
```typescript
interface Department {
  id: string;
  organizationId: string; // Reference to Organization
  parentDepartmentId?: string; // For hierarchical departments
  name: string;
  code: string; // Mã phòng ban duy nhất trong công ty
  description?: string;
  managerId?: string; // Reference to Employee
  level: number; // 1 = Top level, 2 = Sub-department, etc.
  path: string; // "IT/Development/Frontend" for hierarchy
  budget?: number;
  location?: string;
  phone?: string;
  email?: string;
  settings: {
    workingHours: {
      start: string; // "09:00"
      end: string; // "18:00"
    };
    kpiWeight: number; // Default weight for department KPIs
    evaluationPeriod: 'monthly' | 'quarterly' | 'yearly';
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
```

### 3. **Employees** (Nhân viên)
```typescript
interface Employee {
  id: string;
  organizationId: string; // Reference to Organization
  departmentId: string; // Reference to Department
  employeeCode: string; // Mã nhân viên duy nhất trong công ty
  personalInfo: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    address?: string;
  };
  workInfo: {
    position: string;
    level: string; // "Junior", "Senior", "Manager", etc.
    employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
    startDate: string;
    endDate?: string;
    salary?: number;
    managerId?: string; // Reference to Employee
    directReports: string[]; // Array of employee IDs
  };
  systemInfo: {
    role: 'admin' | 'manager' | 'employee';
    permissions: string[];
    lastLoginAt?: string;
    isActive: boolean;
  };
  kpiSettings: {
    evaluationPeriod: 'monthly' | 'quarterly' | 'yearly';
    weight: number; // Individual KPI weight
    autoCalculation: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
```

### 4. **KPIs** (Chỉ số KPI)
```typescript
interface Kpi {
  id: string;
  organizationId: string; // Reference to Organization
  departmentId?: string; // Optional: department-specific KPI
  categoryId: string; // Reference to KpiCategory
  name: string;
  code: string; // Mã KPI duy nhất
  description?: string;
  type: 'quantitative' | 'qualitative' | 'financial' | 'operational';
  unit: string; // "VND", "hours", "percentage", "count", etc.
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  calculationMethod: {
    formula?: string; // Mathematical formula
    dataSource: string[]; // Sources of data
    aggregation: 'sum' | 'average' | 'max' | 'min' | 'count';
  };
  targets: {
    minimum: number;
    target: number;
    excellent: number;
    weight: number; // Weight in overall evaluation
  };
  settings: {
    isActive: boolean;
    isPublic: boolean; // Visible to all employees
    requiresApproval: boolean;
    autoCalculation: boolean;
    notificationThreshold: number; // Alert when below this value
  };
  createdAt: string;
  updatedAt: string;
}
```

### 5. **KpiCategories** (Danh mục KPI)
```typescript
interface KpiCategory {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  color: string; // Hex color for UI
  icon?: string;
  weight: number; // Default weight for category
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 6. **KpiRecords** (Bản ghi KPI)
```typescript
interface KpiRecord {
  id: string;
  organizationId: string;
  employeeId: string; // Reference to Employee
  departmentId: string; // Reference to Department
  kpiId: string; // Reference to Kpi
  period: string; // "2024-01", "2024-Q1", "2024"
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  
  // Values
  targetValue: number;
  actualValue: number;
  achievementRate: number; // Calculated: (actualValue / targetValue) * 100
  score: number; // Calculated based on achievement rate
  
  // Status and workflow
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string; // Reference to Employee
  approvedAt?: string;
  approvedBy?: string; // Reference to Employee
  
  // Additional data
  notes?: string;
  attachments?: string[]; // File URLs
  comments: {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
  }[];
  
  createdAt: string;
  updatedAt: string;
}
```

### 7. **RewardPrograms** (Chương trình thưởng)
```typescript
interface RewardProgram {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: 'performance' | 'achievement' | 'milestone' | 'bonus';
  period: 'monthly' | 'quarterly' | 'yearly';
  
  // Eligibility criteria
  eligibility: {
    departments?: string[]; // Department IDs
    positions?: string[];
    employmentTypes?: string[];
    minTenure?: number; // Months
    minPerformance?: number; // Minimum KPI score
  };
  
  // Reward structure
  structure: {
    baseAmount: number;
    multipliers: {
      excellent: number; // >= 100%
      good: number; // 80-99%
      average: number; // 60-79%
      poor: number; // < 60%
    };
    maxReward?: number;
    minReward?: number;
  };
  
  // Settings
  settings: {
    isActive: boolean;
    autoCalculate: boolean;
    requiresApproval: boolean;
    notificationEnabled: boolean;
  };
  
  createdAt: string;
  updatedAt: string;
}
```

### 8. **RewardCalculations** (Tính toán thưởng)
```typescript
interface RewardCalculation {
  id: string;
  organizationId: string;
  employeeId: string; // Reference to Employee
  departmentId: string; // Reference to Department
  programId: string; // Reference to RewardProgram
  period: string; // "2024-01", "2024-Q1", "2024"
  
  // Performance data
  performance: {
    kpiScore: number;
    achievementRate: number;
    grade: 'A' | 'B' | 'C' | 'D';
    rank: number; // Rank within department
    totalRank: number; // Rank within organization
  };
  
  // Calculation details
  calculation: {
    baseAmount: number;
    multiplier: number;
    performanceReward: number;
    penalties: number;
    adjustments: number; // Manual adjustments
    totalReward: number;
    netAmount: number; // After taxes/deductions
  };
  
  // Status and workflow
  status: 'calculated' | 'pending_approval' | 'approved' | 'paid' | 'rejected';
  calculatedAt: string;
  approvedAt?: string;
  approvedBy?: string; // Reference to Employee
  paidAt?: string;
  paidBy?: string; // Reference to Employee
  
  // Additional data
  notes?: string;
  breakdown: {
    category: string;
    amount: number;
    description: string;
  }[];
  
  createdAt: string;
  updatedAt: string;
}
```

## 🔗 Relationships & Indexes

### Composite Indexes for Performance
```json
{
  "indexes": [
    {
      "collectionGroup": "employees",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "departmentId", "order": "ASCENDING" },
        { "fieldPath": "systemInfo.isActive", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "kpiRecords",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "employeeId", "order": "ASCENDING" },
        { "fieldPath": "period", "order": "DESCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "rewardCalculations",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "departmentId", "order": "ASCENDING" },
        { "fieldPath": "period", "order": "DESCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## 🚀 Migration Strategy

### Phase 1: Data Migration
1. **Create Organizations**: Set up organization records
2. **Migrate Departments**: Add organizationId to existing departments
3. **Migrate Employees**: Add organizationId and update structure
4. **Migrate KPIs**: Add organizationId and categoryId

### Phase 2: Structure Updates
1. **Update KpiRecords**: Add organizationId and improve structure
2. **Update RewardCalculations**: Add organizationId and new fields
3. **Create KpiCategories**: Organize KPIs by categories

### Phase 3: Feature Enhancement
1. **Multi-tenant Support**: Implement organization-based access control
2. **Hierarchical Departments**: Support nested department structure
3. **Advanced Reporting**: Cross-department and organization-wide reports

## 🔒 Security Rules

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

## 📊 Benefits of New Design

### ✅ **Scalability**
- Support unlimited organizations
- Hierarchical department structure
- Efficient querying with composite indexes

### ✅ **Multi-tenancy**
- Complete data isolation between organizations
- Organization-specific settings and configurations
- Flexible permission system

### ✅ **Performance**
- Optimized indexes for common queries
- Reduced data redundancy
- Efficient pagination and filtering

### ✅ **Flexibility**
- Configurable KPI categories and types
- Flexible reward program structures
- Customizable evaluation periods

### ✅ **Maintainability**
- Clear data relationships
- Consistent naming conventions
- Comprehensive documentation

## 🔄 Next Steps

1. **Review and Approve**: Review the design with stakeholders
2. **Create Migration Scripts**: Develop data migration tools
3. **Update Application Code**: Modify services to use new structure
4. **Test Thoroughly**: Comprehensive testing with sample data
5. **Deploy Gradually**: Phased rollout to minimize risk
