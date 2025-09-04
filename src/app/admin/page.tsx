'use client';
import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import KpiCard from '@/components/kpi-card';
import KpiListRow from '@/components/kpi-list-row';
import { kpis, kpiRecords, employees } from '@/lib/data';
import type { Kpi, KpiRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminDashboardPage() {
  const [view, setView] = useState('grid');

  const enrichedKpiRecords = kpiRecords.map(record => {
    const kpiDetails = kpis.find(k => k.id === record.kpiId);
    const employeeDetails = employees.find(e => e.id === record.employeeId);
    // Preserve record.id by spreading kpiDetails first, then record, ensuring record.id is the final one.
    return { ...kpiDetails, ...record, employeeName: employeeDetails?.name };
  });

  return (
    <div className="h-full p-6 md:p-8">
      <div className="mb-4 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">Nhân viên</TableHead>
                  <TableHead className="w-[30%]">Tên KPI</TableHead>
                  <TableHead className="w-[30%]">Tiến độ</TableHead>
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
