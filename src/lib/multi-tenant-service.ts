import { collection, doc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

// Multi-tenant service for organization-based data management
export class MultiTenantService {
  private static instance: MultiTenantService;
  private currentOrganizationId: string | null = null;

  public static getInstance(): MultiTenantService {
    if (!MultiTenantService.instance) {
      MultiTenantService.instance = new MultiTenantService();
    }
    return MultiTenantService.instance;
  }

  /**
   * Set current organization context
   */
  setCurrentOrganization(organizationId: string): void {
    this.currentOrganizationId = organizationId;
    console.log('Current organization set to:', organizationId);
  }

  /**
   * Get current organization ID
   */
  getCurrentOrganizationId(): string | null {
    return this.currentOrganizationId;
  }

  /**
   * Get organization by ID
   */
  async getOrganization(organizationId: string): Promise<any> {
    try {
      const orgSnapshot = await getDocs(query(
        collection(db, 'organizations'),
        where('id', '==', organizationId),
        limit(1)
      ));

      if (orgSnapshot.empty) {
        throw new Error('Organization not found');
      }

      return orgSnapshot.docs[0].data();
    } catch (error) {
      console.error('Error getting organization:', error);
      throw error;
    }
  }

  /**
   * Get all organizations (admin only)
   */
  async getAllOrganizations(): Promise<any[]> {
    try {
      const snapshot = await getDocs(query(
        collection(db, 'organizations'),
        orderBy('createdAt', 'desc')
      ));

      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting organizations:', error);
      throw error;
    }
  }

  /**
   * Get departments for current organization
   */
  async getDepartments(organizationId?: string): Promise<any[]> {
    const orgId = organizationId || this.currentOrganizationId;
    if (!orgId) {
      throw new Error('No organization context set');
    }

    try {
      const snapshot = await getDocs(query(
        collection(db, 'departments'),
        where('organizationId', '==', orgId),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      ));

      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting departments:', error);
      throw error;
    }
  }

  /**
   * Get employees for current organization
   */
  async getEmployees(organizationId?: string, departmentId?: string): Promise<any[]> {
    const orgId = organizationId || this.currentOrganizationId;
    if (!orgId) {
      throw new Error('No organization context set');
    }

    try {
      let q = query(
        collection(db, 'employees'),
        where('organizationId', '==', orgId),
        where('systemInfo.isActive', '==', true),
        orderBy('personalInfo.fullName', 'asc')
      );

      if (departmentId) {
        q = query(
          collection(db, 'employees'),
          where('organizationId', '==', orgId),
          where('departmentId', '==', departmentId),
          where('systemInfo.isActive', '==', true),
          orderBy('personalInfo.fullName', 'asc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting employees:', error);
      throw error;
    }
  }

  /**
   * Get KPIs for current organization
   */
  async getKpis(organizationId?: string, departmentId?: string): Promise<any[]> {
    const orgId = organizationId || this.currentOrganizationId;
    if (!orgId) {
      throw new Error('No organization context set');
    }

    try {
      let q = query(
        collection(db, 'kpis'),
        where('organizationId', '==', orgId),
        where('settings.isActive', '==', true),
        orderBy('name', 'asc')
      );

      if (departmentId) {
        q = query(
          collection(db, 'kpis'),
          where('organizationId', '==', orgId),
          where('departmentId', '==', departmentId),
          where('settings.isActive', '==', true),
          orderBy('name', 'asc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting KPIs:', error);
      throw error;
    }
  }

  /**
   * Get KPI records for current organization
   */
  async getKpiRecords(
    organizationId?: string, 
    employeeId?: string, 
    period?: string
  ): Promise<any[]> {
    const orgId = organizationId || this.currentOrganizationId;
    if (!orgId) {
      throw new Error('No organization context set');
    }

    try {
      let q = query(
        collection(db, 'kpiRecords'),
        where('organizationId', '==', orgId),
        orderBy('updatedAt', 'desc')
      );

      if (employeeId) {
        q = query(
          collection(db, 'kpiRecords'),
          where('organizationId', '==', orgId),
          where('employeeId', '==', employeeId),
          orderBy('updatedAt', 'desc')
        );
      }

      if (period) {
        q = query(
          collection(db, 'kpiRecords'),
          where('organizationId', '==', orgId),
          where('period', '==', period),
          orderBy('updatedAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting KPI records:', error);
      throw error;
    }
  }

  /**
   * Get reward calculations for current organization
   */
  async getRewardCalculations(
    organizationId?: string,
    departmentId?: string,
    period?: string
  ): Promise<any[]> {
    const orgId = organizationId || this.currentOrganizationId;
    if (!orgId) {
      throw new Error('No organization context set');
    }

    try {
      let q = query(
        collection(db, 'rewardCalculations'),
        where('organizationId', '==', orgId),
        orderBy('calculatedAt', 'desc')
      );

      if (departmentId) {
        q = query(
          collection(db, 'rewardCalculations'),
          where('organizationId', '==', orgId),
          where('departmentId', '==', departmentId),
          orderBy('calculatedAt', 'desc')
        );
      }

      if (period) {
        q = query(
          collection(db, 'rewardCalculations'),
          where('organizationId', '==', orgId),
          where('period', '==', period),
          orderBy('calculatedAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting reward calculations:', error);
      throw error;
    }
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStats(organizationId?: string): Promise<any> {
    const orgId = organizationId || this.currentOrganizationId;
    if (!orgId) {
      throw new Error('No organization context set');
    }

    try {
      // Get counts for different collections
      const [departmentsSnapshot, employeesSnapshot, kpisSnapshot, recordsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'departments'), where('organizationId', '==', orgId), where('isActive', '==', true))),
        getDocs(query(collection(db, 'employees'), where('organizationId', '==', orgId), where('systemInfo.isActive', '==', true))),
        getDocs(query(collection(db, 'kpis'), where('organizationId', '==', orgId), where('settings.isActive', '==', true))),
        getDocs(query(collection(db, 'kpiRecords'), where('organizationId', '==', orgId)))
      ]);

      // Calculate completion rate
      const totalRecords = recordsSnapshot.size;
      const completedRecords = recordsSnapshot.docs.filter(doc => 
        doc.data().status === 'approved'
      ).length;
      const completionRate = totalRecords > 0 ? (completedRecords / totalRecords) * 100 : 0;

      return {
        organizationId: orgId,
        departments: departmentsSnapshot.size,
        employees: employeesSnapshot.size,
        kpis: kpisSnapshot.size,
        kpiRecords: totalRecords,
        completedRecords,
        completionRate: Math.round(completionRate * 100) / 100,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting organization stats:', error);
      throw error;
    }
  }

  /**
   * Get department hierarchy
   */
  async getDepartmentHierarchy(organizationId?: string): Promise<any[]> {
    const orgId = organizationId || this.currentOrganizationId;
    if (!orgId) {
      throw new Error('No organization context set');
    }

    try {
      const snapshot = await getDocs(query(
        collection(db, 'departments'),
        where('organizationId', '==', orgId),
        where('isActive', '==', true),
        orderBy('level', 'asc'),
        orderBy('name', 'asc')
      ));

      const departments = snapshot.docs.map(doc => doc.data());
      
      // Build hierarchy
      const hierarchy: any[] = [];
      const departmentMap = new Map(departments.map(dept => [dept.id, dept]));

      // Find root departments (no parent)
      const rootDepartments = departments.filter(dept => !dept.parentDepartmentId);
      
      // Build tree structure
      const buildTree = (parent: any, level: number = 0): any => {
        const children = departments.filter(dept => dept.parentDepartmentId === parent.id);
        return {
          ...parent,
          level,
          children: children.map(child => buildTree(child, level + 1))
        };
      };

      return rootDepartments.map(root => buildTree(root));
    } catch (error) {
      console.error('Error getting department hierarchy:', error);
      throw error;
    }
  }

  /**
   * Check if user has access to organization
   */
  async checkUserAccess(userId: string, organizationId: string): Promise<boolean> {
    try {
      const snapshot = await getDocs(query(
        collection(db, 'employees'),
        where('id', '==', userId),
        where('organizationId', '==', organizationId),
        where('systemInfo.isActive', '==', true)
      ));

      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking user access:', error);
      return false;
    }
  }

  /**
   * Get user's organization context
   */
  async getUserOrganization(userId: string): Promise<string | null> {
    try {
      const snapshot = await getDocs(query(
        collection(db, 'employees'),
        where('id', '==', userId),
        where('systemInfo.isActive', '==', true),
        limit(1)
      ));

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data().organizationId;
    } catch (error) {
      console.error('Error getting user organization:', error);
      return null;
    }
  }
}

export default MultiTenantService;
