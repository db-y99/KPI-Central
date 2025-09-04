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
  ListPlus,
  Target,
  Users,
  LogOut,
  User,
  Medal,
} from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
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

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useContext(AuthContext);
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

  const navLinks = [
    {
      href: isAdmin ? '/admin' : '/employee',
      label: 'Bảng điều khiển',
      icon: Home,
      isActive: pathname === '/admin' || pathname === '/employee',
    },
    {
      href: '/employee/profile',
      label: 'Hồ sơ cá nhân',
      icon: User,
      isActive: pathname.startsWith('/employee/profile'),
      isEmployeeOnly: true,
    },
    {
      href: '/admin/kpi-definitions',
      label: 'Quản lý KPI',
      icon: ListPlus,
      isActive: pathname.startsWith('/admin/kpi-definitions'),
      isAdminOnly: true,
    },
    {
      href: '/admin/employees',
      label: 'Quản lý nhân viên',
      icon: Users,
      isActive: pathname.startsWith('/admin/employees'),
      isAdminOnly: true,
    },
    {
      href: '/admin/kpi-assignment',
      label: 'Giao KPI',
      icon: Target,
      isActive: pathname.startsWith('/admin/kpi-assignment'),
      isAdminOnly: true,
    },
    {
      href: '/admin/reports',
      label: 'Báo cáo',
      icon: BarChart2,
      isActive: pathname.startsWith('/admin/reports'),
      isAdminOnly: true,
    },
     {
      href: '/admin/reviews',
      label: 'Đánh giá & Xếp loại',
      icon: Medal,
      isActive: pathname.startsWith('/admin/reviews'),
      isAdminOnly: true,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col bg-card text-card-foreground">
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b',
          !isCollapsed ? 'justify-between px-4' : 'justify-center'
        )}
      >
        <div className={cn('flex items-center gap-2', isCollapsed && 'hidden')}>
          <Award className="size-7 text-primary" />
          <span className="text-xl font-semibold">KPI Central</span>
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
            <span className="sr-only">Thu gọn Sidebar</span>
          </Button>
        </div>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto p-2">
        <TooltipProvider delayDuration={0}>
          {navLinks.map(
            link =>
              ((!link.isAdminOnly && !link.isEmployeeOnly) || (link.isAdminOnly && isAdmin) || (link.isEmployeeOnly && !isAdmin)) && (
                <Tooltip key={link.label} disableHoverableContent={!isCollapsed}>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant={link.isActive ? 'secondary' : 'ghost'}
                      className={cn('w-full', !isCollapsed && 'justify-start')}
                    >
                      <Link href={link.href}>
                        <link.icon className="size-5" />
                        <span className={cn('ml-4', isCollapsed && 'hidden')}>
                          {link.label}
                        </span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{link.label}</TooltipContent>
                </Tooltip>
              )
          )}
        </TooltipProvider>
      </nav>

      {/* User section */}
      <div className="mt-auto shrink-0 border-t p-2">
        <Separator className={cn('my-2', isCollapsed && 'hidden')} />
        <TooltipProvider delayDuration={0}>
          <Tooltip disableHoverableContent={!isCollapsed}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-md p-2 text-sm',
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
                  <span className="font-semibold leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user?.position}
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
                {user && (
                    <>
                        <p>{user.name}</p>
                        <p className="text-muted-foreground">{user.position}</p>
                    </>
                )}
            </TooltipContent>
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
                  Đăng xuất
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Đăng xuất</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  const mainContent = (
    <div className="relative flex h-screen flex-1 flex-col overflow-y-auto">
       <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
         <DashboardHeader />
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
                <span className="sr-only">Mở menu</span>
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
