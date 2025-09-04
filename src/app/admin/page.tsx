'use client';
import { useContext } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import KpiCard from '@/components/kpi-card';
import KpiListRow from '@/components/kpi-list-row';
import type { Kpi, KpiRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataContext } from '@/context/data-context';

export default function AdminDashboardPage() {
  const { kpis, kpiRecords, employees, view } = useContext(DataContext);

  const enrichedKpiRecords = kpiRecords.map(record => {
    const kpiDetails = kpis.find(k => k.id === record.kpiId);
    const employeeDetails = employees.find(e => e.id === record.employeeId);
    // Preserve record.id by spreading kpiDetails first, then record, ensuring record.id is the final one.
    return { ...kpiDetails, ...record, employeeName: employeeDetails?.name };
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
              Sử dụng trang "Giao KPI" để bắt đầu phân công công việc.
            </p>
          </CardContent>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {enrichedKpiRecords.map(record => (
            <KpiCard
              key={record.id}
              record={record as Kpi & KpiRecord & { employeeName?: string }}
              showEmployee
            />
          ))}
        </div>
      ) : (
        <Card>
           <CardHeader>
            <CardTitle>Danh sách KPI nhân viên</CardTitle>
            <CardDescription>
              Theo dõi, phê duyệt và quản lý KPI của nhân viên.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%]">Nhân viên</TableHead>
                  <TableHead className="w-[25%]">Tên KPI</TableHead>
                  <TableHead className="w-[15%]">Trạng thái</TableHead>
                  <TableHead className="w-[20%]">Tiến độ</TableHead>
                  <TableHead className="text-right">Hoàn thành</TableHead>
                  <TableHead className="text-right w-[150px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedKpiRecords.map(record => (
                  <KpiListRow
                    key={record.id}
                    record={record as Kpi & KpiRecord & { employeeName?: string }}
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
