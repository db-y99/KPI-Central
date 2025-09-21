'use client';

import { useState } from 'react';
import { Bell, X, Settings, Check, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useNotifications, NotificationHelpers } from '@/context/notification-context';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useLanguage } from '@/context/language-context';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, settings, updateSettings } = useNotifications();
  const { t } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between p-3">
            <h3 className="font-semibold">Thông báo</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Đọc tất cả
                </Button>
              )}
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-96">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      !notification.isRead ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {notification.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: vi
                            })}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notification Settings Dialog */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cài đặt thông báo</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Email Notifications</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-sm">
                Nhận thông báo qua email
              </Label>
              <Switch
                id="email-notifications"
                checked={settings?.emailNotifications || false}
                onCheckedChange={(checked) => 
                  updateSettings({ emailNotifications: checked })
                }
              />
            </div>
          </div>

          {/* Push Notifications */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Push Notifications</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="text-sm">
                Nhận thông báo push
              </Label>
              <Switch
                id="push-notifications"
                checked={settings?.pushNotifications || false}
                onCheckedChange={(checked) => 
                  updateSettings({ pushNotifications: checked })
                }
              />
            </div>
          </div>

          {/* Notification Categories */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Loại thông báo</Label>
            <div className="space-y-2">
              {Object.entries(settings?.categories || {}).map(([category, enabled]) => (
                <div key={category} className="flex items-center justify-between">
                  <Label htmlFor={`category-${category}`} className="text-sm capitalize">
                    {category === 'kpi' ? t.nav.kpis : 
                     category === 'reward' ? t.kpis.reward :
                     category === 'system' ? 'Hệ thống' :
                     category === 'approval' ? 'Phê duyệt' :
                     category === 'alert' ? t.common.warning : category}
                  </Label>
                  <Switch
                    id={`category-${category}`}
                    checked={enabled}
                    onCheckedChange={(checked) => 
                      updateSettings({
                        categories: {
                          ...settings?.categories,
                          [category]: checked
                        }
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notification Frequency */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tần suất thông báo</Label>
            <Select
              value={settings?.frequency || 'immediate'}
              onValueChange={(value) => 
                updateSettings({ frequency: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Ngay lập tức</SelectItem>
                <SelectItem value="daily">Hàng ngày</SelectItem>
                <SelectItem value="weekly">Hàng tuần</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Giờ yên tĩnh</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-hours" className="text-sm">
                Bật giờ yên tĩnh
              </Label>
              <Switch
                id="quiet-hours"
                checked={settings?.quietHours?.enabled || false}
                onCheckedChange={(checked) => 
                  updateSettings({
                    quietHours: {
                      ...settings?.quietHours,
                      enabled: checked,
                      start: settings?.quietHours?.start || '22:00',
                      end: settings?.quietHours?.end || '08:00'
                    }
                  })
                }
              />
            </div>
            
            {settings?.quietHours?.enabled && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="quiet-start" className="text-xs">Từ</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => 
                      updateSettings({
                        quietHours: {
                          ...settings.quietHours,
                          start: e.target.value
                        }
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-end" className="text-xs">Đến</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => 
                      updateSettings({
                        quietHours: {
                          ...settings.quietHours,
                          end: e.target.value
                        }
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </>
  );
}
