'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GoogleDriveConfigRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to System Settings tab with google-drive tab active
    router.replace('/admin/system-settings?tab=google-drive');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Đang chuyển hướng đến Cài đặt Hệ thống...</p>
      </div>
    </div>
  );
}