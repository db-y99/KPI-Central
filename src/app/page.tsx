'use client';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { useRouter } from 'next/navigation';
import Loading from './loading';

export default function DashboardRedirectPage() {
  const { user, loading } = useContext(AuthContext);
  const { t } = useLanguage();
  const router = useRouter();
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (redirectTimeout) {
      clearTimeout(redirectTimeout);
    }

    // Only redirect when authentication is complete (loading is false)
    if (loading) {
      return; // Still loading, wait
    }

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('⏰ Redirect timeout reached, forcing redirect to login');
      router.push('/login');
    }, 5000); // 5 second timeout

    setRedirectTimeout(timeout);

    if (!user) {
      // If no user after loading is complete, redirect to login
      router.push('/login');
      return;
    }

    // If user exists, redirect based on role
    if (user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/employee');
    }

    // Cleanup timeout on successful redirect
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [loading, user, router, t]);

  // Always show loading screen while checking authentication and redirecting
  return <Loading />;
}
