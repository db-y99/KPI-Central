'use client';

import { createContext, useState, type ReactNode } from 'react';
import type { Department, Employee, Kpi, KpiRecord } from '@/types';
import {
  employees as initialEmployees,
  kpis as initialKpis,
  kpiRecords as initialKpiRecords,
  departments as initialDepartments
} from '@/lib/data';

type ViewType = 'grid' | 'list';

interface DataContextType {
  departments: Department[];
  employees: Employee[];
  kpis: Kpi[];
  kpiRecords: KpiRecord[];
  addEmployee: (employee: Employee) => void;
  deleteEmployee: (employeeId: string) => void;
  addKpi: (kpi: Kpi) => void;
  deleteKpi: (kpiId: string) => void;
  updateKpiRecord: (recordId: string, updates: Partial<KpiRecord>) => void;
  submitReport: (recordId: string, reportName: string) => void;
  approveKpi: (recordId: string) => void;
  rejectKpi: (recordId: string, comment: string) => void;
  view: ViewType;
  setView: (view: ViewType) => void;
}

export const DataContext = createContext<DataContextType>({
  departments: [],
  employees: [],
  kpis: [],
  kpiRecords: [],
  addEmployee: () => {},
  deleteEmployee: () => {},
  addKpi: () => {},
  deleteKpi: () => {},
  updateKpiRecord: () => {},
  submitReport: () => {},
  approveKpi: () => {},
  rejectKpi: () => {},
  view: 'grid',
  setView: () => {},
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [kpis, setKpis] = useState<Kpi[]>(initialKpis);
  const [kpiRecords, setKpiRecords] = useState<KpiRecord[]>(initialKpiRecords);
  const [view, setView] = useState<ViewType>('grid');

  const addEmployee = (employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
  };

  const deleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
  };

  const addKpi = (kpi: Kpi) => {
    setKpis(prev => [...prev, kpi]);
  };

  const deleteKpi = (kpiId: string) => {
    setKpis(prev => prev.filter(k => k.id !== kpiId));
  };

  const updateKpiRecord = (
    recordId: string,
    updates: Partial<KpiRecord>
  ) => {
    setKpiRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, ...updates } : r))
    );
  };
  
  const submitReport = (recordId: string, reportName: string) => {
    setKpiRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, submittedReport: reportName, status: 'awaiting_approval' } : r))
    );
  };

  const approveKpi = (recordId: string) => {
    setKpiRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, status: 'approved', approvalComment: '' } : r))
    );
  };

  const rejectKpi = (recordId: string, comment: string) => {
    setKpiRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, status: 'rejected', approvalComment: comment } : r))
    );
  };

  const value = {
    departments,
    employees,
    kpis,
    kpiRecords,
    addEmployee,
    deleteEmployee,
    addKpi,
    deleteKpi,
    updateKpiRecord,
    submitReport,
    approveKpi,
    rejectKpi,
    view,
    setView,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
