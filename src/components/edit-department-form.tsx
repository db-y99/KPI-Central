'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useContext } from 'react';
import { DataContext } from '@/context/data-context';
import type { Department } from '@/types';

const departmentSchema = z.object({
  name: z.string().min(1, 'Tên phòng ban là bắt buộc').max(100, 'Tên phòng ban không được vượt quá 100 ký tự'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface EditDepartmentFormProps {
  department: Department;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditDepartmentForm({ department, onClose, onSuccess }: EditDepartmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { updateDepartment } = useContext(DataContext);

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department.name,
      description: department.description || '',
      isActive: department.isActive,
    },
  });

  const onSubmit = async (data: DepartmentFormData) => {
    setIsSubmitting(true);
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await updateDepartment(department.id, updateData);
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật phòng ban thành công.',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể cập nhật phòng ban. Vui lòng thử lại.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên phòng ban *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Phòng Kinh doanh"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả về phòng ban..."
                        {...field}
                        disabled={isSubmitting}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Trạng thái hoạt động</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Phòng ban có đang hoạt động không?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          // Use setTimeout to defer the state update
                          setTimeout(() => {
                            field.onChange(checked);
                          }, 0);
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting} className="btn-gradient">
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
              </div>
            </form>
          </Form>
    </div>
  );
}
