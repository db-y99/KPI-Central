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
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/language-context';
import type { Department } from '@/types';

const createEmployeeSchema = (t: any) => z.object({
  name: z.string().min(1, t.employees.nameRequired),
  email: z.string().email(t.employees.emailInvalid),
  username: z.string().min(3, t.employees.usernameMinLength).max(20, t.employees.usernameMaxLength),
  password: z.string().min(6, t.employees.passwordMinLength).max(50, t.employees.passwordMaxLength),
  confirmPassword: z.string().min(6, t.employees.passwordMinLength),
  position: z.string().min(1, t.employees.positionRequired),
  departmentId: z.string().min(1, t.employees.departmentRequired),
  role: z.enum(['admin', 'employee'], {
    errorMap: () => ({ message: t.employees.roleRequired as string }),
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
  startDate: z.string().min(1, t.employees.startDateRequired),
  employeeId: z.string().min(1, t.employees.employeeIdRequired),
}).refine((data) => data.password === data.confirmPassword, {
  message: t.employees.passwordMismatch as string,
  path: ["confirmPassword"],
});

type EmployeeFormValues = z.infer<ReturnType<typeof createEmployeeSchema>>;

interface AddEmployeeFormProps {
  onSave: () => void;
  onClose: () => void;
}

export default function AddEmployeeForm({ onSave, onClose }: AddEmployeeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema(t)),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      position: '',
      departmentId: '',
      role: 'employee',
      phone: '',
      address: '',
      startDate: new Date().toISOString().split('T')[0],
      employeeId: '',
    },
  });

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
  }, [toast]);

  // Auto-generate employee ID when name changes
  const handleNameChange = (value: string) => {
    const currentEmployeeId = form.getValues('employeeId');
    if (value && !currentEmployeeId) {
      const nameParts = value.trim().split(' ');
      if (nameParts.length >= 2) {
        const lastName = nameParts[nameParts.length - 1];
        const firstName = nameParts[0];
        const employeeId = `${lastName.toUpperCase()}${firstName.charAt(0).toUpperCase()}${Date.now().toString().slice(-3)}`;
        form.setValue('employeeId', employeeId);
      }
    }
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    startTransition(async () => {
      try {
        const result = await createUserAction(data);
        if (result.success) {
          toast({
            title: t.common.success as string,
            description: result.message || `${t.employees.saveSuccess as string} ${data.name}.`,
          });
          onSave();
          onClose();
        } else {
          throw new Error(result.error || 'Không thể tạo người dùng.');
        }
      } catch (error: any) {
        console.error('Failed to add employee:', error);
        toast({
          variant: 'destructive',
          title: t.common.error as string,
          description: error.message || t.employees.saveError,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Thông tin cơ bản</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.name as string} <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nhập họ và tên đầy đủ" 
                      {...field} 
                      disabled={isPending}
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã nhân viên <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="VD: NGUYENV123" 
                      {...field} 
                      disabled={isPending}
                      className="uppercase"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Mã sẽ được tự động tạo khi nhập tên, hoặc bạn có thể tự nhập
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Thông tin đăng nhập */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Thông tin đăng nhập</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="example@company.com" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Tên đăng nhập (3-20 ký tự)" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Tối thiểu 6 ký tự" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Nhập lại mật khẩu" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Thông tin công việc */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Thông tin công việc</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chức vụ <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Nhân viên IT, Trưởng phòng Marketing" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày bắt đầu làm việc <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phòng ban <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng ban" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingDepartments ? (
                        <SelectItem value="loading" disabled>
                          Đang tải...
                        </SelectItem>
                      ) : departments.length === 0 ? (
                        <SelectItem value="no-departments" disabled>
                          Chưa có phòng ban nào
                        </SelectItem>
                      ) : (
                        departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="employee">Nhân viên</SelectItem>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Thông tin liên hệ */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Thông tin liên hệ</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: 0123456789" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input placeholder="Địa chỉ nơi ở" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Nút submit */}
        <div className="flex justify-end pt-6 border-t">
          <Button type="submit" disabled={isPending} className="btn-gradient min-w-[120px]">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Đang tạo...' : 'Tạo nhân viên'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
