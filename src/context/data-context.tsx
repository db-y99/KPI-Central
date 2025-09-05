'use client';

import { createContext, useState, type ReactNode, useEffect, useContext } from 'react';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Department, Employee, Kpi, KpiRecord } from '@/types';
import { AuthContext } from './auth-context';


type ViewType = 'grid' | 'list';

interface DataContextType {
  departments: Department[];
  employees: Employee[];
  kpis: Kpi[];
  kpiRecords: KpiRecord[];
  loading: boolean;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
  addKpi: (kpi: Omit<Kpi, 'id'>) => Promise<void>;
  deleteKpi: (kpiId: string) => Promise<void>;
  assignKpi: (assignment: Omit<KpiRecord, 'id' | 'actual' | 'status' | 'submittedReport' | 'approvalComment'>) => Promise<void>;
  updateKpiRecord: (recordId: string, updates: Partial<KpiRecord>) => Promise<void>;
  submitReport: (recordId: string, reportName: string) => Promise<void>;
  approveKpi: (recordId: string) => Promise<void>;
  rejectKpi: (recordId: string, comment: string) => Promise<void>;
  view: ViewType;
  setView: (view: ViewType) => void;
}

export const DataContext = createContext<DataContextType>({
  departments: [],
  employees: [],
  kpis: [],
  kpiRecords: [],
  loading: true,
  addEmployee: async () => {},
  deleteEmployee: async () => {},
  addKpi: async () => {},
  deleteKpi: async () => {},
  assignKpi: async () => {},
  updateKpiRecord: async () => {},
  submitReport: async () => {},
  approveKpi: async () => {},
  rejectKpi: async () => {},
  view: 'grid',
  setView: () => {},
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [kpiRecords, setKpiRecords] = useState<KpiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewType>('grid');

  const fetchData = async () => {
    setLoading(true);
    try {
        const [deptsSnap, empsSnap, kpisSnap, kpiRecordsSnap] = await Promise.all([
            getDocs(collection(db, 'departments')),
            getDocs(collection(db, 'employees')),
            getDocs(collection(db, 'kpis')),
            getDocs(collection(db, 'kpiRecords')),
        ]);
        
        const depts = deptsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
        const emps = empsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        const kpisData = kpisSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Kpi));
        const kpiRecordsData = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as KpiRecord));

        setDepartments(depts);
        setEmployees(emps);
        setKpis(kpisData);
        setKpiRecords(kpiRecordsData);
    } catch (error) {
        console.error("Error fetching initial data: ", error);
    } finally {
        setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [user]);

  const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    const docRef = await addDoc(collection(db, 'employees'), employeeData);
    setEmployees(prev => [...prev, { id: docRef.id, ...employeeData }]);
  };

  const deleteEmployee = async (employeeId: string) => {
    const batch = writeBatch(db);
    
    const employeeQuery = query(collection(db, 'employees'), where('id', '==', employeeId));
    const employeeSnapshot = await getDocs(employeeQuery);

    if (employeeSnapshot.empty) {
        console.error("Employee to delete not found with custom ID:", employeeId);
        return;
    }
    const empDocRef = employeeSnapshot.docs[0].ref;

    const kpiQuery = query(collection(db, 'kpiRecords'), where('employeeId', '==', employeeId));
    const kpiSnapshot = await getDocs(kpiQuery);
    kpiSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    batch.delete(empDocRef);
    
    await batch.commit();

    setEmployees(prev => prev.filter(e => e.id !== employeeId));
    setKpiRecords(prev => prev.filter(r => r.employeeId !== employeeId));
  };

  const addKpi = async (kpiData: Omit<Kpi, 'id'>) => {
    const docRef = await addDoc(collection(db, 'kpis'), kpiData);
    setKpis(prev => [...prev, { id: docRef.id, ...kpiData }]);
  };

  const deleteKpi = async (kpiId: string) => {
    await deleteDoc(doc(db, 'kpis', kpiId));
    setKpis(prev => prev.filter(k => k.id !== kpiId));
  };
  
  const assignKpi = async (assignment: Omit<KpiRecord, 'id' | 'actual' | 'status' | 'submittedReport' | 'approvalComment'>) => {
    const newRecord = {
        ...assignment,
        actual: 0,
        status: 'pending',
        submittedReport: '',
        approvalComment: ''
    } as const;
    const docRef = await addDoc(collection(db, 'kpiRecords'), newRecord);
    setKpiRecords(prev => [...prev, { id: docRef.id, ...newRecord }]);
  }

  const updateKpiRecord = async (
    recordId: string,
    updates: Partial<KpiRecord>
  ) => {
    const recordRef = doc(db, 'kpiRecords', recordId);
    await updateDoc(recordRef, updates);
    setKpiRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, ...updates } : r))
    );
  };
  
  const submitReport = async (recordId: string, reportName: string) => {
    await updateKpiRecord(recordId, { submittedReport: reportName, status: 'awaiting_approval' });
  };

  const approveKpi = async (recordId: string) => {
    await updateKpiRecord(recordId, { status: 'approved', approvalComment: '' });
  };

  const rejectKpi = async (recordId: string, comment: string) => {
     await updateKpiRecord(recordId, { status: 'rejected', approvalComment: comment });
  };

  const value = {
    departments,
    employees,
    kpis,
    kpiRecords,
    loading,
    addEmployee,
    deleteEmployee,
    addKpi,
    deleteKpi,
    assignKpi,
    updateKpiRecord,
    submitReport,
    approveKpi,
    rejectKpi,
    view,
    setView,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
