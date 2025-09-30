/**
 * Cache Service - Caching layer cho production
 * Hiện tại sử dụng in-memory cache, có thể dễ dàng chuyển sang Redis
 */

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize?: number; // Maximum cache size
}

export interface CacheEntry<T> {
  value: T;
  expiry: number;
  createdAt: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;

  constructor(config: CacheConfig = { ttl: 300 }) { // Default 5 minutes
    this.config = config;

    // Cleanup expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.config.ttl) * 1000;

    this.cache.set(key, {
      value,
      expiry,
      createdAt: Date.now()
    });

    // Enforce max size if specified
    if (this.config.maxSize && this.cache.size > this.config.maxSize) {
      this.evictOldest();
    }
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        expiredEntries++;
      } else {
        activeEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      activeEntries,
      expiredEntries,
      hitRate: this.hitRate,
      missRate: this.missRate
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Evict oldest entry when cache is full
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Track hit/miss for statistics
  private hits = 0;
  private misses = 0;

  private get hitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }

  private get missRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.misses / total : 0;
  }
}

// Global cache instance
export const cache = new CacheService({
  ttl: 300, // 5 minutes default
  maxSize: 1000 // Max 1000 entries
});

// Cache key generators for common patterns
export const CacheKeys = {
  // Employee data
  employeeList: (departmentId?: string, activeOnly?: boolean) =>
    `employees:${departmentId || 'all'}:${activeOnly ? 'active' : 'all'}`,

  employeeById: (id: string) => `employee:${id}`,

  // KPI data
  kpiList: (departmentId?: string) => `kpis:${departmentId || 'all'}`,
  kpiById: (id: string) => `kpi:${id}`,

  // KPI Records
  kpiRecords: (employeeId?: string, status?: string) =>
    `kpi-records:${employeeId || 'all'}:${status || 'all'}`,

  kpiRecordById: (id: string) => `kpi-record:${id}`,

  // Department data
  departments: () => 'departments',
  departmentById: (id: string) => `department:${id}`,

  // Analytics and reports
  employeeStats: (departmentId?: string) => `employee-stats:${departmentId || 'all'}`,
  kpiStats: (departmentId?: string) => `kpi-stats:${departmentId || 'all'}`,

  // Notifications
  notifications: (userId: string, unreadOnly?: boolean) =>
    `notifications:${userId}:${unreadOnly ? 'unread' : 'all'}`,

  // Reward programs
  rewardPrograms: () => 'reward-programs',
  rewardProgramById: (id: string) => `reward-program:${id}`,

  // Performance data
  performanceData: (employeeId: string, period: string) =>
    `performance:${employeeId}:${period}`,
};

// Cache decorators for functions
export function cacheable<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const cached = cache.get(key);

    if (cached !== null) {
      return Promise.resolve(cached);
    }

    const result = fn(...args);

    if (result instanceof Promise) {
      return result.then(value => {
        cache.set(key, value, ttl);
        return value;
      });
    } else {
      cache.set(key, result, ttl);
      return result;
    }
  }) as T;
}
