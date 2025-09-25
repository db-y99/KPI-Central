'use client';

import { useState, ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import dynamic from 'next/dynamic';

export interface AdminTab {
  id: string;
  label: string;
  icon: LucideIcon;
  component: React.ComponentType;
}

export interface AdminPageLayoutProps {
  title: string;
  description?: string;
  tabs: AdminTab[];
  defaultTab?: string;
  className?: string;
}

export default function AdminPageLayout({
  title,
  description,
  tabs,
  defaultTab,
  className = ''
}: AdminPageLayoutProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  // Lazy load components for better performance
  const LazyComponents = tabs.reduce((acc, tab) => {
    acc[tab.id] = dynamic(() => Promise.resolve(tab.component), { 
      loading: () => (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading {tab.label}...</span>
        </div>
      )
    });
    return acc;
  }, {} as Record<string, React.ComponentType>);

  return (
    <div className={`h-full p-4 md:p-6 lg:p-8 space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`grid w-full gap-0 p-1 h-12 bg-gray-100 rounded-lg ${
          tabs.length <= 2 ? 'grid-cols-2' : 
          tabs.length <= 4 ? 'grid-cols-4' : 
          tabs.length <= 6 ? 'grid-cols-6' : 'grid-cols-8'
        }`}>
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
        {tabs.map((tab) => {
          const LazyComponent = LazyComponents[tab.id];
          return (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              <LazyComponent />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

// Utility function to create admin tabs
export function createAdminTabs(tabs: AdminTab[]): AdminTab[] {
  return tabs.map(tab => ({
    ...tab,
    component: tab.component
  }));
}

// Common admin page wrapper
export function withAdminLayout<P extends object>(
  Component: React.ComponentType<P>,
  layoutProps: Omit<AdminPageLayoutProps, 'tabs'>
) {
  return function AdminPageWrapper(props: P) {
    return (
      <AdminPageLayout {...layoutProps}>
        <Component {...props} />
      </AdminPageLayout>
    );
  };
}
