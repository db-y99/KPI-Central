'use client';

import { useState, useContext } from 'react';
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

const formSchema = z.object({
  employeeId: z.string().min(1, 'Mã nhân viên không được để trống.'),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const success = login(values.employeeId);
    if (success) {
      toast({
        title: 'Thành công',
        description: 'Đăng nhập thành công!',
      });
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Mã nhân viên không tồn tại. Vui lòng thử lại.',
      });
      setIsLoading(false);
    }
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Đăng nhập
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Sử dụng ID: e1, e2, e3, e4, hoặc e5 để đăng nhập.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
