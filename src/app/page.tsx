'use client';
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { useRouter } from 'next/navigation';
import Loading from './loading';

export default function DashboardRedirectPage() {
  const { user, loading } = useContext(AuthContext);
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      // Wait for authentication to complete
      return;
    }

    if (!user) {
      // If no user, redirect to login page
      router.push('/login');
      return;
    }

    // If user exists, redirect based on role
    if (user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/employee');
    }
  }, [loading, user, router]);

  // Show loading screen while checking and redirecting
  return <Loading />;
}
