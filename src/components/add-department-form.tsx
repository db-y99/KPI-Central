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
import { useLanguage } from '@/context/language-context';

const createDepartmentSchema = (t: any) => z.object({
  name: z.string().min(1, t.departments.nameRequired).max(100, t.departments.nameMaxLength),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type DepartmentFormData = z.infer<ReturnType<typeof createDepartmentSchema>>;

interface AddDepartmentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDepartmentForm({ onClose, onSuccess }: AddDepartmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { addDepartment } = useContext(DataContext);
  const { t } = useLanguage();

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(createDepartmentSchema(t)),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  const onSubmit = async (data: DepartmentFormData) => {
    setIsSubmitting(true);
    try {
      const departmentData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDepartment(departmentData);
      
      toast({
        title: 'Thành công',
        description: 'Đã tạo phòng ban thành công.',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.departments.createError,
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
                    <FormLabel>{t.departments.name} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.departments.name}
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
                    <FormLabel>{t.departments.description}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t.departments.description}
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
                      <FormLabel className="text-base">{t.departments.status}</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {t.departments.status}
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
                  {t.common.cancel}
                </Button>
                <Button type="submit" disabled={isSubmitting} className="btn-gradient">
                  {isSubmitting ? t.departments.creating : t.departments.createDepartment}
                </Button>
              </div>
            </form>
          </Form>
    </div>
  );
}
