'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, TrendingUp } from 'lucide-react';
import KpiAssignmentTab from './kpi-assignment-tab';
import MetricsTab from './metrics-tab';

export default function KpiMetricsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">KPI & Metrics</h1>
        <p className="text-muted-foreground">
          Giao KPI cho nhân viên và quản lý dữ liệu metrics
        </p>
      </div>

      <Tabs defaultValue="assignment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assignment" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Giao KPI
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dữ liệu Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignment">
          <KpiAssignmentTab />
        </TabsContent>

        <TabsContent value="metrics">
          <MetricsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
