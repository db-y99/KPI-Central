'use client';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/auth-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export default function DashboardHeader() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  let title = 'Bảng điều khiển';
  if (pathname.startsWith('/admin/reports')) {
    title = 'Báo cáo';
  } else if (pathname.startsWith('/admin/kpi-definitions')) {
    title = 'Quản lý KPI';
  } else if (pathname.startsWith('/admin/employees')) {
    title = 'Quản lý nhân viên';
  } else if (pathname.startsWith('/admin/kpi-assignment')) {
    title = 'Giao KPI';
  } else if (pathname.startsWith('/admin')) {
    title = 'Tổng quan của quản lý';
  } else if (pathname.startsWith('/employee/profile')) {
    title = 'Hồ sơ cá nhân';
  }

  const headerContent = (
    <>
      {!isMobile && (
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      )}
      <div
        className={cn('flex items-center gap-4', isMobile && 'w-full justify-end')}
      >
        {/* User Dropdown has been moved to the AppShell sidebar */}
      </div>
    </>
  );

  if (isMobile) {
    // On mobile, the header doesn't show the title, so we can return an empty fragment
    // as the other elements (logo, sheet trigger) are handled in AppShell.
    return <></>;
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
      {headerContent}
    </header>
  );
}
