'use client';

import { useState } from 'react';
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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export default function IndividualReport() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const employeeKpiRecords = kpiRecords.filter(
    r => r.employeeId === selectedEmployeeId
  );

  const enrichedKpiRecords = employeeKpiRecords.map(record => {
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

  const chartConfig = {
    completion: {
      label: 'Completion',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Performance Report</CardTitle>
        <CardDescription>
          Select an employee to view their KPI performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full md:w-1/3">
          <Select onValueChange={setSelectedEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an employee..." />
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
              <CardHeader>
                <CardTitle>
                  Performance Overview: {selectedEmployee?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {enrichedKpiRecords.length > 0 ? (
                  <ChartContainer
                    config={chartConfig}
                    className="h-[250px] w-full"
                  >
                    <ResponsiveContainer>
                      <BarChart data={enrichedKpiRecords} margin={{ top: 20 }}>
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={value =>
                            value.length > 15 ? value.slice(0, 15) + '...' : value
                          }
                        />
                        <YAxis unit="%" />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar
                          dataKey="completion"
                          fill="var(--color-completion)"
                          radius={4}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <p className="text-muted-foreground">No data for chart.</p>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrichedKpiRecords.map(record => (
                <KpiCard
                  key={record.id}
                  record={record as Kpi & KpiRecord}
                />
              ))}
            </div>

            {enrichedKpiRecords.length === 0 && (
              <p className="text-muted-foreground">
                No KPIs assigned to this employee.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
