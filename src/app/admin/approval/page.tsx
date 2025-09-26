'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';

export default function ApprovalRedirect() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    // Redirect to KPI Management tab with approval tab active
    router.replace('/admin/kpi-management?tab=approval');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t.common.loading}</p>
      </div>
    </div>
  );
}