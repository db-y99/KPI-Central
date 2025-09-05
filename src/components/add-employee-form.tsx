'use client';

import { useState } from 'react';
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
import { createUser } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { DataContext } from '@/context/data-context';
import { useContext } from 'react';

const employeeSchema = z.object({
  name: z.string().min(1, 'Tên nhân viên không được để trống.'),
  email: z.string().email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
  position: z.string().min(1, 'Chức vụ không được để trống.'),
  departmentId: z.string().min(1, 'Vui lòng chọn phòng ban.'),
  role: z.enum(['admin', 'employee'], {
    errorMap: () => ({ message: 'Vui lòng chọn vai trò hợp lệ.' }),
  }),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface AddEmployeeFormProps {
  onSave: () => void;
  onClose: () => void;
}

export default function AddEmployeeForm({ onSave, onClose }: AddEmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { departments, addEmployee: refreshEmployeeList } = useContext(DataContext);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      position: '',
      departmentId: '',
      role: 'employee',
    },
  });

  const onSubmit = async (data: EmployeeFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createUser(data);
      if (result.success) {
        toast({
          title: 'Thành công',
          description: `Đã tạo tài khoản cho nhân viên ${data.name}.`,
        });
        await refreshEmployeeList(); // Refresh list after adding
        onSave();
        onClose();
      } else {
        throw new Error(result.error || 'Không thể tạo người dùng.');
      }
    } catch (error: any) {
      console.error('Failed to add employee:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể tạo nhân viên. Email có thể đã tồn tại.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên nhân viên</FormLabel>
              <FormControl>
                <Input placeholder="VD: Trần Thị B" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: b.tran@company.com" {...field} disabled={isSubmitting} />
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
                    <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chức vụ</FormLabel>
              <FormControl>
                <Input placeholder="VD: Sales Executive" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phòng ban</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map(dept => (
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
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vai trò</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
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
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu nhân viên
          </Button>
        </div>
      </form>
    </Form>
  );
}
