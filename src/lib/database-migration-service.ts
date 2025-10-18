import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { 
  Organization, 
  Department, 
  Employee, 
  KpiCategory, 
  EnhancedKpi, 
  EnhancedKpiRecord, 
  RewardProgram, 
  RewardCalculation 
} from '@/types';

export interface MigrationProgress {
  step: string;
  completed: number;
  total: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
}

export interface MigrationResult {
  success: boolean;
  message: string;
  stats: {
    organizationsCreated: number;
    departmentsMigrated: number;
    employeesMigrated: number;
    kpisMigrated: number;
    recordsMigrated: number;
    programsCreated: number;
  };
}

class DatabaseMigrationService {
  private progressCallback?: (progress: MigrationProgress) => void;

  constructor(progressCallback?: (progress: MigrationProgress) => void) {
    this.progressCallback = progressCallback;
  }

  private updateProgress(step: string, completed: number, total: number, status: MigrationProgress['status'], message?: string) {
    if (this.progressCallback) {
      this.progressCallback({
        step,
        completed,
        total,
        status,
        message
      });
    }
  }

  async migrateToMultiTenant(): Promise<MigrationResult> {
    try {
      this.updateProgress('Starting migration', 0, 100, 'running', 'Initializing migration process...');

      const stats = {
        organizationsCreated: 0,
        departmentsMigrated: 0,
        employeesMigrated: 0,
        kpisMigrated: 0,
        recordsMigrated: 0,
        programsCreated: 0
      };

      // Step 1: Create default organization
      this.updateProgress('Creating organization', 10, 100, 'running', 'Creating default organization...');
      const organizationId = await this.createDefaultOrganization();
      stats.organizationsCreated = 1;

      // Step 2: Migrate departments
      this.updateProgress('Migrating departments', 20, 100, 'running', 'Migrating departments...');
      const departmentMap = await this.migrateDepartments(organizationId);
      stats.departmentsMigrated = Object.keys(departmentMap).length;

      // Step 3: Migrate employees
      this.updateProgress('Migrating employees', 40, 100, 'running', 'Migrating employees...');
      const employeeMap = await this.migrateEmployees(organizationId, departmentMap);
      stats.employeesMigrated = Object.keys(employeeMap).length;

      // Step 4: Create KPI categories
      this.updateProgress('Creating KPI categories', 50, 100, 'running', 'Creating KPI categories...');
      const categoryMap = await this.createKpiCategories(organizationId);

      // Step 5: Migrate KPIs
      this.updateProgress('Migrating KPIs', 60, 100, 'running', 'Migrating KPIs...');
      const kpiMap = await this.migrateKpis(organizationId, departmentMap, categoryMap);
      stats.kpisMigrated = Object.keys(kpiMap).length;

      // Step 6: Migrate KPI records
      this.updateProgress('Migrating KPI records', 70, 100, 'running', 'Migrating KPI records...');
      stats.recordsMigrated = await this.migrateKpiRecords(organizationId, employeeMap, kpiMap);

      // Step 7: Create reward programs
      this.updateProgress('Creating reward programs', 80, 100, 'running', 'Creating reward programs...');
      stats.programsCreated = await this.createRewardPrograms(organizationId);

      // Step 8: Migrate reward calculations
      this.updateProgress('Migrating reward calculations', 90, 100, 'running', 'Migrating reward calculations...');
      await this.migrateRewardCalculations(organizationId, employeeMap);

      this.updateProgress('Migration completed', 100, 100, 'completed', 'Migration completed successfully!');

      return {
        success: true,
        message: 'Migration completed successfully',
        stats
      };

    } catch (error) {
      console.error('Migration failed:', error);
      this.updateProgress('Migration failed', 0, 100, 'error', `Migration failed: ${error}`);
      
      return {
        success: false,
        message: `Migration failed: ${error}`,
        stats: {
          organizationsCreated: 0,
          departmentsMigrated: 0,
          employeesMigrated: 0,
          kpisMigrated: 0,
          recordsMigrated: 0,
          programsCreated: 0
        }
      };
    }
  }

