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
  Settings
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
    const completedKpis = kpiRecords.filter(r => r.status === 'completed').length;
    const inProgressKpis = kpiRecords.filter(r => r.status === 'in-progress').length;
    const overdueKpis = kpiRecords.filter(r => {
      const endDate = new Date(r.endDate);
      return endDate < today && r.status !== 'completed';
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
    <div className="h-full p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.dashboard.adminTitle}</h1>
          <p className="text-muted-foreground">{t.dashboard.adminSubtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-500" />
          <Badge className="bg-green-100 text-green-800">{t.dashboard.active}</Badge>
        </div>
      </div>

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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/employees">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                {t.dashboard.createEmployee}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t.dashboard.createEmployeeDesc}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/kpi-assignment">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                {t.dashboard.assignKpi}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t.dashboard.assignKpiDesc}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/kpi-tracking">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                {t.dashboard.trackProgress}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t.dashboard.trackProgressDesc}
              </p>
            </CardContent>
          </Card>
        </Link>

            <Link href="/admin/kpi-definitions">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    {t.dashboard.manageKpi}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t.dashboard.manageKpiDesc}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/evaluation">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" />
                    {t.dashboard.evaluateEmployee}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t.dashboard.evaluateEmployeeDesc}
                  </p>
                </CardContent>
              </Card>
            </Link>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            {t.dashboard.systemStatus}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-800">{t.dashboard.systemRunningNormal}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t.dashboard.allFunctionsReady}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
