'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  FileText, 
  CreditCard,
  Shield,
  FolderOpen
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';

// Import existing components
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const SettingsComponent = dynamic(() => import('@/components/settings-component'), { 
  loading: () => <div className="p-4">Loading Settings...</div>
});
const PoliciesOverviewComponent = dynamic(() => import('@/components/policies-overview-component'), { 
  loading: () => <div className="p-4">Loading Policies Overview...</div>
});
const InitPoliciesComponent = dynamic(() => import('@/components/init-policies-component'), { 
  loading: () => <div className="p-4">Loading Init Policies...</div>
});
const GoogleDriveConfigComponent = dynamic(() => import('@/components/google-drive-config-component'), { 
  loading: () => <div className="p-4">Loading Google Drive Config...</div>
});
const PayrollIntegrationComponent = dynamic(() => import('@/components/payroll-integration-component'), { 
  loading: () => <div className="p-4">Loading Payroll Integration...</div>
});

export default function SystemSettingsPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settings');

  // Handle query parameter for tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['settings', 'policies', 'init-policies', 'google-drive', 'payroll'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without causing a page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const tabs = [
    {
      id: 'settings',
      label: t.nav.settings,
      icon: Settings,
      component: SettingsComponent
    },
    {
      id: 'policies',
      label: 'Policies Overview',
      icon: Shield,
      component: PoliciesOverviewComponent
    },
    {
      id: 'init-policies',
      label: 'Init Policies',
      icon: FileText,
      component: InitPoliciesComponent
    },
    {
      id: 'google-drive',
      label: 'Google Drive Config',
      icon: FolderOpen,
      component: GoogleDriveConfigComponent
    },
    {
      id: 'payroll',
      label: 'Payroll Integration',
      icon: CreditCard,
      component: PayrollIntegrationComponent
    }
  ];

  return (
    <div className="h-full p-4 md:p-6 lg:p-8 space-y-6">

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 gap-0 p-1 h-12 bg-gray-100 rounded-lg">
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
