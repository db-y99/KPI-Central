'use client';
import { useContext, useMemo } from 'react';
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
import { startOfQuarter, isAfter } from 'date-fns';

export default function EmployeeDashboardPage() {
  const { user } = useContext(AuthContext);
  const { kpis, kpiRecords, view } = useContext(DataContext);

  // The layout will handle loading and redirection
  if (!user) {
    return null;
  }

  const enrichedKpiRecords = useMemo(() => {
    const today = new Date();
    const startOfCurrentQuarter = startOfQuarter(today);
    
    const userKpiRecords = kpiRecords.filter(r => 
        r.employeeId === user.id &&
        isAfter(new Date(r.endDate), startOfCurrentQuarter)
    );

    return userKpiRecords
      .map(record => {
        const kpiDetails = kpis.find(k => k.id === record.kpiId);
        // Preserve record.id by spreading kpiDetails first, then record, ensuring record.id is the final one.
        return { ...kpiDetails, ...record, employeeName: user.name };
      })
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  }, [kpiRecords, kpis, user.id, user.name]);


  return (
    <div className="h-full p-6 md:p-8">
      {enrichedKpiRecords.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Bạn không có KPI nào trong kỳ này</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Các KPI đã hoàn thành trong quá khứ có thể được xem lại trong trang Hồ sơ cá nhân của bạn.
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
            <CardTitle>KPI của bạn (Kỳ hiện tại)</CardTitle>
            <CardDescription>
              Theo dõi và cập nhật tiến độ công việc của bạn trong quý này.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Tên KPI</TableHead>
                  <TableHead className="w-[15%]">Trạng thái</TableHead>
                  <TableHead className="w-[20%]">Tiến độ</TableHead>
                  <TableHead className="text-right">Hoàn thành</TableHead>
                  <TableHead className="text-right w-[220px]">
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
