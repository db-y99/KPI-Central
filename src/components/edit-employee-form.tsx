'use client';

import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/language-context';
import type { Department, Employee } from '@/types';

const editEmployeeSchema = (t: any) => z.object({
  name: z.string().min(1, t.employees.nameRequired),
  email: z.string().email(t.employees.emailInvalid),
  position: z.string().min(1, t.employees.positionRequired),
  departmentId: z.string().min(1, t.employees.departmentRequired),
  role: z.enum(['admin', 'employee'], {
    errorMap: () => ({ message: t.employees.roleRequired as string }),
  }),
});

type EditEmployeeFormValues = z.infer<ReturnType<typeof editEmployeeSchema>>;

interface EditEmployeeFormProps {
  employee: Employee;
  onSave: () => void;
  onClose: () => void;
}

export default function EditEmployeeForm({ employee, onSave, onClose }: EditEmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  const form = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema(t)),
    defaultValues: {
      name: employee.name,
      email: employee.email,
      position: employee.position,
      departmentId: employee.departmentId,
      role: employee.role,
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

  const onSubmit = async (data: EditEmployeeFormValues) => {
    setIsSubmitting(true);
    try {
      // Update employee in Firestore
      const employeeRef = doc(db, 'employees', employee.uid!);
      await updateDoc(employeeRef, {
        name: data.name,
        email: data.email,
        position: data.position,
        departmentId: data.departmentId,
        role: data.role,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: t.common.success as string,
        description: `Đã cập nhật thông tin nhân viên ${data.name}.`,
      });
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to update employee:', error);
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: error.message || 'Không thể cập nhật thông tin nhân viên.',
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
              <FormLabel>{t.employees.name as string}</FormLabel>
              <FormControl>
                <Input placeholder={t.employees.name as string} {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.employees.email as string}</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder={t.employees.email as string} 
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
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.employees.position as string}</FormLabel>
              <FormControl>
                <Input placeholder={t.employees.position as string} {...field} disabled={isSubmitting} />
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
                <FormLabel>{t.employees.department as string}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t.employees.selectDepartment as string} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingDepartments ? (
                      <SelectItem value="loading" disabled>
                        {t.employees.loadingDepartments as string}
                      </SelectItem>
                    ) : departments.length === 0 ? (
                      <SelectItem value="no-departments" disabled>
                        {t.employees.noDepartments as string}
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
                <FormLabel>{t.employees.role as string}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t.employees.role as string} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="employee">{t.employees.employee as string}</SelectItem>
                    <SelectItem value="admin">{t.employees.admin as string}</SelectItem>
                  </SelectContent>
                </Select>
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
            Cập nhật
          </Button>
        </div>
      </form>
    </Form>
  );
}
