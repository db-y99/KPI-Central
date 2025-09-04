'use client';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { departments } from '@/lib/data';
import type { Kpi } from '@/types';

const kpiSchema = z.object({
  name: z.string().min(1, 'Tên KPI không được để trống.'),
  description: z.string().min(1, 'Mô tả không được để trống.'),
  department: z.string().min(1, 'Vui lòng chọn phòng ban.'),
  unit: z.string().min(1, 'Đơn vị không được để trống.'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually'], {
    errorMap: () => ({ message: 'Vui lòng chọn tần suất hợp lệ.' }),
  }),
  formula: z.string().optional(),
});

type KpiFormValues = z.infer<typeof kpiSchema>;

interface AddKpiFormProps {
  onSave: (data: Kpi) => void;
  onClose: () => void;
}

export default function AddKpiForm({ onSave, onClose }: AddKpiFormProps) {
  const form = useForm<KpiFormValues>({
    resolver: zodResolver(kpiSchema),
    defaultValues: {
      name: '',
      description: '',
      department: '',
      unit: '',
      frequency: 'monthly',
      formula: '',
    },
  });

  const onSubmit = (data: KpiFormValues) => {
    // In a real app, this would be an API call.
    // For now, we'll just create a new KPI object with a temporary ID.
    const newKpi: Kpi = {
      id: `kpi${Date.now()}`, // Temporary unique ID
      ...data,
    };
    onSave(newKpi);
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
              <FormLabel>Tên KPI</FormLabel>
              <FormControl>
                <Input placeholder="VD: Doanh số bán hàng" {...field} />
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
                  placeholder="Mô tả chi tiết về KPI..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="department"
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
                      <SelectItem key={dept.id} value={dept.name}>
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
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đơn vị</FormLabel>
                <FormControl>
                  <Input placeholder="VD: VND, %, Khách hàng" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tần suất đo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tần suất" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Hằng ngày</SelectItem>
                  <SelectItem value="weekly">Hằng tuần</SelectItem>
                  <SelectItem value="monthly">Hằng tháng</SelectItem>
                  <SelectItem value="quarterly">Hằng quý</SelectItem>
                  <SelectItem value="annually">Hằng năm</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="formula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Công thức tính (tùy chọn)</FormLabel>
              <FormControl>
                <Input placeholder="VD: (Số khách hàng / Số leads) * 100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit">Lưu KPI</Button>
        </div>
      </form>
    </Form>
  );
}
