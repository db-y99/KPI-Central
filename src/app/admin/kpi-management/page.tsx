'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, UserPlus, TrendingUp, FileCheck, Award, AlertTriangle, Gift, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

// Import existing components with lazy loading
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const KpiDefinitionsComponent = dynamic(() => import('@/components/kpi-definitions-component'), { 
  loading: () => <div className="p-4">Loading KPI Definitions...</div>
});
const KpiAssignmentComponent = dynamic(() => import('@/components/kpi-assignment-component'), { 
  loading: () => <div className="p-4">Loading KPI Assignment...</div>
});
const KpiTrackingComponent = dynamic(() => import('@/components/kpi-tracking-component'), { 
  loading: () => <div className="p-4">Loading KPI Tracking...</div>
});
const ApprovalComponent = dynamic(() => import('@/components/approval-component'), { 
  loading: () => <div className="p-4">Loading Approval...</div>
});
const RewardPenaltyComponent = dynamic(() => import('@/components/reward-penalty-component'), { 
  loading: () => <div className="p-4">Loading Reward & Penalty...</div>
});
const EvaluationReportsComponent = dynamic(() => import('@/components/evaluation-reports-component'), { 
  loading: () => <div className="p-4">Loading Evaluation & Reports...</div>
});

export default function KpiManagementPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('definitions');

  // Handle query parameter for tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['definitions', 'assignment', 'tracking', 'approval', 'reward-penalty', 'evaluation-reports'].includes(tab)) {
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
      id: 'definitions',
      label: t.nav.kpiDefinitions,
      icon: Target,
      component: KpiDefinitionsComponent
    },
    {
      id: 'assignment',
      label: t.nav.kpiAssignment,
      icon: UserPlus,
      component: KpiAssignmentComponent
    },
    {
      id: 'tracking',
      label: t.nav.kpiTracking,
      icon: TrendingUp,
      component: KpiTrackingComponent
    },
    {
      id: 'approval',
      label: t.nav.approveReports,
      icon: FileCheck,
      component: ApprovalComponent
    },
    {
      id: 'reward-penalty',
      label: t.nav.rewardPenalty,
      icon: Award,
      component: RewardPenaltyComponent
    },
    {
      id: 'evaluation-reports',
      label: t.nav.evaluateReward,
      icon: BarChart3,
      component: EvaluationReportsComponent
    }
  ];

  return (
    <div className="h-full p-4 md:p-6 lg:p-8 space-y-6">

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 gap-0 p-1 h-12 bg-gray-100 rounded-lg">
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
