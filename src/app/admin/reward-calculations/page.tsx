'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RewardCalculationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Reward System tab with calculations tab active
    router.replace('/admin/reward-system?tab=calculations');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Đang chuyển hướng đến Hệ thống Thưởng...</p>
      </div>
    </div>
  );
}