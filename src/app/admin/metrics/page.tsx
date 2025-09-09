'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  Download,
  Filter,
  Eye,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Award,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataContext } from '@/context/data-context';

interface MetricAnalysis {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdated: Date;
  departmentData: { department: string; value: number; target: number }[];
  employeeCount: number;
  description: string;
}

export default function MetricsPage() {
  const { departments, employees, kpis, kpiRecords } = useContext(DataContext);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState<MetricAnalysis | null>(null);

  // Real metrics data based on actual KPIs and records
  const metricsData = useMemo(() => {
    if (kpis.length === 0 || kpiRecords.length === 0) {
      return [];
    }

    const realMetrics: MetricAnalysis[] = [];
    
    // Group KPIs by category for analysis
    const kpisByCategory = kpis.reduce((acc, kpi) => {
      const category = kpi.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(kpi);
      return acc;
    }, {} as Record<string, typeof kpis>);

    // Generate metrics from real KPI data
    Object.entries(kpisByCategory).forEach(([category, categoryKpis]) => {
      categoryKpis.forEach((kpi) => {
        const kpiRecordsForThisKpi = kpiRecords.filter(r => r.kpiId === kpi.id);
        
        if (kpiRecordsForThisKpi.length === 0) return;
        
        // Calculate aggregated values
        const currentValue = kpiRecordsForThisKpi.reduce((sum, record) => 
          sum + (record.actual || 0), 0
        );
        const targetValue = kpiRecordsForThisKpi.reduce((sum, record) => 
          sum + record.target, 0
        );
        
        // Determine status based on performance
        const completionRate = targetValue > 0 ? (currentValue / targetValue * 100) : 0;
        let status: MetricAnalysis['status'] = 'critical';
        if (completionRate >= 100) status = 'excellent';
        else if (completionRate >= 80) status = 'good';
        else if (completionRate >= 60) status = 'warning';
        
        // Group by departments
        const departmentData: { department: string; value: number; target: number; }[] = [];
        const recordsByDept = new Map<string, typeof kpiRecordsForThisKpi>();
        
        kpiRecordsForThisKpi.forEach(record => {
          const employee = employees.find(e => e.uid === record.employeeId || e.id === record.employeeId);
          const department = departments.find(d => d.id === employee?.departmentId);
          const deptName = department?.name || 'Unknown';
          
          if (!recordsByDept.has(deptName)) {
            recordsByDept.set(deptName, []);
          }
          recordsByDept.get(deptName)!.push(record);
        });
        
        recordsByDept.forEach((records, deptName) => {
          const deptValue = records.reduce((sum, r) => sum + (r.actual || 0), 0);
          const deptTarget = records.reduce((sum, r) => sum + r.target, 0);
          departmentData.push({ department: deptName, value: deptValue, target: deptTarget });
        });
        
        realMetrics.push({
          id: kpi.id,
          name: kpi.name,
          category: kpi.category || 'General',
          currentValue,
          targetValue,
          unit: kpi.unit,
          trend: completionRate >= 100 ? 'up' : completionRate >= 50 ? 'stable' : 'down',
          changePercent: targetValue > 0 ? ((currentValue / targetValue - 1) * 100) : 0,
          status,
          lastUpdated: new Date(), // Could be enhanced with actual update dates
          employeeCount: kpiRecordsForThisKpi.length,
          description: kpi.description || `Theo dõi ${kpi.name}`,
          departmentData
        });
      });
    });

    // Filter by category
    if (selectedCategory !== 'all') {
      return realMetrics.filter(metric => metric.category === selectedCategory);
    }

    return realMetrics;
  }, [selectedCategory]);

  const summaryStats = useMemo(() => {
    const total = metricsData.length;
    const excellent = metricsData.filter(m => m.status === 'excellent').length;
    const good = metricsData.filter(m => m.status === 'good').length;
    const warning = metricsData.filter(m => m.status === 'warning').length;
    const critical = metricsData.filter(m => m.status === 'critical').length;
    
    const avgCompletion = metricsData.reduce((acc, metric) => {
      const completion = (metric.currentValue / metric.targetValue) * 100;
      return acc + Math.min(completion, 100);
    }, 0) / total;

    return {
      total,
      excellent,
      good,
      warning,
      critical,
      avgCompletion: Math.round(avgCompletion)
    };
  }, [metricsData]);

  const getStatusColor = (status: MetricAnalysis['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: MetricAnalysis['status']) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800">Xuất sắc</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">Tốt</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800">Cần cải thiện</Badge>;
      case 'critical':
        return <Badge variant="destructive">Nghiêm trọng</Badge>;
    }
  };

  const getTrendIcon = (trend: MetricAnalysis['trend'], changePercent: number) => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (trend === 'down') {
      return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
    }
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'VND') {
      return value.toLocaleString('vi-VN') + 'đ';
    }
    return value.toLocaleString('vi-VN') + ' ' + unit;
  };

  return (
    <div className="h-full p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metrics & Analytics</h1>
          <p className="text-muted-foreground">
            Phân tích hiệu suất và theo dõi metrics real-time
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Tháng hiện tại</SelectItem>
              <SelectItem value="last-month">Tháng trước</SelectItem>
              <SelectItem value="current-quarter">Quý hiện tại</SelectItem>
              <SelectItem value="last-quarter">Quý trước</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng Metrics</p>
                <p className="text-2xl font-bold">{summaryStats.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hiệu suất TB</p>
                <p className="text-2xl font-bold text-blue-600">{summaryStats.avgCompletion}%</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-3">
              <Progress value={summaryStats.avgCompletion} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Xuất sắc</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.excellent}</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cần xử lý</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            {summaryStats.critical > 0 && (
              <div className="mt-2 text-xs text-red-600">
                Cần hành động ngay!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Customer Service">Customer Service</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="trends">Xu hướng</TabsTrigger>
          <TabsTrigger value="departments">Theo phòng ban</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid gap-6">
            {metricsData.map((metric) => (
              <Card key={metric.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{metric.name}</h3>
                        {getStatusBadge(metric.status)}
                        <Badge variant="outline" className="text-xs">{metric.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{metric.description}</p>
                      
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Hiện tại</p>
                          <p className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                            {formatValue(metric.currentValue, metric.unit)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Mục tiêu</p>
                          <p className="text-lg font-medium">
                            {formatValue(metric.targetValue, metric.unit)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(metric.trend, metric.changePercent)}
                          <div>
                            <p className={`text-sm font-medium ${
                              metric.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {metric.changePercent >= 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">So với kỳ trước</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedMetric(metric)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Chi tiết Metric: {metric.name}</DialogTitle>
                          </DialogHeader>
                          {selectedMetric && (
                            <div className="space-y-6">
                              <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center p-4 border rounded">
                                  <p className="text-2xl font-bold text-blue-600">{formatValue(selectedMetric.currentValue, selectedMetric.unit)}</p>
                                  <p className="text-sm text-muted-foreground">Giá trị hiện tại</p>
                                </div>
                                <div className="text-center p-4 border rounded">
                                  <p className="text-2xl font-bold">{formatValue(selectedMetric.targetValue, selectedMetric.unit)}</p>
                                  <p className="text-sm text-muted-foreground">Mục tiêu</p>
                                </div>
                                <div className="text-center p-4 border rounded">
                                  <p className={`text-2xl font-bold ${selectedMetric.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {selectedMetric.changePercent >= 0 ? '+' : ''}{selectedMetric.changePercent.toFixed(1)}%
                                  </p>
                                  <p className="text-sm text-muted-foreground">Thay đổi</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3">Hiệu suất theo phòng ban</h4>
                                <div className="space-y-3">
                                  {selectedMetric.departmentData.map((dept, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                                      <span className="font-medium">{dept.department}</span>
                                      <div className="flex items-center gap-4">
                                        <span>{formatValue(dept.value, selectedMetric.unit)} / {formatValue(dept.target, selectedMetric.unit)}</span>
                                        <div className="w-24">
                                          <Progress value={Math.min((dept.value / dept.target) * 100, 100)} className="h-2" />
                                        </div>
                                        <span className="text-sm font-medium">
                                          {((dept.value / dept.target) * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <p className="text-sm font-medium">Số nhân viên liên quan</p>
                                  <p className="text-lg">{selectedMetric.employeeCount} người</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Cập nhật lần cuối</p>
                                  <p className="text-lg">{selectedMetric.lastUpdated.toLocaleString('vi-VN')}</p>
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <Button className="flex-1">
                                  <Download className="w-4 h-4 mr-2" />
                                  Xuất báo cáo chi tiết
                                </Button>
                                <Button variant="outline" className="flex-1">
                                  <LineChart className="w-4 h-4 mr-2" />
                                  Xem biểu đồ xu hướng
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <div className="text-xs text-muted-foreground text-right">
                        <div>{metric.employeeCount} NV</div>
                        <div>Cập nhật: {metric.lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tiến độ đạt mục tiêu</span>
                      <span className="font-medium">
                        {Math.min(((metric.currentValue / metric.targetValue) * 100), 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((metric.currentValue / metric.targetValue) * 100, 100)} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích xu hướng</CardTitle>
              <CardDescription>Biểu đồ xu hướng và dự báo hiệu suất</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Biểu đồ xu hướng</p>
                  <p className="text-muted-foreground">Chức năng đang phát triển</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sẽ hiển thị biểu đồ line chart với dữ liệu theo thời gian
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>So sánh theo phòng ban</CardTitle>
              <CardDescription>Hiệu suất các phòng ban trên từng metric</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Biểu đồ so sánh phòng ban</p>
                  <p className="text-muted-foreground">Chức năng đang phát triển</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sẽ hiển thị biểu đồ pie chart và bar chart so sánh
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime">
          <Card>
            <CardHeader>
              <CardTitle>Theo dõi Real-time</CardTitle>
              <CardDescription>Dữ liệu cập nhật liên tục theo thời gian thực</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {metricsData.slice(0, 6).map((metric) => (
                  <Card key={metric.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{metric.name}</h4>
                        <Zap className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {formatValue(metric.currentValue, metric.unit)}
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(metric.trend, metric.changePercent)}
                        <span className={`text-sm ${metric.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.changePercent >= 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}