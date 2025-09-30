/**
 * Redis Cache Service - Production-ready caching layer
 * Có thể dễ dàng chuyển từ in-memory cache sang Redis
 */

export interface RedisConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

export class RedisCacheService {
  private config: RedisConfig;
  private isRedisAvailable: boolean = false;

  constructor(config: RedisConfig = {}) {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: process.env.REDIS_PREFIX || 'kpi-central:',
      ...config
    };

    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      // Trong thực tế, import và khởi tạo Redis client
      // const Redis = require('ioredis');
      // this.redis = new Redis(this.config);

      // Tạm thời sử dụng in-memory cache để demo
      console.log('🔄 Redis not available, using in-memory cache');
      this.isRedisAvailable = false;
    } catch (error) {
      console.log('🔄 Redis not available, using in-memory cache');
      this.isRedisAvailable = false;
    }
  }

  /**
   * Set cache entry with TTL
   */
  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    const fullKey = this.config.keyPrefix + key;
    const data = {
      value,
      expiry: Date.now() + (ttl * 1000),
      createdAt: Date.now()
    };

    if (this.isRedisAvailable) {
      // Redis implementation
      // await this.redis.setex(fullKey, ttl, JSON.stringify(data));
    } else {
      // In-memory fallback
      this.setInMemory(fullKey, data);
    }
  }

  /**
   * Get cache entry
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.config.keyPrefix + key;

    if (this.isRedisAvailable) {
      // Redis implementation
      // const data = await this.redis.get(fullKey);
      // if (data) {
      //   const parsed = JSON.parse(data);
      //   if (Date.now() > parsed.expiry) {
      //     await this.redis.del(fullKey);
      //     return null;
      //   }
      //   return parsed.value;
      // }
      // return null;
    } else {
      return this.getInMemory<T>(fullKey);
    }

    return null;
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<boolean> {
    const fullKey = this.config.keyPrefix + key;

    if (this.isRedisAvailable) {
      // await this.redis.del(fullKey);
      return true;
    } else {
      return this.deleteInMemory(fullKey);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    if (this.isRedisAvailable) {
      // const keys = await this.redis.keys(this.config.keyPrefix + '*');
      // if (keys.length > 0) {
      //   await this.redis.del(...keys);
      // }
    } else {
      this.clearInMemory();
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    if (this.isRedisAvailable) {
      // Redis info
      return {
        type: 'redis',
        connected: true,
        // ... other Redis stats
      };
    } else {
      return {
        type: 'memory',
        connected: true,
        entries: Object.keys(this.memoryCache || {}).length
      };
    }
  }

  // In-memory cache fallback (for development/demo)
  private memoryCache: Map<string, any> = new Map();

  private setInMemory(key: string, data: any) {
    this.memoryCache.set(key, data);
  }

  private getInMemory<T>(key: string): T | null {
    const data = this.memoryCache.get(key);
    if (!data) return null;

    if (Date.now() > data.expiry) {
      this.memoryCache.delete(key);
      return null;
    }

    return data.value as T;
  }

  private deleteInMemory(key: string): boolean {
    return this.memoryCache.delete(key);
  }

  private clearInMemory() {
    this.memoryCache.clear();
  }
}

// Global Redis cache instance
export const redisCache = new RedisCacheService();

// Cache key generators for production patterns
export const ProductionCacheKeys = {
  // Employee data with department filtering
  employeeList: (departmentId?: string, activeOnly?: boolean, page?: number) =>
    `employees:${departmentId || 'all'}:${activeOnly ? 'active' : 'all'}:${page || 1}`,

  employeeById: (id: string) => `employee:${id}`,

  // KPI data with department filtering
  kpiList: (departmentId?: string, page?: number) =>
    `kpis:${departmentId || 'all'}:${page || 1}`,

  kpiById: (id: string) => `kpi:${id}`,

  // KPI Records with complex filtering
  kpiRecords: (employeeId?: string, status?: string, departmentId?: string, page?: number) =>
    `kpi-records:${employeeId || 'all'}:${status || 'all'}:${departmentId || 'all'}:${page || 1}`,

  kpiRecordById: (id: string) => `kpi-record:${id}`,

  // Analytics data
  employeeStats: (departmentId?: string, period?: string) =>
    `employee-stats:${departmentId || 'all'}:${period || 'current'}`,

  kpiStats: (departmentId?: string, period?: string) =>
    `kpi-stats:${departmentId || 'all'}:${period || 'current'}`,

  // User sessions and preferences
  userSession: (userId: string) => `session:${userId}`,
  userPreferences: (userId: string) => `preferences:${userId}`,

  // System health and monitoring
  systemHealth: () => 'system:health',
  systemMetrics: (period: string) => `system:metrics:${period}`,
};

// Environment-based cache configuration
export const getCacheConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // Employee data - cache for 5 minutes in dev, 15 minutes in prod
    employee: {
      ttl: isProduction ? 900 : 300,
      maxSize: isProduction ? 1000 : 100
    },

    // KPI data - cache for 10 minutes in dev, 30 minutes in prod
    kpi: {
      ttl: isProduction ? 1800 : 600,
      maxSize: isProduction ? 500 : 50
    },

    // Analytics data - cache for 2 minutes in dev, 10 minutes in prod
    analytics: {
      ttl: isProduction ? 600 : 120,
      maxSize: isProduction ? 200 : 20
    },

    // User sessions - cache for 1 hour in dev, 24 hours in prod
    session: {
      ttl: isProduction ? 86400 : 3600,
      maxSize: isProduction ? 5000 : 500
    }
  };
};
