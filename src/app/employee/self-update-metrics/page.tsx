'use client';
import { useContext, useState, useMemo, useEffect } from 'react';
import { 
  Plus,
  Edit,
  Save,
  X,
  Target,
  TrendingUp,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Upload,
  FileText,
  Download,
  Eye,
  History,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { usePDFExport } from '@/lib/pdf-export';
import FileUpload from '@/components/file-upload';
import { type UploadedFile } from '@/lib/unified-file-service';

interface SelfUpdateMetric {
  id: string;
  kpiId: string;
  kpiName: string;
  period: string;
  targetValue: number;
  actualValue: number;
  completionRate: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  notes?: string;
}

export default function SelfUpdateMetricsPage() {
  const { user } = useContext(AuthContext);
  const { kpis, kpiRecords, selfUpdateRequests, createSelfUpdateRequest, getSelfUpdateRequestsByEmployee } = useContext(DataContext);
  const { toast } = useToast();
  const { exportComprehensiveReport } = usePDFExport();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<SelfUpdateMetric | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showHistory, setShowHistory] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    kpiId: '',
    period: '',
    actualValue: '',
    notes: '',
    supportingDocuments: [] as UploadedFile[]
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Get employee's KPI records
  const employeeKpis = useMemo(() => {
    if (!user?.uid) return [];
    return kpiRecords.filter(record => record.employeeId === user.uid);
  }, [kpiRecords, user?.uid]);

  // Get employee's update requests
  const userUpdateRequests = useMemo(() => {
    if (!user?.uid) return [];
    return getSelfUpdateRequestsByEmployee(user.uid);
  }, [user?.uid, getSelfUpdateRequestsByEmployee]);

  // Get unique periods
  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(employeeKpis.map(record => record.period))];
    return uniquePeriods.sort();
  }, [employeeKpis]);

  // Enhanced filtering with search and period
  const filteredMetrics = useMemo(() => {
    return employeeKpis.filter(record => {
      const kpiMatch = selectedKpi === 'all' || record.kpiId === selectedKpi;
      const statusMatch = selectedStatus === 'all' || record.status === selectedStatus;
      const periodMatch = selectedPeriod === 'all' || record.period === selectedPeriod;
      const searchMatch = searchTerm === '' || 
        getKpiName(record.kpiId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.period.toLowerCase().includes(searchTerm.toLowerCase());
      
      return kpiMatch && statusMatch && periodMatch && searchMatch;
    });
  }, [employeeKpis, selectedKpi, selectedStatus, selectedPeriod, searchTerm]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = employeeKpis.length;
    const approved = employeeKpis.filter(k => k.status === 'approved').length;
    const pending = employeeKpis.filter(k => k.status === 'not_started').length;
    const rejected = employeeKpis.filter(k => k.status === 'rejected').length;
    const averageCompletion = total > 0 ? 
      employeeKpis.reduce((sum, k) => sum + getCompletionRate(k.targetValue, k.actualValue), 0) / total : 0;
    
    return { total, approved, pending, rejected, averageCompletion };
  }, [employeeKpis]);

  const handleAddMetric = () => {
    setEditingMetric(null);
    setFormData({
      kpiId: '',
      period: '',
      actualValue: '',
      notes: '',
      supportingDocuments: []
    });
    setUploadedFiles([]);
    setIsDialogOpen(true);
  };

  const handleEditMetric = (metric: any) => {
    setEditingMetric(metric);
    setFormData({
      kpiId: metric.kpiId,
      period: metric.period,
      actualValue: metric.actualValue?.toString() || '',
      notes: metric.notes || '',
      supportingDocuments: metric.supportingDocuments || []
    });
    setUploadedFiles(metric.supportingDocuments || []);
    setIsDialogOpen(true);
  };

  const handleSaveMetric = async () => {
    if (!formData.kpiId || !formData.period || !formData.actualValue) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedKpiRecord = employeeKpis.find(r => r.id === formData.kpiId);
      if (!selectedKpiRecord) {
        throw new Error('KPI record not found');
      }

      await createSelfUpdateRequest({
        employeeId: user?.uid || '',
        kpiRecordId: selectedKpiRecord.id,
        currentValue: selectedKpiRecord.actual,
        newValue: parseFloat(formData.actualValue),
        reason: formData.notes,
        supportingDocuments: formData.supportingDocuments.map(f => f.url),
        status: 'not_started',
        submittedAt: new Date().toISOString()
      });

      setFormData({
        kpiId: '',
        period: '',
        actualValue: '',
        notes: '',
        supportingDocuments: []
      });
      setUploadedFiles([]);
      setIsDialogOpen(false);
      
      toast({
        title: "Gửi yêu cầu thành công",
        description: "Yêu cầu cập nhật đã được gửi và đang chờ duyệt",
      });
    } catch (error) {
      console.error('Error saving metric:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi yêu cầu. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    setFormData(prev => ({
      ...prev,
      supportingDocuments: [...prev.supportingDocuments, ...files]
    }));
  };

  const handleFileRemove = (fileUrl: string) => {
    setUploadedFiles(prev => prev.filter(f => f.url !== fileUrl));
    setFormData(prev => ({
      ...prev,
      supportingDocuments: prev.supportingDocuments.filter(f => f.url !== fileUrl)
    }));
  };

  const handleExportMetricsPDF = async () => {
    try {
      const reportData = {
        title: `Báo cáo KPI cá nhân - ${user?.displayName || 'Nhân viên'}`,
        subtitle: `Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`,
        summary: {
          text: `Báo cáo tổng hợp các KPI cá nhân và yêu cầu cập nhật của nhân viên ${user?.displayName || 'N/A'}.`,
          metrics: [
            { label: 'Tổng số KPI', value: statistics.total },
            { label: 'Đã duyệt', value: statistics.approved },
            { label: 'Chờ duyệt', value: statistics.pending },
            { label: 'Từ chối', value: statistics.rejected },
            { label: 'Tỷ lệ đạt TB', value: `${statistics.averageCompletion.toFixed(1)}%` }
          ]
        },
        tables: [
          {
            title: 'Danh sách KPI',
            data: filteredMetrics.map(metric => ({
              kpi: getKpiName(metric.kpiId),
              period: metric.period,
              target: metric.targetValue,
              actual: metric.actualValue,
              completion: `${getCompletionRate(metric.targetValue, metric.actualValue).toFixed(1)}%`,
              status: getStatusBadgeText(metric.status)
            })),
            columns: [
              { key: 'kpi', label: 'KPI', align: 'left' },
              { key: 'period', label: 'Kỳ', align: 'center' },
              { key: 'target', label: 'Mục tiêu', align: 'right' },
              { key: 'actual', label: 'Thực tế', align: 'right' },
              { key: 'completion', label: 'Tỷ lệ đạt', align: 'right' },
              { key: 'status', label: 'Trạng thái', align: 'center' }
            ]
          }
        ]
      };

      await exportComprehensiveReport(
        reportData,
        `bao-cao-kpi-ca-nhan-${user?.displayName?.toLowerCase().replace(/\s+/g, '-') || 'nhan-vien'}-${new Date().toISOString().split('T')[0]}.pdf`,
        {
          includeHeader: true,
          includeFooter: true,
          includePageNumbers: true,
          includeCharts: false,
          orientation: 'portrait',
          watermark: 'KPI Central System'
        }
      );

      toast({
        title: "Xuất PDF thành công",
        description: "Báo cáo KPI đã được xuất thành file PDF",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Lỗi xuất PDF",
        description: "Không thể xuất báo cáo ra PDF. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Đã duyệt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Từ chối</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Calendar className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
    }
  };

  const getStatusBadgeText = (status: string) => {
    switch (status) {
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      default: return 'Chờ duyệt';
    }
  };

  const getKpiName = (kpiId: string) => {
    const kpi = kpis.find(k => k.id === kpiId);
    return kpi?.name || 'Không xác định';
  };

  const getCompletionRate = (target: number, actual: number) => {
    if (target === 0) return 0;
    return Math.min((actual / target) * 100, 100);
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 100) return 'text-green-600';
    if (rate >= 80) return 'text-blue-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cập nhật KPI cá nhân</h1>
          <p className="text-muted-foreground">Tự cập nhật dữ liệu KPI và theo dõi tiến độ</p>
        </div>
        <div className="flex gap-2">
          {employeeKpis.length > 0 && (
            <Button onClick={handleExportMetricsPDF} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Xuất PDF
            </Button>
          )}
          <Button onClick={handleAddMetric} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Cập nhật KPI
          </Button>
        </div>
      </div>

      {/* Enhanced Summary Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">Tổng số KPI</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{statistics.approved}</div>
            <p className="text-xs text-muted-foreground">Đã duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
            <p className="text-xs text-muted-foreground">Chờ duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{statistics.rejected}</div>
            <p className="text-xs text-muted-foreground">Từ chối</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.averageCompletion.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Tỷ lệ đạt TB</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Tìm kiếm KPI hoặc kỳ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label>KPI:</Label>
              <Select value={selectedKpi} onValueChange={setSelectedKpi}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn KPI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả KPI</SelectItem>
                  {kpis.map(kpi => (
                    <SelectItem key={kpi.id} value={kpi.id}>
                      {kpi.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Kỳ:</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn kỳ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả kỳ</SelectItem>
                  {periods.map(period => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Trạng thái:</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="not_started">Chưa bắt đầu</SelectItem>
                  <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                  <SelectItem value="submitted">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="w-4 h-4 mr-1" />
                {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs */}
      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">
            KPI hiện tại ({filteredMetrics.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Yêu cầu cập nhật ({userUpdateRequests.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            Phân tích
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* View Mode Toggle */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">KPI của tôi</h3>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Thẻ
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Activity className="w-4 h-4 mr-1" />
                Bảng
              </Button>
            </div>
          </div>

          {/* Metrics Display */}
          {filteredMetrics.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Không có KPI nào</h3>
                <p className="text-muted-foreground mb-4">
                  Không tìm thấy KPI nào phù hợp với bộ lọc hiện tại
                </p>
                <Button onClick={() => {
                  setSelectedKpi('all');
                  setSelectedStatus('all');
                  setSelectedPeriod('all');
                  setSearchTerm('');
                }}>
                  Xóa bộ lọc
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'cards' ? 'grid gap-4' : 'space-y-4'}>
              {filteredMetrics.map((metric) => (
                <Card key={metric.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{getKpiName(metric.kpiId)}</h4>
                          <p className="text-sm text-muted-foreground">Kỳ: {metric.period}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(metric.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMetric(metric)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <Label className="text-muted-foreground">Mục tiêu</Label>
                        <p className="font-medium">{metric.targetValue}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Thực tế</Label>
                        <p className="font-medium">{metric.actualValue}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Tỷ lệ đạt</Label>
                        <p className={`font-medium ${getCompletionColor(getCompletionRate(metric.targetValue, metric.actualValue))}`}>
                          {getCompletionRate(metric.targetValue, metric.actualValue).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Cập nhật</Label>
                        <p className="font-medium">
                          {new Date(metric.updatedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    {metric.notes && (
                      <div className="mb-4">
                        <Label className="text-muted-foreground">Ghi chú</Label>
                        <p className="text-sm">{metric.notes}</p>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tiến độ hoàn thành</span>
                        <span className="font-medium">{getCompletionRate(metric.targetValue, metric.actualValue).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={getCompletionRate(metric.targetValue, metric.actualValue)} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <h3 className="text-lg font-medium">Lịch sử yêu cầu cập nhật</h3>
          {userUpdateRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Chưa có yêu cầu nào</h3>
                <p className="text-muted-foreground">
                  Bạn chưa gửi yêu cầu cập nhật KPI nào
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userUpdateRequests.map((request) => {
                const kpiRecord = kpiRecords.find(kr => kr.id === request.kpiRecordId);
                const kpi = kpis.find(k => k.id === kpiRecord?.kpiId);
                
                return (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{kpi?.name || 'Unknown KPI'}</h4>
                            {getStatusBadge(request.status)}
                          </div>
                          
                          <div className="grid gap-4 md:grid-cols-3 mb-3">
                            <div>
                              <div className="text-sm text-muted-foreground">Từ</div>
                              <div className="font-medium">{request.currentValue}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Đến</div>
                              <div className="font-medium">{request.newValue}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Thay đổi</div>
                              <div className="font-medium">
                                {((request.newValue - request.currentValue) / request.currentValue * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Lý do:</div>
                            <p className="text-sm">{request.reason}</p>
                          </div>
                          
                          {request.feedback && (
                            <div className="space-y-2 mt-3">
                              <div className="text-sm text-muted-foreground">Phản hồi:</div>
                              <p className="text-sm bg-gray-50 p-2 rounded">{request.feedback}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span>Gửi: {new Date(request.submittedAt).toLocaleString('vi-VN')}</span>
                            {request.reviewedAt && (
                              <span>Duyệt: {new Date(request.reviewedAt).toLocaleString('vi-VN')}</span>
                            )}
                            {request.reviewedBy && (
                              <span>Bởi: {request.reviewedBy}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h3 className="text-lg font-medium">Phân tích hiệu suất</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Phân bố trạng thái
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Đã duyệt</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded">
                        <div 
                          className="h-2 bg-green-500 rounded" 
                          style={{ width: `${(statistics.approved / statistics.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{statistics.approved}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Chờ duyệt</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded">
                        <div 
                          className="h-2 bg-yellow-500 rounded" 
                          style={{ width: `${(statistics.pending / statistics.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{statistics.pending}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Từ chối</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded">
                        <div 
                          className="h-2 bg-red-500 rounded" 
                          style={{ width: `${(statistics.rejected / statistics.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{statistics.rejected}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tỷ lệ đạt trung bình
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {statistics.averageCompletion.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dựa trên {statistics.total} KPI
                  </p>
                  <Progress 
                    value={statistics.averageCompletion} 
                    className="mt-4 h-3"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Add/Edit Metric Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMetric ? 'Chỉnh sửa KPI' : 'Cập nhật KPI mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>KPI</Label>
              <Select value={formData.kpiId} onValueChange={(value) => setFormData({...formData, kpiId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn KPI" />
                </SelectTrigger>
                <SelectContent>
                  {employeeKpis.map(record => {
                    const kpi = kpis.find(k => k.id === record.kpiId);
                    return (
                      <SelectItem key={record.id} value={record.id}>
                        {kpi?.name} - {record.target} {kpi?.unit}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Kỳ</Label>
              <Input
                value={formData.period}
                onChange={(e) => setFormData({...formData, period: e.target.value})}
                placeholder="VD: Q1-2024, Tháng 1-2024"
              />
            </div>

            <div>
              <Label>Giá trị thực tế</Label>
              <Input
                type="number"
                value={formData.actualValue}
                onChange={(e) => setFormData({...formData, actualValue: e.target.value})}
                placeholder="Nhập giá trị thực tế"
              />
            </div>

            <div>
              <Label>Ghi chú</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Ghi chú thêm về KPI này (tùy chọn)"
                rows={3}
              />
            </div>

            <div>
              <Label>Tài liệu hỗ trợ</Label>
              <FileUpload
                path={`self-updates/${user?.uid || 'anonymous'}`}
                onFilesUploaded={handleFileUpload}
                onFileRemoved={handleFileRemove}
                maxFiles={5}
                maxSize={10 * 1024 * 1024} // 10MB
                allowedTypes={[
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.ms-excel',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'image/jpeg',
                  'image/png',
                  'image/gif',
                  'text/plain'
                ]}
              />
              
              {uploadedFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="text-sm font-medium">Files đã chọn:</div>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4" />
                      <span>{file.name}</span>
                      <span className="text-muted-foreground">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button onClick={handleSaveMetric}>
                <Save className="w-4 h-4 mr-2" />
                Lưu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
