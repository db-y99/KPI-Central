'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Eye,
  Edit,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';

export default function KpiTrackingPage() {
  const { employees, kpis, kpiRecords, departments } = useContext(DataContext);
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    actual: '',
    notes: '',
    status: 'pending'
  });

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Create enriched KPI records
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

  // Filter records based on search and department
  const filteredRecords = useMemo(() => {
    return enrichedRecords.filter(record => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.kpiName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' ||
                               record.departmentName === departments.find(d => d.id === selectedDepartment)?.name;
      return matchesSearch && matchesDepartment;
    });
  }, [enrichedRecords, searchTerm, selectedDepartment, departments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />{t.kpiTracking.completed}</Badge>;
      case 'awaiting_approval':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />{t.kpiTracking.awaitingApproval}</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />{t.kpiTracking.pending}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />{t.kpiTracking.rejected}</Badge>;
      case 'completed':
        // Legacy status - treat as approved
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />{t.kpiTracking.completed}</Badge>;
      default:
        return <Badge variant="outline">{t.kpiTracking.notStarted}</Badge>;
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRefreshData = () => {
    // Refresh data logic
    window.location.reload();
  };

  const handleRowClick = (record: any) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
  };

  const handleViewDetails = () => {
    if (selectedRecord) {
      setIsHistoryDialogOpen(true);
    }
  };

  const handleUpdateProgress = () => {
    if (selectedRecord) {
      setUpdateForm({
        actual: selectedRecord.actual?.toString() || '',
        notes: selectedRecord.notes || '',
        status: selectedRecord.status
      });
      setIsUpdateDialogOpen(true);
    }
  };

  const handleSaveUpdate = () => {
    if (selectedRecord && updateForm.actual) {
      // TODO: Implement actual save to database
      console.log('Saving update:', {
        recordId: selectedRecord.id,
        actual: parseFloat(updateForm.actual),
        notes: updateForm.notes,
        status: updateForm.status
      });
      
      // For now, just show success message
      alert('Cập nhật tiến độ thành công!');
      setIsUpdateDialogOpen(false);
      setIsDialogOpen(false);
      setSelectedRecord(null);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedRecord(null);
  };

  const closeHistoryDialog = () => {
    setIsHistoryDialogOpen(false);
  };

  const closeUpdateDialog = () => {
    setIsUpdateDialogOpen(false);
    setUpdateForm({ actual: '', notes: '', status: 'pending' });
  };

  // Mock history data - in real app, this would come from API
  const getKpiHistory = (recordId: string) => {
    return [
      {
        id: 1,
        date: '2024-01-15',
        actual: 25,
        notes: 'Bắt đầu thực hiện KPI',
        status: 'pending',
        updatedBy: 'Nguyễn Văn A'
      },
      {
        id: 2,
        date: '2024-01-20',
        actual: 45,
        notes: 'Tiến độ tốt, đang theo đúng kế hoạch',
        status: 'pending',
        updatedBy: 'Nguyễn Văn A'
      },
      {
        id: 3,
        date: '2024-01-25',
        actual: 65,
        notes: 'Vượt mục tiêu trung gian',
        status: 'pending',
        updatedBy: 'Nguyễn Văn A'
      }
    ];
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{nonAdminEmployees.length}</div>
            <p className="text-xs text-muted-foreground">{t.kpiTracking.totalEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{enrichedRecords.length}</div>
            <p className="text-xs text-muted-foreground">{t.kpiTracking.totalKpis}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {enrichedRecords.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.kpiTracking.completedKpis}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">
              {enrichedRecords.filter(r => {
                const endDate = new Date(r.endDate);
                const today = new Date();
                return endDate < today && r.status !== 'approved';
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">{t.kpiTracking.overdueKpis}</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Tracking Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {t.kpiTracking.tracking} ({filteredRecords.length})
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Input
                  placeholder={t.kpiTracking.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t.kpiTracking.selectDepartmentPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.kpiTracking.allDepartments}</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleRefreshData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                {t.kpiTracking.refresh}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              {enrichedRecords.length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">{t.kpiTracking.noKpisAssigned}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t.kpiTracking.noKpisDescription}
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• {t.kpiTracking.createKpiAt} <a href="/admin/kpi-definitions" className="text-blue-600 hover:underline">{t.kpiTracking.defineKpiLink}</a></p>
                    <p>• {t.kpiTracking.assignKpiAt} <a href="/admin/kpi-assignment" className="text-blue-600 hover:underline">{t.kpiTracking.assignKpiLink}</a></p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">{t.kpiTracking.noKpisFoundTitle}</h3>
                  <p className="text-muted-foreground">
                    {t.kpiTracking.noKpisMatchCriteria}
                  </p>
                </>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.kpiTracking.employeeColumn}</TableHead>
                  <TableHead>{t.kpiTracking.kpiColumn}</TableHead>
                  <TableHead>{t.kpiTracking.departmentColumn}</TableHead>
                  <TableHead>{t.kpiTracking.progressColumn}</TableHead>
                  <TableHead>{t.kpiTracking.statusColumn}</TableHead>
                  <TableHead>{t.kpiTracking.deadlineColumn}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const daysRemaining = getDaysRemaining(record.endDate);
                  const employee = employees.find(emp => emp.uid === record.employeeId);
                  
                  return (
                    <TableRow 
                      key={record.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(record)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={employee?.avatar} />
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
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">
                              {record.progress.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={record.progress} className="h-2 w-20" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {new Date(record.endDate).toLocaleDateString('vi-VN')}
                          </p>
                          <p className={`text-xs ${
                            daysRemaining < 0 ? 'text-red-600' : 
                            daysRemaining <= 7 ? 'text-orange-600' : 'text-muted-foreground'
                          }`}>
                            {daysRemaining < 0 
                              ? t.kpiTracking.overdue.replace('{days}', Math.abs(daysRemaining).toString())
                              : daysRemaining === 0 
                              ? t.kpiTracking.dueToday
                              : t.kpiTracking.daysRemaining.replace('{days}', daysRemaining.toString())
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Employee KPI Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Chi tiết KPI - {selectedRecord?.employeeName}
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về KPI và tiến độ thực hiện
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              {/* Employee Info Section */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
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

              {/* KPI Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Thông tin KPI
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Tên KPI</label>
                      <p className="font-medium">{selectedRecord.kpiName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Mô tả</label>
                      <p className="text-sm">{selectedRecord.kpiDescription || 'Không có mô tả'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Đơn vị</label>
                      <p className="font-medium">{selectedRecord.kpiUnit}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Tiến độ thực hiện
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Mục tiêu</label>
                      <p className="font-medium text-lg">{selectedRecord.target} {selectedRecord.kpiUnit}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Thực hiện</label>
                      <p className="font-medium text-lg text-blue-600">{selectedRecord.actual || 0} {selectedRecord.kpiUnit}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Phần trăm hoàn thành</label>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedRecord.progress} className="flex-1 h-3" />
                        <span className="font-semibold text-lg">{selectedRecord.progress.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Thời gian
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Ngày bắt đầu</label>
                      <p className="font-medium">{new Date(selectedRecord.startDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Hạn chót</label>
                      <p className="font-medium">{new Date(selectedRecord.endDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Thời gian còn lại</label>
                      <p className={`font-medium ${
                        getDaysRemaining(selectedRecord.endDate) < 0 ? 'text-red-600' : 
                        getDaysRemaining(selectedRecord.endDate) <= 7 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {(() => {
                          const days = getDaysRemaining(selectedRecord.endDate);
                          if (days < 0) return `Quá hạn ${Math.abs(days)} ngày`;
                          if (days === 0) return 'Hết hạn hôm nay';
                          return `Còn ${days} ngày`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Trạng thái & Đánh giá
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Trạng thái hiện tại</label>
                      <div className="mt-1">{getStatusBadge(selectedRecord.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Đánh giá</label>
                      <p className="text-sm">
                        {selectedRecord.progress >= 100 ? 'Hoàn thành xuất sắc' :
                         selectedRecord.progress >= 80 ? 'Hoàn thành tốt' :
                         selectedRecord.progress >= 60 ? 'Đạt yêu cầu' :
                         selectedRecord.progress >= 40 ? 'Cần cải thiện' : 'Cần hỗ trợ'}
                      </p>
                    </div>
                    {selectedRecord.notes && (
                      <div>
                        <label className="text-sm text-muted-foreground">Ghi chú</label>
                        <p className="text-sm bg-muted/50 p-2 rounded">{selectedRecord.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleViewDetails}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Xem lịch sử
                </Button>
                <Button
                  onClick={handleUpdateProgress}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Cập nhật tiến độ
                </Button>
                <Button
                  onClick={closeDialog}
                  variant="ghost"
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Lịch sử KPI - {selectedRecord?.employeeName}
            </DialogTitle>
            <DialogDescription>
              Lịch sử cập nhật tiến độ KPI: {selectedRecord?.kpiName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
              {/* Current Status Summary */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{selectedRecord.actual || 0}</p>
                    <p className="text-sm text-muted-foreground">Hiện tại</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{selectedRecord.target}</p>
                    <p className="text-sm text-muted-foreground">Mục tiêu</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{selectedRecord.progress.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Hoàn thành</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{getKpiHistory(selectedRecord.id).length}</p>
                    <p className="text-sm text-muted-foreground">Lần cập nhật</p>
                  </div>
                </div>
              </div>

              {/* History Timeline */}
              <div className="space-y-4">
                <h4 className="font-semibold">Timeline cập nhật</h4>
                <div className="space-y-3">
                  {getKpiHistory(selectedRecord.id).map((history, index) => (
                    <div key={history.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        {index < getKpiHistory(selectedRecord.id).length - 1 && (
                          <div className="w-px h-16 bg-muted mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{history.actual} {selectedRecord.kpiUnit}</span>
                            <Badge variant="outline" className="text-xs">
                              {((history.actual / selectedRecord.target) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(history.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{history.notes}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Cập nhật bởi: {history.updatedBy}</span>
                          <span>•</span>
                          <span>{getStatusBadge(history.status)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button onClick={closeHistoryDialog} variant="outline">
                  Đóng
                </Button>
                <Button onClick={handleUpdateProgress}>
                  <Edit className="w-4 h-4 mr-2" />
                  Cập nhật tiến độ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Progress Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Cập nhật tiến độ KPI
            </DialogTitle>
            <DialogDescription>
              Cập nhật tiến độ thực hiện cho {selectedRecord?.employeeName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
              {/* KPI Info */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium">{selectedRecord.kpiName}</h4>
                <p className="text-sm text-muted-foreground">
                  Mục tiêu: {selectedRecord.target} {selectedRecord.kpiUnit}
                </p>
              </div>

              {/* Update Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="actual">Tiến độ hiện tại ({selectedRecord.kpiUnit})</Label>
                  <Input
                    id="actual"
                    type="number"
                    value={updateForm.actual}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, actual: e.target.value }))}
                    placeholder={`Nhập số ${selectedRecord.kpiUnit} đã thực hiện`}
                    min="0"
                    max={selectedRecord.target * 2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Hiện tại: {selectedRecord.actual || 0} / {selectedRecord.target} {selectedRecord.kpiUnit}
                  </p>
                </div>

                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select 
                    value={updateForm.status} 
                    onValueChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Đang thực hiện</SelectItem>
                      <SelectItem value="awaiting_approval">Chờ duyệt</SelectItem>
                      <SelectItem value="approved">Đã duyệt</SelectItem>
                      <SelectItem value="rejected">Từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                  <Textarea
                    id="notes"
                    value={updateForm.notes}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Nhập ghi chú về tiến độ thực hiện..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={closeUpdateDialog} variant="outline" className="flex-1">
                  Hủy
                </Button>
                <Button onClick={handleSaveUpdate} className="flex-1" disabled={!updateForm.actual}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Lưu cập nhật
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}