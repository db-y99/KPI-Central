'use client';
import type { ReactNode } from 'react';
import { useState, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BarChart2,
  Award,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  Target,
  Users,
  LogOut,
  User,
  Gift,
  Settings,
  FileCheck,
  TrendingUp,
} from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import DashboardHeader from './dashboard-header';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { LanguageSwitcher } from './language-switcher';
import NotificationSystem from './notification-system';
import { ThemeToggle } from './theme-toggle';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isAdmin = user?.role === 'admin';

  // Navigation theo workflow 6 giai đoạn
  const navLinks = [
    {
      href: isAdmin ? '/admin' : '/employee',
      label: t.nav.dashboard,
      icon: Home,
      isActive: pathname === '/admin' || pathname === '/employee',
      key: 'dashboard',
    },
    // Khởi tạo & Cấu hình (Admin only)
    ...(isAdmin ? [{
      href: '/admin/setup',
      label: t.nav.settings,
      icon: Settings,
      isActive: pathname.startsWith('/admin/setup') || 
                pathname.startsWith('/admin/management') ||
                pathname.startsWith('/admin/employees') ||
                pathname.startsWith('/admin/departments') ||
                pathname.startsWith('/admin/kpi-definitions'),
      key: 'settings',
    }] : []),
    // Nộp báo cáo (Nhân viên) & Duyệt (Admin)
    ...(isAdmin ? [{
      href: '/admin/approval',
      label: t.nav.approveReports,
      icon: FileCheck,
      isActive: pathname.startsWith('/admin/approval'),
      key: 'approve-reports',
    }] : [{
      href: '/employee/reports',
      label: t.nav.submitReports,
      icon: Target,
      isActive: pathname.startsWith('/employee/reports'),
      key: 'submit-reports',
    }]),
    // Theo dõi KPI
    ...(isAdmin ? [{
      href: '/admin/kpi-tracking',
      label: t.nav.kpis,
      icon: TrendingUp,
      isActive: pathname.startsWith('/admin/kpi-tracking') ||
                pathname.startsWith('/admin/kpi-metrics') ||
                pathname.startsWith('/admin/metrics'),
      key: 'kpi-tracking',
    }] : []),
    // Đánh giá - Thưởng/Phạt (Admin only)
    ...(isAdmin ? [{
      href: '/admin/evaluation',
      label: t.nav.evaluation,
      icon: Gift,
      isActive: pathname.startsWith('/admin/evaluation') ||
                pathname.startsWith('/admin/rewards') ||
                pathname.startsWith('/admin/reward-programs') ||
                pathname.startsWith('/admin/reward-calculations'),
      key: 'evaluation',
    }] : []),
    // Báo cáo & Xuất file (Admin only)
    ...(isAdmin ? [{
      href: '/admin/reports',
      label: t.nav.analytics,
      icon: BarChart2,
      isActive: pathname.startsWith('/admin/reports'),
      key: 'analytics',
    }] : []),
    // Profile (Employee only)
    ...(!isAdmin ? [{
      href: '/employee/profile',
      label: t.nav.profile,
      icon: User,
      isActive: pathname.startsWith('/employee/profile'),
      key: 'employee-profile',
    }] : []),
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border">
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-sidebar-border',
          !isCollapsed ? 'justify-between px-4' : 'justify-center'
        )}
      >
        <div className={cn('flex items-center gap-2', isCollapsed && 'hidden')}>
          <Award className="size-7 text-primary" />
          <span className="text-xl font-semibold text-sidebar-foreground">KPI Central</span>
        </div>
        <div
          className={cn(
            'flex items-center',
            isCollapsed ? 'w-full justify-center' : ''
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={toggleSidebar}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto p-2">
        <TooltipProvider delayDuration={0}>
          {navLinks.map((link) => (
            <Tooltip key={link.key} disableHoverableContent={!isCollapsed}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant={link.isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full p-3 nav-item',
                    link.isActive && 'nav-item-active',
                    !isCollapsed ? 'justify-start h-auto' : 'justify-center h-12'
                  )}
                >
                  <Link 
                    href={link.href} 
                    className={cn(
                      'flex',
                      isCollapsed ? 'flex-col items-center justify-center' : 'flex-col items-start'
                    )}
                  >
                    <div className={cn('flex items-center w-full', isCollapsed && 'justify-center')}>
                      <link.icon className="size-5" />
                      <span className={cn('ml-4 font-medium', isCollapsed && 'hidden')}>
                        {link.label}
                      </span>
                    </div>
                  </Link>
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <div>
                    <p className="font-medium">{link.label}</p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      {/* User section */}
      <div className="mt-auto shrink-0 border-t border-gray-200 p-2">
        <Separator className={cn('my-2', isCollapsed && 'hidden')} />
        <TooltipProvider delayDuration={0}>
          <Tooltip disableHoverableContent={!isCollapsed}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-md p-2 text-sm text-black',
                  isCollapsed && 'justify-center'
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user?.avatar}
                    alt={user?.name}
                    data-ai-hint="person"
                  />
                  <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div
                  className={cn('flex flex-col', isCollapsed && 'hidden')}
                >
                  <span className="font-semibold leading-tight text-black">
                    {user?.name}
                  </span>
                  <span className="text-xs text-gray-600">
                    {user?.position}
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">
                {user && (
                    <>
                        <p>{user.name}</p>
                        <p className="text-muted-foreground">{user.position}</p>
                    </>
                )}
            </TooltipContent>}
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={0}>
          <Tooltip disableHoverableContent={!isCollapsed}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn('mt-1 w-full', !isCollapsed && 'justify-start')}
                onClick={handleLogout}
              >
                <LogOut className="size-5" />
                <span className={cn('ml-4', isCollapsed && 'hidden')}>
                  {t.nav.logout}
                </span>
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">{t.nav.logout}</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  const mainContent = (
    <div className="relative flex h-screen flex-1 flex-col overflow-y-auto">
       <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
         <DashboardHeader />
         <div className="flex items-center gap-2">
           <ThemeToggle />
           <NotificationSystem />
           <LanguageSwitcher />
         </div>
       </header>
      <main className="flex-1 bg-muted/30">{children}</main>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen w-full">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <PanelLeft className="size-5" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Award className="size-7 text-primary" />
            <span className="text-lg font-semibold">KPI Central</span>
          </div>
           {/* We need to render a slimmed down header for mobile */}
           <DashboardHeader />
        </header>
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={cn(
          'hidden h-full border-r transition-all duration-300 ease-in-out md:flex md:flex-col',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>
      {mainContent}
    </div>
  );
}

