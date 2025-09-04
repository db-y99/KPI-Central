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
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const isManager = user.position.toLowerCase().includes('manager');
    if (isManager) {
      router.push('/admin');
    } else {
      router.push('/employee');
    }
  }, [loading, user, router]);

  return <Loading />;
}
