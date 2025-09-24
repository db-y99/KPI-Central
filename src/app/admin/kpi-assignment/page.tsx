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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Target, User, Calendar, CheckCircle2, Building2, Users, Search, Filter, X, CheckSquare, Square } from 'lucide-react';
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
  const [selectedEmployeeUids, setSelectedEmployeeUids] = useState<string[]>([]);
  const [useMultiEmployee, setUseMultiEmployee] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>();
  const [selectedKpiIds, setSelectedKpiIds] = useState<string[]>([]);
  const [target, setTarget] = useState('');
  const [individualTargets, setIndividualTargets] = useState<Record<string, string>>({});
  const [useIndividualTargets, setUseIndividualTargets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [kpiSearchTerm, setKpiSearchTerm] = useState('');
  const [kpiFilterCategory, setKpiFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const selectedKpis = allKpis.filter(k => selectedKpiIds.includes(k.id));
  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);

  // Filter KPIs based on search and category
  const filteredKpis = allKpis.filter(kpi => {
    const matchesSearch = kpi.name.toLowerCase().includes(kpiSearchTerm.toLowerCase()) ||
                         kpi.description.toLowerCase().includes(kpiSearchTerm.toLowerCase());
    const matchesCategory = kpiFilterCategory === 'all' || kpi.category === kpiFilterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique KPI categories
  const kpiCategories = ['all', ...Array.from(new Set(allKpis.map(kpi => kpi.category).filter(Boolean)))];

  // Helper functions for KPI selection
  const selectAllKpis = () => {
    setSelectedKpiIds(filteredKpis.map(kpi => kpi.id));
  };

  const deselectAllKpis = () => {
    setSelectedKpiIds([]);
  };

  const toggleKpiSelection = (kpiId: string) => {
    if (selectedKpiIds.includes(kpiId)) {
      setSelectedKpiIds(selectedKpiIds.filter(id => id !== kpiId));
      // Remove individual target when KPI is deselected
      const newIndividualTargets = { ...individualTargets };
      delete newIndividualTargets[kpiId];
      setIndividualTargets(newIndividualTargets);
    } else {
      setSelectedKpiIds([...selectedKpiIds, kpiId]);
    }
  };

  // Helper functions for individual targets
  const updateIndividualTarget = (kpiId: string, value: string) => {
    setIndividualTargets(prev => ({
      ...prev,
      [kpiId]: value
    }));
  };

  const getKpiTarget = (kpiId: string) => {
    if (useIndividualTargets) {
      return individualTargets[kpiId] || '';
    }
    return target;
  };

  const validateTargets = () => {
    if (useIndividualTargets) {
      return selectedKpiIds.every(kpiId => {
        const targetValue = individualTargets[kpiId];
        return targetValue && targetValue.trim() && !isNaN(parseFloat(targetValue)) && parseFloat(targetValue) > 0;
      });
    } else {
      return target.trim() && !isNaN(parseFloat(target)) && parseFloat(target) > 0;
    }
  };

  // Helper functions for multi-employee selection
  const toggleEmployeeSelection = (employeeUid: string) => {
    if (selectedEmployeeUids.includes(employeeUid)) {
      setSelectedEmployeeUids(selectedEmployeeUids.filter(id => id !== employeeUid));
    } else {
      setSelectedEmployeeUids([...selectedEmployeeUids, employeeUid]);
    }
  };

  const selectAllEmployees = () => {
    setSelectedEmployeeUids(nonAdminEmployees.map(emp => emp.uid!).filter(Boolean));
  };

  const deselectAllEmployees = () => {
    setSelectedEmployeeUids([]);
  };

  const getSelectedEmployees = () => {
    if (useMultiEmployee) {
      return nonAdminEmployees.filter(emp => selectedEmployeeUids.includes(emp.uid!));
    } else {
      return selectedEmployeeUid ? [employees.find(e => e.uid === selectedEmployeeUid)] : [];
    }
  };

  // Modal workflow functions
  const resetModalForm = () => {
    setSelectedEmployeeUid(undefined);
    setSelectedEmployeeUids([]);
    setUseMultiEmployee(false);
    setSelectedDepartmentId(undefined);
    setSelectedKpiIds([]);
    setTarget('');
    setIndividualTargets({});
    setUseIndividualTargets(false);
    setAssignmentType('individual');
  };

  const openModal = (type: 'individual' | 'department') => {
    resetModalForm();
    setAssignmentType(type);
    setIsModalOpen(true);
  };

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
    .sort((a, b) => new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime());

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
    if (selectedKpiIds.length === 0) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.kpiAssignment.pleaseSelectKpiAndTarget,
      });
      return;
    }

    if (assignmentType === 'individual') {
      const hasSelectedEmployees = useMultiEmployee 
        ? selectedEmployeeUids.length > 0 
        : selectedEmployeeUid;
      
      if (!hasSelectedEmployees) {
        toast({
          variant: 'destructive',
          title: t.common.error,
          description: useMultiEmployee ? 'Vui lòng chọn ít nhất một nhân viên' : t.kpiAssignment.pleaseSelectEmployee,
        });
        return;
      }
    }

    if (assignmentType === 'department' && !selectedDepartmentId) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.kpiAssignment.pleaseSelectDepartment,
      });
      return;
    }

    if (!validateTargets()) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: useIndividualTargets 
          ? 'Vui lòng nhập chỉ tiêu hợp lệ cho tất cả KPI đã chọn'
          : t.kpiAssignment.targetMustBePositive,
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
        // Get selected employees
        const employeesToAssign = useMultiEmployee 
          ? getSelectedEmployees()
          : [selectedEmployee].filter(Boolean);

        // Assign multiple KPIs to selected employees
        const assignments = employeesToAssign.flatMap(employee => 
          selectedKpiIds.map(kpiId => {
            const targetValue = useIndividualTargets 
              ? parseFloat(individualTargets[kpiId]) 
              : parseFloat(target);
            
            return assignKpi({
              employeeId: employee!.uid!,
              kpiId: kpiId,
              target: targetValue,
              targetValue: targetValue,
              actualValue: 0,
              period: `${startDate.getFullYear()}-Q${Math.floor(startDate.getMonth() / 3) + 1}`,
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0],
              updatedAt: new Date().toISOString(),
            });
          })
        );

        await Promise.all(assignments);

        toast({
          title: t.kpiAssignment.success,
          description: `${selectedKpis.length} KPIs đã được giao cho ${employeesToAssign.length} nhân viên`,
        });
      } else {
        // Assign multiple KPIs to all employees in department
        const departmentEmployees = getEmployeesByDepartment(selectedDepartmentId!);
        
        if (departmentEmployees.length === 0) {
        toast({
          variant: 'destructive',
          title: t.common.error,
          description: t.kpiAssignment.noDepartmentEmployees,
        });
          return;
        }

        // Assign multiple KPIs to all employees in the department
        const assignments = departmentEmployees.flatMap(employee => 
          selectedKpiIds.map(kpiId => {
            const targetValue = useIndividualTargets 
              ? parseFloat(individualTargets[kpiId]) 
              : parseFloat(target);
            
            return assignKpi({
              employeeId: employee.uid!,
              kpiId: kpiId,
              target: targetValue,
              targetValue: targetValue,
              actualValue: 0,
              period: `${startDate.getFullYear()}-Q${Math.floor(startDate.getMonth() / 3) + 1}`,
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0],
              updatedAt: new Date().toISOString(),
            });
          })
        );

        await Promise.all(assignments);

        toast({
          title: t.kpiAssignment.success,
          description: `${selectedKpis.length} KPIs đã được giao cho ${departmentEmployees.length} nhân viên trong ${selectedDepartment?.name}`,
        });
      }

      // Reset form and close modal
      resetModalForm();
      setIsModalOpen(false);
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
      <div className="space-y-6">
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
    <div className="space-y-6">

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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Giao KPI mới
          </CardTitle>
          <CardDescription>
            Chọn cách giao KPI cho nhân viên hoặc phòng ban
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-14 flex items-center gap-3 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => openModal('individual')}
                >
                  <User className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Giao cho nhân viên</p>
                    <p className="text-xs text-muted-foreground">Chọn nhân viên cụ thể</p>
                  </div>
                </Button>
              </DialogTrigger>
            </Dialog>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-14 flex items-center gap-3 hover:bg-green-50 hover:border-green-300"
                  onClick={() => openModal('department')}
                >
                  <Building2 className="w-5 h-5 text-green-600" />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Giao cho phòng ban</p>
                    <p className="text-xs text-muted-foreground">Giao cho toàn bộ phòng ban</p>
                  </div>
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      {/* Modal Dialog - Simplified Single Page Layout */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[96vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Giao KPI mới - {assignmentType === 'individual' ? 'Nhân viên' : 'Phòng ban'}
            </DialogTitle>
            <DialogDescription>
              {assignmentType === 'individual' 
                ? 'Chọn nhân viên, KPI và thiết lập chỉ tiêu'
                : 'Chọn phòng ban, KPI và thiết lập chỉ tiêu'
              }
            </DialogDescription>
          </DialogHeader>

          {/* Single Page Layout with 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
            {/* Left Column: Selection */}
            <div className="flex flex-col space-y-4 overflow-hidden">
              {/* Target Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {assignmentType === 'individual' ? (
                      <>
                        <User className="w-4 h-4" />
                        Chọn nhân viên
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        Chọn phòng ban
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assignmentType === 'individual' ? (
                    <div className="space-y-3">
                      {/* Employee Selection Mode */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Chế độ chọn nhân viên</Label>
                        <RadioGroup value={useMultiEmployee ? 'multi' : 'single'} onValueChange={(value) => setUseMultiEmployee(value === 'multi')}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="single" id="single" />
                            <Label htmlFor="single" className="text-sm">Chọn một nhân viên</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="multi" id="multi" />
                            <Label htmlFor="multi" className="text-sm">Chọn nhiều nhân viên</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Single Employee Selection */}
                      {!useMultiEmployee && (
                        <Select onValueChange={setSelectedEmployeeUid} value={selectedEmployeeUid || ''}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhân viên..." />
                          </SelectTrigger>
                          <SelectContent>
                            {nonAdminEmployees.map(employee => (
                              <SelectItem key={employee.uid} value={employee.uid || ''}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={employee.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {employee.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{employee.name}</div>
                                    <div className="text-xs text-muted-foreground">{employee.position}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {/* Multi Employee Selection */}
                      {useMultiEmployee && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {selectedEmployeeUids.length} đã chọn
                            </Badge>
                            <div className="flex gap-2">
                              {selectedEmployeeUids.length > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={deselectAllEmployees}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Bỏ chọn
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={selectAllEmployees}
                                className="text-blue-600 hover:text-blue-700 h-6 px-2"
                              >
                                <CheckSquare className="w-3 h-3 mr-1" />
                                Chọn tất cả
                              </Button>
                            </div>
                          </div>

                          <div className="max-h-60 overflow-y-auto border rounded-lg bg-gray-50/50">
                            <div className="p-2 space-y-1">
                              {nonAdminEmployees.map(employee => (
                                <div 
                                  key={employee.uid} 
                                  className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer hover:bg-white hover:shadow-sm ${
                                    selectedEmployeeUids.includes(employee.uid!) 
                                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                      : 'bg-white border-gray-200'
                                  }`}
                                  onClick={() => toggleEmployeeSelection(employee.uid!)}
                                >
                                  <div className="mt-1">
                                    {selectedEmployeeUids.includes(employee.uid!) ? (
                                      <CheckSquare className="w-4 h-4 text-blue-600" />
                                    ) : (
                                      <Square className="w-4 h-4 text-gray-400" />
                                    )}
                                  </div>
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={employee.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {employee.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-gray-900">{employee.name}</p>
                                    <p className="text-xs text-gray-500">{employee.position}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Select onValueChange={setSelectedDepartmentId} value={selectedDepartmentId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phòng ban..." />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(department => (
                            <SelectItem key={department.id} value={department.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{department.name}</span>
                                <Badge variant="secondary" className="ml-2">
                                  {getEmployeesByDepartment(department.id).length} nhân viên
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedDepartmentId && (
                        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Sẽ giao KPI cho {getEmployeesByDepartment(selectedDepartmentId).length} nhân viên trong phòng ban {selectedDepartment?.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* KPI Selection */}
              <Card className="flex flex-col flex-1 min-h-0">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Chọn KPI
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {selectedKpiIds.length} đã chọn
                      </Badge>
                      {selectedKpiIds.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={deselectAllKpis}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Bỏ chọn
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex flex-col flex-1 min-h-0">
                  {/* Search and Filter */}
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm KPI..."
                        value={kpiSearchTerm}
                        onChange={(e) => setKpiSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={kpiFilterCategory} onValueChange={setKpiFilterCategory}>
                      <SelectTrigger className="w-32">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {kpiCategories.filter(cat => cat !== 'all').map(category => (
                          <SelectItem key={category} value={category || ''}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {filteredKpis.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{filteredKpis.length} KPI có sẵn</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={selectAllKpis}
                        className="text-blue-600 hover:text-blue-700 h-6 px-2"
                      >
                        <CheckSquare className="w-3 h-3 mr-1" />
                        Chọn tất cả
                      </Button>
                    </div>
                  )}

                  {/* KPI List */}
                  <div className="flex-1 min-h-0 overflow-y-auto border rounded-lg bg-gray-50/50">
                    {filteredKpis.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Không tìm thấy KPI nào</p>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {filteredKpis.map(kpi => (
                          <div 
                            key={kpi.id} 
                            className={`flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-white hover:shadow-sm ${
                              selectedKpiIds.includes(kpi.id) 
                                ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                : 'bg-white border-gray-200'
                            }`}
                            onClick={() => toggleKpiSelection(kpi.id)}
                          >
                            <div className="mt-1">
                              {selectedKpiIds.includes(kpi.id) ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-sm text-gray-900">{kpi.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {kpi.unit}
                                </Badge>
                                {kpi.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {kpi.category}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{kpi.description}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {kpi.frequency}
                                </span>
                                {kpi.department && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {kpi.department}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Summary & Target Setting */}
            <div className="flex flex-col space-y-4 overflow-hidden">
              {/* Assignment Summary */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Tóm tắt giao KPI
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {assignmentType === 'individual' ? (
                        <User className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Building2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {assignmentType === 'individual' ? (
                          useMultiEmployee ? (
                            selectedEmployeeUids.length > 0 
                              ? `Giao cho ${selectedEmployeeUids.length} nhân viên`
                              : 'Chưa chọn nhân viên'
                          ) : (
                            `Giao cho: ${selectedEmployee?.name || 'Chưa chọn nhân viên'}`
                          )
                        ) : (
                          `Giao cho phòng ban: ${selectedDepartment?.name || 'Chưa chọn phòng ban'}`
                        )}
                      </p>
                      {assignmentType === 'department' && selectedDepartmentId && (
                        <p className="text-sm text-gray-600">
                          ({getEmployeesByDepartment(selectedDepartmentId).length} nhân viên)
                        </p>
                      )}
                      {assignmentType === 'individual' && useMultiEmployee && selectedEmployeeUids.length > 0 && (
                        <p className="text-sm text-gray-600">
                          {getSelectedEmployees().map(emp => emp?.name).filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedKpis.length} KPI được chọn
                      </p>
                      <p className="text-sm text-gray-600">
                        {useIndividualTargets ? (
                          'Chỉ tiêu riêng cho từng KPI'
                        ) : (
                          `Chỉ tiêu: ${target || 'Chưa nhập'} (áp dụng cho tất cả ${selectedKpis.length} KPI)`
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Validation Status */}
                  <div className="p-3 rounded-md bg-gray-50">
                    <div className="space-y-2 text-sm">
                      <div className={`flex items-center gap-2 ${(assignmentType === 'individual' ? (useMultiEmployee ? selectedEmployeeUids.length > 0 : selectedEmployeeUid) : selectedDepartmentId) ? 'text-green-600' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${(assignmentType === 'individual' ? (useMultiEmployee ? selectedEmployeeUids.length > 0 : selectedEmployeeUid) : selectedDepartmentId) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        {assignmentType === 'individual' ? (useMultiEmployee ? `Đã chọn ${selectedEmployeeUids.length} nhân viên` : 'Đã chọn nhân viên') : 'Đã chọn phòng ban'}
                      </div>
                      <div className={`flex items-center gap-2 ${selectedKpiIds.length > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${selectedKpiIds.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        Đã chọn {selectedKpiIds.length} KPI
                      </div>
                      <div className={`flex items-center gap-2 ${validateTargets() ? 'text-green-600' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${validateTargets() ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        {useIndividualTargets ? 'Đã nhập chỉ tiêu cho tất cả KPI' : 'Đã nhập chỉ tiêu'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Target Setting */}
              <Card className="flex flex-col flex-1 min-h-0">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Thiết lập chỉ tiêu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex flex-col flex-1 min-h-0">
                  {/* Target Mode Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Chế độ chỉ tiêu</Label>
                    <RadioGroup value={useIndividualTargets ? 'individual' : 'common'} onValueChange={(value) => setUseIndividualTargets(value === 'individual')}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="common" id="common" />
                        <Label htmlFor="common" className="text-sm">Chỉ tiêu chung cho tất cả KPI</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="individual" id="individual" />
                        <Label htmlFor="individual" className="text-sm">Chỉ tiêu riêng cho từng KPI</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Common Target */}
                  {!useIndividualTargets && (
                    <div className="space-y-2">
                      <Label>Chỉ tiêu chung</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Nhập chỉ tiêu..."
                          value={target}
                          onChange={(e) => setTarget(e.target.value)}
                          min="0"
                          step="0.01"
                          className="text-lg flex-1"
                        />
                        <Select defaultValue="unit">
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Đơn vị" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unit">Đơn vị</SelectItem>
                            <SelectItem value="percent">%</SelectItem>
                            <SelectItem value="times">Lần</SelectItem>
                            <SelectItem value="hours">Giờ</SelectItem>
                            <SelectItem value="days">Ngày</SelectItem>
                            <SelectItem value="custom">Tùy chỉnh</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Individual Targets */}
                  {useIndividualTargets && selectedKpis.length > 0 && (
                    <div className="space-y-3 flex flex-col flex-1 min-h-0">
                      <Label className="text-sm font-medium">Chỉ tiêu cho từng KPI</Label>
                      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 border rounded-lg p-3 bg-gray-50/50">
                        {selectedKpis.map(kpi => (
                          <div key={kpi.id} className="flex items-center gap-3 p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{kpi.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-500">{kpi.unit}</p>
                                {kpi.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {kpi.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="w-40 flex gap-1">
                              <Input
                                type="number"
                                placeholder="0"
                                value={individualTargets[kpi.id] || ''}
                                onChange={(e) => updateIndividualTarget(kpi.id, e.target.value)}
                                min="0"
                                step="0.01"
                                className="text-sm flex-1"
                              />
                              <Select defaultValue="unit">
                                <SelectTrigger className="w-16 h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unit">{kpi.unit}</SelectItem>
                                  <SelectItem value="percent">%</SelectItem>
                                  <SelectItem value="times">Lần</SelectItem>
                                  <SelectItem value="hours">Giờ</SelectItem>
                                  <SelectItem value="days">Ngày</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedKpis.length > 0 && !useIndividualTargets && (
                    <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
                      <p className="font-medium mb-2">Chỉ tiêu này sẽ được áp dụng cho {selectedKpis.length} KPI đã chọn:</p>
                      <div className="max-h-40 overflow-y-auto">
                        <ul className="space-y-1">
                          {selectedKpis.map(kpi => (
                            <li key={kpi.id} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              <span className="text-xs">{kpi.name} ({kpi.unit})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-between pt-4 border-t flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !validateTargets() || selectedKpiIds.length === 0 || (assignmentType === 'individual' ? (useMultiEmployee ? selectedEmployeeUids.length === 0 : !selectedEmployeeUid) : !selectedDepartmentId)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xử lý...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Giao {selectedKpis.length} KPI
                </div>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                              .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'pending';
                            
                            // Show summary if multiple statuses
                            if (Object.keys(statusCounts).length > 1) {
                              return (
                                <div className="space-y-1">
                                  <div>{getStatusBadge(mostCommonStatus)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {Object.entries(statusCounts).map(([status, count]) => (
                                      <span key={status} className="mr-2">
                                        {getStatusText(status)}: {count as number}
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
