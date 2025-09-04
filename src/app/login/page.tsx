'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Award, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import Loading from '../loading';

const formSchema = z.object({
  employeeId: z.string().min(1, 'Mã nhân viên không được để trống.'),
});

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, user, loading } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // If the user is already logged in, redirect them away from the login page.
    if (!loading && user) {
       if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/employee');
      }
    }
  }, [user, loading, router]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoggingIn(true);
    const success = login(values.employeeId);
    if (success) {
      toast({
        title: 'Thành công',
        description: 'Đăng nhập thành công! Đang chuyển hướng...',
      });
      // The useEffect will handle redirection.
    } else {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Mã nhân viên không tồn tại. Vui lòng thử lại.',
      });
      setIsLoggingIn(false);
    }
  }

  const handleQuickLogin = (employeeId: string) => {
    form.setValue('employeeId', employeeId);
    // Directly call onSubmit without waiting for form state to update
    onSubmit({ employeeId });
  };


  // Show loading screen if we are still checking auth state or if user is logged in (and redirecting)
  if (loading || user) {
    return <Loading />;
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Award className="size-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">KPI Central</CardTitle>
          <CardDescription>
            Vui lòng đăng nhập bằng Mã Nhân viên của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã nhân viên</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: e1"
                        {...field}
                        disabled={isLoggingIn}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoggingIn} className="w-full">
                {isLoggingIn && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Đăng nhập
              </Button>
            </form>
          </Form>

          <div className="mt-4 grid grid-cols-2 gap-3">
             <Button variant="outline" onClick={() => handleQuickLogin('e1')} disabled={isLoggingIn}>
                Đăng nhập (Nhân viên)
             </Button>
              <Button variant="outline" onClick={() => handleQuickLogin('e2')} disabled={isLoggingIn}>
                Đăng nhập (Admin)
              </Button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Nhân viên: e1, e3, e4, e5 | Admin: e2
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
