'use client';
import { useContext } from 'react';
import Link from 'next/link';
import {
  Bell,
  Target,
  Users,
  BarChart3,
  Gift,
  Settings,
  Activity,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataContext } from '@/context/data-context';
import { AuthContext } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Notification } from '@/types';

interface SystemNotificationPanelProps {
  showQuickActions?: boolean;
  showSystemStatus?: boolean;
  showAlerts?: boolean;
  maxNotifications?: number;
  className?: string;
}

export default function SystemNotificationPanel({
  showQuickActions = false,
  showSystemStatus = true,
  showAlerts = true,
  maxNotifications = 8,
  className = ''
}: SystemNotificationPanelProps) {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const { notifications, kpiRecords, employees } = useContext(DataContext);

  // Calculate system statistics
  const today = new Date();
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');
  
  const stats = {
    kpis: {
      total: kpiRecords.length,
      completed: kpiRecords.filter(r => r.status === 'approved').length,
      inProgress: kpiRecords.filter(r => r.status === 'awaiting_approval').length,
      overdue: kpiRecords.filter(r => {
        const endDate = new Date(r.endDate);
        return endDate < today && r.status !== 'approved';
      }).length,
    },
    employees: {
      total: nonAdminEmployees.length,
      withKpis: new Set(kpiRecords.map(r => r.employeeId)).size,
    }
  };

  // Get user notifications - admin can see all notifications
  const userNotifications = user?.role === 'admin'
    ? notifications
    : notifications.filter(n => n.userId === user?.uid);

  // Helper function to get employee name from userId
  const getEmployeeName = (userId: string) => {
    if (userId === 'admin') return 'Admin';
    const employee = employees.find(emp => emp.uid === userId);
    return employee?.name || `User ${userId.slice(0, 8)}...`;
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />;
      case 'kpi':
        return <Target className="w-4 h-4 text-purple-600" />;
      case 'report':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'system':
        return <Settings className="w-4 h-4 text-gray-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationAlertClass = (type: Notification['type'], isImportant: boolean) => {
    if (isImportant) {
      return 'alert-error';
    }
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'warning':
        return 'alert-warning';
      case 'error':
        return 'alert-error';
      case 'info':
        return 'alert-info';
      case 'kpi':
        return 'alert-info';
      case 'report':
        return 'alert-info';
      case 'system':
        return 'alert-info';
      default:
        return 'alert-info';
    }
  };

  return (
    <Card className={`h-[750px] flex flex-col ${className}`}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" />
              Thông báo hệ thống
            </CardTitle>
            <CardDescription>
              Quản lý thông báo và theo dõi trạng thái hệ thống
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Quick Actions Section */}
        {showQuickActions && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              {t.dashboard.quickActions}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/admin/kpi-management">
                <div className="p-3 bg-background rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">{t.dashboard.kpiManagement}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.dashboard.kpiManagementDescription}</p>
                </div>
              </Link>
              
              <Link href="/admin/hr-management">
                <div className="p-3 bg-background rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{t.dashboard.hrManagement}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.dashboard.hrManagementDescription}</p>
                </div>
              </Link>
              
              
              <Link href="/admin/kpi-management?tab=reward-penalty">
                <div className="p-3 bg-background rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">{t.nav.rewardPenalty}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.evaluation.rewardsAndPenalties}</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* System Status */}
        {showSystemStatus && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Info className="w-4 h-4" />
              Trạng thái hệ thống
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{stats.kpis.total}</div>
                <div className="text-xs text-blue-600">Tổng KPI</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{stats.kpis.completed}</div>
                <div className="text-xs text-green-600">Hoàn thành</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{stats.kpis.inProgress}</div>
                <div className="text-xs text-orange-600">Đang thực hiện</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{stats.kpis.overdue}</div>
                <div className="text-xs text-red-600">Quá hạn</div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Thông báo gần đây
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {user?.role === 'admin' ? 'Tất cả' : 'Cá nhân'}
              </span>
              <span className="badge-modern badge-info">
                {userNotifications.length}
              </span>
            </div>
          </div>
          {userNotifications
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, maxNotifications)
            .map((notification) => (
              <div 
                key={notification.id} 
                className={`card-modern hover:shadow-lg transition-all duration-200 ${getNotificationAlertClass(notification.type, notification.isImportant)}`}
              >
                <div className="flex items-start gap-3 p-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-foreground">
                          {notification.title}
                        </h3>
                        {/* Show recipient info for admin */}
                        {user?.role === 'admin' && notification.userId !== 'admin' && (
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Gửi tới: {getEmployeeName(notification.userId)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {notification.isImportant && (
                          <span className="badge-modern badge-error">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Quan trọng
                          </span>
                        )}
                        {!notification.isRead && (
                          <span className="badge-modern badge-info">
                            <Bell className="w-3 h-3 mr-1" />
                            Mới
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {notification.message}
                    </p>

                    {/* Show role-specific context */}
                    {user?.role === 'admin' && notification.userId !== 'admin' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-blue-600 font-medium">
                          Thông báo nhân viên
                        </span>
                      </div>
                    )}
                    {user?.role === 'admin' && notification.userId === 'admin' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-purple-600 font-medium">
                          Thông báo hệ thống
                        </span>
                      </div>
                    )}
                    {user?.role !== 'admin' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 font-medium">
                          Thông báo cá nhân
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      {notification.actionUrl && (
                        <Link href={notification.actionUrl}>
                          <button className="btn-outline text-xs px-2 py-1 hover:bg-primary hover:text-primary-foreground transition-colors">
                            Xem chi tiết
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {userNotifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Không có thông báo nào</p>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
