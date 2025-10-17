'use client';

import { useState, useEffect, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { createUserAction } from '@/lib/server-actions';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/language-context';
import type { Department, Employee, CreateEmployeeFormValues, EditEmployeeFormValues } from '@/types';

const createEmployeeSchema = (t: any) => z.object({
  name: z.string().min(1, t.employees.nameRequired),
  email: z.string().email(t.employees.emailInvalid),
  position: z.string().min(1, t.employees.positionRequired),
  departmentId: z.string().min(1, t.employees.departmentRequired),
  role: z.enum(['admin', 'employee'], {
    errorMap: () => ({ message: t.employees.roleRequired as string }),
  }),
  username: z.string().min(1, t.employees.usernameRequired || 'Username is required'),
  password: z.string().min(6, t.employees.passwordMinLength || 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, t.employees.passwordMinLength || 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: t.employees.passwordMismatch || 'Passwords do not match',
  path: ['confirmPassword'],
});

const editEmployeeSchema = (t: any) => z.object({
  name: z.string().min(1, t.employees.nameRequired),
  email: z.string().email(t.employees.emailInvalid),
  position: z.string().min(1, t.employees.positionRequired),
  departmentId: z.string().min(1, t.employees.departmentRequired),
  role: z.enum(['admin', 'employee'], {
    errorMap: () => ({ message: t.employees.roleRequired as string }),
  }),
});

// Types are imported from @/types

interface EmployeeFormProps {
  mode: 'add' | 'edit';
  employee?: Employee;
  onSave: (data: Employee) => void;
  onClose: () => void;
}

export default function EmployeeForm({ mode, employee, onSave, onClose }: EmployeeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  const isEditMode = mode === 'edit';
  const schema = isEditMode ? editEmployeeSchema(t) : createEmployeeSchema(t);

  const form = useForm<CreateEmployeeFormValues | EditEmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEditMode ? {
      name: employee?.name || '',
      email: employee?.email || '',
      position: employee?.position || '',
      departmentId: employee?.departmentId || '',
      role: employee?.role || 'employee',
    } : {
      name: '',
      email: '',
      position: '',
      departmentId: '',
      role: 'employee',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Auto-generate username from email
  useEffect(() => {
    if (!isEditMode && form.watch('email')) {
      const email = form.watch('email');
      const username = email.split('@')[0];
      form.setValue('username', username);
    }
  }, [form.watch('email'), isEditMode, form]);

  // Load departments from Firestore
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const departmentsRef = collection(db, 'departments');
        const q = query(departmentsRef, where('isActive', '==', true), orderBy('name'));
        const querySnapshot = await getDocs(q);
        
        const departmentsData: Department[] = [];
        querySnapshot.forEach((doc) => {
          departmentsData.push({ id: doc.id, ...doc.data() } as Department);
        });
        
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast({
          variant: 'destructive',
          title: t.common.error as string,
          description: 'Không thể tải danh sách phòng ban.',
        });
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [toast, t]);


  const onSubmit = async (data: CreateEmployeeFormValues | EditEmployeeFormValues) => {
    if (isEditMode) {
      // Handle edit mode
      setIsSubmitting(true);
      try {
        const editData = data as EditEmployeeFormValues;
        const employeeRef = doc(db, 'employees', employee!.id);
        await updateDoc(employeeRef, {
          name: editData.name,
          email: editData.email,
          position: editData.position,
          departmentId: editData.departmentId,
          role: editData.role,
          updatedAt: new Date().toISOString(),
        });

        const updatedEmployee: Employee = {
          ...employee!,
          ...editData,
        };

        onSave(updatedEmployee);
        toast({
          title: t.common.success,
          description: `${t.employees.updateSuccess || 'Employee updated successfully'}: "${editData.name}".`
        });
      } catch (error) {
        console.error('Error updating employee:', error);
        toast({
          variant: 'destructive',
          title: t.common.error as string,
          description: 'Không thể cập nhật thông tin nhân viên.',
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Handle add mode
      const createData = data as CreateEmployeeFormValues;
      startTransition(async () => {
        try {
          const result = await createUserAction({
            name: createData.name,
            email: createData.email,
            username: createData.email.split('@')[0], // Tự động tạo từ email
            password: '123456', // Mật khẩu mặc định
            position: createData.position,
            departmentId: createData.departmentId,
            role: createData.role,
            phone: '', // Để trống
            address: '', // Để trống
            startDate: new Date().toISOString().split('T')[0], // Ngày hiện tại
            employeeId: `EMP${Date.now()}`, // Tự động tạo mã nhân viên
          });

          if (result.success) {
            const newEmployee: Employee = {
              id: result.userId || `emp_${Date.now()}`,
              name: createData.name,
              email: createData.email,
              username: createData.email.split('@')[0],
              position: createData.position,
              departmentId: createData.departmentId,
              role: createData.role,
              phone: '',
              address: '',
              startDate: new Date().toISOString().split('T')[0],
              employeeId: `EMP${Date.now()}`,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            onSave(newEmployee);
            toast({
              title: t.common.success,
              description: `${t.employees.createSuccess || 'Account created successfully'}: "${createData.name}".`
            });
          } else {
            throw new Error(result.error || 'Failed to create user');
          }
        } catch (error) {
          console.error('Error creating employee:', error);
          toast({
            variant: 'destructive',
            title: t.common.error as string,
            description: error instanceof Error ? error.message : 'Không thể tạo tài khoản nhân viên.',
          });
        }
      });
    }
  };

  if (loadingDepartments) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">{t.common.loading || 'Loading...'}</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">{t.employees.basicInfo}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.name as string} <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t.employees.enterFullName} 
                      {...field} 
                      disabled={isPending || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.email as string} <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder={t.employees.enterEmail} 
                      {...field} 
                      disabled={isPending || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.position as string} <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t.employees.enterPosition} 
                      {...field} 
                      disabled={isPending || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.department as string} <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending || isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.employees.selectDepartment} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.role as string} <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending || isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.employees.selectRole || 'Select Role'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="employee">{t.employees.employeeRole as string}</SelectItem>
                      <SelectItem value="admin">{t.employees.adminRole as string}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Thông tin đăng nhập */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">{t.employees.loginCredentials}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.employees.username as string} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="username" 
                        {...field} 
                        disabled={isPending || isSubmitting}
                        readOnly
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
                    <FormLabel>{t.employees.loginPassword as string} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder={t.employees.passwordForEmployeeLogin} 
                        {...field} 
                        disabled={isPending || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.employees.confirmPassword as string} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder={t.employees.confirmPassword} 
                        {...field} 
                        disabled={isPending || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {t.employees.employeeWillUseEmailPassword}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isPending || isSubmitting}
          >
            {t.common.cancel}
          </Button>
          <Button 
            type="submit" 
            disabled={isPending || isSubmitting}
            className="min-w-[120px]"
          >
            {isPending || isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? (t.common.updating || 'Updating...') : (t.common.creating || 'Creating...')}
              </>
            ) : (
              isEditMode ? (t.employees.update || 'Update') : (t.employees.createAccount || 'Create Account')
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
