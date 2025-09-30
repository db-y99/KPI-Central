import { collection, getDocs, query, where, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { KpiRecord, Employee, Kpi, KpiRewardPenalty, KpiRewardPenaltyRule, KpiRewardPenaltyCalculation } from '@/types';

export interface KpiRewardPenaltyCalculationResult {
  id: string;
  kpiRecordId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  kpiId: string;
  kpiName: string;
  period: string;
  targetValue: number;
  actualValue: number;
  achievementRate: number;
  rewardAmount: number;
  penaltyAmount: number;
  netAmount: number;
  status: 'pending' | 'calculated' | 'approved' | 'paid';
  calculatedAt: string;
  notes?: string;
  calculatedBy?: string;
  approvedBy?: string;
  paidAt?: string;
}

class KpiRewardPenaltyService {
  private static instance: KpiRewardPenaltyService;

  private constructor() {}

  public static getInstance(): KpiRewardPenaltyService {
    if (!KpiRewardPenaltyService.instance) {
      KpiRewardPenaltyService.instance = new KpiRewardPenaltyService();
    }
    return KpiRewardPenaltyService.instance;
  }

  /**
   * Calculate reward/penalty for a single KPI record
   */
  async calculateKpiRewardPenalty(
    kpiRecord: KpiRecord,
    kpi: Kpi,
    employee: Employee
  ): Promise<KpiRewardPenaltyCalculationResult> {
    try {
      const achievementRate = kpiRecord.target > 0 ? (kpiRecord.actual / kpiRecord.target) * 100 : 0;
      
      let rewardAmount = 0;
      let penaltyAmount = 0;
      
      // Calculate reward based on achievement rate and KPI settings
      if (achievementRate >= (kpi.rewardThreshold || 80)) {
        if (kpi.rewardType === 'percentage') {
          rewardAmount = (kpi.reward || 0) * (achievementRate / 100);
        } else if (kpi.rewardType === 'variable') {
          // Variable reward based on achievement rate
          const baseReward = kpi.reward || 0;
          const multiplier = Math.min(achievementRate / 100, 1.5); // Cap at 150%
          rewardAmount = baseReward * multiplier;
        } else {
          // Fixed reward
          rewardAmount = kpi.reward || 0;
        }
        
        // Apply max reward limit
        if (kpi.maxReward && rewardAmount > kpi.maxReward) {
          rewardAmount = kpi.maxReward;
        }
      }
      
      // Calculate penalty based on achievement rate and KPI settings
      if (achievementRate < (kpi.penaltyThreshold || 60)) {
        if (kpi.penaltyType === 'interval') {
          penaltyAmount = (kpi.penalty || 0) * ((100 - achievementRate) / 100);
        } else if (kpi.penaltyType === 'variable') {
          // Variable penalty based on how much below threshold
          const basePenalty = kpi.penalty || 0;
          const shortfall = (kpi.penaltyThreshold || 60) - achievementRate;
          const multiplier = Math.min(shortfall / 20, 2); // Cap at 200%
          penaltyAmount = basePenalty * multiplier;
        } else {
          // Fixed penalty
          penaltyAmount = kpi.penalty || 0;
        }
        
        // Apply max penalty limit
        if (kpi.maxPenalty && penaltyAmount > kpi.maxPenalty) {
          penaltyAmount = kpi.maxPenalty;
        }
      }
      
      const netAmount = rewardAmount - penaltyAmount;
      
      const result: Omit<KpiRewardPenaltyCalculationResult, 'id'> = {
        kpiRecordId: kpiRecord.id,
        employeeId: kpiRecord.employeeId,
        employeeName: employee.name,
        department: employee.departmentId,
        kpiId: kpiRecord.kpiId,
        kpiName: kpi.name,
        period: kpiRecord.period,
        targetValue: kpiRecord.target,
        actualValue: kpiRecord.actual,
        achievementRate,
        rewardAmount,
        penaltyAmount,
        netAmount,
        status: 'calculated',
        calculatedAt: new Date().toISOString(),
        notes: kpiRecord.notes
      };

      // Check if calculation already exists for this KPI record
      const existingQuery = query(
        collection(db, 'kpiRewardPenalties'),
        where('kpiRecordId', '==', kpiRecord.id)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      let docRef;
      if (existingSnapshot.empty) {
        // Create new calculation
        docRef = await addDoc(collection(db, 'kpiRewardPenalties'), result);
      } else {
        // Update existing calculation
        const existingDoc = existingSnapshot.docs[0];
        docRef = { id: existingDoc.id };
        await updateDoc(existingDoc.ref, {
          ...result,
          updatedAt: new Date().toISOString()
        });
      }
      
      return {
        id: docRef.id,
        ...result
      };
    } catch (error) {
      console.error('Error calculating KPI reward/penalty:', error);
      throw error;
    }
  }

  /**
   * Calculate reward/penalty for multiple KPI records
   */
  async calculateBulkKpiRewardPenalties(
    kpiRecords: KpiRecord[],
    kpis: Kpi[],
    employees: Employee[]
  ): Promise<KpiRewardPenaltyCalculationResult[]> {
    const results: KpiRewardPenaltyCalculationResult[] = [];
    
    for (const record of kpiRecords) {
      try {
        const kpi = kpis.find(k => k.id === record.kpiId || k.documentId === record.kpiId);
        const employee = employees.find(emp => emp.uid === record.employeeId || emp.id === record.employeeId || emp.documentId === record.employeeId);
        
        if (kpi && employee && record.status === 'approved') {
          const result = await this.calculateKpiRewardPenalty(record, kpi, employee);
          results.push(result);
        }
      } catch (error) {
        console.error(`Error calculating reward/penalty for KPI record ${record.id}:`, error);
        // Continue with other records
      }
    }
    
    return results;
  }

  /**
   * Remove duplicate calculations for the same KPI record, keeping only the latest one
   */
  async removeDuplicateCalculations(): Promise<void> {
    try {
      // Get all calculations grouped by kpiRecordId
      const calculationsRef = collection(db, 'kpiRewardPenalties');
      const q = query(calculationsRef, orderBy('kpiRecordId'), orderBy('calculatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const groupedCalculations: Record<string, any[]> = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!groupedCalculations[data.kpiRecordId]) {
          groupedCalculations[data.kpiRecordId] = [];
        }
        groupedCalculations[data.kpiRecordId].push({ id: doc.id, ...data });
      });
      
      // Remove duplicates - keep only the most recent one for each kpiRecordId
      const deletePromises: Promise<void>[] = [];
      
      Object.values(groupedCalculations).forEach((calculations) => {
        if (calculations.length > 1) {
          // Keep the first one (most recent due to order), delete the rest
          const duplicates = calculations.slice(1);
          duplicates.forEach((duplicate) => {
            deletePromises.push(updateDoc(doc(db, 'kpiRewardPenalties', duplicate.id), {
              deletedAt: new Date().toISOString(),
              isDeleted: true
            }));
          });
        }
      });
      
      await Promise.all(deletePromises);
      console.log(`Cleaned up duplicate calculations`);
    } catch (error) {
      console.error('Error removing duplicate calculations:', error);
      throw error;
    }
  }

  /**
   * Get KPI reward/penalty calculations for a period
   */
  async getKpiRewardPenalties(period: string): Promise<KpiRewardPenaltyCalculationResult[]> {
    try {
      const calculationsRef = collection(db, 'kpiRewardPenalties');
      const q = query(
        calculationsRef,
        where('period', '==', period),
        where('isDeleted', '==', false), // Exclude deleted records
        orderBy('netAmount', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const calculations: KpiRewardPenaltyCalculationResult[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter out deleted duplicates
        if (!data.isDeleted) {
          calculations.push({ id: doc.id, ...data } as KpiRewardPenaltyCalculationResult);
        }
      });
      
      return calculations;
    } catch (error) {
      console.error('Error fetching KPI reward/penalty calculations:', error);
      return [];
    }
  }

  /**
   * Get KPI reward/penalty calculations for an employee
   */
  async getEmployeeKpiRewardPenalties(
    employeeId: string,
    period?: string
  ): Promise<KpiRewardPenaltyCalculationResult[]> {
    try {
      const calculationsRef = collection(db, 'kpiRewardPenalties');
      let q = query(
        calculationsRef,
        where('employeeId', '==', employeeId),
        where('isDeleted', '==', false), // Exclude deleted records
        orderBy('calculatedAt', 'desc')
      );
      
      if (period) {
        q = query(
          calculationsRef,
          where('employeeId', '==', employeeId),
          where('period', '==', period),
          where('isDeleted', '==', false), // Exclude deleted records
          orderBy('calculatedAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const calculations: KpiRewardPenaltyCalculationResult[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter out deleted duplicates
        if (!data.isDeleted) {
          calculations.push({ id: doc.id, ...data } as KpiRewardPenaltyCalculationResult);
        }
      });
      
      return calculations;
    } catch (error) {
      console.error('Error fetching employee KPI reward/penalty calculations:', error);
      return [];
    }
  }

  /**
   * Update KPI reward/penalty status
   */
  async updateKpiRewardPenaltyStatus(
    calculationId: string,
    status: 'pending' | 'calculated' | 'approved' | 'paid',
    updatedBy?: string
  ): Promise<void> {
    try {
      const calculationRef = doc(db, 'kpiRewardPenalties', calculationId);
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };
      
      if (status === 'approved' && updatedBy) {
        updateData.approvedBy = updatedBy;
        updateData.approvedAt = new Date().toISOString();
      } else if (status === 'paid') {
        updateData.paidAt = new Date().toISOString();
      }
      
      await updateDoc(calculationRef, updateData);
    } catch (error) {
      console.error('Error updating KPI reward/penalty status:', error);
      throw error;
    }
  }

  /**
   * Get KPI reward/penalty statistics for a period
   */
  async getKpiRewardPenaltyStatistics(period: string): Promise<{
    totalCalculations: number;
    totalRewardAmount: number;
    totalPenaltyAmount: number;
    netAmount: number;
    averageAchievement: number;
    performanceDistribution: {
      excellent: number;
      good: number;
      acceptable: number;
      poor: number;
    };
    departmentBreakdown: Record<string, number>;
    statusDistribution: Record<string, number>;
  }> {
    try {
      const calculations = await this.getKpiRewardPenalties(period);
      
      const stats = {
        totalCalculations: calculations.length,
        totalRewardAmount: calculations.reduce((sum, calc) => sum + calc.rewardAmount, 0),
        totalPenaltyAmount: calculations.reduce((sum, calc) => sum + calc.penaltyAmount, 0),
        netAmount: 0,
        averageAchievement: 0,
        performanceDistribution: {
          excellent: 0,
          good: 0,
          acceptable: 0,
          poor: 0
        },
        departmentBreakdown: {} as Record<string, number>,
        statusDistribution: {} as Record<string, number>
      };
      
      if (stats.totalCalculations > 0) {
        stats.netAmount = stats.totalRewardAmount - stats.totalPenaltyAmount;
        stats.averageAchievement = calculations.reduce((sum, calc) => sum + calc.achievementRate, 0) / stats.totalCalculations;
        
        // Calculate performance distribution
        calculations.forEach(calc => {
          if (calc.achievementRate >= 100) {
            stats.performanceDistribution.excellent++;
          } else if (calc.achievementRate >= 80) {
            stats.performanceDistribution.good++;
          } else if (calc.achievementRate >= 60) {
            stats.performanceDistribution.acceptable++;
          } else {
            stats.performanceDistribution.poor++;
          }
          
          // Department breakdown
          stats.departmentBreakdown[calc.department] = (stats.departmentBreakdown[calc.department] || 0) + 1;
          
          // Status distribution
          stats.statusDistribution[calc.status] = (stats.statusDistribution[calc.status] || 0) + 1;
        });
      }
      
      return stats;
    } catch (error) {
      console.error('Error calculating KPI reward/penalty statistics:', error);
      throw error;
    }
  }

  /**
   * Export KPI reward/penalty calculations to CSV
   */
  async exportKpiRewardPenalties(period: string): Promise<string> {
    try {
      const calculations = await this.getKpiRewardPenalties(period);
      
      const csvHeaders = [
        'Employee Name',
        'Department',
        'KPI Name',
        'Period',
        'Target Value',
        'Actual Value',
        'Achievement Rate (%)',
        'Reward Amount',
        'Penalty Amount',
        'Net Amount',
        'Status',
        'Calculated At'
      ];
      
      const csvRows = calculations.map(calc => [
        calc.employeeName,
        calc.department,
        calc.kpiName,
        calc.period,
        calc.targetValue,
        calc.actualValue,
        calc.achievementRate.toFixed(2),
        calc.rewardAmount,
        calc.penaltyAmount,
        calc.netAmount,
        calc.status,
        calc.calculatedAt
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      return csvContent;
    } catch (error) {
      console.error('Error exporting KPI reward/penalty calculations:', error);
      throw error;
    }
  }

  /**
   * Create KPI reward/penalty rule
   */
  async createKpiRewardPenaltyRule(rule: Omit<KpiRewardPenaltyRule, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'kpiRewardPenaltyRules'), {
        ...rule,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating KPI reward/penalty rule:', error);
      throw error;
    }
  }

  /**
   * Get KPI reward/penalty rules for a KPI
   */
  async getKpiRewardPenaltyRules(kpiId: string): Promise<KpiRewardPenaltyRule[]> {
    try {
      const rulesRef = collection(db, 'kpiRewardPenaltyRules');
      const q = query(
        rulesRef,
        where('kpiId', '==', kpiId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const rules: KpiRewardPenaltyRule[] = [];
      querySnapshot.forEach((doc) => {
        rules.push({ id: doc.id, ...doc.data() } as KpiRewardPenaltyRule);
      });
      
      return rules;
    } catch (error) {
      console.error('Error fetching KPI reward/penalty rules:', error);
      return [];
    }
  }
}

// Export singleton instance
export const kpiRewardPenaltyService = KpiRewardPenaltyService.getInstance();
