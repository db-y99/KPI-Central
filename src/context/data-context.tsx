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
import type { 
  Department, 
  Employee, 
  Kpi, 
  KpiRecord, 
  RewardProgram, 
  PositionConfig, 
  EmployeePoint, 
  RewardCalculation, 
  MetricData 
} from '@/types';
import { AuthContext } from './auth-context';


type ViewType = 'grid' | 'list';

interface DataContextType {
  departments: Department[];
  employees: Employee[];
  kpis: Kpi[];
  kpiRecords: KpiRecord[];
  rewardPrograms: RewardProgram[];
  positionConfigs: PositionConfig[];
  employeePoints: EmployeePoint[];
  rewardCalculations: RewardCalculation[];
  metricData: MetricData[];
  loading: boolean;
  addEmployee: () => Promise<void>; // Simplified, form now calls server action
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
  addKpi: (kpi: Omit<Kpi, 'id'>) => Promise<void>;
  updateKpi: (kpiId: string, updates: Partial<Kpi>) => Promise<void>;
  deleteKpi: (kpiId: string) => Promise<void>;
  addDepartment: (department: Omit<Department, 'id'>) => Promise<void>;
  updateDepartment: (departmentId: string, updates: Partial<Department>) => Promise<void>;
  deleteDepartment: (departmentId: string) => Promise<void>;
  assignKpi: (assignment: Omit<KpiRecord, 'id' | 'actual' | 'status' | 'submittedReport' | 'approvalComment'>) => Promise<void>;
  updateKpiRecord: (recordId: string, updates: Partial<KpiRecord>) => Promise<void>;
  submitReport: (recordId: string, reportName: string) => Promise<void>;
  approveKpi: (recordId: string) => Promise<void>;
  rejectKpi: (recordId: string, comment: string) => Promise<void>;
  // Reward System Functions
  addRewardProgram: (program: Omit<RewardProgram, 'id'>) => Promise<void>;
  updateRewardProgram: (program: RewardProgram) => Promise<void>;
  deleteRewardProgram: (programId: string) => Promise<void>;
  addPositionConfig: (config: Omit<PositionConfig, 'id'>) => Promise<void>;
  updatePositionConfig: (configId: string, updates: Partial<PositionConfig>) => Promise<void>;
  deletePositionConfig: (configId: string) => Promise<void>;
  addMetricData: (data: Omit<MetricData, 'id'>) => Promise<void>;
  updateMetricData: (dataId: string, updates: Partial<MetricData>) => Promise<void>;
  deleteMetricData: (dataId: string) => Promise<void>;
  calculateRewards: (employeeId: string, period: string, frequency: 'monthly' | 'quarterly' | 'annually') => Promise<RewardCalculation>;
  approveRewardCalculation: (calculationId: string, approvedBy: string) => Promise<void>;
  rejectRewardCalculation: (calculationId: string, notes: string) => Promise<void>;
  getEmployeeRewards: (employeeId: string) => RewardCalculation[];
  getEmployeePoints: (employeeId: string) => EmployeePoint[];
  getPositionMetrics: (position: string) => PositionConfig | undefined;
  initializeRewardPrograms: () => Promise<void>; // Initialize default reward programs
  view: ViewType;
  setView: (view: ViewType) => void;
}

