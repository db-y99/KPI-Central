'use client';
import { useContext } from 'react';
import type { Kpi, KpiRecord } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';
import KpiListRow from '@/components/kpi-list-row';
import KpiCard from '@/components/kpi-card';

export default function EmployeeDashboardPage() {
  const { user } = useContext(AuthContext);
  const { kpis, kpiRecords, view } = useContext(DataContext);

  // The layout will handle loading and redirection
  if (!user) {
    return null;
  }

  const userKpiRecords = kpiRecords.filter(r => r.employeeId === user.id);

  const enrichedKpiRecords = userKpiRecords.map(record => {
    const kpiDetails = kpis.find(k => k.id === record.kpiId);
    // Preserve record.id by spreading kpiDetails first, then record, ensuring record.id is the final one.
    return { ...kpiDetails, ...record, employeeName: user.name };
  });

  return (
    <div className="h-full p-6 md:p-8">
      {enrichedKpiRecords.length === 0 ? (
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
      ) : view === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {enrichedKpiRecords.map(record => (
            <KpiCard
              key={record.id}
              record={record as Kpi & KpiRecord}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>KPI của bạn</CardTitle>
            <CardDescription>
              Theo dõi và cập nhật tiến độ công việc của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">Tên KPI</TableHead>
                  <TableHead className="w-[30%]">Tiến độ</TableHead>
                  <TableHead className="text-right">Hoàn thành</TableHead>
                  <TableHead className="text-right w-[150px]">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedKpiRecords.map(record => (
                  <KpiListRow
                    key={record.id}
                    record={record as Kpi & KpiRecord}
                    isEmployeeView={true}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
