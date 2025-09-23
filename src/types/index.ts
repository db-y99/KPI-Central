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
  reward?: number;
  penalty?: number;
  type?: string; // Loại KPI
  target?: number; // Mục tiêu
  category?: string; // Danh mục KPI
  weight?: number; // Trọng số
  permissions?: Record<string, KpiPermission>; // Quyền truy cập theo employeeId
  createdAt?: string;
  updatedAt?: string;
};

// Chi tiết quyền hạn KPI
export type KpiPermission = {
  canView: boolean; // Xem KPI
  canEdit: boolean; // Chỉnh sửa KPI
  canDelete: boolean; // Xóa KPI
  canAssign: boolean; // Gán KPI cho nhân viên khác
  canSubmitReport: boolean; // Nộp báo cáo KPI
  canApprove: boolean; // Phê duyệt báo cáo KPI
  canEvaluate: boolean; // Đánh giá KPI
  canViewReports: boolean; // Xem báo cáo KPI
  canExportReports: boolean; // Xuất báo cáo KPI
  assignedBy?: string; // Người gán quyền
  assignedDate?: string; // Ngày gán quyền
  expiresAt?: string; // Ngày hết hạn quyền (optional)
};

// Cấu hình phân quyền theo vai trò
export type RolePermission = {
  id: string;
  roleName: string; // 'admin', 'manager', 'employee', 'viewer'
  displayName: string;
  description: string;
  permissions: {
    // Quyền quản lý KPI
    kpiManagement: {
      canCreateKpi: boolean;
      canEditKpi: boolean;
      canDeleteKpi: boolean;
      canAssignKpi: boolean;
      canViewAllKpis: boolean;
    };
    // Quyền báo cáo
    reporting: {
      canViewReports: boolean;
      canCreateReports: boolean;
      canExportReports: boolean;
      canApproveReports: boolean;
    };
    // Quyền đánh giá
    evaluation: {
      canEvaluate: boolean;
      canApproveEvaluation: boolean;
      canViewEvaluationHistory: boolean;
    };
    // Quyền quản lý nhân viên
    employeeManagement: {
      canViewEmployees: boolean;
      canCreateEmployee: boolean;
      canEditEmployee: boolean;
      canDeleteEmployee: boolean;
    };
    // Quyền quản lý phòng ban
    departmentManagement: {
      canViewDepartments: boolean;
      canCreateDepartment: boolean;
      canEditDepartment: boolean;
      canDeleteDepartment: boolean;
    };
    // Quyền hệ thống
    systemAccess: {
      canAccessAdmin: boolean;
      canManagePermissions: boolean;
      canViewSystemLogs: boolean;
    };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// Phân quyền chi tiết cho từng nhân viên
export type EmployeePermission = {
  id: string;
  employeeId: string;
  roleId: string;
  customPermissions?: Partial<RolePermission['permissions']>; // Quyền tùy chỉnh
  departmentRestrictions?: string[]; // Giới hạn phòng ban
  kpiRestrictions?: string[]; // Giới hạn KPI cụ thể
  expiresAt?: string; // Ngày hết hạn
  assignedBy: string;
  assignedDate: string;
  isActive: boolean;
};

export type KpiRecord = {
  id: string;
  kpiId: string;
  employeeId: string; // This should be the Firebase Auth UID
  target: number;
  actual: number;
  targetValue: number; // Added for compatibility
  actualValue: number; // Added for compatibility
  period: string; // Added for compatibility
  notes?: string; // Added for compatibility
  updatedAt: string; // Added for compatibility
  startDate: string;
  endDate: string;
  submittedReport?: string;
  status: 'pending' | 'awaiting_approval' | 'approved' | 'rejected' | 'completed' | 'in-progress';
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
  createdAt?: string; // Added for compatibility
  updatedAt?: string; // Added for compatibility
  employeeName?: string; // Added for compatibility
  position?: string; // Added for compatibility
  department?: string; // Added for compatibility
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
  rewards?: RewardBreakdown[]; // Added for compatibility
  penalties?: PenaltyBreakdown[]; // Added for compatibility
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

// Report System Types
export type Report = {
  id: string;
  employeeId: string; // Firebase Auth UID
  kpiId: string;
  kpiRecordId: string; // Reference to KpiRecord
  title: string;
  description: string;
  type: 'monthly' | 'quarterly' | 'special';
  period: string; // YYYY-MM format
  actualValue: number;
  targetValue: number;
  unit: string;
  files: ReportFile[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'needs_revision';
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  feedback?: string;
  score?: number;
  createdAt: string;
  updatedAt: string;
  version: number; // For tracking revisions
};

export type ReportFile = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  storageType?: 'firebase' | 'google-drive';
  driveFileId?: string; // Google Drive file ID
  webViewLink?: string; // Google Drive web view link
  thumbnailLink?: string; // Google Drive thumbnail
};

export type ReportSubmission = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  kpiId: string;
  kpiName: string;
  title: string;
  description: string;
  period: string;
  actualValue: number;
  targetValue: number;
  unit: string;
  files: ReportFile[];
  status: 'submitted' | 'approved' | 'rejected' | 'needs_revision';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  feedback?: string;
  priority: 'high' | 'medium' | 'low';
};

// Notification System Types
export type Notification = {
  id: string;
  userId: string; // Firebase Auth UID
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'report' | 'kpi' | 'system';
  category: 'report_submitted' | 'report_approved' | 'report_rejected' | 'report_revision_requested' | 
           'kpi_assigned' | 'kpi_overdue' | 'kpi_deadline_reminder' | 'system_update' | 'general';
  data?: Record<string, any>; // Additional data for the notification
  isRead: boolean;
  isImportant: boolean;
  actionUrl?: string; // URL to navigate when notification is clicked
  actionText?: string; // Text for action button
  sender?: string; // Added for compatibility
  createdAt: string;
  expiresAt?: string; // Optional expiration date
  readAt?: string;
};

export type NotificationSettings = {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  reportNotifications: boolean;
  kpiNotifications: boolean;
  systemNotifications: boolean;
  reminderFrequency: 'immediate' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  createdAt: string;
  updatedAt: string;
};

export type NotificationTemplate = {
  id: string;
  name: string; // Added for compatibility
  type: Notification['type'];
  category: Notification['category'];
  titleTemplate: string;
  messageTemplate: string;
  actionText?: string;
  isActive: boolean;
  channels: ('push' | 'email' | 'sms')[]; // Added for compatibility
  recipients: {
    type: 'all' | 'department' | 'position' | 'custom';
    values: string[];
  }; // Added for compatibility
  createdAt: string;
  updatedAt: string;
};

// Advanced KPI Features Types
export type KpiFormula = {
  id: string;
  name: string;
  description: string;
  formula: string; // Mathematical expression like "actual / target * 100"
  variables: KpiVariable[];
  validationRules: FormulaValidationRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type KpiVariable = {
  id: string;
  name: string;
  displayName: string;
  type: 'number' | 'percentage' | 'currency' | 'count' | 'ratio';
  unit?: string;
  isRequired: boolean;
  defaultValue?: number;
  description?: string;
};

export type FormulaValidationRule = {
  id: string;
  type: 'min' | 'max' | 'range' | 'required' | 'format';
  value?: number;
  min?: number;
  max?: number;
  message: string;
};

export type MeasurementCycle = {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';
  startDate: string;
  endDate: string;
  frequency: number; // How often to measure (e.g., every 7 days for weekly)
  frequencyUnit: 'days' | 'weeks' | 'months' | 'quarters' | 'years';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type KpiCycle = {
  id: string;
  kpiId: string;
  cycleId: string;
  startDate: string;
  endDate: string;
  targetValue: number;
  actualValue?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  measurementDates: string[]; // Array of dates when measurements should be taken
  lastMeasuredAt?: string;
  nextMeasurementAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type BulkImportTemplate = {
  id: string;
  name: string;
  description: string;
  type: 'kpi' | 'employee' | 'department' | 'kpi_assignment';
  template: BulkImportField[];
  validationRules: BulkImportValidationRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BulkImportField = {
  id: string;
  name: string;
  displayName: string;
  type: 'text' | 'number' | 'date' | 'email' | 'select' | 'boolean';
  isRequired: boolean;
  defaultValue?: any;
  options?: string[]; // For select type
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
};

export type BulkImportValidationRule = {
  id: string;
  fieldName: string;
  type: 'unique' | 'exists' | 'format' | 'range';
  value?: any;
  message: string;
};

export type BulkImportResult = {
  id: string;
  templateId: string;
  fileName: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: BulkImportError[];
  status: 'processing' | 'completed' | 'failed';
  processedAt: string;
  completedAt?: string;
  createdBy: string;
};

export type BulkImportError = {
  row: number;
  field: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
};

// Employee Self-Service Types
export type SelfUpdateRequest = {
  id: string;
  employeeId: string;
  kpiRecordId: string;
  currentValue: number;
  newValue: number;
  reason: string;
  supportingDocuments?: string[]; // URLs to uploaded files
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
};

export type PerformanceBreakdown = {
  id: string;
  employeeId: string;
  kpiId: string;
  period: string; // YYYY-MM format
  targetValue: number;
  actualValue: number;
  achievementRate: number;
  trend: 'improving' | 'stable' | 'declining';
  comparisonData: {
    previousPeriod: {
      actualValue: number;
      achievementRate: number;
    };
    departmentAverage: number;
    companyAverage: number;
  };
  detailedMetrics: {
    dailyValues: { date: string; value: number }[];
    weeklyAverages: { week: string; average: number }[];
    monthlyProgress: { month: string; progress: number }[];
  };
  insights: string[];
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
};

export type PerformancePrediction = {
  id: string;
  employeeId: string;
  kpiId: string;
  predictionPeriod: string; // YYYY-MM format
  currentValue: number;
  predictedValue: number;
  confidenceLevel: number; // 0-100
  predictionMethod: 'trend_analysis' | 'machine_learning' | 'expert_judgment';
  factors: {
    historicalPerformance: number;
    currentTrend: number;
    seasonalFactors: number;
    externalFactors: number;
  };
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
  riskFactors: string[];
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
};

export type SelfServiceSettings = {
  id: string;
  employeeId: string;
  allowSelfUpdate: boolean;
  maxUpdateFrequency: number; // days
  requireApprovalThreshold: number; // percentage change
  enablePredictions: boolean;
  enableDetailedBreakdown: boolean;
  notificationPreferences: {
    updateReminders: boolean;
    predictionAlerts: boolean;
    performanceInsights: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type PerformanceInsight = {
  id: string;
  employeeId: string;
  kpiId: string;
  type: 'achievement' | 'trend' | 'comparison' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  data: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  expiresAt?: string;
};

// Alert System Types
export type AlertRule = {
  id: string;
  name: string;
  description: string;
  type: 'deadline' | 'custom' | 'kpi_performance' | 'threshold' | 'anomaly';
  conditions: AlertCondition[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  notificationChannels: ('push' | 'email' | 'sms')[];
  isActive: boolean;
  cooldownMinutes: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type AlertCondition = {
  id: string;
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'range';
  value: number | string;
  secondValue?: number;
  unit?: string;
};

export type Alert = {
  id: string;
  ruleId: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'dismissed';
  triggeredAt: string;
  resolvedAt?: string;
  dismissedAt?: string;
  data?: Record<string, any>;
};

// File Upload Types
export type UploadedFile = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
};

// API Integration Types
export type ApiIntegration = {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'rest_api' | 'webhook' | 'graphql' | 'sftp';
  endpoint: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';
  authentication: {
    type: 'none' | 'bearer' | 'basic' | 'api_key' | 'oauth2';
    credentials: Record<string, string>;
  };
  headers: Record<string, string>;
  bodyTemplate?: string;
  isActive: boolean;
  lastExecutedAt?: string;
  executionCount: number;
  successCount: number;
  errorCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};


