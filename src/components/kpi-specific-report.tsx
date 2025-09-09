'use client';

import { useState, useMemo, useContext } from 'react';
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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval, format } from 'date-fns';
import { ArrowDown, ArrowUp, Minus, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KpiRecord, Employee } from '@/types';
import { Button } from './ui/button';
import { unparse } from 'papaparse';
import { DataContext } from '@/context/data-context';


interface KpiSpecificReportProps {
  dateRange?: DateRange;
  comparisonDateRange?: DateRange;
}

const calculateKpiDataForPeriod = (
  allRecords: KpiRecord[],
  employees: Employee[],
  dateRange?: DateRange
) => {
  if (!dateRange?.from || !dateRange?.to) {
    return [];
  }

  const filteredRecords = allRecords.filter(r =>
    r.status === 'approved' && // Only include approved records
    isWithinInterval(new Date(r.endDate), {
      start: dateRange.from as Date,
      end: dateRange.to as Date,
    })
  );

  return filteredRecords.map(record => {
    const employee = employees.find(e => e.id === record.employeeId);
    const completion = record.target > 0 ? Math.round((record.actual / record.target) * 100) : 0;
    return {
      employeeId: record.employeeId,
      employeeName: employee?.name ?? 'Không rõ',
      employeeAvatar: employee?.avatar ?? '',
      completion: completion,
      target: record.target,
      actual: record.actual,
    };
  });
};


export default function KpiSpecificReport({
  dateRange,
  comparisonDateRange,
}: KpiSpecificReportProps) {
  const { employees, kpis, kpiRecords } = useContext(DataContext);
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);

  const selectedKpi = kpis.find(k => k.id === selectedKpiId);
  
  const recordsForKpi = useMemo(() => {
      if (!selectedKpiId) return [];
      return kpiRecords.filter(r => r.kpiId === selectedKpiId);
  }, [selectedKpiId, kpiRecords]);

  const currentPeriodData = useMemo(
    () => calculateKpiDataForPeriod(recordsForKpi, employees, dateRange),
    [recordsForKpi, dateRange, employees]
  );
  
  const comparisonPeriodData = useMemo(
    () => calculateKpiDataForPeriod(recordsForKpi, employees, comparisonDateRange),
    [recordsForKpi, comparisonDateRange, employees]
  );

  const combinedData = useMemo(() => {
    const dataMap = new Map<string, { 
      name: string;
      avatar: string;
      current?: number;
      previous?: number;
      change: number;
    }>();
    
    currentPeriodData.forEach(item => {
        dataMap.set(item.employeeId, {
            name: item.employeeName,
            avatar: item.employeeAvatar,
            current: item.completion,
            change: 0,
        });
    });

    comparisonPeriodData.forEach(item => {
        const existing = dataMap.get(item.employeeId) || {
            name: item.employeeName,
            avatar: item.employeeAvatar,
            change: 0,
        };
        dataMap.set(item.employeeId, {
            ...existing,
            previous: item.completion,
        });
    });

    return Array.from(dataMap.values()).map(item => {
        const change = (item.current ?? 0) - (item.previous ?? 0);
        return { ...item, change };
    }).sort((a,b) => (b.current ?? 0) - (a.current ?? 0)); // Sort by current performance

  }, [currentPeriodData, comparisonPeriodData]);


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
    if (!selectedKpi || !dateRange?.from) return;

    const exportData = combinedData.map(item => ({
        "Tên nhân viên": item.name,
        "Hoàn thành (hiện tại, %)": item.current ?? 0,
        ...(comparisonDateRange && { "Hoàn thành (so sánh, %)": item.previous ?? 0 }),
        ...(comparisonDateRange && { "Thay đổi (%)": item.change }),
    }));
    
    const csv = unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const fromDate = format(dateRange.from, 'yyyy-MM-dd');
    link.setAttribute('download', `bao_cao_kpi_${selectedKpi.name.replace(/ /g, '_')}_${fromDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasData = currentPeriodData.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Báo cáo hiệu suất theo KPI</CardTitle>
        <CardDescription>
          Chọn một KPI để xem và so sánh hiệu suất của nhân viên (chỉ tính các KPI đã được duyệt).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full md:w-1/3">
          <Select
            onValueChange={setSelectedKpiId}
            value={selectedKpiId ?? ''}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn một KPI..." />
            </SelectTrigger>
            <SelectContent>
              {kpis.map(kpi => (
                <SelectItem key={kpi.id} value={kpi.id}>
                  {kpi.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedKpiId && (
          <div className="space-y-8 rounded-xl p-4 bg-muted/20">
            {hasData ? (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>
                        Tổng quan hiệu suất: {selectedKpi?.name}
                        </CardTitle>
                        <CardDescription>Đơn vị: {selectedKpi?.unit}</CardDescription>
                    </div>
                     <Button variant="outline" onClick={handleExport} disabled={combinedData.length === 0}>
                        <Download className="mr-2" />
                        Xuất CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={chartConfig}
                      className="h-[300px] w-full"
                    >
                      <ResponsiveContainer>
                        <BarChart data={combinedData} margin={{ top: 20 }}>
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Chi tiết hiệu suất nhân viên</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nhân viên</TableHead>
                          <TableHead className="text-right">
                            Hoàn thành (hiện tại)
                          </TableHead>
                           {comparisonDateRange && (
                                <TableHead className="text-right">Hoàn thành (so sánh)</TableHead>
                           )}
                           {comparisonDateRange && (
                                <TableHead className="text-right">Thay đổi</TableHead>
                           )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {combinedData.map(employee => (
                          <TableRow key={employee.name}>
                            <TableCell className="flex items-center gap-3 font-medium">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={employee.avatar}
                                  alt={employee.name}
                                  data-ai-hint="person"
                                />
                                <AvatarFallback>
                                  {employee.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {employee.name}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-3">
                                <span className="w-12 text-right">
                                  {employee.current ?? 0}%
                                </span>
                                <Progress
                                  value={employee.current}
                                  className="w-24"
                                />
                              </div>
                            </TableCell>
                             {comparisonDateRange && (
                                 <TableCell className="text-right">{employee.previous ?? 'N/A'}%</TableCell>
                            )}
                            {comparisonDateRange && (
                                <TableCell className="text-right">
                                    <div className={cn(
                                        "flex items-center justify-end gap-1 font-medium",
                                        employee.change > 0 && "text-green-500",
                                        employee.change < 0 && "text-red-500",
                                    )}>
                                        {employee.change > 0 && <ArrowUp className="h-4 w-4" />}
                                        {employee.change < 0 && <ArrowDown className="h-4 w-4" />}
                                        {employee.change === 0 && <Minus className="h-4 w-4 text-muted-foreground" />}
                                        {Math.abs(employee.change)}%
                                    </div>
                                </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Không có dữ liệu đã duyệt cho KPI này trong khoảng thời gian đã chọn.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
