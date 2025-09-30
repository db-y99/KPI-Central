import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentSnapshot,
  QueryConstraint,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cache, CacheKeys } from '@/lib/cache-service';

export interface PaginationOptions {
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
  nextCursor?: string;
  prevCursor?: string;
}

export class PaginatedDataService {
  /**
   * Get paginated employees
   */
  static async getEmployees(
    options: PaginationOptions & { departmentId?: string; activeOnly?: boolean } = {}
  ): Promise<PaginatedResult<Employee>> {
    const {
      pageSize = 20,
      orderBy = 'name',
      orderDirection = 'asc',
      filters = {},
      departmentId,
      activeOnly = true
    } = options;

    const cacheKey = CacheKeys.employeeList(departmentId, activeOnly);

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const employeesRef = collection(db, 'employees');
      const constraints: QueryConstraint[] = [];

      // Add filters
      if (activeOnly) {
        constraints.push(where('isActive', '==', true));
      }

      if (departmentId) {
        constraints.push(where('departmentId', '==', departmentId));
      }

      // Add ordering
      constraints.push(orderBy(orderBy, orderDirection));

      // For simplicity, we'll get all and paginate in memory
      // In production, use cursor-based pagination with Firestore
      const q = query(employeesRef, ...constraints);
      const snapshot = await getDocs(q);

      const employees = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Employee[];

      // Simple pagination (in production, use cursor-based)
      const totalCount = employees.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const currentPage = 1; // For now, we'll implement cursor-based later

      const result: PaginatedResult<Employee> = {
        items: employees.slice(0, pageSize),
        totalCount,
        hasNextPage: totalCount > pageSize,
        hasPreviousPage: false,
        currentPage,
        totalPages,
        nextCursor: totalCount > pageSize ? employees[pageSize - 1]?.id : undefined
      };

      // Cache the result
      cache.set(cacheKey, result, 300); // Cache for 5 minutes

      return result;

    } catch (error) {
      console.error('Error fetching paginated employees:', error);
      throw error;
    }
  }

  /**
   * Get paginated KPI records
   */
  static async getKpiRecords(
    options: PaginationOptions & { employeeId?: string; status?: string; departmentId?: string } = {}
  ): Promise<PaginatedResult<KpiRecord>> {
    const {
      pageSize = 20,
      orderBy = 'updatedAt',
      orderDirection = 'desc',
      filters = {},
      employeeId,
      status,
      departmentId
    } = options;

    const cacheKey = CacheKeys.kpiRecords(employeeId, status);

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const kpiRecordsRef = collection(db, 'kpiRecords');
      const constraints: QueryConstraint[] = [];

      // Add filters
      if (employeeId) {
        constraints.push(where('employeeId', '==', employeeId));
      }

      if (status) {
        constraints.push(where('status', '==', status));
      }

      if (departmentId) {
        // For department filtering, we need to join with employees
        // This is complex, so we'll filter in memory for now
      }

      // Add ordering
      constraints.push(orderBy(orderBy, orderDirection));

      const q = query(kpiRecordsRef, ...constraints);
      const snapshot = await getDocs(q);

      let kpiRecords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as KpiRecord[];

      // Filter by department if needed (in-memory filter)
      if (departmentId) {
        // This would require fetching employees and filtering
        // For now, skip department filtering in pagination
      }

      const totalCount = kpiRecords.length;
      const totalPages = Math.ceil(totalCount / pageSize);

      const result: PaginatedResult<KpiRecord> = {
        items: kpiRecords.slice(0, pageSize),
        totalCount,
        hasNextPage: totalCount > pageSize,
        hasPreviousPage: false,
        currentPage: 1,
        totalPages,
        nextCursor: totalCount > pageSize ? kpiRecords[pageSize - 1]?.id : undefined
      };

      cache.set(cacheKey, result, 180); // Cache for 3 minutes

      return result;

    } catch (error) {
      console.error('Error fetching paginated KPI records:', error);
      throw error;
    }
  }

  /**
   * Get paginated KPIs
   */
  static async getKpis(
    options: PaginationOptions & { departmentId?: string } = {}
  ): Promise<PaginatedResult<Kpi>> {
    const {
      pageSize = 20,
      orderBy = 'name',
      orderDirection = 'asc',
      departmentId
    } = options;

    const cacheKey = CacheKeys.kpiList(departmentId);

    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const kpisRef = collection(db, 'kpis');
      const constraints: QueryConstraint[] = [];

      if (departmentId) {
        constraints.push(where('departmentId', '==', departmentId));
      }

      constraints.push(orderBy(orderBy, orderDirection));

      const q = query(kpisRef, ...constraints);
      const snapshot = await getDocs(q);

      const kpis = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Kpi[];

      const totalCount = kpis.length;
      const totalPages = Math.ceil(totalCount / pageSize);

      const result: PaginatedResult<Kpi> = {
        items: kpis.slice(0, pageSize),
        totalCount,
        hasNextPage: totalCount > pageSize,
        hasPreviousPage: false,
        currentPage: 1,
        totalPages,
        nextCursor: totalCount > pageSize ? kpis[pageSize - 1]?.id : undefined
      };

      cache.set(cacheKey, result, 600); // Cache for 10 minutes (KPIs don't change often)

      return result;

    } catch (error) {
      console.error('Error fetching paginated KPIs:', error);
      throw error;
    }
  }

  /**
   * Get next page using cursor
   */
  static async getNextPage<T>(
    collectionName: string,
    cursor: string,
    pageSize: number = 20,
    additionalConstraints: QueryConstraint[] = []
  ): Promise<PaginatedResult<T>> {
    try {
      const collectionRef = collection(db, collectionName);
      const constraints = [
        ...additionalConstraints,
        orderBy('updatedAt', 'desc'),
        startAfter(cursor),
        limit(pageSize)
      ];

      const q = query(collectionRef, ...constraints);
      const snapshot = await getDocs(q);

      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      // Get total count (simplified - in production use count queries)
      const totalSnapshot = await getDocs(query(collectionRef, ...additionalConstraints));
      const totalCount = totalSnapshot.docs.length;

      return {
        items,
        totalCount,
        hasNextPage: items.length === pageSize,
        hasPreviousPage: true,
        currentPage: 0, // Not tracked in cursor pagination
        totalPages: Math.ceil(totalCount / pageSize),
        nextCursor: items.length > 0 ? items[items.length - 1].id : undefined,
        prevCursor: cursor
      };

    } catch (error) {
      console.error(`Error fetching next page for ${collectionName}:`, error);
      throw error;
    }
  }
}
