import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  getDocs,
  doc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'kpi' | 'reward' | 'system' | 'approval' | 'alert';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  categories: {
    kpi: boolean;
    reward: boolean;
    system: boolean;
    approval: boolean;
    alert: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

class NotificationService {
  private static instance: NotificationService;
  private listeners: Map<string, () => void> = new Map();

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send notification to specific user
   */
  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    category: Notification['category'] = 'system',
    priority: Notification['priority'] = 'medium',
    actionUrl?: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const notification: Omit<Notification, 'id'> = {
        userId,
        title,
        message,
        type,
        category,
        isRead: false,
        createdAt: new Date().toISOString(),
        actionUrl,
        priority,
        metadata
      };

      const docRef = await addDoc(collection(db, 'notifications'), notification);
      
      // Send email notification if enabled
      await this.sendEmailNotification(userId, notification);
      
      return docRef.id;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendBulkNotification(
    userIds: string[],
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    category: Notification['category'] = 'system',
    priority: Notification['priority'] = 'medium',
    actionUrl?: string,
    metadata?: Record<string, any>
  ): Promise<string[]> {
    const promises = userIds.map(userId => 
      this.sendNotification(userId, title, message, type, category, priority, actionUrl, metadata)
    );
    
    return Promise.all(promises);
  }

  /**
   * Send notification to all users in a department
   */
  async sendDepartmentNotification(
    departmentId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    category: Notification['category'] = 'system',
    priority: Notification['priority'] = 'medium',
    actionUrl?: string,
    metadata?: Record<string, any>
  ): Promise<string[]> {
    // This would require getting all users in department first
    // For now, we'll implement a simplified version
    const userIds = await this.getDepartmentUserIds(departmentId);
    return this.sendBulkNotification(userIds, title, message, type, category, priority, actionUrl, metadata);
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification)).slice(0, limit);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          isRead: true,
          readAt: new Date().toISOString()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time notifications for a user
   */
  subscribeToUserNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): () => void {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      callback(notifications);
    });

    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Get notification settings for a user
   */
  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const q = query(
        collection(db, 'notificationSettings'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as NotificationSettings;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  /**
   * Update notification settings for a user
   */
  async updateNotificationSettings(
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<void> {
    try {
      const existingSettings = await this.getNotificationSettings(userId);
      
      if (existingSettings) {
        const settingsRef = doc(db, 'notificationSettings', existingSettings.id);
        await updateDoc(settingsRef, {
          ...settings,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'notificationSettings'), {
          userId,
          ...settings,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  /**
   * Send email notification (placeholder for email service integration)
   */
  private async sendEmailNotification(
    userId: string,
    notification: Omit<Notification, 'id'>
  ): Promise<void> {
    try {
      const settings = await this.getNotificationSettings(userId);
      
      if (!settings?.emailNotifications) {
        return;
      }

      // Check if it's quiet hours
      if (settings.quietHours.enabled) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const startTime = this.parseTime(settings.quietHours.start);
        const endTime = this.parseTime(settings.quietHours.end);
        
        if (currentTime >= startTime && currentTime <= endTime) {
          return;
        }
      }

      // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
      console.log(`Sending email notification to user ${userId}:`, notification.title);
      
      // Placeholder for actual email sending
      // await emailService.send({
      //   to: userEmail,
      //   subject: notification.title,
      //   body: notification.message,
      //   template: 'notification',
      //   data: notification
      // });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  /**
   * Get user IDs in a department (placeholder)
   */
  private async getDepartmentUserIds(departmentId: string): Promise<string[]> {
    // This would query the employees collection
    // For now, return empty array
    return [];
  }

  /**
   * Parse time string to minutes
   */
  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

export const notificationService = NotificationService.getInstance();

// Helper functions for common notification types
export const NotificationHelpers = {
  /**
   * Send KPI deadline reminder
   */
  async sendKpiDeadlineReminder(
    userId: string,
    kpiName: string,
    deadline: string,
    daysLeft: number
  ): Promise<string> {
    return notificationService.sendNotification(
      userId,
      'KPI Deadline Reminder',
      `KPI "${kpiName}" deadline is approaching. ${daysLeft} days left until ${deadline}`,
      'warning',
      'kpi',
      daysLeft <= 1 ? 'urgent' : 'medium',
      '/employee',
      { kpiName, deadline, daysLeft }
    );
  },

  /**
   * Send reward calculation notification
   */
  async sendRewardCalculationNotification(
    userId: string,
    period: string,
    amount: number
  ): Promise<string> {
    return notificationService.sendNotification(
      userId,
      'Reward Calculation Ready',
      `Your reward calculation for ${period} is ready. Amount: ${amount.toLocaleString()} VND`,
      'success',
      'reward',
      'medium',
      '/employee/rewards',
      { period, amount }
    );
  },

  /**
   * Send approval request notification
   */
  async sendApprovalRequestNotification(
    managerId: string,
    employeeName: string,
    requestType: string
  ): Promise<string> {
    return notificationService.sendNotification(
      managerId,
      'Approval Request',
      `${employeeName} has submitted a ${requestType} for your approval`,
      'info',
      'approval',
      'medium',
      '/admin/approval',
      { employeeName, requestType }
    );
  },

  /**
   * Send system alert
   */
  async sendSystemAlert(
    userId: string,
    title: string,
    message: string,
    priority: Notification['priority'] = 'high'
  ): Promise<string> {
    return notificationService.sendNotification(
      userId,
      title,
      message,
      'error',
      'system',
      priority,
      undefined,
      { isSystemAlert: true }
    );
  }
};
