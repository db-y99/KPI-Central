'use client';
import { useState, useContext, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  Download, 
  Calendar,
  Users,
  Target,
  TrendingUp,
  FileText,
  Filter
} from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { usePDFExport } from '@/lib/pdf-export';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

export default function ReportsComponent() {
  const { employees, kpis, kpiRecords, departments } = useContext(DataContext);
  const { exportToPDF } = usePDFExport();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [selectedReportType, setSelectedReportType] = useState<string>('overview');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Get unique periods from kpiRecords
  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(kpiRecords.map(record => record.period))];
    return uniquePeriods.sort();
  }, [kpiRecords]);

  // Generate report data based on filters
  const reportData = useMemo(() => {
    let filteredRecords = kpiRecords;
    
    if (selectedDepartment !== 'all') {
      const departmentEmployees = employees.filter(emp => emp.departmentId === selectedDepartment);
      const employeeIds = departmentEmployees.map(emp => emp.uid);
      filteredRecords = filteredRecords.filter(record => employeeIds.includes(record.employeeId));
    }
    
    if (selectedPeriod !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.period === selectedPeriod);
    }

    return filteredRecords;
  }, [kpiRecords, selectedDepartment, selectedPeriod, employees]);

  // Calculate report statistics
  const reportStats = useMemo(() => {
    const totalRecords = reportData.length;
    const completedRecords = reportData.filter(r => r.status === 'approved').length;
    const pendingRecords = reportData.filter(r => r.status === 'pending' || r.status === 'awaiting_approval').length;
    const rejectedRecords = reportData.filter(r => r.status === 'rejected').length;
    
    const averageProgress = totalRecords > 0 
      ? reportData.reduce((sum, record) => {
          const progress = record.target > 0 ? ((record.actual || 0) / record.target * 100) : 0;
          return sum + progress;
        }, 0) / totalRecords
      : 0;

    return {
      totalRecords,
      completedRecords,
      pendingRecords,
      rejectedRecords,
      averageProgress,
      completionRate: totalRecords > 0 ? (completedRecords / totalRecords) * 100 : 0
    };
  }, [reportData]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      const reportTitle = `${selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} Report`;
      const fileName = `${selectedReportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      
      await exportToPDF(
        'reports-content',
        fileName,
        reportTitle,
        {
          includeHeader: true,
          includeFooter: true,
          includePageNumbers: true,
          orientation: 'portrait'
        }
      );
      
      toast({
        title: "Success",
        description: "Report generated and downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportContent = () => {
    switch (selectedReportType) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{reportStats.totalRecords}</div>
                  <p className="text-xs text-muted-foreground">Total Records</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-600">{reportStats.completedRecords}</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-orange-600">{reportStats.pendingRecords}</div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-red-600">{reportStats.rejectedRecords}</div>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Progress</span>
                    <span className="font-semibold">{reportStats.averageProgress.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completion Rate</span>
                    <span className="font-semibold">{reportStats.completionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'department':
        const departmentStats = departments.map(dept => {
          const deptEmployees = employees.filter(emp => emp.departmentId === dept.id);
          const deptRecords = reportData.filter(record => 
            deptEmployees.some(emp => emp.uid === record.employeeId)
          );
          const completed = deptRecords.filter(r => r.status === 'approved').length;
          
          return {
            name: dept.name,
            totalRecords: deptRecords.length,
            completedRecords: completed,
            completionRate: deptRecords.length > 0 ? (completed / deptRecords.length) * 100 : 0
          };
        });

        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Department Performance</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Total Records</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentStats.map((dept, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.totalRecords}</TableCell>
                    <TableCell>{dept.completedRecords}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${dept.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{dept.completionRate.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      
      case 'employee':
        const employeeStats = nonAdminEmployees.map(emp => {
          const empRecords = reportData.filter(record => record.employeeId === emp.uid);
          const completed = empRecords.filter(r => r.status === 'approved').length;
          const department = departments.find(d => d.id === emp.departmentId);
          
          return {
            name: emp.name,
            position: emp.position,
            department: department?.name || 'Unknown',
            totalRecords: empRecords.length,
            completedRecords: completed,
            completionRate: empRecords.length > 0 ? (completed / empRecords.length) * 100 : 0
          };
        });

        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Employee Performance</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Total Records</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeStats.map((emp, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.totalRecords}</TableCell>
                    <TableCell>{emp.completedRecords}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${emp.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{emp.completionRate.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      
      default:
        return <div>Select a report type to view content</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Generate comprehensive reports and analytics
          </p>
        </div>
        <Button 
          onClick={handleGenerateReport} 
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview Report</SelectItem>
                  <SelectItem value="department">Department Report</SelectItem>
                  <SelectItem value="employee">Employee Report</SelectItem>
                  <SelectItem value="kpi">KPI Performance Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="period">Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {periods.map((period, index) => (
                    <SelectItem key={period || `period-${index}`} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Report Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div id="reports-content">
            {getReportContent()}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nonAdminEmployees.length}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total KPIs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.length}</div>
            <p className="text-xs text-muted-foreground">KPI definitions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiRecords.length}</div>
            <p className="text-xs text-muted-foreground">KPI records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
