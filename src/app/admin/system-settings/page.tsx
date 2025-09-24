'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Bell, 
  Database, 
  FileText, 
  CreditCard,
  Shield,
  FolderOpen
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';

// Import existing components
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const SettingsPage = dynamic(() => import('../settings/page'), { 
  loading: () => <div className="p-4">Loading Settings...</div>
});
const NotificationsPage = dynamic(() => import('../notifications/page'), { 
  loading: () => <div className="p-4">Loading Notifications...</div>
});
const SeedDataPage = dynamic(() => import('../seed-data/page'), { 
  loading: () => <div className="p-4">Loading Seed Data...</div>
});
const PoliciesOverviewPage = dynamic(() => import('../policies-overview/page'), { 
  loading: () => <div className="p-4">Loading Policies Overview...</div>
});
const InitPoliciesPage = dynamic(() => import('../init-policies/page'), { 
  loading: () => <div className="p-4">Loading Init Policies...</div>
});
const GoogleDriveConfigPage = dynamic(() => import('../google-drive-config/page'), { 
  loading: () => <div className="p-4">Loading Google Drive Config...</div>
});
const PayrollIntegrationPage = dynamic(() => import('../payroll-integration/page'), { 
  loading: () => <div className="p-4">Loading Payroll Integration...</div>
});

export default function SystemSettingsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('settings');

  const tabs = [
    {
      id: 'settings',
      label: t.nav.settings,
      icon: Settings,
      component: SettingsPage
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      component: NotificationsPage
    },
    {
      id: 'policies',
      label: 'Policies Overview',
      icon: Shield,
      component: PoliciesOverviewPage
    },
    {
      id: 'init-policies',
      label: 'Init Policies',
      icon: FileText,
      component: InitPoliciesPage
    },
    {
      id: 'google-drive',
      label: 'Google Drive Config',
      icon: FolderOpen,
      component: GoogleDriveConfigPage
    },
    {
      id: 'payroll',
      label: 'Payroll Integration',
      icon: CreditCard,
      component: PayrollIntegrationPage
    },
    {
      id: 'seed-data',
      label: 'Seed Data',
      icon: Database,
      component: SeedDataPage
    }
  ];

  return (
    <div className="h-full p-4 md:p-6 lg:p-8 space-y-6">

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-0 p-1 h-12 bg-gray-100 rounded-lg">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              className="flex items-center justify-center gap-2 px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-600 hover:text-gray-900"
            >
              <tab.icon className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
              <span className="hidden lg:inline truncate">{tab.label}</span>
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
