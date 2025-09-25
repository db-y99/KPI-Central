'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Calculator, Award } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

// Import existing components
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const RewardProgramsComponent = dynamic(() => import('@/components/reward-programs-component'), { 
  loading: () => <div className="p-4">Loading Reward Programs...</div>
});
const RewardCalculationsComponent = dynamic(() => import('@/components/reward-calculations-component'), { 
  loading: () => <div className="p-4">Loading Reward Calculations...</div>
});

export default function RewardSystemPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('programs');

  // Handle query parameter for tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['programs', 'calculations'].includes(tab)) {
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
      id: 'programs',
      label: 'Reward Programs',
      icon: Gift,
      component: RewardProgramsComponent
    },
    {
      id: 'calculations',
      label: 'Reward Calculations',
      icon: Calculator,
      component: RewardCalculationsComponent
    }
  ];

  return (
    <div className="h-full p-4 md:p-6 lg:p-8 space-y-6">

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
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
