'use client';
import { useContext } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import ReportsTabs from '@/components/reports-tabs';
import { AuthContext } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  if (loading) {
    return null;
  }
  if (!user) {
    router.push('/login');
    return null;
  }
  // For reports, we might want to ensure the user is a manager.
  // This is a simple check, a real app would have more robust roles.
  const isManager = user.position.toLowerCase().includes('manager');

  return (
    <div className="flex h-full flex-col">
      <DashboardHeader title="Báo cáo hiệu suất" user={user} />
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {isManager ? (
          <ReportsTabs />
        ) : (
          <div className="text-center text-muted-foreground">
            Bạn không có quyền truy cập trang này.
          </div>
        )}
      </div>
    </div>
  );
}
