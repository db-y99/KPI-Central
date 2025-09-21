'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  Users,
  Star,
  CheckCircle2,
  AlertTriangle,
  Target,
  Trophy,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

interface EmployeeEvaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  avatar?: string;
  
  // KPI Performance
  totalKpis: number;
  completedKpis: number;
  completionRate: number; // %
  status: 'excellent' | 'good' | 'average' | 'needs_improvement';
}

export default function EvaluationPage() {
  const { employees, kpiRecords, departments } = useContext(DataContext);
  const { exportToPDF } = usePDFExport();
  const { t } = useLanguage();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Create employee evaluations
  const employeeEvaluations = useMemo(() => {
    return nonAdminEmployees.map(employee => {
      const employeeKpis = kpiRecords.filter(record => record.employeeId === employee.uid);
      const completedKpis = employeeKpis.filter(kpi => kpi.status === 'approved');
      const totalKpis = employeeKpis.length;
      const completedCount = completedKpis.length;

      // Calculate completion rate
      const completionRate = totalKpis > 0 ? (completedCount / totalKpis) * 100 : 0;

      // Get employee department
      const department = departments.find(d => d.id === employee.departmentId);

      return {
        id: employee.uid!,
        employeeId: employee.uid!,
        employeeName: employee.name,
        position: employee.position,
        department: department?.name || t.evaluation.department,
        avatar: employee.avatar,
        totalKpis,
        completedKpis: completedCount,
        completionRate,
        status: completionRate >= 80 ? 'excellent' :
                completionRate >= 60 ? 'good' :
                completionRate >= 40 ? 'average' : 'needs_improvement'
      };
    });
  }, [nonAdminEmployees, kpiRecords, departments]);

  // Filter employees based on department
  const filteredEvaluations = useMemo(() => {
    return employeeEvaluations.filter(emp => {
      if (selectedDepartment === 'all') return true;
      return emp.department === selectedDepartment;
    });
  }, [employeeEvaluations, selectedDepartment]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800"><Trophy className="w-3 h-3 mr-1" />{t.evaluation.excellent}</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800"><Star className="w-3 h-3 mr-1" />{t.evaluation.good}</Badge>;
      case 'average':
        return <Badge className="bg-yellow-100 text-yellow-800"><Target className="w-3 h-3 mr-1" />{t.evaluation.average}</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />{t.evaluation.needsImprovementStatus2}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(
        'evaluation-report',
        'bao-cao-danh-gia-nhan-vien.pdf',
        t.evaluation.title,
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

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.evaluation.title}</h1>
          <p className="text-muted-foreground">{t.evaluation.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button onClick={handleExportPDF} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t.evaluation.exportPDF}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{nonAdminEmployees.length}</div>
            <p className="text-xs text-muted-foreground">{t.evaluation.employeesToEvaluate}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {employeeEvaluations.filter(emp => emp.status === 'excellent').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.evaluation.excellentEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {employeeEvaluations.filter(emp => emp.status === 'good').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.evaluation.goodEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">
              {employeeEvaluations.filter(emp => emp.status === 'needs_improvement').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.evaluation.needsImprovementStatus2}</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{t.evaluation.filterByDepartment}</span>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.evaluation.selectDepartment} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.evaluation.allDepartments}</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Evaluations */}
      <div id="evaluation-report" className="space-y-4">
        {filteredEvaluations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t.evaluation.noEmployeesToEvaluate}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEvaluations.map((evaluation) => (
            <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{evaluation.employeeName}</h4>
                        <p className="text-sm text-muted-foreground">{evaluation.position}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t.evaluation.departmentField2}: {evaluation.department}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(evaluation.status)}
                      <span className="text-sm text-muted-foreground">
                        {t.evaluation.kpiCompleted}: {evaluation.completedKpis}/{evaluation.totalKpis}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getStatusColor(evaluation.status)}`}>
                      {evaluation.completionRate.toFixed(0)}%
                </div>
                    <p className="text-sm text-muted-foreground">{t.evaluation.completionRate}</p>
                  </div>
                </div>
                <Progress value={evaluation.completionRate} className="h-3" />
              </CardContent>
            </Card>
          ))
        )}
                  </div>
                  
      {/* Evaluation Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>{t.evaluation.evaluationCriteria}</CardTitle>
          <CardDescription>
            {t.evaluation.evaluationCriteriaDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-green-800">{t.evaluation.excellent}</h4>
              <p className="text-sm text-muted-foreground">{t.evaluation.excellentCriteria}</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-blue-800">{t.evaluation.good}</h4>
              <p className="text-sm text-muted-foreground">{t.evaluation.goodCriteria}</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="font-medium text-yellow-800">{t.evaluation.average}</h4>
              <p className="text-sm text-muted-foreground">{t.evaluation.averageCriteria}</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="font-medium text-red-800">{t.evaluation.needsImprovementStatus2}</h4>
              <p className="text-sm text-muted-foreground">{t.evaluation.needsImprovementCriteria}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}