import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { Notification, NotificationTemplate, NotificationSettings } from '@/types';

export class NotificationService {
  /**
   * Tạo thông báo mới
   */
  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'readAt'>): Promise<string> {
    const now = new Date().toISOString();
    const newNotification: Omit<Notification, 'id'> = {
      ...notification,
      createdAt: now
    };
    
    const docRef = await addDoc(collection(db, 'notifications'), newNotification);
    return docRef.id;
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    const readAt = new Date().toISOString();
    
    await updateDoc(notificationRef, {
      isRead: true,
      readAt
    });
  }

  /**
   * Đánh dấu tất cả thông báo của user đã đọc
   */
  static async markAllNotificationsAsRead(userId: string): Promise<void> {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(notificationsQuery);
    const batch = writeBatch(db);
    const readAt = new Date().toISOString();
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        isRead: true,
        readAt
      });
    });
    
    await batch.commit();
  }

  /**
   * Xóa thông báo
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
  }

  /**
   * Lấy thông báo của user
   */
  static async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
  }

  /**
   * Đếm số thông báo chưa đọc
   */
  static async getUnreadNotificationsCount(userId: string): Promise<number> {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(notificationsQuery);
    return snapshot.size;
  }

  /**
   * Tạo template thông báo
   */
  static async createNotificationTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const newTemplate: Omit<NotificationTemplate, 'id'> = {
      ...template,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, 'notificationTemplates'), newTemplate);
    return docRef.id;
  }

  /**
   * Gửi thông báo cho user dựa trên template
   */
  static async sendNotificationToUser(userId: string, templateId: string, data?: Record<string, any>): Promise<void> {
    // Lấy template từ database
    const templateQuery = query(
      collection(db, 'notificationTemplates'),
      where('id', '==', templateId)
    );
    
    const templateSnapshot = await getDocs(templateQuery);
    if (templateSnapshot.empty) {
      throw new Error('Template not found');
    }
    
    const template = templateSnapshot.docs[0].data() as NotificationTemplate;
    
    // Tạo thông báo từ template
    const notification: Omit<Notification, 'id' | 'createdAt' | 'readAt'> = {
      userId,
      title: this.interpolateTemplate(template.title, data),
      message: this.interpolateTemplate(template.message, data),
      type: template.type,
      category: template.category,
      data,
      isRead: false,
      isImportant: template.isImportant || false,
      actionUrl: template.actionUrl ? this.interpolateTemplate(template.actionUrl, data) : undefined,
      actionText: template.actionText
    };
    
    await this.createNotification(notification);
  }

  /**
   * Gửi thông báo hàng loạt
   */
  static async sendBulkNotification(userIds: string[], templateId: string, data?: Record<string, any>): Promise<void> {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    
    // Lấy template
    const templateQuery = query(
      collection(db, 'notificationTemplates'),
      where('id', '==', templateId)
    );
    
    const templateSnapshot = await getDocs(templateQuery);
    if (templateSnapshot.empty) {
      throw new Error('Template not found');
    }
    
    const template = templateSnapshot.docs[0].data() as NotificationTemplate;
    
    userIds.forEach(userId => {
      const notificationRef = doc(collection(db, 'notifications'));
      const notification: Omit<Notification, 'id'> = {
        userId,
        title: this.interpolateTemplate(template.title, data),
        message: this.interpolateTemplate(template.message, data),
        type: template.type,
        category: template.category,
        data,
        isRead: false,
        isImportant: template.isImportant || false,
        actionUrl: template.actionUrl ? this.interpolateTemplate(template.actionUrl, data) : undefined,
        actionText: template.actionText,
        createdAt: now
      };
      
      batch.set(notificationRef, notification);
    });
    
    await batch.commit();
  }

  /**
   * Cập nhật cài đặt thông báo
   */
  static async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<void> {
    const settingsRef = doc(db, 'notificationSettings', userId);
    const now = new Date().toISOString();
    
    await updateDoc(settingsRef, {
      ...settings,
      updatedAt: now
    });
  }

  /**
   * Lấy cài đặt thông báo
   */
  static async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    const settingsRef = doc(db, 'notificationSettings', userId);
    const settingsDoc = await getDocs(query(collection(db, 'notificationSettings'), where('userId', '==', userId)));
    
    if (settingsDoc.empty) {
      return null;
    }
    
    return settingsDoc.docs[0].data() as NotificationSettings;
  }

  /**
   * Tạo thông báo mẫu cho testing
   */
  static async createSampleNotifications(userId: string): Promise<void> {
    const sampleNotifications = [
      {
        userId,
        title: 'Chào mừng đến với hệ thống KPI!',
        message: 'Bạn đã đăng nhập thành công vào hệ thống quản lý KPI. Hãy bắt đầu cập nhật các chỉ số của mình.',
        type: 'success' as const,
        category: 'general' as const,
        isRead: false,
        isImportant: true,
        actionUrl: '/employee/self-update-metrics',
        actionText: 'Cập nhật KPI'
      },
      {
        userId,
        title: 'KPI tháng này sắp hết hạn',
        message: 'Bạn có 3 KPI cần hoàn thành trong tuần này. Hãy kiểm tra và cập nhật tiến độ.',
        type: 'warning' as const,
        category: 'kpi_deadline_reminder' as const,
        isRead: false,
        isImportant: false,
        actionUrl: '/employee/reports',
        actionText: 'Xem chi tiết'
      },
      {
        userId,
        title: 'Báo cáo đã được phê duyệt',
        message: 'Báo cáo tháng 12/2024 của bạn đã được phê duyệt bởi quản lý.',
        type: 'success' as const,
        category: 'report_approved' as const,
        isRead: true,
        isImportant: false,
        actionUrl: '/employee/reports',
        actionText: 'Xem báo cáo'
      },
      {
        userId,
        title: 'Cập nhật hệ thống',
        message: 'Hệ thống đã được cập nhật với các tính năng mới. Hãy khám phá các tính năng mới.',
        type: 'info' as const,
        category: 'system_update' as const,
        isRead: false,
        isImportant: false,
        actionUrl: '/admin/system-settings',
        actionText: 'Tìm hiểu thêm'
      }
    ];

    const batch = writeBatch(db);
    const now = new Date().toISOString();

    sampleNotifications.forEach(notification => {
      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, {
        ...notification,
        createdAt: now
      });
    });

    await batch.commit();
  }

  /**
   * Interpolate template với data
   */
  private static interpolateTemplate(template: string, data?: Record<string, any>): string {
    if (!data) return template;
    
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }
}
