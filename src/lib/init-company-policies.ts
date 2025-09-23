import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Helper function để tạo ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper function để tạo reward criteria
const createRewardCriteria = (
  name: string,
  description: string,
  type: 'fixed' | 'variable' | 'percentage',
  value: number,
  maxValue: number | null,
  frequency: 'monthly' | 'quarterly' | 'annually',
  conditions: Array<{
    metric: string;
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'range';
    value: number | string;
    secondValue?: number;
    unit?: string;
  }>
) => ({
  id: generateId(),
  name,
  description,
  type,
  value,
  maxValue,
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

// Helper function để tạo penalty criteria
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
) => ({
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

// Helper function để tạo KPI
const createKpi = (
  name: string,
  description: string,
  department: string,
  unit: string,
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually',
  target: number,
  type: string,
  category: string,
  reward?: number,
  penalty?: number,
  customId?: string
) => ({
  id: customId || generateId(),
  name,
  description,
  department,
  unit,
  frequency,
  target,
  type,
  category,
  weight: 1,
  reward: reward || 0,
  penalty: penalty || 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Dữ liệu phòng ban
const departments = [
  {
    id: 'it',
    name: 'IT',
    description: 'Phòng Công nghệ thông tin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Phòng Marketing',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    description: 'Phòng Chăm sóc khách hàng',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'credit',
    name: 'Credit',
    description: 'Phòng Thẩm định tín dụng',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'hr',
    name: 'HR/Admin',
    description: 'Phòng Hành chính - Nhân sự',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'accounting',
    name: 'Accounting',
    description: 'Phòng Kế toán',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Dữ liệu Reward Programs theo chính sách của công ty
const rewardPrograms = [
  // 1. Nhân viên IT
  {
    id: generateId(),
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
        'Thưởng hệ thống chạy ổn định',
        'Thưởng 300k cho việc duy trì hệ thống chạy ổn định',
        'fixed',
        300000,
        null,
        'quarterly',
        [{ metric: 'system_uptime_percentage', operator: 'gte', value: 99, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng sao lưu dữ liệu',
        'Thưởng 200k cho việc thực hiện sao lưu định kỳ',
        'fixed',
        200000,
        null,
        'quarterly',
        [{ metric: 'backup_completion_rate', operator: 'gte', value: 95, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng công việc sửa chữa',
        'Thưởng 200k cho mỗi lần sửa chữa hoàn thành',
        'variable',
        200000,
        null,
        'quarterly',
        [{ metric: 'repair_jobs_completed', operator: 'gt', value: 0, unit: 'jobs' }]
      ),
      createRewardCriteria(
        'Thưởng báo cáo',
        'Thưởng 300k cho việc nộp báo cáo đầy đủ và đúng hạn',
        'fixed',
        300000,
        null,
        'quarterly',
        [{ metric: 'reports_submitted_on_time', operator: 'gte', value: 90, unit: '%' }]
      )
    ],
    annualRewards: [
      createRewardCriteria(
        'Thưởng cải tiến hoạt động',
        'Thưởng 2-5 triệu cho các sáng kiến cải tiến hoạt động IT',
        'variable',
        3500000,
        5000000,
        'annually',
        [{ metric: 'improvement_initiatives_implemented', operator: 'gte', value: 2, unit: 'initiatives' }]
      ),
      createRewardCriteria(
        'Thưởng kiểm toán và phân tích',
        'Thưởng 1-2 triệu cho công tác kiểm toán và phân tích hệ thống',
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
        null,
        'annually',
        [{ metric: 'annual_performance_rating', operator: 'gte', value: 3, unit: 'rating' }]
      )
    ],
    penalties: [
      createPenaltyCriteria(
        'Phạt hệ thống downtime',
        'Phạt 300k khi hệ thống bị downtime',
        'fixed',
        300000,
        'incident',
        'high',
        [{ metric: 'system_downtime_incidents', operator: 'gt', value: 0, unit: 'incidents' }]
      ),
      createPenaltyCriteria(
        'Phạt nhật ký không đầy đủ',
        'Phạt 500k khi nhật ký không được ghi đầy đủ',
        'fixed',
        500000,
        'quarterly',
        'medium',
        [{ metric: 'incomplete_logs_percentage', operator: 'gt', value: 10, unit: '%' }]
      )
    ]
  },

  // 2. Trưởng bộ phận Marketing
  {
    id: generateId(),
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
        'Thưởng 500k khi có trên 50 khách hàng tiềm năng',
        'fixed',
        500000,
        null,
        'quarterly',
        [{ metric: 'potential_customers_acquired', operator: 'gt', value: 50, unit: 'customers' }]
      ),
      createRewardCriteria(
        'Thưởng khoản vay',
        'Thưởng 100k cho mỗi 10 khoản vay',
        'variable',
        100000,
        null,
        'quarterly',
        [{ metric: 'loans_processed', operator: 'gte', value: 10, unit: 'loans' }]
      ),
      createRewardCriteria(
        'Thưởng chiến dịch viral',
        'Thưởng 1-3 triệu cho chiến dịch marketing viral thành công',
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
        'Thưởng 1% dư nợ cho vay (tối đa 6 triệu/quý)',
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
        null,
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
        'Phạt 500k khi có khách hàng tiềm năng giả mạo',
        'fixed',
        500000,
        'incident',
        'high',
        [{ metric: 'fake_potential_customers', operator: 'gt', value: 0, unit: 'customers' }]
      )
    ]
  },

  // 3. Trợ lý Marketing
  {
    id: generateId(),
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
        'Thưởng 200k khi có đủ 50 khách hàng tiềm năng',
        'fixed',
        200000,
        null,
        'quarterly',
        [{ metric: 'potential_customers_acquired', operator: 'gte', value: 50, unit: 'customers' }]
      ),
      createRewardCriteria(
        'Thưởng khoản vay',
        'Thưởng 50k cho mỗi 10 khoản vay',
        'variable',
        50000,
        null,
        'quarterly',
        [{ metric: 'loans_processed', operator: 'gte', value: 10, unit: 'loans' }]
      )
    ],
    annualRewards: [
      createRewardCriteria(
        'Thưởng dư nợ cho vay',
        'Thưởng 0.5% dư nợ cho vay (tối đa 3 triệu/quý)',
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
        null,
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

  // 4. CSO - Chăm sóc khách hàng
  {
    id: generateId(),
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
        null,
        'annually',
        [{ metric: 'annual_performance_rating', operator: 'gte', value: 3, unit: 'rating' }]
      ),
      createRewardCriteria(
        'Thưởng theo lợi nhuận công ty',
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
        'Phạt sai chứng từ',
        'Phạt 500k cho mỗi lỗi chứng từ',
        'fixed',
        500000,
        'incident',
        'medium',
        [{ metric: 'document_errors', operator: 'gt', value: 0, unit: 'errors' }]
      ),
      createPenaltyCriteria(
        'Cảnh cáo bỏ lỡ chăm sóc khách hàng',
        'Cảnh cáo nếu bỏ lỡ việc chăm sóc khách hàng',
        'warning',
        0,
        'incident',
        'low',
        [{ metric: 'missed_customer_followups', operator: 'gt', value: 0, unit: 'followups' }]
      )
    ]
  },

  // 5. CA - Thẩm định tín dụng
  {
    id: generateId(),
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
        'Thưởng top 10 nhân viên xuất sắc',
        'Thưởng 5 triệu cho top 10 CA có điểm cao nhất',
        'fixed',
        5000000,
        null,
        'annually',
        [{ metric: 'annual_ranking', operator: 'lte', value: 10, unit: 'rank' }]
      ),
      createRewardCriteria(
        'Lương tháng 13',
        'Thưởng lương tháng 13 hàng năm',
        'percentage',
        100,
        null,
        'annually',
        [{ metric: 'annual_performance_rating', operator: 'gte', value: 3, unit: 'rating' }]
      )
    ],
    penalties: [
      createPenaltyCriteria(
        'Phạt tỷ lệ nợ xấu cao',
        'Phạt 500k VND nếu tỷ lệ nợ xấu > 10%',
        'fixed',
        500000,
        'annually',
        'high',
        [{ metric: 'npl_ratio', operator: 'gt', value: 10, unit: '%' }]
      ),
      createPenaltyCriteria(
        'Phạt thiếu nhật ký thu hồi nợ',
        'Phạt 200k VND cho nhật ký thu hồi nợ không đầy đủ',
        'fixed',
        200000,
        'quarterly',
        'medium',
        [{ metric: 'debt_collection_log_compliance', operator: 'lt', value: 90, unit: '%' }]
      )
    ]
  },

  // 6. HR/Admin - Hành chính nhân sự
  {
    id: generateId(),
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
        'Thưởng 300k cho việc quản lý hồ sơ nhân sự đầy đủ',
        'fixed',
        300000,
        null,
        'quarterly',
        [{ metric: 'personnel_records_accuracy', operator: 'gte', value: 95, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng bảng lương',
        'Thưởng 300k cho việc xử lý bảng lương chính xác và đúng hạn',
        'fixed',
        300000,
        null,
        'quarterly',
        [{ metric: 'payroll_accuracy_rate', operator: 'gte', value: 98, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng tuân thủ',
        'Thưởng 200k cho việc tuân thủ quy định',
        'fixed',
        200000,
        null,
        'quarterly',
        [{ metric: 'compliance_rate', operator: 'gte', value: 95, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng sáng kiến',
        'Thưởng 200k cho các sáng kiến cải tiến quy trình',
        'fixed',
        200000,
        null,
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
        null,
        'annually',
        [{ metric: 'annual_performance_rating', operator: 'gte', value: 3, unit: 'rating' }]
      )
    ],
    penalties: [
      createPenaltyCriteria(
        'Phạt chậm trả lương',
        'Phạt 300k VND nếu chậm trả lương',
        'fixed',
        300000,
        'incident',
        'high',
        [{ metric: 'late_salary_payments', operator: 'gt', value: 0, unit: 'incidents' }]
      ),
      createPenaltyCriteria(
        'Phạt nộp hồ sơ muộn',
        'Phạt 200k VND nếu nộp hồ sơ muộn',
        'fixed',
        200000,
        'incident',
        'medium',
        [{ metric: 'late_document_submissions', operator: 'gt', value: 0, unit: 'incidents' }]
      )
    ]
  },

  // 7. Kế toán
  {
    id: generateId(),
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
        'Thưởng 300k cho việc lập báo cáo tài chính đầy đủ và đúng hạn',
        'fixed',
        300000,
        null,
        'quarterly',
        [{ metric: 'financial_reports_accuracy', operator: 'gte', value: 95, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng đối chiếu',
        'Thưởng 300k cho việc đối chiếu tài khoản chính xác',
        'fixed',
        300000,
        null,
        'quarterly',
        [{ metric: 'account_reconciliation_accuracy', operator: 'gte', value: 98, unit: '%' }]
      ),
      createRewardCriteria(
        'Thưởng tiết kiệm chi phí',
        'Thưởng 200k cho việc tiết kiệm chi phí',
        'fixed',
        200000,
        null,
        'quarterly',
        [{ metric: 'cost_saving_initiatives', operator: 'gte', value: 1, unit: 'initiatives' }]
      ),
      createRewardCriteria(
        'Thưởng khai thuế',
        'Thưởng 300k cho việc khai thuế đúng hạn và chính xác',
        'fixed',
        300000,
        null,
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
        null,
        'annually',
        [{ metric: 'annual_performance_rating', operator: 'gte', value: 3, unit: 'rating' }]
      )
    ],
    penalties: [
      createPenaltyCriteria(
        'Phạt nộp thuế muộn',
        'Phạt 300k VND nếu thuế nộp muộn',
        'fixed',
        300000,
        'incident',
        'high',
        [{ metric: 'late_tax_submissions', operator: 'gt', value: 0, unit: 'incidents' }]
      ),
      createPenaltyCriteria(
        'Phạt chênh lệch tiền mặt/ngân hàng',
        'Phạt 200k VND cho chênh lệch tiền mặt/ngân hàng',
        'fixed',
        200000,
        'incident',
        'medium',
        [{ metric: 'cash_bank_discrepancies', operator: 'gt', value: 0, unit: 'discrepancies' }]
      )
    ]
  }
];

// Dữ liệu KPI definitions cho từng vị trí
const kpiDefinitions = [
  // IT Staff KPIs
  createKpi(
    'Thời gian hoạt động hệ thống',
    'Tỷ lệ thời gian hoạt động của hệ thống',
    'IT',
    '%',
    'monthly',
    99,
    'system_performance',
    'system_performance',
    300000,
    300000,
    'kpi_system_uptime'
  ),
  createKpi(
    'Tỷ lệ hoàn thành sao lưu',
    'Tỷ lệ thành công của các tác vụ sao lưu',
    'IT',
    '%',
    'monthly',
    95,
    'data_management',
    'data_management',
    200000,
    0,
    'kpi_bug_resolution'
  ),
  createKpi(
    'Số công việc sửa chữa hoàn thành',
    'Số lượng công việc sửa chữa được hoàn thành',
    'IT',
    'jobs',
    'monthly',
    5,
    'maintenance',
    'maintenance',
    200000,
    0,
    'kpi_repair_jobs'
  ),
  createKpi(
    'Tỷ lệ báo cáo đúng hạn',
    'Tỷ lệ báo cáo được nộp đúng hạn',
    'IT',
    '%',
    'quarterly',
    90,
    'reporting',
    'reporting',
    300000,
    0,
    'kpi_report_timeliness'
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
    'lead_generation',
    500000,
    0,
    'kpi_customer_acquisition'
  ),
  createKpi(
    'Số khoản vay xử lý',
    'Số lượng khoản vay được xử lý thành công',
    'Marketing',
    'loans',
    'monthly',
    20,
    'loan_processing',
    'loan_processing',
    100000,
    0,
    'kpi_loan_processing'
  ),
  createKpi(
    'Tỷ lệ thành công chiến dịch viral',
    'Tỷ lệ thành công của chiến dịch marketing viral',
    'Marketing',
    '%',
    'quarterly',
    70,
    'campaign_effectiveness',
    'campaign_effectiveness',
    2000000,
    0,
    'kpi_campaign_success'
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
    'service_quality',
    50000,
    0,
    'kpi_customer_satisfaction'
  ),
  createKpi(
    'Thời gian phản hồi',
    'Thời gian trung bình phản hồi khách hàng',
    'Customer Service',
    'hours',
    'monthly',
    2,
    'response_time',
    'response_time',
    0,
    0,
    'kpi_response_time'
  ),

  // Credit Appraisal KPIs
  createKpi(
    'Tỷ lệ phê duyệt khoản vay',
    'Tỷ lệ phần trăm khoản vay được phê duyệt',
    'Credit',
    '%',
    'monthly',
    75,
    'loan_approval',
    'loan_approval',
    100000,
    0,
    'kpi_loan_approval_rate'
  ),
  createKpi(
    'Độ chính xác đánh giá rủi ro',
    'Tỷ lệ chính xác trong đánh giá rủi ro tín dụng',
    'Credit',
    '%',
    'monthly',
    90,
    'risk_assessment',
    'risk_assessment',
    0,
    0,
    'kpi_risk_assessment'
  ),

  // HR/Admin KPIs
  createKpi(
    'Tỷ lệ thành công tuyển dụng',
    'Tỷ lệ thành công trong quá trình tuyển dụng',
    'HR',
    '%',
    'monthly',
    85,
    'recruitment',
    'recruitment',
    300000,
    0,
    'kpi_recruitment_success'
  ),
  createKpi(
    'Tỷ lệ giữ chân nhân viên',
    'Tỷ lệ nhân viên ở lại công ty',
    'HR',
    '%',
    'monthly',
    95,
    'retention',
    'retention',
    300000,
    0,
    'kpi_employee_retention'
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
    'financial_reporting',
    300000,
    0,
    'kpi_financial_accuracy'
  ),
  createKpi(
    'Tỷ lệ báo cáo đúng hạn',
    'Tỷ lệ báo cáo được nộp đúng hạn',
    'Accounting',
    '%',
    'monthly',
    100,
    'report_timeliness',
    'report_timeliness',
    300000,
    0,
    'kpi_report_timeliness'
  ),
  createKpi(
    'Số sáng kiến tiết kiệm chi phí',
    'Số lượng sáng kiến tiết kiệm chi phí',
    'Accounting',
    'initiatives',
    'quarterly',
    1,
    'cost_saving',
    'cost_saving',
    200000,
    0
  )
];

// Function để khởi tạo dữ liệu
export const initializeCompanyPolicies = async () => {
  try {
    console.log('Bắt đầu khởi tạo dữ liệu chính sách công ty...');

    // 1. Tạo các phòng ban
    console.log('Tạo các phòng ban...');
    for (const dept of departments) {
      await setDoc(doc(db, 'departments', dept.id), dept);
      console.log(`✓ Đã tạo phòng ban: ${dept.name}`);
    }

    // 2. Tạo các Reward Programs
    console.log('Tạo các chương trình thưởng...');
    for (const program of rewardPrograms) {
      await setDoc(doc(db, 'rewardPrograms', program.id), program);
      console.log(`✓ Đã tạo chương trình thưởng: ${program.name}`);
    }

    // 3. Tạo các KPI definitions
    console.log('Tạo các định nghĩa KPI...');
    for (const kpi of kpiDefinitions) {
      await setDoc(doc(db, 'kpis', kpi.id), kpi);
      console.log(`✓ Đã tạo KPI: ${kpi.name}`);
    }

    console.log('🎉 Hoàn thành khởi tạo dữ liệu chính sách công ty!');
    console.log(`📊 Tổng cộng:`);
    console.log(`   - ${departments.length} phòng ban`);
    console.log(`   - ${rewardPrograms.length} chương trình thưởng`);
    console.log(`   - ${kpiDefinitions.length} định nghĩa KPI`);

    return {
      success: true,
      departments: departments.length,
      rewardPrograms: rewardPrograms.length,
      kpis: kpiDefinitions.length
    };

  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo dữ liệu:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Export dữ liệu để có thể sử dụng ở nơi khác
export { departments, rewardPrograms, kpiDefinitions };
