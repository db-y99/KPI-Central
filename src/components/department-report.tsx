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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
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

export default function DepartmentReport() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);

  const departmentEmployees = useMemo(() => {
    if (!selectedDepartmentId) return [];
    return employees.filter(e => e.departmentId === selectedDepartmentId);
  }, [selectedDepartmentId]);

  const departmentData = useMemo(() => {
    return departmentEmployees.map(employee => {
      const employeeRecords = kpiRecords.filter(r => r.employeeId === employee.id);
      if (employeeRecords.length === 0) {
        return {
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
        name: employee.name,
        avatar: employee.avatar,
        avgCompletion,
        kpiCount: employeeRecords.length,
      };
    });
  }, [departmentEmployees]);

  const departmentAverage = useMemo(() => {
    if (departmentData.length === 0) return 0;
    const total = departmentData.reduce(
      (acc, item) => acc + item.avgCompletion,
      0
    );
    return Math.round(total / departmentData.length);
  }, [departmentData]);

  const chartConfig = {
    avgCompletion: {
      label: 'Tỷ lệ hoàn thành trung bình',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Báo cáo hiệu suất phòng ban</CardTitle>
        <CardDescription>
          Chọn một phòng ban để so sánh hiệu suất của các nhân viên.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full md:w-1/3">
          <Select onValueChange={setSelectedDepartmentId}>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Tổng quan hiệu suất:{' '}
                  {departments.find(d => d.id === selectedDepartmentId)?.name}
                </CardTitle>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">TB Phòng ban</p>
                  <p className="text-2xl font-bold text-primary">
                    {departmentAverage}%
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                {departmentData.length > 0 ? (
                  <ChartContainer
                    config={chartConfig}
                    className="h-[250px] w-full"
                  >
                    <ResponsiveContainer>
                      <BarChart data={departmentData} margin={{ top: 20 }}>
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
                        <Bar
                          dataKey="avgCompletion"
                          fill="var(--color-avgCompletion)"
                          radius={4}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <p>Không có dữ liệu cho biểu đồ.</p>
                )}
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
                      <TableHead>Số KPI được giao</TableHead>
                      <TableHead className="text-right">
                        Tỷ lệ hoàn thành TB
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentData.map(employee => (
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
                        <TableCell>{employee.kpiCount}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="w-12 text-right">
                              {employee.avgCompletion}%
                            </span>
                            <Progress
                              value={employee.avgCompletion}
                              className="w-24"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
