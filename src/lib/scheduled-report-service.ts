import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  type: 'kpi_summary' | 'employee_performance' | 'department_analysis' | 'reward_calculation' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  schedule: {
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    hour: number; // 0-23
    minute: number; // 0-59
    timezone: string;
  };
  recipients: string[]; // User IDs
  filters: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv' | 'email';
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  query: string;
  parameters: ReportParameter[];
  isDefault: boolean;
}

export interface ReportParameter {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

export interface ReportExecution {
  id: string;
  reportId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  error?: string;
  result?: {
    recordCount: number;
    fileUrl?: string;
    emailSent?: boolean;
  };
  parameters: Record<string, any>;
}

class ScheduledReportService {
  private static instance: ScheduledReportService;
  private intervalIds: Map<string, NodeJS.Timeout> = new Map();

  public static getInstance(): ScheduledReportService {
    if (!ScheduledReportService.instance) {
      ScheduledReportService.instance = new ScheduledReportService();
    }
    return ScheduledReportService.instance;
  }

  /**
   * Create a new scheduled report
   */
  async createScheduledReport(report: Omit<ScheduledReport, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>): Promise<string> {
    try {
      const nextRun = this.calculateNextRun(report.frequency, report.schedule);
      
      const scheduledReport: Omit<ScheduledReport, 'id'> = {
        ...report,
        nextRun,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'scheduledReports'), scheduledReport);
      const reportId = docRef.id;

      // Schedule the report execution
      this.scheduleReportExecution(reportId, nextRun);

      return reportId;
    } catch (error) {
      console.error('Error creating scheduled report:', error);
      throw error;
    }
  }

