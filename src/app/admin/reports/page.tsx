'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Download,
  FileText,
  Plus,
  Search
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
import { DataContext } from '@/context/data-context';
import { usePDFExport } from '@/lib/pdf-export';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';

interface ReportData {
  id: string;
  type: 'individual' | 'department' | 'kpi-specific' | 'company-wide';
  title: string;
  period: string;
  generatedAt: string;
  totalEmployees?: number;
  averageCompletion: number;
  recordsCount: number;
}

export default function ReportsPage() {
  const { employees, kpis, kpiRecords, departments, rewardCalculations } = useContext(DataContext);
  const { exportComprehensiveReport } = usePDFExport();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReportType, setSelectedReportType] = useState<string>('all');

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Get unique periods
  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(kpiRecords.map(record => record.period))];
    return uniquePeriods.sort();
  }, [kpiRecords]);

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
        recordsCount: kpiRecords.length
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
          recordsCount: deptRecordsCount
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
        recordsCount: kpiRecords.length
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
        recordsCount: kpiRecords.length
      });
    }

    return reports;
  }, [nonAdminEmployees, departments, kpis, kpiRecords, periods, t.reports]);

  // Filter reports based on search and type
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const typeMatch = selectedReportType === 'all' || report.type === selectedReportType;
      const searchMatch = searchTerm === '' || 
        report.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      return typeMatch && searchMatch;
    });
  }, [reports, selectedReportType, searchTerm]);

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
    <div className="p-4 md:p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">{t.reports.totalReports}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">
                {nonAdminEmployees.length}
              </div>
              <p className="text-xs text-muted-foreground">{t.reports.totalEmployees}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {kpiRecords.length}
              </div>
              <p className="text-xs text-muted-foreground">{t.reports.totalKpiRecords}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">
                {kpiRecords.length > 0 ? 
                  (kpiRecords.reduce((sum, record) => sum + (record.actual / record.target * 100), 0) / kpiRecords.length).toFixed(1) : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground">{t.reports.averageCompletion}</p>
            </CardContent>
          </Card>
        </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {t.reports.reportsList || 'Danh sách báo cáo'} ({filteredReports.length})
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Input
                  placeholder={t.reports.searchReports}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t.reports.selectReportType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.reports.allTypes}</SelectItem>
                  <SelectItem value="individual">{t.reports.individual}</SelectItem>
                  <SelectItem value="department">{t.reports.department}</SelectItem>
                  <SelectItem value="kpi-specific">{t.reports.kpiSpecific}</SelectItem>
                  <SelectItem value="company-wide">{t.reports.companyWide}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => handleGenerateReport('new')}>
                <Plus className="w-4 h-4 mr-2" />
                {t.reports.createReport}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              {reports.length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">{t.reports.noReports}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t.reports.noReportsDescription}
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• {t.reports.addEmployee} tại <a href="/admin/employees" className="text-blue-600 hover:underline">{t.nav.employees}</a></p>
                    <p>• {t.reports.defineKpi} tại <a href="/admin/kpi-definitions" className="text-blue-600 hover:underline">{t.nav.defineKpi}</a></p>
                    <p>• {t.reports.assignKpi} tại <a href="/admin/kpi-assignment" className="text-blue-600 hover:underline">{t.nav.assignKpi}</a></p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">{t.reports.noReportsFound}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t.reports.noReportsFoundDescription}
                  </p>
                </>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.reports.report}</TableHead>
                  <TableHead>{t.reports.type}</TableHead>
                  <TableHead>{t.reports.period}</TableHead>
                  <TableHead>{t.reports.data}</TableHead>
                  <TableHead>{t.reports.completionRate}</TableHead>
                  <TableHead>{t.reports.createdAt}</TableHead>
                  <TableHead>{t.reports.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          {getReportIcon(report.type)}
                        </div>
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.recordsCount} {t.reports.totalKpiRecords.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getReportTypeBadge(report.type)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{report.period}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{t.reports.totalEmployees}: {report.totalEmployees || 0}</p>
                        <p>{t.reports.totalKpiRecords}: {report.recordsCount}</p>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportPDF(report)}
                          title={t.reports.exportPDF}
                        >
                          <Download className="w-4 h-4" />
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
    </div>
  );
}
