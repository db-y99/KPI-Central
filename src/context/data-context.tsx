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
  onSnapshot,
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
  MetricData,
  Report,
  ReportFile,
  ReportSubmission,
  Notification,
  NotificationSettings,
  NotificationTemplate,
  KpiFormula,
  KpiVariable,
  FormulaValidationRule,
  MeasurementCycle,
  KpiCycle,
  BulkImportTemplate,
  BulkImportField,
  BulkImportValidationRule,
  BulkImportResult,
  BulkImportError,
  SelfUpdateRequest,
  PerformanceBreakdown,
  PerformancePrediction,
  SelfServiceSettings,
  PerformanceInsight
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
  reports: Report[];
  notifications: Notification[];
  notificationSettings: NotificationSettings[];
  kpiFormulas: KpiFormula[];
  measurementCycles: MeasurementCycle[];
  kpiCycles: KpiCycle[];
  bulkImportTemplates: BulkImportTemplate[];
  bulkImportResults: BulkImportResult[];
  selfUpdateRequests: SelfUpdateRequest[];
  performanceBreakdowns: PerformanceBreakdown[];
  performancePredictions: PerformancePrediction[];
  selfServiceSettings: SelfServiceSettings[];
  performanceInsights: PerformanceInsight[];
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
  
  // Report System Functions
  createReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<string>;
  updateReport: (reportId: string, updates: Partial<Report>) => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
  submitReportForApproval: (reportId: string) => Promise<void>;
  approveReport: (reportId: string, feedback?: string) => Promise<void>;
  rejectReport: (reportId: string, feedback: string) => Promise<void>;
  requestReportRevision: (reportId: string, feedback: string) => Promise<void>;
  getReportsByEmployee: (employeeId: string) => Report[];
  getReportsByStatus: (status: Report['status']) => Report[];
  getReportsForApproval: () => ReportSubmission[];
  
  // Notification System Functions
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'readAt'>) => Promise<string>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  getNotificationsByUser: (userId: string) => Notification[];
  getUnreadNotificationsCount: (userId: string) => number;
  createNotificationTemplate: (template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  sendNotificationToUser: (userId: string, templateId: string, data?: Record<string, any>) => Promise<void>;
  sendBulkNotification: (userIds: string[], templateId: string, data?: Record<string, any>) => Promise<void>;
  updateNotificationSettings: (userId: string, settings: Partial<NotificationSettings>) => Promise<void>;
  getNotificationSettings: (userId: string) => NotificationSettings | null;
  
  // Advanced KPI Features Functions
  createKpiFormula: (formula: Omit<KpiFormula, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateKpiFormula: (formulaId: string, updates: Partial<KpiFormula>) => Promise<void>;
  deleteKpiFormula: (formulaId: string) => Promise<void>;
  evaluateKpiFormula: (formulaId: string, variables: Record<string, number>) => Promise<number>;
  
  createMeasurementCycle: (cycle: Omit<MeasurementCycle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateMeasurementCycle: (cycleId: string, updates: Partial<MeasurementCycle>) => Promise<void>;
  deleteMeasurementCycle: (cycleId: string) => Promise<void>;
  generateKpiCycle: (kpiId: string, cycleId: string, startDate: string, endDate: string, targetValue: number) => Promise<string>;
  updateKpiCycle: (cycleId: string, updates: Partial<KpiCycle>) => Promise<void>;
  getKpiCyclesByKpi: (kpiId: string) => KpiCycle[];
  getKpiCyclesByStatus: (status: KpiCycle['status']) => KpiCycle[];
  
  createBulkImportTemplate: (template: Omit<BulkImportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBulkImportTemplate: (templateId: string, updates: Partial<BulkImportTemplate>) => Promise<void>;
  deleteBulkImportTemplate: (templateId: string) => Promise<void>;
  processBulkImport: (templateId: string, file: File) => Promise<string>;
  getBulkImportResult: (resultId: string) => BulkImportResult | null;
  getBulkImportResults: () => BulkImportResult[];
  
  // Employee Self-Service Functions
  createSelfUpdateRequest: (request: Omit<SelfUpdateRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateSelfUpdateRequest: (requestId: string, updates: Partial<SelfUpdateRequest>) => Promise<void>;
  approveSelfUpdateRequest: (requestId: string, feedback?: string) => Promise<void>;
  rejectSelfUpdateRequest: (requestId: string, feedback: string) => Promise<void>;
  getSelfUpdateRequestsByEmployee: (employeeId: string) => SelfUpdateRequest[];
  getSelfUpdateRequestsByStatus: (status: SelfUpdateRequest['status']) => SelfUpdateRequest[];
  
  generatePerformanceBreakdown: (employeeId: string, kpiId: string, period: string) => Promise<string>;
  getPerformanceBreakdownsByEmployee: (employeeId: string) => PerformanceBreakdown[];
  getPerformanceBreakdownsByKpi: (kpiId: string) => PerformanceBreakdown[];
  
  generatePerformancePrediction: (employeeId: string, kpiId: string, predictionPeriod: string) => Promise<string>;
  getPerformancePredictionsByEmployee: (employeeId: string) => PerformancePrediction[];
  getPerformancePredictionsByKpi: (kpiId: string) => PerformancePrediction[];
  
  updateSelfServiceSettings: (employeeId: string, settings: Partial<SelfServiceSettings>) => Promise<void>;
  getSelfServiceSettings: (employeeId: string) => SelfServiceSettings | null;
  
  generatePerformanceInsights: (employeeId: string, kpiId: string) => Promise<string>;
  getPerformanceInsightsByEmployee: (employeeId: string) => PerformanceInsight[];
  markInsightAsRead: (insightId: string) => Promise<void>;
  
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
  reports: [],
  notifications: [],
  notificationSettings: [],
  kpiFormulas: [],
  measurementCycles: [],
  kpiCycles: [],
  bulkImportTemplates: [],
  bulkImportResults: [],
  selfUpdateRequests: [],
  performanceBreakdowns: [],
  performancePredictions: [],
  selfServiceSettings: [],
  performanceInsights: [],
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
  // Report System Functions
  createReport: async () => '',
  updateReport: async () => {},
  deleteReport: async () => {},
  submitReportForApproval: async () => {},
  approveReport: async () => {},
  rejectReport: async () => {},
  requestReportRevision: async () => {},
  getReportsByEmployee: () => [],
  getReportsByStatus: () => [],
  getReportsForApproval: () => [],
  // Notification System Functions
  createNotification: async () => '',
  markNotificationAsRead: async () => {},
  markAllNotificationsAsRead: async () => {},
  deleteNotification: async () => {},
  getNotificationsByUser: () => [],
  getUnreadNotificationsCount: () => 0,
  createNotificationTemplate: async () => '',
  sendNotificationToUser: async () => {},
  sendBulkNotification: async () => {},
  updateNotificationSettings: async () => {},
  getNotificationSettings: () => null,
  // Advanced KPI Features Functions
  createKpiFormula: async () => '',
  updateKpiFormula: async () => {},
  deleteKpiFormula: async () => {},
  evaluateKpiFormula: async () => 0,
  createMeasurementCycle: async () => '',
  updateMeasurementCycle: async () => {},
  deleteMeasurementCycle: async () => {},
  generateKpiCycle: async () => '',
  updateKpiCycle: async () => {},
  getKpiCyclesByKpi: () => [],
  getKpiCyclesByStatus: () => [],
  createBulkImportTemplate: async () => '',
  updateBulkImportTemplate: async () => {},
  deleteBulkImportTemplate: async () => {},
  processBulkImport: async () => '',
  getBulkImportResult: () => null,
  getBulkImportResults: () => [],
  // Employee Self-Service Functions
  createSelfUpdateRequest: async () => '',
  updateSelfUpdateRequest: async () => {},
  approveSelfUpdateRequest: async () => {},
  rejectSelfUpdateRequest: async () => {},
  getSelfUpdateRequestsByEmployee: () => [],
  getSelfUpdateRequestsByStatus: () => [],
  generatePerformanceBreakdown: async () => '',
  getPerformanceBreakdownsByEmployee: () => [],
  getPerformanceBreakdownsByKpi: () => [],
  generatePerformancePrediction: async () => '',
  getPerformancePredictionsByEmployee: () => [],
  getPerformancePredictionsByKpi: () => [],
  updateSelfServiceSettings: async () => {},
  getSelfServiceSettings: () => null,
  generatePerformanceInsight: async () => '',
  getPerformanceInsightsByEmployee: () => [],
  getPerformanceInsightsByKpi: () => [],
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
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings[]>([]);
  const [kpiFormulas, setKpiFormulas] = useState<KpiFormula[]>([]);
  const [measurementCycles, setMeasurementCycles] = useState<MeasurementCycle[]>([]);
  const [kpiCycles, setKpiCycles] = useState<KpiCycle[]>([]);
  const [bulkImportTemplates, setBulkImportTemplates] = useState<BulkImportTemplate[]>([]);
  const [bulkImportResults, setBulkImportResults] = useState<BulkImportResult[]>([]);
  const [selfUpdateRequests, setSelfUpdateRequests] = useState<SelfUpdateRequest[]>([]);
  const [performanceBreakdowns, setPerformanceBreakdowns] = useState<PerformanceBreakdown[]>([]);
  const [performancePredictions, setPerformancePredictions] = useState<PerformancePrediction[]>([]);
  const [selfServiceSettings, setSelfServiceSettings] = useState<SelfServiceSettings[]>([]);
  const [performanceInsights, setPerformanceInsights] = useState<PerformanceInsight[]>([]);
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
          metricDataSnap,
          notificationSettingsSnap,
          kpiFormulasSnap,
          measurementCyclesSnap,
          kpiCyclesSnap,
          bulkImportTemplatesSnap,
          bulkImportResultsSnap,
          selfUpdateRequestsSnap,
          performanceBreakdownsSnap,
          performancePredictionsSnap,
          selfServiceSettingsSnap,
          performanceInsightsSnap
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
            getDocs(collection(db, 'notificationSettings')),
            getDocs(collection(db, 'kpiFormulas')),
            getDocs(collection(db, 'measurementCycles')),
            getDocs(collection(db, 'kpiCycles')),
            getDocs(collection(db, 'bulkImportTemplates')),
            getDocs(collection(db, 'bulkImportResults')),
            getDocs(collection(db, 'selfUpdateRequests')),
            getDocs(collection(db, 'performanceBreakdowns')),
            getDocs(collection(db, 'performancePredictions')),
            getDocs(collection(db, 'selfServiceSettings')),
            getDocs(collection(db, 'performanceInsights')),
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
        const notificationSettingsData = notificationSettingsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as NotificationSettings));
        const kpiFormulasData = kpiFormulasSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as KpiFormula));
        const measurementCyclesData = measurementCyclesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as MeasurementCycle));
        const kpiCyclesData = kpiCyclesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as KpiCycle));
        const bulkImportTemplatesData = bulkImportTemplatesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as BulkImportTemplate));
        const bulkImportResultsData = bulkImportResultsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as BulkImportResult));
        const selfUpdateRequestsData = selfUpdateRequestsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as SelfUpdateRequest));
        const performanceBreakdownsData = performanceBreakdownsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as PerformanceBreakdown));
        const performancePredictionsData = performancePredictionsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as PerformancePrediction));
        const selfServiceSettingsData = selfServiceSettingsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as SelfServiceSettings));
        const performanceInsightsData = performanceInsightsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as PerformanceInsight));

        setDepartments(depts);
        setEmployees(emps);
        setKpis(kpisData);
        setKpiRecords(kpiRecordsData);
        setRewardPrograms(rewardProgramsData);
        setPositionConfigs(positionConfigsData);
        setEmployeePoints(employeePointsData);
        setRewardCalculations(rewardCalculationsData);
        setMetricData(metricDataData);
        setNotificationSettings(notificationSettingsData);
        setKpiFormulas(kpiFormulasData);
        setMeasurementCycles(measurementCyclesData);
        setKpiCycles(kpiCyclesData);
        setBulkImportTemplates(bulkImportTemplatesData);
        setBulkImportResults(bulkImportResultsData);
        setSelfUpdateRequests(selfUpdateRequestsData);
        setPerformanceBreakdowns(performanceBreakdownsData);
        setPerformancePredictions(performancePredictionsData);
        setSelfServiceSettings(selfServiceSettingsData);
        setPerformanceInsights(performanceInsightsData);
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
      setReports([]);
      setNotifications([]);
      setNotificationSettings([]);
      setKpiFormulas([]);
      setMeasurementCycles([]);
      setKpiCycles([]);
      setBulkImportTemplates([]);
      setBulkImportResults([]);
      setSelfUpdateRequests([]);
      setPerformanceBreakdowns([]);
      setPerformancePredictions([]);
      setSelfServiceSettings([]);
      setPerformanceInsights([]);
    }
  }, [user]);

  // Real-time listener for reports
  useEffect(() => {
    if (!user) return;

    const reportsQuery = query(collection(db, 'reports'));
    const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Report[];
      setReports(reportsData);
    }, (error) => {
      console.error('Error listening to reports:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time listener for notifications
  useEffect(() => {
    if (!user) return;

    const notificationsQuery = query(collection(db, 'notifications'));
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      setNotifications(notificationsData);
    }, (error) => {
      console.error('Error listening to notifications:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // The form now calls a server action, so we just need a way to refresh the list
  const addEmployee = async () => {
    await fetchData(); // Just refetch all data for simplicity
  };

  const updateEmployee = async (employeeUid: string, updates: Partial<Employee>) => {
    try {
      const employeeRef = doc(db, 'employees', employeeUid);
      
      // Filter out undefined values to prevent Firebase errors
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );
      
      await updateDoc(employeeRef, {
        ...filteredUpdates,
        updatedAt: new Date().toISOString(),
      });
      
      // Update local state
      setEmployees(prev =>
        prev.map(emp => 
          emp.uid === employeeUid ? { ...emp, ...filteredUpdates } : emp
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

    // Create notification for the employee
    const kpi = kpis.find(k => k.id === assignment.kpiId);
    const employee = employees.find(e => e.uid === assignment.employeeId);
    
    if (employee && kpi) {
      await createNotification({
        userId: assignment.employeeId,
        title: 'KPI mới được giao',
        message: `Bạn đã được giao KPI "${kpi.name}" với chỉ tiêu ${assignment.target} ${kpi.unit}. Hạn chót: ${new Date(assignment.endDate).toLocaleDateString('vi-VN')}`,
        type: 'kpi',
        category: 'kpi_assigned',
        data: {
          kpiRecordId: savedRecord.id,
          kpiId: assignment.kpiId,
          target: assignment.target,
          endDate: assignment.endDate
        },
        isRead: false,
        isImportant: true,
        actionUrl: '/employee',
        actionText: 'Xem KPI'
      });
    }
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

  // Report System Functions
  const createReport = async (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<string> => {
    const now = new Date().toISOString();
    const newReport: Omit<Report, 'id'> = {
      ...report,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    
    const docRef = await addDoc(collection(db, 'reports'), newReport);
    const savedReport = { ...newReport, id: docRef.id } as Report;
    
    setReports(prev => [savedReport, ...prev]);
    return docRef.id;
  };

  const updateReport = async (reportId: string, updates: Partial<Report>) => {
    const reportRef = doc(db, 'reports', reportId);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      version: (updates.version || 1) + 1
    };
    
    await updateDoc(reportRef, updateData);
    setReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, ...updateData } : r))
    );
  };

  const deleteReport = async (reportId: string) => {
    const reportRef = doc(db, 'reports', reportId);
    await deleteDoc(reportRef);
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  const submitReportForApproval = async (reportId: string) => {
    await updateReport(reportId, {
      status: 'submitted',
      submittedAt: new Date().toISOString()
    });

    // Create notification for admins
    const report = reports.find(r => r.id === reportId);
    if (report) {
      const employee = employees.find(e => e.uid === report.employeeId);
      const kpi = kpis.find(k => k.id === report.kpiId);
      
      // Get all admin users
      const adminUsers = employees.filter(e => e.role === 'admin');
      
      // Create notifications for all admins
      for (const admin of adminUsers) {
        await createNotification({
          userId: admin.uid || '',
          title: 'Báo cáo mới cần duyệt',
          message: `${employee?.name || 'Employee'} đã nộp báo cáo "${report.title}" cho KPI "${kpi?.name || 'Unknown'}"`,
          type: 'report',
          category: 'report_submitted',
          data: {
            reportId: report.id,
            employeeId: report.employeeId,
            kpiId: report.kpiId
          },
          isRead: false,
          isImportant: true,
          actionUrl: `/admin/approval`,
          actionText: 'Xem báo cáo'
        });
      }
    }
  };

  const approveReport = async (reportId: string, feedback?: string) => {
    await updateReport(reportId, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: user?.name,
      feedback
    });

    // Create notification for employee
    const report = reports.find(r => r.id === reportId);
    if (report) {
      const kpi = kpis.find(k => k.id === report.kpiId);
      
      await createNotification({
        userId: report.employeeId,
        title: 'Báo cáo đã được duyệt',
        message: `Báo cáo "${report.title}" cho KPI "${kpi?.name || 'Unknown'}" đã được duyệt${feedback ? ` với phản hồi: ${feedback}` : ''}`,
        type: 'success',
        category: 'report_approved',
        data: {
          reportId: report.id,
          kpiId: report.kpiId,
          feedback
        },
        isRead: false,
        isImportant: false,
        actionUrl: `/employee/reports`,
        actionText: 'Xem báo cáo'
      });
    }
  };

  const rejectReport = async (reportId: string, feedback: string) => {
    await updateReport(reportId, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: user?.name,
      feedback
    });

    // Create notification for employee
    const report = reports.find(r => r.id === reportId);
    if (report) {
      const kpi = kpis.find(k => k.id === report.kpiId);
      
      await createNotification({
        userId: report.employeeId,
        title: 'Báo cáo bị từ chối',
        message: `Báo cáo "${report.title}" cho KPI "${kpi?.name || 'Unknown'}" đã bị từ chối. Lý do: ${feedback}`,
        type: 'error',
        category: 'report_rejected',
        data: {
          reportId: report.id,
          kpiId: report.kpiId,
          feedback
        },
        isRead: false,
        isImportant: true,
        actionUrl: `/employee/reports`,
        actionText: 'Xem báo cáo'
      });
    }
  };

  const requestReportRevision = async (reportId: string, feedback: string) => {
    await updateReport(reportId, {
      status: 'needs_revision',
      reviewedAt: new Date().toISOString(),
      reviewedBy: user?.name,
      feedback
    });

    // Create notification for employee
    const report = reports.find(r => r.id === reportId);
    if (report) {
      const kpi = kpis.find(k => k.id === report.kpiId);
      
      await createNotification({
        userId: report.employeeId,
        title: 'Báo cáo cần sửa đổi',
        message: `Báo cáo "${report.title}" cho KPI "${kpi?.name || 'Unknown'}" cần được sửa đổi. Yêu cầu: ${feedback}`,
        type: 'warning',
        category: 'report_revision_requested',
        data: {
          reportId: report.id,
          kpiId: report.kpiId,
          feedback
        },
        isRead: false,
        isImportant: true,
        actionUrl: `/employee/reports`,
        actionText: 'Sửa báo cáo'
      });
    }
  };

  const getReportsByEmployee = (employeeId: string): Report[] => {
    return reports.filter(r => r.employeeId === employeeId);
  };

  const getReportsByStatus = (status: Report['status']): Report[] => {
    return reports.filter(r => r.status === status);
  };

  const getReportsForApproval = (): ReportSubmission[] => {
    return reports
      .filter(r => r.status === 'submitted')
      .map(report => {
        const employee = employees.find(e => e.uid === report.employeeId);
        const department = departments.find(d => d.id === employee?.departmentId);
        const kpi = kpis.find(k => k.id === report.kpiId);
        
        return {
          id: report.id,
          employeeId: report.employeeId,
          employeeName: employee?.name || 'Unknown',
          department: department?.name || 'Unknown',
          kpiId: report.kpiId,
          kpiName: kpi?.name || 'Unknown KPI',
          title: report.title,
          description: report.description,
          period: report.period,
          actualValue: report.actualValue,
          targetValue: report.targetValue,
          unit: report.unit,
          files: report.files,
          status: report.status as 'submitted' | 'approved' | 'rejected' | 'needs_revision',
          submittedAt: report.submittedAt || '',
          reviewedAt: report.reviewedAt,
          reviewedBy: report.reviewedBy,
          feedback: report.feedback,
          priority: 'medium' as const // Default priority, can be enhanced later
        };
      });
  };

  // Notification System Functions
  const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'readAt'>): Promise<string> => {
    const now = new Date().toISOString();
    const newNotification: Omit<Notification, 'id'> = {
      ...notification,
      createdAt: now
    };
    
    const docRef = await addDoc(collection(db, 'notifications'), newNotification);
    const savedNotification = { ...newNotification, id: docRef.id } as Notification;
    
    setNotifications(prev => [savedNotification, ...prev]);
    return docRef.id;
  };

  const markNotificationAsRead = async (notificationId: string) => {
    const notificationRef = doc(db, 'notifications', notificationId);
    const readAt = new Date().toISOString();
    
    await updateDoc(notificationRef, {
      isRead: true,
      readAt
    });
    
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true, readAt } : n))
    );
  };

  const markAllNotificationsAsRead = async (userId: string) => {
    const userNotifications = notifications.filter(n => n.userId === userId && !n.isRead);
    const batch = writeBatch(db);
    const readAt = new Date().toISOString();
    
    userNotifications.forEach(notification => {
      const notificationRef = doc(db, 'notifications', notification.id);
      batch.update(notificationRef, {
        isRead: true,
        readAt
      });
    });
    
    await batch.commit();
    
    setNotifications(prev =>
      prev.map(n => 
        n.userId === userId && !n.isRead 
          ? { ...n, isRead: true, readAt }
          : n
      )
    );
  };

  const deleteNotification = async (notificationId: string) => {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationsByUser = (userId: string): Notification[] => {
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getUnreadNotificationsCount = (userId: string): number => {
    return notifications.filter(n => n.userId === userId && !n.isRead).length;
  };

  const createNotificationTemplate = async (template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const now = new Date().toISOString();
    const newTemplate: Omit<NotificationTemplate, 'id'> = {
      ...template,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, 'notificationTemplates'), newTemplate);
    return docRef.id;
  };

  const sendNotificationToUser = async (userId: string, templateId: string, data?: Record<string, any>) => {
    // This would typically fetch the template from database and create a notification
    // For now, we'll create a simple notification
    const notification: Omit<Notification, 'id' | 'createdAt' | 'readAt'> = {
      userId,
      title: 'New Notification',
      message: 'You have a new notification',
      type: 'info',
      category: 'general',
      data,
      isRead: false,
      isImportant: false
    };
    
    await createNotification(notification);
  };

  const sendBulkNotification = async (userIds: string[], templateId: string, data?: Record<string, any>) => {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    
    userIds.forEach(userId => {
      const notificationRef = doc(collection(db, 'notifications'));
      const notification: Omit<Notification, 'id'> = {
        userId,
        title: 'Bulk Notification',
        message: 'You have a new notification',
        type: 'info',
        category: 'general',
        data,
        isRead: false,
        isImportant: false,
        createdAt: now
      };
      
      batch.set(notificationRef, notification);
    });
    
    await batch.commit();
    
    // Refresh notifications
    await fetchData();
  };

  const updateNotificationSettings = async (userId: string, settings: Partial<NotificationSettings>) => {
    const settingsRef = doc(db, 'notificationSettings', userId);
    const updateData = {
      ...settings,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(settingsRef, updateData);
    
    setNotificationSettings(prev =>
      prev.map(s => (s.userId === userId ? { ...s, ...updateData } : s))
    );
  };

  const getNotificationSettings = (userId: string): NotificationSettings | null => {
    return notificationSettings.find(s => s.userId === userId) || null;
  };

  // Advanced KPI Features Functions
  const createKpiFormula = async (formula: Omit<KpiFormula, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const now = new Date().toISOString();
    const newFormula: Omit<KpiFormula, 'id'> = {
      ...formula,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, 'kpiFormulas'), newFormula);
    const savedFormula = { ...newFormula, id: docRef.id } as KpiFormula;
    
    setKpiFormulas(prev => [savedFormula, ...prev]);
    return docRef.id;
  };

  const updateKpiFormula = async (formulaId: string, updates: Partial<KpiFormula>) => {
    const formulaRef = doc(db, 'kpiFormulas', formulaId);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(formulaRef, updateData);
    setKpiFormulas(prev =>
      prev.map(f => (f.id === formulaId ? { ...f, ...updateData } : f))
    );
  };

  const deleteKpiFormula = async (formulaId: string) => {
    const formulaRef = doc(db, 'kpiFormulas', formulaId);
    await deleteDoc(formulaRef);
    setKpiFormulas(prev => prev.filter(f => f.id !== formulaId));
  };

  const evaluateKpiFormula = async (formulaId: string, variables: Record<string, number>): Promise<number> => {
    const formula = kpiFormulas.find(f => f.id === formulaId);
    if (!formula) throw new Error('Formula not found');
    
    // Simple formula evaluation - in production, you'd want a more robust math parser
    let expression = formula.formula;
    
    // Replace variables with actual values
    formula.variables.forEach(variable => {
      const value = variables[variable.name] || variable.defaultValue || 0;
      expression = expression.replace(new RegExp(`\\b${variable.name}\\b`, 'g'), value.toString());
    });
    
    // Basic math evaluation (simplified - use a proper math library in production)
    try {
      // This is a simplified evaluation - in production, use a proper math expression parser
      return eval(expression) || 0;
    } catch (error) {
      console.error('Error evaluating formula:', error);
      return 0;
    }
  };

  const createMeasurementCycle = async (cycle: Omit<MeasurementCycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const now = new Date().toISOString();
    const newCycle: Omit<MeasurementCycle, 'id'> = {
      ...cycle,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, 'measurementCycles'), newCycle);
    const savedCycle = { ...newCycle, id: docRef.id } as MeasurementCycle;
    
    setMeasurementCycles(prev => [savedCycle, ...prev]);
    return docRef.id;
  };

  const updateMeasurementCycle = async (cycleId: string, updates: Partial<MeasurementCycle>) => {
    const cycleRef = doc(db, 'measurementCycles', cycleId);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(cycleRef, updateData);
    setMeasurementCycles(prev =>
      prev.map(c => (c.id === cycleId ? { ...c, ...updateData } : c))
    );
  };

  const deleteMeasurementCycle = async (cycleId: string) => {
    const cycleRef = doc(db, 'measurementCycles', cycleId);
    await deleteDoc(cycleRef);
    setMeasurementCycles(prev => prev.filter(c => c.id !== cycleId));
  };

  const generateKpiCycle = async (kpiId: string, cycleId: string, startDate: string, endDate: string, targetValue: number): Promise<string> => {
    const cycle = measurementCycles.find(c => c.id === cycleId);
    if (!cycle) throw new Error('Measurement cycle not found');
    
    // Generate measurement dates based on cycle frequency
    const measurementDates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);
    
    while (current <= end) {
      measurementDates.push(current.toISOString());
      
      // Add frequency based on cycle settings
      switch (cycle.frequencyUnit) {
        case 'days':
          current.setDate(current.getDate() + cycle.frequency);
          break;
        case 'weeks':
          current.setDate(current.getDate() + (cycle.frequency * 7));
          break;
        case 'months':
          current.setMonth(current.getMonth() + cycle.frequency);
          break;
        case 'quarters':
          current.setMonth(current.getMonth() + (cycle.frequency * 3));
          break;
        case 'years':
          current.setFullYear(current.getFullYear() + cycle.frequency);
          break;
      }
    }
    
    const now = new Date().toISOString();
    const newKpiCycle: Omit<KpiCycle, 'id'> = {
      kpiId,
      cycleId,
      startDate,
      endDate,
      targetValue,
      status: 'pending',
      measurementDates,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, 'kpiCycles'), newKpiCycle);
    const savedKpiCycle = { ...newKpiCycle, id: docRef.id } as KpiCycle;
    
    setKpiCycles(prev => [savedKpiCycle, ...prev]);
    return docRef.id;
  };

  const updateKpiCycle = async (cycleId: string, updates: Partial<KpiCycle>) => {
    const cycleRef = doc(db, 'kpiCycles', cycleId);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(cycleRef, updateData);
    setKpiCycles(prev =>
      prev.map(c => (c.id === cycleId ? { ...c, ...updateData } : c))
    );
  };

  const getKpiCyclesByKpi = (kpiId: string): KpiCycle[] => {
    return kpiCycles.filter(c => c.kpiId === kpiId);
  };

  const getKpiCyclesByStatus = (status: KpiCycle['status']): KpiCycle[] => {
    return kpiCycles.filter(c => c.status === status);
  };

  const createBulkImportTemplate = async (template: Omit<BulkImportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const now = new Date().toISOString();
    const newTemplate: Omit<BulkImportTemplate, 'id'> = {
      ...template,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, 'bulkImportTemplates'), newTemplate);
    const savedTemplate = { ...newTemplate, id: docRef.id } as BulkImportTemplate;
    
    setBulkImportTemplates(prev => [savedTemplate, ...prev]);
    return docRef.id;
  };

  const updateBulkImportTemplate = async (templateId: string, updates: Partial<BulkImportTemplate>) => {
    const templateRef = doc(db, 'bulkImportTemplates', templateId);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(templateRef, updateData);
    setBulkImportTemplates(prev =>
      prev.map(t => (t.id === templateId ? { ...t, ...updateData } : t))
    );
  };

  const deleteBulkImportTemplate = async (templateId: string) => {
    const templateRef = doc(db, 'bulkImportTemplates', templateId);
    await deleteDoc(templateRef);
    setBulkImportTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const processBulkImport = async (templateId: string, file: File): Promise<string> => {
    const template = bulkImportTemplates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');
    
    // Create import result record
    const now = new Date().toISOString();
    const importResult: Omit<BulkImportResult, 'id'> = {
      templateId,
      fileName: file.name,
      totalRows: 0,
      successRows: 0,
      errorRows: 0,
      errors: [],
      status: 'processing',
      processedAt: now,
      createdBy: user?.uid || ''
    };
    
    const docRef = await addDoc(collection(db, 'bulkImportResults'), importResult);
    const savedResult = { ...importResult, id: docRef.id } as BulkImportResult;
    
    setBulkImportResults(prev => [savedResult, ...prev]);
    
    // Process file asynchronously (simplified - in production, use proper CSV/Excel parsing)
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      
      // Update result with processing status
      await updateDoc(doc(db, 'bulkImportResults', docRef.id), {
        totalRows: lines.length - 1,
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      setBulkImportResults(prev =>
        prev.map(r => r.id === docRef.id ? { 
          ...r, 
          totalRows: lines.length - 1,
          status: 'completed',
          completedAt: new Date().toISOString()
        } : r)
      );
      
    } catch (error) {
      console.error('Error processing bulk import:', error);
      await updateDoc(doc(db, 'bulkImportResults', docRef.id), {
        status: 'failed',
        completedAt: new Date().toISOString()
      });
      
      setBulkImportResults(prev =>
        prev.map(r => r.id === docRef.id ? { 
          ...r, 
          status: 'failed',
          completedAt: new Date().toISOString()
        } : r)
      );
    }
    
    return docRef.id;
  };

  const getBulkImportResult = (resultId: string): BulkImportResult | null => {
    return bulkImportResults.find(r => r.id === resultId) || null;
  };

  const getBulkImportResults = (): BulkImportResult[] => {
    return bulkImportResults.sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime());
  };

  // Employee Self-Service Functions
  const createSelfUpdateRequest = async (request: Omit<SelfUpdateRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const now = new Date().toISOString();
    const newRequest: Omit<SelfUpdateRequest, 'id'> = {
      ...request,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, 'selfUpdateRequests'), newRequest);
    const savedRequest = { ...newRequest, id: docRef.id } as SelfUpdateRequest;
    
    setSelfUpdateRequests(prev => [savedRequest, ...prev]);
    return docRef.id;
  };

  const updateSelfUpdateRequest = async (requestId: string, updates: Partial<SelfUpdateRequest>) => {
    const requestRef = doc(db, 'selfUpdateRequests', requestId);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(requestRef, updateData);
    setSelfUpdateRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, ...updateData } : r))
    );
  };

  const approveSelfUpdateRequest = async (requestId: string, feedback?: string) => {
    const request = selfUpdateRequests.find(r => r.id === requestId);
    if (!request) return;

    // Update the request status
    await updateSelfUpdateRequest(requestId, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: user?.name,
      feedback
    });

    // Update the actual KPI record
    const kpiRecord = kpiRecords.find(kr => kr.id === request.kpiRecordId);
    if (kpiRecord) {
      await updateDoc(doc(db, 'kpiRecords', request.kpiRecordId), {
        actual: request.newValue,
        updatedAt: new Date().toISOString()
      });
      
      setKpiRecords(prev =>
        prev.map(kr => kr.id === request.kpiRecordId ? { ...kr, actual: request.newValue } : kr)
      );
    }

    // Create notification for employee
    await createNotification({
      userId: request.employeeId,
      title: 'Yêu cầu cập nhật đã được duyệt',
      message: `Yêu cầu cập nhật KPI của bạn đã được duyệt${feedback ? ` với phản hồi: ${feedback}` : ''}`,
      type: 'success',
      category: 'report_approved',
      isRead: false,
      isImportant: false,
      actionUrl: `/employee/profile`,
      actionText: t.reports.viewDetails as string
    });
  };

  const rejectSelfUpdateRequest = async (requestId: string, feedback: string) => {
    await updateSelfUpdateRequest(requestId, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: user?.name,
      feedback
    });

    const request = selfUpdateRequests.find(r => r.id === requestId);
    if (request) {
      // Create notification for employee
      await createNotification({
        userId: request.employeeId,
        title: 'Yêu cầu cập nhật bị từ chối',
        message: `Yêu cầu cập nhật KPI của bạn đã bị từ chối. Lý do: ${feedback}`,
        type: 'error',
        category: 'report_rejected',
        isRead: false,
        isImportant: true,
        actionUrl: `/employee/profile`,
        actionText: t.reports.viewDetails as string
      });
    }
  };

  const getSelfUpdateRequestsByEmployee = (employeeId: string): SelfUpdateRequest[] => {
    return selfUpdateRequests
      .filter(r => r.employeeId === employeeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getSelfUpdateRequestsByStatus = (status: SelfUpdateRequest['status']): SelfUpdateRequest[] => {
    return selfUpdateRequests
      .filter(r => r.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const generatePerformanceBreakdown = async (employeeId: string, kpiId: string, period: string): Promise<string> => {
    const kpiRecord = kpiRecords.find(kr => kr.employeeId === employeeId && kr.kpiId === kpiId);
    if (!kpiRecord) throw new Error('KPI record not found');

    const kpi = kpis.find(k => k.id === kpiId);
    if (!kpi) throw new Error('KPI not found');

    // Calculate achievement rate
    const achievementRate = (kpiRecord.actual / kpiRecord.target) * 100;

    // Generate trend analysis (simplified)
    const trend = achievementRate > 100 ? 'improving' : achievementRate < 80 ? 'declining' : 'stable';

    // Generate comparison data (simplified)
    const departmentAverage = 85; // This would be calculated from actual data
    const companyAverage = 90; // This would be calculated from actual data

    // Generate detailed metrics (simplified)
    const dailyValues = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      value: Math.random() * 100
    }));

    const weeklyAverages = Array.from({ length: 4 }, (_, i) => ({
      week: `Week ${i + 1}`,
      average: Math.random() * 100
    }));

    const monthlyProgress = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleDateString('vi-VN', { month: 'long' }),
      progress: Math.random() * 100
    }));

    // Generate insights and recommendations
    const insights = [
      `Đạt được ${achievementRate.toFixed(1)}% mục tiêu trong tháng ${period}`,
      `Xu hướng hiệu suất: ${trend === 'improving' ? 'Cải thiện' : trend === 'declining' ? 'Giảm sút' : 'Ổn định'}`,
      `So với trung bình phòng ban: ${achievementRate > departmentAverage ? 'Tốt hơn' : 'Thấp hơn'}`
    ];

    const recommendations = [
      achievementRate < 80 ? 'Cần cải thiện hiệu suất để đạt mục tiêu' : 'Duy trì hiệu suất hiện tại',
      'Tập trung vào các hoạt động có tác động cao',
      'Thường xuyên theo dõi và điều chỉnh chiến lược'
    ];

    const now = new Date().toISOString();
    const breakdown: Omit<PerformanceBreakdown, 'id'> = {
      employeeId,
      kpiId,
      period,
      targetValue: kpiRecord.target,
      actualValue: kpiRecord.actual,
      achievementRate,
      trend,
      comparisonData: {
        previousPeriod: {
          actualValue: kpiRecord.actual * 0.9, // Simplified
          achievementRate: achievementRate * 0.9
        },
        departmentAverage,
        companyAverage
      },
      detailedMetrics: {
        dailyValues,
        weeklyAverages,
        monthlyProgress
      },
      insights,
      recommendations,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, 'performanceBreakdowns'), breakdown);
    const savedBreakdown = { ...breakdown, id: docRef.id } as PerformanceBreakdown;
    
    setPerformanceBreakdowns(prev => [savedBreakdown, ...prev]);
    return docRef.id;
  };

  const getPerformanceBreakdownsByEmployee = (employeeId: string): PerformanceBreakdown[] => {
    return performanceBreakdowns
      .filter(b => b.employeeId === employeeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getPerformanceBreakdownsByKpi = (kpiId: string): PerformanceBreakdown[] => {
    return performanceBreakdowns
      .filter(b => b.kpiId === kpiId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const generatePerformancePrediction = async (employeeId: string, kpiId: string, predictionPeriod: string): Promise<string> => {
    const kpiRecord = kpiRecords.find(kr => kr.employeeId === employeeId && kr.kpiId === kpiId);
    if (!kpiRecord) throw new Error('KPI record not found');

    const currentValue = kpiRecord.actual;
    
    // Simple prediction algorithm (in production, use more sophisticated ML)
    const historicalPerformance = 0.85; // This would be calculated from historical data
    const currentTrend = 0.1; // This would be calculated from recent trends
    const seasonalFactors = 0.05; // This would be calculated from seasonal patterns
    const externalFactors = 0.0; // This would be calculated from external factors

    const predictedValue = currentValue * (1 + currentTrend + seasonalFactors + externalFactors);
    const confidenceLevel = Math.min(95, Math.max(60, 100 - Math.abs(currentTrend) * 100));

    const scenarios = {
      optimistic: predictedValue * 1.1,
      realistic: predictedValue,
      pessimistic: predictedValue * 0.9
    };

    const riskFactors = [
      currentTrend < 0 ? 'Xu hướng giảm sút hiện tại' : null,
      confidenceLevel < 70 ? 'Độ tin cậy dự đoán thấp' : null,
      'Biến động thị trường'
    ].filter(Boolean) as string[];

    const recommendations = [
      'Duy trì hiệu suất hiện tại',
      'Tập trung vào các hoạt động có tác động cao',
      'Theo dõi sát sao các chỉ số quan trọng'
    ];

    const now = new Date().toISOString();
    const prediction: Omit<PerformancePrediction, 'id'> = {
      employeeId,
      kpiId,
      predictionPeriod,
      currentValue,
      predictedValue,
      confidenceLevel,
      predictionMethod: 'trend_analysis',
      factors: {
        historicalPerformance,
        currentTrend,
        seasonalFactors,
        externalFactors
      },
      scenarios,
      riskFactors,
      recommendations,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, 'performancePredictions'), prediction);
    const savedPrediction = { ...prediction, id: docRef.id } as PerformancePrediction;
    
    setPerformancePredictions(prev => [savedPrediction, ...prev]);
    return docRef.id;
  };

  const getPerformancePredictionsByEmployee = (employeeId: string): PerformancePrediction[] => {
    return performancePredictions
      .filter(p => p.employeeId === employeeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getPerformancePredictionsByKpi = (kpiId: string): PerformancePrediction[] => {
    return performancePredictions
      .filter(p => p.kpiId === kpiId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const updateSelfServiceSettings = async (employeeId: string, settings: Partial<SelfServiceSettings>) => {
    const settingsRef = doc(db, 'selfServiceSettings', employeeId);
    const updateData = {
      ...settings,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(settingsRef, updateData);
    
    setSelfServiceSettings(prev =>
      prev.map(s => (s.employeeId === employeeId ? { ...s, ...updateData } : s))
    );
  };

  const getSelfServiceSettings = (employeeId: string): SelfServiceSettings | null => {
    return selfServiceSettings.find(s => s.employeeId === employeeId) || null;
  };

  const generatePerformanceInsights = async (employeeId: string, kpiId: string): Promise<string> => {
    const kpiRecord = kpiRecords.find(kr => kr.employeeId === employeeId && kr.kpiId === kpiId);
    if (!kpiRecord) throw new Error('KPI record not found');

    const kpi = kpis.find(k => k.id === kpiId);
    if (!kpi) throw new Error('KPI not found');

    const achievementRate = (kpiRecord.actual / kpiRecord.target) * 100;

    // Generate insights based on performance
    const insights: PerformanceInsight[] = [];

    if (achievementRate > 100) {
      insights.push({
        id: Date.now().toString(),
        employeeId,
        kpiId,
        type: 'achievement',
        title: 'Vượt mục tiêu',
        description: `Bạn đã vượt mục tiêu ${kpi.name} với ${achievementRate.toFixed(1)}%`,
        data: { achievementRate, target: kpiRecord.target, actual: kpiRecord.actual },
        priority: 'high',
        actionable: true,
        actionUrl: `/employee/profile`,
        actionText: t.reports.viewDetails as string,
        createdAt: new Date().toISOString()
      });
    } else if (achievementRate < 80) {
      insights.push({
        id: Date.now().toString(),
        employeeId,
        kpiId,
        type: 'recommendation',
        title: 'Cần cải thiện',
        description: `Hiệu suất ${kpi.name} cần được cải thiện để đạt mục tiêu`,
        data: { achievementRate, target: kpiRecord.target, actual: kpiRecord.actual },
        priority: 'high',
        actionable: true,
        actionUrl: `/employee/profile`,
        actionText: 'Xem gợi ý',
        createdAt: new Date().toISOString()
      });
    }

    // Add insights to database
    for (const insight of insights) {
      const docRef = await addDoc(collection(db, 'performanceInsights'), insight);
      const savedInsight = { ...insight, id: docRef.id } as PerformanceInsight;
      setPerformanceInsights(prev => [savedInsight, ...prev]);
    }

    return insights[0]?.id || '';
  };

  const getPerformanceInsightsByEmployee = (employeeId: string): PerformanceInsight[] => {
    return performanceInsights
      .filter(i => i.employeeId === employeeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const markInsightAsRead = async (insightId: string) => {
    const insightRef = doc(db, 'performanceInsights', insightId);
    await updateDoc(insightRef, {
      readAt: new Date().toISOString()
    });
    
    setPerformanceInsights(prev =>
      prev.map(i => (i.id === insightId ? { ...i, readAt: new Date().toISOString() } : i))
    );
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
    reports,
    notifications,
    notificationSettings,
    kpiFormulas,
    measurementCycles,
    kpiCycles,
    bulkImportTemplates,
    bulkImportResults,
    selfUpdateRequests,
    performanceBreakdowns,
    performancePredictions,
    selfServiceSettings,
    performanceInsights,
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
    
    // Report System Functions
    createReport,
    updateReport,
    deleteReport,
    submitReportForApproval,
    approveReport,
    rejectReport,
    requestReportRevision,
    getReportsByEmployee,
    getReportsByStatus,
    getReportsForApproval,
    
    // Notification System Functions
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getNotificationsByUser,
    getUnreadNotificationsCount,
    createNotificationTemplate,
    sendNotificationToUser,
    sendBulkNotification,
    updateNotificationSettings,
    getNotificationSettings,
    
    // Advanced KPI Features Functions
    createKpiFormula,
    updateKpiFormula,
    deleteKpiFormula,
    evaluateKpiFormula,
    createMeasurementCycle,
    updateMeasurementCycle,
    deleteMeasurementCycle,
    generateKpiCycle,
    updateKpiCycle,
    getKpiCyclesByKpi,
    getKpiCyclesByStatus,
    createBulkImportTemplate,
    updateBulkImportTemplate,
    deleteBulkImportTemplate,
    processBulkImport,
    getBulkImportResult,
    getBulkImportResults,
    
    // Employee Self-Service Functions
    createSelfUpdateRequest,
    updateSelfUpdateRequest,
    approveSelfUpdateRequest,
    rejectSelfUpdateRequest,
    getSelfUpdateRequestsByEmployee,
    getSelfUpdateRequestsByStatus,
    generatePerformanceBreakdown,
    getPerformanceBreakdownsByEmployee,
    getPerformanceBreakdownsByKpi,
    generatePerformancePrediction,
    getPerformancePredictionsByEmployee,
    getPerformancePredictionsByKpi,
    updateSelfServiceSettings,
    getSelfServiceSettings,
    generatePerformanceInsights,
    getPerformanceInsightsByEmployee,
    markInsightAsRead,
    
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
