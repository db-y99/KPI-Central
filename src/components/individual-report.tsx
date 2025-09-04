'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { employees, kpis, kpiRecords } from '@/lib/data';
import type { Kpi, KpiRecord } from '@/types';
import KpiCard from './kpi-card';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { type DateRange } from 'react-day-picker';
import { isWithinInterval, format } from 'date-fns';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { unparse } from 'papaparse';

interface IndividualReportProps {
  dateRange?: DateRange;
  comparisonDateRange?: DateRange;
}

const filterRecordsByDate = (
  records: KpiRecord[],
  dateRange?: DateRange
) => {
  if (!dateRange?.from || !dateRange?.to) {
    return [];
  }
  return records.filter(record =>
    isWithinInterval(new Date(record.endDate), {
      start: dateRange.from as Date,
      end: dateRange.to as Date,
    })
  );
};

export default function IndividualReport({
  dateRange,
  comparisonDateRange,
}: IndividualReportProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  const enrichedKpiRecords = useMemo(() => {
    const employeeRecords = kpiRecords.filter(
      r => r.employeeId === selectedEmployeeId
    );
    const mainPeriodRecords = filterRecordsByDate(employeeRecords, dateRange);

    return mainPeriodRecords.map(record => {
      const kpiDetails = kpis.find(k => k.id === record.kpiId);
      return {
        ...record,
        ...kpiDetails,
        completion:
          record.target > 0
            ? Math.round((record.actual / record.target) * 100)
            : 0,
      };
    });
  }, [selectedEmployeeId, dateRange]);

  const comparisonData = useMemo(() => {
    if (!comparisonDateRange) return [];
    const employeeRecords = kpiRecords.filter(
      r => r.employeeId === selectedEmployeeId
    );
    const comparisonPeriodRecords = filterRecordsByDate(
      employeeRecords,
      comparisonDateRange
    );
    return comparisonPeriodRecords.map(record => {
      const kpiDetails = kpis.find(k => k.id === record.kpiId);
      return {
        ...record,
        ...kpiDetails,
        completion:
          record.target > 0
            ? Math.round((record.actual / record.target) * 100)
            : 0,
      };
    });
  }, [selectedEmployeeId, comparisonDateRange]);

  const combinedChartData = useMemo(() => {
    const dataMap = new Map<string, { name: string; current?: number; previous?: number }>();

    enrichedKpiRecords.forEach(record => {
      if (record.name) {
        dataMap.set(record.name, { name: record.name, current: record.completion });
      }
    });

    comparisonData.forEach(record => {
      if (record.name) {
        const existing = dataMap.get(record.name) || { name: record.name };
        dataMap.set(record.name, { ...existing, previous: record.completion });
      }
    });
    
    return Array.from(dataMap.values());
  }, [enrichedKpiRecords, comparisonData]);

  const chartConfig = {
    current: {
      label: 'Kỳ hiện tại',
      color: 'hsl(var(--chart-1))',
    },
    previous: {
      label: 'Kỳ so sánh',
      color: 'hsl(var(--chart-2))',
    },
  };
  
  const handleExport = () => {
    if (!selectedEmployee || !dateRange?.from) return;

    const exportData = combinedChartData.map(item => ({
        "Tên KPI": item.name,
        "Hoàn thành kỳ hiện tại (%)": item.current ?? "N/A",
        ...(comparisonDateRange && { "Hoàn thành kỳ so sánh (%)": item.previous ?? "N/A" }),
    }));
    
    const csv = unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const fromDate = format(dateRange.from, 'yyyy-MM-dd');
    link.setAttribute('download', `bao_cao_ca_nhan_${selectedEmployee.name}_${fromDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Báo cáo hiệu suất cá nhân</CardTitle>
        <CardDescription>
          Chọn nhân viên và các kỳ để xem và so sánh hiệu suất KPI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full md:w-1/3">
          <Select onValueChange={setSelectedEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn một nhân viên..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name} - {employee.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEmployeeId && (
          <div className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>
                    Tổng quan hiệu suất: {selectedEmployee?.name}
                    </CardTitle>
                </div>
                 <Button variant="outline" onClick={handleExport} disabled={combinedChartData.length === 0}>
                    <Download className="mr-2" />
                    Xuất CSV
                </Button>
              </CardHeader>
              <CardContent>
                {combinedChartData.length > 0 ? (
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer>
                      <BarChart data={combinedChartData} margin={{ top: 20 }}>
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={value =>
                            value.length > 15
                              ? value.slice(0, 15) + '...'
                              : value
                          }
                        />
                        <YAxis unit="%" />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Legend />
                        <Bar
                          dataKey="current"
                          fill="var(--color-current)"
                          radius={4}
                          name="Kỳ hiện tại"
                        />
                        {comparisonDateRange && (
                           <Bar
                             dataKey="previous"
                             fill="var(--color-previous)"
                             radius={4}
                             name="Kỳ so sánh"
                           />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Không có dữ liệu KPI cho nhân viên này trong khoảng thời gian đã chọn.
                  </p>
                )}
              </CardContent>
            </Card>
            
            {enrichedKpiRecords.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Chi tiết KPI (Kỳ hiện tại)</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                         {enrichedKpiRecords.map(record => (
                           <KpiCard
                             key={record.id}
                             record={record as Kpi & KpiRecord}
                           />
                         ))}
                    </CardContent>
                </Card>
            )}


            {enrichedKpiRecords.length === 0 && selectedEmployeeId && (
              <p className="text-center text-muted-foreground">
                Vui lòng thử chọn một nhân viên khác hoặc thay đổi khoảng thời gian.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
