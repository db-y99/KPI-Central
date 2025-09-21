import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';

export interface PerformanceMetric {
  id: string;
  userId: string;
  page: string;
  action: string;
  duration: number; // milliseconds
  timestamp: string;
  userAgent: string;
  sessionId: string;
  metadata: Record<string, any>;
}

export interface PerformanceReport {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  metrics: {
    averagePageLoadTime: number;
    slowestPages: Array<{ page: string; avgTime: number; count: number }>;
    userEngagement: number;
    errorRate: number;
    totalSessions: number;
    uniqueUsers: number;
  };
  recommendations: string[];
  createdAt: string;
}

export interface CacheConfig {
  id: string;
  key: string;
  ttl: number; // Time to live in seconds
  data: any;
  createdAt: string;
  expiresAt: string;
}

class PerformanceService {
  private static instance: PerformanceService;
  private cache: Map<string, CacheConfig> = new Map();
  private performanceObserver: PerformanceObserver | null = null;

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  /**
   * Initialize performance monitoring
   */
  initialize(): void {
    this.setupPerformanceObserver();
    this.setupErrorTracking();
    this.setupResourceMonitoring();
  }

  /**
   * Track page performance
   */
  trackPagePerformance(page: string, userId: string, sessionId: string): void {
    if (typeof window === 'undefined') return;

    const startTime = performance.now();
    
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      this.recordPerformanceMetric({
        userId,
        page,
        action: 'page_load',
        duration: loadTime,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId,
        metadata: {
          url: window.location.href,
          referrer: document.referrer
        }
      });
    });

    // Track navigation timing
    if (performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        this.recordPerformanceMetric({
          userId,
          page,
          action: 'navigation_timing',
          duration: nav.loadEventEnd - nav.fetchStart,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          sessionId,
          metadata: {
            domContentLoaded: nav.domContentLoadedEventEnd - nav.fetchStart,
            firstPaint: this.getFirstPaint(),
            firstContentfulPaint: this.getFirstContentfulPaint()
          }
        });
      }
    }
  }

  /**
   * Track API call performance
   */
  trackApiCall(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    userId: string,
    sessionId: string
  ): void {
    this.recordPerformanceMetric({
      userId,
      page: 'api',
      action: `${method}_${endpoint}`,
      duration,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      sessionId,
      metadata: {
        endpoint,
        method,
        statusCode,
        success: statusCode >= 200 && statusCode < 300
      }
    });
  }

  /**
   * Track user interaction performance
   */
  trackInteraction(
    element: string,
    action: string,
    duration: number,
    userId: string,
    sessionId: string
  ): void {
    this.recordPerformanceMetric({
      userId,
      page: 'interaction',
      action: `${action}_${element}`,
      duration,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      sessionId,
      metadata: {
        element,
        action,
        type: 'user_interaction'
      }
    });
  }

  /**
   * Record performance metric to database
   */
  private async recordPerformanceMetric(metric: Omit<PerformanceMetric, 'id'>): Promise<void> {
    try {
      // Store in local cache first for batch processing
      const cacheKey = `perf_${Date.now()}_${Math.random()}`;
      this.cache.set(cacheKey, {
        id: cacheKey,
        key: cacheKey,
        ttl: 300, // 5 minutes
        data: metric,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString()
      });

      // Batch process every 10 metrics or every 30 seconds
      if (this.cache.size >= 10) {
        await this.flushCache();
      }
    } catch (error) {
      console.error('Error recording performance metric:', error);
    }
  }

  /**
   * Flush cached metrics to database
   */
  private async flushCache(): Promise<void> {
    if (this.cache.size === 0) return;

    try {
      const metrics = Array.from(this.cache.values()).map(cache => cache.data);
      
      // Batch write to Firestore
      const batch = metrics.map(metric => 
        addDoc(collection(db, 'performanceMetrics'), metric)
      );
      
      await Promise.all(batch);
      this.cache.clear();
    } catch (error) {
      console.error('Error flushing performance cache:', error);
    }
  }

  /**
   * Setup performance observer
   */
  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            this.handlePerformanceEntry(entry);
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['measure'] });
    } catch (error) {
      console.error('Error setting up performance observer:', error);
    }
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.recordError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        type: 'javascript_error'
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        type: 'promise_rejection'
      });
    });
  }

  /**
   * Setup resource monitoring
   */
  private setupResourceMonitoring(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.handleResourceEntry(entry as PerformanceResourceTiming);
          }
        });
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.error('Error setting up resource monitoring:', error);
    }
  }

  /**
   * Handle performance entry
   */
  private handlePerformanceEntry(entry: PerformanceEntry): void {
    // This would be called for custom performance marks/measures
    console.log('Performance entry:', entry);
  }

  /**
   * Handle resource entry
   */
  private handleResourceEntry(entry: PerformanceResourceTiming): void {
    if (entry.duration > 1000) { // Log slow resources (>1s)
      console.warn('Slow resource detected:', {
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize
      });
    }
  }

  /**
   * Record error
   */
  private async recordError(error: any): Promise<void> {
    try {
      await addDoc(collection(db, 'errorLogs'), {
        ...error,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    } catch (err) {
      console.error('Error recording error:', err);
    }
  }

  /**
   * Get first paint time
   */
  private getFirstPaint(): number | null {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return null;

    try {
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      return firstPaint ? firstPaint.startTime : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get first contentful paint time
   */
  private getFirstContentfulPaint(): number | null {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return null;

    try {
      const paintEntries = performance.getEntriesByType('paint');
      const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return firstContentfulPaint ? firstContentfulPaint.startTime : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get performance report for a period
   */
  async getPerformanceReport(
    startDate: string,
    endDate: string,
    userId?: string
  ): Promise<PerformanceReport> {
    try {
      let q = query(
        collection(db, 'performanceMetrics'),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc')
      );

      if (userId) {
        q = query(q, where('userId', '==', userId));
      }

      const snapshot = await getDocs(q);
      const metrics = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PerformanceMetric));

      // Calculate performance metrics
      const pageMetrics = this.calculatePageMetrics(metrics);
      const recommendations = this.generateRecommendations(pageMetrics);

      const report: Omit<PerformanceReport, 'id'> = {
        period: `${startDate} to ${endDate}`,
        startDate,
        endDate,
        metrics: pageMetrics,
        recommendations,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'performanceReports'), report);
      return {
        id: docRef.id,
        ...report
      };
    } catch (error) {
      console.error('Error getting performance report:', error);
      throw error;
    }
  }

  /**
   * Calculate page metrics
   */
  private calculatePageMetrics(metrics: PerformanceMetric[]): PerformanceReport['metrics'] {
    const pageTimes = new Map<string, number[]>();
    const userSessions = new Set<string>();
    const errors = metrics.filter(m => m.metadata?.success === false);

    metrics.forEach(metric => {
      if (metric.page !== 'api' && metric.page !== 'interaction') {
        if (!pageTimes.has(metric.page)) {
          pageTimes.set(metric.page, []);
        }
        pageTimes.get(metric.page)!.push(metric.duration);
      }
      
      if (metric.sessionId) {
        userSessions.add(metric.sessionId);
      }
    });

    const slowestPages = Array.from(pageTimes.entries())
      .map(([page, times]) => ({
        page,
        avgTime: times.reduce((a, b) => a + b, 0) / times.length,
        count: times.length
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    const allTimes = Array.from(pageTimes.values()).flat();
    const averagePageLoadTime = allTimes.length > 0 
      ? allTimes.reduce((a, b) => a + b, 0) / allTimes.length 
      : 0;

    return {
      averagePageLoadTime,
      slowestPages,
      userEngagement: this.calculateUserEngagement(metrics),
      errorRate: errors.length / metrics.length,
      totalSessions: userSessions.size,
      uniqueUsers: new Set(metrics.map(m => m.userId)).size
    };
  }

  /**
   * Calculate user engagement
   */
  private calculateUserEngagement(metrics: PerformanceMetric[]): number {
    const interactionMetrics = metrics.filter(m => m.page === 'interaction');
    const totalInteractions = interactionMetrics.length;
    const uniqueUsers = new Set(metrics.map(m => m.userId)).size;
    
    return uniqueUsers > 0 ? totalInteractions / uniqueUsers : 0;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: PerformanceReport['metrics']): string[] {
    const recommendations: string[] = [];

    if (metrics.averagePageLoadTime > 3000) {
      recommendations.push('Consider optimizing page load times - current average is above 3 seconds');
    }

    if (metrics.slowestPages.length > 0 && metrics.slowestPages[0].avgTime > 5000) {
      recommendations.push(`Optimize the slowest page: ${metrics.slowestPages[0].page}`);
    }

    if (metrics.errorRate > 0.05) {
      recommendations.push('High error rate detected - investigate and fix critical errors');
    }

    if (metrics.userEngagement < 5) {
      recommendations.push('Low user engagement - consider improving user experience');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance metrics look good - continue monitoring');
    }

    return recommendations;
  }

  /**
   * Get cached data
   */
  getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (new Date() > new Date(cached.expiresAt)) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cached data
   */
  setCachedData(key: string, data: any, ttl: number = 300): void {
    this.cache.set(key, {
      id: key,
      key,
      ttl,
      data,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttl * 1000).toISOString()
    });
  }

  /**
   * Clear expired cache
   */
  clearExpiredCache(): void {
    const now = new Date();
    for (const [key, cached] of this.cache.entries()) {
      if (now > new Date(cached.expiresAt)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    this.cache.clear();
  }
}

export const performanceService = PerformanceService.getInstance();

// Performance monitoring hooks
export const PerformanceHooks = {
  /**
   * Track page load performance
   */
  trackPageLoad: (page: string, userId: string, sessionId: string) => {
    performanceService.trackPagePerformance(page, userId, sessionId);
  },

  /**
   * Track API call performance
   */
  trackApiCall: (endpoint: string, method: string, duration: number, statusCode: number, userId: string, sessionId: string) => {
    performanceService.trackApiCall(endpoint, method, duration, statusCode, userId, sessionId);
  },

  /**
   * Track user interaction performance
   */
  trackInteraction: (element: string, action: string, duration: number, userId: string, sessionId: string) => {
    performanceService.trackInteraction(element, action, duration, userId, sessionId);
  }
};
