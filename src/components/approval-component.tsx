'use client';
import { useState, useContext, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye,
  Users,
  Target,
  Calendar,
  Upload,
  Download,
  File,
  FileText,
  Image,
  FileSpreadsheet,
  Trash2,
  Paperclip
} from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { AuthContext } from '@/context/auth-context';

export default function ApprovalComponent() {
  const { employees, kpis, kpiRecords, departments, updateKpiRecord } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    comments: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Create enriched KPI records for approval
  const enrichedRecords = useMemo(() => {
    return kpiRecords.map(record => {
      const employee = employees.find(emp => emp.uid === record.employeeId);
      const kpi = kpis.find(k => k.id === record.kpiId);
      const department = employee ? departments.find(d => d.id === employee.departmentId) : null;

      return {
        ...record,
        employeeName: employee?.name || 'Unknown',
        employeePosition: employee?.position || '',
        kpiName: kpi?.name || 'Unknown',
        kpiDescription: kpi?.description || '',
        kpiUnit: kpi?.unit || '',
        departmentName: department?.name || 'Unknown',
        progress: record.target > 0 ? ((record.actual || 0) / record.target * 100) : 0,
      };
    });
  }, [kpiRecords, employees, kpis, departments]);

  // Filter records based on search and status
  const filteredRecords = useMemo(() => {
    return enrichedRecords.filter(record => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.kpiName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedRecords, searchTerm, selectedStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />{t.admin.approved}</Badge>;
      case 'awaiting_approval':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />{t.admin.awaitingApproval}</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />{t.admin.pending}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />{t.admin.rejected}</Badge>;
      default:
        return <Badge variant="outline">{t.dashboard.notStarted}</Badge>;
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-4 h-4 text-purple-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleRowClick = (record: any) => {
    setSelectedRecord(record);
    setApprovalForm({
      comments: record.approvalComments || ''
    });
    setIsDialogOpen(true);
  };

  const handleApprovalAction = async (action: 'approved' | 'rejected') => {
    if (!selectedRecord) return;

    try {
      setIsUploading(true);

      // Import KpiStatusService for migration
      const { KpiStatusService } = await import('@/lib/kpi-status-service');
      
      // Migrate the record to new status system
      const migratedRecord = KpiStatusService.migrateRecord(selectedRecord);
      
      const newStatus = action === 'approved' ? 'approved' : 'rejected';

      const updates: any = {
        status: newStatus,
        approvalComment: approvalForm.comments,
        approvedAt: new Date().toISOString(),
        approvedBy: user?.name || 'Admin'
      };

      // If we're approving from not_started, add submission info
      if (migratedRecord.status === 'not_started' && action === 'approved') {
        updates.submittedAt = new Date().toISOString();
        updates.submittedReport = `Báo cáo tự động từ ${selectedRecord.actual}/${selectedRecord.target} ${selectedRecord.kpiUnit}`;
      }

      await updateKpiRecord(selectedRecord.id, updates);
      
      toast({
        title: t.common.success,
        description: action === 'approved' ? t.admin.successApproved : t.admin.successRejected,
      });
      
      setIsDialogOpen(false);
      setSelectedRecord(null);
      setApprovalForm({ comments: '' });
    } catch (error) {
      console.error(`Error ${action} KPI record:`, error);
      toast({
        title: t.common.error,
        description: action === 'approved' ? t.admin.cannotApproveReport : t.admin.cannotRejectReport,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleApprove = () => handleApprovalAction('approved');
  const handleReject = () => handleApprovalAction('rejected');

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedRecord(null);
    setApprovalForm({ comments: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.admin.reportApprovalTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t.admin.approvalPageSubtitle}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.totalReports}</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrichedRecords.length}</div>
            <p className="text-xs text-muted-foreground">{t.admin.allReports}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.awaitingApproval}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {enrichedRecords.filter(r => r.status === 'awaiting_approval').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.admin.pending}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.approved}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {enrichedRecords.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.dashboard.completed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.rejected}</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {enrichedRecords.filter(r => r.status === 'rejected').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.admin.needsRevision}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.admin.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.admin.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.admin.allStatuses}</SelectItem>
                <SelectItem value="awaiting_approval">{t.admin.awaitingApproval}</SelectItem>
                <SelectItem value="approved">{t.admin.approved}</SelectItem>
                <SelectItem value="rejected">{t.admin.rejected}</SelectItem>
                <SelectItem value="pending">{t.admin.pending}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Approval Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.admin.reportsList} ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.admin.noReportsFound}</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== 'all' 
                  ? t.admin.noReportsMatchFilter
                  : t.admin.noReportsMessage}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.employee}</TableHead>
                  <TableHead>KPI</TableHead>
                  <TableHead>{t.admin.department}</TableHead>
                  <TableHead>{t.dashboard.progress}</TableHead>
                  <TableHead>Tài liệu</TableHead>
                  <TableHead>{t.admin.status}</TableHead>
                  <TableHead>{t.admin.submittedAt}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow 
                    key={record.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(record)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={employees.find(emp => emp.uid === record.employeeId)?.avatar} />
                          <AvatarFallback>
                            {record.employeeName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{record.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{record.employeePosition}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.kpiName}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.actual || 0} / {record.target} {record.kpiUnit}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.departmentName}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">
                            {record.progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${Math.min(record.progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {record.attachedFiles?.length || 0} file
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(record.updatedAt || record.createdAt).toLocaleDateString('vi-VN')}</p>
                        <p className="text-muted-foreground">
                          {new Date(record.updatedAt || record.createdAt).toLocaleTimeString('vi-VN')}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Chi tiết báo cáo - {selectedRecord?.employeeName}
            </DialogTitle>
            <DialogDescription>
              Xem xét và duyệt báo cáo từ nhân viên
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              {/* Employee Info Section */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={employees.find(emp => emp.uid === selectedRecord.employeeId)?.avatar} />
                  <AvatarFallback className="text-lg">
                    {selectedRecord.employeeName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedRecord.employeeName}</h3>
                  <p className="text-muted-foreground">{selectedRecord.employeePosition}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedRecord.departmentName}</Badge>
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                </div>
              </div>

              {/* KPI Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold">Thông tin KPI</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Tên KPI</p>
                      <p className="font-medium">{selectedRecord.kpiName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mô tả</p>
                      <p className="text-sm">{selectedRecord.kpiDescription || 'Không có mô tả'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Đơn vị</p>
                      <p className="font-medium">{selectedRecord.kpiUnit}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold">Hiệu suất</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Mục tiêu</p>
                        <p className="text-lg font-bold">{selectedRecord.target}</p>
                        <p className="text-xs text-muted-foreground">{selectedRecord.kpiUnit}</p>
                      </div>
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">Thực tế</p>
                        <p className="text-lg font-bold text-primary">{selectedRecord.actual || 0}</p>
                        <p className="text-xs text-muted-foreground">{selectedRecord.kpiUnit}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</p>
                        <span className="text-sm font-semibold">{selectedRecord.progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${Math.min(selectedRecord.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline & Files */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <h4 className="font-semibold">Thời gian thực hiện</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Ngày bắt đầu</p>
                        <p className="font-semibold">{new Date(selectedRecord.startDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Ngày kết thúc</p>
                        <p className="font-semibold">{new Date(selectedRecord.endDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="w-4 h-4 text-orange-600" />
                    <h4 className="font-semibold">Tài liệu báo cáo</h4>
                  </div>
                  {selectedRecord?.attachedFiles && selectedRecord.attachedFiles.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRecord.attachedFiles.map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
                              {getFileIcon(file.name)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.size}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(file.url, '_blank')}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(file.url, '_blank')}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nhân viên chưa nộp tài liệu nào</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Form */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FileCheck className="w-4 h-4 text-gray-600" />
                  <h4 className="font-semibold">Quyết định duyệt</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="comments" className="text-sm font-medium">
                      Phản hồi cho nhân viên
                    </Label>
                    <Textarea
                      id="comments"
                      value={approvalForm.comments}
                      onChange={(e) => setApprovalForm(prev => ({ ...prev, comments: e.target.value }))}
                      placeholder="Nhập phản hồi, góp ý hoặc hướng dẫn cho nhân viên..."
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="flex-1"
                  disabled={isUploading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {isUploading ? 'Đang xử lý...' : 'Từ chối'}
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isUploading}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isUploading ? 'Đang xử lý...' : 'Phê duyệt'}
                </Button>
                <Button
                  onClick={closeDialog}
                  variant="outline"
                  className="px-4"
                  disabled={isUploading}
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
