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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Loader2, User, Users } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import type { Employee, Kpi } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { DataContext } from '@/context/data-context';
import BulkKpiAssignmentForm from '@/components/bulk-kpi-assignment-form';

export default function KpiAssignmentPage() {
  const { employees, kpis, departments, assignKpi } = useContext(DataContext);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>();
  const [selectedEmployeeUid, setSelectedEmployeeUid] = useState<string | undefined>();
  const [selectedKpiId, setSelectedKpiId] = useState<string | undefined>();
  const [target, setTarget] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  const { toast } = useToast();

  // Filter employees by selected department
  const departmentEmployees = selectedDepartmentId 
    ? employees.filter(emp => emp.departmentId === selectedDepartmentId)
    : [];

  // Filter KPIs by selected department
  const departmentKpis = selectedDepartmentId 
    ? kpis.filter(kpi => kpi.department === departments.find(d => d.id === selectedDepartmentId)?.name)
    : [];

  const selectedEmployee = employees.find(e => e.uid === selectedEmployeeUid);
  const selectedKpi = kpis.find(k => k.id === selectedKpiId);
  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);

  // Reset dependent fields when department changes
  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    setSelectedEmployeeUid(undefined);
    setSelectedKpiId(undefined);
    setTarget('');
  };

  const handleSubmit = async () => {
    if (!selectedDepartmentId || !selectedEmployeeUid || !selectedKpiId || !target || !startDate || !endDate) {
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
        setSelectedDepartmentId(undefined);
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
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Giao KPI cho nhân viên</h1>
          <p className="text-muted-foreground">
            Chọn cách giao KPI: cá nhân hoặc hàng loạt cho phòng ban
          </p>
        </div>

        <Tabs defaultValue="individual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Giao KPI cá nhân
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Giao KPI hàng loạt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <Card>
              <CardHeader>
                <CardTitle>Giao KPI cho nhân viên</CardTitle>
                <CardDescription>
                  Chọn phòng ban, nhân viên, KPI và thiết lập các thông số để giao việc.
                </CardDescription>
              </CardHeader>
        <CardContent className="space-y-6">
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
              <Label>2. Chọn nhân viên trong phòng ban</Label>
              <Select onValueChange={setSelectedEmployeeUid} value={selectedEmployeeUid}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn một nhân viên..." />
                </SelectTrigger>
                <SelectContent>
                  {departmentEmployees.length === 0 ? (
                    <SelectItem value="no-employees" disabled>
                      Không có nhân viên nào trong phòng ban này
                    </SelectItem>
                  ) : (
                    departmentEmployees.map(employee => (
                      <SelectItem key={employee.uid} value={employee.uid!}>
                        {employee.name} - {employee.position}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedDepartmentId && (
            <div className="space-y-2">
              <Label>3. Chọn KPI để giao</Label>
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
              <Label htmlFor="target">4. Đặt chỉ tiêu (Target)</Label>
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
                <Label>5. Ngày bắt đầu</Label>
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
                <Label>6. Ngày kết thúc</Label>
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
          
          {selectedKpi && (
            <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Giao KPI
            </Button>
          )}

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Giao KPI hàng loạt cho phòng ban</CardTitle>
                <CardDescription>
                  Chọn phòng ban, KPI và gán cho tất cả nhân viên trong phòng ban đó.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-black hover:bg-gray-800 text-white border-0">
                        <Users className="mr-2 h-4 w-4" />
                        Bắt đầu giao KPI hàng loạt
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Giao KPI hàng loạt</DialogTitle>
                      </DialogHeader>
                      <BulkKpiAssignmentForm onClose={() => setIsBulkDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
