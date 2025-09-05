'use client';
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Loading from './loading';

export default function DashboardRedirectPage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      // Chờ cho đến khi quá trình xác thực hoàn tất
      return;
    }

    if (!user) {
      // Nếu không có người dùng, chuyển hướng đến trang đăng nhập
      router.push('/login');
      return;
    }

    // Nếu có người dùng, chuyển hướng dựa trên vai trò
    if (user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/employee');
    }
  }, [loading, user, router]);

  // Hiển thị màn hình tải trong khi kiểm tra và chuyển hướng
  return <Loading />;
}
