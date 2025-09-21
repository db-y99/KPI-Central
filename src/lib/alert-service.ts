import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: 'kpi_performance' | 'deadline' | 'threshold' | 'anomaly' | 'custom';
  conditions: AlertCondition[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  notificationChannels: ('email' | 'push' | 'sms')[];
  recipients: string[]; // User IDs
  cooldownMinutes: number; // Prevent spam
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AlertCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface Alert {
  id: string;
  ruleId: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  data: Record<string, any>;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  dismissedAt?: string;
  dismissedBy?: string;
  recipients: string[];
  notificationSent: boolean;
}

export interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  titleTemplate: string;
  messageTemplate: string;
  severity: Alert['severity'];
  conditions: AlertCondition[];
  isDefault: boolean;
}

class AlertService {
  private static instance: AlertService;
  private listeners: Map<string, () => void> = new Map();

  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  /**
   * Create a new alert rule
   */
  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const alertRule: Omit<AlertRule, 'id'> = {
        ...rule,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'alertRules'), alertRule);
      return docRef.id;
    } catch (error) {
      console.error('Error creating alert rule:', error);
      throw error;
    }
  }

  /**
   * Update an alert rule
   */
  async updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<void> {
    try {
      const ruleRef = doc(db, 'alertRules', ruleId);
      await updateDoc(ruleRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating alert rule:', error);
      throw error;
    }
  }

  /**
   * Get all alert rules
   */
  async getAlertRules(): Promise<AlertRule[]> {
    try {
      const snapshot = await getDocs(collection(db, 'alertRules'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AlertRule));
    } catch (error) {
      console.error('Error getting alert rules:', error);
      return [];
    }
  }

  /**
   * Get active alert rules
   */
  async getActiveAlertRules(): Promise<AlertRule[]> {
    try {
      const q = query(
        collection(db, 'alertRules'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AlertRule));
    } catch (error) {
      console.error('Error getting active alert rules:', error);
      return [];
    }
  }

  /**
   * Create an alert
   */
  async createAlert(alert: Omit<Alert, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'alerts'), alert);
      return docRef.id;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Get alerts for a user
   */
  async getUserAlerts(userId: string, limit: number = 50): Promise<Alert[]> {
    try {
      const q = query(
        collection(db, 'alerts'),
        where('recipients', 'array-contains', userId),
        orderBy('triggeredAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Alert)).slice(0, limit);
    } catch (error) {
      console.error('Error getting user alerts:', error);
      return [];
    }
  }

  /**
   * Get active alerts for a user
   */
  async getActiveUserAlerts(userId: string): Promise<Alert[]> {
    try {
      const q = query(
        collection(db, 'alerts'),
        where('recipients', 'array-contains', userId),
        where('status', '==', 'active'),
        orderBy('triggeredAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Alert));
    } catch (error) {
      console.error('Error getting active user alerts:', error);
      return [];
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    try {
      const alertRef = doc(db, 'alerts', alertId);
      await updateDoc(alertRef, {
        status: 'acknowledged',
        acknowledgedAt: new Date().toISOString(),
        acknowledgedBy: userId
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, userId: string): Promise<void> {
    try {
      const alertRef = doc(db, 'alerts', alertId);
      await updateDoc(alertRef, {
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        resolvedBy: userId
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  /**
   * Dismiss an alert
   */
  async dismissAlert(alertId: string, userId: string): Promise<void> {
    try {
      const alertRef = doc(db, 'alerts', alertId);
      await updateDoc(alertRef, {
        status: 'dismissed',
        dismissedAt: new Date().toISOString(),
        dismissedBy: userId
      });
    } catch (error) {
      console.error('Error dismissing alert:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time alerts for a user
   */
  subscribeToUserAlerts(
    userId: string,
    callback: (alerts: Alert[]) => void
  ): () => void {
    const q = query(
      collection(db, 'alerts'),
      where('recipients', 'array-contains', userId),
      orderBy('triggeredAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Alert));
      callback(alerts);
    });

    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Evaluate alert rules against data
   */
  async evaluateAlertRules(data: Record<string, any>): Promise<void> {
    try {
      const activeRules = await this.getActiveAlertRules();
      
      for (const rule of activeRules) {
        const shouldTrigger = this.evaluateConditions(rule.conditions, data);
        
        if (shouldTrigger) {
          // Check cooldown
          const lastAlert = await this.getLastAlertForRule(rule.id);
          if (lastAlert && this.isWithinCooldown(lastAlert.triggeredAt, rule.cooldownMinutes)) {
            continue;
          }

          // Create alert
          const alert: Omit<Alert, 'id'> = {
            ruleId: rule.id,
            title: this.generateAlertTitle(rule, data),
            message: this.generateAlertMessage(rule, data),
            severity: rule.severity,
            status: 'active',
            data,
            triggeredAt: new Date().toISOString(),
            recipients: rule.recipients,
            notificationSent: false
          };

          const alertId = await this.createAlert(alert);
          
          // Send notifications
          await this.sendAlertNotifications(alertId, alert);
        }
      }
    } catch (error) {
      console.error('Error evaluating alert rules:', error);
    }
  }

  /**
   * Evaluate conditions against data
   */
  private evaluateConditions(conditions: AlertCondition[], data: Record<string, any>): boolean {
    if (conditions.length === 0) return false;

    let result = this.evaluateCondition(conditions[0], data);
    
    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(condition, data);
      
      if (condition.logicalOperator === 'OR') {
        result = result || conditionResult;
      } else {
        result = result && conditionResult;
      }
    }

    return result;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: AlertCondition, data: Record<string, any>): boolean {
    const fieldValue = data[condition.field];
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'not_contains':
        return !String(fieldValue).includes(String(condition.value));
      default:
        return false;
    }
  }

  /**
   * Generate alert title
   */
  private generateAlertTitle(rule: AlertRule, data: Record<string, any>): string {
    switch (rule.type) {
      case 'kpi_performance':
        return `KPI Performance Alert: ${data.kpiName || 'Unknown KPI'}`;
      case 'deadline':
        return `Deadline Alert: ${data.taskName || 'Task'}`;
      case 'threshold':
        return `Threshold Alert: ${rule.name}`;
      case 'anomaly':
        return `Anomaly Detected: ${rule.name}`;
      default:
        return rule.name;
    }
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(rule: AlertRule, data: Record<string, any>): string {
    switch (rule.type) {
      case 'kpi_performance':
        return `KPI "${data.kpiName}" is ${data.performance}% of target. Current value: ${data.currentValue}, Target: ${data.target}`;
      case 'deadline':
        return `Task "${data.taskName}" is due in ${data.daysLeft} days. Please take action.`;
      case 'threshold':
        return `Threshold exceeded for ${rule.name}. Current value: ${data.currentValue}, Threshold: ${data.threshold}`;
      case 'anomaly':
        return `Anomaly detected in ${rule.name}. Value: ${data.value} is outside normal range.`;
      default:
        return rule.description;
    }
  }

  /**
   * Get last alert for a rule
   */
  private async getLastAlertForRule(ruleId: string): Promise<Alert | null> {
    try {
      const q = query(
        collection(db, 'alerts'),
        where('ruleId', '==', ruleId),
        orderBy('triggeredAt', 'desc')
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as Alert;
    } catch (error) {
      console.error('Error getting last alert for rule:', error);
      return null;
    }
  }

  /**
   * Check if within cooldown period
   */
  private isWithinCooldown(triggeredAt: string, cooldownMinutes: number): boolean {
    const triggered = new Date(triggeredAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - triggered.getTime()) / (1000 * 60);
    return diffMinutes < cooldownMinutes;
  }

  /**
   * Send alert notifications
   */
  private async sendAlertNotifications(alertId: string, alert: Omit<Alert, 'id'>): Promise<void> {
    try {
      // This would integrate with your notification service
      // For now, just mark as sent
      const alertRef = doc(db, 'alerts', alertId);
      await updateDoc(alertRef, {
        notificationSent: true
      });
    } catch (error) {
      console.error('Error sending alert notifications:', error);
    }
  }

  /**
   * Get alert templates
   */
  async getAlertTemplates(): Promise<AlertTemplate[]> {
    try {
      const snapshot = await getDocs(collection(db, 'alertTemplates'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AlertTemplate));
    } catch (error) {
      console.error('Error getting alert templates:', error);
      return [];
    }
  }

  /**
   * Create alert from template
   */
  async createAlertFromTemplate(templateId: string, customizations: Partial<AlertRule>): Promise<string> {
    try {
      const template = await this.getAlertTemplate(templateId);
      if (!template) throw new Error('Template not found');

      const rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'> = {
        name: template.name,
        description: template.description,
        type: template.type as any,
        conditions: template.conditions,
        severity: template.severity,
        isActive: true,
        notificationChannels: ['email', 'push'],
        recipients: [],
        cooldownMinutes: 60,
        createdBy: 'current-user-id', // This would come from auth context
        ...customizations
      };

      return this.createAlertRule(rule);
    } catch (error) {
      console.error('Error creating alert from template:', error);
      throw error;
    }
  }

  /**
   * Get alert template by ID
   */
  private async getAlertTemplate(templateId: string): Promise<AlertTemplate | null> {
    try {
      const templateDoc = await getDocs(query(
        collection(db, 'alertTemplates'),
        where('id', '==', templateId)
      ));
      
      if (templateDoc.empty) return null;
      
      return {
        id: templateDoc.docs[0].id,
        ...templateDoc.docs[0].data()
      } as AlertTemplate;
    } catch (error) {
      console.error('Error getting alert template:', error);
      return null;
    }
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

export const alertService = AlertService.getInstance();

// Default alert templates
export const defaultAlertTemplates: Omit<AlertTemplate, 'id'>[] = [
  {
    name: 'KPI Performance Below Target',
    description: 'Alert when KPI performance falls below 80% of target',
    type: 'kpi_performance',
    titleTemplate: 'KPI Performance Alert: {kpiName}',
    messageTemplate: 'KPI "{kpiName}" is {performance}% of target. Current value: {currentValue}, Target: {target}',
    severity: 'medium',
    conditions: [
      { field: 'performance', operator: 'less_than', value: 80 }
    ],
    isDefault: true
  },
  {
    name: 'KPI Deadline Approaching',
    description: 'Alert when KPI deadline is within 3 days',
    type: 'deadline',
    titleTemplate: 'Deadline Alert: {kpiName}',
    messageTemplate: 'KPI "{kpiName}" deadline is approaching. {daysLeft} days left until {deadline}',
    severity: 'high',
    conditions: [
      { field: 'daysLeft', operator: 'less_than', value: 3 }
    ],
    isDefault: true
  },
  {
    name: 'Critical KPI Failure',
    description: 'Alert when KPI performance falls below 50% of target',
    type: 'kpi_performance',
    titleTemplate: 'Critical KPI Alert: {kpiName}',
    messageTemplate: 'CRITICAL: KPI "{kpiName}" is only {performance}% of target. Immediate action required!',
    severity: 'critical',
    conditions: [
      { field: 'performance', operator: 'less_than', value: 50 }
    ],
    isDefault: true
  },
  {
    name: 'Anomaly Detection',
    description: 'Alert when KPI value is significantly different from historical average',
    type: 'anomaly',
    titleTemplate: 'Anomaly Detected: {kpiName}',
    messageTemplate: 'Anomaly detected in KPI "{kpiName}". Current value: {currentValue} is {deviation}% different from average',
    severity: 'medium',
    conditions: [
      { field: 'deviation', operator: 'greater_than', value: 50 }
    ],
    isDefault: true
  }
];
