'use client';
import { useState, useContext, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift, 
  Search, 
  Star, 
  TrendingUp, 
  Users,
  Target,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  BarChart3,
  Download,
  FileText,
  Filter
} from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { usePDFExport } from '@/lib/pdf-export';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

export default function EvaluationReportsComponent() {
  const { employees, kpis, kpiRecords, departments } = useContext(DataContext);
  const { exportToPDF } = usePDFExport();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Evaluation state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [evaluationForm, setEvaluationForm] = useState({
    overallRating: 5,
    comments: '',
    recommendations: '',
    nextPeriodGoals: ''
  });

  // Reports state
  const [selectedReportType, setSelectedReportType] = useState<string>('overview');
  const [selectedReportDepartment, setSelectedReportDepartment] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Get unique periods from kpiRecords
  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(kpiRecords.map(record => record.period))];
    return uniquePeriods.sort();
  }, [kpiRecords]);

  // Create employee evaluations
  const employeeEvaluations = useMemo(() => {
    return nonAdminEmployees.map(employee => {
      const employeeKpis = kpiRecords.filter(record => record.employeeId === employee.uid);
      const department = departments.find(d => d.id === employee.departmentId);
      
      // Calculate overall performance
      const totalProgress = employeeKpis.reduce((sum, record) => {
        const progress = record.target > 0 ? ((record.actual || 0) / record.target * 100) : 0;
        return sum + progress;
      }, 0);
      
      const averageProgress = employeeKpis.length > 0 ? totalProgress / employeeKpis.length : 0;
      
      // Determine performance level
      let performanceLevel = 'Needs Improvement';
      let performanceColor = 'red';
      
      if (averageProgress >= 100) {
        performanceLevel = 'Exceeds Expectations';
        performanceColor = 'green';
      } else if (averageProgress >= 80) {
        performanceLevel = 'Meets Expectations';
        performanceColor = 'blue';
      } else if (averageProgress >= 60) {
        performanceLevel = 'Partially Meets';
        performanceColor = 'yellow';
      }

      return {
        ...employee,
        departmentName: department?.name || 'Unknown',
        kpiCount: employeeKpis.length,
        averageProgress,
        performanceLevel,
        performanceColor,
        completedKpis: employeeKpis.filter(r => r.status === 'approved').length,
        pendingKpis: employeeKpis.filter(r => r.status === 'pending' || r.status === 'awaiting_approval').length
      };
    });
  }, [nonAdminEmployees, kpiRecords, departments]);

  // Filter evaluations based on search and department
  const filteredEvaluations = useMemo(() => {
    return employeeEvaluations.filter(evaluation => {
      const matchesSearch = evaluation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           evaluation.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || evaluation.departmentId === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [employeeEvaluations, searchTerm, selectedDepartment]);

  // Generate report data based on filters
  const reportData = useMemo(() => {
    let filteredRecords = kpiRecords;
    
    if (selectedReportDepartment !== 'all') {
      const departmentEmployees = employees.filter(emp => emp.departmentId === selectedReportDepartment);
      const employeeIds = departmentEmployees.map(emp => emp.uid);
      filteredRecords = filteredRecords.filter(record => employeeIds.includes(record.employeeId));
    }
    
    if (selectedPeriod !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.period === selectedPeriod);
    }

    return filteredRecords;
  }, [kpiRecords, selectedReportDepartment, selectedPeriod, employees]);

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

  const getPerformanceBadge = (level: string, color: string) => {
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colorClasses[color as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800'}>
        <Star className="w-3 h-3 mr-1" />
        {level}
      </Badge>
    );
  };

  const handleEvaluateEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setEvaluationForm({
      overallRating: 5,
      comments: '',
      recommendations: '',
      nextPeriodGoals: ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveEvaluation = () => {
    if (selectedEmployee) {
      // Here you would typically save the evaluation to your data store
      console.log('Saving evaluation for:', selectedEmployee.name, evaluationForm);
      
      toast({
        title: t.common.success,
        description: `Evaluation saved for ${selectedEmployee.name}`,
      });
      
      setIsDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedEmployee(null);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

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
        title: t.common.success,
        description: "Report generated and downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: t.common.error,
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
            {t.nav.evaluateReward}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t.evaluation.evaluationReportsDescription}
          </p>
        </div>
        <Button 
          onClick={handleGenerateReport} 
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? t.common.generating : t.evaluation.generateReport}
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="evaluation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="evaluation" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            {t.evaluation.employeeEvaluation}
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {t.evaluation.reportsAnalytics}
          </TabsTrigger>
        </TabsList>

        {/* Evaluation Tab */}
        <TabsContent value="evaluation" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.evaluation.totalEmployees}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nonAdminEmployees.length}</div>
                <p className="text-xs text-muted-foreground">{t.evaluation.activeEmployees}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.evaluation.exceedsExpectations}</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {employeeEvaluations.filter(e => e.performanceLevel === 'Exceeds Expectations').length}
                </div>
                <p className="text-xs text-muted-foreground">{t.evaluation.topPerformers}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.evaluation.meetsExpectations}</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {employeeEvaluations.filter(e => e.performanceLevel === 'Meets Expectations').length}
                </div>
                <p className="text-xs text-muted-foreground">{t.evaluation.goodPerformers}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.evaluation.needsImprovement}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {employeeEvaluations.filter(e => e.performanceLevel === 'Needs Improvement').length}
                </div>
                <p className="text-xs text-muted-foreground">{t.evaluation.requireSupport}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t.evaluation.searchEmployees}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t.admin.selectDepartment} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.admin.allDepartments}</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t.evaluation.employeePerformance} ({filteredEvaluations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredEvaluations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t.evaluation.noEmployeesFound}</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedDepartment !== 'all' 
                      ? t.evaluation.noEmployeesMatchFilter
                      : t.evaluation.noEmployeesAvailable}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.admin.employee}</TableHead>
                      <TableHead>{t.admin.department}</TableHead>
                      <TableHead>KPIs</TableHead>
                      <TableHead>{t.evaluation.performance}</TableHead>
                      <TableHead>{t.evaluation.overallRating}</TableHead>
                      <TableHead>{t.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvaluations.map((evaluation) => (
                      <TableRow key={evaluation.uid}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={evaluation.avatar} />
                              <AvatarFallback>
                                {evaluation.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{evaluation.name}</p>
                              <p className="text-sm text-muted-foreground">{evaluation.position}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{evaluation.departmentName}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              <span>{evaluation.completedKpis} {t.evaluation.completed}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-3 h-3 text-orange-500" />
                              <span>{evaluation.pendingKpis} {t.evaluation.pending}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {getPerformanceBadge(evaluation.performanceLevel, evaluation.performanceColor)}
                            <div className="text-sm">
                              <span className="font-medium">{evaluation.averageProgress.toFixed(1)}%</span>
                              <span className="text-muted-foreground"> {t.evaluation.average}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getRatingStars(5)} {/* Default rating, would come from evaluation data */}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEvaluateEmployee(evaluation)}
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            {t.evaluation.evaluate}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Report Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                {t.evaluation.reportFilters}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="report-type">{t.evaluation.reportType}</Label>
                  <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.evaluation.selectReportType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">{t.evaluation.overviewReport}</SelectItem>
                      <SelectItem value="department">{t.evaluation.departmentReport}</SelectItem>
                      <SelectItem value="employee">{t.evaluation.employeeReport}</SelectItem>
                      <SelectItem value="kpi">{t.evaluation.kpiPerformanceReport}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department">{t.admin.department}</Label>
                  <Select value={selectedReportDepartment} onValueChange={setSelectedReportDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.admin.selectDepartment} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.admin.allDepartments}</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="period">{t.admin.period}</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.admin.selectPeriod} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.admin.allPeriods}</SelectItem>
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
                {t.evaluation.reportPreview}
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
                <CardTitle className="text-sm font-medium">{t.evaluation.totalEmployees}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nonAdminEmployees.length}</div>
                <p className="text-xs text-muted-foreground">{t.evaluation.activeEmployees}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.evaluation.totalKpis}</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.length}</div>
                <p className="text-xs text-muted-foreground">{t.evaluation.kpiDefinitions}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.evaluation.totalRecords}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiRecords.length}</div>
                <p className="text-xs text-muted-foreground">{t.evaluation.kpiRecords}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.evaluation.departments}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departments.length}</div>
                <p className="text-xs text-muted-foreground">{t.evaluation.activeDepartments}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Evaluation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              {t.evaluation.employeeEvaluation} - {selectedEmployee?.name}
            </DialogTitle>
            <DialogDescription>
              {t.evaluation.evaluationDialogDescription}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Employee Info Section */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedEmployee.avatar} />
                  <AvatarFallback className="text-lg">
                    {selectedEmployee.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.position}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedEmployee.departmentName}</Badge>
                    {getPerformanceBadge(selectedEmployee.performanceLevel, selectedEmployee.performanceColor)}
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{selectedEmployee.kpiCount}</p>
                  <p className="text-sm text-muted-foreground">{t.evaluation.totalKpis}</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{selectedEmployee.completedKpis}</p>
                  <p className="text-sm text-muted-foreground">{t.evaluation.completed}</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{selectedEmployee.averageProgress.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">{t.evaluation.averageProgress}</p>
                </div>
              </div>

              {/* Evaluation Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rating">{t.evaluation.overallRating}</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {getRatingStars(evaluationForm.overallRating)}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {evaluationForm.overallRating}/5
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={evaluationForm.overallRating === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEvaluationForm(prev => ({ ...prev, overallRating: rating }))}
                        className="w-8 h-8 p-0"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="comments">{t.evaluation.performanceComments}</Label>
                  <Textarea
                    id="comments"
                    value={evaluationForm.comments}
                    onChange={(e) => setEvaluationForm(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder={t.evaluation.performanceCommentsPlaceholder}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="recommendations">{t.evaluation.recommendations}</Label>
                  <Textarea
                    id="recommendations"
                    value={evaluationForm.recommendations}
                    onChange={(e) => setEvaluationForm(prev => ({ ...prev, recommendations: e.target.value }))}
                    placeholder={t.evaluation.recommendationsPlaceholder}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="goals">{t.evaluation.nextPeriodGoals}</Label>
                  <Textarea
                    id="goals"
                    value={evaluationForm.nextPeriodGoals}
                    onChange={(e) => setEvaluationForm(prev => ({ ...prev, nextPeriodGoals: e.target.value }))}
                    placeholder={t.evaluation.nextPeriodGoalsPlaceholder}
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={closeDialog}
                  variant="outline"
                  className="flex-1"
                >
                  {t.common.cancel}
                </Button>
                <Button
                  onClick={handleSaveEvaluation}
                  className="flex-1"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  {t.evaluation.saveEvaluation}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
