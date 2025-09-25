import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  DocumentSnapshot,
  QueryConstraint,
  QueryDocumentSnapshot
} from 'firebase/firestore';

// Database optimization service
export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  // Optimized query with caching
  async queryWithCache<T>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    options: {
      ttl?: number;
      useCache?: boolean;
      cacheKey?: string;
    } = {}
  ): Promise<T[]> {
    const { ttl = this.DEFAULT_TTL, useCache = true, cacheKey } = options;
    
    // Generate cache key
    const key = cacheKey || `${collectionName}_${JSON.stringify(constraints)}`;
    
    // Check cache first
    if (useCache) {
      const cached = this.queryCache.get(key);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }
    }

    // Execute query
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];

    // Cache result
    if (useCache) {
      this.queryCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });
    }

    return data;
  }

  // Optimized paginated query
  async queryPaginated<T>(
    collectionName: string,
    page: number = 1,
    pageSize: number = 10,
    constraints: QueryConstraint[] = [],
    orderByField: string = 'createdAt',
    orderDirection: 'asc' | 'desc' = 'desc'
  ): Promise<{
    data: T[];
    total: number;
    hasMore: boolean;
    lastDoc?: QueryDocumentSnapshot;
  }> {
    const offset = (page - 1) * pageSize;
    
    // Build query with pagination
    const paginationConstraints = [
      ...constraints,
      orderBy(orderByField, orderDirection),
      limit(pageSize + 1) // Get one extra to check if there are more
    ];

    const q = query(collection(db, collectionName), ...paginationConstraints);
    const querySnapshot = await getDocs(q);
    
    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageSize;
    const data = docs.slice(0, pageSize).map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];

    // Get total count (this is expensive, so we'll estimate)
    const totalQuery = query(collection(db, collectionName), ...constraints);
    const totalSnapshot = await getDocs(totalQuery);
    const total = totalSnapshot.size;

    return {
      data,
      total,
      hasMore,
      lastDoc: docs[pageSize - 1]
    };
  }

  // Batch operations for better performance
  async batchGet<T>(
    collectionName: string,
    ids: string[]
  ): Promise<T[]> {
    const promises = ids.map(id => 
      getDoc(doc(db, collectionName, id))
        .then(docSnapshot => {
          if (docSnapshot.exists()) {
            return { id: docSnapshot.id, ...docSnapshot.data() } as T;
          }
          return null;
        })
    );

    const results = await Promise.all(promises);
    return results.filter(Boolean) as T[];
  }

  // Optimized search with indexing
  async search<T>(
    collectionName: string,
    searchFields: string[],
    searchTerm: string,
    constraints: QueryConstraint[] = [],
    limitCount: number = 20
  ): Promise<T[]> {
    if (!searchTerm.trim()) {
      return this.queryWithCache(collectionName, constraints, { useCache: false });
    }

    // For now, we'll do client-side filtering
    // In production, you'd want to use Algolia or similar search service
    const allData = await this.queryWithCache(collectionName, constraints, { useCache: false });
    
    const filtered = allData.filter(item => {
      return searchFields.some(field => {
        const value = this.getNestedValue(item, field);
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });

    return filtered.slice(0, limitCount);
  }

  // Helper to get nested object values
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Clear cache
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.queryCache.keys()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys())
    };
  }
}

// Optimized data service
export class OptimizedDataService {
  private dbOptimizer = DatabaseOptimizer.getInstance();

