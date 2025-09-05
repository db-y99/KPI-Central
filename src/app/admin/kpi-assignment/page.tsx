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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import type { Employee, Kpi } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { DataContext } from '@/context/data-context';

export default function KpiAssignmentPage() {
  const { employees, kpis, assignKpi } = useContext(DataContext);
  const [selectedEmployeeUid, setSelectedEmployeeUid] = useState<string | undefined>();
  const [selectedKpiId, setSelectedKpiId] = useState<string | undefined>();
  const [target, setTarget] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const selectedEmployee = employees.find(e => e.uid === selectedEmployeeUid);
  const selectedKpi = kpis.find(k => k.id === selectedKpiId);

  const handleSubmit = async () => {
    if (!selectedEmployeeUid || !selectedKpiId || !target || !startDate || !endDate) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ tất cả các trường.',
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
        await assignKpi({
          employeeId: selectedEmployeeUid, // Use UID for assignment
          kpiId: selectedKpiId,
          target: parseFloat(target),
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        });
        
        toast({
          title: 'Thành công!',
          description: `Đã giao KPI "${selectedKpi?.name}" cho nhân viên "${selectedEmployee?.name}".`,
        });

        // Reset form
        setSelectedEmployeeUid(undefined);
        setSelectedKpiId(undefined);
        setTarget('');
        setStartDate(undefined);
        setEndDate(undefined);
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Lỗi',
            description: 'Đã có lỗi xảy ra khi giao KPI. Vui lòng thử lại.',
        });
        console.error("Failed to assign KPI: ", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Giao KPI cho nhân viên</CardTitle>
          <CardDescription>
            Chọn nhân viên, KPI và thiết lập các thông số để giao việc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>1. Chọn nhân viên</Label>
            <Select onValueChange={setSelectedEmployeeUid} value={selectedEmployeeUid}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn một nhân viên..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map(employee => (
                  <SelectItem key={employee.uid} value={employee.uid!}>
                    {employee.name} - {employee.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>2. Chọn KPI để giao</Label>
            <Select onValueChange={setSelectedKpiId} value={selectedKpiId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn một KPI..." />
              </SelectTrigger>
              <SelectContent>
                {kpis.map(kpi => (
                  <SelectItem key={kpi.id} value={kpi.id}>
                    {kpi.name} ({kpi.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedKpi && (
             <Card className="bg-muted/50">
                <CardContent className="pt-6 text-sm">
                    <p><strong>Mô tả:</strong> {selectedKpi.description}</p>
                    <p><strong>Đơn vị:</strong> {selectedKpi.unit}</p>
                    <p><strong>Tần suất:</strong> {selectedKpi.frequency}</p>
                </CardContent>
             </Card>
          )}

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
          
          <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Giao KPI
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
