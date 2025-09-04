import type { Department, Employee, Kpi, KpiRecord } from '@/types';

export const departments: Department[] = [
  { id: 'd1', name: 'Kinh doanh' },
  { id: 'd2', name: 'Marketing' },
  { id: 'd3', name: 'Nhân sự & Hành chính' },
  { id: 'd4', name: 'IT' },
  { id: 'd5', name: 'Chăm sóc khách hàng' },
  { id: 'd6', name: 'Thẩm định tín dụng' },
  { id: 'd7', name: 'Kế toán' },
];

export const employees: Employee[] = [
  {
    id: 'e1',
    name: 'Nguyễn Văn An',
    position: 'Nhân viên IT',
    departmentId: 'd4',
    avatar: 'https://picsum.photos/seed/e1/100/100',
    role: 'employee',
  },
  {
    id: 'e2',
    name: 'Trần Thị Bích (Admin)',
    position: 'Giám đốc điều hành',
    departmentId: 'd1',
    avatar: 'https://picsum.photos/seed/e2/100/100',
    role: 'admin',
  },
  {
    id: 'e3',
    name: 'Lê Minh Hùng',
    position: 'Trưởng bộ phận Marketing',
    departmentId: 'd2',
    avatar: 'https://picsum.photos/seed/e3/100/100',
    role: 'employee',
  },
  {
    id: 'e4',
    name: 'Phạm Thị Dung',
    position: 'Trợ lý Marketing',
    departmentId: 'd2',
    avatar: 'https://picsum.photos/seed/e4/100/100',
    role: 'employee',
  },
  {
    id: 'e5',
    name: 'Hoàng Văn Long',
    position: 'Nhân viên CSKH',
    departmentId: 'd5',
    avatar: 'https://picsum.photos/seed/e5/100/100',
    role: 'employee',
  },
  {
    id: 'e6',
    name: 'Vũ Thị Mai',
    position: 'Nhân viên Thẩm định tín dụng',
    departmentId: 'd6',
    avatar: 'https://picsum.photos/seed/e6/100/100',
    role: 'employee',
  },
  {
    id: 'e7',
    name: 'Đặng Bảo Châu',
    position: 'Nhân viên Hành chính – Nhân sự',
    departmentId: 'd3',
    avatar: 'https://picsum.photos/seed/e7/100/100',
    role: 'employee',
  },
  {
    id: 'e8',
    name: 'Bùi Thế Anh',
    position: 'Kế toán',
    departmentId: 'd7',
    avatar: 'https://picsum.photos/seed/e8/100/100',
    role: 'employee',
  },
];

export const kpis: Kpi[] = [
  // IT
  { id: 'kpi_it_1', name: 'Hệ thống hoạt động ổn định', department: 'IT', description: 'Đảm bảo không có thời gian chết hệ thống', unit: 'lần', frequency: 'quarterly', reward: 300000, penalty: 300000 },
  { id: 'kpi_it_2', name: 'Sao lưu dữ liệu', department: 'IT', description: 'Thực hiện sao lưu dữ liệu đầy đủ và đúng lịch', unit: 'lần', frequency: 'quarterly', reward: 200000 },
  { id: 'kpi_it_3', name: 'Sáng kiến/cải tiến hệ thống', department: 'IT', description: 'Đề xuất và thực hiện các cải tiến cho hệ thống', unit: 'dự án', frequency: 'annually', reward: 2000000 },
  // Marketing Head
  { id: 'kpi_mkt_h_1', name: 'Tạo khách hàng tiềm năng', department: 'Marketing', description: 'Số lượng khách hàng tiềm năng chất lượng tạo ra', unit: 'khách', frequency: 'quarterly', reward: 500000 },
  { id: 'kpi_mkt_h_2', name: 'Chiến dịch marketing lan truyền', department: 'Marketing', description: 'Thực hiện thành công chiến dịch viral', unit: 'chiến dịch', frequency: 'quarterly', reward: 1000000 },
  { id: 'kpi_mkt_h_3', name: 'Khách hàng tiềm năng giả mạo', department: 'Marketing', description: 'Phát hiện khách hàng tiềm năng không hợp lệ', unit: 'khách', frequency: 'quarterly', penalty: 500000 },
  // Marketing Assistant
  { id: 'kpi_mkt_a_1', name: 'Hỗ trợ tạo KHTN', department: 'Marketing', description: 'Đạt mục tiêu số lượng khách hàng tiềm năng', unit: 'khách', frequency: 'quarterly', reward: 200000 },
  // CSO
  { id: 'kpi_cso_1', name: 'Xử lý lỗi chứng từ', department: 'Chăm sóc khách hàng', description: 'Số lỗi chứng từ phát sinh', unit: 'lỗi', frequency: 'monthly', penalty: 100000 },
  { id: 'kpi_cso_2', name: 'Top 10% điểm cao nhất', department: 'Chăm sóc khách hàng', description: 'Đạt top 10% nhân viên có điểm KPI cao nhất năm', unit: 'lần', frequency: 'annually', reward: 3000000 },
  // Credit Appraisal
  { id: 'kpi_ca_1', name: 'Kiểm soát tỷ lệ nợ xấu', department: 'Thẩm định tín dụng', description: 'Giữ tỷ lệ nợ xấu dưới 5%', unit: '%', frequency: 'annually', reward: 5000000, penalty: 500000 },
  // HR/Admin
  { id: 'kpi_hr_1', name: 'Quản lý hồ sơ nhân sự', department: 'Nhân sự & Hành chính', description: 'Hoàn thành tốt công tác quản lý hồ sơ', unit: 'lần', frequency: 'quarterly', reward: 300000 },
  { id: 'kpi_hr_2', name: 'Lập bảng lương', department: 'Nhân sự & Hành chính', description: 'Lập bảng lương chính xác và đúng hạn', unit: 'lần', frequency: 'quarterly', reward: 300000, penalty: 300000 },
  // Accountant
  { id: 'kpi_acc_1', name: 'Báo cáo tài chính đúng hạn', department: 'Kế toán', description: 'Nộp báo cáo tài chính đúng hạn quy định', unit: 'lần', frequency: 'quarterly', reward: 300000 },
  { id: 'kpi_acc_2', name: 'Khai thuế đúng hạn', department: 'Kế toán', description: 'Thực hiện khai và nộp thuế đúng hạn', unit: 'lần', frequency: 'quarterly', reward: 300000, penalty: 300000 },
];


