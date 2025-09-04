'use client';
import { useContext, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/auth-context';
import AppShell from '@/components/app-shell';
import Loading from '@/app/loading';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <Loading />;
  }

  // No need to show an access denied message here, as the useEffect will redirect.
  // We just return the main shell.
  return <AppShell>{children}</AppShell>;
}
