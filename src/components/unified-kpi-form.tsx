'use client';

import { useContext, useState } from 'react';
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
import type { Kpi, Department, CreateKpiFormValues, EditKpiFormValues } from '@/types';
import { collection, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { DataContext } from '@/context/data-context';

const createKpiSchema = (t: any) => z.object({
  name: z.string().min(1, t.kpis.nameRequired),
  description: z.string().min(1, t.kpis.descriptionRequired),
  department: z.string().min(1, t.kpis.departmentRequired),
  unit: z.string().min(1, t.kpis.unitRequired),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually'], {
    errorMap: () => ({ message: t.kpis.frequencyRequired }),
  }),
  formula: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  target: z.number().optional(),
  weight: z.number().min(0, t.kpis.weightMin || 'Trọng số phải lớn hơn hoặc bằng 0').max(100, t.kpis.weightMax || 'Trọng số không được vượt quá 100').optional(),
  reward: z.number().optional(),
  penalty: z.number().optional(),
  startDate: z.string().min(1, t.kpis.startDateRequired),
  endDate: z.string().min(1, t.kpis.endDateRequired),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: t.kpis.endDateMustBeAfterStartDate,
  path: ['endDate'],
});

const editKpiSchema = (t: any) => z.object({
  name: z.string().min(1, t.kpis.nameRequired),
  description: z.string().min(1, t.kpis.descriptionRequired),
  department: z.string().min(1, t.kpis.departmentRequired),
  unit: z.string().min(1, t.kpis.unitRequired),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually'], {
    errorMap: () => ({ message: t.kpis.frequencyRequired }),
  }),
  formula: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  target: z.number().optional(),
  weight: z.number().min(0, t.kpis.weightMin || 'Trọng số phải lớn hơn hoặc bằng 0').max(100, t.kpis.weightMax || 'Trọng số không được vượt quá 100').optional(),
  reward: z.number().optional(),
  penalty: z.number().optional(),
  startDate: z.string().min(1, t.kpis.startDateRequired),
  endDate: z.string().min(1, t.kpis.endDateRequired),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: t.kpis.endDateMustBeAfterStartDate,
  path: ['endDate'],
});

// Types are imported from @/types

interface KpiFormProps {
  mode: 'add' | 'edit';
  kpi?: Kpi;
  onSave: (data: Kpi) => void;
  onClose: () => void;
}

export default function KpiForm({ mode, kpi, onSave, onClose }: KpiFormProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { addKpi, updateKpi, departments } = useContext(DataContext);

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
      category: kpi?.category || '',
      target: kpi?.target || 0,
      weight: kpi?.weight || 1,
      reward: kpi?.reward || 0,
      penalty: kpi?.penalty || 0,
      startDate: kpi?.startDate || '',
      endDate: kpi?.endDate || '',
    } : {
      name: '',
      description: '',
      department: '',
      unit: '',
      frequency: 'monthly',
      formula: '',
      type: '',
      category: '',
      target: 0,
      weight: 1,
      reward: 0,
      penalty: 0,
      startDate: '',
      endDate: '',
    },
  });


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
          category: editData.category || '',
          target: editData.target || 0,
          weight: editData.weight || 1,
          reward: editData.reward || 0,
          penalty: editData.penalty || 0,
          startDate: editData.startDate,
          endDate: editData.endDate,
          updatedAt: new Date().toISOString(),
        });

        const updatedKpi: Kpi = {
          ...kpi!,
          ...editData,
        };

        await updateKpi(kpi!.id, editData);
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
          category: createData.category || '',
          target: createData.target || 0,
          weight: createData.weight || 1,
          reward: createData.reward || 0,
          penalty: createData.penalty || 0,
          startDate: createData.startDate,
          endDate: createData.endDate,
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


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">{t.kpis.basicInformation}</h3>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.kpis.name} <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t.kpis.enterKpiName} 
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
                <FormLabel>{t.kpis.description} <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={t.kpis.enterDescription} 
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
                  <FormLabel>{t.kpis.department} <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.kpis.selectDepartment} />
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
                  <FormLabel>{t.kpis.unit} <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t.kpis.enterUnit} 
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
                  <FormLabel>{t.kpis.frequency} <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.kpis.selectFrequency} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">{t.kpis.daily}</SelectItem>
                      <SelectItem value="weekly">{t.kpis.weekly}</SelectItem>
                      <SelectItem value="monthly">{t.kpis.monthly}</SelectItem>
                      <SelectItem value="quarterly">{t.kpis.quarterly}</SelectItem>
                      <SelectItem value="annually">{t.kpis.annually}</SelectItem>
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
                  <FormLabel>{t.kpis.type || 'Loại KPI'}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t.kpis.enterCategory} 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.kpis.category}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t.kpis.enterCategory} 
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
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.kpis.startDate} <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
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
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.kpis.endDate} <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
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

        {/* Target and Weight Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">{t.kpis.targetAndWeight || 'Mục tiêu và trọng số'}</h3>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.kpis.target}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder={t.kpis.enterTarget || "0"} 
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
                  <FormLabel>{t.kpis.weight} (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      max="100"
                      placeholder={t.kpis.enterWeight || "1"} 
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
                  <FormLabel>{t.kpis.formula || 'Công thức tính'}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t.kpis.enterFormula || "Ví dụ: (actual/target)*100"} 
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

        {/* Reward and Penalty Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">{t.kpis.rewardPenaltySystem || 'Thưởng và phạt'}</h3>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="reward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.kpis.reward} (VND)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder={t.kpis.enterReward || "0"} 
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
                  <FormLabel>{t.kpis.penalty} (VND)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder={t.kpis.enterPenalty || "0"} 
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
            {t.common.cancel}
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? t.common.updating || 'Đang cập nhật...' : t.common.creating || 'Đang tạo...'}
              </>
            ) : (
              isEditMode ? t.kpis.updateKpi : t.kpis.saveKpi
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
