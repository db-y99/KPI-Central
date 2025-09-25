import React from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// Performance monitoring service
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private timers: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing an operation
  startTimer(operation: string): void {
    this.timers.set(operation, performance.now());
  }

  // End timing and record metric
  endTimer(operation: string): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      console.warn(`Timer for operation "${operation}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(operation);
    this.recordMetric(operation, duration);
    
    return duration;
  }

  // Record a performance metric
  recordMetric(operation: string, value: number): void {
    this.metrics.set(operation, value);
    
    // Log slow operations
    if (value > 1000) { // More than 1 second
      console.warn(`Slow operation detected: ${operation} took ${value.toFixed(2)}ms`);
    }
  }

  // Get all metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics.clear();
  }

  // Log performance data to Firestore
  async logPerformanceData(data: {
    operation: string;
    duration: number;
    timestamp: string;
    userAgent?: string;
    url?: string;
    userId?: string;
  }): Promise<void> {
    try {
      await addDoc(collection(db, 'performance_logs'), {
        ...data,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log performance data:', error);
    }
  }

  // Get performance statistics
  async getPerformanceStats(timeRange: 'hour' | 'day' | 'week' = 'day'): Promise<{
    avgResponseTime: number;
    slowestOperations: Array<{ operation: string; avgDuration: number }>;
    totalOperations: number;
    errorRate: number;
  }> {
    try {
      const now = new Date();
      let startTime: Date;

      switch (timeRange) {
        case 'hour':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'day':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const q = query(
        collection(db, 'performance_logs'),
        where('timestamp', '>=', startTime.toISOString()),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );

      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => doc.data());

      if (logs.length === 0) {
        return {
          avgResponseTime: 0,
          slowestOperations: [],
          totalOperations: 0,
          errorRate: 0
        };
      }

      // Calculate average response time
      const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
      const avgResponseTime = totalDuration / logs.length;

      // Find slowest operations
      const operationGroups = logs.reduce((groups, log) => {
        const operation = log.operation || 'unknown';
        if (!groups[operation]) {
          groups[operation] = [];
        }
        groups[operation].push(log.duration || 0);
        return groups;
      }, {} as Record<string, number[]>);

      const slowestOperations = Object.entries(operationGroups)
        .map(([operation, durations]) => ({
          operation,
          avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length
        }))
        .sort((a, b) => b.avgDuration - a.avgDuration)
        .slice(0, 5);

      // Calculate error rate (mock for now)
      const errorRate = Math.random() * 5; // 0-5%

      return {
        avgResponseTime: Math.round(avgResponseTime),
        slowestOperations,
        totalOperations: logs.length,
        errorRate: Math.round(errorRate * 100) / 100
      };
    } catch (error) {
      console.error('Failed to get performance stats:', error);
      return {
        avgResponseTime: 0,
        slowestOperations: [],
        totalOperations: 0,
        errorRate: 0
      };
    }
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();

  React.useEffect(() => {
    monitor.startTimer(`render_${componentName}`);
    
    return () => {
      const duration = monitor.endTimer(`render_${componentName}`);
      
      // Log slow renders
      if (duration > 100) {
        console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
      }
    };
  }, [componentName, monitor]);
}

// Higher-order component for performance monitoring
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return React.memo((props: P) => {
    usePerformanceMonitor(componentName);
    return <Component {...props} />;
  });
}

// Performance decorator for functions
export function measurePerformance(operationName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();
      monitor.startTimer(operationName);
      
      try {
        const result = await method.apply(this, args);
        const duration = monitor.endTimer(operationName);
        
        // Log performance data
        await monitor.logPerformanceData({
          operation: operationName,
          duration,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
        });
        
        return result;
      } catch (error) {
        monitor.endTimer(operationName);
        throw error;
      }
    };
  };
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
