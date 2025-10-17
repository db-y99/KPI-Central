'use client';
import { useContext, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/auth-context';
import AppShell from '@/components/app-shell';
import Loading from '@/app/loading';

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  // Debug logs
  console.log('🔍 Employee Layout - user:', user);
  console.log('🔍 Employee Layout - loading:', loading);

  useEffect(() => {
    console.log('🔄 Employee Layout useEffect - loading:', loading, 'user:', user);
    
    // Nếu quá trình xác thực chưa hoàn tất, không làm gì cả.
    if (loading) {
      console.log('⏳ Still loading, waiting...');
      return;
    }

    // Nếu không có người dùng, chuyển hướng về trang đăng nhập.
    if (!user) {
      console.log('❌ No user found, redirecting to login');
      router.push('/login');
    } else {
      console.log('✅ User found, showing content');
    }
  }, [loading, user, router]);

  // Hiển thị màn hình tải trong khi chờ xác thực hoặc nếu không có người dùng (và đang được chuyển hướng).
  if (loading || !user) {
    return <Loading />;
  }

  // Nếu có người dùng, hiển thị layout và nội dung.
  return <AppShell>{children}</AppShell>;
}
