'use client';
import { useContext, useState, useMemo } from 'react';
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
  AlertTriangle
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
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';

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
  const { kpis, kpiRecords } = useContext(DataContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<SelfUpdateMetric | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    kpiId: '',
    period: '',
    actualValue: '',
    notes: ''
  });

  // Get employee's KPI records
  const employeeKpis = useMemo(() => {
    if (!user?.uid) return [];
    return kpiRecords.filter(record => record.employeeId === user.uid);
  }, [kpiRecords, user?.uid]);

  // Get unique periods
  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(employeeKpis.map(record => record.period))];
    return uniquePeriods.sort();
  }, [employeeKpis]);

  // Filter metrics based on selections
  const filteredMetrics = useMemo(() => {
    return employeeKpis.filter(record => {
      const kpiMatch = selectedKpi === 'all' || record.kpiId === selectedKpi;
      const statusMatch = selectedStatus === 'all' || record.status === selectedStatus;
      return kpiMatch && statusMatch;
    });
  }, [employeeKpis, selectedKpi, selectedStatus]);

  const handleAddMetric = () => {
    setEditingMetric(null);
    setFormData({
      kpiId: '',
      period: '',
      actualValue: '',
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditMetric = (metric: any) => {
    setEditingMetric(metric);
    setFormData({
      kpiId: metric.kpiId,
      period: metric.period,
      actualValue: metric.actualValue?.toString() || '',
      notes: metric.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveMetric = () => {
    // Here you would typically save to your data store
    console.log('Saving metric:', formData);
    setIsDialogOpen(false);
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

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cập nhật KPI cá nhân</h1>
          <p className="text-muted-foreground">Tự cập nhật dữ liệu KPI và theo dõi tiến độ</p>
        </div>
        <Button onClick={handleAddMetric} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Cập nhật KPI
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{employeeKpis.length}</div>
            <p className="text-xs text-muted-foreground">Tổng số KPI</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {employeeKpis.filter(k => k.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Đã duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">
              {employeeKpis.filter(k => k.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Chờ duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {employeeKpis.length > 0 ? 
                (employeeKpis.reduce((sum, k) => sum + getCompletionRate(k.targetValue, k.actualValue), 0) / employeeKpis.length).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Tỷ lệ đạt TB</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
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
              <Label>Trạng thái:</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics List */}
      <Card>
        <CardHeader>
          <CardTitle>KPI của tôi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMetrics.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Không có KPI nào</p>
              </div>
            ) : (
              filteredMetrics.map((metric) => (
                <div key={metric.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                    <div className="mt-3">
                      <Label className="text-muted-foreground">Ghi chú</Label>
                      <p className="text-sm">{metric.notes}</p>
                    </div>
                  )}

                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tiến độ hoàn thành</span>
                      <span className="font-medium">{getCompletionRate(metric.targetValue, metric.actualValue).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          getCompletionRate(metric.targetValue, metric.actualValue) >= 100 ? 'bg-green-500' :
                          getCompletionRate(metric.targetValue, metric.actualValue) >= 80 ? 'bg-blue-500' :
                          getCompletionRate(metric.targetValue, metric.actualValue) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(getCompletionRate(metric.targetValue, metric.actualValue), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Metric Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
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
                  {kpis.map(kpi => (
                    <SelectItem key={kpi.id} value={kpi.id}>
                      {kpi.name}
                    </SelectItem>
                  ))}
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
