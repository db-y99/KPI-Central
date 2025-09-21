import type { RewardProgram, RewardCriteria, PenaltyCriteria, Kpi } from '@/types';

// Generate unique IDs for criteria
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper function to create KPI definitions
const createKpi = (
  name: string,
  description: string,
  department: string,
  unit: string,
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually',
  target: number,
  type: string,
  category: string
): Omit<Kpi, 'id'> => ({
  name,
  description,
  department,
  unit,
  frequency,
  target,
  type,
  category,
  weight: 1,
  reward: 0,
  penalty: 0
});

// Helper function to create reward criteria
const createRewardCriteria = (
  name: string,
  description: string,
  type: 'fixed' | 'variable' | 'percentage',
  value: number,
  maxValue: number | undefined,
  frequency: 'monthly' | 'quarterly' | 'annually',
  conditions: Array<{
    metric: string;
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'range';
    value: number | string;
    secondValue?: number;
    unit?: string;
  }>
): RewardCriteria => ({
  id: generateId(),
  name,
  description,
  type,
  value,
  maxValue: maxValue || null,
  frequency,
  conditions: conditions.map(c => ({
    id: generateId(),
    metric: c.metric,
    operator: c.operator,
    value: c.value,
    secondValue: c.secondValue || null,
    unit: c.unit || null
  })),
  isActive: true
});

// Helper function to create penalty criteria
const createPenaltyCriteria = (
  name: string,
  description: string,
  type: 'fixed' | 'variable' | 'warning',
  value: number,
  frequency: 'monthly' | 'quarterly' | 'annually' | 'incident',
  severity: 'low' | 'medium' | 'high',
  conditions: Array<{
    metric: string;
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'range';
    value: number | string;
    secondValue?: number;
    unit?: string;
  }>
): PenaltyCriteria => ({
  id: generateId(),
  name,
  description,
  type,
  value,
  maxValue: null,
  frequency,
  conditions: conditions.map(c => ({
    id: generateId(),
    metric: c.metric,
    operator: c.operator,
    value: c.value,
    secondValue: c.secondValue || null,
    unit: c.unit || null
  })),
  isActive: true,
  severity
});

