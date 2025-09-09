import type { RewardProgram, PositionConfig, PenaltyCriteria } from '@/types';

// Template for creating a new reward program
export const createRewardProgramTemplate = (position: string): RewardProgram => ({
  id: `temp-${Date.now()}`,
  name: `${position} - 2025 Reward Program`,
  description: `Chương trình khen thưởng năm 2025 cho ${position}`,
  position,
  year: 2025,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  quarterlyRewards: [],
  monthlyRewards: [],
  annualRewards: [],
  penalties: []
});

// Template for creating a new position config
export const createPositionConfigTemplate = (position: string, department: string): PositionConfig => ({
  id: `temp-config-${Date.now()}`,
  position,
  displayName: position,
  department,
  rewardProgramId: '',
  metrics: [],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Template for creating a new penalty criteria
export const createPenaltyTemplate = (): PenaltyCriteria => ({
  id: `temp-penalty-${Date.now()}`,
  name: '',
  description: '',
  type: 'fixed',
  value: 0,
  frequency: 'incident',
  severity: 'medium',
  conditions: [],
  isActive: true
});

// Common positions for quick setup
export const commonPositions = [
  'IT Staff',
  'Head of Marketing',
  'Marketing Assistant', 
  'Customer Service Officer',
  'Credit Appraiser',
  'HR/Admin Staff',
  'Accountant',
  'Sales Manager',
  'Operations Manager',
  'Finance Manager'
];

// Common departments
export const commonDepartments = [
  'IT',
  'Marketing',
  'Customer Service',
  'Credit',
  'HR',
  'Finance',
  'Sales',
  'Operations',
  'Admin'
];

// Common metrics for different positions
export const commonMetrics = {
  'IT Staff': [
    'system_uptime_percentage',
    'system_downtime_incidents',
    'logs_completeness_percentage',
    'security_audits_passed_count',
    'improvement_tools_systems_count'
  ],
  'Marketing': [
    'qualified_leads_count',
    'platform_loans_disbursed_count',
    'campaign_leads_generated',
    'marketing_loan_outstanding_total',
    'fake_leads_count'
  ],
  'Customer Service': [
    'approved_loan_outstanding_per_10m',
    'loan_renewals_count',
    'loan_recovery_success_count_x2',
    'document_errors_count',
    'missed_followup_count'
  ],
  'Credit': [
    'approved_loan_outstanding_per_10m',
    'overdue_loan_recovery_per_10m_x2',
    'loan_renewal_processed_count',
    'bad_debt_ratio_percentage',
    'collection_logs_completeness_percentage'
  ],
  'HR/Admin': [
    'personnel_records_completeness',
    'hr_process_efficiency',
    'compliance_requirements_met',
    'hr_initiatives_count',
    'late_salary_payments_count',
    'late_document_submissions_count'
  ],
  'Finance/Accountant': [
    'financial_reports_completeness',
    'account_reconciliation_accuracy',
    'cost_savings_amount',
    'tax_declaration_ontime',
    'audit_results_rating',
    'forecast_savings_amount',
    'late_tax_submissions_count',
    'cash_bank_discrepancies_count'
  ]
};

// Reward types with descriptions
export const rewardTypes = [
  {
    value: 'fixed',
    label: 'Cố định',
    description: 'Số tiền thưởng cố định khi đạt điều kiện'
  },
  {
    value: 'variable',
    label: 'Biến động',
    description: 'Số tiền thưởng thay đổi theo hiệu suất'
  },
  {
    value: 'percentage',
    label: 'Phần trăm',
    description: 'Thưởng tính theo phần trăm của cơ sở'
  },
  {
    value: 'points',
    label: 'Điểm',
    description: 'Hệ thống điểm, quy đổi thành tiền thưởng'
  }
];

// Penalty types with descriptions
export const penaltyTypes = [
  {
    value: 'fixed',
    label: 'Cố định',
    description: 'Số tiền phạt cố định khi vi phạm'
  },
  {
    value: 'variable',
    label: 'Biến động',
    description: 'Số tiền phạt thay đổi theo mức độ vi phạm'
  },
  {
    value: 'percentage',
    label: 'Phần trăm',
    description: 'Phạt tính theo phần trăm của cơ sở'
  },
  {
    value: 'warning',
    label: 'Cảnh cáo',
    description: 'Cảnh cáo, không trừ tiền thưởng'
  }
];

// Severity levels
export const severityLevels = [
  {
    value: 'low',
    label: 'Nhẹ',
    description: 'Vi phạm nhẹ, ít ảnh hưởng'
  },
  {
    value: 'medium',
    label: 'Trung bình',
    description: 'Vi phạm trung bình, cần chú ý'
  },
  {
    value: 'high',
    label: 'Nghiêm trọng',
    description: 'Vi phạm nghiêm trọng, ảnh hưởng lớn'
  }
];

// Frequency options
export const frequencyOptions = [
  {
    value: 'monthly',
    label: 'Hàng tháng',
    description: 'Tính toán và thưởng hàng tháng'
  },
  {
    value: 'quarterly',
    label: 'Hàng quý',
    description: 'Tính toán và thưởng hàng quý'
  },
  {
    value: 'annually',
    label: 'Hàng năm',
    description: 'Tính toán và thưởng hàng năm'
  },
  {
    value: 'incident',
    label: 'Theo sự kiện',
    description: 'Tính toán khi có sự kiện xảy ra'
  }
];

// Operators for conditions
export const conditionOperators = [
  {
    value: 'gt',
    label: 'Lớn hơn (>)',
    description: 'Giá trị thực tế lớn hơn giá trị yêu cầu'
  },
  {
    value: 'gte',
    label: 'Lớn hơn hoặc bằng (>=)',
    description: 'Giá trị thực tế lớn hơn hoặc bằng giá trị yêu cầu'
  },
  {
    value: 'lt',
    label: 'Nhỏ hơn (<)',
    description: 'Giá trị thực tế nhỏ hơn giá trị yêu cầu'
  },
  {
    value: 'lte',
    label: 'Nhỏ hơn hoặc bằng (<=)',
    description: 'Giá trị thực tế nhỏ hơn hoặc bằng giá trị yêu cầu'
  },
  {
    value: 'eq',
    label: 'Bằng (=)',
    description: 'Giá trị thực tế bằng giá trị yêu cầu'
  },
  {
    value: 'range',
    label: 'Trong khoảng',
    description: 'Giá trị thực tế nằm trong khoảng cho phép'
  }
];
