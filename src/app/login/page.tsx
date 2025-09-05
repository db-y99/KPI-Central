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
  email: z.string().email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
});

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, user, loading } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // If auth is not loading and a user exists, redirect them.
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
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoggingIn(true);
    const result = await login(values.email, values.password);
    if (result.success) {
      toast({
        title: 'Thành công',
        description: 'Đăng nhập thành công! Đang chuyển hướng...',
      });
      // The useEffect hook above will handle the redirection once the user state is updated.
    } else {
      toast({
        variant: 'destructive',
        title: 'Lỗi đăng nhập',
        description: result.error || 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.',
      });
       setIsLoggingIn(false); // Only set loading to false on error
    }
  }

  // Show loading screen if the app is still checking for an existing session,
  // or if the user has already been authenticated and is waiting for redirection.
  if (loading || user) {
    return <Loading />;
  }
  
  // Show the login form
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Award className="size-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">KPI Central</CardTitle>
          <CardDescription>
            Vui lòng đăng nhập bằng Email và Mật khẩu của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: db@y99.vn"
                        {...field}
                        disabled={isLoggingIn}
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoggingIn}
                        type="password"
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
           <p className="mt-6 text-center text-xs text-muted-foreground">
             Tài khoản quản trị viên mặc định: <br />
             Email: <span className="font-mono">db@y99.vn</span> <br/>
             Mật khẩu: <span className="font-mono">Dby996868@</span>
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
