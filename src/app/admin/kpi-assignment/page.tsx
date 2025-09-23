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
  const { employees, kpis: allKpis, departments, assignKpi, kpiRecords, loading } = useContext(DataContext);
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
    kpis: allKpis.length,
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
  const selectedKpi = allKpis.find(k => k.id === selectedKpiId);
  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);

  // Get filtered assignments with unique employee-KPI combinations
  const filteredAssignments = kpiRecords
    .filter(record => {
      if (searchTerm === '') return true;
      const employee = employees.find(e => e.uid === record.employeeId);
      const kpi = allKpis.find(k => k.id === record.kpiId);
      const department = departments.find(d => d.id === employee?.departmentId);
      
      return employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             kpi?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             department?.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

  // Group assignments by employee to show unique employees with their KPI count
  const uniqueEmployeeAssignments = filteredAssignments.reduce((acc, record) => {
    const employee = employees.find(e => e.uid === record.employeeId);
    if (!employee) return acc;
    
    const existingEmployee = acc.find(item => item.employeeId === record.employeeId);
    if (existingEmployee) {
      existingEmployee.kpiCount += 1;
      existingEmployee.kpis.push(record);
    } else {
      acc.push({
        employeeId: record.employeeId,
        employee,
        kpiCount: 1,
        kpis: [record],
        latestRecord: record
      });
    }
    return acc;
  }, [] as Array<{
    employeeId: string;
    employee: any;
    kpiCount: number;
    kpis: any[];
    latestRecord: any;
  }>);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">{t.dashboard.approved}</Badge>;
      case 'awaiting_approval':
        return <Badge className="bg-blue-100 text-blue-800">{t.dashboard.pending}</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">{t.dashboard.inProgress}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">{t.dashboard.rejected}</Badge>;
      default:
        return <Badge variant="outline">{t.employeeDashboard.waitingToStart}</Badge>;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return t.dashboard.approved;
      case 'awaiting_approval':
        return t.dashboard.pending;
      case 'pending':
        return t.dashboard.inProgress;
      case 'rejected':
        return t.dashboard.rejected;
      default:
        return t.employeeDashboard.waitingToStart;
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedKpiId || !target.trim()) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.kpiAssignment.pleaseSelectKpiAndTarget,
      });
      return;
    }

    if (assignmentType === 'individual' && !selectedEmployeeUid) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.kpiAssignment.pleaseSelectEmployee,
      });
      return;
    }

    if (assignmentType === 'department' && !selectedDepartmentId) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.kpiAssignment.pleaseSelectDepartment,
      });
      return;
    }

    const targetValue = parseFloat(target);
    if (isNaN(targetValue) || targetValue <= 0) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.kpiAssignment.targetMustBePositive,
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
          title: t.kpiAssignment.success,
          description: t.kpiAssignment.kpiAssignedSuccessIndividual.replace('{kpiName}', selectedKpi?.name || '').replace('{employeeName}', selectedEmployee?.name || ''),
        });
      } else {
        // Assign to all employees in department
        const departmentEmployees = getEmployeesByDepartment(selectedDepartmentId!);
        
        if (departmentEmployees.length === 0) {
        toast({
          variant: 'destructive',
          title: t.common.error,
          description: t.kpiAssignment.noDepartmentEmployees,
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
          title: t.kpiAssignment.success,
          description: t.kpiAssignment.assignedToEmployeesSuccess.replace('{kpiName}', selectedKpi?.name || '').replace('{count}', departmentEmployees.length.toString()).replace('{departmentName}', selectedDepartment?.name || ''),
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
        title: t.common.error,
        description: error instanceof Error ? error.message : t.kpiAssignment.genericError,
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
            <p className="text-muted-foreground">{t.kpiAssignment.loadingData}</p>
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
            <p className="text-xs text-muted-foreground">{t.kpiAssignment.employeesCanReceiveKpi}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{allKpis.length}</div>
            <p className="text-xs text-muted-foreground">{t.kpiAssignment.availableKpis}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{kpiRecords.length}</div>
            <p className="text-xs text-muted-foreground">{t.kpiAssignment.alreadyHaveKpi}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {kpiRecords.filter(r => r.status === 'pending' || r.status === 'awaiting_approval').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.dashboard.inProgress}</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t.kpiAssignment.assignNewKpi}
          </CardTitle>
          <CardDescription>
            {t.kpiAssignment.assignNewKpiDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Assignment Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t.kpiAssignment.assignmentType}</Label>
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
                {t.kpiAssignment.assignToSpecificEmployee}
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
                {t.kpiAssignment.assignToEntireDepartment}
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
                    {t.kpiAssignment.selectDepartment}
                  </Label>
                  <Select onValueChange={setSelectedDepartmentId} value={selectedDepartmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.kpiAssignment.selectDepartmentPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(department => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name} ({getEmployeesByDepartment(department.id).length} {t.kpiAssignment.employeesLabel})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDepartmentId && (
                    <div className="text-sm text-muted-foreground">
                      {t.kpiAssignment.willAssignToEmployees.replace('{count}', getEmployeesByDepartment(selectedDepartmentId).length.toString()).replace('{departmentName}', selectedDepartment?.name || '')}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Select KPI */}
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
                  {allKpis.map(kpi => (
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
                {t.kpiAssignment.target}
              </Label>
              <Input
                type="number"
                placeholder={t.kpiAssignment.targetPlaceholder}
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
              {isSubmitting ? t.kpiAssignment.processing : t.kpiAssignment.assignKpi}
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
              {t.kpiAssignment.assignedKpisList} ({uniqueEmployeeAssignments.length})
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Input
                  placeholder={t.kpiAssignment.searchEmployeesKpis}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {uniqueEmployeeAssignments.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              {kpiRecords.length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">{t.kpiAssignment.noKpisAssignedTitle}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t.kpiAssignment.noKpisAssignedDescription}
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• {t.kpiAssignment.selectEmployeeOrDepartment}</p>
                    <p>• {t.kpiAssignment.selectKpiAndTarget}</p>
                    <p>• {t.kpiAssignment.clickAssignToComplete}</p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">{t.kpiAssignment.noKpisFoundTitle}</h3>
                  <p className="text-muted-foreground">
                    {t.kpiAssignment.noKpisMatchCriteria}
                  </p>
                </>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.kpiAssignment.employeeColumn}</TableHead>
                  <TableHead>KPI</TableHead>
                  <TableHead>{t.kpiAssignment.departmentColumn}</TableHead>
                  <TableHead>{t.kpiAssignment.targetColumn}</TableHead>
                  <TableHead>{t.kpiAssignment.statusColumn}</TableHead>
                  <TableHead>{t.kpiAssignment.deadlineColumn}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueEmployeeAssignments.map((employeeAssignment) => {
                  const { employee, kpiCount, kpis: employeeKpis, latestRecord } = employeeAssignment;
                  const department = departments.find(d => d.id === employee?.departmentId);
                  
                  return (
                    <TableRow key={employee.uid}>
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
                          <p className="font-medium">{kpiCount} KPI được giao</p>
                          <p className="text-sm text-muted-foreground">
                            {employeeKpis.map(kpiRecord => {
                              const kpi = allKpis.find(k => k.id === kpiRecord.kpiId);
                              return kpi?.name || 'KPI không xác định';
                            }).filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{department?.name || '-'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">Tổng: {employeeKpis.reduce((sum, kpi) => {
                            const target = typeof kpi.target === 'string' ? parseFloat(kpi.target) : kpi.target;
                            return sum + (isNaN(target) ? 0 : target);
                          }, 0).toFixed(1)}</p>
                          <p className="text-sm text-muted-foreground">{t.kpiAssignment.frequencyLabel}: Hàng tháng</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {(() => {
                            // Group statuses by type
                            const statusCounts = employeeKpis.reduce((acc, kpiRecord) => {
                              acc[kpiRecord.status] = (acc[kpiRecord.status] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>);
                            
                            // Get the most common status
                            const mostCommonStatus = Object.entries(statusCounts)
                              .sort(([,a], [,b]) => b - a)[0]?.[0] || 'pending';
                            
                            // Show summary if multiple statuses
                            if (Object.keys(statusCounts).length > 1) {
                              return (
                                <div className="space-y-1">
                                  <div>{getStatusBadge(mostCommonStatus)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {Object.entries(statusCounts).map(([status, count]) => (
                                      <span key={status} className="mr-2">
                                        {getStatusText(status)}: {count}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            
                            // Show single status
                            return getStatusBadge(mostCommonStatus);
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {(() => {
                              const endDate = new Date(latestRecord.endDate);
                              return isNaN(endDate.getTime()) ? 'Chưa xác định' : endDate.toLocaleDateString('vi-VN');
                            })()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.kpiAssignment.createdLabel}: {(() => {
                              const createdDate = new Date(latestRecord.createdAt || '');
                              return isNaN(createdDate.getTime()) ? 'Chưa xác định' : createdDate.toLocaleDateString('vi-VN');
                            })()}
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