  // KPI operations
  async getKPIs(filters: {
    department?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{
    kpis: any[];
    total: number;
    hasMore: boolean;
  }> {
    const { department, status, page = 1, pageSize = 10 } = filters;
    
    const constraints: QueryConstraint[] = [];
    
    if (department) {
      constraints.push(where('department', '==', department));
    }
    if (status) {
      constraints.push(where('status', '==', status));
    }

    const result = await this.dbOptimizer.queryPaginated(
      'kpis',
      page,
      pageSize,
      constraints,
      'createdAt',
      'desc'
    );

    return {
      kpis: result.data,
      total: result.total,
      hasMore: result.hasMore
    };
  }

  // Employee operations
  async getEmployees(filters: {
    department?: string;
    role?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{
    employees: any[];
    total: number;
    hasMore: boolean;
  }> {
    const { department, role, page = 1, pageSize = 10 } = filters;
    
    const constraints: QueryConstraint[] = [];
    
    if (department) {
      constraints.push(where('department', '==', department));
    }
    if (role) {
      constraints.push(where('role', '==', role));
    }

    const result = await this.dbOptimizer.queryPaginated(
      'users',
      page,
      pageSize,
      constraints,
      'createdAt',
      'desc'
    );

    // Remove sensitive data
    const employees = result.data.map(emp => {
      const { password, ...safeData } = emp;
      return safeData;
    });

    return {
      employees,
      total: result.total,
      hasMore: result.hasMore
    };
  }

  // Metrics operations
  async getMetrics(filters: {
    employeeId?: string;
    kpiId?: string;
    month?: number;
    year?: number;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{
    metrics: any[];
    total: number;
    hasMore: boolean;
  }> {
    const { employeeId, kpiId, month, year, page = 1, pageSize = 10 } = filters;
    
    const constraints: QueryConstraint[] = [];
    
    if (employeeId) {
      constraints.push(where('employeeId', '==', employeeId));
    }
    if (kpiId) {
      constraints.push(where('kpiId', '==', kpiId));
    }
    if (month !== undefined) {
      constraints.push(where('month', '==', month));
    }
    if (year !== undefined) {
      constraints.push(where('year', '==', year));
    }

    const result = await this.dbOptimizer.queryPaginated(
      'metrics',
      page,
      pageSize,
      constraints,
      'createdAt',
      'desc'
    );

    return {
      metrics: result.data,
      total: result.total,
      hasMore: result.hasMore
    };
  }

  // Search operations
  async searchKPIs(searchTerm: string, limitCount: number = 20): Promise<any[]> {
    return this.dbOptimizer.search(
      'kpis',
      ['name', 'description', 'category'],
      searchTerm,
      [where('status', '==', 'active')],
      limitCount
    );
  }

  async searchEmployees(searchTerm: string, limitCount: number = 20): Promise<any[]> {
    const results = await this.dbOptimizer.search(
      'users',
      ['name', 'email', 'position'],
      searchTerm,
      [where('role', '==', 'employee')],
      limitCount
    );

    // Remove sensitive data
    return results.map(emp => {
      const { password, ...safeData } = emp;
      return safeData;
    });
  }

  // Dashboard data
  async getDashboardData(filters: {
    department?: string;
    month?: number;
    year?: number;
  } = {}): Promise<any> {
    const { department, month = new Date().getMonth() + 1, year = new Date().getFullYear() } = filters;

    // Parallel queries for better performance
    const [kpisResult, metricsResult, employeesResult] = await Promise.all([
      this.getKPIs({ department, status: 'active' }),
      this.getMetrics({ month, year }),
      this.getEmployees({ department })
    ]);

    // Calculate statistics
    const totalKPIs = kpisResult.total;
    const completedMetrics = metricsResult.total;
    const completionRate = totalKPIs > 0 ? (completedMetrics / totalKPIs) * 100 : 0;

    const validMetrics = metricsResult.metrics.filter(m => m.value !== null && m.value !== undefined);
    const averagePerformance = validMetrics.length > 0 
      ? validMetrics.reduce((sum, m) => sum + m.value, 0) / validMetrics.length 
      : 0;

    return {
      summary: {
        totalKPIs,
        completedMetrics,
        completionRate: Math.round(completionRate * 100) / 100,
        averagePerformance: Math.round(averagePerformance * 100) / 100,
        period: { month, year }
      },
      kpis: kpisResult.kpis,
      metrics: metricsResult.metrics,
      employees: employeesResult.employees
    };
  }

  // Clear cache for specific collections
  clearCache(collectionName?: string): void {
    this.dbOptimizer.clearCache(collectionName);
  }
}

// Export singleton instance
export const optimizedDataService = new OptimizedDataService();
export const databaseOptimizer = DatabaseOptimizer.getInstance();
