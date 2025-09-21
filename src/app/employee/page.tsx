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

  // Simple KPI statistics for this employee
  const employeeStats = useMemo(() => {
    const today = new Date();

    // Filter KPI records for this employee
    const userKpiRecords = kpiRecords.filter(r => r.employeeId === user.uid);

    const enrichedRecords = userKpiRecords.map(record => {
      const kpiDetails = kpis.find(k => k.id === record.kpiId);
      return { ...kpiDetails, ...record };
    });

    // Basic stats
    const totalKpis = enrichedRecords.length;
    const completedKpis = enrichedRecords.filter(r => r.status === 'approved').length;
    const inProgressKpis = enrichedRecords.filter(r => r.status === 'awaiting_approval').length;
    const pendingKpis = enrichedRecords.filter(r => r.status === 'pending').length;
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
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Hoàn thành</Badge>;
      case 'awaiting_approval':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Chờ bắt đầu</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Bị từ chối</Badge>;
      default:
        return <Badge variant="outline">Chờ bắt đầu</Badge>;
    }
  };

  return (
    <div className="h-full p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chào mừng, {user.name}!</h1>
          <p className="text-muted-foreground">Dashboard KPI cá nhân</p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-500" />
          <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              Tổng KPI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeStats.kpis.total}</div>
            <p className="text-xs text-muted-foreground">
              KPI được giao
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{employeeStats.kpis.completed}</div>
            <p className="text-xs text-muted-foreground">
              Đã hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              Chờ duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{employeeStats.kpis.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Đang chờ admin duyệt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Chờ bắt đầu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{employeeStats.kpis.pending}</div>
            <p className="text-xs text-muted-foreground">
              KPI mới được giao
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Tỷ lệ hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {employeeStats.kpis.completionRate.toFixed(1)}%
            </div>
            <Progress value={employeeStats.kpis.completionRate} className="mt-2" />
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
                    Có {employeeStats.kpis.overdue} KPI quá hạn!
                  </p>
                  <p className="text-sm text-red-600">
                    Cần cập nhật tiến độ gấp để tránh bị đánh giá thấp
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
                    Deadline sắp đến: {employeeStats.nextDeadline.toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-sm text-orange-600">
                    Hãy cập nhật tiến độ trước khi quá hạn
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
            KPI của tôi
          </CardTitle>
          <CardDescription>
            Danh sách KPI được giao và tiến độ thực hiện
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employeeStats.records.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Chưa có KPI nào được giao
              </p>
              <p className="text-sm text-muted-foreground">
                Liên hệ quản lý để được giao KPI
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
                      Hạn: {new Date(record.endDate).toLocaleDateString('vi-VN')}
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
            <CardTitle className="text-base">Cập nhật KPI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Cập nhật tiến độ thực hiện các KPI được giao
            </p>
            <Link href="/employee/profile">
              <Button className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Cập nhật tiến độ
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Xem thông tin cá nhân và lịch sử KPI
            </p>
            <Link href="/employee/profile">
              <Button variant="outline" className="w-full">
                <User className="w-4 h-4 mr-2" />
                Xem hồ sơ
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
