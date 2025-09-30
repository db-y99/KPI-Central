'use client';
import { useState, useContext, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserPlus,
  Target,
  Search,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  User,
  Calendar,
  Users,
  ToggleLeft,
  ToggleRight,
  Trash2
} from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { KpiStatusService, KpiStatus } from '@/lib/kpi-status-service';

export default function KpiAssignmentComponent() {
  const { employees, kpis, departments, kpiRecords, assignKpi, removeDuplicateKpiRecords } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'individual' | 'department'>('individual');
  const [formData, setFormData] = useState({
    employeeId: '',
    departmentId: '',
    kpiId: '',
    target: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Filter KPI records based on search, department and status
  const filteredKpiRecords = useMemo(() => {
    return kpiRecords.filter(record => {
      const employee = employees.find(e => e.uid === record.employeeId);
      const kpi = kpis.find(k => k.id === record.kpiId || k.documentId === record.kpiId);
      const department = departments.find(d => d.id === employee?.departmentId);

      // Search filter
      const matchesSearch = searchTerm === '' ||
        (employee?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (kpi?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (department?.name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Department filter
      const matchesDepartment = departmentFilter === 'all' || employee?.departmentId === departmentFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' || (() => {
        try {
          const statusConfig = KpiStatusService.getStatusConfig(statusFilter as KpiStatus);
          return record.status === statusFilter;
        } catch {
          return record.status === statusFilter;
        }
      })();

      return matchesSearch && matchesDepartment && matchesStatus;
    }).reduce((acc, record) => {
      // Additional safety check to prevent duplicates
      if (!acc.find(existingRecord => existingRecord.id === record.id)) {
        acc.push(record);
      }
      return acc;
    }, [] as KpiRecord[]);
  }, [kpiRecords, employees, kpis, departments, searchTerm, departmentFilter, statusFilter]);

  // Helper functions
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.uid === employeeId);
    return employee?.name || t.kpiAssignment.unknownEmployee;
  };

  const getKpiName = (kpiId: string) => {
    const kpi = kpis.find(k => k.id === kpiId);
    return kpi?.name || t.kpiAssignment.unknownKpi;
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department?.name || t.kpiAssignment.unknownDepartment;
  };

  const getStatusColor = (status: string) => {
    try {
      const statusConfig = KpiStatusService.getStatusConfig(status as KpiStatus);
      return `${statusConfig.color.replace('bg-', 'bg-').replace('-500', '-100')} text-${statusConfig.color.replace('bg-', '').replace('-500', '-800')}`;
    } catch (error) {
      // Fallback cho trạng thái cũ
      switch (status) {
        case 'approved':
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'awaiting_approval':
        case 'submitted':
          return 'bg-blue-100 text-blue-800';
        case 'in_progress':
          return 'bg-yellow-100 text-yellow-800';
        case 'not_started':
        case 'pending':
          return 'bg-gray-100 text-gray-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getStatusLabel = (status: string) => {
    try {
      const statusConfig = KpiStatusService.getStatusConfig(status as KpiStatus);
      return statusConfig.label;
    } catch (error) {
      // Fallback cho trạng thái cũ
      switch (status) {
        case 'approved':
        case 'completed':
          return 'Hoàn thành';
        case 'awaiting_approval':
        case 'submitted':
          return 'Chờ duyệt';
        case 'in_progress':
          return 'Đang thực hiện';
        case 'not_started':
        case 'pending':
          return 'Chưa bắt đầu';
        case 'rejected':
          return 'Từ chối';
        default:
          return 'Chưa bắt đầu';
      }
    }
  };

  // Assignment handlers
  const handleAddAssignment = () => {
    setAssignmentType('individual');
    setFormData({
      employeeId: '',
      departmentId: '',
      kpiId: '',
      target: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const handleCleanupDuplicates = async () => {
    try {
      await removeDuplicateKpiRecords();
      toast({
        title: "Thành công!",
        description: "Đã dọn dẹp các bản ghi KPI trùng lặp."
      });
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
      toast({
        variant: 'destructive',
        title: "Lỗi!",
        description: "Không thể dọn dẹp các bản ghi trùng lặp."
      });
    }
  };

  const handleSaveAssignment = async () => {
    // Validation based on assignment type
    if (assignmentType === 'individual') {
      if (!formData.employeeId || !formData.kpiId || !formData.target) {
        toast({
          title: t.common.error,
          description: t.kpiAssignment.fillAllRequiredInfo,
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!formData.departmentId || !formData.kpiId || !formData.target) {
        toast({
          title: t.common.error,
          description: t.kpiAssignment.fillAllRequiredInfo,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      if (assignmentType === 'individual') {
        // Individual assignment
        await assignKpi({
          employeeId: formData.employeeId,
          kpiId: formData.kpiId,
          period: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
          target: Number(formData.target),
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        });

        toast({
          title: t.common.success,
          description: t.kpiAssignment.kpiAssignedSuccessfully,
        });
      } else {
        // Department assignment
        const departmentEmployees = employees.filter(emp => 
          emp.departmentId === formData.departmentId && emp.role !== 'admin'
        );

        if (departmentEmployees.length === 0) {
          toast({
            title: t.common.error,
            description: t.kpiAssignment.noEmployeesInDepartment,
            variant: "destructive",
          });
          return;
        }

        // Assign KPI to all employees in the department
        const assignmentPromises = departmentEmployees.map(employee =>
          assignKpi({
            employeeId: employee.uid,
            kpiId: formData.kpiId,
            period: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
            target: Number(formData.target),
            startDate: new Date(formData.startDate).toISOString(),
            endDate: new Date(formData.endDate).toISOString(),
          })
        );

        await Promise.all(assignmentPromises);

        const department = departments.find(d => d.id === formData.departmentId);
        toast({
          title: t.common.success,
          description: t.kpiAssignment.departmentAssignmentSuccess.replace('{departmentName}', department?.name || ''),
        });
      }

      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.kpiAssignment.errorAssigningKpi,
        variant: "destructive",
      });
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const totalAssignments = kpiRecords.length;
    const activeAssignments = kpiRecords.filter(r => {
      try {
        return KpiStatusService.isActiveStatus(r.status as KpiStatus);
      } catch {
        return ['not_started', 'in_progress', 'submitted', 'awaiting_approval'].includes(r.status);
      }
    }).length;
    const completedAssignments = kpiRecords.filter(r => {
      try {
        return KpiStatusService.isCompletedStatus(r.status as KpiStatus);
      } catch {
        return ['approved', 'completed'].includes(r.status);
      }
    }).length;
    const overdueAssignments = kpiRecords.filter(r => {
      const endDate = new Date(r.endDate);
      const isOverdue = endDate < new Date();
      const isNotCompleted = (() => {
        try {
          return !KpiStatusService.isCompletedStatus(r.status as KpiStatus);
        } catch {
          return !['approved', 'completed', 'rejected'].includes(r.status);
        }
      })();
      return isOverdue && isNotCompleted;
    }).length;

    return {
      total: totalAssignments,
      active: activeAssignments,
      completed: completedAssignments,
      overdue: overdueAssignments,
    };
  }, [kpiRecords]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.kpiAssignment.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t.kpiAssignment.manageKpiAssignment}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCleanupDuplicates} variant="outline">
            <Trash2 className="w-4 h-4 mr-2" />
            Dọn dẹp trùng lặp
          </Button>
          <Button onClick={handleAddAssignment} className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            {t.kpiAssignment.assignKpi}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.kpiAssignment.totalKpiAssigned}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{t.kpiAssignment.allAssignments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.kpiAssignment.inProgress}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">{t.kpiAssignment.activeKpi}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.kpiAssignment.completed}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">{t.kpiAssignment.approvedKpi}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.kpiAssignment.overdue}</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">{t.kpiAssignment.needsImmediateAction}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.kpiAssignment.searchKpiEmployee}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.kpiAssignment.allDepartments} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.kpiAssignment.allDepartments}</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.kpiAssignment.allStatuses} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.kpiAssignment.allStatuses}</SelectItem>
                {Object.values(KpiStatusService.getAllStatuses()).map(status => (
                  <SelectItem key={status.key} value={status.key}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.kpiAssignment.kpiList} ({filteredKpiRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KPI</TableHead>
                <TableHead>{t.kpiAssignment.employee}</TableHead>
                <TableHead>{t.kpiAssignment.department}</TableHead>
                <TableHead>{t.kpiAssignment.target}</TableHead>
                <TableHead>{t.kpiAssignment.actual}</TableHead>
                <TableHead>{t.kpiAssignment.statusColumn}</TableHead>
                <TableHead>{t.kpiAssignment.deadline}</TableHead>
                <TableHead>{t.kpiAssignment.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKpiRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all' ? (
                      <div>
                        <p className="mb-2">{t.kpiAssignment.noKpiMatchFilter}</p>
                        <p className="text-sm">
                          {searchTerm && `Tìm kiếm: "${searchTerm}"`}
                          {departmentFilter !== 'all' && ` | Phòng ban: ${departments.find(d => d.id === departmentFilter)?.name}`}
                          {statusFilter !== 'all' && ` | Trạng thái: ${getStatusLabel(statusFilter)}`}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t.kpiAssignment.noKpiAssignedYet}</h3>
                        <p className="text-muted-foreground mb-4">
                          Chưa có KPI nào được giao cho nhân viên.
                        </p>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>• {t.kpiAssignment.createKpiAt} <a href="/admin/kpi-management?tab=definitions" className="text-blue-600 hover:underline">{t.kpiAssignment.defineKpiLink}</a></p>
                          <p>• {t.kpiAssignment.assignKpiAt} <span className="text-blue-600">{t.kpiAssignment.assignKpiLink}</span></p>
                        </div>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredKpiRecords.map((record) => {
                  const employee = employees.find(e => e.uid === record.employeeId);
                  const kpi = kpis.find(k => k.id === record.kpiId || k.documentId === record.kpiId);
                  const department = departments.find(d => d.id === employee?.departmentId);
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Target className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{kpi?.name || t.kpiAssignment.unknownKpi}</p>
                            <p className="text-sm text-muted-foreground">{kpi?.unit || t.kpiAssignment.unit}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{employee?.name || t.kpiAssignment.unknownEmployee}</p>
                            <p className="text-sm text-muted-foreground">{employee?.position || t.kpiAssignment.unknownPosition}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{department?.name || t.kpiAssignment.unknownDepartment}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{record.target}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{record.actual}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {getStatusLabel(record.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(record.endDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          {t.kpiAssignment.view}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">{t.kpiAssignment.assignNewKpiDialog}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {t.kpiAssignment.assignKpiToEmployee}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Assignment Type Toggle */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ToggleRight className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">
                  {t.kpiAssignment.assignmentType}
                </Label>
              </div>
              <div className="inline-flex h-10 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground w-full">
                <button
                  type="button"
                  onClick={() => setAssignmentType('individual')}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 gap-2 ${
                    assignmentType === 'individual'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'hover:text-foreground'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{t.kpiAssignment.assignToIndividual}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentType('department')}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 gap-2 ${
                    assignmentType === 'department'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'hover:text-foreground'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{t.kpiAssignment.assignToDepartment}</span>
                </button>
              </div>
            </div>

            {/* Employee/Department Selection */}
            {assignmentType === 'individual' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="employee" className="text-sm font-medium">
                    {t.kpiAssignment.employeeRequired}
                  </Label>
                </div>
                <Select value={formData.employeeId} onValueChange={(value) => setFormData({...formData, employeeId: value})}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t.kpiAssignment.selectEmployee} />
                  </SelectTrigger>
                  <SelectContent>
                    {nonAdminEmployees.map(emp => (
                      <SelectItem key={emp.uid} value={emp.uid}>
                        <div className="flex items-center gap-3 py-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{emp.name}</span>
                            <span className="text-xs text-muted-foreground">{emp.position}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="department" className="text-sm font-medium">
                    {t.kpiAssignment.departmentRequired || 'Phòng ban *'}
                  </Label>
                </div>
                <Select value={formData.departmentId} onValueChange={(value) => setFormData({...formData, departmentId: value})}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t.kpiAssignment.selectDepartment} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => {
                      const employeeCount = employees.filter(emp => emp.departmentId === dept.id && emp.role !== 'admin').length;
                      return (
                        <SelectItem key={dept.id} value={dept.id}>
                          <div className="flex items-center gap-3 py-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{dept.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {employeeCount} {t.kpiAssignment.employeesInDepartment}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {formData.departmentId && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">{t.kpiAssignment.departmentEmployees}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {employees
                        .filter(emp => emp.departmentId === formData.departmentId && emp.role !== 'admin')
                        .map(emp => (
                          <div key={emp.uid} className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <span>{emp.name} - {emp.position}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* KPI Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="kpi" className="text-sm font-medium">
                  {t.kpiAssignment.kpiRequired}
                </Label>
              </div>
              <Select value={formData.kpiId} onValueChange={(value) => setFormData({...formData, kpiId: value})}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t.kpiAssignment.selectKpi} />
                </SelectTrigger>
                <SelectContent>
                  {kpis.map(kpi => (
                    <SelectItem key={kpi.id} value={kpi.id}>
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Target className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{kpi.name}</span>
                          <span className="text-xs text-muted-foreground">{kpi.unit} • {kpi.frequency}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="target" className="text-sm font-medium">
                  {t.kpiAssignment.targetRequired}
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="target"
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({...formData, target: e.target.value})}
                  placeholder={t.kpiAssignment.enterTarget}
                  className="h-11 pl-10"
                />
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">{t.kpiAssignment.implementationPeriod}</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                    {t.kpiAssignment.startDate}
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                    {t.kpiAssignment.endDate}
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="notes" className="text-sm font-medium">
                  {t.kpiAssignment.notes}
                </Label>
              </div>
              <div className="relative">
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder={t.kpiAssignment.addNotesOptional}
                  className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
              {t.kpiAssignment.cancel}
            </Button>
            <Button onClick={handleSaveAssignment} className="flex-1">
              {assignmentType === 'individual' ? (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t.kpiAssignment.assignKpi}
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  {t.kpiAssignment.assignToAllEmployees}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}