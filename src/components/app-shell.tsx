'use client';
import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, Award } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useContext(AuthContext);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Award className="size-7 text-primary" />
            <span className="text-xl font-semibold">KPI Central</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/'}
                size="lg"
                tooltip="Bảng điều khiển"
              >
                <Link href="/">
                  <Home />
                  <span>Bảng điều khiển</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/reports')}
                size="lg"
                tooltip="Báo cáo"
              >
                <Link href="/reports">
                  <BarChart2 />
                  <span>Báo cáo</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
