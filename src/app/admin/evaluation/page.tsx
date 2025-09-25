'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EvaluationRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Evaluation & Reports tab with evaluation tab active
    router.replace('/admin/evaluation-reports?tab=evaluation');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Đang chuyển hướng đến Đánh giá & Báo cáo...</p>
      </div>
    </div>
  );
}