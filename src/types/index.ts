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
};