'use client';
import type { ReactNode } from 'react';
import { useState, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, Award, ChevronLeft, ChevronRight, PanelLeft } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import DashboardHeader from './dashboard-header';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useContext(AuthContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-card text-card-foreground">
      <div className={cn("flex h-16 items-center border-b px-4", !isCollapsed ? "justify-between" : "justify-center")}>
         <div className={cn("flex items-center gap-2", isCollapsed ? "hidden" : "flex")}>
            <Award className="size-7 text-primary" />
            <span className="text-xl font-semibold">KPI Central</span>
         </div>
         <div className={cn("flex items-center", isCollapsed ? 'w-full justify-center' : '')}>
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
              {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
              <span className="sr-only">Thu gọn Sidebar</span>
            </Button>
         </div>
      </div>
      <nav className="flex-1 space-y-2 p-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant={pathname === '/' ? 'secondary' : 'ghost'}
                className={cn("w-full", !isCollapsed && "justify-start")}
              >
                <Link href="/">
                  <Home className="size-5" />
                  <span className={cn("ml-4", isCollapsed && "hidden")}>Bảng điều khiển</span>
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Bảng điều khiển</TooltipContent>}
          </Tooltip>
          {user?.position.toLowerCase().includes('manager') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant={pathname.startsWith('/reports') ? 'secondary' : 'ghost'}
                  className={cn("w-full", !isCollapsed && "justify-start")}
                >
                  <Link href="/reports">
                    <BarChart2 className="size-5" />
                    <span className={cn("ml-4", isCollapsed && "hidden")}>Báo cáo</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">Báo cáo</TooltipContent>}
            </Tooltip>
          )}
        </TooltipProvider>
      </nav>
    </div>
  );

  const mainContent = (
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          title={pathname.startsWith('/reports') ? "Báo cáo" : "Bảng điều khiển"}
        />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
  )

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
            <SheetContent side="left" className="w-[250px] p-0">
               {sidebarContent}
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
              <Award className="size-7 text-primary" />
              <span className="text-lg font-semibold">KPI Central</span>
          </div>
          <DashboardHeader title="" />
        </header>
         <div className="flex flex-1 flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto bg-background">
              {children}
            </main>
         </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "hidden md:flex md:flex-col transition-all duration-300 ease-in-out border-r",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>
      {mainContent}
    </div>
  );
}
