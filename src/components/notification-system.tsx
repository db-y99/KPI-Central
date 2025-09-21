'use client';
import { useContext, useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  FileText, 
  Target,
  Gift,
  User,
  Calendar,
  MessageCircle,
  Settings
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import type { Notification as DBNotification } from '@/types';

interface Notification {
  id: string;
  type: 'report_submitted' | 'report_approved' | 'report_rejected' | 'report_needs_revision' | 
        'kpi_overdue' | 'kpi_assigned' | 'evaluation_completed' | 'reward_calculated' | 
        'system_message' | 'deadline_reminder';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  relatedId?: string; // KPI ID, Report ID, etc.
  actionRequired?: boolean;
  priority: 'low' | 'medium' | 'high';
  sender?: string;
  metadata?: {
    employeeName?: string;
    kpiName?: string;
    amount?: number;
    daysLeft?: number;
  };
}

interface NotificationSystemProps {
  className?: string;
}

export default function NotificationSystem({ className }: NotificationSystemProps) {
  const { user } = useContext(AuthContext);
  const { 
    getNotificationsByUser, 
    getUnreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification 
  } = useContext(DataContext);
  
  const [isOpen, setIsOpen] = useState(false);
  
  // Get real notifications from database
  const notifications = user ? getNotificationsByUser(user.uid || '') : [];
  const unreadCount = user ? getUnreadNotificationsCount(user.uid || '') : 0;

  const getNotificationIcon = (type: DBNotification['type']) => {
    switch (type) {
      case 'report':
        return <FileText className="w-4 h-4" />;
      case 'kpi':
        return <Target className="w-4 h-4" />;
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: DBNotification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-orange-600 bg-orange-100';
      case 'report':
        return 'text-blue-600 bg-blue-100';
      case 'kpi':
        return 'text-purple-600 bg-purple-100';
      case 'system':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityBadge = (isImportant: boolean) => {
    if (isImportant) {
      return <Badge variant="destructive" className="text-xs">Cao</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Thấp</Badge>;
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;
    try {
      await markAllNotificationsAsRead(user.uid);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotificationHandler = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-md max-h-[80vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Thông báo
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </DialogTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Đọc tất cả
                </Button>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="h-[500px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {getPriorityBadge(notification.isImportant)}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => deleteNotificationHandler(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatTimeAgo(notification.createdAt)}</span>
                            {notification.sender && (
                              <>
                                <span>•</span>
                                <span>{notification.sender}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {notification.isImportant && (
                              <Badge variant="outline" className="text-xs">
                                Quan trọng
                              </Badge>
                            )}
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Đánh dấu đã đọc
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Action buttons for specific notification types */}
                        {notification.actionUrl && (
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              className="h-7 text-xs"
                              onClick={() => {
                                if (notification.actionUrl) {
                                  window.location.href = notification.actionUrl;
                                }
                              }}
                            >
                              {notification.actionText || t.reports.viewDetails}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
