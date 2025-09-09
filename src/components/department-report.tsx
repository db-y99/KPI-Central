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
import { Button } from './ui/button';
import { unparse } from 'papaparse';
import { DataContext } from '@/context/data-context';
import type { Employee } from '@/types';

interface DepartmentReportProps {
  dateRange?: DateRange;
  comparisonDateRange?: DateRange;
}

export default function DepartmentReport({
  dateRange,
  comparisonDateRange,
}: DepartmentReportProps) {
  const { departments, employees, kpiRecords } = useContext(DataContext);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(null);

  const calculateDepartmentData = (
    employeesInDept: Employee[],
    dateRange?: DateRange
  ) => {
    if (!dateRange?.from || !dateRange?.to) {
      return [];
    }

    return employeesInDept.map(employee => {
      const employeeRecords = kpiRecords.filter(
        r =>
          r.employeeId === employee.id &&
          r.status === 'approved' && // Only include approved records
          isWithinInterval(new Date(r.endDate), {
            start: dateRange.from as Date,
            end: dateRange.to as Date,
          })
      );

      if (employeeRecords.length === 0) {
        return {
          employeeId: employee.id,
          name: employee.name,
          avatar: employee.avatar,
          avgCompletion: 0,
          kpiCount: 0,
        };
      }
      const totalCompletion = employeeRecords.reduce((acc, record) => {
        const completion =
          record.target > 0 ? (record.actual / record.target) * 100 : 0;
        return acc + completion;
      }, 0);
      const avgCompletion = Math.round(totalCompletion / employeeRecords.length);
      return {
        employeeId: employee.id,
        name: employee.name,
        avatar: employee.avatar,
        avgCompletion,
        kpiCount: employeeRecords.length,
      };
    });
  };
  
  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);

  const departmentEmployees = useMemo(() => {
    if (!selectedDepartmentId) return [];
    return employees.filter(e => e.departmentId === selectedDepartmentId);
  }, [selectedDepartmentId, employees]);

  const currentPeriodData = useMemo(
    () => calculateDepartmentData(departmentEmployees, dateRange),
    [departmentEmployees, dateRange, kpiRecords]
  );
  const comparisonPeriodData = useMemo(
    () => calculateDepartmentData(departmentEmployees, comparisonDateRange),
    [departmentEmployees, comparisonDateRange, kpiRecords]
  );
  
  const combinedData = useMemo(() => {
    const dataMap = new Map<string, { 
      name: string;
      avatar: string;
      current?: number;
      previous?: number;
      currentKpiCount: number;
      previousKpiCount: number;
      change: number;
    }>();
    
    currentPeriodData.forEach(item => {
        dataMap.set(item.employeeId, {
            name: item.name,
            avatar: item.avatar,
            current: item.avgCompletion,
            currentKpiCount: item.kpiCount,
            previousKpiCount: 0,
            change: 0,
        });
    });

    comparisonPeriodData.forEach(item => {
        const existing = dataMap.get(item.employeeId) || {
            name: item.name,
            avatar: item.avatar,
            currentKpiCount: 0,
            change: 0,
        };
        dataMap.set(item.employeeId, {
            ...existing,
            previous: item.avgCompletion,
            previousKpiCount: item.kpiCount,
        });
    });

    return Array.from(dataMap.values()).map(item => {
        const change = (item.current ?? 0) - (item.previous ?? 0);
        return { ...item, change };
    });

  }, [currentPeriodData, comparisonPeriodData]);

  const departmentAverage = useMemo(() => {
    const validData = currentPeriodData.filter(d => d.kpiCount > 0);
    if (validData.length === 0) return 0;
    const total = validData.reduce((acc, item) => acc + item.avgCompletion, 0);
    return Math.round(total / validData.length);
  }, [currentPeriodData]);

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

  const hasData = currentPeriodData.some(d => d.kpiCount > 0);
  
  const handleExport = () => {
    if (!selectedDepartment || !dateRange?.from) return;

    const exportData = combinedData.map(item => ({
        "Tên nhân viên": item.name,
        "Số KPI đã duyệt (hiện tại)": item.currentKpiCount,
        ...(comparisonDateRange && { "Số KPI đã duyệt (so sánh)": item.previousKpiCount }),
        "Hoàn thành TB (hiện tại, %)": item.current ?? 0,
        ...(comparisonDateRange && { "Hoàn thành TB (so sánh, %)": item.previous ?? 0 }),
        ...(comparisonDateRange && { "Thay đổi (%)": item.change }),
    }));
    
    const csv = unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const fromDate = format(dateRange.from, 'yyyy-MM-dd');
    link.setAttribute('download', `bao_cao_phong_${selectedDepartment.name.replace(/ /g, '_')}_${fromDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Báo cáo hiệu suất phòng ban</CardTitle>
        <CardDescription>
          Chọn phòng ban và các kỳ để so sánh hiệu suất nhân viên (chỉ tính các KPI đã được duyệt).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full md:w-1/3">
          <Select
            onValueChange={setSelectedDepartmentId}
            value={selectedDepartmentId ?? ''}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn một phòng ban..." />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedDepartmentId && (
          <div className="space-y-8 rounded-xl p-4 bg-muted/20">
            {hasData ? (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>
                        Tổng quan hiệu suất:{' '}
                        {
                            departments.find(d => d.id === selectedDepartmentId)
                            ?.name
                        }
                        </CardTitle>
                        <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                            TB Phòng ban (Kỳ hiện tại)
                        </p>
                        <p className="text-2xl font-bold text-primary">
                            {departmentAverage}%
                        </p>
                        </div>
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
                    <CardTitle>Chi tiết nhân viên</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nhân viên</TableHead>
                          <TableHead>KPIs đã duyệt (hiện tại)</TableHead>
                           {comparisonDateRange && (
                                <TableHead>KPIs đã duyệt (so sánh)</TableHead>
                           )}
                          <TableHead className="text-right">
                            Hoàn thành TB (hiện tại)
                          </TableHead>
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
                            <TableCell>{employee.currentKpiCount}</TableCell>
                            {comparisonDateRange && (
                                 <TableCell>{employee.previousKpiCount}</TableCell>
                            )}
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
                    Không có dữ liệu KPI đã được duyệt cho phòng ban này trong khoảng thời gian
                    đã chọn.
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
