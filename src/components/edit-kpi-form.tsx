'use client';

import { useContext, useEffect, useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import type { Kpi, Department } from '@/types';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { DataContext } from '@/context/data-context';

const editKpiSchema = (t: any) => z.object({
  name: z.string().min(1, t.kpis.nameRequired || 'Tên KPI không được để trống.'),
  description: z.string().min(1, t.kpis.descriptionRequired || 'Mô tả không được để trống.'),
  department: z.string().min(1, t.kpis.departmentRequired || 'Vui lòng chọn phòng ban.'),
  unit: z.string().min(1, t.kpis.unitRequired || 'Đơn vị không được để trống.'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually'], {
    errorMap: () => ({ message: t.kpis.frequencyRequired as string || 'Vui lòng chọn tần suất hợp lệ.' }),
  }),
  formula: z.string().optional(),
  type: z.string().optional(),
  target: z.number().optional(),
  weight: z.number().min(0, 'Trọng số phải lớn hơn hoặc bằng 0').max(100, 'Trọng số không được vượt quá 100').optional(),
  reward: z.number().optional(),
  penalty: z.number().optional(),
});

type EditKpiFormValues = z.infer<ReturnType<typeof editKpiSchema>>;

interface EditKpiFormProps {
  kpi: Kpi;
  onSave: () => void;
  onClose: () => void;
}

export default function EditKpiForm({ kpi, onSave, onClose }: EditKpiFormProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { updateKpi } = useContext(DataContext);
  
  const form = useForm<EditKpiFormValues>({
    resolver: zodResolver(editKpiSchema(t)),
    defaultValues: {
      name: kpi.name,
      description: kpi.description,
      department: kpi.department,
      unit: kpi.unit,
      frequency: kpi.frequency,
      formula: kpi.formula || '',
      type: kpi.type || '',
      target: kpi.target || 0,
      weight: kpi.weight || 1,
      reward: kpi.reward || 0,
      penalty: kpi.penalty || 0,
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

  const onSubmit = async (data: EditKpiFormValues) => {
    setIsSubmitting(true);
    try {
      // Update KPI using context function
      await updateKpi(kpi.id, {
        ...data,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: t.common.success as string,
        description: `Đã cập nhật KPI "${data.name}" thành công.`,
      });
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to update KPI:', error);
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: error.message || 'Không thể cập nhật KPI.',
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
              <FormLabel>Tên KPI</FormLabel>
              <FormControl>
                <Input placeholder="VD: Doanh số bán hàng" {...field} disabled={isSubmitting} />
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
                  disabled={isSubmitting}
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
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingDepartments ? (
                      <SelectItem value="loading" disabled>
                        Đang tải phòng ban...
                      </SelectItem>
                    ) : departments.length === 0 ? (
                      <SelectItem value="no-departments" disabled>
                        Chưa có phòng ban nào
                      </SelectItem>
                    ) : (
                      departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.name}>
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
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đơn vị</FormLabel>
                <FormControl>
                  <Input placeholder="VD: VND, %, Khách hàng" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tần suất đo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tần suất" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">{t.kpis.daily as string}</SelectItem>
                    <SelectItem value="weekly">{t.kpis.weekly as string}</SelectItem>
                    <SelectItem value="monthly">{t.kpis.monthly as string}</SelectItem>
                    <SelectItem value="quarterly">{t.kpis.quarterly as string}</SelectItem>
                    <SelectItem value="annually">{t.kpis.annually as string}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại KPI</FormLabel>
                <FormControl>
                  <Input placeholder="VD: Định lượng, Định tính" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="formula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Công thức tính (tùy chọn)</FormLabel>
              <FormControl>
                <Input placeholder="VD: (Số khách hàng / Số leads) * 100" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FormField
            control={form.control}
            name="target"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mục tiêu</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isSubmitting} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trọng số (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    max="100"
                    placeholder="1" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isSubmitting} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thưởng (VNĐ)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isSubmitting} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="penalty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phạt (VNĐ)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isSubmitting} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn-gradient"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cập nhật KPI
          </Button>
        </div>
      </form>
    </Form>
  );
}
