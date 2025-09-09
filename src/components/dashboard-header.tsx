'use client';
import { useContext } from 'react';
import { usePathname } from 'next/navigation';

import { AuthContext } from '@/context/auth-context';
import { useIsMobile } from '@/hooks/use-mobile';


export default function DashboardHeader() {
  const { user } = useContext(AuthContext);
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

  const headerContent = (
    <>
      {!isMobile && (
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      )}
    </>
  );

  if (isMobile) {
    // On mobile, the header doesn't show the title, so we can return an empty fragment
    // as the other elements (logo, sheet trigger) are handled in AppShell.
    return null;
  }

  return headerContent;
}
