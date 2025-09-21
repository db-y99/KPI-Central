'use client';
import { useState, useContext } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import {
  Settings,
  Save,
  RefreshCw,
  Database,
  Mail,
  Bell,
  Shield,
  Users,
  Target,
  Award,
  Calendar,
  Globe,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface SystemSettings {
  general: {
    companyName: string;
    companyLogo: string;
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
    workingDays: string[];
    workingHours: {
      start: string;
      end: string;
    };
  };
  kpi: {
    defaultFrequency: string;
    autoReminderDays: number;
    allowSelfUpdate: boolean;
    requireApproval: boolean;
    maxKpiPerEmployee: number;
    kpiWeightSum: number;
  };
  rewards: {
    enabled: boolean;
    defaultRewardRate: number;
    penaltyRate: number;
    bonusMultiplier: number;
    autoCalculate: boolean;
    requireApproval: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
    reminderEnabled: boolean;
    reminderDays: number;
    autoNotifications: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
    requireUppercase: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
}

export default function SystemSettingsPage() {
  const { departments, employees } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  
  // Mock system settings - in real app, this would come from context/API
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      companyName: 'KPI Central',
      companyLogo: '',
      timezone: 'Asia/Ho_Chi_Minh',
      language: 'vi',
      dateFormat: 'DD/MM/YYYY',
      currency: 'VND',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHours: {
        start: '08:00',
        end: '17:00'
      }
    },
    kpi: {
      defaultFrequency: 'monthly',
      autoReminderDays: 3,
      allowSelfUpdate: true,
      requireApproval: true,
      maxKpiPerEmployee: 10,
      kpiWeightSum: 100
    },
    rewards: {
      enabled: true,
      defaultRewardRate: 0.1,
      penaltyRate: 0.05,
      bonusMultiplier: 1.5,
      autoCalculate: true,
      requireApproval: true
    },
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false,
      reminderEnabled: true,
      reminderDays: 3,
      autoNotifications: true
    },
    security: {
      sessionTimeout: 480, // 8 hours in minutes
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      maxLoginAttempts: 5,
      lockoutDuration: 30 // minutes
    }
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Here you would typically save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'Thành công!',
        description: 'Đã lưu cài đặt hệ thống.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: 'Không thể lưu cài đặt. Vui lòng thử lại.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại tất cả cài đặt về mặc định?')) {
      // Reset to default settings
      toast({
        title: 'Thành công!',
        description: 'Đã đặt lại cài đặt về mặc định.',
      });
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const getWorkingDaysLabel = (days: string[]) => {
    const dayMap = {
      monday: 'T2',
      tuesday: 'T3',
      wednesday: 'T4',
      thursday: 'T5',
      friday: 'T6',
      saturday: 'T7',
      sunday: 'CN'
    };
    return days.map(day => dayMap[day as keyof typeof dayMap]).join(', ');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.settings.title}</h1>
          <p className="text-muted-foreground">
            {t.settings.subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.settings.reset}
          </Button>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? t.settings.saving : t.settings.saveChanges}
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.settings.totalEmployees}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              {t.settings.fromLastMonth}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.settings.departments}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              {t.settings.active}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.settings.kpisTracking}</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              {t.settings.thisWeek}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.settings.notificationsSent}</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              {t.settings.fromLastMonthPercent}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Chung</TabsTrigger>
          <TabsTrigger value="kpi">KPI</TabsTrigger>
          <TabsTrigger value="rewards">Thưởng</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Thông tin Công ty
              </CardTitle>
              <CardDescription>
                Cài đặt thông tin cơ bản của công ty
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Tên công ty</Label>
                  <Input
                    id="company-name"
                    value={settings.general.companyName}
                    onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                    placeholder="Nhập tên công ty"
                  />
                </div>
                <div>
                  <Label htmlFor="company-logo">Logo công ty (URL)</Label>
                  <Input
                    id="company-logo"
                    value={settings.general.companyLogo}
                    onChange={(e) => updateSetting('general', 'companyLogo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="timezone">Múi giờ</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => updateSetting('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn múi giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Ngôn ngữ</Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) => updateSetting('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Tiền tệ</Label>
                  <Select
                    value={settings.general.currency}
                    onValueChange={(value) => updateSetting('general', 'currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tiền tệ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="working-hours-start">Giờ làm việc bắt đầu</Label>
                  <Input
                    id="working-hours-start"
                    type="time"
                    value={settings.general.workingHours.start}
                    onChange={(e) => updateSetting('general', 'workingHours', {
                      ...settings.general.workingHours,
                      start: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="working-hours-end">Giờ làm việc kết thúc</Label>
                  <Input
                    id="working-hours-end"
                    type="time"
                    value={settings.general.workingHours.end}
                    onChange={(e) => updateSetting('general', 'workingHours', {
                      ...settings.general.workingHours,
                      end: e.target.value
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>Ngày làm việc</Label>
                <div className="flex gap-2 mt-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const dayMap = {
                      monday: 'T2',
                      tuesday: 'T3',
                      wednesday: 'T4',
                      thursday: 'T5',
                      friday: 'T6',
                      saturday: 'T7',
                      sunday: 'CN'
                    };
                    return (
                      <label key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.general.workingDays.includes(day)}
                          onChange={(e) => {
                            const newDays = e.target.checked
                              ? [...settings.general.workingDays, day]
                              : settings.general.workingDays.filter(d => d !== day);
                            updateSetting('general', 'workingDays', newDays);
                          }}
                        />
                        <span className="text-sm">{dayMap[day as keyof typeof dayMap]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPI Settings */}
        <TabsContent value="kpi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Cài đặt KPI
              </CardTitle>
              <CardDescription>
                Cấu hình các tham số liên quan đến KPI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default-frequency">Tần suất mặc định</Label>
                  <Select
                    value={settings.kpi.defaultFrequency}
                    onValueChange={(value) => updateSetting('kpi', 'defaultFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tần suất" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Hàng ngày</SelectItem>
                      <SelectItem value="weekly">Hàng tuần</SelectItem>
                      <SelectItem value="monthly">Hàng tháng</SelectItem>
                      <SelectItem value="quarterly">Hàng quý</SelectItem>
                      <SelectItem value="annually">Hàng năm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="auto-reminder-days">Số ngày nhắc nhở tự động</Label>
                  <Input
                    id="auto-reminder-days"
                    type="number"
                    value={settings.kpi.autoReminderDays}
                    onChange={(e) => updateSetting('kpi', 'autoReminderDays', Number(e.target.value))}
                    min="1"
                    max="30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-kpi-per-employee">Số KPI tối đa mỗi nhân viên</Label>
                  <Input
                    id="max-kpi-per-employee"
                    type="number"
                    value={settings.kpi.maxKpiPerEmployee}
                    onChange={(e) => updateSetting('kpi', 'maxKpiPerEmployee', Number(e.target.value))}
                    min="1"
                    max="50"
                  />
                </div>
                <div>
                  <Label htmlFor="kpi-weight-sum">Tổng trọng số KPI</Label>
                  <Input
                    id="kpi-weight-sum"
                    type="number"
                    value={settings.kpi.kpiWeightSum}
                    onChange={(e) => updateSetting('kpi', 'kpiWeightSum', Number(e.target.value))}
                    min="1"
                    max="1000"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-self-update">Cho phép nhân viên tự cập nhật</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhân viên có thể tự cập nhật giá trị KPI của mình
                    </p>
                  </div>
                  <Switch
                    id="allow-self-update"
                    checked={settings.kpi.allowSelfUpdate}
                    onCheckedChange={(checked) => updateSetting('kpi', 'allowSelfUpdate', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-approval">Yêu cầu phê duyệt</Label>
                    <p className="text-sm text-muted-foreground">
                      KPI cần được phê duyệt trước khi được tính vào kết quả
                    </p>
                  </div>
                  <Switch
                    id="require-approval"
                    checked={settings.kpi.requireApproval}
                    onCheckedChange={(checked) => updateSetting('kpi', 'requireApproval', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Settings */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Cài đặt Thưởng
              </CardTitle>
              <CardDescription>
                Cấu hình hệ thống thưởng và phạt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="rewards-enabled">Kích hoạt hệ thống thưởng</Label>
                  <p className="text-sm text-muted-foreground">
                    Bật/tắt tính năng tính toán thưởng tự động
                  </p>
                </div>
                <Switch
                  id="rewards-enabled"
                  checked={settings.rewards.enabled}
                  onCheckedChange={(checked) => updateSetting('rewards', 'enabled', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="default-reward-rate">Tỷ lệ thưởng mặc định (%)</Label>
                  <Input
                    id="default-reward-rate"
                    type="number"
                    value={settings.rewards.defaultRewardRate * 100}
                    onChange={(e) => updateSetting('rewards', 'defaultRewardRate', Number(e.target.value) / 100)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="penalty-rate">Tỷ lệ phạt (%)</Label>
                  <Input
                    id="penalty-rate"
                    type="number"
                    value={settings.rewards.penaltyRate * 100}
                    onChange={(e) => updateSetting('rewards', 'penaltyRate', Number(e.target.value) / 100)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="bonus-multiplier">Hệ số thưởng đặc biệt</Label>
                  <Input
                    id="bonus-multiplier"
                    type="number"
                    value={settings.rewards.bonusMultiplier}
                    onChange={(e) => updateSetting('rewards', 'bonusMultiplier', Number(e.target.value))}
                    min="1"
                    max="10"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-calculate">Tính toán tự động</Label>
                    <p className="text-sm text-muted-foreground">
                      Tự động tính toán thưởng dựa trên kết quả KPI
                    </p>
                  </div>
                  <Switch
                    id="auto-calculate"
                    checked={settings.rewards.autoCalculate}
                    onCheckedChange={(checked) => updateSetting('rewards', 'autoCalculate', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-approval-rewards">Yêu cầu phê duyệt thưởng</Label>
                    <p className="text-sm text-muted-foreground">
                      Thưởng cần được phê duyệt trước khi chi trả
                    </p>
                  </div>
                  <Switch
                    id="require-approval-rewards"
                    checked={settings.rewards.requireApproval}
                    onCheckedChange={(checked) => updateSetting('rewards', 'requireApproval', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Cài đặt Thông báo
              </CardTitle>
              <CardDescription>
                Cấu hình các kênh thông báo và nhắc nhở
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-enabled">Kích hoạt Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Gửi thông báo qua email
                    </p>
                  </div>
                  <Switch
                    id="email-enabled"
                    checked={settings.notifications.emailEnabled}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-enabled">Kích hoạt Push Notification</Label>
                    <p className="text-sm text-muted-foreground">
                      Gửi thông báo đẩy đến trình duyệt
                    </p>
                  </div>
                  <Switch
                    id="push-enabled"
                    checked={settings.notifications.pushEnabled}
                    onCheckedChange={(checked) => updateSetting('notifications', 'pushEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-enabled">Kích hoạt SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Gửi thông báo qua tin nhắn SMS
                    </p>
                  </div>
                  <Switch
                    id="sms-enabled"
                    checked={settings.notifications.smsEnabled}
                    onCheckedChange={(checked) => updateSetting('notifications', 'smsEnabled', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reminder-enabled">Kích hoạt nhắc nhở tự động</Label>
                    <p className="text-sm text-muted-foreground">
                      Tự động gửi nhắc nhở deadline KPI
                    </p>
                  </div>
                  <Switch
                    id="reminder-enabled"
                    checked={settings.notifications.reminderEnabled}
                    onCheckedChange={(checked) => updateSetting('notifications', 'reminderEnabled', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="reminder-days">Số ngày nhắc nhở trước deadline</Label>
                  <Input
                    id="reminder-days"
                    type="number"
                    value={settings.notifications.reminderDays}
                    onChange={(e) => updateSetting('notifications', 'reminderDays', Number(e.target.value))}
                    min="1"
                    max="30"
                    disabled={!settings.notifications.reminderEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-notifications">Thông báo tự động</Label>
                    <p className="text-sm text-muted-foreground">
                      Tự động gửi thông báo khi có sự kiện mới
                    </p>
                  </div>
                  <Switch
                    id="auto-notifications"
                    checked={settings.notifications.autoNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'autoNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Cài đặt Bảo mật
              </CardTitle>
              <CardDescription>
                Cấu hình các chính sách bảo mật hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session-timeout">Thời gian hết phiên (phút)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', Number(e.target.value))}
                    min="15"
                    max="1440"
                  />
                </div>
                <div>
                  <Label htmlFor="password-min-length">Độ dài mật khẩu tối thiểu</Label>
                  <Input
                    id="password-min-length"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', Number(e.target.value))}
                    min="6"
                    max="32"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-special-chars">Yêu cầu ký tự đặc biệt</Label>
                    <p className="text-sm text-muted-foreground">
                      Mật khẩu phải chứa ký tự đặc biệt (!@#$%^&*)
                    </p>
                  </div>
                  <Switch
                    id="require-special-chars"
                    checked={settings.security.requireSpecialChars}
                    onCheckedChange={(checked) => updateSetting('security', 'requireSpecialChars', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-numbers">Yêu cầu số</Label>
                    <p className="text-sm text-muted-foreground">
                      Mật khẩu phải chứa ít nhất một số
                    </p>
                  </div>
                  <Switch
                    id="require-numbers"
                    checked={settings.security.requireNumbers}
                    onCheckedChange={(checked) => updateSetting('security', 'requireNumbers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-uppercase">Yêu cầu chữ hoa</Label>
                    <p className="text-sm text-muted-foreground">
                      Mật khẩu phải chứa ít nhất một chữ hoa
                    </p>
                  </div>
                  <Switch
                    id="require-uppercase"
                    checked={settings.security.requireUppercase}
                    onCheckedChange={(checked) => updateSetting('security', 'requireUppercase', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-login-attempts">Số lần đăng nhập sai tối đa</Label>
                  <Input
                    id="max-login-attempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', Number(e.target.value))}
                    min="3"
                    max="10"
                  />
                </div>
                <div>
                  <Label htmlFor="lockout-duration">Thời gian khóa tài khoản (phút)</Label>
                  <Input
                    id="lockout-duration"
                    type="number"
                    value={settings.security.lockoutDuration}
                    onChange={(e) => updateSetting('security', 'lockoutDuration', Number(e.target.value))}
                    min="5"
                    max="1440"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
