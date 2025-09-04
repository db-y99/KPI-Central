'use client';
import { useContext, useEffect } from 'react';
import ReportsTabs from '@/components/reports-tabs';
import { AuthContext } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Loading from '../loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppShell from '@/components/app-shell';

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
    <AppShell>
      <div className="h-full p-6 md:p-8">
        {isManager ? (
          <ReportsTabs />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Không có quyền truy cập</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
