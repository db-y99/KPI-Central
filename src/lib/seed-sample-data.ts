import { writeBatch, doc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { initializeCompanyPolicies } from './init-company-policies';
import { resetSystem } from './init-system';

// Helper function để tạo ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Sample employees data - Updated with correct IDs and better data
const sampleEmployees = [
  // IT Staff (2 employees)
  {
    id: 'it_001',
    uid: 'it_001',
    email: 'it.staff1@y99.vn',
    username: 'itstaff1',
    name: 'Nguyễn Văn An',
    position: 'IT Staff',
    departmentId: 'it',
    avatar: '',
    role: 'employee' as const,
    phone: '0901234567',
    address: 'Hà Nội',
    startDate: '2024-01-15',
    employeeId: 'EMP001',
    isActive: true,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 'it_002',
    uid: 'it_002',
    email: 'it.staff2@y99.vn',
    username: 'itstaff2',
    name: 'Trần Thị Bình',
    position: 'IT Staff',
    departmentId: 'it',
    avatar: '',
    role: 'employee' as const,
    phone: '0901234568',
    address: 'TP.HCM',
    startDate: '2024-02-01',
    employeeId: 'EMP002',
    isActive: true,
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z'
  },
  // Head of Marketing (1 employee)
  {
    id: 'marketing_001',
    uid: 'marketing_001',
    email: 'marketing.head@y99.vn',
    username: 'marketinghead',
    name: 'Lê Văn Cường',
    position: 'Head of Marketing',
    departmentId: 'marketing',
    avatar: '',
    role: 'employee' as const,
    phone: '0901234569',
    address: 'Hà Nội',
    startDate: '2024-01-01',
    employeeId: 'EMP003',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  // Marketing Assistant (2 employees)
  {
    id: 'marketing_002',
    uid: 'marketing_002',
    email: 'marketing.assistant1@y99.vn',
    username: 'marketingassistant1',
    name: 'Phạm Thị Dung',
    position: 'Marketing Assistant',
    departmentId: 'marketing',
    avatar: '',
    role: 'employee' as const,
    phone: '0901234570',
    address: 'Hà Nội',
    startDate: '2024-03-01',
    employeeId: 'EMP004',
    isActive: true,
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2024-03-01T00:00:00.000Z'
  },
  {
    id: 'marketing_003',
    uid: 'marketing_003',
    email: 'marketing.assistant2@y99.vn',
    username: 'marketingassistant2',
    name: 'Hoàng Văn Em',
    position: 'Marketing Assistant',
    departmentId: 'marketing',
    avatar: '',
    role: 'employee' as const,
    phone: '0901234571',
    address: 'TP.HCM',
    startDate: '2024-03-15',
    employeeId: 'EMP005',
    isActive: true,
    createdAt: '2024-03-15T00:00:00.000Z',
    updatedAt: '2024-03-15T00:00:00.000Z'
  },
  // Customer Service Officer (2 employees)
  {
    id: 'cs_001',
    uid: 'cs_001',
    email: 'cs.officer1@y99.vn',
    username: 'csofficer1',
    name: 'Vũ Thị Phương',
    position: 'Customer Service Officer',
    departmentId: 'customer-service',
    avatar: '',
    role: 'employee' as const,
    phone: '0901234572',
    address: 'Hà Nội',
    startDate: '2024-02-15',
    employeeId: 'EMP006',
    isActive: true,
    createdAt: '2024-02-15T00:00:00.000Z',
    updatedAt: '2024-02-15T00:00:00.000Z'
  },
  {
    id: 'cs_002',
    uid: 'cs_002',
    email: 'cs.officer2@y99.vn',
    username: 'csofficer2',
    name: 'Đặng Văn Giang',
    position: 'Customer Service Officer',
    departmentId: 'customer-service',
    avatar: '',
    role: 'employee' as const,
    phone: '0901234573',
    address: 'TP.HCM',
    startDate: '2024-04-01',
    employeeId: 'EMP007',
    isActive: true,
    createdAt: '2024-04-01T00:00:00.000Z',
    updatedAt: '2024-04-01T00:00:00.000Z'
  },
  // Credit Appraisal Staff (2 employees)
  {
    id: 'credit_001',
    uid: 'credit_001',
    email: 'credit.staff1@y99.vn',
    username: 'creditstaff1',
    name: 'Bùi Thị Hoa',
    position: 'Credit Appraisal Staff',
    departmentId: 'credit',
    avatar: '',
    role: 'employee' as const,
    phone: '0901234574',
    address: 'Hà Nội',
    startDate: '2024-01-20',
    employeeId: 'EMP008',
    isActive: true,
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z'
  },
  {
    id: 'credit_002',
    uid: 'credit_002',
    email: 'credit.staff2@y99.vn',
    username: 'creditstaff2',
    name: 'Ngô Văn Inh',
    position: 'Credit Appraisal Staff',
    departmentId: 'credit',
    avatar: '',
    role: 'employee' as const,
    phone: '0901234575',
    address: 'TP.HCM',
    startDate: '2024-03-01',
    employeeId: 'EMP009',
    isActive: true,
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2024-03-01T00:00:00.000Z'
  },
  // HR/Admin Staff (2 employees)
  {
    id: 'hr_001',
    uid: 'hr_001',
    email: 'hr.staff1@y99.vn',
    username: 'hrstaff1',
    name: 'Lý Thị Kim',
    position: 'HR/Admin Staff',
    departmentId: 'hr',
    avatar: '',
    role: 'employee' as const,
    phone: '0901234576',
    address: 'Hà Nội',
    startDate: '2024-01-10',
    employeeId: 'EMP010',
    isActive: true,
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z'
  },
  {
    id: 'hr_002',
    uid: 'hr_002',
    email: 'hr.staff2@y99.vn',
    username: 'hrstaff2',
    name: 'Phan Văn Long',
    position: 'HR/Admin Staff',
    departmentId: 'hr',
    avatar: '',
    role: 'employee' as const,
    phone: '0901234577',
    address: 'TP.HCM',
    startDate: '2024-02-20',
    employeeId: 'EMP011',
    isActive: true,
    createdAt: '2024-02-20T00:00:00.000Z',
    updatedAt: '2024-02-20T00:00:00.000Z'
  },
  // Accountant (2 employees)
  {
    id: 'accounting_001',
    uid: 'accounting_001',
    email: 'accountant1@y99.vn',
    username: 'accountant1',
    name: 'Trịnh Thị Mai',
    position: 'Accountant',
    departmentId: 'accounting',
    avatar: '',
    role: 'employee' as const,
    phone: '0901234578',
    address: 'Hà Nội',
    startDate: '2024-01-05',
    employeeId: 'EMP012',
    isActive: true,
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z'
  },
  {
    id: 'accounting_002',
    uid: 'accounting_002',
    email: 'accountant2@y99.vn',
    username: 'accountant2',
    name: 'Võ Văn Nam',
    position: 'Accountant',
    departmentId: 'accounting',
    avatar: '',
    role: 'employee' as const,
    phone: '0901234579',
    address: 'TP.HCM',
    startDate: '2024-02-01',
    employeeId: 'EMP013',
    isActive: true,
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z'
  }
];

// Sample KPI Records data - Updated with correct employee IDs
const sampleKpiRecords = [
  // IT Staff KPI Records
  {
    id: generateId(),
    kpiId: 'kpi_system_uptime',
    employeeId: 'it_001',
    target: 99.5,
    actual: 99.8,
    targetValue: 99.5,
    actualValue: 99.8,
    period: '2024-12',
    notes: 'System uptime exceeded target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_bug_resolution',
    employeeId: 'it_001',
    target: 95,
    actual: 98,
    targetValue: 95,
    actualValue: 98,
    period: '2024-12',
    notes: 'Excellent bug resolution rate',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_system_uptime',
    employeeId: 'it_002',
    target: 99.5,
    actual: 99.2,
    targetValue: 99.5,
    actualValue: 99.2,
    period: '2024-12',
    notes: 'System uptime slightly below target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_repair_jobs',
    employeeId: 'it_002',
    target: 5,
    actual: 7,
    targetValue: 5,
    actualValue: 7,
    period: '2024-12',
    notes: 'Exceeded repair jobs target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_report_timeliness',
    employeeId: 'it_001',
    target: 90,
    actual: 95,
    targetValue: 90,
    actualValue: 95,
    period: '2024-12',
    notes: 'Excellent report submission rate',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },

  // Marketing KPI Records
  {
    id: generateId(),
    kpiId: 'kpi_customer_acquisition',
    employeeId: 'marketing_001',
    target: 100,
    actual: 120,
    targetValue: 100,
    actualValue: 120,
    period: '2024-12',
    notes: 'Exceeded customer acquisition target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_campaign_success',
    employeeId: 'marketing_001',
    target: 80,
    actual: 85,
    targetValue: 80,
    actualValue: 85,
    period: '2024-12',
    notes: 'Campaign success rate above target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_customer_acquisition',
    employeeId: 'marketing_002',
    target: 50,
    actual: 45,
    targetValue: 50,
    actualValue: 45,
    period: '2024-12',
    notes: 'Customer acquisition slightly below target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_loan_processing',
    employeeId: 'marketing_002',
    target: 20,
    actual: 25,
    targetValue: 20,
    actualValue: 25,
    period: '2024-12',
    notes: 'Exceeded loan processing target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_customer_acquisition',
    employeeId: 'marketing_003',
    target: 50,
    actual: 55,
    targetValue: 50,
    actualValue: 55,
    period: '2024-12',
    notes: 'Exceeded customer acquisition target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_loan_processing',
    employeeId: 'marketing_003',
    target: 20,
    actual: 18,
    targetValue: 20,
    actualValue: 18,
    period: '2024-12',
    notes: 'Loan processing slightly below target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },

  // Customer Service KPI Records
  {
    id: generateId(),
    kpiId: 'kpi_customer_satisfaction',
    employeeId: 'cs_001',
    target: 4.5,
    actual: 4.7,
    targetValue: 4.5,
    actualValue: 4.7,
    period: '2024-12',
    notes: 'High customer satisfaction score',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_response_time',
    employeeId: 'cs_001',
    target: 2,
    actual: 1.5,
    targetValue: 2,
    actualValue: 1.5,
    period: '2024-12',
    notes: 'Response time faster than target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_customer_satisfaction',
    employeeId: 'cs_002',
    target: 4.5,
    actual: 4.3,
    targetValue: 4.5,
    actualValue: 4.3,
    period: '2024-12',
    notes: 'Customer satisfaction below target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_response_time',
    employeeId: 'cs_002',
    target: 2,
    actual: 2.2,
    targetValue: 2,
    actualValue: 2.2,
    period: '2024-12',
    notes: 'Response time slightly above target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },

  // Credit Appraisal KPI Records
  {
    id: generateId(),
    kpiId: 'kpi_loan_approval_rate',
    employeeId: 'credit_001',
    target: 75,
    actual: 78,
    targetValue: 75,
    actualValue: 78,
    period: '2024-12',
    notes: 'Loan approval rate above target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_risk_assessment',
    employeeId: 'credit_001',
    target: 90,
    actual: 92,
    targetValue: 90,
    actualValue: 92,
    period: '2024-12',
    notes: 'Risk assessment accuracy above target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_loan_approval_rate',
    employeeId: 'credit_002',
    target: 75,
    actual: 72,
    targetValue: 75,
    actualValue: 72,
    period: '2024-12',
    notes: 'Loan approval rate below target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_risk_assessment',
    employeeId: 'credit_002',
    target: 90,
    actual: 88,
    targetValue: 90,
    actualValue: 88,
    period: '2024-12',
    notes: 'Risk assessment accuracy below target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },

  // HR KPI Records
  {
    id: generateId(),
    kpiId: 'kpi_recruitment_success',
    employeeId: 'hr_001',
    target: 85,
    actual: 88,
    targetValue: 85,
    actualValue: 88,
    period: '2024-12',
    notes: 'Recruitment success rate above target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_employee_retention',
    employeeId: 'hr_001',
    target: 95,
    actual: 97,
    targetValue: 95,
    actualValue: 97,
    period: '2024-12',
    notes: 'Employee retention rate above target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_recruitment_success',
    employeeId: 'hr_002',
    target: 85,
    actual: 82,
    targetValue: 85,
    actualValue: 82,
    period: '2024-12',
    notes: 'Recruitment success rate below target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_employee_retention',
    employeeId: 'hr_002',
    target: 95,
    actual: 93,
    targetValue: 95,
    actualValue: 93,
    period: '2024-12',
    notes: 'Employee retention rate below target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },

  // Accounting KPI Records
  {
    id: generateId(),
    kpiId: 'kpi_financial_accuracy',
    employeeId: 'accounting_001',
    target: 99,
    actual: 99.5,
    targetValue: 99,
    actualValue: 99.5,
    period: '2024-12',
    notes: 'Financial accuracy above target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_report_timeliness',
    employeeId: 'accounting_001',
    target: 100,
    actual: 100,
    targetValue: 100,
    actualValue: 100,
    period: '2024-12',
    notes: 'All reports submitted on time',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_financial_accuracy',
    employeeId: 'accounting_002',
    target: 99,
    actual: 98.5,
    targetValue: 99,
    actualValue: 98.5,
    period: '2024-12',
    notes: 'Financial accuracy slightly below target',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  },
  {
    id: generateId(),
    kpiId: 'kpi_report_timeliness',
    employeeId: 'accounting_002',
    target: 100,
    actual: 95,
    targetValue: 100,
    actualValue: 95,
    period: '2024-12',
    notes: 'Most reports submitted on time',
    updatedAt: '2024-12-15T00:00:00.000Z',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'completed' as const
  }
];

// Sample Reports - Updated with correct employee and KPI IDs
const sampleReports = [
  // IT Staff Reports
  {
    id: generateId(),
    employeeId: 'it_001',
    kpiId: 'kpi_system_uptime',
    kpiRecordId: 'sample_kpi_record_1', // Will be set dynamically
    title: 'Báo cáo uptime hệ thống tháng 12/2024',
    description: 'Hệ thống hoạt động ổn định với thời gian uptime đạt 99.8%, vượt mục tiêu đề ra.',
    type: 'monthly' as const,
    period: '2024-12',
    actualValue: 99.8,
    targetValue: 99.5,
    unit: '%',
    files: [
      {
        id: generateId(),
        name: 'system_monitoring_report.pdf',
        url: 'https://example.com/files/system_monitoring_report.pdf',
        size: 2048576,
        type: 'application/pdf',
        uploadedAt: '2024-12-15T09:00:00.000Z',
        uploadedBy: 'it_001'
      }
    ],
    status: 'submitted' as const,
    submittedAt: '2024-12-15T10:00:00.000Z',
    createdAt: '2024-12-14T15:00:00.000Z',
    updatedAt: '2024-12-15T10:00:00.000Z',
    version: 1
  },
  {
    id: generateId(),
    employeeId: 'it_002',
    kpiId: 'kpi_repair_jobs',
    kpiRecordId: 'sample_kpi_record_2', // Will be set dynamically
    title: 'Báo cáo công việc sửa chữa tháng 12/2024',
    description: 'Đã hoàn thành 7 công việc sửa chữa, vượt mục tiêu 5 công việc đề ra.',
    type: 'monthly' as const,
    period: '2024-12',
    actualValue: 7,
    targetValue: 5,
    unit: 'công việc',
    files: [
      {
        id: generateId(),
        name: 'repair_jobs_report.xlsx',
        url: 'https://example.com/files/repair_jobs_report.xlsx',
        size: 1536000,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadedAt: '2024-12-15T11:00:00.000Z',
        uploadedBy: 'it_002'
      }
    ],
    status: 'submitted' as const,
    submittedAt: '2024-12-15T11:00:00.000Z',
    createdAt: '2024-12-14T16:00:00.000Z',
    updatedAt: '2024-12-15T11:00:00.000Z',
    version: 1
  },
  // Marketing Reports
  {
    id: generateId(),
    employeeId: 'marketing_001',
    kpiId: 'kpi_customer_acquisition',
    kpiRecordId: 'sample_kpi_record_3', // Will be set dynamically
    title: 'Báo cáo thu hút khách hàng tháng 12/2024',
    description: 'Đã thu hút được 120 khách hàng mới, vượt xa mục tiêu 100 khách hàng.',
    type: 'monthly' as const,
    period: '2024-12',
    actualValue: 120,
    targetValue: 100,
    unit: 'khách hàng',
    files: [
      {
        id: generateId(),
        name: 'customer_acquisition_report.pdf',
        url: 'https://example.com/files/customer_acquisition_report.pdf',
        size: 3072000,
        type: 'application/pdf',
        uploadedAt: '2024-12-15T12:00:00.000Z',
        uploadedBy: 'marketing_001'
      }
    ],
    status: 'submitted' as const,
    submittedAt: '2024-12-15T12:00:00.000Z',
    createdAt: '2024-12-14T17:00:00.000Z',
    updatedAt: '2024-12-15T12:00:00.000Z',
    version: 1
  },
  {
    id: generateId(),
    employeeId: 'marketing_002',
    kpiId: 'kpi_loan_processing',
    kpiRecordId: 'sample_kpi_record_4', // Will be set dynamically
    title: 'Báo cáo xử lý hồ sơ vay tháng 12/2024',
    description: 'Đã xử lý 25 hồ sơ vay, vượt mục tiêu 20 hồ sơ.',
    type: 'monthly' as const,
    period: '2024-12',
    actualValue: 25,
    targetValue: 20,
    unit: 'hồ sơ',
    files: [
      {
        id: generateId(),
        name: 'loan_processing_report.xlsx',
        url: 'https://example.com/files/loan_processing_report.xlsx',
        size: 2048000,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadedAt: '2024-12-15T13:00:00.000Z',
        uploadedBy: 'marketing_002'
      }
    ],
    status: 'submitted' as const,
    submittedAt: '2024-12-15T13:00:00.000Z',
    createdAt: '2024-12-14T18:00:00.000Z',
    updatedAt: '2024-12-15T13:00:00.000Z',
    version: 1
  },
  // Customer Service Reports
  {
    id: generateId(),
    employeeId: 'cs_001',
    kpiId: 'kpi_customer_satisfaction',
    kpiRecordId: 'sample_kpi_record_5', // Will be set dynamically
    title: 'Báo cáo mức độ hài lòng khách hàng tháng 12/2024',
    description: 'Điểm hài lòng khách hàng đạt 4.7/5.0, vượt mục tiêu 4.5.',
    type: 'monthly' as const,
    period: '2024-12',
    actualValue: 4.7,
    targetValue: 4.5,
    unit: 'điểm',
    files: [
      {
        id: generateId(),
        name: 'customer_satisfaction_survey.pdf',
        url: 'https://example.com/files/customer_satisfaction_survey.pdf',
        size: 2560000,
        type: 'application/pdf',
        uploadedAt: '2024-12-15T14:00:00.000Z',
        uploadedBy: 'cs_001'
      }
    ],
    status: 'submitted' as const,
    submittedAt: '2024-12-15T14:00:00.000Z',
    createdAt: '2024-12-14T19:00:00.000Z',
    updatedAt: '2024-12-15T14:00:00.000Z',
    version: 1
  },
  // Credit Staff Reports
  {
    id: generateId(),
    employeeId: 'credit_001',
    kpiId: 'kpi_loan_approval_rate',
    kpiRecordId: 'sample_kpi_record_6', // Will be set dynamically
    title: 'Báo cáo tỷ lệ phê duyệt khoản vay tháng 12/2024',
    description: 'Tỷ lệ phê duyệt đạt 78%, vượt mục tiêu 75%.',
    type: 'monthly' as const,
    period: '2024-12',
    actualValue: 78,
    targetValue: 75,
    unit: '%',
    files: [
      {
        id: generateId(),
        name: 'loan_approval_analysis.pdf',
        url: 'https://example.com/files/loan_approval_analysis.pdf',
        size: 3584000,
        type: 'application/pdf',
        uploadedAt: '2024-12-15T15:00:00.000Z',
        uploadedBy: 'credit_001'
      }
    ],
    status: 'submitted' as const,
    submittedAt: '2024-12-15T15:00:00.000Z',
    createdAt: '2024-12-14T20:00:00.000Z',
    updatedAt: '2024-12-15T15:00:00.000Z',
    version: 1
  },
  // HR Reports
  {
    id: generateId(),
    employeeId: 'hr_001',
    kpiId: 'kpi_recruitment_success',
    kpiRecordId: 'sample_kpi_record_7', // Will be set dynamically
    title: 'Báo cáo thành công tuyển dụng tháng 12/2024',
    description: 'Tỷ lệ thành công tuyển dụng đạt 88%, vượt mục tiêu 85%.',
    type: 'monthly' as const,
    period: '2024-12',
    actualValue: 88,
    targetValue: 85,
    unit: '%',
    files: [
      {
        id: generateId(),
        name: 'recruitment_report.pdf',
        url: 'https://example.com/files/recruitment_report.pdf',
        size: 2048000,
        type: 'application/pdf',
        uploadedAt: '2024-12-15T16:00:00.000Z',
        uploadedBy: 'hr_001'
      }
    ],
    status: 'submitted' as const,
    submittedAt: '2024-12-15T16:00:00.000Z',
    createdAt: '2024-12-14T21:00:00.000Z',
    updatedAt: '2024-12-15T16:00:00.000Z',
    version: 1
  },
  // Accounting Reports
  {
    id: generateId(),
    employeeId: 'accounting_001',
    kpiId: 'kpi_financial_accuracy',
    kpiRecordId: 'sample_kpi_record_8', // Will be set dynamically
    title: 'Báo cáo độ chính xác tài chính tháng 12/2024',
    description: 'Độ chính xác tài chính đạt 99.5%, vượt mục tiêu 99%.',
    type: 'monthly' as const,
    period: '2024-12',
    actualValue: 99.5,
    targetValue: 99,
    unit: '%',
    files: [
      {
        id: generateId(),
        name: 'financial_accuracy_audit.pdf',
        url: 'https://example.com/files/financial_accuracy_audit.pdf',
        size: 4096000,
        type: 'application/pdf',
        uploadedAt: '2024-12-15T17:00:00.000Z',
        uploadedBy: 'accounting_001'
      }
    ],
    status: 'submitted' as const,
    submittedAt: '2024-12-15T17:00:00.000Z',
    createdAt: '2024-12-14T22:00:00.000Z',
    updatedAt: '2024-12-15T17:00:00.000Z',
    version: 1
  }
];

// Sample Metric Data - Updated with correct employee IDs
const sampleMetricData = [
  {
    id: generateId(),
    employeeId: 'it_001',
    metric: 'system_uptime',
    value: 99.8,
    period: '2024-12',
    source: 'system_monitoring',
    recordedAt: '2024-12-15T00:00:00.000Z',
    metadata: {
      server: 'web-server-01',
      monitoring_tool: 'prometheus'
    }
  },
  {
    id: generateId(),
    employeeId: 'it_002',
    metric: 'system_uptime',
    value: 99.2,
    period: '2024-12',
    source: 'system_monitoring',
    recordedAt: '2024-12-15T00:00:00.000Z',
    metadata: {
      server: 'web-server-02',
      monitoring_tool: 'prometheus'
    }
  },
  {
    id: generateId(),
    employeeId: 'marketing_001',
    metric: 'customer_acquisition',
    value: 120,
    period: '2024-12',
    source: 'crm_system',
    recordedAt: '2024-12-15T00:00:00.000Z',
    metadata: {
      campaign: 'year_end_promotion',
      channel: 'digital_marketing'
    }
  },
  {
    id: generateId(),
    employeeId: 'marketing_002',
    metric: 'customer_acquisition',
    value: 45,
    period: '2024-12',
    source: 'crm_system',
    recordedAt: '2024-12-15T00:00:00.000Z',
    metadata: {
      campaign: 'local_promotion',
      channel: 'offline_marketing'
    }
  },
  {
    id: generateId(),
    employeeId: 'marketing_003',
    metric: 'customer_acquisition',
    value: 55,
    period: '2024-12',
    source: 'crm_system',
    recordedAt: '2024-12-15T00:00:00.000Z',
    metadata: {
      campaign: 'social_media_campaign',
      channel: 'social_media'
    }
  },
  {
    id: generateId(),
    employeeId: 'cs_001',
    metric: 'service_points',
    value: 4.7,
    period: '2024-12',
    source: 'customer_survey',
    recordedAt: '2024-12-15T00:00:00.000Z',
    metadata: {
      survey_type: 'monthly_feedback',
      response_rate: 85
    }
  },
  {
    id: generateId(),
    employeeId: 'cs_002',
    metric: 'service_points',
    value: 4.3,
    period: '2024-12',
    source: 'customer_survey',
    recordedAt: '2024-12-15T00:00:00.000Z',
    metadata: {
      survey_type: 'monthly_feedback',
      response_rate: 78
    }
  },
  {
    id: generateId(),
    employeeId: 'credit_001',
    metric: 'loan_approval_rate',
    value: 78,
    period: '2024-12',
    source: 'credit_system',
    recordedAt: '2024-12-15T00:00:00.000Z',
    metadata: {
      total_applications: 100,
      approved_applications: 78
    }
  },
  {
    id: generateId(),
    employeeId: 'credit_002',
    metric: 'loan_approval_rate',
    value: 72,
    period: '2024-12',
    source: 'credit_system',
    recordedAt: '2024-12-15T00:00:00.000Z',
    metadata: {
      total_applications: 95,
      approved_applications: 68
    }
  },
  {
    id: generateId(),
    employeeId: 'hr_001',
    metric: 'recruitment_success',
    value: 88,
    period: '2024-12',
    source: 'hr_system',
    recordedAt: '2024-12-15T00:00:00.000Z',
    metadata: {
      total_applications: 50,
      successful_hires: 44
    }
  },
  {
    id: generateId(),
    employeeId: 'hr_002',
    metric: 'recruitment_success',
    value: 82,
    period: '2024-12',
    source: 'hr_system',
    recordedAt: '2024-12-15T00:00:00.000Z',
    metadata: {
      total_applications: 45,
      successful_hires: 37
    }
  },
  {
    id: generateId(),
    employeeId: 'accounting_001',
    metric: 'financial_accuracy',
    value: 99.5,
    period: '2024-12',
    source: 'accounting_system',
    recordedAt: '2024-12-15T00:00:00.000Z',
    metadata: {
      total_entries: 1000,
      accurate_entries: 995
    }
  },
  {
    id: generateId(),
    employeeId: 'accounting_002',
    metric: 'financial_accuracy',
    value: 98.5,
    period: '2024-12',
    source: 'accounting_system',
    recordedAt: '2024-12-15T00:00:00.000Z',
    metadata: {
      total_entries: 900,
      accurate_entries: 886
    }
  }
];

export const seedSampleData = async () => {
  try {
    console.log('🌱 Seeding sample data...');

    const batch = writeBatch(db);
    let employeeCount = 0;
    let kpiRecordCount = 0;
    let metricDataCount = 0;
    let reportCount = 0;

    // Add employees
    for (const employee of sampleEmployees) {
      const employeeRef = doc(db, 'employees', employee.id);
      batch.set(employeeRef, employee);
      employeeCount++;
    }

    // Add KPI records
    const kpiRecordIds = [];
    for (const kpiRecord of sampleKpiRecords) {
      const kpiRecordRef = doc(db, 'kpiRecords', kpiRecord.id);
      batch.set(kpiRecordRef, kpiRecord);
      kpiRecordIds.push(kpiRecord.id);
      kpiRecordCount++;
    }

    // Add reports with proper kpiRecordId references
    const reportMappings = [
      { employeeId: 'it_001', kpiId: 'kpi_system_uptime', index: 0 },
      { employeeId: 'it_002', kpiId: 'kpi_repair_jobs', index: 1 },
      { employeeId: 'marketing_001', kpiId: 'kpi_customer_acquisition', index: 2 },
      { employeeId: 'marketing_002', kpiId: 'kpi_loan_processing', index: 3 },
      { employeeId: 'cs_001', kpiId: 'kpi_customer_satisfaction', index: 4 },
      { employeeId: 'credit_001', kpiId: 'kpi_loan_approval_rate', index: 5 },
      { employeeId: 'hr_001', kpiId: 'kpi_recruitment_success', index: 6 },
      { employeeId: 'accounting_001', kpiId: 'kpi_financial_accuracy', index: 7 },
    ];

    for (let i = 0; i < sampleReports.length; i++) {
      const report = { ...sampleReports[i] };
      const mapping = reportMappings[i];

      if (mapping) {
        // Find the corresponding kpiRecord
        const kpiRecord = sampleKpiRecords.find(kr =>
          kr.employeeId === mapping.employeeId && kr.kpiId === mapping.kpiId
        );
        if (kpiRecord) {
          report.kpiRecordId = kpiRecord.id;
        }
      }

      const reportRef = doc(db, 'reports', report.id);
      batch.set(reportRef, report);
      reportCount++;
    }

    // Add metric data
    for (const metricData of sampleMetricData) {
      const metricDataRef = doc(db, 'metricData', metricData.id);
      batch.set(metricDataRef, metricData);
      metricDataCount++;
    }

    await batch.commit();

    console.log('✅ Sample data seeded successfully!');
    console.log(`   - ${employeeCount} employees`);
    console.log(`   - ${kpiRecordCount} KPI records`);
    console.log(`   - ${reportCount} reports`);
    console.log(`   - ${metricDataCount} metric data`);

    return {
      success: true,
      message: 'Sample data seeded successfully',
      employees: employeeCount,
      kpiRecords: kpiRecordCount,
      reports: reportCount,
      metricData: metricDataCount
    };
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    return {
      success: false,
      message: 'Failed to seed sample data',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const resetAndSeedAllData = async () => {
  try {
    console.log('🔄 Resetting and seeding all data...');
    
    // First reset the system
    const resetResult = await resetSystem();
    if (!resetResult.success) {
      return {
        success: false,
        message: 'Failed to reset system',
        error: resetResult.error
      };
    }
    
    // Initialize company policies
    const policiesResult = await initializeCompanyPolicies();
    if (!policiesResult.success) {
      return {
        success: false,
        message: 'Failed to initialize company policies',
        error: policiesResult.error
      };
    }
    
    // Seed sample data
    const seedResult = await seedSampleData();
    if (!seedResult.success) {
      return {
        success: false,
        message: 'Failed to seed sample data',
        error: seedResult.error
      };
    }
    
    console.log('✅ All data reset and seeded successfully!');

    return {
      success: true,
      message: 'All data reset and seeded successfully',
      departments: policiesResult.departments,
      rewardPrograms: policiesResult.rewardPrograms,
      kpis: policiesResult.kpis,
      employees: seedResult.employees,
      kpiRecords: seedResult.kpiRecords,
      reports: seedResult.reports,
      metricData: seedResult.metricData
    };
  } catch (error) {
    console.error('❌ Error resetting and seeding data:', error);
    return {
      success: false,
      message: 'Failed to reset and seed data',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};