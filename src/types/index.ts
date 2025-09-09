export type Department = {
  id: string;
  name: string;
  description?: string;
  managerId?: string; // ID của người quản lý phòng ban
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
  reward?: number;
  penalty?: number;
  type?: string; // Loại KPI
  target?: number; // Mục tiêu
  category?: string; // Danh mục KPI
  weight?: number; // Trọng số
  permissions?: Record<string, {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAssign: boolean;
  }>; // Quyền truy cập theo employeeId
  createdAt?: string;
  updatedAt?: string;
};

export type KpiRecord = {
  id: string;
  kpiId: string;
  employeeId: string; // This should be the Firebase Auth UID
  target: number;
  actual: number;
  startDate: string;
  endDate: string;
  submittedReport?: string;
  status: 'pending' | 'awaiting_approval' | 'approved' | 'rejected';
  approvalComment?: string;
};

// Reward System Types
export type RewardProgram = {
  id: string;
  name: string;
  description: string;
  position: string; // IT Staff, Head of Marketing, etc.
  year: number;
  frequency: 'monthly' | 'quarterly' | 'annual';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  quarterlyRewards: RewardCriteria[];
  monthlyRewards: RewardCriteria[];
  annualRewards: RewardCriteria[];
  penalties: PenaltyCriteria[];
};

export type RewardCriteria = {
  id: string;
  name: string;
  description: string;
  type: 'fixed' | 'variable' | 'percentage' | 'points';
  value: number; // Giá trị thưởng hoặc điểm
  maxValue: number | null; // Giá trị tối đa (nếu có)
  frequency: 'monthly' | 'quarterly' | 'annually';
  conditions: RewardCondition[];
  isActive: boolean;
};

export type RewardCondition = {
  id: string;
  metric: string; // Tên metric cần đo lường
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'range';
  value: number | string;
  secondValue: number | null; // Cho range operator
  unit: string | null;
};

export type PenaltyCriteria = {
  id: string;
  name: string;
  description: string;
  type: 'fixed' | 'variable' | 'percentage' | 'warning';
  value: number; // Giá trị phạt hoặc 0 cho warning
  maxValue: number | null; // Giá trị tối đa (nếu có)
  frequency: 'monthly' | 'quarterly' | 'annually' | 'incident';
  conditions: PenaltyCondition[];
  isActive: boolean;
  severity: 'low' | 'medium' | 'high'; // Mức độ nghiêm trọng
};

export type PenaltyCondition = {
  id: string;
  metric: string; // Tên metric cần đo lường
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'range';
  value: number | string;
  secondValue: number | null; // Cho range operator  
  unit: string | null;
};

export type EmployeePoint = {
  id: string;
  employeeId: string;
  programId: string;
  period: string; // YYYY-MM hoặc YYYY-Q1, YYYY-Q2, etc.
  pointsEarned: number;
  pointsUsed: number;
  pointsBalance: number;
  details: PointDetail[];
  createdAt: string;
  updatedAt: string;
};

export type PointDetail = {
  id: string;
  source: string; // Nguồn gốc điểm (tên reward criteria)
  points: number;
  description: string;
  date: string;
  metadata?: Record<string, any>; // Thông tin bổ sung
};

export type RewardCalculation = {
  id: string;
  employeeId: string;
  programId: string;
  period: string;
  frequency: 'monthly' | 'quarterly' | 'annually';
  totalReward: number;
  totalPenalty: number;
  netAmount: number; // totalReward - totalPenalty
  breakdown: RewardBreakdown[];
  penalties: PenaltyBreakdown[];
  status: 'pending' | 'calculated' | 'approved' | 'paid' | 'rejected';
  calculatedAt: string;
  approvedAt?: string;
  paidAt?: string;
  approvedBy?: string;
  notes?: string;
};

export type RewardBreakdown = {
  criteriaId: string;
  criteriaName: string;
  type: 'fixed' | 'variable' | 'percentage' | 'points';
  baseValue: number;
  actualValue: number;
  rewardAmount: number;
  description: string;
  conditions: ConditionResult[];
};

export type PenaltyBreakdown = {
  criteriaId: string;
  criteriaName: string;
  type: 'fixed' | 'variable' | 'percentage' | 'warning';
  baseValue: number;
  actualValue: number;
  penaltyAmount: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
  conditions: ConditionResult[];
};

export type ConditionResult = {
  conditionId: string;
  metric: string;
  expected: number | string;
  actual: number | string;
  met: boolean;
  description: string;
};

export type MetricData = {
  id: string;
  employeeId: string;
  metric: string;
  value: number | string;
  period: string;
  source: string; // Nguồn dữ liệu
  recordedAt: string;
  metadata?: Record<string, any>;
};

// Position-based configurations
export type PositionConfig = {
  id: string;
  position: string;
  displayName: string;
  department: string;
  rewardProgramId: string;
  metrics: PositionMetric[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PositionMetric = {
  id: string;
  name: string;
  displayName: string;
  description: string;
  dataType: 'number' | 'boolean' | 'currency' | 'percentage';
  unit?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  source: 'manual' | 'system' | 'external';
  isRequired: boolean;
  validationRules?: ValidationRule[];
};

export type ValidationRule = {
  type: 'min' | 'max' | 'range' | 'required';
  value?: number;
  min?: number;
  max?: number;
  message?: string;
};


