export type Department = {
  id: string;
  name: string;
};

export type Employee = {
  id: string;
  name: string;
  position: string;
  departmentId: string;
  avatar: string;
  role: 'admin' | 'employee';
};

export type Kpi = {
  id: string;
  name: string;
  description: string;
  department: string;
  formula?: string;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  reward?: number;
  penalty?: number;
};

export type KpiRecord = {
  id: string;
  kpiId: string;
  employeeId: string;
  target: number;
  actual: number;
  startDate: string;
  endDate: string;
  submittedReport?: string;
  status: 'pending' | 'awaiting_approval' | 'approved' | 'rejected';
  approvalComment?: string;
};
