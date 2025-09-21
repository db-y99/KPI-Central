'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Calendar,
  Download,
  FileText,
  PieChart,
  LineChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  description: string;
  period: string;
  generatedAt: string;
  data: any;
}

export default function ReportsPage() {
  const { employees, kpis, kpiRecords, departments, rewardCalculations } = useContext(DataContext);
  const { exportToPDF } = usePDFExport();
  const { t } = useLanguage();
  const [selectedReportType, setSelectedReportType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Get unique periods
  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(kpiRecords.map(record => record.period))];
    return uniquePeriods.sort();
  }, [kpiRecords]);

  // Generate reports data - chỉ tạo báo cáo khi có dữ liệu thực
  const reports = useMemo(() => {
    const reports: ReportData[] = [];

    // Chỉ tạo báo cáo khi có dữ liệu thực từ database
    if (nonAdminEmployees.length > 0 && kpis.length > 0) {
      // Individual Performance Report
      reports.push({
        id: 'individual-performance',
        type: 'individual',
        title: t.reports.individualPerformanceReport,
        description: t.reports.performanceOverview,
        period: periods.length > 0 ? periods[periods.length - 1] : t.reports.noReportsYet,
        generatedAt: new Date().toISOString(),
        data: {
          totalEmployees: nonAdminEmployees.length,
          averageCompletion: kpiRecords.length > 0 ? 
            kpiRecords.reduce((sum, record) => sum + (record.actual / record.target * 100), 0) / kpiRecords.length : 0,
          topPerformers: nonAdminEmployees.slice(0, 5).map(emp => {
            const empRecords = kpiRecords.filter(record => record.employeeId === emp.id);
            const completion = empRecords.length > 0 ? 
              empRecords.reduce((sum, record) => sum + (record.actual / record.target * 100), 0) / empRecords.length : 0;
            return {
              name: emp.name,
              completion: completion
            };
          })
        }
      });

      // Department Performance Report
      if (departments.length > 0) {
        reports.push({
          id: 'department-performance',
          type: 'department',
          title: t.reports.departmentPerformanceReport,
          description: t.reports.departmentAverage,
          period: periods.length > 0 ? periods[periods.length - 1] : t.reports.noReportsYet,
          generatedAt: new Date().toISOString(),
          data: {
            departments: departments.map(dept => {
              const deptEmployees = nonAdminEmployees.filter(emp => emp.departmentId === dept.id);
              const deptRecords = kpiRecords.filter(record => 
                deptEmployees.some(emp => emp.id === record.employeeId)
              );
              const averageCompletion = deptRecords.length > 0 ? 
                deptRecords.reduce((sum, record) => sum + (record.actual / record.target * 100), 0) / deptRecords.length : 0;
              
              return {
                name: dept.name,
                employeeCount: deptEmployees.length,
                averageCompletion: averageCompletion
              };
            })
          }
        });
      }

      // KPI Specific Report
      reports.push({
        id: 'kpi-specific',
        type: 'kpi-specific',
        title: t.reports.kpiSpecificReportTab,
        description: t.reports.kpiSpecificReportTab,
        period: periods.length > 0 ? periods[periods.length - 1] : t.reports.noReportsYet,
        generatedAt: new Date().toISOString(),
        data: {
          kpis: kpis.map(kpi => {
            const kpiRecords_filtered = kpiRecords.filter(record => record.kpiId === kpi.id);
            const averageActual = kpiRecords_filtered.length > 0 ? 
              kpiRecords_filtered.reduce((sum, record) => sum + record.actual, 0) / kpiRecords_filtered.length : 0;
            const averageCompletion = kpiRecords_filtered.length > 0 ? 
              kpiRecords_filtered.reduce((sum, record) => sum + (record.actual / record.target * 100), 0) / kpiRecords_filtered.length : 0;
            
            return {
              name: kpi.name,
              target: kpi.target || 100,
              actual: averageActual,
              completion: averageCompletion
            };
          })
        }
      });

      // Company Wide Report
      reports.push({
        id: 'company-wide',
        type: 'company-wide',
        title: t.reports.companyOverview,
        description: t.reports.companyOverview,
        period: periods.length > 0 ? periods[periods.length - 1] : t.reports.noReportsYet,
        generatedAt: new Date().toISOString(),
        data: {
          totalEmployees: nonAdminEmployees.length,
          totalKPIs: kpis.length,
          averageCompletion: kpiRecords.length > 0 ? 
            kpiRecords.reduce((sum, record) => sum + (record.actual / record.target * 100), 0) / kpiRecords.length : 0,
          totalRewards: rewardCalculations.reduce((sum, calc) => sum + calc.totalReward, 0),
          totalPenalties: rewardCalculations.reduce((sum, calc) => sum + calc.totalPenalty, 0)
        }
      });
    }

    return reports;
  }, [nonAdminEmployees, departments, kpis, kpiRecords, rewardCalculations, periods]);

  // Filter reports based on selections
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const typeMatch = selectedReportType === 'all' || report.type === selectedReportType;
      const periodMatch = selectedPeriod === 'all' || report.period === selectedPeriod;
      return typeMatch && periodMatch;
    });
  }, [reports, selectedReportType, selectedPeriod]);

  const handleGenerateReport = (reportType: string) => {
    // Here you would typically generate a new report
    console.log('Generating report:', reportType);
  };

  const handleExportPDF = async (reportId: string, reportTitle: string) => {
    try {
      await exportToPDF(
        `report-${reportId}`,
        `${reportTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        reportTitle,
        {
          includeHeader: true,
          includeFooter: true,
          includePageNumbers: true,
          orientation: 'portrait'
        }
      );
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'individual':
        return <Users className="w-5 h-5" />;
      case 'department':
        return <BarChart3 className="w-5 h-5" />;
      case 'kpi-specific':
        return <Target className="w-5 h-5" />;
      case 'company-wide':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getReportTypeBadge = (type: string) => {
    switch (type) {
      case 'individual':
        return <Badge className="bg-blue-100 text-blue-800">{t.reports.individualType}</Badge>;
      case 'department':
        return <Badge className="bg-green-100 text-green-800">{t.reports.departmentType}</Badge>;
      case 'kpi-specific':
        return <Badge className="bg-purple-100 text-purple-800">{t.reports.kpiSpecificType}</Badge>;
      case 'company-wide':
        return <Badge className="bg-orange-100 text-orange-800">{t.reports.companyWideType}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{t.reports.other}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.reports.title}</h1>
          <p className="text-muted-foreground">{t.reports.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <LanguageSwitcher />
          <Button onClick={() => handleGenerateReport('all')} className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {t.reports.generateNewReport}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
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
              {reports.filter(r => r.type === 'individual').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.reports.individualReports}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.type === 'department').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.reports.departmentReports}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">
              {reports.filter(r => r.type === 'kpi-specific').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.reports.kpiReports}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t.reports.reportType}</span>
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
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t.reports.period}</span>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t.reports.selectPeriod} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.reports.allPeriods}</SelectItem>
                  {periods.map(period => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.reports.noReportsYet}</h3>
              <p className="text-muted-foreground mb-4">
                {t.reports.noReportsDescription}
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• {t.reports.addEmployees} <a href="/admin/employees" className="text-blue-600 hover:underline">{t.reports.employeeManagement}</a></p>
                <p>• {t.reports.defineKpis} <a href="/admin/kpi-definitions" className="text-blue-600 hover:underline">{t.reports.kpiDefinitions}</a></p>
                <p>• {t.reports.assignKpis} <a href="/admin/kpi-assignment" className="text-blue-600 hover:underline">{t.reports.kpiAssignment}</a></p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    {getReportIcon(report.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </div>
                {getReportTypeBadge(report.type)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t.reports.periodLabel}</span>
                  <span className="font-medium">{report.period}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t.reports.generatedAt}</span>
                  <span className="font-medium">
                    {new Date(report.generatedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {/* Report specific data preview */}
                {report.type === 'individual' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t.reports.totalEmployees}:</span>
                      <span className="font-medium">{report.data.totalEmployees}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t.reports.averageCompletion}:</span>
                      <span className="font-medium">{report.data.averageCompletion.toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                {report.type === 'department' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t.reports.departmentCount}:</span>
                      <span className="font-medium">{report.data.departments.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t.reports.averageCompletion}:</span>
                      <span className="font-medium">
                        {(report.data.departments.reduce((sum: number, dept: any) => sum + dept.averageCompletion, 0) / report.data.departments.length).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                {report.type === 'kpi-specific' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t.reports.totalKpis}:</span>
                      <span className="font-medium">{report.data.kpis.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t.reports.averageCompletion}:</span>
                      <span className="font-medium">
                        {(report.data.kpis.reduce((sum: number, kpi: any) => sum + kpi.completion, 0) / report.data.kpis.length).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                {report.type === 'company-wide' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t.reports.totalEmployees}:</span>
                      <span className="font-medium">{report.data.totalEmployees}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t.reports.totalKpis}:</span>
                      <span className="font-medium">{report.data.totalKPIs}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleExportPDF(report.id, report.title)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t.reports.exportPDF}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateReport(report.type)}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Quick Actions - chỉ hiển thị khi có dữ liệu */}
      {filteredReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.reports.quickReportGeneration}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => handleGenerateReport('individual')}
              >
                <Users className="w-6 h-6" />
                <span>{t.reports.individualReport}</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => handleGenerateReport('department')}
              >
                <BarChart3 className="w-6 h-6" />
                <span>{t.reports.departmentReport}</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => handleGenerateReport('kpi-specific')}
              >
                <Target className="w-6 h-6" />
                <span>{t.reports.kpiReport}</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => handleGenerateReport('company-wide')}
              >
                <TrendingUp className="w-6 h-6" />
                <span>{t.reports.companyOverview}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
