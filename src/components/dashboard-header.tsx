'use client';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthContext } from '@/context/auth-context';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';


interface DashboardHeaderProps {
  title: string;
  user?: Employee;
}

export default function DashboardHeader({ title, user }: DashboardHeaderProps) {
  const { logout } = useContext(AuthContext);
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  return (
     <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {isMobile && (
             <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-4">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Mở Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] p-0">
                  {/* The sidebar content will be managed by AppShell now */}
              </SheetContent>
            </Sheet>
          )}
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        </div>
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.position}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
            <DropdownMenuItem>Cài đặt</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
