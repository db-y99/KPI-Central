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
import { departments, employees, kpiRecords } from '@/lib/data';
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
import { type DateRange } from 'react-day-picker';
import { isWithinInterval } from 'date-fns';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DepartmentReportProps {
  dateRange?: DateRange;
  comparisonDateRange?: DateRange;
}

const calculateDepartmentData = (
  employeesInDept: typeof employees,
  dateRange?: DateRange
) => {
  if (!dateRange?.from || !dateRange?.to) {
    return [];
  }

  return employeesInDept.map(employee => {
    const employeeRecords = kpiRecords.filter(
      r =>
        r.employeeId === employee.id &&
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

export default function DepartmentReport({
  dateRange,
  comparisonDateRange,
}: DepartmentReportProps) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(null);

  const departmentEmployees = useMemo(() => {
    if (!selectedDepartmentId) return [];
    return employees.filter(e => e.departmentId === selectedDepartmentId);
  }, [selectedDepartmentId]);

  const currentPeriodData = useMemo(
    () => calculateDepartmentData(departmentEmployees, dateRange),
    [departmentEmployees, dateRange]
  );
  const comparisonPeriodData = useMemo(
    () => calculateDepartmentData(departmentEmployees, comparisonDateRange),
    [departmentEmployees, comparisonDateRange]
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Báo cáo hiệu suất phòng ban</CardTitle>
        <CardDescription>
          Chọn phòng ban và các kỳ để so sánh hiệu suất nhân viên.
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
          <div className="space-y-8">
            {hasData ? (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
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
                          <TableHead>KPIs (hiện tại)</TableHead>
                           {comparisonDateRange && (
                                <TableHead>KPIs (so sánh)</TableHead>
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
                    Không có dữ liệu KPI cho phòng ban này trong khoảng thời gian
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
