'use client';
import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';

import { AuthContext } from '@/context/auth-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { DataContext } from '@/context/data-context';


export default function DashboardHeader() {
  const { user } = useContext(AuthContext);
  const { view, setView } = useContext(DataContext);
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
  } else if (pathname.startsWith('/admin/reviews')) {
    title = 'Đánh giá & Xếp loại';
  } else if (pathname.startsWith('/admin')) {
    title = 'Tổng quan của quản lý';
  } else if (pathname.startsWith('/employee/profile')) {
    title = 'Hồ sơ cá nhân';
  }

  const showViewSwitcher = pathname === '/admin' || pathname === '/employee';

  const headerContent = (
    <>
      {!isMobile && (
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      )}
      <div
        className={cn('flex items-center gap-4', isMobile && 'w-full justify-between')}
      >
        {showViewSwitcher && (
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );

  if (isMobile) {
    // On mobile, the header doesn't show the title, so we can return an empty fragment
    // as the other elements (logo, sheet trigger) are handled in AppShell.
    return (
       <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b bg-background/80 px-6 backdrop-blur-sm">
         {showViewSwitcher && (
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
       </header>
    );
  }

  return headerContent;
}