export const DataContext = createContext<DataContextType>({
  departments: [],
  employees: [],
  kpis: [],
  kpiRecords: [],
  rewardPrograms: [],
  positionConfigs: [],
  employeePoints: [],
  rewardCalculations: [],
  metricData: [],
  loading: true,
  addEmployee: async () => {},
  updateEmployee: async () => {},
  deleteEmployee: async () => {},
  addKpi: async () => {},
  updateKpi: async () => {},
  deleteKpi: async () => {},
  addDepartment: async () => {},
  updateDepartment: async () => {},
  deleteDepartment: async () => {},
  assignKpi: async () => {},
  updateKpiRecord: async () => {},
  submitReport: async () => {},
  approveKpi: async () => {},
  rejectKpi: async () => {},
  // Reward System Functions
  addRewardProgram: async () => {},
  updateRewardProgram: async () => {},
  deleteRewardProgram: async () => {},
  addPositionConfig: async () => {},
  updatePositionConfig: async () => {},
  deletePositionConfig: async () => {},
  addMetricData: async () => {},
  updateMetricData: async () => {},
  deleteMetricData: async () => {},
  calculateRewards: async () => ({} as RewardCalculation),
  approveRewardCalculation: async () => {},
  rejectRewardCalculation: async () => {},
  getEmployeeRewards: () => [],
  getEmployeePoints: () => [],
  getPositionMetrics: () => undefined,
  initializeRewardPrograms: async () => {},
  view: 'grid',
  setView: () => {},
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [kpiRecords, setKpiRecords] = useState<KpiRecord[]>([]);
  const [rewardPrograms, setRewardPrograms] = useState<RewardProgram[]>([]);
  const [positionConfigs, setPositionConfigs] = useState<PositionConfig[]>([]);
  const [employeePoints, setEmployeePoints] = useState<EmployeePoint[]>([]);
  const [rewardCalculations, setRewardCalculations] = useState<RewardCalculation[]>([]);
  const [metricData, setMetricData] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewType>('grid');

  const fetchData = async () => {
    setLoading(true);
    try {
        const [
          deptsSnap, 
          empsSnap, 
          kpisSnap, 
          kpiRecordsSnap,
          rewardProgramsSnap,
          positionConfigsSnap,
          employeePointsSnap,
          rewardCalculationsSnap,
          metricDataSnap
        ] = await Promise.all([
            getDocs(collection(db, 'departments')),
            getDocs(collection(db, 'employees')),
            getDocs(collection(db, 'kpis')),
            getDocs(collection(db, 'kpiRecords')),
            getDocs(collection(db, 'rewardPrograms')),
            getDocs(collection(db, 'positionConfigs')),
            getDocs(collection(db, 'employeePoints')),
            getDocs(collection(db, 'rewardCalculations')),
            getDocs(collection(db, 'metricData')),
        ]);
        
        const depts = deptsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Department));
        // Add the firestore doc id as uid
        const emps = empsSnap.docs.map(doc => ({ ...doc.data(), uid: doc.id } as Employee));
        const kpisData = kpisSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Kpi));
        const kpiRecordsData = kpiRecordsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as KpiRecord));
        console.log('Loaded KPI Records from Firestore:', kpiRecordsData);
        const rewardProgramsData = rewardProgramsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as RewardProgram));
        const positionConfigsData = positionConfigsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as PositionConfig));
        const employeePointsData = employeePointsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as EmployeePoint));
        const rewardCalculationsData = rewardCalculationsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as RewardCalculation));
        const metricDataData = metricDataSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as MetricData));

        setDepartments(depts);
        setEmployees(emps);
        setKpis(kpisData);
        setKpiRecords(kpiRecordsData);
        setRewardPrograms(rewardProgramsData);
        setPositionConfigs(positionConfigsData);
        setEmployeePoints(employeePointsData);
        setRewardCalculations(rewardCalculationsData);
        setMetricData(metricDataData);
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
      setRewardPrograms([]);
      setPositionConfigs([]);
      setEmployeePoints([]);
      setRewardCalculations([]);
      setMetricData([]);
    }
  }, [user]);

  // The form now calls a server action, so we just need a way to refresh the list
  const addEmployee = async () => {
    await fetchData(); // Just refetch all data for simplicity
  };

  const updateEmployee = async (employeeUid: string, updates: Partial<Employee>) => {
    try {
      const employeeRef = doc(db, 'employees', employeeUid);
      await updateDoc(employeeRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      
      // Update local state
      setEmployees(prev =>
        prev.map(emp => 
          emp.uid === employeeUid ? { ...emp, ...updates } : emp
        )
      );
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
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

  const updateKpi = async (kpiId: string, updates: Partial<Kpi>) => {
    try {
      const kpiRef = doc(db, 'kpis', kpiId);
      await updateDoc(kpiRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      
      // Update local state
      setKpis(prev =>
        prev.map(k => 
          k.id === kpiId ? { ...k, ...updates } : k
        )
      );
    } catch (error) {
      console.error('Error updating KPI:', error);
      throw error;
    }
  };

  const deleteKpi = async (kpiId: string) => {
    // Find the document by its Firestore ID to delete it
    const kpiDocRef = doc(db, 'kpis', kpiId);
    await deleteDoc(kpiDocRef);
    setKpis(prev => prev.filter(k => k.id !== kpiId));
};

  const addDepartment = async (departmentData: Omit<Department, 'id'>) => {
    const docRef = await addDoc(collection(db, 'departments'), departmentData);
    setDepartments(prev => [...prev, { ...departmentData, id: docRef.id }]);
  };

  const updateDepartment = async (departmentId: string, updates: Partial<Department>) => {
    const departmentRef = doc(db, 'departments', departmentId);
    await updateDoc(departmentRef, updates);
    setDepartments(prev =>
      prev.map(d => (d.id === departmentId ? { ...d, ...updates } : d))
    );
  };

  const deleteDepartment = async (departmentId: string) => {
    const departmentRef = doc(db, 'departments', departmentId);
    await deleteDoc(departmentRef);
    setDepartments(prev => prev.filter(d => d.id !== departmentId));
  };
  
  const assignKpi = async (assignment: Omit<KpiRecord, 'id' | 'actual' | 'status' | 'submittedReport' | 'approvalComment'>) => {
    const newRecord = {
        ...assignment,
        actual: 0,
        status: 'pending',
        submittedReport: '',
        approvalComment: ''
    } as const;
    
    console.log('Saving KPI record to Firestore:', newRecord);
    
    const docRef = await addDoc(collection(db, 'kpiRecords'), newRecord);
    const savedRecord = { ...newRecord, id: docRef.id };
    
    console.log('KPI record saved with ID:', docRef.id);
    console.log('Updated KPI records:', [...kpiRecords, savedRecord]);
    
    setKpiRecords(prev => [...prev, savedRecord]);
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

  // Reward System Functions
  const addRewardProgram = async (programData: Omit<RewardProgram, 'id'>) => {
    const docRef = await addDoc(collection(db, 'rewardPrograms'), programData);
    setRewardPrograms(prev => [...prev, { ...programData, id: docRef.id }]);
  };

  const updateRewardProgram = async (program: RewardProgram) => {
    try {
      const programRef = doc(db, 'rewardPrograms', program.id);
      await updateDoc(programRef, {
        ...program,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setRewardPrograms(prev => 
        prev.map(p => p.id === program.id ? program : p)
      );
    } catch (error) {
      console.error('Error updating reward program:', error);
      throw error;
    }
  };


  const deleteRewardProgram = async (programId: string) => {
    const programRef = doc(db, 'rewardPrograms', programId);
    await deleteDoc(programRef);
    setRewardPrograms(prev => prev.filter(p => p.id !== programId));
  };

  const addPositionConfig = async (configData: Omit<PositionConfig, 'id'>) => {
    const docRef = await addDoc(collection(db, 'positionConfigs'), configData);
    setPositionConfigs(prev => [...prev, { ...configData, id: docRef.id }]);
  };

  const updatePositionConfig = async (configId: string, updates: Partial<PositionConfig>) => {
    const configRef = doc(db, 'positionConfigs', configId);
    await updateDoc(configRef, updates);
    setPositionConfigs(prev =>
      prev.map(c => (c.id === configId ? { ...c, ...updates } : c))
    );
  };

  const deletePositionConfig = async (configId: string) => {
    const configRef = doc(db, 'positionConfigs', configId);
    await deleteDoc(configRef);
    setPositionConfigs(prev => prev.filter(c => c.id !== configId));
  };

  const addMetricData = async (data: Omit<MetricData, 'id'>) => {
    const docRef = await addDoc(collection(db, 'metricData'), data);
    setMetricData(prev => [...prev, { ...data, id: docRef.id }]);
  };

  const updateMetricData = async (dataId: string, updates: Partial<MetricData>) => {
    const dataRef = doc(db, 'metricData', dataId);
    await updateDoc(dataRef, updates);
    setMetricData(prev =>
      prev.map(d => (d.id === dataId ? { ...d, ...updates } : d))
    );
  };

  const deleteMetricData = async (dataId: string) => {
    const dataRef = doc(db, 'metricData', dataId);
    await deleteDoc(dataRef);
    setMetricData(prev => prev.filter(d => d.id !== dataId));
  };

  const calculateRewards = async (
    employeeId: string, 
    period: string, 
    frequency: 'monthly' | 'quarterly' | 'annually'
  ): Promise<RewardCalculation> => {
    try {
      // Get employee information
      const employee = employees.find(e => e.uid === employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Get reward program for employee's position
      const program = rewardPrograms.find(p => p.position === employee.position && p.isActive);
      if (!program) {
        throw new Error('No active reward program found for position');
      }

      // Get relevant reward criteria based on frequency
      const criteria = frequency === 'monthly' ? program.monthlyRewards || [] :
                      frequency === 'quarterly' ? program.quarterlyRewards :
                      program.annualRewards;

      // Get metric data for the period
      const employeeMetrics = metricData.filter(
        m => m.employeeId === employeeId && m.period === period
      );

      let totalReward = 0;
      let totalPenalty = 0;
      const breakdown: any[] = [];
      const penalties: any[] = [];

      // Helper function to check conditions
      const checkConditions = (conditions: any[], metricData: any[]) => {
        const conditionResults: any[] = [];
        let allConditionsMet = true;

        for (const condition of conditions) {
          const metricValue = metricData.find(m => m.metric === condition.metric)?.value || 0;
          let conditionMet = false;

          switch (condition.operator) {
            case 'gt':
              conditionMet = Number(metricValue) > Number(condition.value);
              break;
            case 'gte':
              conditionMet = Number(metricValue) >= Number(condition.value);
              break;
            case 'lt':
              conditionMet = Number(metricValue) < Number(condition.value);
              break;
            case 'lte':
              conditionMet = Number(metricValue) <= Number(condition.value);
              break;
            case 'eq':
              conditionMet = metricValue === condition.value;
              break;
            case 'range':
              const numValue = Number(metricValue);
              const minValue = Number(condition.value);
              const maxValue = Number(condition.secondValue || 0);
              conditionMet = numValue >= minValue && numValue <= maxValue;
              break;
          }

          conditionResults.push({
            conditionId: condition.id,
            metric: condition.metric,
            expected: condition.value,
            actual: metricValue,
            met: conditionMet,
            description: `${condition.metric}: expected ${condition.operator} ${condition.value}, actual ${metricValue}`
          });

          if (!conditionMet) {
            allConditionsMet = false;
          }
        }

        return { conditionResults, allConditionsMet };
      };

      // Calculate rewards for each criteria
      for (const criterium of criteria) {
        if (!criterium.isActive) continue;

        let rewardAmount = 0;
        const { conditionResults, allConditionsMet } = checkConditions(criterium.conditions, employeeMetrics);

        // Calculate reward if all conditions are met
        if (allConditionsMet) {
          switch (criterium.type) {
            case 'fixed':
              rewardAmount = criterium.value;
              break;
            case 'variable':
              // For variable rewards, use base value but could be enhanced based on performance
              const performanceMultiplier = criterium.conditions.length > 0 ? 
                conditionResults.reduce((sum, cr) => sum + (Number(cr.actual) || 0), 0) / criterium.conditions.length : 1;
              rewardAmount = Math.min(criterium.value * Math.max(1, performanceMultiplier), criterium.maxValue || criterium.value);
              break;
            case 'percentage':
              // For percentage-based rewards, need base salary or amount
              const baseAmount = employee.position === 'Head of Marketing' || employee.position === 'Marketing Assistant' ? 
                Number(employeeMetrics.find(m => m.metric === 'marketing_loan_outstanding_total')?.value || 0) : 
                30000000; // Default base salary estimate
              rewardAmount = (baseAmount * criterium.value) / 100;
              if (criterium.maxValue) {
                rewardAmount = Math.min(rewardAmount, criterium.maxValue);
              }
              break;
            case 'points':
              const totalPoints = employeeMetrics.reduce((sum, m) => {
                if (m.metric.includes('point')) {
                  return sum + Number(m.value);
                }
                return sum;
              }, 0);
              if (totalPoints >= 100) {
                rewardAmount = Math.floor(totalPoints / 100) * criterium.value;
              }
              break;
          }
        }

        breakdown.push({
          criteriaId: criterium.id,
          criteriaName: criterium.name,
          type: criterium.type,
          baseValue: criterium.value,
          actualValue: employeeMetrics.find(m => criterium.conditions.some(c => c.metric === m.metric))?.value || 0,
          rewardAmount,
          description: criterium.description,
          conditions: conditionResults
        });

        totalReward += rewardAmount;
      }

      // Calculate penalties
      for (const penaltyCriteria of program.penalties || []) {
        if (!penaltyCriteria.isActive) continue;

        let penaltyAmount = 0;
        const { conditionResults, allConditionsMet } = checkConditions(penaltyCriteria.conditions, employeeMetrics);

        // Calculate penalty if all conditions are met (penalty conditions)
        if (allConditionsMet) {
          switch (penaltyCriteria.type) {
            case 'fixed':
              penaltyAmount = penaltyCriteria.value;
              break;
            case 'variable':
              const actualValue = employeeMetrics.find(m => penaltyCriteria.conditions.some(c => c.metric === m.metric))?.value || 0;
              penaltyAmount = Math.min(penaltyCriteria.value * Number(actualValue), penaltyCriteria.maxValue || penaltyCriteria.value);
              break;
            case 'percentage':
              const baseAmount = 30000000; // Default base salary estimate
              penaltyAmount = (baseAmount * penaltyCriteria.value) / 100;
              if (penaltyCriteria.maxValue) {
                penaltyAmount = Math.min(penaltyAmount, penaltyCriteria.maxValue);
              }
              break;
            case 'warning':
              penaltyAmount = 0; // Warnings don't have monetary penalty
              break;
          }
        }

        penalties.push({
          criteriaId: penaltyCriteria.id,
          criteriaName: penaltyCriteria.name,
          type: penaltyCriteria.type,
          baseValue: penaltyCriteria.value,
          actualValue: employeeMetrics.find(m => penaltyCriteria.conditions.some(c => c.metric === m.metric))?.value || 0,
          penaltyAmount,
          description: penaltyCriteria.description,
          severity: penaltyCriteria.severity,
          conditions: conditionResults
        });

        totalPenalty += penaltyAmount;
      }

      const netAmount = Math.max(0, totalReward - totalPenalty); // Ensure net amount is not negative

      // Create reward calculation record
      const calculationData = {
        employeeId,
        programId: program.id,
        period,
        frequency,
        totalReward,
        totalPenalty,
        netAmount,
        breakdown,
        penalties,
        status: 'calculated' as const,
        calculatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'rewardCalculations'), calculationData);
      const calculation = { ...calculationData, id: docRef.id };
      setRewardCalculations(prev => [...prev, calculation]);

      return calculation;
    } catch (error) {
      console.error('Error calculating rewards:', error);
      throw error;
    }
  };

  const approveRewardCalculation = async (calculationId: string, approvedBy: string) => {
    const updates = {
      status: 'approved' as const,
      approvedAt: new Date().toISOString(),
      approvedBy
    };
    const calculationRef = doc(db, 'rewardCalculations', calculationId);
    await updateDoc(calculationRef, updates);
    setRewardCalculations(prev =>
      prev.map(c => (c.id === calculationId ? { ...c, ...updates } : c))
    );
  };

  const rejectRewardCalculation = async (calculationId: string, notes: string) => {
    const updates = {
      status: 'rejected' as const,
      notes
    };
    const calculationRef = doc(db, 'rewardCalculations', calculationId);
    await updateDoc(calculationRef, updates);
    setRewardCalculations(prev =>
      prev.map(c => (c.id === calculationId ? { ...c, ...updates } : c))
    );
  };

  const getEmployeeRewards = (employeeId: string) => {
    return rewardCalculations.filter(rc => rc.employeeId === employeeId);
  };

  const getEmployeePoints = (employeeId: string) => {
    return employeePoints.filter(ep => ep.employeeId === employeeId);
  };

  const getPositionMetrics = (position: string) => {
    return positionConfigs.find(pc => pc.position === position && pc.isActive);
  };

  const initializeRewardPrograms = async () => {
    try {
      // No longer auto-initializing with sample data
      // System is ready for manual data setup
      console.log('Reward programs ready for manual setup');
      
      // Refresh data to get current state
      await fetchData();
    } catch (error) {
      console.error('Error initializing reward programs:', error);
    }
  };
  
  const value = {
    departments,
    employees,
    kpis,
    kpiRecords,
    rewardPrograms,
    positionConfigs,
    employeePoints,
    rewardCalculations,
    metricData,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addKpi,
    updateKpi,
    deleteKpi,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    assignKpi,
    updateKpiRecord,
    submitReport,
    approveKpi,
    rejectKpi,
    // Reward System Functions
    addRewardProgram,
    updateRewardProgram,
    deleteRewardProgram,
    addPositionConfig,
    updatePositionConfig,
    deletePositionConfig,
    addMetricData,
    updateMetricData,
    deleteMetricData,
    calculateRewards,
    approveRewardCalculation,
    rejectRewardCalculation,
    getEmployeeRewards,
    getEmployeePoints,
    getPositionMetrics,
    initializeRewardPrograms,
    view,
    setView,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
