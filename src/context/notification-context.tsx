'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { notificationService, NotificationHelpers, type Notification, type NotificationSettings } from '@/lib/notification-service';
import { AuthContext } from '@/context/auth-context';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (
    userId: string,
    title: string,
    message: string,
    type?: Notification['type'],
    category?: Notification['category'],
    priority?: Notification['priority'],
    actionUrl?: string,
    metadata?: Record<string, any>
  ) => Promise<string>;
  settings: NotificationSettings | null;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  sendNotification: async () => '',
  settings: null,
  updateSettings: async () => {},
  refreshNotifications: async () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Load notifications and settings when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadSettings();
      
      // Subscribe to real-time notifications
      const unsubscribe = notificationService.subscribeToUserNotifications(
        user.uid!,
        (newNotifications) => {
          setNotifications(newNotifications);
        }
      );

      return () => {
        unsubscribe();
      };
    } else {
      setNotifications([]);
      setSettings(null);
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userNotifications = await notificationService.getUserNotifications(user.uid!);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const userSettings = await notificationService.getNotificationSettings(user.uid!);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await notificationService.markAllAsRead(user.uid!);
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const sendNotification = async (
    userId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    category: Notification['category'] = 'system',
    priority: Notification['priority'] = 'medium',
    actionUrl?: string,
    metadata?: Record<string, any>
  ): Promise<string> => {
    return notificationService.sendNotification(
      userId,
      title,
      message,
      type,
      category,
      priority,
      actionUrl,
      metadata
    );
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;
    
    try {
      await notificationService.updateNotificationSettings(user.uid!, newSettings);
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    sendNotification,
    settings,
    updateSettings,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Export helper functions for easy access
export { NotificationHelpers };
