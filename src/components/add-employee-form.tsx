'use client';

import { useContext } from 'react';
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
import type { Employee } from '@/types';
import { DataContext } from '@/context/data-context';

const employeeSchema = z.object({
  name: z.string().min(1, 'Tên nhân viên không được để trống.'),
  position: z.string().min(1, 'Chức vụ không được để trống.'),
  departmentId: z.string().min(1, 'Vui lòng chọn phòng ban.'),
  role: z.enum(['admin', 'employee'], {
    errorMap: () => ({ message: 'Vui lòng chọn vai trò hợp lệ.' }),
  }),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface AddEmployeeFormProps {
  onSave: (data: Employee) => void;
  onClose: () => void;
}

export default function AddEmployeeForm({ onSave, onClose }: AddEmployeeFormProps) {
  const { departments } = useContext(DataContext);
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      position: '',
      departmentId: '',
      role: 'employee',
    },
  });

  const onSubmit = (data: EmployeeFormValues) => {
    const newEmployee: Employee = {
      id: `e${Date.now()}`, // Temporary unique ID
      avatar: `https://picsum.photos/seed/e${Date.now()}/100/100`,
      ...data,
    };
    onSave(newEmployee);
    onClose();
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
                <Input placeholder="VD: Trần Thị B" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
             <FormItem>
              <FormLabel>Chức vụ</FormLabel>
              <FormControl>
                <Input placeholder="VD: Sales Executive" {...field} />
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
          <Button type="submit">Lưu nhân viên</Button>
        </div>
      </form>
    </Form>
  );
}
