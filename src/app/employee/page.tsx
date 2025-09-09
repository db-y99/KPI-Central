'use client';
import { useContext, useMemo } from 'react';
import { 
  Target, 
  Upload, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  User,
  TrendingUp,
  FileText,
  Award,
  CalendarDays,
  Activity
} from 'lucide-react';
import type { Kpi, KpiRecord } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import { startOfQuarter, isAfter } from 'date-fns';
import Link from 'next/link';

export default function EmployeeDashboardPage() {
  const { user } = useContext(AuthContext);
  const { kpis, kpiRecords } = useContext(DataContext);
  const { t } = useLanguage();

  // The layout will handle loading and redirection
  if (!user) {
    return null;
  }

  // Employee workflow statistics  
  const employeeStats = useMemo(() => {
    const today = new Date();
    const startOfCurrentQuarter = startOfQuarter(today);
    
    // Filter KPI records for this employee
    const userKpiRecords = kpiRecords.filter(r => {
      const isCurrentEmployee = r.employeeId === user.uid;
      const isCurrentPeriod = isAfter(new Date(r.endDate), startOfCurrentQuarter);
      return isCurrentEmployee && isCurrentPeriod;
    });

    const enrichedRecords = userKpiRecords.map(record => {
      const kpiDetails = kpis.find(k => k.id === record.kpiId);
      return { ...kpiDetails, ...record, employeeName: user.name };
    });

    // Real stats based on actual data
    const realStats = {
      // KPI stats from actual data
      kpis: {
        total: enrichedRecords.length,
        completed: enrichedRecords.filter(r => r.status === 'completed').length,
        inProgress: enrichedRecords.filter(r => r.status === 'in-progress').length,
        overdue: enrichedRecords.filter(r => {
          const endDate = new Date(r.endDate);
          const today = new Date();
          return endDate < today && r.status !== 'completed';
        }).length,
        completionRate: enrichedRecords.length > 0 ? 
          (enrichedRecords.filter(r => r.status === 'completed').length / enrichedRecords.length * 100) : 0,
      },
      // Report submission stats - to be integrated
      reports: {
        submittedThisMonth: 0, // Will be calculated from actual report data
        pendingApproval: 0,
        approved: 0,
        needsRevision: 0,
        nextDeadline: undefined, // Will be calculated from KPI deadlines
      },
      // Performance - to be calculated from real evaluation data
      performance: {
        currentScore: 0, // Will be calculated from actual evaluations
        rank: 0,
        totalEmployees: 0,
        lastEvaluation: undefined,
        expectedReward: 0, // Will be calculated from reward programs
      },
      records: enrichedRecords.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
    };

    return realStats;
  }, [kpiRecords, kpis, user.uid, user.name]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />{t.dashboard.completed}</Badge>;
      case 'in-progress':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{t.dashboard.inProgress}</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />{t.dashboard.overdue}</Badge>;
      default:
        return <Badge variant="outline">{t.dashboard.waiting}</Badge>;
    }
  };

  return (
    <div className="h-full p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.dashboard.employeeTitle}</h1>
          <p className="text-muted-foreground">
            {t.dashboard.employeeSubtitle.replace('{name}', user.name)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4" />
          <span>{t.dashboard.performance}: </span>
          <Badge className="status-info">
            {employeeStats.performance.currentScore}/100
          </Badge>
        </div>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="space-y-4">
        {employeeStats.reports.pendingApproval > 0 && (
          <Alert className="status-info">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>{t.dashboard.reportPendingApproval}:</strong> {t.dashboard.reportPendingDescription.replace('{count}', employeeStats.reports.pendingApproval.toString())}
            </AlertDescription>
          </Alert>
        )}
        
        {employeeStats.kpis.overdue > 0 && (
          <Alert className="status-error">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{t.dashboard.kpiOverdue}:</strong> {t.dashboard.kpiOverdueDescription.replace('{count}', employeeStats.kpis.overdue.toString())}
            </AlertDescription>
          </Alert>
        )}

        {employeeStats.reports.nextDeadline && (
          <Alert>
            <CalendarDays className="h-4 w-4" />
            <AlertDescription>
              <strong>{t.dashboard.upcomingDeadline}:</strong> {t.dashboard.nextReportDeadline.replace('{date}', employeeStats.reports.nextDeadline?.toLocaleDateString('vi-VN') || '')}
              <Link href="/employee/reports" className="ml-2">
                <Button size="sm" variant="outline">{t.dashboard.submitReport}</Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Workflow Progress Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* KPI Progress */}
        <Card className="card-modern">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {t.dashboard.myKpis}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-primary">{employeeStats.kpis.completed}</p>
                <p className="text-sm text-muted-foreground">{t.dashboard.completed}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{employeeStats.kpis.inProgress}</p>
                <p className="text-sm text-muted-foreground">{t.dashboard.inProgress}</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{t.dashboard.progress}</span>
                <span>{employeeStats.kpis.completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={employeeStats.kpis.completionRate} className="h-2" />
            </div>
            <Link href="/employee/profile">
              <Button variant="outline" className="w-full" size="sm">
                {t.dashboard.viewDetails}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Report Submission */}
        <Card className="card-modern">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-600" />
              {t.dashboard.reportSubmission}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t.dashboard.submittedThisMonth}:</span>
                <span className="font-medium">{employeeStats.reports.submittedThisMonth}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t.dashboard.approved}:</span>
                <span className="font-medium text-primary">{employeeStats.reports.approved}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t.dashboard.pendingApproval}:</span>
                <span className="font-medium text-primary">{employeeStats.reports.pendingApproval}</span>
              </div>
            </div>
            <Link href="/employee/reports">
              <Button className="w-full" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                {t.dashboard.submitNewReport}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t.dashboard.performance}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {employeeStats.performance.currentScore}
              </p>
              <p className="text-sm text-muted-foreground">/ 100 {t.dashboard.points}</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t.dashboard.ranking}:</span>
                <span className="font-medium">{employeeStats.performance.rank}/{employeeStats.performance.totalEmployees}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.dashboard.lastEvaluation}:</span>
                <span className="text-muted-foreground">
                  {employeeStats.performance.lastEvaluation?.toLocaleDateString('vi-VN') || t.dashboard.notAvailable}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expected Reward */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              {t.dashboard.expectedReward}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {employeeStats.performance.expectedReward.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-sm text-muted-foreground">{t.dashboard.thisPeriod}</p>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              <p>* {t.dashboard.basedOnCurrentPerformance}</p>
              <p>* {t.dashboard.mayChangeByEndOfPeriod}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {t.dashboard.currentKpis}
          </CardTitle>
          <CardDescription>
            {t.dashboard.currentKpisDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employeeStats.records.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                {t.dashboard.noKpisThisPeriod}
              </p>
              <p className="text-sm text-muted-foreground">
                {t.dashboard.contactManager}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {employeeStats.records.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{record.name}</h4>
                      {getStatusBadge(record.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="font-medium">{record.actual || 0}</span>
                        <span className="text-muted-foreground">/{record.target} {record.unit}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {t.dashboard.deadline}: {new Date(record.endDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress 
                        value={record.target > 0 ? ((record.actual || 0) / record.target * 100) : 0} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.quickActions}</CardTitle>
          <CardDescription>
            {t.dashboard.quickActionsDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/employee/reports">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Upload className="w-6 h-6" />
                <span>{t.dashboard.submitReport}</span>
              </Button>
            </Link>
            <Link href="/employee/profile">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <User className="w-6 h-6" />
                <span>{t.dashboard.viewProfile}</span>
              </Button>
            </Link>
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2" disabled>
              <FileText className="w-6 h-6" />
              <span>{t.dashboard.comprehensiveReport}</span>
            </Button>
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2" disabled>
              <Award className="w-6 h-6" />
              <span>{t.dashboard.rewardHistory}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
