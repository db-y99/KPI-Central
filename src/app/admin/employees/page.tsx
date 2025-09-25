'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeesRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to HR Management tab with employees tab active
    router.replace('/admin/hr-management?tab=employees');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Đang chuyển hướng đến Quản lý Nhân sự...</p>
      </div>
    </div>
  );
}