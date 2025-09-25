'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, UserPlus, TrendingUp, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { usePerformanceMonitor } from '@/hooks/use-cache';

// Import existing components with better loading states
import dynamic from 'next/dynamic';

// Optimized lazy loading with better loading states and error boundaries
const KpiDefinitionsComponent = dynamic(() => import('@/components/kpi-definitions-component'), { 
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading KPI Definitions...</span>
    </div>
  ),
  ssr: false // Disable SSR for better performance
});

const KpiAssignmentComponent = dynamic(() => import('@/components/kpi-assignment-component'), { 
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading KPI Assignment...</span>
    </div>
  ),
  ssr: false
});

const KpiTrackingComponent = dynamic(() => import('@/components/kpi-tracking-component'), { 
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading KPI Tracking...</span>
    </div>
  ),
  ssr: false
});

const MetricsComponent = dynamic(() => import('@/components/metrics-component'), { 
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading Metrics...</span>
    </div>
  ),
  ssr: false
});

// Memoized tab configuration
const useTabConfig = () => {
  const { t } = useLanguage();
  
  return useMemo(() => [
    {
      id: 'definitions',
      label: t.nav.defineKpi,
      icon: Target,
      component: KpiDefinitionsComponent
    },
    {
      id: 'assignment',
      label: t.nav.assignKpi,
      icon: UserPlus,
      component: KpiAssignmentComponent
    },
    {
      id: 'tracking',
      label: t.nav.trackKpi,
      icon: TrendingUp,
      component: KpiTrackingComponent
    },
    {
      id: 'metrics',
      label: 'Metrics',
      icon: BarChart3,
      component: MetricsComponent
    }
  ], [t.nav.defineKpi, t.nav.assignKpi, t.nav.trackKpi]);
};

export default function KpiManagementPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('definitions');
  const [isInitialized, setIsInitialized] = useState(false);

  // Performance monitoring
  usePerformanceMonitor('KpiManagementPage');

  const tabs = useTabConfig();

  // Optimized tab change handler with debouncing
  const handleTabChange = useCallback((value: string) => {
    if (value === activeTab) return;
    
    setActiveTab(value);
    
    // Update URL without causing a page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    router.replace(url.pathname + url.search, { scroll: false });
  }, [activeTab, router]);

  // Handle query parameter for tab with better performance
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['definitions', 'assignment', 'tracking', 'metrics'].includes(tab)) {
      setActiveTab(tab);
    }
    setIsInitialized(true);
  }, [searchParams]);

  // Memoized tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (!currentTab) return null;

    const Component = currentTab.component;
    return <Component />;
  }, [activeTab, tabs]);

  // Show loading state until initialized
  if (!isInitialized) {
    return (
      <div className="h-full p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 md:p-6 lg:p-8 space-y-6">
      {/* Optimized Tabs Section */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 gap-0 p-1 h-12 bg-gray-100 rounded-lg">
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

        {/* Optimized Tab Content */}
        <TabsContent value={activeTab} className="mt-6">
          {tabContent}
        </TabsContent>
      </Tabs>
    </div>
  );
}