export const kpiRecords: KpiRecord[] = [
  // IT Staff - e1
  { id: 'rec_it_1', kpiId: 'kpi_it_1', employeeId: 'e1', target: 0, actual: 0, startDate: '2024-07-01', endDate: '2024-09-30', status: 'approved', submittedReport: 'uptime_report_q3.pdf'},
  { id: 'rec_it_2', kpiId: 'kpi_it_2', employeeId: 'e1', target: 1, actual: 1, startDate: '2024-07-01', endDate: '2024-09-30', status: 'approved', submittedReport: 'backup_log_q3.xlsx'},
  
  // Marketing Head - e3
  { id: 'rec_mkt_h_1', kpiId: 'kpi_mkt_h_1', employeeId: 'e3', target: 50, actual: 65, startDate: '2024-07-01', endDate: '2024-09-30', status: 'approved' },
  { id: 'rec_mkt_h_2', kpiId: 'kpi_mkt_h_2', employeeId: 'e3', target: 1, actual: 0, startDate: '2024-07-01', endDate: '2024-09-30', status: 'approved' }, // No viral campaign
  { id: 'rec_mkt_h_3', kpiId: 'kpi_mkt_h_3', employeeId: 'e3', target: 0, actual: 1, startDate: '2024-07-01', endDate: '2024-09-30', status: 'approved' }, // 1 fake lead found

  // Marketing Assistant - e4
  { id: 'rec_mkt_a_1', kpiId: 'kpi_mkt_a_1', employeeId: 'e4', target: 50, actual: 48, startDate: '2024-07-01', endDate: '2024-09-30', status: 'approved' }, // Didn't reach target

  // CSO - e5
  { id: 'rec_cso_1', kpiId: 'kpi_cso_1', employeeId: 'e5', target: 0, actual: 2, startDate: '2024-07-01', endDate: '2024-07-31', status: 'approved' }, // 2 document errors
  
  // Credit Appraisal - e6
  { id: 'rec_ca_1', kpiId: 'kpi_ca_1', employeeId: 'e6', target: 5, actual: 4, startDate: '2024-01-01', endDate: '2024-12-31', status: 'awaiting_approval' },

  // HR/Admin - e7
  { id: 'rec_hr_1', kpiId: 'kpi_hr_1', employeeId: 'e7', target: 1, actual: 1, startDate: '2024-07-01', endDate: '2024-09-30', status: 'approved' },
  { id: 'rec_hr_2', kpiId: 'kpi_hr_2', employeeId: 'e7', target: 0, actual: 0, startDate: '2024-07-01', endDate: '2024-09-30', status: 'approved', submittedReport: 'payroll_q3.xlsx' },

  // Accountant - e8
  { id: 'rec_acc_1', kpiId: 'kpi_acc_1', employeeId: 'e8', target: 1, actual: 1, startDate: '2024-07-01', endDate: '2024-09-30', status: 'approved' },
  { id: 'rec_acc_2', kpiId: 'kpi_acc_2', employeeId: 'e8', target: 0, actual: 1, startDate: '2024-07-01', endDate: '2024-09-30', status: 'approved' }, // Late tax submission
];
