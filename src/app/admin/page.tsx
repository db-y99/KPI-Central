'use client';
import { useContext, useMemo } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import KpiCard from '@/components/kpi-card';
import KpiListRow from '@/components/kpi-list-row';
import type { Kpi, KpiRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataContext } from '@/context/data-context';
import { startOfQuarter, isAfter } from 'date-fns';


export default function AdminDashboardPage() {
  const { kpis, kpiRecords, employees, view } = useContext(DataContext);

  const enrichedKpiRecords = useMemo(() => {
    const today = new Date();
    const startOfCurrentQuarter = startOfQuarter(today);

    return kpiRecords
      .filter(record => {
        const endDate = new Date(record.endDate);
        // Show KPI if its end date is in the future or within the current quarter
        return isAfter(endDate, startOfCurrentQuarter) || endDate.getTime() === startOfCurrentQuarter.getTime();
      })
      .map(record => {
        const kpiDetails = kpis.find(k => k.id === record.kpiId);
        const employeeDetails = employees.find(e => e.id === record.employeeId);
        return { ...kpiDetails, ...record, employeeName: employeeDetails?.name };
      })
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  }, [kpiRecords, kpis, employees]);


  return (
    <div className="h-full p-6 md:p-8">
      {enrichedKpiRecords.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Chưa có KPI nào được giao trong kỳ này</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Sử dụng trang "Giao KPI" để bắt đầu phân công công việc. Các KPI từ các kỳ trước sẽ được lưu trữ trong trang Hồ sơ cá nhân của nhân viên.
            </p>
          </CardContent>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
            <CardTitle>Danh sách KPI nhân viên (Kỳ hiện tại)</CardTitle>
            <CardDescription>
              Theo dõi, phê duyệt và quản lý KPI của nhân viên trong quý này.
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
