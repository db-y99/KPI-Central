'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Building2,
  Filter,
  Search,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Calendar,
  FileCheck,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import PDFExportButton from '@/components/pdf-export-button';
import { FileText } from 'lucide-react';

interface KPITrackingItem {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  kpiId: string;
  kpiName: string;
  description: string;
  target: number;
  actual: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  reportStatus: 'not-submitted' | 'submitted' | 'approved' | 'rejected' | 'needs-revision';
  lastReportDate?: Date;
  completionRate: number;
  priority: 'high' | 'medium' | 'low';
  daysRemaining: number;
}

export default function KPITrackingPage() {
  const { employees, departments, kpis, kpiRecords } = useContext(DataContext);
  const { toast } = useToast();
  
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterReportStatus, setFilterReportStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKPI, setSelectedKPI] = useState<KPITrackingItem | null>(null);

  // Real tracking data based on actual KPI records
  const trackingData = useMemo(() => {
    const data: KPITrackingItem[] = kpiRecords.map(record => {
      const employee = employees.find(e => e.uid === record.employeeId || e.id === record.employeeId);
      const kpiDetail = kpis.find(k => k.id === record.kpiId);
      const department = departments.find(d => d.id === employee?.departmentId);
      
      const endDate = new Date(record.endDate);
      const today = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Report status will be integrated with actual report system
      const reportStatus: KPITrackingItem['reportStatus'] = 'not-submitted';

      const completionRate = record.target > 0 ? ((record.actual || 0) / record.target * 100) : 0;
      
      // Determine priority based on real data
      let priority: 'high' | 'medium' | 'low' = 'medium';
      if (daysRemaining < 7 && completionRate < 50) priority = 'high';
      else if (daysRemaining < 14 && completionRate < 75) priority = 'medium';
      else priority = 'low';

      // Determine actual status
      let actualStatus: KPITrackingItem['status'] = record.status as any;
      if (daysRemaining < 0 && record.status !== 'completed') {
        actualStatus = 'overdue';
      }

      return {
        id: record.id,
        employeeId: record.employeeId,
        employeeName: employee?.name || 'Unknown',
        department: department?.name || 'Unknown',
        kpiId: record.kpiId,
        kpiName: kpiDetail?.name || 'Unknown KPI',
        description: kpiDetail?.description || '',
        target: record.target,
        actual: record.actual || 0,
        unit: record.unit,
        startDate: new Date(record.startDate),
        endDate: endDate,
        status: actualStatus,
        reportStatus,
        lastReportDate: undefined, // Will be populated when report system is integrated
        completionRate,
        priority,
        daysRemaining: Math.max(0, daysRemaining)
      };
    });

    return data;
  }, [kpiRecords, employees, kpis, departments]);

  // Filter data
  const filteredData = useMemo(() => {
    return trackingData.filter(item => {
      const matchesDepartment = filterDepartment === 'all' || item.department === filterDepartment;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesReportStatus = filterReportStatus === 'all' || item.reportStatus === filterReportStatus;
      const matchesSearch = 
        item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kpiName.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesDepartment && matchesStatus && matchesReportStatus && matchesSearch;
    });
  }, [trackingData, filterDepartment, filterStatus, filterReportStatus, searchTerm]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredData.length;
    const completed = filteredData.filter(item => item.status === 'completed').length;
    const inProgress = filteredData.filter(item => item.status === 'in-progress').length;
    const overdue = filteredData.filter(item => item.status === 'overdue').length;
    const highPriority = filteredData.filter(item => item.priority === 'high').length;
    
    const reportsApproved = filteredData.filter(item => item.reportStatus === 'approved').length;
    const reportsPending = filteredData.filter(item => item.reportStatus === 'submitted').length;
    
    const avgCompletion = total > 0 ? 
      filteredData.reduce((acc, item) => acc + item.completionRate, 0) / total : 0;

    return {
      total,
      completed,
      inProgress,
      overdue,
      highPriority,
      reportsApproved,
      reportsPending,
      avgCompletion: Math.round(avgCompletion)
    };
  }, [filteredData]);

  const getStatusBadge = (status: KPITrackingItem['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Hoàn thành</Badge>;
      case 'in-progress':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Đang thực hiện</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Quá hạn</Badge>;
      default:
        return <Badge variant="outline">Chưa bắt đầu</Badge>;
    }
  };

  const getReportStatusBadge = (status: KPITrackingItem['reportStatus']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 text-xs"><FileCheck className="w-3 h-3 mr-1" />Đã duyệt</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800 text-xs"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
      case 'needs-revision':
        return <Badge variant="secondary" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Cần sửa</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Từ chối</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Chưa nộp BC</Badge>;
    }
  };

  const getPriorityBadge = (priority: KPITrackingItem['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Cao</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">TB</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Thấp</Badge>;
    }
  };

  return (
    <div className="h-full p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Theo dõi tiến độ KPI</h1>
          <p className="text-muted-foreground">
            Giám sát KPI real-time với trạng thái báo cáo
          </p>
        </div>
        <div className="flex gap-2">
          <PDFExportButton
            elementId="kpi-tracking-content"
            filename={`theo-doi-kpi-${new Date().toISOString().split('T')[0]}.pdf`}
            title="Theo dõi tiến độ KPI"
            variant="outline"
            size="sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Xuất PDF
          </PDFExportButton>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Summary Cards - Compact */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tổng KPI</p>
                <p className="text-xl font-bold">{summaryStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hoàn thành</p>
                <p className="text-xl font-bold text-green-600">{summaryStats.completed}</p>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={summaryStats.total > 0 ? (summaryStats.completed / summaryStats.total * 100) : 0} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quá hạn</p>
                <p className="text-xl font-bold text-red-600">{summaryStats.overdue}</p>
              </div>
            </div>
            {summaryStats.overdue > 0 && (
              <Alert className="mt-2 py-1.5 rounded-2xl alert-error">
                <AlertTriangle className="h-3 w-3" />
                <AlertDescription className="text-xs">
                  Cần xử lý ngay!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <FileCheck className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">BC chờ duyệt</p>
                <p className="text-xl font-bold text-blue-600">{summaryStats.reportsPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm nhân viên hoặc KPI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái KPI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                <SelectItem value="overdue">Quá hạn</SelectItem>
                <SelectItem value="not-started">Chưa bắt đầu</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterReportStatus} onValueChange={setFilterReportStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái báo cáo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả BC</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="submitted">Chờ duyệt</SelectItem>
                <SelectItem value="needs-revision">Cần sửa</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
                <SelectItem value="not-submitted">Chưa nộp</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => {
                setFilterDepartment('all');
                setFilterStatus('all');
                setFilterReportStatus('all');
                setSearchTerm('');
              }}>
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <div id="kpi-tracking-content">
        <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="details">Chi tiết KPI</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Priority Alerts */}
          <div className="grid gap-4">
            {summaryStats.overdue > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cảnh báo:</strong> Có {summaryStats.overdue} KPI quá hạn cần xử lý ngay.
                </AlertDescription>
              </Alert>
            )}
            
            {summaryStats.reportsPending > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <FileCheck className="h-4 w-4" />
                <AlertDescription>
                  <strong>Thông báo:</strong> Có {summaryStats.reportsPending} báo cáo chờ duyệt.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* KPI Grid */}
          <div className="grid gap-4">
            {filteredData.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{item.kpiName}</h3>
                        {getStatusBadge(item.status)}
                        {getPriorityBadge(item.priority)}
                        {getReportStatusBadge(item.reportStatus)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {item.employeeName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {item.department}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Hạn: {item.endDate.toLocaleDateString('vi-VN')}
                        </div>
                        {item.daysRemaining > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Còn {item.daysRemaining} ngày
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedKPI(item)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Chi tiết KPI</DialogTitle>
                        </DialogHeader>
                        {selectedKPI && (
                          <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <Label className="text-sm font-medium">Nhân viên</Label>
                                <p className="text-sm">{selectedKPI.employeeName}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Phòng ban</Label>
                                <p className="text-sm">{selectedKPI.department}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">KPI</Label>
                                <p className="text-sm">{selectedKPI.kpiName}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Tiến độ</Label>
                                <p className="text-sm">{selectedKPI.actual}/{selectedKPI.target} {selectedKPI.unit}</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Mô tả</Label>
                              <p className="text-sm mt-1">{selectedKPI.description}</p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <Label className="text-sm font-medium">Ngày bắt đầu</Label>
                                <p className="text-sm">{selectedKPI.startDate.toLocaleDateString('vi-VN')}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Hạn hoàn thành</Label>
                                <p className="text-sm">{selectedKPI.endDate.toLocaleDateString('vi-VN')}</p>
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Tỷ lệ hoàn thành</Label>
                              <div className="flex items-center gap-3 mt-1">
                                <Progress value={selectedKPI.completionRate} className="flex-1" />
                                <span className="text-sm font-medium">{selectedKPI.completionRate.toFixed(1)}%</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-sm font-medium">Trạng thái báo cáo</Label>
                                <div className="mt-1">
                                  {getReportStatusBadge(selectedKPI.reportStatus)}
                                  {selectedKPI.lastReportDate && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Báo cáo cuối: {selectedKPI.lastReportDate.toLocaleDateString('vi-VN')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Độ ưu tiên</Label>
                                <div className="mt-1">
                                  {getPriorityBadge(selectedKPI.priority)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Tiến độ: {item.actual}/{item.target} {item.unit}</span>
                      <span className="font-medium">{item.completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={item.completionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredData.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Không tìm thấy KPI nào</h3>
                <p className="text-muted-foreground">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách chi tiết KPI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Table view would go here */}
                <p className="text-muted-foreground">Chức năng đang phát triển...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái báo cáo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">Chức năng đang phát triển...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích và biểu đồ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">Chức năng đang phát triển...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
