'use client';
import { useContext, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/auth-context';
import AppShell from '@/components/app-shell';
import Loading from '@/app/loading';

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // Nếu quá trình xác thực chưa hoàn tất, không làm gì cả.
    if (loading) {
      return;
    }

    // Nếu không có người dùng, chuyển hướng về trang đăng nhập.
    if (!user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Hiển thị màn hình tải trong khi chờ xác thực hoặc nếu không có người dùng (và đang được chuyển hướng).
  if (loading || !user) {
    return <Loading />;
  }

  // Nếu có người dùng, hiển thị layout và nội dung.
  return <AppShell>{children}</AppShell>;
}
