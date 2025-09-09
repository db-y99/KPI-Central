'use client';
import { useContext, useMemo } from 'react';
import { 
  Target, 
  Users, 
  Building, 
  CheckCircle, 
  Clock, 
  Settings,
  FileCheck,
  TrendingUp,
  Gift,
  BarChart2,
  Award,
  AlertTriangle,
  Activity
} from 'lucide-react';
import type { Kpi, KpiRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import { startOfQuarter, isAfter } from 'date-fns';
import Link from 'next/link';


export default function AdminDashboardPage() {
  const { kpis, kpiRecords, employees, departments } = useContext(DataContext);
  const { t } = useLanguage();

  // Real workflow tracking statistics
  const workflowStats = useMemo(() => {
    const today = new Date();
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Calculate overdue KPIs
    const overdueKpis = kpiRecords.filter(r => {
      const endDate = new Date(r.endDate);
      return endDate < today && r.status !== 'completed';
    }).length;

    // Calculate KPIs expiring soon (within 7 days)
    const expiringSoonKpis = kpiRecords.filter(r => {
      const endDate = new Date(r.endDate);
      return endDate <= sevenDaysFromNow && endDate > today && r.status !== 'completed';
    }).length;

    // Calculate employees ready for evaluation (completed KPIs) - exclude administrators
    const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');
    const employeesWithCompletedKpis = new Set(
      kpiRecords
        .filter(r => r.status === 'completed')
        .map(r => r.employeeId)
        .filter(empId => nonAdminEmployees.some(emp => emp.uid === empId || emp.id === empId))
    ).size;

    const realStats = {
      // Setup statistics
      setup: {
        totalDepartments: departments.length,
        totalKpis: kpis.length,
        totalEmployees: employees.length,
        setupCompletion: departments.length > 0 && kpis.length > 0 && employees.length > 0 ? 
          Math.min(100, (departments.length + kpis.length + employees.length) * 10) : 0,
      },
      // Report statistics - to be integrated with actual report system
      reports: {
        totalSubmitted: 0, // Will be calculated from actual report data
        pendingApproval: 0,
        approved: 0,
        rejected: 0,
        needsRevision: 0,
        approvalRate: 0, // Will be calculated when report system is integrated
      },
      // KPI tracking statistics
      tracking: {
        totalKpis: kpiRecords.length,
        completed: kpiRecords.filter(r => r.status === 'completed').length,
        inProgress: kpiRecords.filter(r => r.status === 'in-progress').length,
        overdue: overdueKpis,
        expiringSoon: expiringSoonKpis,
        completionRate: kpiRecords.length > 0 ? 
          (kpiRecords.filter(r => r.status === 'completed').length / kpiRecords.length * 100) : 0,
      },
      // Evaluation statistics - to be calculated from real evaluation data (exclude administrators)
      evaluation: {
        totalEvaluated: 0, // Will be calculated from actual evaluations
        pending: nonAdminEmployees.length, // Only non-admin employees are pending until evaluated
        averageScore: 0,
        rewardEligible: employeesWithCompletedKpis,
        penaltyApplied: 0,
      },
      // Priority tasks data
      priorityTasks: {
        pendingReports: 0, // Will be calculated when report system is integrated
        expiringKpis: expiringSoonKpis,
        evaluationReady: employeesWithCompletedKpis,
        hasOverdueReports: false, // Will be calculated when report system is integrated
      }
    };

    return realStats;
  }, [kpis, kpiRecords, employees, departments]);

  return (
    <div className="h-full p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 text-xs">
          <Activity className="w-3 h-3" />
          <span className="font-medium">{t.dashboard.status}: </span>
          <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5">{t.dashboard.active}</Badge>
        </div>
      </div>


      {/* Main Workflow Statistics - Compact Design */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Cấu hình */}
        <Card className="card-modern rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Settings className="w-4 h-4 text-primary" />
                </div>
                {t.dashboard.configuration}
              </CardTitle>
              <Link href="/admin/setup">
                <Button variant="outline" size="sm" className="h-7 px-3 text-xs rounded-full">{t.dashboard.manage}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xl font-bold">{workflowStats.setup.totalDepartments}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.departments}</p>
              </div>
              <div>
                <p className="text-xl font-bold">{workflowStats.setup.totalKpis}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.kpis}</p>
              </div>
            </div>
            <div className="h-5"></div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>{t.dashboard.setupComplete}</span>
                <span>{workflowStats.setup.setupCompletion}%</span>
              </div>
              <Progress value={workflowStats.setup.setupCompletion} className="h-1.5 rounded-full" />
            </div>
          </CardContent>
        </Card>

        {/* Duyệt báo cáo */}
        <Card className="card-modern rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-full">
                  <FileCheck className="w-4 h-4 text-green-600" />
                </div>
                {t.dashboard.reportApproval}
              </CardTitle>
              <Link href="/admin/approval">
                <Button variant="outline" size="sm" className="h-7 px-3 text-xs rounded-full">
                  {t.dashboard.approve} ({workflowStats.reports.pendingApproval})
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>{t.dashboard.approved}: {workflowStats.reports.approved}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>{t.dashboard.pending}: {workflowStats.reports.pendingApproval}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span>{t.dashboard.rejected}: {workflowStats.reports.rejected}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>{t.dashboard.needsRevision}: {workflowStats.reports.needsRevision}</span>
              </div>
            </div>
            <div className="h-5"></div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>{t.dashboard.approvalRate}</span>
                <span>{workflowStats.reports.approvalRate}%</span>
              </div>
              <Progress value={workflowStats.reports.approvalRate} className="h-1.5 rounded-full" />
            </div>
          </CardContent>
        </Card>

        {/* Theo dõi KPI */}
        <Card className="card-modern rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-full">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                {t.dashboard.tracking}
              </CardTitle>
              <Link href="/admin/kpi-tracking">
                <Button variant="outline" size="sm" className="h-7 px-3 text-xs rounded-full">{t.dashboard.viewDetails}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xl font-bold text-green-600">{workflowStats.tracking.completed}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.completed}</p>
              </div>
              <div>
                <p className="text-xl font-bold text-orange-600">{workflowStats.tracking.inProgress}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.inProgress}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-red-600 mb-2">
              <AlertTriangle className="w-3 h-3" />
              <span>{workflowStats.tracking.overdue} {t.dashboard.kpiOverdue}</span>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>{t.dashboard.completed}</span>
                <span>{workflowStats.tracking.completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={workflowStats.tracking.completionRate} className="h-1.5 rounded-full" />
            </div>
          </CardContent>
        </Card>

        {/* Đánh giá */}
        <Card className="card-modern rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-orange-50 rounded-full">
                  <Gift className="w-4 h-4 text-orange-600" />
                </div>
                {t.dashboard.evaluation}
              </CardTitle>
              <Link href="/admin/evaluation">
                <Button variant="outline" size="sm" className="h-7 px-3 text-xs rounded-full">{t.dashboard.evaluate}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xl font-bold text-green-600">{workflowStats.evaluation.rewardEligible}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.rewarded}</p>
              </div>
              <div>
                <p className="text-xl font-bold text-red-600">{workflowStats.evaluation.penaltyApplied}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.penalized}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.dashboard.averageScore}</p>
              <p className="text-lg font-bold text-primary">{workflowStats.evaluation.averageScore}/100</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items - Compact */}
      <Card className="card-modern rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-base">{t.dashboard.priorityTasks}</CardTitle>
          <CardDescription className="text-sm">
            {t.dashboard.priorityTasksDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            {/* Reports Awaiting Approval - Only show if there are pending reports */}
            {workflowStats.priorityTasks.pendingReports > 0 && (
              <div className="flex items-center justify-between p-4 border rounded-2xl status-error shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-800 text-sm">
                      {workflowStats.priorityTasks.pendingReports} {t.dashboard.pendingReports}
                    </p>
                    <p className="text-xs text-red-600">
                      {workflowStats.priorityTasks.hasOverdueReports ? t.dashboard.hasOverdueReports : t.dashboard.needsEarlyProcessing}
                    </p>
                  </div>
                </div>
                <Link href="/admin/approval">
                  <Button className="btn-primary h-8 px-4 text-xs rounded-full">{t.dashboard.approveNow}</Button>
                </Link>
              </div>
            )}

            {/* KPIs About to Expire - Only show if there are expiring KPIs */}
            {workflowStats.priorityTasks.expiringKpis > 0 && (
              <div className="flex items-center justify-between p-4 border rounded-2xl status-warning shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 rounded-full">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-800 text-sm">
                      {workflowStats.priorityTasks.expiringKpis} {t.dashboard.expiringKpis}
                    </p>
                    <p className="text-xs text-yellow-600">{t.dashboard.remindEmployees}</p>
                  </div>
                </div>
                <Link href="/admin/kpi-tracking">
                  <Button className="btn-outline h-8 px-4 text-xs rounded-full">{t.dashboard.viewDetails}</Button>
                </Link>
              </div>
            )}

            {/* Ready for Evaluation - Only show if there are employees ready */}
            {workflowStats.priorityTasks.evaluationReady > 0 && (
              <div className="flex items-center justify-between p-4 border rounded-2xl status-info shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 text-sm">{t.dashboard.readyForEvaluation}</p>
                    <p className="text-xs text-blue-600">
                      {workflowStats.priorityTasks.evaluationReady} {t.dashboard.employeesEligible}
                    </p>
                  </div>
                </div>
                <Link href="/admin/evaluation">
                  <Button className="btn-outline h-8 px-4 text-xs rounded-full">{t.dashboard.startEvaluation}</Button>
                </Link>
              </div>
            )}

            {/* No Priority Tasks Message */}
            {workflowStats.priorityTasks.pendingReports === 0 && 
             workflowStats.priorityTasks.expiringKpis === 0 && 
             workflowStats.priorityTasks.evaluationReady === 0 && (
              <div className="flex items-center justify-center p-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <p className="text-sm text-muted-foreground">{t.dashboard.noPriorityTasks}</p>
                  <p className="text-xs text-muted-foreground">{t.dashboard.systemRunningNormal}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
