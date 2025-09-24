'use client';
import { useState, useContext, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  PlusCircle, 
  Bell, 
  Edit2, 
  Trash2, 
  Search, 
  Settings,
  Send,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'kpi_deadline' | 'kpi_completion' | 'report_submitted' | 'report_approved' | 'report_rejected' | 'system_announcement' | 'custom';
  title: string;
  message: string;
  isActive: boolean;
  channels: ('email' | 'push' | 'sms')[];
  recipients: 'all' | 'department' | 'specific';
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  templateId: string;
  title: string;
  message: string;
  type: string;
  recipients: string[];
  channels: string[];
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  createdAt: string;
  createdBy: string;
}

export default function NotificationsPage() {
  const { employees, departments } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isSendNotificationOpen, setIsSendNotificationOpen] = useState(false);
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  
  // Mock data - in real app, this would come from context/API
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'KPI Deadline Reminder',
      type: 'kpi_deadline',
      title: 'Nhac nho deadline KPI',
      message: 'Ban co KPI "{kpi_name}" sap den han vao {deadline_date}. Vui long hoan thanh va gui bao cao.',
      isActive: true,
      channels: ['email', 'push'],
      recipients: 'all',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Report Approved',
      type: 'report_approved',
      title: 'Bao cao da duoc duyet',
      message: 'Bao cao "{report_title}" cua ban da duoc duyet thanh cong.',
      isActive: true,
      channels: ['email', 'push'],
      recipients: 'all',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'custom' as NotificationTemplate['type'],
    title: '',
    message: '',
    isActive: true,
    channels: [] as string[],
    recipients: 'all' as NotificationTemplate['recipients']
  });

  const [notificationForm, setNotificationForm] = useState({
    templateId: '',
    title: '',
    message: '',
    recipients: [] as string[],
    channels: [] as string[]
  });

  // Filter templates based on search
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreateTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.title.trim() || !templateForm.message.trim()) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: 'Vui long dien day du thong tin.',
      });
      return;
    }

    try {
      const newTemplate: NotificationTemplate = {
        id: Date.now().toString(),
        ...templateForm,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTemplates([...templates, newTemplate]);
      
      toast({
        title: 'Thanh cong!',
        description: `Đã tạo mẫu thông báo "${templateForm.name}".`,
      });
      
      setTemplateForm({
        name: '',
        type: 'custom',
        title: '',
        message: '',
        isActive: true,
        channels: [],
        recipients: 'all'
      });
      setIsCreateTemplateOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: 'Không thể tạo mẫu thông báo. Vui lòng thử lại.',
      });
    }
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      type: template.type,
      title: template.title,
      message: template.message,
      isActive: template.isActive,
      channels: template.channels,
      recipients: template.recipients
    });
    setIsEditTemplateOpen(true);
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const updatedTemplates = templates.map(template => 
        template.id === editingTemplate.id 
          ? { ...template, ...templateForm, updatedAt: new Date().toISOString() }
          : template
      );
      
      setTemplates(updatedTemplates);
      
      toast({
        title: 'Thanh cong!',
        description: `Đã cập nhật mẫu thông báo "${templateForm.name}".`,
      });
      
      setIsEditTemplateOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: 'Không thể cập nhật mẫu thông báo. Vui lòng thử lại.',
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mẫu thông báo "${templateName}"?`)) {
      return;
    }

    try {
      setTemplates(templates.filter(template => template.id !== templateId));
      toast({
        title: 'Thanh cong!',
        description: `Đã xóa mẫu thông báo "${templateName}".`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: 'Không thể xóa mẫu thông báo. Vui lòng thử lại.',
      });
    }
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: 'Vui long dien day du thong tin.',
      });
      return;
    }

    try {
      const newNotification: Notification = {
        id: Date.now().toString(),
        templateId: notificationForm.templateId,
        title: notificationForm.title,
        message: notificationForm.message,
        type: 'custom',
        recipients: notificationForm.recipients,
        channels: notificationForm.channels,
        status: 'sent',
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: 'admin'
      };

      setNotifications([newNotification, ...notifications]);
      
      toast({
        title: 'Thanh cong!',
        description: 'Da gui thong bao thanh cong.',
      });
      
      setNotificationForm({
        templateId: '',
        title: '',
        message: '',
        recipients: [],
        channels: []
      });
      setIsSendNotificationOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: 'Khong the gui thong bao. Vui long thu lai.',
      });
    }
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      'kpi_deadline': { label: 'Deadline KPI', color: 'bg-orange-100 text-orange-800' },
      'kpi_completion': { label: 'Hoan thanh KPI', color: 'bg-green-100 text-green-800' },
      'report_submitted': { label: 'Bao cao gui', color: 'bg-blue-100 text-blue-800' },
      'report_approved': { label: 'Bao cao duyet', color: 'bg-green-100 text-green-800' },
      'report_rejected': { label: 'Bao cao tu choi', color: 'bg-red-100 text-red-800' },
      'system_announcement': { label: 'Thong bao he thong', color: 'bg-purple-100 text-purple-800' },
      'custom': { label: 'Tuy chinh', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = typeMap[type as keyof typeof typeMap] || typeMap.custom;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Da gui</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Cho gui</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Loi</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quan ly Thong bao</h1>
          <p className="text-muted-foreground">
            Tao va quan ly cac mau thong bao, gui thong bao den nhan vien
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSendNotificationOpen} onOpenChange={setIsSendNotificationOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="w-4 h-4 mr-2" />
                Gui Thong bao
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Gửi Thông báo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notification-title">Tiêu đề *</Label>
                  <Input
                    id="notification-title"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    placeholder="Nhập tiêu đề thông báo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notification-message">Nội dung *</Label>
                  <Textarea
                    id="notification-message"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                    placeholder="Nhập nội dung thông báo"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Kênh gửi</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notificationForm.channels.includes('email')}
                        onChange={(e) => {
                          const channels = e.target.checked
                            ? [...notificationForm.channels, 'email']
                            : notificationForm.channels.filter(c => c !== 'email');
                          setNotificationForm({ ...notificationForm, channels });
                        }}
                      />
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notificationForm.channels.includes('push')}
                        onChange={(e) => {
                          const channels = e.target.checked
                            ? [...notificationForm.channels, 'push']
                            : notificationForm.channels.filter(c => c !== 'push');
                          setNotificationForm({ ...notificationForm, channels });
                        }}
                      />
                      <Bell className="w-4 h-4" />
                      <span>Push Notification</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notificationForm.channels.includes('sms')}
                        onChange={(e) => {
                          const channels = e.target.checked
                            ? [...notificationForm.channels, 'sms']
                            : notificationForm.channels.filter(c => c !== 'sms');
                          setNotificationForm({ ...notificationForm, channels });
                        }}
                      />
                      <MessageSquare className="w-4 h-4" />
                      <span>SMS</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsSendNotificationOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleSendNotification}>
                    Gui Thong bao
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Tạo Mẫu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo Mẫu Thông báo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-name">Tên mẫu *</Label>
                    <Input
                      id="template-name"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      placeholder="Nhập tên mẫu"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-type">Loại thông báo</Label>
                    <Select
                      value={templateForm.type}
                      onValueChange={(value) => setTemplateForm({ ...templateForm, type: value as NotificationTemplate['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kpi_deadline">Deadline KPI</SelectItem>
                        <SelectItem value="kpi_completion">Hoàn thành KPI</SelectItem>
                        <SelectItem value="report_submitted">Báo cáo gửi</SelectItem>
                        <SelectItem value="report_approved">Báo cáo duyệt</SelectItem>
                        <SelectItem value="report_rejected">Báo cáo từ chối</SelectItem>
                        <SelectItem value="system_announcement">Thông báo hệ thống</SelectItem>
                        <SelectItem value="custom">Tùy chỉnh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="template-title">Tiêu đề *</Label>
                  <Input
                    id="template-title"
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                    placeholder="Nhập tiêu đề"
                  />
                </div>

                <div>
                  <Label htmlFor="template-message">Nội dung *</Label>
                  <Textarea
                    id="template-message"
                    value={templateForm.message}
                    onChange={(e) => setTemplateForm({ ...templateForm, message: e.target.value })}
                    placeholder="Nhập nội dung (có thể sử dụng {variable} để thay thế)"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Kênh gửi</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={templateForm.channels.includes('email')}
                        onChange={(e) => {
                          const channels = e.target.checked
                            ? [...templateForm.channels, 'email']
                            : templateForm.channels.filter(c => c !== 'email');
                          setTemplateForm({ ...templateForm, channels });
                        }}
                      />
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={templateForm.channels.includes('push')}
                        onChange={(e) => {
                          const channels = e.target.checked
                            ? [...templateForm.channels, 'push']
                            : templateForm.channels.filter(c => c !== 'push');
                          setTemplateForm({ ...templateForm, channels });
                        }}
                      />
                      <Bell className="w-4 h-4" />
                      <span>Push Notification</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={templateForm.channels.includes('sms')}
                        onChange={(e) => {
                          const channels = e.target.checked
                            ? [...templateForm.channels, 'sms']
                            : templateForm.channels.filter(c => c !== 'sms');
                          setTemplateForm({ ...templateForm, channels });
                        }}
                      />
                      <MessageSquare className="w-4 h-4" />
                      <span>SMS</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="template-active"
                    checked={templateForm.isActive}
                    onCheckedChange={(checked) => setTemplateForm({ ...templateForm, isActive: checked })}
                  />
                  <Label htmlFor="template-active">Kích hoạt mẫu</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateTemplateOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Tạo Mẫu
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm mẫu thông báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Mẫu Thông báo ({filteredTemplates.length})
          </CardTitle>
          <CardDescription>
            Quản lý các mẫu thông báo tự động và thủ công
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên mẫu</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Kênh</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {template.recipients === 'all' ? 'Tat ca nhan vien' : 
                           template.recipients === 'department' ? 'Theo phong ban' : 'Cu the'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(template.type)}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium truncate">{template.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{template.message}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {template.channels.map((channel) => (
                        <Badge key={channel} variant="outline" className="text-xs">
                          {channel === 'email' ? <Mail className="w-3 h-3 mr-1" /> :
                           channel === 'push' ? <Bell className="w-3 h-3 mr-1" /> :
                           <MessageSquare className="w-3 h-3 mr-1" />}
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={template.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {template.isActive ? 'Hoat dong' : 'Khong hoat dong'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(template.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id, template.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Thông báo Gần đây
          </CardTitle>
          <CardDescription>
            Lịch sử các thông báo đã gửi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có thông báo nào được gửi</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Kênh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian gửi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{notification.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(notification.type)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {notification.channels.map((channel) => (
                          <Badge key={channel} variant="outline" className="text-xs">
                            {channel === 'email' ? <Mail className="w-3 h-3 mr-1" /> :
                             channel === 'push' ? <Bell className="w-3 h-3 mr-1" /> :
                             <MessageSquare className="w-3 h-3 mr-1" />}
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(notification.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {notification.sentAt ? 
                          format(new Date(notification.sentAt), 'dd/MM/yyyy HH:mm', { locale: vi }) :
                          'Chưa gửi'
                        }
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Template Dialog */}
      <Dialog open={isEditTemplateOpen} onOpenChange={setIsEditTemplateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Mẫu Thông báo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-template-name">Tên mẫu *</Label>
                <Input
                  id="edit-template-name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="Nhập tên mẫu"
                />
              </div>
              <div>
                <Label htmlFor="edit-template-type">Loại thông báo</Label>
                <Select
                  value={templateForm.type}
                  onValueChange={(value) => setTemplateForm({ ...templateForm, type: value as NotificationTemplate['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kpi_deadline">Deadline KPI</SelectItem>
                    <SelectItem value="kpi_completion">Hoàn thành KPI</SelectItem>
                    <SelectItem value="report_submitted">Báo cáo gửi</SelectItem>
                    <SelectItem value="report_approved">Báo cáo duyệt</SelectItem>
                    <SelectItem value="report_rejected">Báo cáo từ chối</SelectItem>
                    <SelectItem value="system_announcement">Thông báo hệ thống</SelectItem>
                    <SelectItem value="custom">Tùy chỉnh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-template-title">Tiêu đề *</Label>
              <Input
                id="edit-template-title"
                value={templateForm.title}
                onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                placeholder="Nhập tiêu đề"
              />
            </div>

            <div>
              <Label htmlFor="edit-template-message">Nội dung *</Label>
              <Textarea
                id="edit-template-message"
                value={templateForm.message}
                onChange={(e) => setTemplateForm({ ...templateForm, message: e.target.value })}
                placeholder="Nhập nội dung (có thể sử dụng {variable} để thay thế)"
                rows={4}
              />
            </div>

            <div>
              <Label>Kênh gửi</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={templateForm.channels.includes('email')}
                    onChange={(e) => {
                      const channels = e.target.checked
                        ? [...templateForm.channels, 'email']
                        : templateForm.channels.filter(c => c !== 'email');
                      setTemplateForm({ ...templateForm, channels });
                    }}
                  />
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={templateForm.channels.includes('push')}
                    onChange={(e) => {
                      const channels = e.target.checked
                        ? [...templateForm.channels, 'push']
                        : templateForm.channels.filter(c => c !== 'push');
                      setTemplateForm({ ...templateForm, channels });
                    }}
                  />
                  <Bell className="w-4 h-4" />
                  <span>Push Notification</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={templateForm.channels.includes('sms')}
                    onChange={(e) => {
                      const channels = e.target.checked
                        ? [...templateForm.channels, 'sms']
                        : templateForm.channels.filter(c => c !== 'sms');
                      setTemplateForm({ ...templateForm, channels });
                    }}
                  />
                  <MessageSquare className="w-4 h-4" />
                  <span>SMS</span>
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-template-active"
                checked={templateForm.isActive}
                onCheckedChange={(checked) => setTemplateForm({ ...templateForm, isActive: checked })}
              />
              <Label htmlFor="edit-template-active">Kích hoạt mẫu</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditTemplateOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleUpdateTemplate}>
                Cập nhật
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