  /**
   * Update a scheduled report
   */
  async updateScheduledReport(reportId: string, updates: Partial<ScheduledReport>): Promise<void> {
    try {
      const reportRef = doc(db, 'scheduledReports', reportId);
      const updateData: any = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Recalculate next run if schedule changed
      if (updates.frequency || updates.schedule) {
        const currentReport = await this.getScheduledReport(reportId);
        if (currentReport) {
          updateData.nextRun = this.calculateNextRun(
            updates.frequency || currentReport.frequency,
            updates.schedule || currentReport.schedule
          );
        }
      }

      await updateDoc(reportRef, updateData);

      // Reschedule if needed
      if (updates.frequency || updates.schedule) {
        this.cancelScheduledExecution(reportId);
        this.scheduleReportExecution(reportId, updateData.nextRun);
      }
    } catch (error) {
      console.error('Error updating scheduled report:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled reports
   */
  async getScheduledReports(): Promise<ScheduledReport[]> {
    try {
      const snapshot = await getDocs(collection(db, 'scheduledReports'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ScheduledReport));
    } catch (error) {
      console.error('Error getting scheduled reports:', error);
      return [];
    }
  }

  /**
   * Get scheduled report by ID
   */
  async getScheduledReport(reportId: string): Promise<ScheduledReport | null> {
    try {
      const reportDoc = await getDocs(query(
        collection(db, 'scheduledReports'),
        where('id', '==', reportId)
      ));
      
      if (reportDoc.empty) return null;
      
      return {
        id: reportDoc.docs[0].id,
        ...reportDoc.docs[0].data()
      } as ScheduledReport;
    } catch (error) {
      console.error('Error getting scheduled report:', error);
      return null;
    }
  }

  /**
   * Delete a scheduled report
   */
  async deleteScheduledReport(reportId: string): Promise<void> {
    try {
      this.cancelScheduledExecution(reportId);
      // Note: In a real implementation, you'd also delete the document from Firestore
      console.log(`Scheduled report ${reportId} deleted`);
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
      throw error;
    }
  }

  /**
   * Execute a report immediately
   */
  async executeReport(reportId: string, parameters: Record<string, any> = {}): Promise<ReportExecution> {
    try {
      const report = await this.getScheduledReport(reportId);
      if (!report) throw new Error('Report not found');

      const execution: Omit<ReportExecution, 'id'> = {
        reportId,
        status: 'running',
        startedAt: new Date().toISOString(),
        parameters
      };

      const docRef = await addDoc(collection(db, 'reportExecutions'), execution);
      const executionId = docRef.id;

      // Execute the report
      const result = await this.generateReport(report, parameters);
      
      // Update execution status
      await updateDoc(doc(db, 'reportExecutions', executionId), {
        status: 'completed',
        completedAt: new Date().toISOString(),
        result
      });

      // Update report last run
      await updateDoc(doc(db, 'scheduledReports', reportId), {
        lastRun: new Date().toISOString(),
        nextRun: this.calculateNextRun(report.frequency, report.schedule)
      });

      return {
        id: executionId,
        ...execution,
        status: 'completed',
        completedAt: new Date().toISOString(),
        result
      };
    } catch (error) {
      console.error('Error executing report:', error);
      throw error;
    }
  }

  /**
   * Generate report data
   */
  private async generateReport(report: ScheduledReport, parameters: Record<string, any>): Promise<ReportExecution['result']> {
    try {
      let data: any[] = [];
      let recordCount = 0;

      switch (report.type) {
        case 'kpi_summary':
          data = await this.generateKpiSummaryReport(report.filters, parameters);
          break;
        case 'employee_performance':
          data = await this.generateEmployeePerformanceReport(report.filters, parameters);
          break;
        case 'department_analysis':
          data = await this.generateDepartmentAnalysisReport(report.filters, parameters);
          break;
        case 'reward_calculation':
          data = await this.generateRewardCalculationReport(report.filters, parameters);
          break;
        default:
          throw new Error(`Unknown report type: ${report.type}`);
      }

      recordCount = data.length;

      // Generate file if needed
      let fileUrl: string | undefined;
      if (report.format !== 'email') {
        fileUrl = await this.generateReportFile(data, report.format, report.name);
      }

      // Send email if needed
      let emailSent = false;
      if (report.format === 'email' || report.recipients.length > 0) {
        emailSent = await this.sendReportEmail(report, data, fileUrl);
      }

      return {
        recordCount,
        fileUrl,
        emailSent
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Generate KPI summary report
   */
  private async generateKpiSummaryReport(filters: Record<string, any>, parameters: Record<string, any>): Promise<any[]> {
    // This would query your KPI data
    // For now, return mock data
    return [
      {
        kpiName: 'Sales Target',
        department: 'Sales',
        target: 1000000,
        actual: 850000,
        performance: 85,
        period: '2024-01'
      },
      {
        kpiName: 'Customer Satisfaction',
        department: 'Support',
        target: 90,
        actual: 92,
        performance: 102,
        period: '2024-01'
      }
    ];
  }

  /**
   * Generate employee performance report
   */
  private async generateEmployeePerformanceReport(filters: Record<string, any>, parameters: Record<string, any>): Promise<any[]> {
    // This would query your employee performance data
    return [
      {
        employeeName: 'John Doe',
        department: 'Sales',
        kpiCount: 5,
        averagePerformance: 87,
        totalScore: 435,
        period: '2024-01'
      }
    ];
  }

  /**
   * Generate department analysis report
   */
  private async generateDepartmentAnalysisReport(filters: Record<string, any>, parameters: Record<string, any>): Promise<any[]> {
    // This would query your department data
    return [
      {
        departmentName: 'Sales',
        employeeCount: 10,
        averagePerformance: 85,
        totalKPIs: 15,
        period: '2024-01'
      }
    ];
  }

  /**
   * Generate reward calculation report
   */
  private async generateRewardCalculationReport(filters: Record<string, any>, parameters: Record<string, any>): Promise<any[]> {
    // This would query your reward data
    return [
      {
        employeeName: 'John Doe',
        department: 'Sales',
        totalReward: 500000,
        performanceScore: 87,
        period: '2024-01'
      }
    ];
  }

  /**
   * Generate report file
   */
  private async generateReportFile(data: any[], format: string, reportName: string): Promise<string> {
    // This would generate actual files (PDF, Excel, CSV)
    // For now, return a mock URL
    return `https://example.com/reports/${reportName}_${Date.now()}.${format}`;
  }

  /**
   * Send report email
   */
  private async sendReportEmail(report: ScheduledReport, data: any[], fileUrl?: string): Promise<boolean> {
    // This would integrate with your email service
    console.log(`Sending report email to ${report.recipients.length} recipients`);
    return true;
  }

  /**
   * Calculate next run time
   */
  private calculateNextRun(frequency: string, schedule: ScheduledReport['schedule']): string {
    const now = new Date();
    const nextRun = new Date(now);

    switch (frequency) {
      case 'daily':
        nextRun.setHours(schedule.hour, schedule.minute, 0, 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      
      case 'weekly':
        nextRun.setHours(schedule.hour, schedule.minute, 0, 0);
        const dayOfWeek = schedule.dayOfWeek || 0;
        const daysUntilNext = (dayOfWeek - now.getDay() + 7) % 7;
        nextRun.setDate(now.getDate() + daysUntilNext);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7);
        }
        break;
      
      case 'monthly':
        nextRun.setHours(schedule.hour, schedule.minute, 0, 0);
        const dayOfMonth = schedule.dayOfMonth || 1;
        nextRun.setDate(dayOfMonth);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
      
      case 'quarterly':
        nextRun.setHours(schedule.hour, schedule.minute, 0, 0);
        nextRun.setMonth(Math.floor(now.getMonth() / 3) * 3 + 3);
        nextRun.setDate(1);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 3);
        }
        break;
      
      case 'annually':
        nextRun.setHours(schedule.hour, schedule.minute, 0, 0);
        nextRun.setMonth(0);
        nextRun.setDate(1);
        if (nextRun <= now) {
          nextRun.setFullYear(nextRun.getFullYear() + 1);
        }
        break;
    }

    return nextRun.toISOString();
  }

  /**
   * Schedule report execution
   */
  private scheduleReportExecution(reportId: string, nextRun: string): void {
    const runTime = new Date(nextRun).getTime();
    const now = Date.now();
    const delay = runTime - now;

    if (delay > 0) {
      const timeoutId = setTimeout(async () => {
        try {
          await this.executeReport(reportId);
          // Reschedule for next run
          const report = await this.getScheduledReport(reportId);
          if (report && report.isActive) {
            this.scheduleReportExecution(reportId, report.nextRun);
          }
        } catch (error) {
          console.error('Error executing scheduled report:', error);
        }
      }, delay);

      this.intervalIds.set(reportId, timeoutId);
    }
  }

  /**
   * Cancel scheduled execution
   */
  private cancelScheduledExecution(reportId: string): void {
    const timeoutId = this.intervalIds.get(reportId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.intervalIds.delete(reportId);
    }
  }

  /**
   * Get report templates
   */
  async getReportTemplates(): Promise<ReportTemplate[]> {
    try {
      const snapshot = await getDocs(collection(db, 'reportTemplates'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ReportTemplate));
    } catch (error) {
      console.error('Error getting report templates:', error);
      return [];
    }
  }

  /**
   * Get report executions
   */
  async getReportExecutions(reportId?: string): Promise<ReportExecution[]> {
    try {
      let q = query(collection(db, 'reportExecutions'), orderBy('startedAt', 'desc'), limit(50));
      
      if (reportId) {
        q = query(q, where('reportId', '==', reportId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ReportExecution));
    } catch (error) {
      console.error('Error getting report executions:', error);
      return [];
    }
  }

  /**
   * Initialize scheduled reports
   */
  async initializeScheduledReports(): Promise<void> {
    try {
      const reports = await this.getScheduledReports();
      
      for (const report of reports) {
        if (report.isActive) {
          this.scheduleReportExecution(report.id, report.nextRun);
        }
      }
    } catch (error) {
      console.error('Error initializing scheduled reports:', error);
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.intervalIds.forEach(timeoutId => clearTimeout(timeoutId));
    this.intervalIds.clear();
  }
}

export const scheduledReportService = ScheduledReportService.getInstance();

// Default report templates
export const defaultReportTemplates: Omit<ReportTemplate, 'id'>[] = [
  {
    name: 'KPI Summary Report',
    description: 'Comprehensive KPI performance summary',
    type: 'kpi_summary',
    query: 'SELECT * FROM kpis WHERE period = ?',
    parameters: [
      { name: 'period', label: 'Period', type: 'string', required: true },
      { name: 'department', label: 'Department', type: 'select', required: false, options: ['Sales', 'Marketing', 'Support'] }
    ],
    isDefault: true
  },
  {
    name: 'Employee Performance Report',
    description: 'Individual employee performance analysis',
    type: 'employee_performance',
    query: 'SELECT * FROM employee_performance WHERE period = ?',
    parameters: [
      { name: 'period', label: 'Period', type: 'string', required: true },
      { name: 'employeeId', label: 'Employee ID', type: 'string', required: false }
    ],
    isDefault: true
  },
  {
    name: 'Department Analysis Report',
    description: 'Department-level performance analysis',
    type: 'department_analysis',
    query: 'SELECT * FROM department_performance WHERE period = ?',
    parameters: [
      { name: 'period', label: 'Period', type: 'string', required: true },
      { name: 'departmentId', label: 'Department ID', type: 'string', required: false }
    ],
    isDefault: true
  },
  {
    name: 'Reward Calculation Report',
    description: 'Reward calculations and distributions',
    type: 'reward_calculation',
    query: 'SELECT * FROM reward_calculations WHERE period = ?',
    parameters: [
      { name: 'period', label: 'Period', type: 'string', required: true },
      { name: 'department', label: 'Department', type: 'select', required: false, options: ['Sales', 'Marketing', 'Support'] }
    ],
    isDefault: true
  }
];
