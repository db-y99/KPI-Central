'use client';
import KpiCard from '@/components/kpi-card';
import { kpis, kpiRecords, employees } from '@/lib/data';
import type { Kpi, KpiRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardPage() {
  const enrichedKpiRecords = kpiRecords.map(record => {
    const kpiDetails = kpis.find(k => k.id === record.kpiId);
    const employeeDetails = employees.find(e => e.id === record.employeeId);
    // Preserve record.id by spreading kpiDetails first, then record, ensuring record.id is the final one.
    return { ...kpiDetails, ...record, employeeName: employeeDetails?.name };
  });

  return (
    <div className="h-full p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bảng điều khiển Giám đốc</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {enrichedKpiRecords.map(record => (
          <KpiCard
            key={record.id}
            record={record as Kpi & KpiRecord & { employeeName?: string }}
            showEmployee
          />
        ))}
      </div>

      {enrichedKpiRecords.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chưa có KPI nào được giao</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Sử dụng trang "Giao KPI" để bắt đầu phân công công việc.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
