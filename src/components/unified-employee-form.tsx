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
import type { Department, Employee } from '@/types';

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

const editEmployeeSchema = (t: any) => z.object({
  name: z.string().min(1, t.employees.nameRequired),
  email: z.string().email(t.employees.emailInvalid),
  position: z.string().min(1, t.employees.positionRequired),
  departmentId: z.string().min(1, t.employees.departmentRequired),
  role: z.enum(['admin', 'employee'], {
    errorMap: () => ({ message: t.employees.roleRequired as string }),
  }),
});

type CreateEmployeeFormValues = z.infer<ReturnType<typeof createEmployeeSchema>>;
type EditEmployeeFormValues = z.infer<ReturnType<typeof editEmployeeSchema>>;

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
      username: '',
      password: '',
      confirmPassword: '',
      position: '',
      departmentId: '',
      role: 'employee',
      phone: '',
      address: '',
      startDate: '',
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
  }, [toast, t]);

  const handleNameChange = (name: string) => {
    if (!isEditMode) {
      const username = name.toLowerCase().replace(/\s+/g, '.');
      form.setValue('username', username);
    }
  };

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
          title: "Thành công!",
          description: `Đã cập nhật thông tin nhân viên "${editData.name}".`
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
            username: createData.username,
            password: createData.password,
            position: createData.position,
            departmentId: createData.departmentId,
            role: createData.role,
            phone: createData.phone || '',
            address: createData.address || '',
            startDate: createData.startDate,
            employeeId: createData.employeeId,
          });

          if (result.success) {
            const newEmployee: Employee = {
              id: result.userId || `emp_${Date.now()}`,
              name: createData.name,
              email: createData.email,
              username: createData.username,
              position: createData.position,
              departmentId: createData.departmentId,
              role: createData.role,
              phone: createData.phone || '',
              address: createData.address || '',
              startDate: createData.startDate,
              employeeId: createData.employeeId,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            onSave(newEmployee);
            toast({
              title: "Thành công!",
              description: `Đã tạo tài khoản cho nhân viên "${createData.name}".`
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
        <span className="ml-2">Đang tải danh sách phòng ban...</span>
      </div>
    );
  }

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
                      disabled={isPending || isSubmitting}
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
            
            {!isEditMode && (
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.employees.employeeId as string} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nhập mã nhân viên" 
                        {...field} 
                        disabled={isPending || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.email as string} <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Nhập email" 
                      {...field} 
                      disabled={isPending || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditMode && (
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.employees.username as string} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Tên đăng nhập" 
                        {...field} 
                        disabled={isPending || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
                      placeholder="Nhập chức vụ" 
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
                        <SelectValue placeholder="Chọn phòng ban" />
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
                        <SelectValue placeholder="Chọn vai trò" />
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

            {!isEditMode && (
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.employees.startDate as string} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        disabled={isPending || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {!isEditMode && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.employees.password as string} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Nhập mật khẩu" 
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.employees.confirmPassword as string} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Nhập lại mật khẩu" 
                        {...field} 
                        disabled={isPending || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Thông tin bổ sung */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Thông tin bổ sung</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {!isEditMode && (
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.employees.phone as string}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nhập số điện thoại" 
                        {...field} 
                        disabled={isPending || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!isEditMode && (
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.employees.address as string}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nhập địa chỉ" 
                        {...field} 
                        disabled={isPending || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={isPending || isSubmitting}
            className="min-w-[120px]"
          >
            {isPending || isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}
              </>
            ) : (
              isEditMode ? 'Cập nhật' : 'Tạo nhân viên'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
