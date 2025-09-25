'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck, Gift, BarChart3, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

// Import existing components
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const ApprovalComponent = dynamic(() => import('@/components/approval-component'), { 
  loading: () => <div className="p-4">Loading Approval...</div>
});
const EvaluationComponent = dynamic(() => import('@/components/evaluation-component'), { 
  loading: () => <div className="p-4">Loading Evaluation...</div>
});
const ReportsComponent = dynamic(() => import('@/components/reports-component'), { 
  loading: () => <div className="p-4">Loading Reports...</div>
});

export default function EvaluationReportsPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('approval');

  // Handle query parameter for tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['approval', 'evaluation', 'reports'].includes(tab)) {
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
      id: 'approval',
      label: t.nav.approveReports,
      icon: FileCheck,
      component: ApprovalComponent
    },
    {
      id: 'evaluation',
      label: t.nav.evaluateReward,
      icon: Gift,
      component: EvaluationComponent
    },
    {
      id: 'reports',
      label: t.nav.reports,
      icon: BarChart3,
      component: ReportsComponent
    }
  ];

  return (
    <div className="h-full p-4 md:p-6 lg:p-8 space-y-6">

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 gap-0 p-1 h-12 bg-gray-100 rounded-lg">
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
