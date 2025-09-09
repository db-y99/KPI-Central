'use client';

import { useState, useContext } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2, Users, Target } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import type { Employee, Kpi, Department } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { DataContext } from '@/context/data-context';

interface BulkKpiAssignmentFormProps {
  onClose: () => void;
}

export default function BulkKpiAssignmentForm({ onClose }: BulkKpiAssignmentFormProps) {
  const { employees, kpis, departments, assignKpi } = useContext(DataContext);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>();
  const [selectedKpiId, setSelectedKpiId] = useState<string | undefined>();
  const [target, setTarget] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // Filter employees by selected department
  const departmentEmployees = selectedDepartmentId 
    ? employees.filter(emp => emp.departmentId === selectedDepartmentId)
    : [];

  // Filter KPIs by selected department
  const departmentKpis = selectedDepartmentId 
    ? kpis.filter(kpi => kpi.department === departments.find(d => d.id === selectedDepartmentId)?.name)
    : [];

  const selectedKpi = kpis.find(k => k.id === selectedKpiId);
  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);

  // Reset dependent fields when department changes
  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    setSelectedKpiId(undefined);
    setTarget('');
    setSelectedEmployees([]);
  };

  // Handle employee selection
  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // Select all employees in department
  const handleSelectAll = () => {
    if (selectedEmployees.length === departmentEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(departmentEmployees.map(emp => emp.uid!));
    }
  };

  const handleSubmit = async () => {
    if (!selectedDepartmentId || !selectedKpiId || !target || !startDate || !endDate || selectedEmployees.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ tất cả các trường và chọn ít nhất một nhân viên.',
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Assign KPI to all selected employees
      const assignments = selectedEmployees.map(employeeId => 
        assignKpi({
          employeeId,
          kpiId: selectedKpiId,
          target: parseFloat(target),
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        })
      );

      await Promise.all(assignments);
        
      toast({
        title: 'Thành công!',
        description: `Đã giao KPI "${selectedKpi?.name}" cho ${selectedEmployees.length} nhân viên trong phòng ban "${selectedDepartment?.name}".`,
      });

      // Reset form
      setSelectedDepartmentId(undefined);
      setSelectedKpiId(undefined);
      setTarget('');
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedEmployees([]);
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Đã có lỗi xảy ra khi giao KPI hàng loạt. Vui lòng thử lại.',
      });
      console.error("Failed to assign KPI in bulk: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>1. Chọn phòng ban</Label>
        <Select onValueChange={handleDepartmentChange} value={selectedDepartmentId}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn phòng ban..." />
          </SelectTrigger>
          <SelectContent>
            {departments.filter(dept => dept.isActive).map(department => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedDepartment && (
          <p className="text-sm text-muted-foreground">
            Phòng ban: <strong>{selectedDepartment.name}</strong> - {departmentEmployees.length} nhân viên
          </p>
        )}
      </div>

      {selectedDepartmentId && (
        <div className="space-y-2">
          <Label>2. Chọn KPI để giao</Label>
          <Select onValueChange={setSelectedKpiId} value={selectedKpiId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn một KPI..." />
            </SelectTrigger>
            <SelectContent>
              {departmentKpis.length === 0 ? (
                <SelectItem value="no-kpis" disabled>
                  Không có KPI nào cho phòng ban này
                </SelectItem>
              ) : (
                departmentKpis.map(kpi => (
                  <SelectItem key={kpi.id} value={kpi.id}>
                    {kpi.name} - {kpi.unit}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedKpi && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-sm">
            <p><strong>Mô tả:</strong> {selectedKpi.description}</p>
            <p><strong>Đơn vị:</strong> {selectedKpi.unit}</p>
            <p><strong>Tần suất:</strong> {selectedKpi.frequency}</p>
          </CardContent>
        </Card>
      )}

      {selectedKpi && (
        <div className="space-y-2">
          <Label htmlFor="target">3. Đặt chỉ tiêu (Target)</Label>
          <Input
            id="target"
            type="number"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder={`Nhập chỉ tiêu theo đơn vị "${selectedKpi?.unit || '...'}"`}
            disabled={isSubmitting}
          />
        </div>
      )}

      {selectedKpi && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>4. Ngày bắt đầu</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'dd/MM/yyyy') : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>5. Ngày kết thúc</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'dd/MM/yyyy') : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {selectedDepartmentId && departmentEmployees.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>6. Chọn nhân viên để giao KPI</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={isSubmitting}
            >
              {selectedEmployees.length === departmentEmployees.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {departmentEmployees.map(employee => (
                  <div key={employee.uid} className="flex items-center space-x-3">
                    <Checkbox
                      id={employee.uid}
                      checked={selectedEmployees.includes(employee.uid!)}
                      onCheckedChange={() => handleEmployeeToggle(employee.uid!)}
                      disabled={isSubmitting}
                    />
                    <Label 
                      htmlFor={employee.uid}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{employee.name}</span>
                        <span className="text-sm text-muted-foreground">- {employee.position}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Đã chọn <strong>{selectedEmployees.length}</strong> / {departmentEmployees.length} nhân viên
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedKpi && selectedEmployees.length > 0 && (
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="flex-1 btn-gradient"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Giao KPI cho {selectedEmployees.length} nhân viên
          </Button>
        </div>
      )}
    </div>
  );
}
