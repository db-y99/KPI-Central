'use client';
import { useState, useEffect, useContext, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  UserPlus, 
  TrendingUp, 
  BarChart3, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Upload
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { Kpi, KpiRecord, Employee, Department } from '@/types';

// Import existing components
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const KpiDefinitionsComponent = dynamic(() => import('@/components/kpi-definitions-component'), { 
  loading: () => <div className="p-4">Loading KPI Definitions...</div>
});
const KpiAssignmentComponent = dynamic(() => import('@/components/kpi-assignment-component'), { 
  loading: () => <div className="p-4">Loading KPI Assignment...</div>
});
const KpiTrackingComponent = dynamic(() => import('@/components/kpi-tracking-component'), { 
  loading: () => <div className="p-4">Loading KPI Tracking...</div>
});

export default function KpiManagementPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { kpis, kpiRecords, employees, departments, addKpi, updateKpi, deleteKpi, updateKpiRecord } = useContext(DataContext);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Handle query parameter for tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'definitions', 'assignment', 'tracking'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Statistics
  const stats = useMemo(() => {
    const totalKpis = kpis.length;
    const activeKpis = kpis.filter(k => k.status === 'active').length;
    const totalAssignments = kpiRecords.length;
    const activeAssignments = kpiRecords.filter(r => ['not_started', 'in_progress', 'submitted'].includes(r.status)).length;
    const completedAssignments = kpiRecords.filter(r => r.status === 'approved').length;
    const overdueAssignments = kpiRecords.filter(r => {
      const endDate = new Date(r.endDate);
      return endDate < new Date() && !['approved', 'rejected'].includes(r.status);
    }).length;

    return {
      totalKpis,
      activeKpis,
      totalAssignments,
      activeAssignments,
      completedAssignments,
      overdueAssignments
    };
  }, [kpis, kpiRecords]);

  // Helper functions
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.uid === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  const getKpiName = (kpiId: string) => {
    const kpi = kpis.find(k => k.id === kpiId);
    return kpi?.name || 'Unknown KPI';
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department?.name || 'Unknown Department';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter KPI records
  const filteredKpiRecords = useMemo(() => {
    return kpiRecords.filter(record => {
      const employee = employees.find(e => e.uid === record.employeeId);
      const kpi = kpis.find(k => k.id === record.kpiId);
      
      const matchesSearch = searchTerm === '' || 
        (employee?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (kpi?.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDepartment = departmentFilter === 'all' || employee?.departmentId === departmentFilter;
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [kpiRecords, employees, kpis, searchTerm, departmentFilter, statusFilter]);

  const tabs = [
    {
      id: 'overview',
      label: 'Tổng quan',
      icon: BarChart3,
      description: 'Dashboard tổng quan KPI'
    },
    {
      id: 'definitions',
      label: 'Định nghĩa KPI',
      icon: Target,
      description: 'Quản lý định nghĩa KPI'
    },
    {
      id: 'assignment',
      label: 'Giao KPI',
      icon: UserPlus,
      description: 'Giao KPI cho nhân viên'
    },
    {
      id: 'tracking',
      label: 'Theo dõi KPI',
      icon: TrendingUp,
      description: 'Theo dõi tiến độ KPI'
    }
  ];

  return (
    <div className="h-full p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quản lý KPI
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Quản lý toàn diện hệ thống KPI của tổ chức
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import dữ liệu
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-0 p-1 h-14 bg-gray-100 rounded-lg">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-600 hover:text-gray-900"
            >
              <tab.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate text-xs">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng KPI</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalKpis}</div>
                <p className="text-xs text-muted-foreground">Định nghĩa KPI</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">KPI Active</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.activeKpis}</div>
                <p className="text-xs text-muted-foreground">Đang sử dụng</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng giao</CardTitle>
                <UserPlus className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.totalAssignments}</div>
                <p className="text-xs text-muted-foreground">KPI đã giao</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang thực hiện</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.activeAssignments}</div>
                <p className="text-xs text-muted-foreground">KPI active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completedAssignments}</div>
                <p className="text-xs text-muted-foreground">KPI đã duyệt</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overdueAssignments}</div>
                <p className="text-xs text-muted-foreground">Cần xử lý</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Quick Actions & Analytics */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Thao tác nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => handleTabChange('definitions')} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Tạo KPI mới
                  </Button>
                  <Button 
                    onClick={() => handleTabChange('assignment')} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Giao KPI
                  </Button>
                  <Button 
                    onClick={() => handleTabChange('tracking')} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Theo dõi tiến độ
                  </Button>
                </CardContent>
              </Card>

              {/* Department Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Phân tích phòng ban
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departments.map((dept) => {
                      const deptEmployees = employees.filter(emp => emp.departmentId === dept.id);
                      const deptKpis = kpiRecords.filter(record => 
                        deptEmployees.some(emp => emp.uid === record.employeeId)
                      );
                      return (
                        <div key={dept.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{dept.name}</h4>
                            <Badge variant="outline" className="text-xs">{deptKpis.length} KPI</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {deptEmployees.length} nhân viên
                          </div>
                          <Progress 
                            value={deptKpis.length > 0 ? (deptKpis.filter(k => k.status === 'approved').length / deptKpis.length) * 100 : 0} 
                            className="h-2" 
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <Label>Lọc theo phòng ban</Label>
                      <select 
                        value={departmentFilter} 
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="all">Tất cả phòng ban</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <Label>Lọc theo trạng thái</Label>
                      <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="not_started">Chưa bắt đầu</option>
                        <option value="in_progress">Đang thực hiện</option>
                        <option value="submitted">Đã nộp</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Từ chối</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <Label>Tìm kiếm</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Tìm KPI, nhân viên..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent KPI Records */}
              <Card>
                <CardHeader>
                  <CardTitle>Hoạt động KPI gần đây</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {filteredKpiRecords.length} KPI được tìm thấy
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredKpiRecords.slice(0, 10).map((record) => {
                      const employee = employees.find(e => e.uid === record.employeeId);
                      const kpi = kpis.find(k => k.id === record.kpiId);
                      const department = departments.find(d => d.id === employee?.departmentId);
                      
                      return (
                        <div key={record.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Target className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold">{kpi?.name || 'Unknown KPI'}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{employee?.name || 'Unknown Employee'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Building2 className="w-4 h-4" />
                                    <span>{department?.name || 'Unknown Department'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Hạn: {new Date(record.endDate).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <Label className="text-xs text-muted-foreground">Mục tiêu</Label>
                              <p className="font-semibold">{record.target}</p>
                            </div>
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <Label className="text-xs text-muted-foreground">Thực tế</Label>
                              <p className="font-semibold">{record.actual}</p>
                            </div>
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <Label className="text-xs text-muted-foreground">Tiến độ</Label>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={record.target > 0 ? (record.actual / record.target) * 100 : 0} 
                                  className="flex-1 h-2" 
                                />
                                <span className="text-sm font-medium">
                                  {record.target > 0 ? Math.round((record.actual / record.target) * 100) : 0}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Other Tabs */}
        <TabsContent value="definitions" className="mt-6">
          <KpiDefinitionsComponent />
        </TabsContent>

        <TabsContent value="assignment" className="mt-6">
          <KpiAssignmentComponent />
        </TabsContent>

        <TabsContent value="tracking" className="mt-6">
          <KpiTrackingComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

