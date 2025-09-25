import React from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// Audit logging service
export class AuditLogger {
  private static instance: AuditLogger;
  private logs: Array<AuditLogEntry> = [];
  private readonly MAX_MEMORY_LOGS = 100;

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  // Log an audit event
  async log(event: AuditLogEntry): Promise<void> {
    try {
      // Add to memory buffer
      this.logs.push(event);
      
      // Keep only recent logs in memory
      if (this.logs.length > this.MAX_MEMORY_LOGS) {
        this.logs = this.logs.slice(-this.MAX_MEMORY_LOGS);
      }

      // Save to Firestore
      await addDoc(collection(db, 'audit_logs'), {
        ...event,
        createdAt: new Date().toISOString(),
        id: this.generateId()
      });

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Audit Log:', event);
      }
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  // Log user authentication events
  async logAuth(action: 'login' | 'logout' | 'login_failed' | 'password_reset', details: {
    userId?: string;
    email?: string;
    ip?: string;
    userAgent?: string;
    success?: boolean;
    error?: string;
  }): Promise<void> {
    await this.log({
      action: `auth_${action}`,
      category: 'authentication',
      level: 'info',
      message: `User ${action}`,
      details: {
        ...details,
        timestamp: new Date().toISOString()
      },
      userId: details.userId,
      userEmail: details.email,
      ip: details.ip,
      userAgent: details.userAgent
    });
  }

  // Log data access events
  async logDataAccess(action: 'read' | 'create' | 'update' | 'delete', details: {
    resource: string;
    resourceId?: string;
    userId?: string;
    userEmail?: string;
    ip?: string;
    userAgent?: string;
    changes?: any;
    success?: boolean;
    error?: string;
  }): Promise<void> {
    await this.log({
      action: `data_${action}`,
      category: 'data_access',
      level: details.success === false ? 'error' : 'info',
      message: `${action.charAt(0).toUpperCase() + action.slice(1)} ${details.resource}`,
      details: {
        ...details,
        timestamp: new Date().toISOString()
      },
      userId: details.userId,
      userEmail: details.userEmail,
      ip: details.ip,
      userAgent: details.userAgent
    });
  }

  // Log system events
  async logSystem(action: string, details: {
    component?: string;
    level?: 'info' | 'warning' | 'error';
    message?: string;
    data?: any;
    userId?: string;
    userEmail?: string;
    ip?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      action: `system_${action}`,
      category: 'system',
      level: details.level || 'info',
      message: details.message || `System ${action}`,
      details: {
        ...details,
        timestamp: new Date().toISOString()
      },
      userId: details.userId,
      userEmail: details.userEmail,
      ip: details.ip,
      userAgent: details.userAgent
    });
  }

  // Log security events
  async logSecurity(action: string, details: {
    threat?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    message?: string;
    data?: any;
    userId?: string;
    userEmail?: string;
    ip?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      action: `security_${action}`,
      category: 'security',
      level: details.severity === 'critical' || details.severity === 'high' ? 'error' : 'warning',
      message: details.message || `Security ${action}`,
      details: {
        ...details,
        timestamp: new Date().toISOString()
      },
      userId: details.userId,
      userEmail: details.userEmail,
      ip: details.ip,
      userAgent: details.userAgent
    });
  }

  // Get audit logs
  async getAuditLogs(filters: {
    category?: string;
    level?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}): Promise<AuditLogEntry[]> {
    try {
      const {
        category,
        level,
        userId,
        startDate,
        endDate,
        limit: limitCount = 100
      } = filters;

      let q = query(
        collection(db, 'audit_logs'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      // Apply filters
      if (category) {
        q = query(q, where('category', '==', category));
      }
      if (level) {
        q = query(q, where('level', '==', level));
      }
      if (userId) {
        q = query(q, where('userId', '==', userId));
      }
      if (startDate) {
        q = query(q, where('createdAt', '>=', startDate));
      }
      if (endDate) {
        q = query(q, where('createdAt', '<=', endDate));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLogEntry[];
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
  }

  // Get audit statistics
  async getAuditStats(timeRange: 'hour' | 'day' | 'week' = 'day'): Promise<{
    totalLogs: number;
    logsByCategory: Record<string, number>;
    logsByLevel: Record<string, number>;
    recentSecurityEvents: number;
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

      const logs = await this.getAuditLogs({
        startDate: startTime.toISOString(),
        limit: 1000
      });

      const logsByCategory = logs.reduce((acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const logsByLevel = logs.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const recentSecurityEvents = logs.filter(log => 
        log.category === 'security' && 
        log.level === 'error'
      ).length;

      const errorRate = logs.length > 0 ? 
        (logs.filter(log => log.level === 'error').length / logs.length) * 100 : 0;

      return {
        totalLogs: logs.length,
        logsByCategory,
        logsByLevel,
        recentSecurityEvents,
        errorRate: Math.round(errorRate * 100) / 100
      };
    } catch (error) {
      console.error('Failed to get audit stats:', error);
      return {
        totalLogs: 0,
        logsByCategory: {},
        logsByLevel: {},
        recentSecurityEvents: 0,
        errorRate: 0
      };
    }
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get recent logs from memory
  getRecentLogs(count: number = 10): AuditLogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear memory logs
  clearMemoryLogs(): void {
    this.logs = [];
  }
}

// Audit log entry interface
export interface AuditLogEntry {
  id?: string;
  action: string;
  category: 'authentication' | 'data_access' | 'system' | 'security' | 'performance';
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: any;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  timestamp?: string;
  createdAt?: string;
}

// React hook for audit logging
export function useAuditLogger() {
  const logger = AuditLogger.getInstance();

  const logAuth = React.useCallback((action: 'login' | 'logout' | 'login_failed' | 'password_reset', details: any) => {
    logger.logAuth(action, details);
  }, [logger]);

  const logDataAccess = React.useCallback((action: 'read' | 'create' | 'update' | 'delete', details: any) => {
    logger.logDataAccess(action, details);
  }, [logger]);

  const logSystem = React.useCallback((action: string, details: any) => {
    logger.logSystem(action, details);
  }, [logger]);

  const logSecurity = React.useCallback((action: string, details: any) => {
    logger.logSecurity(action, details);
  }, [logger]);

  return {
    logAuth,
    logDataAccess,
    logSystem,
    logSecurity
  };
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();
