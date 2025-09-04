'use client';
import { useContext, useEffect } from 'react';
import ReportsTabs from '@/components/reports-tabs';
import { AuthContext } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Loading from '../loading';

export default function ReportsPage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <Loading />;
  }

  // For reports, we might want to ensure the user is a manager.
  // This is a simple check, a real app would have more robust roles.
  const isManager = user.position.toLowerCase().includes('manager');

  return (
    <div className="h-full p-6 md:p-8">
      {isManager ? (
        <ReportsTabs />
      ) : (
        <div className="text-center text-muted-foreground">
          Bạn không có quyền truy cập trang này.
        </div>
      )}
    </div>
  );
}
