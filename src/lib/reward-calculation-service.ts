import { collection, getDocs, query, where, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { KpiRecord, Employee, Kpi } from '@/types';

export interface RewardCalculation {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  period: string;
  kpiScore: number;
  reportScore: number;
  behaviorScore: number;
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D';
  baseReward: number;
  performanceMultiplier: number;
  performanceReward: number;
  penalty: number;
  totalReward: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export interface RewardPolicy {
  id: string;
  name: string;
  gradeRanges: {
    A: { min: number; max: number; multiplier: number };
    B: { min: number; max: number; multiplier: number };
    C: { min: number; max: number; multiplier: number };
    D: { min: number; max: number; multiplier: number };
  };
  baseReward: number;
  maxReward: number;
  penaltyRate: number;
  isActive: boolean;
}

export interface EvaluationCriteria {
  kpiWeight: number; // 0-60 points
  reportWeight: number; // 0-20 points
  behaviorWeight: number; // 0-20 points
}

class RewardCalculationService {
  private static instance: RewardCalculationService;
  private defaultPolicy: RewardPolicy;
  private defaultCriteria: EvaluationCriteria;

  private constructor() {
    this.defaultPolicy = {
      id: 'default',
      name: 'Default Reward Policy',
      gradeRanges: {
        A: { min: 90, max: 100, multiplier: 1.2 },
        B: { min: 75, max: 89, multiplier: 1.0 },
        C: { min: 60, max: 74, multiplier: 0.8 },
        D: { min: 0, max: 59, multiplier: 0.5 }
      },
      baseReward: 1000000, // 1M VND
      maxReward: 5000000, // 5M VND
      penaltyRate: 0.1, // 10%
      isActive: true
    };

    this.defaultCriteria = {
      kpiWeight: 60,
      reportWeight: 20,
      behaviorWeight: 20
    };
  }

  public static getInstance(): RewardCalculationService {
    if (!RewardCalculationService.instance) {
      RewardCalculationService.instance = new RewardCalculationService();
    }
    return RewardCalculationService.instance;
  }

  /**
   * Calculate reward for a single employee
   */
  async calculateEmployeeReward(
    employeeId: string,
    period: string,
    policy?: RewardPolicy,
    criteria?: EvaluationCriteria
  ): Promise<RewardCalculation> {
    try {
      const usedPolicy = policy || this.defaultPolicy;
      const usedCriteria = criteria || this.defaultCriteria;

      // Get employee data
      const employee = await this.getEmployee(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Get KPI records for the period
      const kpiRecords = await this.getKpiRecordsForPeriod(employeeId, period);
      
      // Calculate scores
      const kpiScore = this.calculateKpiScore(kpiRecords, usedCriteria.kpiWeight);
      const reportScore = this.calculateReportScore(kpiRecords, usedCriteria.reportWeight);
      const behaviorScore = this.calculateBehaviorScore(employee, usedCriteria.behaviorWeight);
      
      const totalScore = kpiScore + reportScore + behaviorScore;
      const grade = this.determineGrade(totalScore, usedPolicy);
      
      // Calculate rewards
      const baseReward = usedPolicy.baseReward;
      const performanceMultiplier = usedPolicy.gradeRanges[grade].multiplier;
      const performanceReward = baseReward * performanceMultiplier;
      const penalty = this.calculatePenalty(kpiRecords, usedPolicy.penaltyRate);
      const totalReward = Math.max(0, performanceReward - penalty);

      const calculation: Omit<RewardCalculation, 'id'> = {
        employeeId,
        employeeName: employee.name,
        department: employee.departmentId,
        period,
        kpiScore,
        reportScore,
        behaviorScore,
        totalScore,
        grade,
        baseReward,
        performanceMultiplier,
        performanceReward,
        penalty,
        totalReward,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save calculation to database
      const docRef = await addDoc(collection(db, 'rewardCalculations'), calculation);
      
      return {
        id: docRef.id,
        ...calculation
      };
    } catch (error) {
      console.error('Error calculating employee reward:', error);
      throw error;
    }
  }

  /**
   * Calculate rewards for multiple employees
   */
  async calculateBulkRewards(
    employeeIds: string[],
    period: string,
    policy?: RewardPolicy,
    criteria?: EvaluationCriteria
  ): Promise<RewardCalculation[]> {
    const calculations: RewardCalculation[] = [];
    
    for (const employeeId of employeeIds) {
      try {
        const calculation = await this.calculateEmployeeReward(employeeId, period, policy, criteria);
        calculations.push(calculation);
      } catch (error) {
        console.error(`Error calculating reward for employee ${employeeId}:`, error);
        // Continue with other employees
      }
    }
    
    return calculations;
  }

  /**
   * Calculate KPI score (0-60 points)
   */
  private calculateKpiScore(kpiRecords: KpiRecord[], maxScore: number): number {
    if (kpiRecords.length === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    kpiRecords.forEach(record => {
      if (record.status === 'approved') {
        const completionRate = record.target > 0 ? (record.actual / record.target) * 100 : 0;
        const recordScore = Math.min(100, completionRate); // Cap at 100%
        const weightedScore = (recordScore / 100) * (record.weight || 1);
        
        totalScore += weightedScore;
        totalWeight += (record.weight || 1);
      }
    });
    
    if (totalWeight === 0) return 0;
    
    const averageScore = (totalScore / totalWeight) * 100;
    return Math.round((averageScore / 100) * maxScore);
  }

  /**
   * Calculate report submission score (0-20 points)
   */
  private calculateReportScore(kpiRecords: KpiRecord[], maxScore: number): number {
    if (kpiRecords.length === 0) return 0;
    
    const submittedReports = kpiRecords.filter(record => 
      record.status === 'approved' && record.actual > 0
    ).length;
    
    const submissionRate = (submittedReports / kpiRecords.length) * 100;
    return Math.round((submissionRate / 100) * maxScore);
  }

  /**
   * Calculate behavior score (0-20 points)
   * This is a placeholder - in real implementation, this would come from manager evaluations
   */
  private calculateBehaviorScore(employee: Employee, maxScore: number): number {
    // Placeholder: return a base score based on employee tenure
    const startDate = new Date(employee.startDate);
    const now = new Date();
    const monthsWorked = (now.getFullYear() - startDate.getFullYear()) * 12 + 
                        (now.getMonth() - startDate.getMonth());
    
    // Base score increases with tenure (capped at maxScore)
    const baseScore = Math.min(maxScore, Math.floor(monthsWorked / 6) * 2);
    return Math.max(10, baseScore); // Minimum 10 points
  }

  /**
   * Determine grade based on total score
   */
  private determineGrade(totalScore: number, policy: RewardPolicy): 'A' | 'B' | 'C' | 'D' {
    if (totalScore >= policy.gradeRanges.A.min && totalScore <= policy.gradeRanges.A.max) {
      return 'A';
    } else if (totalScore >= policy.gradeRanges.B.min && totalScore <= policy.gradeRanges.B.max) {
      return 'B';
    } else if (totalScore >= policy.gradeRanges.C.min && totalScore <= policy.gradeRanges.C.max) {
      return 'C';
    } else {
      return 'D';
    }
  }

  /**
   * Calculate penalty based on overdue KPIs
   */
  private calculatePenalty(kpiRecords: KpiRecord[], penaltyRate: number): number {
    const overdueRecords = kpiRecords.filter(record => 
      record.status === 'rejected' || 
      (record.status === 'pending' && new Date(record.createdAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    );
    
    if (overdueRecords.length === 0) return 0;
    
    const totalPenalty = overdueRecords.reduce((sum, record) => {
      return sum + (record.penalty || 0);
    }, 0);
    
    return totalPenalty * penaltyRate;
  }

  /**
   * Get employee data
   */
  private async getEmployee(employeeId: string): Promise<Employee | null> {
    try {
      const employeesRef = collection(db, 'employees');
      const q = query(employeesRef, where('id', '==', employeeId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Employee;
    } catch (error) {
      console.error('Error fetching employee:', error);
      return null;
    }
  }

  /**
   * Get KPI records for a specific period
   */
  private async getKpiRecordsForPeriod(employeeId: string, period: string): Promise<KpiRecord[]> {
    try {
      const kpiRecordsRef = collection(db, 'kpiRecords');
      const q = query(
        kpiRecordsRef, 
        where('employeeId', '==', employeeId),
        where('period', '==', period),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const records: KpiRecord[] = [];
      querySnapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() } as KpiRecord);
      });
      
      return records;
    } catch (error) {
      console.error('Error fetching KPI records:', error);
      return [];
    }
  }

  /**
   * Get reward calculations for a period
   */
  async getRewardCalculations(period: string): Promise<RewardCalculation[]> {
    try {
      const calculationsRef = collection(db, 'rewardCalculations');
      const q = query(
        calculationsRef,
        where('period', '==', period),
        orderBy('totalScore', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const calculations: RewardCalculation[] = [];
      querySnapshot.forEach((doc) => {
        calculations.push({ id: doc.id, ...doc.data() } as RewardCalculation);
      });
      
      return calculations;
    } catch (error) {
      console.error('Error fetching reward calculations:', error);
      return [];
    }
  }

  /**
   * Update reward calculation status
   */
  async updateRewardStatus(calculationId: string, status: 'pending' | 'approved' | 'paid'): Promise<void> {
    try {
      const calculationRef = doc(db, 'rewardCalculations', calculationId);
      await updateDoc(calculationRef, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating reward status:', error);
      throw error;
    }
  }

  /**
   * Get reward statistics for a period
   */
  async getRewardStatistics(period: string): Promise<{
    totalEmployees: number;
    totalRewardAmount: number;
    averageReward: number;
    gradeDistribution: Record<string, number>;
    departmentBreakdown: Record<string, number>;
  }> {
    try {
      const calculations = await this.getRewardCalculations(period);
      
      const stats = {
        totalEmployees: calculations.length,
        totalRewardAmount: calculations.reduce((sum, calc) => sum + calc.totalReward, 0),
        averageReward: 0,
        gradeDistribution: {} as Record<string, number>,
        departmentBreakdown: {} as Record<string, number>
      };
      
      if (stats.totalEmployees > 0) {
        stats.averageReward = stats.totalRewardAmount / stats.totalEmployees;
      }
      
      // Calculate grade distribution
      calculations.forEach(calc => {
        stats.gradeDistribution[calc.grade] = (stats.gradeDistribution[calc.grade] || 0) + 1;
        stats.departmentBreakdown[calc.department] = (stats.departmentBreakdown[calc.department] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error calculating reward statistics:', error);
      throw error;
    }
  }

  /**
   * Export reward calculations to CSV
   */
  async exportRewardCalculations(period: string): Promise<string> {
    try {
      const calculations = await this.getRewardCalculations(period);
      
      const csvHeaders = [
        'Employee Name',
        'Department',
        'KPI Score',
        'Report Score',
        'Behavior Score',
        'Total Score',
        'Grade',
        'Base Reward',
        'Performance Multiplier',
        'Performance Reward',
        'Penalty',
        'Total Reward',
        'Status'
      ];
      
      const csvRows = calculations.map(calc => [
        calc.employeeName,
        calc.department,
        calc.kpiScore,
        calc.reportScore,
        calc.behaviorScore,
        calc.totalScore,
        calc.grade,
        calc.baseReward,
        calc.performanceMultiplier,
        calc.performanceReward,
        calc.penalty,
        calc.totalReward,
        calc.status
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      return csvContent;
    } catch (error) {
      console.error('Error exporting reward calculations:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const rewardCalculationService = RewardCalculationService.getInstance();
