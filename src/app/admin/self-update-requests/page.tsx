'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy load the component for better performance
const SelfUpdateRequestsAdminComponent = dynamic(() => import('@/components/self-update-requests-admin'), {
  loading: () => <div className="p-4">Loading Self Update Requests...</div>
});

export default function SelfUpdateRequestsPage() {
  return (
    <div className="h-full">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }>
        <SelfUpdateRequestsAdminComponent />
      </Suspense>
    </div>
  );
}