  private async createDefaultOrganization(): Promise<string> {
    const organizationData: Omit<Organization, 'id'> = {
      name: 'Default Organization',
      code: 'DEFAULT',
      description: 'Default organization created during migration',
      settings: {
        currency: 'VND',
        timezone: 'Asia/Ho_Chi_Minh',
        language: 'vi'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    const docRef = await addDoc(collection(db, 'organizations'), organizationData);
    return docRef.id;
  }

  private async migrateDepartments(organizationId: string): Promise<Record<string, string>> {
    const departmentsSnapshot = await getDocs(collection(db, 'departments'));
    const departmentMap: Record<string, string> = {};
    const batch = writeBatch(db);

    departmentsSnapshot.forEach((doc) => {
      const oldData = doc.data();
      const newData: Omit<Department, 'id'> = {
        organizationId,
        name: oldData.name,
        code: oldData.name.toUpperCase().replace(/\s+/g, '_'),
        description: oldData.description,
        managerId: oldData.managerId,
        parentId: undefined, // Will be set later for hierarchical structure
        level: 1, // All departments start at level 1
        budget: oldData.budget,
        createdAt: oldData.createdAt,
        updatedAt: new Date().toISOString(),
        isActive: oldData.isActive
      };

      const newDocRef = doc(collection(db, 'departments'));
      batch.set(newDocRef, newData);
      departmentMap[doc.id] = newDocRef.id;
    });

    await batch.commit();
    return departmentMap;
  }

  private async migrateEmployees(organizationId: string, departmentMap: Record<string, string>): Promise<Record<string, string>> {
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    const employeeMap: Record<string, string> = {};
    const batch = writeBatch(db);

    employeesSnapshot.forEach((doc) => {
      const oldData = doc.data();
      const newData: Omit<Employee, 'id'> = {
        organizationId,
        departmentId: departmentMap[oldData.departmentId] || '',
        employeeCode: oldData.employeeId || oldData.id,
        personalInfo: {
          fullName: oldData.name,
          email: oldData.email,
          phone: oldData.phone,
          avatar: oldData.avatar,
          position: oldData.position || 'Employee',
          level: 'Staff'
        },
        workInfo: {
          startDate: oldData.startDate,
          endDate: oldData.endDate,
          salary: oldData.salary,
          managerId: oldData.managerId,
          employmentType: 'full-time'
        },
        systemInfo: {
          role: oldData.role === 'admin' ? 'admin' : 'employee',
          isActive: oldData.isActive,
          lastLoginAt: undefined
        },
        createdAt: oldData.createdAt,
        updatedAt: new Date().toISOString()
      };

      const newDocRef = doc(collection(db, 'employees'));
      batch.set(newDocRef, newData);
      employeeMap[doc.id] = newDocRef.id;
    });

    await batch.commit();
    return employeeMap;
  }

  private async createKpiCategories(organizationId: string): Promise<Record<string, string>> {
    const categories = [
      { name: 'Sales', description: 'Sales performance metrics', color: '#10B981', icon: '📈' },
      { name: 'Customer Service', description: 'Customer service metrics', color: '#3B82F6', icon: '🎧' },
      { name: 'Operations', description: 'Operational efficiency metrics', color: '#F59E0B', icon: '⚙️' },
      { name: 'Quality', description: 'Quality control metrics', color: '#8B5CF6', icon: '✅' },
      { name: 'Innovation', description: 'Innovation and development metrics', color: '#EF4444', icon: '💡' }
    ];

    const categoryMap: Record<string, string> = {};
    const batch = writeBatch(db);

    categories.forEach((category, index) => {
      const categoryData: Omit<KpiCategory, 'id'> = {
        organizationId,
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon,
        weight: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };

      const newDocRef = doc(collection(db, 'kpiCategories'));
      batch.set(newDocRef, categoryData);
      categoryMap[category.name] = newDocRef.id;
    });

    await batch.commit();
    return categoryMap;
  }

  private async migrateKpis(organizationId: string, departmentMap: Record<string, string>, categoryMap: Record<string, string>): Promise<Record<string, string>> {
    const kpisSnapshot = await getDocs(collection(db, 'kpis'));
    const kpiMap: Record<string, string> = {};
    const batch = writeBatch(db);

    kpisSnapshot.forEach((doc) => {
      const oldData = doc.data();
      const newData: Omit<EnhancedKpi, 'id'> = {
        organizationId,
        departmentId: departmentMap[oldData.departmentId] || undefined,
        categoryId: categoryMap['Operations'] || '', // Default to Operations category
        name: oldData.name,
        code: oldData.name.toUpperCase().replace(/\s+/g, '_'),
        description: oldData.description,
        type: 'number',
        unit: oldData.unit,
        frequency: oldData.frequency,
        targets: {
          minimum: oldData.target * 0.6,
          target: oldData.target,
          excellent: oldData.target * 1.2
        },
        settings: {
          isActive: true,
          requiresApproval: true,
          autoCalculation: false
        },
        createdAt: oldData.createdAt,
        updatedAt: new Date().toISOString()
      };

      const newDocRef = doc(collection(db, 'kpis'));
      batch.set(newDocRef, newData);
      kpiMap[doc.id] = newDocRef.id;
    });

    await batch.commit();
    return kpiMap;
  }

  private async migrateKpiRecords(organizationId: string, employeeMap: Record<string, string>, kpiMap: Record<string, string>): Promise<number> {
    const recordsSnapshot = await getDocs(collection(db, 'kpiRecords'));
    const batch = writeBatch(db);
    let count = 0;

    recordsSnapshot.forEach((doc) => {
      const oldData = doc.data();
      const newData: Omit<EnhancedKpiRecord, 'id'> = {
        organizationId,
        employeeId: employeeMap[oldData.employeeId] || '',
        departmentId: '', // Will be populated from employee data
        kpiId: kpiMap[oldData.kpiId] || '',
        period: oldData.period || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        targetValue: oldData.target || 0,
        actualValue: oldData.actual || 0,
        achievementRate: oldData.actual && oldData.target ? (oldData.actual / oldData.target) * 100 : 0,
        score: oldData.score || 0,
        status: oldData.status || 'submitted',
        submittedAt: oldData.submittedAt,
        approvedAt: oldData.approvedAt,
        approvedBy: oldData.approvedBy,
        notes: oldData.notes,
        attachments: oldData.attachments || [],
        createdAt: oldData.createdAt,
        updatedAt: new Date().toISOString()
      };

      const newDocRef = doc(collection(db, 'kpiRecords'));
      batch.set(newDocRef, newData);
      count++;
    });

    await batch.commit();
    return count;
  }

  private async createRewardPrograms(organizationId: string): Promise<number> {
    const programs = [
      {
        name: 'Monthly Performance Bonus',
        description: 'Monthly performance-based reward program',
        period: 'monthly' as const,
        eligibility: {
          minPerformance: 70
        },
        structure: {
          baseAmount: 1000000,
          multipliers: {
            excellent: 2.0,
            good: 1.5,
            average: 1.0,
            poor: 0.5
          }
        }
      },
      {
        name: 'Quarterly Achievement Award',
        description: 'Quarterly achievement recognition program',
        period: 'quarterly' as const,
        eligibility: {
          minPerformance: 80
        },
        structure: {
          baseAmount: 5000000,
          multipliers: {
            excellent: 3.0,
            good: 2.0,
            average: 1.5,
            poor: 0.0
          }
        }
      }
    ];

    const batch = writeBatch(db);

    programs.forEach((program) => {
      const programData: Omit<RewardProgram, 'id'> = {
        organizationId,
        name: program.name,
        description: program.description,
        period: program.period,
        eligibility: program.eligibility,
        structure: program.structure,
        settings: {
          isActive: true,
          autoCalculate: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newDocRef = doc(collection(db, 'rewardPrograms'));
      batch.set(newDocRef, programData);
    });

    await batch.commit();
    return programs.length;
  }

  private async migrateRewardCalculations(organizationId: string, employeeMap: Record<string, string>): Promise<void> {
    const calculationsSnapshot = await getDocs(collection(db, 'rewardCalculations'));
    const batch = writeBatch(db);

    calculationsSnapshot.forEach((doc) => {
      const oldData = doc.data();
      const newData: Omit<RewardCalculation, 'id'> = {
        organizationId,
        employeeId: employeeMap[oldData.employeeId] || '',
        departmentId: '', // Will be populated from employee data
        programId: '', // Will be set to default program
        period: oldData.period || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        performance: {
          kpiScore: oldData.kpiScore || 0,
          achievementRate: oldData.achievementRate || 0,
          grade: oldData.grade || 'average'
        },
        calculation: {
          baseAmount: oldData.baseAmount || 0,
          multiplier: oldData.multiplier || 1,
          totalReward: oldData.totalReward || 0,
          penalties: oldData.penalties || 0,
          netAmount: oldData.netAmount || 0
        },
        status: oldData.status || 'calculated',
        calculatedAt: oldData.calculatedAt || new Date().toISOString(),
        approvedAt: oldData.approvedAt,
        approvedBy: oldData.approvedBy,
        paidAt: oldData.paidAt,
        createdAt: oldData.createdAt,
        updatedAt: new Date().toISOString()
      };

      const newDocRef = doc(collection(db, 'rewardCalculations'));
      batch.set(newDocRef, newData);
    });

    await batch.commit();
  }

  async rollbackMigration(): Promise<boolean> {
    try {
      // Delete all new collections
      const collections = ['organizations', 'departments', 'employees', 'kpiCategories', 'kpis', 'kpiRecords', 'rewardPrograms', 'rewardCalculations'];
      
      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName));
        const batch = writeBatch(db);
        
        snapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
      }

      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }
}

export default DatabaseMigrationService;