'use client';
import { useContext, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/auth-context';
import AppShell from '@/components/app-shell';
import Loading from '@/app/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLayout({ children }: { children: ReactNode }) {
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

  const isManager = user.position.toLowerCase().includes('manager');

  if (!isManager) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Card className="m-4">
          <CardHeader>
            <CardTitle>Không có quyền truy cập</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Bạn không phải là quản lý. Vui lòng quay lại trang tổng quan của
              bạn.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
