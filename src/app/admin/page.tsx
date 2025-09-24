'use client';
import { useContext, useMemo } from 'react';
import {
  Target,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Plus,
  Eye,
  UserCheck,
  Settings,
  BarChart3,
  Gift
} from 'lucide-react';
import type { Kpi, KpiRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import Link from 'next/link';


export default function AdminDashboardPage() {
  const { kpis, kpiRecords, employees, departments } = useContext(DataContext);
  const { t } = useLanguage();

  // Simple statistics for core functions
  const stats = useMemo(() => {
    const today = new Date();
    const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

    // Basic KPI statistics
    const totalKpis = kpiRecords.length;
    const completedKpis = kpiRecords.filter(r => r.status === 'approved').length;
    const inProgressKpis = kpiRecords.filter(r => r.status === 'awaiting_approval').length;
    const overdueKpis = kpiRecords.filter(r => {
      const endDate = new Date(r.endDate);
      return endDate < today && r.status !== 'approved';
    }).length;

    // Completion rate
    const completionRate = totalKpis > 0 ? (completedKpis / totalKpis * 100) : 0;

    // Employee statistics
    const employeesWithKpis = new Set(kpiRecords.map(r => r.employeeId)).size;

    return {
      employees: {
        total: nonAdminEmployees.length,
        withKpis: employeesWithKpis,
        withoutKpis: nonAdminEmployees.length - employeesWithKpis,
      },
      kpis: {
        total: totalKpis,
        completed: completedKpis,
        inProgress: inProgressKpis,
        overdue: overdueKpis,
        completionRate: completionRate,
      },
      departments: departments.length,
    };
  }, [kpis, kpiRecords, employees, departments]);

  return (
    <div className="h-full p-4 md:p-6 lg:p-8 space-y-6">

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Tổng nhân viên */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              {t.nav.employees}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employees.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.employees.withKpis} {t.dashboard.withKpis}, {stats.employees.withoutKpis} {t.dashboard.withoutKpis}
            </p>
          </CardContent>
        </Card>

        {/* Tổng KPI */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              {t.nav.kpis}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kpis.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.kpis.completed} {t.dashboard.completed}, {stats.kpis.inProgress} {t.dashboard.inProgress}
            </p>
          </CardContent>
        </Card>

        {/* Tỷ lệ hoàn thành */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              {t.dashboard.completionRate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.kpis.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.kpis.completed} {t.dashboard.completed} / {stats.kpis.total} {t.dashboard.totalKpis}
            </p>
            <Progress value={stats.kpis.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        {/* KPI quá hạn */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              {t.dashboard.overdue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.kpis.overdue}</div>
            <p className="text-xs text-muted-foreground">{t.dashboard.needsEarlyProcessing}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Cập nhật theo cấu trúc mới */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <Link href="/admin/kpi-management">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                KPI Management
              </CardTitle>
            </CardHeader>
            <CardContent>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/hr-management">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                HR Management
              </CardTitle>
            </CardHeader>
            <CardContent>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/evaluation-reports">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Evaluation & Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/reward-system">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Reward System
              </CardTitle>
            </CardHeader>
            <CardContent>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/system-settings">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            {t.dashboard.recentActivities}
          </CardTitle>
          <CardDescription>
            {t.dashboard.latestSystemActivities}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Recent KPI Updates */}
            {kpiRecords
              .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
              .slice(0, 5)
              .map((record) => {
                const employee = employees.find(e => e.id === record.employeeId);
                const kpi = kpis.find(k => k.id === record.kpiId);

                let activityText = '';
                let activityIcon = null;
                let activityColor = '';

                switch (record.status) {
                  case 'approved':
                    activityText = `${t.dashboard.completedKpiActivity} ${kpi?.name || 'Unknown KPI'}`;
                    activityIcon = <CheckCircle className="w-4 h-4" />;
                    activityColor = 'text-green-600';
                    break;
                  case 'awaiting_approval':
                    activityText = `${t.dashboard.startedKpiActivity} ${kpi?.name || 'Unknown KPI'}`;
                    activityIcon = <Target className="w-4 h-4" />;
                    activityColor = 'text-blue-600';
                    break;
                  case 'pending':
                    activityText = `${t.dashboard.assignedKpiActivity} ${kpi?.name || 'Unknown KPI'}`;
                    activityIcon = <Plus className="w-4 h-4" />;
                    activityColor = 'text-orange-600';
                    break;
                  default:
                    activityText = `${t.dashboard.updatedKpiActivity} ${kpi?.name || 'Unknown KPI'}`;
                    activityIcon = <Activity className="w-4 h-4" />;
                    activityColor = 'text-gray-600';
                }

                return (
                  <div key={record.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className={`mt-0.5 ${activityColor}`}>
                      {activityIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activityText}</p>
                      <p className="text-xs text-muted-foreground">
                        {employee?.name || 'Unknown Employee'} • {new Date(record.updatedAt || record.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                );
              })}

            {kpiRecords.length === 0 && (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t.dashboard.noRecentActivities}</p>
              </div>
            )}

            <div className="pt-2 border-t">
              <Button size="sm" className="w-full" variant="outline">
                {t.dashboard.viewAllActivities}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
