'use client';
import type { ReactNode } from 'react';
import { useState, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BarChart2,
  BarChart3,
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
  FileText,
  TrendingUp,
  Building2,
  Bell,
  Calendar,
  UserPlus,
  Database,
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
import Logo from './logo';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isAdmin = user?.role === 'admin';

  // Navigation đơn giản - chỉ các chức năng CỐT LÕI cho đánh giá KPI
  const navLinks = [
    {
      href: isAdmin ? '/admin' : '/employee',
      label: t.nav.dashboard as unknown as string,
      icon: Home,
      isActive: pathname === '/admin' || pathname === '/employee',
      key: 'dashboard',
    },
    // Quản lý nhân viên (Admin only)
    ...(isAdmin ? [{
      href: '/admin/employees',
      label: t.nav.allEmployees as string,
      icon: Users,
      isActive: pathname.startsWith('/admin/employees'),
      key: 'employees',
    }] : []),
    // Quản lý phòng ban (Admin only)
    ...(isAdmin ? [{
      href: '/admin/departments',
      label: t.departments.title as unknown as string,
      icon: Building2,
      isActive: pathname.startsWith('/admin/departments'),
      key: 'departments',
    }] : []),
    // Quản lý KPI (Admin only)
    ...(isAdmin ? [{
      href: '/admin/kpi-definitions',
      label: t.nav.defineKpi as string,
      icon: Target,
      isActive: pathname.startsWith('/admin/kpi-definitions'),
      key: 'kpi-definitions',
    }] : []),
    // Giao KPI (Admin only)
    ...(isAdmin ? [{
      href: '/admin/kpi-assignment',
      label: t.nav.assignKpi as string,
      icon: UserPlus,
      isActive: pathname.startsWith('/admin/kpi-assignment'),
      key: 'kpi-assignment',
    }] : []),
    // Theo dõi KPI (Admin only)
    ...(isAdmin ? [{
      href: '/admin/kpi-tracking',
      label: t.nav.trackKpi as string,
      icon: TrendingUp,
      isActive: pathname.startsWith('/admin/kpi-tracking'),
      key: 'kpi-tracking',
    }] : []),
    // Duyệt báo cáo (Admin only)
    ...(isAdmin ? [{
      href: '/admin/approval',
      label: t.nav.approveReports as string,
      icon: FileCheck,
      isActive: pathname.startsWith('/admin/approval'),
      key: 'approval',
    }] : []),
    // Đánh giá & Thưởng (Admin only)
    ...(isAdmin ? [{
      href: '/admin/evaluation',
      label: t.nav.evaluateReward as string,
      icon: Gift,
      isActive: pathname.startsWith('/admin/evaluation'),
      key: 'evaluation',
    }] : []),
    // Báo cáo (Admin only)
    ...(isAdmin ? [{
      href: '/admin/reports',
      label: t.nav.reports as string,
      icon: BarChart3,
      isActive: pathname.startsWith('/admin/reports'),
      key: 'reports',
    }] : []),
    // Profile (Employee only)
    ...(!isAdmin ? [{
      href: '/employee/profile',
      label: t.nav.profile as string,
      icon: User,
      isActive: pathname.startsWith('/employee/profile'),
      key: 'employee-profile',
    }] : []),
    // Báo cáo cá nhân (Employee only)
    ...(!isAdmin ? [{
      href: '/employee/reports',
      label: t.nav.personalReports as string,
      icon: FileText,
      isActive: pathname.startsWith('/employee/reports'),
      key: 'employee-reports',
    }] : []),
    // Seed Data (Admin only)
    ...(isAdmin ? [{
      href: '/admin/seed-data',
      label: 'Seed Data',
      icon: Database,
      isActive: pathname.startsWith('/admin/seed-data'),
      key: 'seed-data',
    }] : []),
  ];

  const sidebarContent = (
    <div 
      className={cn(
        "flex h-full flex-col text-sidebar-foreground border-r border-sidebar-border shadow-lg sidebar-backdrop",
        "sidebar-container",
        isCollapsed ? "sidebar-collapsed" : "sidebar-expanded"
      )}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-sidebar-border',
          'justify-center px-4'
        )}
      >
        <div className="flex items-center justify-center mt-2">
          <Logo 
            size={isCollapsed ? "xl" : "2xl"} 
            showText={false} 
            className="sidebar-logo transition-all duration-300 ease-in-out hover:scale-110" 
          />
        </div>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
        <TooltipProvider delayDuration={0}>
          {navLinks.map((link) => (
            <Tooltip key={link.key} disableHoverableContent={!isCollapsed}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant={link.isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full p-3 nav-item h-12',
                    link.isActive && 'nav-item-active',
                    !isCollapsed ? 'justify-start' : 'justify-center'
                  )}
                >
                  <Link 
                    href={link.href} 
                    className="flex items-center relative z-10"
                  >
                    <link.icon className="size-5 flex-shrink-0" />
                    <span className={cn(
                      'ml-3 font-medium transition-opacity duration-300',
                      isCollapsed && 'hidden'
                    )}>
                      {link.label}
                    </span>
                  </Link>
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="sidebar-tooltip">
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
        <Separator className={cn('my-2 transition-all duration-300', isCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100')} />
        <TooltipProvider delayDuration={0}>
          <Tooltip disableHoverableContent={!isCollapsed}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-md p-2 text-sm text-black transition-all duration-300 hover:bg-accent/50',
                  isCollapsed && 'justify-center'
                )}
              >
                <Avatar className="h-9 w-9 transition-transform duration-300 hover:scale-110">
                  <AvatarImage
                    src={user?.avatar}
                    alt={user?.name}
                    data-ai-hint="person"
                  />
                  <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'flex flex-col transition-opacity duration-300',
                    isCollapsed && 'hidden'
                  )}
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
            {isCollapsed && <TooltipContent side="right" className="sidebar-tooltip">
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
                className={cn('mt-1 w-full h-12', !isCollapsed && 'justify-start')}
                onClick={handleLogout}
              >
                <LogOut className="size-5 flex-shrink-0" />
                <span className={cn(
                  'ml-3 transition-opacity duration-300',
                  isCollapsed && 'hidden'
                )}>
                  {t.nav.logout}
                </span>
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right" className="sidebar-tooltip">{t.nav.logout}</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  const mainContent = (
    <div className="relative flex h-screen flex-col overflow-y-auto">
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
                <span className="sr-only">{t.ui.openMenu}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <Logo size="md" showText={true} />
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
    <div className="flex h-screen bg-background relative">
      <aside
        className={cn(
          'hidden h-full border-r transition-all duration-300 ease-in-out md:flex md:flex-col absolute left-0 top-0 z-50 bg-white dark:bg-gray-900 shadow-lg',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>
      <div className="flex-1 ml-16">
        {mainContent}
      </div>
    </div>
  );
}

