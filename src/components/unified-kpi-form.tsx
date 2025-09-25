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
import { collection, getDocs, query, where, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { DataContext } from '@/context/data-context';

const createKpiSchema = (t: any) => z.object({
  name: z.string().min(1, 'Tên KPI không được để trống.'),
  description: z.string().min(1, 'Mô tả không được để trống.'),
  department: z.string().min(1, 'Vui lòng chọn phòng ban.'),
  unit: z.string().min(1, 'Đơn vị không được để trống.'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually'], {
    errorMap: () => ({ message: 'Vui lòng chọn tần suất hợp lệ.' }),
  }),
  formula: z.string().optional(),
  type: z.string().optional(),
  target: z.number().optional(),
  weight: z.number().min(0, 'Trọng số phải lớn hơn hoặc bằng 0').max(100, 'Trọng số không được vượt quá 100').optional(),
  reward: z.number().optional(),
  penalty: z.number().optional(),
});

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

type CreateKpiFormValues = z.infer<typeof createKpiSchema>;
type EditKpiFormValues = z.infer<ReturnType<typeof editKpiSchema>>;

interface KpiFormProps {
  mode: 'add' | 'edit';
  kpi?: Kpi;
  onSave: (data: Kpi) => void;
  onClose: () => void;
}

export default function KpiForm({ mode, kpi, onSave, onClose }: KpiFormProps) {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { addKpi, updateKpi } = useContext(DataContext);

  const isEditMode = mode === 'edit';
  const schema = isEditMode ? editKpiSchema(t) : createKpiSchema(t);

  const form = useForm<CreateKpiFormValues | EditKpiFormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEditMode ? {
      name: kpi?.name || '',
      description: kpi?.description || '',
      department: kpi?.department || '',
      unit: kpi?.unit || '',
      frequency: kpi?.frequency || 'monthly',
      formula: kpi?.formula || '',
      type: kpi?.type || '',
      target: kpi?.target || 0,
      weight: kpi?.weight || 1,
      reward: kpi?.reward || 0,
      penalty: kpi?.penalty || 0,
    } : {
      name: '',
      description: '',
      department: '',
      unit: '',
      frequency: 'monthly',
      formula: '',
      type: '',
      target: 0,
      weight: 1,
      reward: 0,
      penalty: 0,
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

  const onSubmit = async (data: CreateKpiFormValues | EditKpiFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditMode) {
        // Handle edit mode
        const editData = data as EditKpiFormValues;
        const kpiRef = doc(db, 'kpis', kpi!.id);
        await updateDoc(kpiRef, {
          name: editData.name,
          description: editData.description,
          department: editData.department,
          unit: editData.unit,
          frequency: editData.frequency,
          formula: editData.formula || '',
          type: editData.type || '',
          target: editData.target || 0,
          weight: editData.weight || 1,
          reward: editData.reward || 0,
          penalty: editData.penalty || 0,
          updatedAt: new Date().toISOString(),
        });

        const updatedKpi: Kpi = {
          ...kpi!,
          ...editData,
        };

        updateKpi(updatedKpi);
        onSave(updatedKpi);
        
        toast({
          title: "Thành công!",
          description: `Đã cập nhật KPI "${editData.name}".`
        });
      } else {
        // Handle add mode
        const createData = data as CreateKpiFormValues;
        const newKpi: Omit<Kpi, 'id'> = {
          name: createData.name,
          description: createData.description,
          department: createData.department,
          unit: createData.unit,
          frequency: createData.frequency,
          formula: createData.formula || '',
          type: createData.type || '',
          target: createData.target || 0,
          weight: createData.weight || 1,
          reward: createData.reward || 0,
          penalty: createData.penalty || 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, 'kpis'), newKpi);
        const kpiWithId: Kpi = {
          id: docRef.id,
          ...newKpi,
        };

        addKpi(kpiWithId);
        onSave(kpiWithId);
        
        toast({
          title: "Thành công!",
          description: `Đã tạo KPI "${createData.name}".`
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving KPI:', error);
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: isEditMode ? 'Không thể cập nhật KPI.' : 'Không thể tạo KPI.',
      });
    } finally {
      setIsSubmitting(false);
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
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên KPI <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nhập tên KPI" 
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
                <FormLabel>Mô tả <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Nhập mô tả chi tiết về KPI" 
                    {...field} 
                    disabled={isSubmitting}
                    rows={3}
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
                  <FormLabel>Phòng ban <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng ban" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
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
                  <FormLabel>Đơn vị <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ví dụ: %, số lượng, VND..." 
                      {...field} 
                      disabled={isSubmitting}
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
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tần suất <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tần suất" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Hàng ngày</SelectItem>
                      <SelectItem value="weekly">Hàng tuần</SelectItem>
                      <SelectItem value="monthly">Hàng tháng</SelectItem>
                      <SelectItem value="quarterly">Hàng quý</SelectItem>
                      <SelectItem value="annually">Hàng năm</SelectItem>
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
                    <Input 
                      placeholder="Ví dụ: Sales, Marketing, Support..." 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Thông tin mục tiêu và trọng số */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Mục tiêu và trọng số</h3>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                      disabled={isSubmitting}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                      disabled={isSubmitting}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Công thức tính</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ví dụ: (actual/target)*100" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Thông tin thưởng phạt */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Thưởng và phạt</h3>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="reward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thưởng (VND)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="0" 
                      {...field} 
                      disabled={isSubmitting}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                  <FormLabel>Phạt (VND)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="0" 
                      {...field} 
                      disabled={isSubmitting}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
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
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}
              </>
            ) : (
              isEditMode ? 'Cập nhật KPI' : 'Tạo KPI'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
