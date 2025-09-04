'use client';
import { useContext } from 'react';
import KpiCard from '@/components/kpi-card';
import type { Kpi, KpiRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';

export default function EmployeeDashboardPage() {
  const { user } = useContext(AuthContext);
  const { kpis, kpiRecords } = useContext(DataContext);

  // The layout will handle loading and redirection
  if (!user) {
    return null;
  }

  const userKpiRecords = kpiRecords.filter(r => r.employeeId === user.id);

  const enrichedKpiRecords = userKpiRecords.map(record => {
    const kpiDetails = kpis.find(k => k.id === record.kpiId);
     // Preserve record.id by spreading kpiDetails first, then record, ensuring record.id is the final one.
    return { ...kpiDetails, ...record };
  });

  return (
    <div className="h-full p-6 md:p-8">
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
