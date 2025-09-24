'use client';
import { useContext, useState, useMemo, useEffect } from 'react';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Download,
  FileText,
  Plus,
  Search,
  Calendar,
  Upload,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Settings,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  MoreVertical,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { DataContext } from '@/context/data-context';
import { usePDFExport } from '@/lib/pdf-export';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  id: string;
  type: 'individual' | 'department' | 'kpi-specific' | 'company-wide';
  title: string;
  period: string;
  generatedAt: string;
  totalEmployees?: number;
  averageCompletion: number;
  recordsCount: number;
  quarter?: string;
  department?: string;
}

interface HistoricalReport {
  id: string;
  fileName: string;
  uploadDate: string;
  period: string;
  department: string;
  fileSize: string;
  uploadedBy: string;
}

interface QuarterlyKPISummary {
  department: string;
  quarter: string;
  totalKPIs: number;
  completedKPIs: number;
  averageScore: number;
  topPerformer: string;
  improvement: number;
}

export default function ReportsPage() {
  const { employees, kpis, kpiRecords, departments, rewardCalculations } = useContext(DataContext);
  const { exportComprehensiveReport } = usePDFExport();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Main state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReportType, setSelectedReportType] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('current');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q4-2024');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  
  // UI state
  const [showHistoricalReports, setShowHistoricalReports] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [compactView, setCompactView] = useState(false);
  
  // Save filter preferences to localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('reports-filters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      setSelectedTimeRange(filters.timeRange || 'current');
      setSelectedQuarter(filters.quarter || 'Q4-2024');
      setSelectedDepartment(filters.department || 'all');
      setShowHistoricalReports(filters.showHistorical || false);
      setCompactView(filters.compactView || false);
    }
  }, []);

  const saveFilterPreferences = () => {
    const filters = {
      timeRange: selectedTimeRange,
      quarter: selectedQuarter,
      department: selectedDepartment,
      showHistorical: showHistoricalReports,
      compactView: compactView
    };
    localStorage.setItem('reports-filters', JSON.stringify(filters));
    toast({
      title: "Đã lưu bộ lọc",
      description: "Cài đặt bộ lọc đã được lưu thành công.",
    });
  };

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Get unique periods
  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(kpiRecords.map(record => record.period))];
    return uniquePeriods.sort();
  }, [kpiRecords]);

  // Generate historical reports data (simulated)
  const historicalReports = useMemo(() => {
    const reports: HistoricalReport[] = [];
    const quarters = [
      { quarter: 'Q4-2024', months: ['Tháng 10', 'Tháng 11', 'Tháng 12'] },
      { quarter: 'Q3-2024', months: ['Tháng 7', 'Tháng 8', 'Tháng 9'] },
      { quarter: 'Q2-2024', months: ['Tháng 4', 'Tháng 5', 'Tháng 6'] },
      { quarter: 'Q1-2024', months: ['Tháng 1', 'Tháng 2', 'Tháng 3'] }
    ];
    const deptNames = departments.map(d => d.name);
    
    quarters.forEach(({ quarter, months }) => {
      months.forEach(month => {
        deptNames.forEach(dept => {
          const monthNumber = parseInt(month.split(' ')[1]);
          reports.push({
            id: `${quarter}-${month}-${dept}-${Math.random()}`,
            fileName: `Báo cáo KPI ${dept} ${month} 2024.xlsx`,
            uploadDate: new Date(2024, monthNumber - 1, Math.floor(Math.random() * 28) + 1).toISOString(),
            period: month,
            department: dept,
            fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
            uploadedBy: 'Admin'
          });
        });
      });
    });
    
    return reports.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }, [departments]);

  // Generate quarterly KPI summary
  const quarterlyKPISummary = useMemo(() => {
    const summary: QuarterlyKPISummary[] = [];
    
    departments.forEach(dept => {
      const deptEmployees = nonAdminEmployees.filter(emp => emp.departmentId === dept.id);
      const deptRecords = kpiRecords.filter(record => 
        deptEmployees.some(emp => emp.id === record.employeeId)
      );
      
      if (deptRecords.length > 0) {
        const avgScore = deptRecords.reduce((sum, record) => sum + (record.actual / record.target * 100), 0) / deptRecords.length;
        const topPerformer = deptEmployees[Math.floor(Math.random() * deptEmployees.length)]?.name || 'N/A';
        
        summary.push({
          department: dept.name,
          quarter: selectedQuarter,
          totalKPIs: deptRecords.length,
          completedKPIs: Math.floor(deptRecords.length * 0.85),
          averageScore: avgScore,
          topPerformer: topPerformer,
          improvement: Math.random() * 20 - 10 // -10% to +10%
        });
      }
    });
    
    return summary;
  }, [departments, nonAdminEmployees, kpiRecords, selectedQuarter]);

  // Simple reports data generation
  const reports = useMemo(() => {
    const reports: ReportData[] = [];
    const currentPeriod = periods.length > 0 ? periods[periods.length - 1] : new Date().toLocaleDateString('vi-VN');

    if (nonAdminEmployees.length > 0 && kpis.length > 0) {
      // Individual Performance Report
      const avgIndividualCompletion = kpiRecords.length > 0 ? 
        kpiRecords.reduce((sum, record) => sum + (record.actual / record.target * 100), 0) / kpiRecords.length : 0;
      
      reports.push({
        id: 'individual-performance',
        type: 'individual',
        title: t.reports.individualPerformanceReport,
        period: currentPeriod,
        generatedAt: new Date().toISOString(),
        totalEmployees: nonAdminEmployees.length,
        averageCompletion: avgIndividualCompletion,
        recordsCount: kpiRecords.length,
        quarter: selectedQuarter
      });

      // Department Performance Report
      if (departments.length > 0) {
        const deptRecordsCount = kpiRecords.filter(record => 
          nonAdminEmployees.some(emp => emp.id === record.employeeId)
        ).length;
        
        reports.push({
          id: 'department-performance',
          type: 'department',
          title: t.reports.departmentPerformanceReport,
          period: currentPeriod,
          generatedAt: new Date().toISOString(),
          totalEmployees: departments.length,
          averageCompletion: avgIndividualCompletion,
          recordsCount: deptRecordsCount,
          quarter: selectedQuarter
        });
      }

      // KPI Specific Report
      reports.push({
        id: 'kpi-specific',
        type: 'kpi-specific',
        title: t.reports.kpiSpecificReportTab,
        period: currentPeriod,
        generatedAt: new Date().toISOString(),
        totalEmployees: kpis.length,
        averageCompletion: avgIndividualCompletion,
        recordsCount: kpiRecords.length,
        quarter: selectedQuarter
      });

      // Company Wide Report
      reports.push({
        id: 'company-wide',
        type: 'company-wide',
        title: t.reports.companyOverview,
        period: currentPeriod,
        generatedAt: new Date().toISOString(),
        totalEmployees: nonAdminEmployees.length,
        averageCompletion: avgIndividualCompletion,
        recordsCount: kpiRecords.length,
        quarter: selectedQuarter
      });
    }

    return reports;
  }, [nonAdminEmployees, departments, kpis, kpiRecords, periods, t.reports, selectedQuarter]);

  // Filter reports based on search and type
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const typeMatch = selectedReportType === 'all' || report.type === selectedReportType;
      const searchMatch = searchTerm === '' || 
        report.title.toLowerCase().includes(searchTerm.toLowerCase());
      const timeMatch = selectedTimeRange === 'current' || 
        (selectedTimeRange === 'quarterly' && report.quarter === selectedQuarter);
      const deptMatch = selectedDepartment === 'all' || 
        (report.department && report.department === selectedDepartment);
      
      return typeMatch && searchMatch && timeMatch && deptMatch;
    });
  }, [reports, selectedReportType, searchTerm, selectedTimeRange, selectedQuarter, selectedDepartment]);

  // Filter historical reports
  const filteredHistoricalReports = useMemo(() => {
    const quarterMonths: { [key: string]: string[] } = {
      'Q1-2024': ['Tháng 1', 'Tháng 2', 'Tháng 3'],
      'Q2-2024': ['Tháng 4', 'Tháng 5', 'Tháng 6'],
      'Q3-2024': ['Tháng 7', 'Tháng 8', 'Tháng 9'],
      'Q4-2024': ['Tháng 10', 'Tháng 11', 'Tháng 12']
    };
    
    return historicalReports.filter(report => {
      const deptMatch = selectedDepartment === 'all' || report.department === selectedDepartment;
      const quarterMatch = quarterMonths[selectedQuarter]?.includes(report.period) || false;
      
      return deptMatch && quarterMatch;
    });
  }, [historicalReports, selectedDepartment, selectedQuarter]);

  const handleGenerateReport = (reportType: string) => {
    console.log('Generated new report:', reportType);
    alert(`Đã tạo báo cáo thành công!`);
  };

  const handleExportPDF = async (report: ReportData) => {
    try {
      const reportDataForExport = {
        title: report.title,
        subtitle: `Báo cáo được tạo lúc: ${new Date(report.generatedAt).toLocaleDateString('vi-VN')}`,
        summary: {
          text: `Báo cáo ${report.title} tổng hợp các chỉ số hiệu suất.`,
          metrics: [
            { label: 'Kỳ báo cáo', value: report.period },
            { label: 'Số bản ghi', value: report.recordsCount },
            { label: 'Tỷ lệ đạt TB', value: `${report.averageCompletion.toFixed(1)}%` },
            { label: 'Tổng đối tượng', value: report.totalEmployees || 0 }
          ]
        },
        tables: []
      };

      await exportComprehensiveReport(
        reportDataForExport,
        `${report.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
        {
          includeHeader: true,
          includeFooter: true,
          includePageNumbers: true,
          includeCharts: false,
          orientation: 'portrait'
        }
      );
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Có lỗi xảy ra khi xuất PDF. Vui lòng thử lại.');
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'individual': return <Users className="w-4 h-4" />;
      case 'department': return <BarChart3 className="w-4 h-4" />;
      case 'kpi-specific': return <Target className="w-4 h-4" />;
      case 'company-wide': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getReportTypeBadge = (type: string) => {
    switch (type) {
      case 'individual': return <Badge className="bg-blue-100 text-blue-800">{t.reports.individualType}</Badge>;
      case 'department': return <Badge className="bg-green-100 text-green-800">{t.reports.departmentType}</Badge>;
      case 'kpi-specific': return <Badge className="bg-purple-100 text-purple-800">{t.reports.kpiSpecificType}</Badge>;
      case 'company-wide': return <Badge className="bg-orange-100 text-orange-800">{t.reports.companyWideType}</Badge>;
      default: return <Badge variant="secondary">Khác</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header - Consistent with system */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo KPI</h1>
          <p className="text-muted-foreground">
            Quản lý và xem báo cáo hiệu suất của nhân viên và phòng ban
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={saveFilterPreferences}>
            <Save className="mr-2 h-4 w-4" />
            Lưu bộ lọc
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Tạo báo cáo
          </Button>
        </div>
      </div>

      {/* Stats Overview - Consistent with system */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng báo cáo</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 từ tháng trước
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhân viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nonAdminEmployees.length}</div>
            <p className="text-xs text-muted-foreground">
              Đang hoạt động
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KPI Records</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              Đã ghi nhận
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành TB</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpiRecords.length > 0 ? 
                (kpiRecords.reduce((sum, record) => sum + (record.actual / record.target * 100), 0) / kpiRecords.length).toFixed(1) : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              +5.2% từ tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section - Consistent with system */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc và tìm kiếm
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              >
                {isFiltersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {isFiltersExpanded ? 'Thu gọn' : 'Mở rộng'}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt nâng cao
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Quick Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm báo cáo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedReportType} onValueChange={setSelectedReportType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Loại báo cáo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="individual">Cá nhân</SelectItem>
                <SelectItem value="department">Phòng ban</SelectItem>
                <SelectItem value="kpi-specific">KPI cụ thể</SelectItem>
                <SelectItem value="company-wide">Toàn công ty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expanded Filters */}
          {isFiltersExpanded && (
            <div className="space-y-4">
              <Separator />
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="time-range">Khoảng thời gian</Label>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khoảng thời gian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Hiện tại</SelectItem>
                      <SelectItem value="quarterly">Theo quý</SelectItem>
                      <SelectItem value="monthly">Theo tháng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quarter">Quý</Label>
                  <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn quý" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q4-2024">Q4 2024 (10-12)</SelectItem>
                      <SelectItem value="Q3-2024">Q3 2024 (7-9)</SelectItem>
                      <SelectItem value="Q2-2024">Q2 2024 (4-6)</SelectItem>
                      <SelectItem value="Q1-2024">Q1 2024 (1-3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Phòng ban</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả phòng ban</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Options */}
              {showAdvancedFilters && (
                <div className="space-y-4">
                  <Separator />
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="historical-reports"
                        checked={showHistoricalReports}
                        onCheckedChange={setShowHistoricalReports}
                      />
                      <Label htmlFor="historical-reports">Hiển thị báo cáo cũ</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="compact-view"
                        checked={compactView}
                        onCheckedChange={setCompactView}
                      />
                      <Label htmlFor="compact-view">Chế độ gọn</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-refresh"
                        checked={autoRefresh}
                        onCheckedChange={setAutoRefresh}
                      />
                      <Label htmlFor="auto-refresh">Tự động làm mới</Label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quarterly KPI Summary - Consistent with system */}
      {selectedTimeRange === 'quarterly' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tổng hợp KPI {selectedQuarter}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${compactView ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {quarterlyKPISummary.map((summary, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{summary.department}</CardTitle>
                      <Badge variant="outline">{summary.quarter}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tổng KPI</span>
                        <span className="font-medium">{summary.totalKPIs}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Hoàn thành</span>
                        <span className="font-medium text-green-600">{summary.completedKPIs}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Điểm TB</span>
                        <span className="font-medium">{summary.averageScore.toFixed(1)}%</span>
                      </div>
                      {!compactView && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Xuất sắc</span>
                            <span className="font-medium text-blue-600">{summary.topPerformer}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tăng trưởng</span>
                            <span className={`font-medium ${summary.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {summary.improvement >= 0 ? '+' : ''}{summary.improvement.toFixed(1)}%
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Reports - Consistent with system */}
      {showHistoricalReports && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Báo cáo đã upload ({filteredHistoricalReports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {compactView ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredHistoricalReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <FileText className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{report.fileName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{report.department}</Badge>
                            <span className="text-xs text-muted-foreground">{report.period}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">{report.fileSize}</span>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên file</TableHead>
                    <TableHead>Phòng ban</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Kích thước</TableHead>
                    <TableHead>Upload bởi</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistoricalReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <FileText className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{report.fileName}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(report.uploadDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{report.period}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{report.fileSize}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {report.uploadedBy.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{report.uploadedBy}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reports Table - Consistent with system */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Danh sách báo cáo ({filteredReports.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Loại báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="individual">Cá nhân</SelectItem>
                  <SelectItem value="department">Phòng ban</SelectItem>
                  <SelectItem value="kpi-specific">KPI cụ thể</SelectItem>
                  <SelectItem value="company-wide">Toàn công ty</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => handleGenerateReport('new')} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Tạo mới
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {reports.length === 0 ? 'Chưa có báo cáo nào' : 'Không tìm thấy báo cáo'}
              </h3>
              <p className="text-muted-foreground text-center mb-4 max-w-md">
                {reports.length === 0 
                  ? 'Hãy thêm nhân viên và KPI để tạo báo cáo đầu tiên'
                  : 'Thử thay đổi bộ lọc để tìm báo cáo phù hợp'
                }
              </p>
              {reports.length === 0 && (
                <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">Thêm nhân viên</Badge>
                  <Badge variant="outline">Định nghĩa KPI</Badge>
                  <Badge variant="outline">Gán KPI</Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {compactView ? (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {filteredReports.map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-primary/10 p-2">
                            {getReportIcon(report.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{report.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getReportTypeBadge(report.type)}
                              <span className="text-xs text-muted-foreground">{report.recordsCount} records</span>
                            </div>
                            <div className="space-y-1 mt-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Kỳ:</span>
                                <span className="font-medium">{report.period}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Hoàn thành:</span>
                                <span className="font-medium text-green-600">{report.averageCompletion.toFixed(1)}%</span>
                              </div>
                              {report.quarter && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Quý:</span>
                                  <span className="font-medium text-blue-600">{report.quarter}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-muted-foreground">
                                {new Date(report.generatedAt).toLocaleDateString('vi-VN')}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExportPDF(report)}
                                className="h-6 w-6 p-0"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Báo cáo</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Kỳ</TableHead>
                      <TableHead>Dữ liệu</TableHead>
                      <TableHead>Tỷ lệ</TableHead>
                      <TableHead>Tạo lúc</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-primary/10 p-2">
                              {getReportIcon(report.type)}
                            </div>
                            <div>
                              <p className="font-medium">{report.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {report.recordsCount} bản ghi
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getReportTypeBadge(report.type)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{report.period}</span>
                            {report.quarter && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Quý: {report.quarter}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>NV: {report.totalEmployees || 0}</p>
                            <p>KPI: {report.recordsCount}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-green-600">
                              {report.averageCompletion.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(report.generatedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExportPDF(report)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
