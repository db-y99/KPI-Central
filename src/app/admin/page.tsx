'use client';
import { useContext } from 'react';
import KpiCard from '@/components/kpi-card';
import { kpis, kpiRecords } from '@/lib/data';
import type { Kpi, KpiRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthContext } from '@/context/auth-context';

export default function AdminDashboardPage() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return null; // Layout handles loading and redirection
  }

  const userKpiRecords = kpiRecords.filter(r => r.employeeId === user.id);

  const enrichedKpiRecords = userKpiRecords.map(record => {
    const kpiDetails = kpis.find(k => k.id === record.kpiId);
    return { ...record, ...kpiDetails };
  });

  return (
    <div className="h-full p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tổng quan của quản lý</h1>
        <p className="text-muted-foreground">
          Đây là các chỉ số KPI cá nhân của bạn, {user.name}.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enrichedKpiRecords.map(record => (
          <KpiCard key={record.id} record={record as Kpi & KpiRecord} />
        ))}
      </div>

      {enrichedKpiRecords.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chưa có KPI nào được giao</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Bạn chưa có KPI nào được giao trong kỳ này.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
