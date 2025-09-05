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
  getDoc,
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
  addEmployee: () => Promise<void>; // Simplified, form now calls server action
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
        
        const depts = deptsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Department));
        // Add the firestore doc id as uid
        const emps = empsSnap.docs.map(doc => ({ ...doc.data(), uid: doc.id } as Employee));
        const kpisData = kpisSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Kpi));
        const kpiRecordsData = kpiRecordsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as KpiRecord));

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
    // Only fetch data if a user is logged in
    if (user) {
      fetchData();
    } else {
      // If no user, clear data and stop loading
      setLoading(false);
      setDepartments([]);
      setEmployees([]);
      setKpis([]);
      setKpiRecords([]);
    }
  }, [user]);

  // The form now calls a server action, so we just need a way to refresh the list
  const addEmployee = async () => {
    await fetchData(); // Just refetch all data for simplicity
  };

  const deleteEmployee = async (employeeUid: string) => {
    // This is more complex now. You'd need a server action to delete the Auth user
    // and the Firestore user. For now, we'll just prevent this.
    alert("Việc xóa người dùng cần được thực hiện thông qua Firebase Console để đảm bảo an toàn.");
    // In a real app, you'd call a server action here.
  };

  const addKpi = async (kpiData: Omit<Kpi, 'id'>) => {
    const docRef = await addDoc(collection(db, 'kpis'), kpiData);
    setKpis(prev => [...prev, { ...kpiData, id: docRef.id }]);
  };


  const deleteKpi = async (kpiId: string) => {
    // Find the document by its Firestore ID to delete it
    const kpiDocRef = doc(db, 'kpis', kpiId);
    await deleteDoc(kpiDocRef);
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
    setKpiRecords(prev => [...prev, { ...newRecord, id: docRef.id }]);
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
