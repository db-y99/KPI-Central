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
import { KpiStatusService, KpiStatus } from '@/lib/kpi-status-service';

export default function EmployeeDashboardPage() {
  const { user, loading } = useContext(AuthContext);
  const { kpis, kpiRecords } = useContext(DataContext);
  const { t } = useLanguage();

  // Debug user state
  console.log('🔍 Employee Dashboard - user:', user);
  console.log('🔍 Employee Dashboard - loading:', loading);

  // The layout will handle loading and redirection
  if (!user) {
    console.log('❌ No user found, returning null');
    return null;
  }

  // Simple KPI statistics for this employee
  const employeeStats = useMemo(() => {
    const today = new Date();

    // Filter KPI records for this employee
    console.log('🔍 Debug - user.uid:', user.uid);
    console.log('🔍 Debug - user.id:', user.id);
    console.log('🔍 Debug - kpiRecords:', kpiRecords);
    const userKpiRecords = kpiRecords.filter(r => {
      const matches = r.employeeId === user.uid || r.employeeId === user.id;
      if (matches) {
        console.log('✅ Found matching record:', r);
      }
      return matches;
    });

    const enrichedRecords = userKpiRecords.map(record => {
      const kpiDetails = kpis.find(k => k.id === record.kpiId || k.documentId === record.kpiId);
      return { ...kpiDetails, ...record };
    });

    // Basic stats - Sử dụng trạng thái mới từ KPI Status Service
    const totalKpis = enrichedRecords.length;
    const completedKpis = enrichedRecords.filter(r => {
      try {
        return KpiStatusService.isCompletedStatus(r.status as KpiStatus);
      } catch {
        return r.status === 'approved';
      }
    }).length;
    const inProgressKpis = enrichedRecords.filter(r => {
      try {
        return KpiStatusService.isActiveStatus(r.status as KpiStatus);
      } catch {
        return ['in_progress', 'submitted', 'awaiting_approval'].includes(r.status);
      }
    }).length;
    const pendingKpis = enrichedRecords.filter(r => {
      try {
        return r.status === 'not_started';
      } catch {
        return r.status === 'not_started' || r.status === 'pending';
      }
    }).length;
    const overdueKpis = enrichedRecords.filter(r => {
      const endDate = new Date(r.endDate);
      return endDate < today && r.status !== 'approved';
    }).length;

    const completionRate = totalKpis > 0 ? (completedKpis / totalKpis * 100) : 0;

    // Find next deadline
    const upcomingDeadlines = enrichedRecords
      .filter(r => r.status !== 'approved')
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    const nextDeadline = upcomingDeadlines.length > 0 ? new Date(upcomingDeadlines[0].endDate) : null;

    return {
      kpis: {
        total: totalKpis,
        completed: completedKpis,
        inProgress: inProgressKpis,
        pending: pendingKpis,
        overdue: overdueKpis,
        completionRate: completionRate,
      },
      records: enrichedRecords.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()),
      nextDeadline: nextDeadline,
    };
  }, [kpiRecords, kpis, user.uid]);

  const getStatusBadge = (status: string) => {
    try {
      const statusConfig = KpiStatusService.getStatusConfig(status as KpiStatus);
      const IconComponent = status === 'approved' ? CheckCircle2 :
                           status === 'rejected' ? AlertTriangle :
                           Clock;

      return (
        <Badge className={`${statusConfig.color.replace('bg-', 'bg-').replace('-500', '-100')} text-${statusConfig.color.replace('bg-', '').replace('-500', '-800')}`}>
          <IconComponent className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>
      );
    } catch (error) {
      // Fallback cho trạng thái cũ
      switch (status) {
        case 'approved':
          return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />{t.employeeDashboard.completed}</Badge>;
        case 'submitted':
        case 'awaiting_approval':
          return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{t.employeeDashboard.awaitingApproval}</Badge>;
        case 'in_progress':
          return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Đang thực hiện</Badge>;
        case 'not_started':
        case 'pending':
          return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{t.employeeDashboard.waitingToStart}</Badge>;
        case 'rejected':
          return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />{t.employeeDashboard.rejected}</Badge>;
        default:
          return <Badge variant="outline">{t.employeeDashboard.waitingToStart}</Badge>;
      }
    }
  };

  return (
    <div className="h-full p-4 md:p-6 lg:p-8 space-y-6">

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{employeeStats.kpis.total}</div>
            <p className="text-xs text-muted-foreground">{t.employeeDashboard.totalKpis}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{employeeStats.kpis.completed}</div>
            <p className="text-xs text-muted-foreground">{t.employeeDashboard.completed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">{employeeStats.kpis.inProgress}</div>
            <p className="text-xs text-muted-foreground">{t.employeeDashboard.awaitingApproval}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {employeeStats.kpis.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{t.employeeDashboard.completionRate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        {employeeStats.kpis.overdue > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">
                    {t.employeeDashboard.overdueAlert.replace('{count}', employeeStats.kpis.overdue.toString())}
                  </p>
                  <p className="text-sm text-red-600">
                    {t.employeeDashboard.overdueDescription}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {employeeStats.nextDeadline && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">
                    {t.employeeDashboard.upcomingDeadline.replace('{date}', employeeStats.nextDeadline.toLocaleDateString('vi-VN'))}
                  </p>
                  <p className="text-sm text-orange-600">
                    {t.employeeDashboard.upcomingDescription}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Current KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {t.employeeDashboard.myKpis}
          </CardTitle>
          <CardDescription>
            {t.employeeDashboard.kpiListDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employeeStats.records.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                {t.employeeDashboard.noKpisAssigned}
              </p>
              <p className="text-sm text-muted-foreground">
                {t.employeeDashboard.noKpisDescription}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {employeeStats.records.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{record.name}</h4>
                    {getStatusBadge(record.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">
                        {record.actual || 0} / {record.target} {record.unit}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {t.employeeDashboard.deadline}: {new Date(record.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress
                      value={record.target > 0 ? ((record.actual || 0) / record.target * 100) : 0}
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.employeeDashboard.updateKpiTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t.employeeDashboard.updateKpiDescription}
            </p>
            <Link href="/employee/profile">
              <Button className="w-full">
                <Target className="w-4 h-4 mr-2" />
                {t.employeeDashboard.updateProgress}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.employeeDashboard.personalInfoTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t.employeeDashboard.personalInfoDescription}
            </p>
            <Link href="/employee/profile">
              <Button variant="outline" className="w-full">
                <User className="w-4 h-4 mr-2" />
                {t.employeeDashboard.viewProfile}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
