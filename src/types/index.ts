// Import KpiStatus từ service
import { KpiStatus } from '@/lib/kpi-status-service';

export type Department = {
  id: string;
  name: string;
  description?: string;
  managerId?: string; // ID của người quản lý phòng ban
  manager?: string; // Added for compatibility
  location?: string; // Added for compatibility
  phone?: string; // Added for compatibility
  email?: string; // Added for compatibility
  budget?: number; // Added for compatibility
  establishedDate?: string; // Added for compatibility
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

export type Employee = {
  id: string; // Legacy ID from previous system, e.g., "e1"
  uid?: string; // This will be the Firebase Auth UID.
  email: string;
  username: string; // Tên đăng nhập
  name: string;
  position: string;
  departmentId: string;
  avatar: string;
  role: 'admin' | 'employee';
  phone?: string; // Số điện thoại
  address?: string; // Địa chỉ
  dateOfBirth?: string; // Added for compatibility
  bio?: string; // Added for compatibility
  startDate: string; // Ngày bắt đầu làm việc
  employeeId: string; // Mã nhân viên (NV001, EMP001, etc.)
  isActive: boolean; // Trạng thái hoạt động
  createdAt: string; // Ngày tạo
  updatedAt: string; // Ngày cập nhật
};

export type Kpi = {
  id: string;
  name: string;
  description: string;
  department: string;
  departmentId?: string; // ID của phòng ban
  formula?: string;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  reward?: number; // Số tiền thưởng khi đạt KPI
  penalty?: number; // Số tiền phạt khi không đạt KPI
  rewardThreshold?: number; // Ngưỡng thưởng (ví dụ: 80% để được thưởng)
  penaltyThreshold?: number; // Ngưỡng phạt (ví dụ: dưới 60% bị phạt)
  rewardType?: 'fixed' | 'percentage' | 'variable'; // Loại thưởng
  penaltyType?: 'fixed' | 'percentage' | 'variable'; // Loại phạt
  maxReward?: number; // Thưởng tối đa
  maxPenalty?: number; // Phạt tối đa
  type: string;
  category: string;
  target: number;
  weight: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  status?: KpiStatus;
};

export type KpiRecord = {
  id: string;
  kpiId: string;
  employeeId: string;
  period: string; // Format: "2024-Q1", "2024-01", etc.
  target: number; // Mục tiêu KPI
  actual: number; // Giá trị thực tế
  status: KpiStatus; // Sử dụng KpiStatus từ service
  startDate: string; // Ngày bắt đầu
  endDate: string; // Ngày kết thúc
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
  submittedReport?: string; // Báo cáo đã nộp
  approvalComment?: string; // Comment từ admin khi duyệt/từ chối
  statusHistory?: Array<{
    status: KpiStatus;
    changedAt: string;
    changedBy: string;
    comment?: string;
  }>; // Lịch sử thay đổi trạng thái
  lastStatusChange?: string; // Lần thay đổi trạng thái cuối
  lastStatusChangedBy?: string; // Người thay đổi trạng thái cuối
  createdAt: string;
  updatedAt: string;
  // Thêm các field cho thưởng/phạt
  rewardAmount?: number; // Số tiền thưởng được tính
  penaltyAmount?: number; // Số tiền phạt được tính
  netAmount?: number; // Số tiền ròng (thưởng - phạt)
  achievementRate?: number; // Tỷ lệ đạt được (actual/target * 100)
  rewardCalculatedAt?: string; // Thời gian tính thưởng
  rewardCalculatedBy?: string; // Người tính thưởng
  rewardStatus?: 'pending' | 'calculated' | 'approved' | 'paid'; // Trạng thái thưởng
};

export type Metric = {
  id: string;
  name: string;
  description: string;
  unit: string;
  type: 'number' | 'percentage' | 'currency' | 'text';
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MetricData = {
  id: string;
  metricId: string;
  employeeId: string;
  period: string;
  value: number | string;
  notes?: string;
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
};

export type Report = {
  id: string;
  employeeId: string;
  period: string;
  title: string;
  content: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  feedback?: string;
  score?: number;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
};

export type SystemSettings = {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
};

export type AuditLog = {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};

export type RewardProgram = {
  id: string;
  name: string;
  description: string;
  position: string;
  year: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
  isActive: boolean;
  criteria: RewardCriteria[];
  penalties: PenaltyCriteria[];
  createdAt: string;
  updatedAt: string;
};

export type RewardCriteria = {
  id: string;
  name: string;
  description: string;
  type: 'kpi_score' | 'report_score' | 'behavior_score' | 'attendance' | 'custom';
  condition: {
    operator: 'gte' | 'gt' | 'lte' | 'lt' | 'eq' | 'range';
    value: number;
    secondValue?: number; // For range operator
  };
  reward: number;
  maxReward?: number;
  isActive: boolean;
};

export type PenaltyCriteria = {
  id: string;
  name: string;
  description: string;
  type: 'kpi_score' | 'report_score' | 'behavior_score' | 'attendance' | 'custom';
  condition: {
    operator: 'gte' | 'gt' | 'lte' | 'lt' | 'eq' | 'range';
    value: number;
    secondValue?: number; // For range operator
  };
  penalty: number;
  maxPenalty?: number;
  isActive: boolean;
};

export type RewardCalculation = {
  id: string;
  employeeId: string;
  period: string;
  kpiScore: number;
  reportScore: number;
  behaviorScore: number;
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  rewardAmount: number;
  penaltyAmount: number;
  netAmount: number;
  status: 'pending' | 'approved' | 'paid';
  calculatedAt: string;
  calculatedBy: string;
  approvedBy?: string;
  paidAt?: string;
  notes?: string;
};

// KPI Reward/Penalty Types
export type KpiRewardPenalty = {
  id: string;
  kpiId: string;
  kpiName: string;
  employeeId: string;
  employeeName: string;
  department: string;
  period: string;
  targetValue: number;
  actualValue: number;
  achievementRate: number;
  rewardAmount: number;
  penaltyAmount: number;
  netAmount: number;
  status: 'pending' | 'calculated' | 'approved' | 'paid';
  calculatedAt: string;
  notes?: string;
  calculatedBy?: string;
  approvedBy?: string;
  paidAt?: string;
};

export type KpiRewardPenaltyRule = {
  id: string;
  kpiId: string;
  name: string;
  description: string;
  type: 'reward' | 'penalty';
  condition: {
    operator: 'gte' | 'gt' | 'lte' | 'lt' | 'eq' | 'range';
    value: number;
    secondValue?: number; // For range operator
  };
  amount: number;
  amountType: 'fixed' | 'percentage' | 'variable';
  maxAmount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type KpiRewardPenaltyCalculation = {
  id: string;
  kpiRecordId: string;
  employeeId: string;
  period: string;
  rules: Array<{
    ruleId: string;
    ruleName: string;
    type: 'reward' | 'penalty';
    condition: string;
    amount: number;
    applied: boolean;
  }>;
  totalReward: number;
  totalPenalty: number;
  netAmount: number;
  calculatedAt: string;
  calculatedBy: string;
  status: 'pending' | 'approved' | 'paid';
  approvedBy?: string;
  paidAt?: string;
};

// Form Types
export type CreateEmployeeFormValues = {
  name: string;
  email: string;
  username: string;
  position: string;
  departmentId: string;
  phone?: string;
  address?: string;
  startDate: string;
  employeeId: string;
};

export type EditEmployeeFormValues = CreateEmployeeFormValues & {
  id: string;
  isActive: boolean;
};

export type CreateKpiFormValues = {
  name: string;
  description: string;
  department: string;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  formula?: string;
  type: string;
  category: string;
  target: number;
  weight: number;
  reward: number;
  penalty: number;
  startDate: string;
  endDate: string;
};

export type EditKpiFormValues = CreateKpiFormValues & {
  id: string;
  isActive: boolean;
};

export type CreateDepartmentFormValues = {
  name: string;
  description?: string;
  managerId?: string;
  location?: string;
  phone?: string;
  email?: string;
  budget?: number;
  establishedDate?: string;
};

export type EditDepartmentFormValues = CreateDepartmentFormValues & {
  id: string;
  isActive: boolean;
};

// API Response Types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T = any> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Filter and Search Types
export type FilterOptions = {
  department?: string;
  position?: string;
  status?: string;
  period?: string;
  dateRange?: {
    start: string;
    end: string;
  };
};

export type SortOptions = {
  field: string;
  direction: 'asc' | 'desc';
};

export type SearchOptions = {
  query: string;
  fields: string[];
};

// Dashboard Types
export type DashboardStats = {
  totalEmployees: number;
  totalKpis: number;
  totalDepartments: number;
  pendingApprovals: number;
  completedKpis: number;
  averageScore: number;
};

export type PerformanceMetrics = {
  employeeId: string;
  employeeName: string;
  department: string;
  kpiScore: number;
  reportScore: number;
  behaviorScore: number;
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  rank: number;
  trend: 'up' | 'down' | 'stable';
};

// Export all types
export * from './index';