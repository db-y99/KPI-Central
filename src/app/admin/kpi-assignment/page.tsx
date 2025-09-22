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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Target, User, Calendar, CheckCircle2, Building2, Users, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Employee, Kpi, Department } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { DataContext } from '@/context/data-context';

export default function KpiAssignmentPage() {
  const { employees, kpis, departments, assignKpi, kpiRecords, loading } = useContext(DataContext);
  const [assignmentType, setAssignmentType] = useState<'individual' | 'department'>('individual');
  const [selectedEmployeeUid, setSelectedEmployeeUid] = useState<string | undefined>();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>();
  const [selectedKpiId, setSelectedKpiId] = useState<string | undefined>();
  const [target, setTarget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const { t } = useLanguage();

  // Debug data loading
  console.log('KPI Assignment Page - Data Status:', {
    employees: employees.length,
    kpis: kpis.length,
    departments: departments.length,
    kpiRecords: kpiRecords.length,
    loading
  });

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');
  
  // Get employees by department
  const getEmployeesByDepartment = (departmentId: string) => {
    return nonAdminEmployees.filter(emp => emp.departmentId === departmentId);
  };

  const selectedEmployee = employees.find(e => e.uid === selectedEmployeeUid);
  const selectedKpi = kpis.find(k => k.id === selectedKpiId);
  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);

  // Get filtered assignments
  const filteredAssignments = kpiRecords
    .filter(record => {
      if (searchTerm === '') return true;
      const employee = employees.find(e => e.uid === record.employeeId);
      const kpi = kpis.find(k => k.id === record.kpiId);
      const department = departments.find(d => d.id === employee?.departmentId);
      
      return employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             kpi?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             department?.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      case 'awaiting_approval':
        return <Badge className="bg-blue-100 text-blue-800">Chờ duyệt</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Đang thực hiện</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>;
      default:
        return <Badge variant="outline">Chưa bắt đầu</Badge>;
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedKpiId || !target.trim()) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng chọn KPI và nhập chỉ tiêu.',
      });
      return;
    }

    if (assignmentType === 'individual' && !selectedEmployeeUid) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng chọn nhân viên.',
      });
      return;
    }

    if (assignmentType === 'department' && !selectedDepartmentId) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng chọn phòng ban.',
      });
      return;
    }

    const targetValue = parseFloat(target);
    if (isNaN(targetValue) || targetValue <= 0) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Chỉ tiêu phải là số dương hợp lệ.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Set default dates (current quarter)
      const today = new Date();
      const startDate = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0);

      if (assignmentType === 'individual') {
        // Assign to individual employee
        await assignKpi({
          employeeId: selectedEmployeeUid!,
          kpiId: selectedKpiId,
          target: targetValue,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        });

        toast({
          title: 'Thành công!',
          description: `KPI "${selectedKpi?.name}" đã được giao cho ${selectedEmployee?.name}.`,
        });
      } else {
        // Assign to all employees in department
        const departmentEmployees = getEmployeesByDepartment(selectedDepartmentId!);
        
        if (departmentEmployees.length === 0) {
          toast({
            variant: 'destructive',
            title: 'Lỗi',
            description: 'Phòng ban này không có nhân viên nào.',
          });
          return;
        }

        // Assign KPI to all employees in the department
        const assignments = departmentEmployees.map(employee => 
          assignKpi({
            employeeId: employee.uid!,
            kpiId: selectedKpiId,
            target: targetValue,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          })
        );

        await Promise.all(assignments);

        toast({
          title: 'Thành công!',
          description: `KPI "${selectedKpi?.name}" đã được giao cho ${departmentEmployees.length} nhân viên trong phòng ban ${selectedDepartment?.name}.`,
        });
      }

      // Reset form
      setSelectedEmployeeUid(undefined);
      setSelectedDepartmentId(undefined);
      setSelectedKpiId(undefined);
      setTarget('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi giao KPI. Vui lòng thử lại.',
      });
      console.error("Failed to assign KPI: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state if data is still loading
  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{nonAdminEmployees.length}</div>
            <p className="text-xs text-muted-foreground">Nhân viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{kpis.length}</div>
            <p className="text-xs text-muted-foreground">KPI có sẵn</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{kpiRecords.length}</div>
            <p className="text-xs text-muted-foreground">Đã giao</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {kpiRecords.filter(r => r.status === 'pending' || r.status === 'awaiting_approval').length}
            </div>
            <p className="text-xs text-muted-foreground">Đang xử lý</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            + Giao KPI mới
          </CardTitle>
          <CardDescription>
            Chọn nhân viên, KPI và thiết lập chỉ tiêu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Assignment Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Loại giao KPI</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={assignmentType === 'individual' ? 'default' : 'outline'}
                onClick={() => {
                  setAssignmentType('individual');
                  setSelectedEmployeeUid(undefined);
                  setSelectedDepartmentId(undefined);
                }}
                className="flex items-center gap-2 flex-1"
              >
                <User className="w-4 h-4" />
                Giao cho nhân viên cụ thể
              </Button>
              <Button
                type="button"
                variant={assignmentType === 'department' ? 'default' : 'outline'}
                onClick={() => {
                  setAssignmentType('department');
                  setSelectedEmployeeUid(undefined);
                  setSelectedDepartmentId(undefined);
                }}
                className="flex items-center gap-2 flex-1"
              >
                <Building2 className="w-4 h-4" />
                Giao cho toàn phòng ban
              </Button>
            </div>
          </div>

          {/* Selection Fields - Horizontal Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Employee/Department Selection */}
            <div className="space-y-2">
              {assignmentType === 'individual' ? (
                <>
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t.kpiAssignment.selectEmployee}
                  </Label>
                  <Select onValueChange={setSelectedEmployeeUid} value={selectedEmployeeUid}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.kpiAssignment.selectEmployeePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {nonAdminEmployees.map(employee => (
                        <SelectItem key={employee.uid} value={employee.uid!}>
                          {employee.name} - {employee.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <Label className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Chọn phòng ban
                  </Label>
                  <Select onValueChange={setSelectedDepartmentId} value={selectedDepartmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(department => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name} ({getEmployeesByDepartment(department.id).length} nhân viên)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDepartmentId && (
                    <div className="text-sm text-muted-foreground">
                      Sẽ giao KPI cho {getEmployeesByDepartment(selectedDepartmentId).length} nhân viên trong phòng ban {selectedDepartment?.name}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Chọn KPI */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                {t.kpiAssignment.selectKpi}
              </Label>
              <Select onValueChange={setSelectedKpiId} value={selectedKpiId}>
                <SelectTrigger>
                  <SelectValue placeholder={t.kpiAssignment.selectKpiPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {kpis.map(kpi => (
                    <SelectItem key={kpi.id} value={kpi.id}>
                      {kpi.name} - {kpi.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Chỉ tiêu
              </Label>
              <Input
                type="number"
                placeholder="Nhập chỉ tiêu..."
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* KPI Info */}
          {selectedKpi && (
            <Card className="bg-blue-50">
              <CardContent className="pt-4 text-sm">
                <p><strong>{t.kpiAssignment.description}:</strong> {selectedKpi.description}</p>
                <p><strong>{t.kpiAssignment.unit}:</strong> {selectedKpi.unit}</p>
                <p><strong>{t.kpiAssignment.frequency}:</strong> {selectedKpi.frequency}</p>
              </CardContent>
            </Card>
          )}


          {/* Submit Button */}
          {selectedKpi && (
            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Giao KPI'}
            </Button>
          )}

        </CardContent>
      </Card>

      {/* KPI Assignments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              KPI đã giao ({filteredAssignments.length})
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Input
                  placeholder="Tìm kiếm nhân viên, KPI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              {kpiRecords.length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">Chưa có KPI nào được giao</h3>
                  <p className="text-muted-foreground mb-4">
                    Sử dụng form bên trên để giao KPI cho nhân viên.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Chọn nhân viên hoặc phòng ban</p>
                    <p>• Chọn KPI và thiết lập chỉ tiêu</p>
                    <p>• Nhấn "Giao KPI" để hoàn tất</p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">Không tìm thấy KPI</h3>
                  <p className="text-muted-foreground">
                    Không có KPI nào phù hợp với tiêu chí tìm kiếm.
                  </p>
                </>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>KPI</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Chỉ tiêu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hạn chót</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((record) => {
                  const employee = employees.find(e => e.uid === record.employeeId);
                  const kpi = kpis.find(k => k.id === record.kpiId);
                  const department = departments.find(d => d.id === employee?.departmentId);
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={employee?.avatar} />
                            <AvatarFallback>
                              {employee?.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee?.name}</p>
                            <p className="text-sm text-muted-foreground">{employee?.position}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{kpi?.name}</p>
                          <p className="text-sm text-muted-foreground">{kpi?.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{department?.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{record.target} {kpi?.unit}</p>
                          <p className="text-sm text-muted-foreground">Tần suất: {kpi?.frequency}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {new Date(record.endDate).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tạo: {new Date(record.createdAt || '').toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
