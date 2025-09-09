'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Award, Loader2, Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
import { AuthContext } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { LanguageSwitcher } from '@/components/language-switcher';
import Loading from '../loading';

// We'll create the schema inside the component to access translations

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, user, loading, isLoggingIn } = useContext(AuthContext);
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  // Create form schema with translations
  const formSchema = z.object({
    email: z
      .string()
      .min(1, t.auth.emailRequired)
      .email(t.auth.emailInvalid)
      .max(100, t.auth.emailMaxLength),
    password: z
      .string()
      .min(1, t.auth.passwordRequired)
      .min(6, t.auth.passwordMinLength)
      .max(50, t.auth.passwordMaxLength),
    rememberMe: z.boolean().optional(),
  });

  // Handle redirect for already logged in users
  useEffect(() => {
    console.log('🔄 useEffect triggered - loading:', loading, 'user:', user, 'isLoggingIn:', isLoggingIn);
    if (!loading && user && !isLoggingIn) {
      console.log('✅ Conditions met for redirect, user role:', user.role);
      if (user.role === 'admin') {
        console.log('👑 Redirecting to admin page from useEffect...');
        router.push('/admin');
      } else {
        console.log('👤 Redirecting to employee page from useEffect...');
        router.push('/employee');
      }
    }
  }, [user, loading, isLoggingIn, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Load saved email from localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      form.setValue('email', savedEmail);
      form.setValue('rememberMe', true);
    }
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('🚀 Starting login submission...');
    
    try {
      // Handle remember me functionality
      if (values.rememberMe) {
        localStorage.setItem('rememberedEmail', values.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      console.log('📞 Calling login function...');
      const result = await login(values.email, values.password);
      console.log('📋 Login result:', result);
      
      if (result.success && result.user) {
        console.log('✅ Login successful, user:', result.user);
        console.log('👤 User role:', result.user.role);
        
        toast({
          title: t.common.success,
          description: t.auth.loginSuccess + ' ' + t.auth.redirecting,
        });
        
        // Immediate redirect based on user role
        setTimeout(() => {
          console.log('🔄 Starting redirect...');
          if (result.user?.role === 'admin') {
            console.log('👑 Redirecting to admin page...');
            router.push('/admin');
          } else {
            console.log('👤 Redirecting to employee page...');
            router.push('/employee');
          }
        }, 500); // Small delay to show success message
        
      } else {
        console.log('❌ Login failed:', result.error);
        toast({
          variant: 'destructive',
          title: t.auth.loginError,
          description: result.error || t.auth.invalidCredentials,
        });
      }
    } catch (error) {
      console.error('❌ Login submission error:', error);
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.auth.systemError,
      });
    }
  }

  // Show a loading screen while the initial auth state is being determined.
  // After that, if a user is found, the useEffect will redirect.
  // If no user is found, the login form will be displayed.
  if (loading) {
    return <Loading />;
  }
  
  // Show the login form only if auth is done and there's no user.
  // If there's a user, the useEffect will soon redirect, so we can show a loader
  // to prevent the form from flashing briefly.
  if (user) {
    return <Loading />;
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <Card className="card-elevated">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 gradient-primary rounded-full shadow-lg">
              <Award className="size-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              {t.auth.loginTitle}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              {t.auth.loginSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        {t.auth.email}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                          <Input
                            placeholder={t.auth.email}
                            {...field}
                            disabled={isLoggingIn}
                            type="email"
                            className="input-modern pl-10 h-12"
                          />
                        </div>
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
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t.auth.password}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                          <Input
                            placeholder={t.auth.password}
                            {...field}
                            disabled={isLoggingIn}
                            type={showPassword ? "text" : "password"}
                            className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={isLoggingIn}
                          >
                            {showPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoggingIn}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-gray-600 cursor-pointer">
                          {t.auth.rememberMe}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={isLoggingIn} 
                  className="btn-gradient w-full h-12"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.auth.loggingIn}
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      {t.auth.loginButton}
                    </>
                  )}
                </Button>
              </form>
            </Form>
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t.auth.adminAccount}
                </p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>
                    <span className="font-mono bg-white px-2 py-1 rounded border">db@y99.vn</span>
                  </p>
                  <p>
                    <span className="font-mono bg-white px-2 py-1 rounded border">Dby996868@</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