export const rewardProgramsData: Omit<RewardProgram, 'id'>[] = [
  // 1. IT Staff (Nhân Viên IT)
  {
    name: 'Chương trình thưởng Nhân viên IT',
    description: 'Chương trình thưởng dành cho nhân viên IT với thưởng theo quý và năm',
    position: 'IT Staff',
    year: 2024,
    frequency: 'quarterly',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    monthlyRewards: [],
    quarterlyRewards: [
      createRewardCriteria(
        'Thưởng thời gian hoạt động hệ thống',
        'Thưởng cho việc duy trì thời gian hoạt động của hệ thống',
        'fixed',
        300000,
        undefined,
        'quarterly',
        [{ metric: 'system_uptime_percentage', operator: 'gte', value: 99, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng sao lưu dữ liệu',
        'Thưởng cho việc thực hiện sao lưu định kỳ',
        'fixed',
        200000,
        undefined,
        'quarterly',
        [{ metric: 'backup_completion_rate', operator: 'gte', value: 95, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng công việc sửa chữa',
        'Thưởng cho mỗi công việc sửa chữa hoàn thành',
        'variable',
        200000,
        undefined,
        'quarterly',
        [{ metric: 'repair_jobs_completed', operator: 'gt', value: 0, unit: 'jobs' }]
      ),
      createRewardCriteria(
        'Thưởng báo cáo',
        'Thưởng cho việc nộp báo cáo đầy đủ và đúng hạn',
        'fixed',
        300000,
        undefined,
        'quarterly',
        [{ metric: 'reports_submitted_on_time', operator: 'gte', value: 90, unit: '%' }]
      )
    ],
    annualRewards: [
      createRewardCriteria(
        'Thưởng cải tiến hoạt động',
        'Thưởng cho các sáng kiến cải tiến hoạt động IT',
        'variable',
        3500000,
        5000000,
        'annually',
        [{ metric: 'improvement_initiatives_implemented', operator: 'gte', value: 2, unit: 'initiatives' }]
      ),
      createRewardCriteria(
        'Thưởng kiểm toán và phân tích',
        'Thưởng cho công tác kiểm toán và phân tích hệ thống',
        'variable',
        1500000,
        2000000,
        'annually',
        [{ metric: 'audit_tasks_completed', operator: 'gte', value: 4, unit: 'audits' }]
      ),
      createRewardCriteria(
        'Lương tháng 13',
        'Thưởng lương tháng 13 hàng năm',
        'percentage',
        100,
        undefined,
        'annually',
        [{ metric: 'annual_performance_rating', operator: 'gte', value: 3, unit: 'rating' }]
      )
    ],
    penalties: [
      createPenaltyCriteria(
        'Phạt thời gian chết hệ thống',
        'Phạt khi có thời gian chết hệ thống',
        'fixed',
        300000,
        'incident',
        'high',
        [{ metric: 'system_downtime_incidents', operator: 'gt', value: 0, unit: 'incidents' }]
      ),
      createPenaltyCriteria(
        'Phạt nhật ký không đầy đủ',
        'Phạt khi nhật ký không được ghi đầy đủ',
        'fixed',
        500000,
        'quarterly',
        'medium',
        [{ metric: 'incomplete_logs_percentage', operator: 'gt', value: 10, unit: '%' }]
      )
    ]
  },

  // 2. Head of Marketing Department (Trưởng Bộ Phận Marketing)
  {
    name: 'Chương trình thưởng Trưởng phòng Marketing',
    description: 'Chương trình thưởng dành cho Trưởng phòng Marketing',
    position: 'Head of Marketing',
    year: 2024,
    frequency: 'quarterly',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    monthlyRewards: [],
    quarterlyRewards: [
      createRewardCriteria(
        'Thưởng khách hàng tiềm năng',
        'Thưởng khi có trên 50 khách hàng tiềm năng',
        'fixed',
        500000,
        undefined,
        'quarterly',
        [{ metric: 'potential_customers_acquired', operator: 'gt', value: 50, unit: 'customers' }]
      ),
      createRewardCriteria(
        'Thưởng khoản vay',
        'Thưởng cho mỗi 10 khoản vay',
        'variable',
        100000,
        undefined,
        'quarterly',
        [{ metric: 'loans_processed', operator: 'gte', value: 10, unit: 'loans' }]
      ),
      createRewardCriteria(
        'Thưởng chiến dịch lan truyền',
        'Thưởng cho chiến dịch marketing viral thành công',
        'variable',
        2000000,
        3000000,
        'quarterly',
        [{ metric: 'viral_campaign_success_rate', operator: 'gte', value: 70, unit: '%' }]
      )
    ],
    annualRewards: [
      createRewardCriteria(
        'Thưởng dư nợ cho vay',
        'Thưởng 1% dư nợ cho vay (tối đa 6 triệu VND/quý)',
        'percentage',
        1,
        24000000, // 6 triệu x 4 quý
        'annually',
        [{ metric: 'outstanding_loan_balance', operator: 'gt', value: 0, unit: 'VND' }]
      ),
      createRewardCriteria(
        'Lương tháng 13',
        'Thưởng lương tháng 13 hàng năm',
        'percentage',
        100,
        undefined,
        'annually',
        [{ metric: 'annual_performance_rating', operator: 'gte', value: 3, unit: 'rating' }]
      )
    ],
    penalties: [
      createPenaltyCriteria(
        'Không có thưởng với ít khách hàng tiềm năng',
        'Không có thưởng nếu có dưới 20 khách hàng tiềm năng',
        'fixed',
        0,
        'quarterly',
        'medium',
        [{ metric: 'potential_customers_acquired', operator: 'lt', value: 20, unit: 'customers' }]
      ),
      createPenaltyCriteria(
        'Phạt khách hàng tiềm năng giả mạo',
        'Phạt khi có khách hàng tiềm năng giả mạo',
        'fixed',
        500000,
        'incident',
        'high',
        [{ metric: 'fake_potential_customers', operator: 'gt', value: 0, unit: 'customers' }]
      )
    ]
  },

  // 3. Marketing Assistant (Trợ Lý Marketing)
  {
    name: 'Chương trình thưởng Trợ lý Marketing',
    description: 'Chương trình thưởng dành cho Trợ lý Marketing',
    position: 'Marketing Assistant',
    year: 2024,
    frequency: 'quarterly',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    monthlyRewards: [],
    quarterlyRewards: [
      createRewardCriteria(
        'Thưởng khách hàng tiềm năng',
        'Thưởng khi có đủ 50 khách hàng tiềm năng',
        'fixed',
        200000,
        undefined,
        'quarterly',
        [{ metric: 'potential_customers_acquired', operator: 'gte', value: 50, unit: 'customers' }]
      ),
      createRewardCriteria(
        'Thưởng khoản vay',
        'Thưởng cho mỗi 10 khoản vay',
        'variable',
        50000,
        undefined,
        'quarterly',
        [{ metric: 'loans_processed', operator: 'gte', value: 10, unit: 'loans' }]
      )
    ],
    annualRewards: [
      createRewardCriteria(
        'Thưởng dư nợ cho vay',
        'Thưởng 0.5% dư nợ cho vay (tối đa 3 triệu VND/quý)',
        'percentage',
        0.5,
        12000000, // 3 triệu x 4 quý
        'annually',
        [{ metric: 'outstanding_loan_balance', operator: 'gt', value: 0, unit: 'VND' }]
      ),
      createRewardCriteria(
        'Lương tháng 13',
        'Thưởng lương tháng 13 hàng năm',
        'percentage',
        100,
        undefined,
        'annually',
        [{ metric: 'annual_performance_rating', operator: 'gte', value: 3, unit: 'rating' }]
      )
    ],
    penalties: [
      createPenaltyCriteria(
        'Không có thưởng với ít khách hàng tiềm năng',
        'Không có thưởng nếu dưới 20 khách hàng tiềm năng',
        'fixed',
        0,
        'quarterly',
        'medium',
        [{ metric: 'potential_customers_acquired', operator: 'lt', value: 20, unit: 'customers' }]
      ),
      createPenaltyCriteria(
        'Cảnh cáo khách hàng tiềm năng giả mạo',
        'Cảnh cáo nếu có khách hàng tiềm năng giả mạo',
        'warning',
        0,
        'incident',
        'medium',
        [{ metric: 'fake_potential_customers', operator: 'gt', value: 0, unit: 'customers' }]
      )
    ]
  },

  // 4. Customer Service Officer (CSO)
  {
    name: 'Chương trình thưởng Nhân viên Chăm sóc Khách hàng',
    description: 'Chương trình thưởng dành cho CSO với hệ thống tính điểm hàng tháng',
    position: 'Customer Service Officer',
    year: 2024,
    frequency: 'quarterly',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    monthlyRewards: [
      createRewardCriteria(
        'Thưởng điểm phục vụ khách hàng',
        'Hệ thống tính điểm hàng tháng dựa trên chất lượng phục vụ',
        'variable',
        50000,
        500000,
        'monthly',
        [{ metric: 'monthly_service_points', operator: 'gte', value: 80, unit: 'points' }]
      )
    ],
    quarterlyRewards: [], // Không áp dụng thưởng quý
    annualRewards: [
      createRewardCriteria(
        'Lương tháng 13',
        'Thưởng lương tháng 13 hàng năm',
        'percentage',
        100,
        undefined,
        'annually',
        [{ metric: 'annual_performance_rating', operator: 'gte', value: 3, unit: 'rating' }]
      ),
      createRewardCriteria(
        'Thưởng theo tỷ lệ lãi công ty',
        'Thưởng dựa trên tỷ lệ lãi của công ty',
        'percentage',
        2,
        2000000,
        'annually',
        [{ metric: 'company_profit_rate', operator: 'gt', value: 10, unit: '%' }]
      )
    ],
    penalties: [
      createPenaltyCriteria(
        'Phạt lỗi chứng từ',
        'Phạt cho mỗi lỗi chứng từ',
        'variable',
        500000,
        'incident',
        'medium',
        [{ metric: 'document_errors', operator: 'gt', value: 0, unit: 'errors' }]
      ),
      createPenaltyCriteria(
        'Cảnh cáo bỏ lỡ theo dõi khách hàng',
        'Cảnh cáo nếu bỏ lỡ việc theo dõi khách hàng',
        'warning',
        0,
        'incident',
        'low',
        [{ metric: 'missed_customer_followups', operator: 'gt', value: 0, unit: 'followups' }]
      )
    ]
  },

  // 5. Credit Appraisal Staff (CA)
  {
    name: 'Chương trình thưởng Nhân viên Thẩm định Tín dụng',
    description: 'Chương trình thưởng dành cho CA với hệ thống tính điểm hàng tháng',
    position: 'Credit Appraisal Staff',
    year: 2024,
    frequency: 'quarterly',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    monthlyRewards: [
      createRewardCriteria(
        'Thưởng điểm thẩm định tín dụng',
        'Hệ thống tính điểm hàng tháng dựa trên chất lượng thẩm định',
        'variable',
        100000,
        1000000,
        'monthly',
        [{ metric: 'monthly_appraisal_points', operator: 'gte', value: 80, unit: 'points' }]
      )
    ],
    quarterlyRewards: [], // Không áp dụng thưởng quý
    annualRewards: [
      createRewardCriteria(
        'Thưởng tỷ lệ nợ xấu thấp',
        'Thưởng 5-10 triệu VND nếu tỷ lệ nợ xấu < 5%',
        'variable',
        7500000,
        10000000,
        'annually',
        [{ metric: 'npl_ratio', operator: 'lt', value: 5, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng top 10 điểm cao nhất',
        'Thưởng 5 triệu cho top 10 CA có điểm cao nhất',
        'fixed',
        5000000,
        undefined,
        'annually',
        [{ metric: 'annual_ranking', operator: 'lte', value: 10, unit: 'rank' }]
      ),
      createRewardCriteria(
        'Lương tháng 13',
        'Thưởng lương tháng 13 hàng năm',
        'percentage',
        100,
        undefined,
        'annually',
        [{ metric: 'annual_performance_rating', operator: 'gte', value: 3, unit: 'rating' }]
      )
    ],
    penalties: [
      createPenaltyCriteria(
        'Phạt tỷ lệ nợ xấu cao',
        'Phạt 500,000 VND nếu tỷ lệ nợ xấu > 10%',
        'fixed',
        500000,
        'annually',
        'high',
        [{ metric: 'npl_ratio', operator: 'gt', value: 10, unit: '%' }]
      ),
      createPenaltyCriteria(
        'Phạt nhật ký thu hồi nợ',
        'Phạt 200,000 VND cho nhật ký thu hồi nợ không đầy đủ',
        'fixed',
        200000,
        'quarterly',
        'medium',
        [{ metric: 'debt_collection_log_compliance', operator: 'lt', value: 90, unit: '%' }]
      )
    ]
  },

  // 6. HR/Admin Staff
  {
    name: 'Chương trình thưởng Nhân viên Hành chính - Nhân sự',
    description: 'Chương trình thưởng dành cho nhân viên HR/Admin',
    position: 'HR/Admin Staff',
    year: 2024,
    frequency: 'quarterly',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    monthlyRewards: [],
    quarterlyRewards: [
      createRewardCriteria(
        'Thưởng hồ sơ nhân sự',
        'Thưởng cho việc quản lý hồ sơ nhân sự đầy đủ',
        'fixed',
        300000,
        undefined,
        'quarterly',
        [{ metric: 'personnel_records_accuracy', operator: 'gte', value: 95, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng bảng lương',
        'Thưởng cho việc xử lý bảng lương chính xác và đúng hạn',
        'fixed',
        300000,
        undefined,
        'quarterly',
        [{ metric: 'payroll_accuracy_rate', operator: 'gte', value: 98, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng tuân thủ',
        'Thưởng cho việc tuân thủ quy định',
        'fixed',
        200000,
        undefined,
        'quarterly',
        [{ metric: 'compliance_rate', operator: 'gte', value: 95, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng sáng kiến',
        'Thưởng cho các sáng kiến cải tiến quy trình',
        'fixed',
        200000,
        undefined,
        'quarterly',
        [{ metric: 'improvement_initiatives_submitted', operator: 'gte', value: 1, unit: 'initiatives' }]
      )
    ],
    annualRewards: [
      createRewardCriteria(
        'Thưởng không vi phạm tuân thủ',
        'Thưởng 1-2 triệu nếu không có vi phạm tuân thủ',
        'variable',
        1500000,
        2000000,
        'annually',
        [{ metric: 'compliance_violations', operator: 'eq', value: 0, unit: 'violations' }]
      ),
      createRewardCriteria(
        'Thưởng cải tiến hệ thống',
        'Thưởng 2-5 triệu cho cải tiến hệ thống HR',
        'variable',
        3500000,
        5000000,
        'annually',
        [{ metric: 'system_improvements_implemented', operator: 'gte', value: 2, unit: 'improvements' }]
      ),
      createRewardCriteria(
        'Lương tháng 13',
        'Thưởng lương tháng 13 hàng năm',
        'percentage',
        100,
        undefined,
        'annually',
        [{ metric: 'annual_performance_rating', operator: 'gte', value: 3, unit: 'rating' }]
      )
    ],
    penalties: [
      createPenaltyCriteria(
        'Phạt chậm trả lương',
        'Phạt 300,000 VND nếu chậm trả lương',
        'fixed',
        300000,
        'incident',
        'high',
        [{ metric: 'late_salary_payments', operator: 'gt', value: 0, unit: 'incidents' }]
      ),
      createPenaltyCriteria(
        'Phạt nộp hồ sơ muộn',
        'Phạt 200,000 VND nếu nộp hồ sơ muộn',
        'fixed',
        200000,
        'incident',
        'medium',
        [{ metric: 'late_document_submissions', operator: 'gt', value: 0, unit: 'incidents' }]
      )
    ]
  },

  // 7. Accountant (Kế Toán)
  {
    name: 'Chương trình thưởng Kế toán',
    description: 'Chương trình thưởng dành cho nhân viên kế toán',
    position: 'Accountant',
    year: 2024,
    frequency: 'quarterly',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    monthlyRewards: [],
    quarterlyRewards: [
      createRewardCriteria(
        'Thưởng báo cáo',
        'Thưởng cho việc lập báo cáo tài chính đầy đủ và đúng hạn',
        'fixed',
        300000,
        undefined,
        'quarterly',
        [{ metric: 'financial_reports_accuracy', operator: 'gte', value: 95, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng đối chiếu',
        'Thưởng cho việc đối chiếu tài khoản chính xác',
        'fixed',
        300000,
        undefined,
        'quarterly',
        [{ metric: 'account_reconciliation_accuracy', operator: 'gte', value: 98, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng tiết kiệm chi phí',
        'Thưởng cho việc tiết kiệm chi phí',
        'fixed',
        200000,
        undefined,
        'quarterly',
        [{ metric: 'cost_saving_initiatives', operator: 'gte', value: 1, unit: 'initiatives' }]
      ),
      createRewardCriteria(
        'Thưởng khai thuế',
        'Thưởng cho việc khai thuế đúng hạn và chính xác',
        'fixed',
        300000,
        undefined,
        'quarterly',
        [{ metric: 'tax_filing_accuracy', operator: 'gte', value: 100, unit: '%' }]
      )
    ],
    annualRewards: [
      createRewardCriteria(
        'Thưởng kiểm toán tốt',
        'Thưởng 2-5 triệu cho kết quả kiểm toán tốt',
        'variable',
        3500000,
        5000000,
        'annually',
        [{ metric: 'audit_rating', operator: 'gte', value: 4, unit: 'rating' }]
      ),
      createRewardCriteria(
        'Thưởng tiết kiệm dự báo',
        'Thưởng 1-2 triệu VND cho tiết kiệm dự báo',
        'variable',
        1500000,
        2000000,
        'annually',
        [{ metric: 'budget_variance_favorable', operator: 'gte', value: 5, unit: '%' }]
      ),
      createRewardCriteria(
        'Lương tháng 13',
        'Thưởng lương tháng 13 hàng năm',
        'percentage',
        100,
        undefined,
        'annually',
        [{ metric: 'annual_performance_rating', operator: 'gte', value: 3, unit: 'rating' }]
      )
    ],
    penalties: [
      createPenaltyCriteria(
        'Phạt thuế muộn',
        'Phạt 300,000 VND nếu thuế nộp muộn',
        'fixed',
        300000,
        'incident',
        'high',
        [{ metric: 'late_tax_submissions', operator: 'gt', value: 0, unit: 'incidents' }]
      ),
      createPenaltyCriteria(
        'Phạt chênh lệch tiền mặt/ngân hàng',
        'Phạt 200,000 VND cho chênh lệch tiền mặt/ngân hàng',
        'fixed',
        200000,
        'incident',
        'medium',
        [{ metric: 'cash_bank_discrepancies', operator: 'gt', value: 0, unit: 'discrepancies' }]
      )
    ]
  }
];

// KPI definitions for each position
export const kpiDefinitions: Omit<Kpi, 'id'>[] = [
  // IT Staff KPIs
  createKpi(
    'Thời gian hoạt động hệ thống',
    'Tỷ lệ thời gian hoạt động của hệ thống',
    'IT',
    '%',
    'monthly',
    99,
    'system_performance',
    'system_performance'
  ),
  createKpi(
    'Tỷ lệ hoàn thành sao lưu',
    'Tỷ lệ thành công của các tác vụ sao lưu',
    'IT',
    '%',
    'monthly',
    95,
    'data_management',
    'data_management'
  ),
  createKpi(
    'Số công việc sửa chữa hoàn thành',
    'Số lượng công việc sửa chữa được hoàn thành',
    'IT',
    'jobs',
    'monthly',
    5,
    'maintenance',
    'maintenance'
  ),

  // Marketing KPIs
  createKpi(
    'Số khách hàng tiềm năng thu được',
    'Số lượng khách hàng tiềm năng mới thu thập được',
    'Marketing',
    'customers',
    'monthly',
    50,
    'lead_generation',
    'lead_generation'
  ),
  createKpi(
    'Số khoản vay xử lý',
    'Số lượng khoản vay được xử lý thành công',
    'Marketing',
    'loans',
    'monthly',
    20,
    'loan_processing',
    'loan_processing'
  ),
  createKpi(
    'Tỷ lệ thành công chiến dịch viral',
    'Tỷ lệ thành công của chiến dịch marketing viral',
    'Marketing',
    '%',
    'quarterly',
    70,
    'campaign_effectiveness',
    'campaign_effectiveness'
  ),

  // Customer Service KPIs
  createKpi(
    'Điểm phục vụ khách hàng hàng tháng',
    'Điểm đánh giá chất lượng phục vụ khách hàng',
    'Customer Service',
    'points',
    'monthly',
    80,
    'service_quality',
    'service_quality'
  ),
  createKpi(
    'Số lỗi chứng từ',
    'Số lượng lỗi trong xử lý chứng từ',
    'Customer Service',
    'errors',
    'monthly',
    0,
    'accuracy',
    'accuracy'
  ),

  // Credit Appraisal KPIs
  createKpi(
    'Điểm thẩm định hàng tháng',
    'Điểm đánh giá chất lượng thẩm định tín dụng',
    'Credit',
    'points',
    'monthly',
    80,
    'appraisal_quality',
    'appraisal_quality'
  ),
  createKpi(
    'Tỷ lệ nợ xấu',
    'Tỷ lệ phần trăm nợ xấu trong danh mục',
    'Credit',
    '%',
    'quarterly',
    5,
    'risk_management',
    'risk_management'
  ),

  // HR/Admin KPIs
  createKpi(
    'Độ chính xác hồ sơ nhân sự',
    'Tỷ lệ chính xác của hồ sơ nhân sự',
    'HR',
    '%',
    'monthly',
    95,
    'data_accuracy',
    'data_accuracy'
  ),
  createKpi(
    'Tỷ lệ chính xác bảng lương',
    'Tỷ lệ chính xác trong xử lý bảng lương',
    'HR',
    '%',
    'monthly',
    98,
    'payroll_accuracy',
    'payroll_accuracy'
  ),

  // Accounting KPIs
  createKpi(
    'Độ chính xác báo cáo tài chính',
    'Tỷ lệ chính xác của báo cáo tài chính',
    'Accounting',
    '%',
    'monthly',
    95,
    'financial_reporting',
    'financial_reporting'
  ),
  createKpi(
    'Độ chính xác đối chiếu tài khoản',
    'Tỷ lệ chính xác trong đối chiếu tài khoản',
    'Accounting',
    '%',
    'monthly',
    98,
    'reconciliation',
    'reconciliation'
  ),
  createKpi(
    'Độ chính xác khai thuế',
    'Tỷ lệ chính xác trong khai báo thuế',
    'Accounting',
    '%',
    'quarterly',
    100,
    'tax_compliance',
    'tax_compliance'
  )
];
