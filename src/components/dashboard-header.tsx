'use client';
import { useContext } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { AuthContext } from '@/context/auth-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/context/language-context';


export default function DashboardHeader() {
  const { user } = useContext(AuthContext);
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  let title = t.dashboard.title;
  if (pathname.startsWith('/admin/kpi-management')) {
    title = 'KPI Management';
  } else if (pathname.startsWith('/admin/hr-management')) {
    title = 'HR Management';
  } else if (pathname.startsWith('/admin/reward-system')) {
    title = 'Reward System';
  } else if (pathname.startsWith('/admin/reports')) {
    title = t.nav.reports;
  } else if (pathname.startsWith('/admin/kpi-definitions')) {
    title = t.kpis.title;
  } else if (pathname.startsWith('/admin/employees')) {
    title = t.employees.title;
  } else if (pathname.startsWith('/admin/departments')) {
    title = t.departments.title;
  } else if (pathname.startsWith('/admin/kpi-assignment')) {
    title = t.kpiAssignment.title;
  } else if (pathname.startsWith('/admin/kpi-tracking')) {
    title = t.kpiTracking.title;
  } else if (pathname.startsWith('/admin/approval')) {
    title = t.nav.approveReports;
  } else if (pathname.startsWith('/admin/notifications')) {
    title = t.nav.notifications;
  } else if (pathname.startsWith('/admin/settings')) {
    title = t.nav.settings;
  } else if (pathname.startsWith('/admin')) {
    title = t.dashboard.adminTitle;
  } else if (pathname.startsWith('/employee/profile')) {
    title = t.nav.profile;
  } else if (pathname.startsWith('/employee/calendar')) {
    title = t.nav.calendar;
  } else if (pathname.startsWith('/employee/reports')) {
    title = t.nav.personalReports;
  } else if (pathname.startsWith('/employee')) {
    title = t.dashboard.employeeTitle;
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
