'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, UserCheck } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

// Import existing components
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const EmployeesPage = dynamic(() => import('../employees/page'), { 
  loading: () => <div className="p-4">Loading Employees...</div>
});
const DepartmentsPage = dynamic(() => import('../departments/page'), { 
  loading: () => <div className="p-4">Loading Departments...</div>
});

export default function HrManagementPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('employees');

  const tabs = [
    {
      id: 'employees',
      label: t.nav.allEmployees,
      icon: Users,
      component: EmployeesPage
    },
    {
      id: 'departments',
      label: t.departments.title,
      icon: Building2,
      component: DepartmentsPage
    }
  ];

  return (
    <div className="h-full p-4 md:p-6 lg:p-8 space-y-6">

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 gap-0 p-1 h-12 bg-gray-100 rounded-lg">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-600 hover:text-gray-900"
            >
              <tab.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <tab.component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
