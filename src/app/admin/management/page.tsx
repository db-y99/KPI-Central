'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building2, Target } from 'lucide-react';
import EmployeesTab from './employees-tab';
import DepartmentsTab from './departments-tab';
import KpiDefinitionsTab from './kpi-definitions-tab';

export default function ManagementPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quản lý</h1>
        <p className="text-muted-foreground">
          Quản lý nhân viên, phòng ban và định nghĩa KPI trong một giao diện thống nhất
        </p>
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Nhân viên
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Phòng ban
          </TabsTrigger>
          <TabsTrigger value="kpis" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            KPI Definitions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <EmployeesTab />
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentsTab />
        </TabsContent>

        <TabsContent value="kpis">
          <KpiDefinitionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
