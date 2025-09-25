import React from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { auditLogger } from './audit-logger';

// Security monitoring service
export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private alerts: SecurityAlert[] = [];
  private subscribers: Array<(alert: SecurityAlert) => void> = [];
  private monitoringRules: SecurityRule[] = [];

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  constructor() {
    this.initializeDefaultRules();
    this.startRealTimeMonitoring();
  }

  // Initialize default security rules
  private initializeDefaultRules(): void {
    this.monitoringRules = [
      {
        id: 'multiple_failed_logins',
        name: 'Multiple Failed Login Attempts',
        description: 'Detect multiple failed login attempts from the same IP',
        category: 'authentication',
        severity: 'medium',
        threshold: 5,
        timeWindow: 15 * 60 * 1000, // 15 minutes
        enabled: true,
        action: 'block_ip_temporarily'
      },
      {
        id: 'suspicious_api_usage',
        name: 'Suspicious API Usage',
        description: 'Detect unusual API usage patterns',
        category: 'api_security',
        severity: 'high',
        threshold: 100,
        timeWindow: 5 * 60 * 1000, // 5 minutes
        enabled: true,
        action: 'rate_limit_user'
      },
      {
        id: 'privilege_escalation',
        name: 'Privilege Escalation Attempt',
        description: 'Detect attempts to access admin functions',
        category: 'authorization',
        severity: 'critical',
        threshold: 1,
        timeWindow: 60 * 1000, // 1 minute
        enabled: true,
        action: 'alert_admin'
      },
      {
        id: 'data_exfiltration',
        name: 'Data Exfiltration Attempt',
        description: 'Detect unusual data access patterns',
        category: 'data_security',
        severity: 'high',
        threshold: 50,
        timeWindow: 10 * 60 * 1000, // 10 minutes
        enabled: true,
        action: 'restrict_access'
      },
      {
        id: 'system_intrusion',
        name: 'System Intrusion Attempt',
        description: 'Detect potential system intrusion attempts',
        category: 'system_security',
        severity: 'critical',
        threshold: 1,
        timeWindow: 60 * 1000, // 1 minute
        enabled: true,
        action: 'emergency_lockdown'
      }
    ];
  }

  // Start real-time monitoring
  private startRealTimeMonitoring(): void {
    // Monitor audit logs for security events
    const q = query(
      collection(db, 'audit_logs'),
      where('category', '==', 'security'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const log = change.doc.data();
          this.processSecurityEvent(log);
        }
      });
    });
  }

  // Process security events and check against rules
  private async processSecurityEvent(log: any): Promise<void> {
    for (const rule of this.monitoringRules) {
      if (!rule.enabled) continue;

      const shouldTrigger = await this.checkRule(rule, log);
      if (shouldTrigger) {
        await this.triggerAlert(rule, log);
      }
    }
  }

  // Check if a rule should trigger
  private async checkRule(rule: SecurityRule, log: any): Promise<boolean> {
    const now = Date.now();
    const timeWindowStart = now - rule.timeWindow;

    // Get recent logs matching the rule criteria
    const recentLogs = await this.getRecentLogs(rule, timeWindowStart);

    // Check threshold
    return recentLogs.length >= rule.threshold;
  }

  // Get recent logs for rule checking
  private async getRecentLogs(rule: SecurityRule, timeWindowStart: number): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'audit_logs'),
        where('category', '==', rule.category),
        where('createdAt', '>=', new Date(timeWindowStart).toISOString()),
        orderBy('createdAt', 'desc'),
        limit(1000)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Failed to get recent logs:', error);
      return [];
    }
  }

  // Trigger security alert
  private async triggerAlert(rule: SecurityRule, log: any): Promise<void> {
    const alert: SecurityAlert = {
      id: this.generateAlertId(),
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      category: rule.category,
      message: rule.description,
      details: {
        log,
        timestamp: new Date().toISOString(),
        action: rule.action
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      resolvedAt: null
    };

    // Add to alerts array
    this.alerts.unshift(alert);
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(0, 1000);
    }

    // Notify subscribers
    this.subscribers.forEach(callback => callback(alert));

    // Save to database
    await this.saveAlert(alert);

    // Execute action
    await this.executeAction(rule.action, alert);

    // Log the alert
    await auditLogger.logSecurity('alert_triggered', {
      alertId: alert.id,
      ruleId: rule.id,
      severity: rule.severity,
      message: `Security alert triggered: ${rule.name}`
    });
  }

  // Execute security action
  private async executeAction(action: string, alert: SecurityAlert): Promise<void> {
    switch (action) {
      case 'block_ip_temporarily':
        await this.blockIPTemporarily(alert.details.log.ip);
        break;
      case 'rate_limit_user':
        await this.rateLimitUser(alert.details.log.userId);
        break;
      case 'alert_admin':
        await this.sendAdminAlert(alert);
        break;
      case 'restrict_access':
        await this.restrictUserAccess(alert.details.log.userId);
        break;
      case 'emergency_lockdown':
        await this.emergencyLockdown();
        break;
    }
  }

  // Block IP temporarily
  private async blockIPTemporarily(ip: string): Promise<void> {
    if (!ip) return;

    await addDoc(collection(db, 'blocked_ips'), {
      ip,
      reason: 'Multiple failed login attempts',
      blockedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      status: 'active'
    });

    console.log(`IP ${ip} blocked temporarily due to security violation`);
  }

  // Rate limit user
  private async rateLimitUser(userId: string): Promise<void> {
    if (!userId) return;

    await addDoc(collection(db, 'rate_limits'), {
      userId,
      reason: 'Suspicious API usage',
      limitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      status: 'active',
      maxRequests: 10 // Reduce to 10 requests per hour
    });

    console.log(`User ${userId} rate limited due to suspicious activity`);
  }

  // Send admin alert
  private async sendAdminAlert(alert: SecurityAlert): Promise<void> {
    // In a real implementation, this would send email/SMS notifications
    console.log('ADMIN ALERT:', alert);
    
    // For now, just log it
    await auditLogger.logSystem('admin_alert', {
      alertId: alert.id,
      severity: alert.severity,
      message: `Admin alert: ${alert.message}`
    });
  }

  // Restrict user access
  private async restrictUserAccess(userId: string): Promise<void> {
    if (!userId) return;

    await addDoc(collection(db, 'access_restrictions'), {
      userId,
      reason: 'Suspicious data access patterns',
      restrictedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      status: 'active',
      restrictions: ['read_sensitive_data', 'export_data']
    });

    console.log(`User ${userId} access restricted due to suspicious activity`);
  }

  // Emergency lockdown
  private async emergencyLockdown(): Promise<void> {
    console.log('EMERGENCY LOCKDOWN ACTIVATED');
    
    // In a real implementation, this would:
    // - Disable all non-essential services
    // - Notify all administrators
    // - Log all activities
    // - Potentially shut down the system
    
    await auditLogger.logSystem('emergency_lockdown', {
      message: 'Emergency lockdown activated due to critical security threat',
      severity: 'critical'
    });
  }

  // Save alert to database
  private async saveAlert(alert: SecurityAlert): Promise<void> {
    try {
      await addDoc(collection(db, 'security_alerts'), alert);
    } catch (error) {
      console.error('Failed to save security alert:', error);
    }
  }

  // Get security alerts
  async getSecurityAlerts(filters: {
    severity?: string;
    category?: string;
    status?: string;
    limit?: number;
  } = {}): Promise<SecurityAlert[]> {
    try {
      const { severity, category, status, limit: limitCount = 100 } = filters;

      let q = query(
        collection(db, 'security_alerts'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (severity) {
        q = query(q, where('severity', '==', severity));
      }
      if (category) {
        q = query(q, where('category', '==', category));
      }
      if (status) {
        q = query(q, where('status', '==', status));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SecurityAlert[];
    } catch (error) {
      console.error('Failed to get security alerts:', error);
      return [];
    }
  }

  // Get security statistics
  async getSecurityStats(timeRange: 'hour' | 'day' | 'week' = 'day'): Promise<{
    totalAlerts: number;
    alertsBySeverity: Record<string, number>;
    alertsByCategory: Record<string, number>;
    activeThreats: number;
    resolvedThreats: number;
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

      const alerts = await this.getSecurityAlerts({
        limit: 1000
      });

      const recentAlerts = alerts.filter(alert => 
        new Date(alert.createdAt) >= startTime
      );

      const alertsBySeverity = recentAlerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const alertsByCategory = recentAlerts.reduce((acc, alert) => {
        acc[alert.category] = (acc[alert.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const activeThreats = recentAlerts.filter(alert => alert.status === 'active').length;
      const resolvedThreats = recentAlerts.filter(alert => alert.status === 'resolved').length;

      return {
        totalAlerts: recentAlerts.length,
        alertsBySeverity,
        alertsByCategory,
        activeThreats,
        resolvedThreats
      };
    } catch (error) {
      console.error('Failed to get security stats:', error);
      return {
        totalAlerts: 0,
        alertsBySeverity: {},
        alertsByCategory: {},
        activeThreats: 0,
        resolvedThreats: 0
      };
    }
  }

  // Subscribe to security alerts
  subscribe(callback: (alert: SecurityAlert) => void): () => void {
    this.subscribers.push(callback);
    
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Resolve alert
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedAt = new Date().toISOString();
      
      // Update in database
      // This would require updating the document in Firestore
      
      await auditLogger.logSystem('alert_resolved', {
        alertId,
        message: `Security alert resolved: ${alert.ruleName}`
      });
    }
  }

  // Generate unique alert ID
  private generateAlertId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get monitoring rules
  getMonitoringRules(): SecurityRule[] {
    return this.monitoringRules;
  }

  // Update monitoring rule
  updateMonitoringRule(ruleId: string, updates: Partial<SecurityRule>): void {
    const ruleIndex = this.monitoringRules.findIndex(r => r.id === ruleId);
    if (ruleIndex > -1) {
      this.monitoringRules[ruleIndex] = {
        ...this.monitoringRules[ruleIndex],
        ...updates
      };
    }
  }
}

// Security rule interface
export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'api_security' | 'authorization' | 'data_security' | 'system_security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold: number;
  timeWindow: number; // in milliseconds
  enabled: boolean;
  action: 'block_ip_temporarily' | 'rate_limit_user' | 'alert_admin' | 'restrict_access' | 'emergency_lockdown';
}

// Security alert interface
export interface SecurityAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  message: string;
  details: any;
  status: 'active' | 'resolved' | 'ignored';
  createdAt: string;
  resolvedAt: string | null;
}

// React hook for security monitoring
export function useSecurityMonitor() {
  const monitor = SecurityMonitor.getInstance();
  const [alerts, setAlerts] = React.useState<SecurityAlert[]>([]);
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    // Subscribe to new alerts
    const unsubscribe = monitor.subscribe((alert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    // Load initial alerts
    monitor.getSecurityAlerts().then(setAlerts);
    monitor.getSecurityStats().then(setStats);

    return unsubscribe;
  }, [monitor]);

  const resolveAlert = React.useCallback((alertId: string) => {
    monitor.resolveAlert(alertId);
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved', resolvedAt: new Date().toISOString() }
        : alert
    ));
  }, [monitor]);

  return {
    alerts,
    stats,
    resolveAlert,
    getMonitoringRules: monitor.getMonitoringRules.bind(monitor),
    updateMonitoringRule: monitor.updateMonitoringRule.bind(monitor)
  };
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance();
