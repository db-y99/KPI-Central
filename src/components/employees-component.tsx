'use client';
import { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  StandardTable,
  StandardTableBody,
  StandardTableCell,
  StandardTableHead,
  StandardTableHeader,
  StandardTableRow,
  TableEmptyState,
} from '@/components/ui/standard-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { PlusCircle, Search, Users, Building2, Mail, Phone, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { createUserAction } from '@/lib/server-actions';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination } from '@/components/ui/pagination';

export default function EmployeesComponent() {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    departmentId: '',
    role: 'employee',
    password: '',
    confirmPassword: '',
    username: '',
    employeeId: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Filter employees based on search and department
  const filteredEmployees = nonAdminEmployees.filter(emp => {
    const name = emp.name || '';
    const email = emp.email || '';
    const position = emp.position || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || emp.departmentId === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Add pagination
  const {
    items: paginatedEmployees,
    pagination,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    setPageSize
  } = usePagination(filteredEmployees, 10);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      departmentId: '',
      role: 'employee',
      password: '',
      confirmPassword: '',
      username: '',
      employeeId: '',
      startDate: new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      position: employee.position,
      departmentId: employee.departmentId,
      role: employee.role,
      password: '',
      confirmPassword: '',
      username: employee.username || '',
      employeeId: employee.employeeId || '',
      startDate: employee.startDate || new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  // Helper function to generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setFormData({...formData, password: newPassword, confirmPassword: newPassword});
  };

  const handleSaveEmployee = async () => {
    // Validation for new employee creation
    if (!editingEmployee) {
      if (!formData.name || !formData.email || !formData.position || !formData.departmentId || 
          !formData.password || !formData.confirmPassword || !formData.username || !formData.employeeId) {
        toast({
          title: t.common.error,
          description: t.employees.fillRequiredFields,
          variant: "destructive",
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: t.common.error,
          description: t.employees.passwordMismatch,
          variant: "destructive",
        });
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: t.common.error,
          description: t.employees.passwordMinLength,
          variant: "destructive",
        });
        return;
      }

      // Generate employee ID if not provided
      if (!formData.employeeId) {
        const nextId = Math.max(0, ...employees.map(emp => parseInt(emp.employeeId || '0'))) + 1;
        formData.employeeId = `EMP${nextId.toString().padStart(4, '0')}`;
      }

      setIsCreating(true);
      try {
        const result = await createUserAction({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          name: formData.name,
          position: formData.position,
          departmentId: formData.departmentId,
          role: formData.role,
          phone: formData.phone,
          startDate: formData.startDate,
          employeeId: formData.employeeId
        });

        if (result.success) {
          toast({
            title: t.common.success,
            description: result.message,
          });
          setIsDialogOpen(false);
          setEditingEmployee(null);
          // Refresh the page to get updated data
          window.location.reload();
        } else {
          toast({
            title: t.common.error,
            description: result.error,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: t.common.error,
          description: t.employees.errorOccurredAddingEmployee,
          variant: "destructive",
        });
      } finally {
        setIsCreating(false);
      }
    } else {
      // Handle edit mode (existing functionality)
      if (!formData.name || !formData.email || !formData.position || !formData.departmentId) {
        toast({
          title: t.common.error,
          description: t.employees.fillRequiredFields,
          variant: "destructive",
        });
        return;
      }

      updateEmployee(editingEmployee.uid, formData);
      toast({
        title: t.common.success,
        description: t.employees.updateSuccess,
      });
      setIsDialogOpen(false);
      setEditingEmployee(null);
    }
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department?.name || 'Unknown Department';
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-blue-100 text-blue-800">Manager</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">Employee</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.employees.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t.employees.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {/* Filter */}
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t.employees.selectDepartment} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.employees.allDepartments}</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddEmployee} className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              {t.employees.addEmployee}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.employees.totalEmployees}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nonAdminEmployees.length}</div>
            <p className="text-xs text-muted-foreground">{t.employees.activeEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.departments.totalDepartments}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">{t.departments.activeDepartments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.employees.managers}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nonAdminEmployees.filter(emp => emp.role === 'manager').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.employees.teamManagers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.employees.regularEmployees}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nonAdminEmployees.filter(emp => emp.role === 'employee').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.employees.regularStaff}</p>
          </CardContent>
        </Card>
      </div>


      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.employees.employeeList} ({pagination.totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          <StandardTable>
            <StandardTableHeader>
              <StandardTableRow>
                <StandardTableHead>{t.employees.employee}</StandardTableHead>
                <StandardTableHead>{t.employees.position}</StandardTableHead>
                <StandardTableHead>{t.employees.department}</StandardTableHead>
                <StandardTableHead>{t.employees.role}</StandardTableHead>
                <StandardTableHead>{t.employees.contact}</StandardTableHead>
                <StandardTableHead>{t.common.actions}</StandardTableHead>
              </StandardTableRow>
            </StandardTableHeader>
            <StandardTableBody>
              {paginatedEmployees.length === 0 ? (
                <TableEmptyState
                  icon={<Users className="w-12 h-12 text-muted-foreground" />}
                  title={searchTerm || selectedDepartment !== 'all'
                    ? 'Không tìm thấy nhân viên phù hợp'
                    : 'Chưa có nhân viên nào'}
                  description={searchTerm || selectedDepartment !== 'all'
                    ? 'Thử thay đổi bộ lọc để tìm thấy nhân viên'
                    : 'Bắt đầu bằng cách thêm nhân viên đầu tiên'}
                  colSpan={6}
                />
              ) : (
                paginatedEmployees.map((employee) => (
                  <StandardTableRow key={employee.uid}>
                    <StandardTableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback>
                            {(employee.name || employee.email || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{employee.email || 'No email'}</p>
                        </div>
                      </div>
                    </StandardTableCell>
                    <StandardTableCell>
                      <p className="font-medium">{employee.position || 'No position'}</p>
                    </StandardTableCell>
                    <StandardTableCell>
                      <Badge variant="outline">{getDepartmentName(employee.departmentId)}</Badge>
                    </StandardTableCell>
                    <StandardTableCell>
                      {getRoleBadge(employee.role)}
                    </StandardTableCell>
                    <StandardTableCell>
                      <div className="space-y-1">
                        {employee.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3" />
                            {employee.phone || 'No phone'}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3" />
                          {employee.email || 'No email'}
                        </div>
                      </div>
                    </StandardTableCell>
                    <StandardTableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        Edit
                      </Button>
                    </StandardTableCell>
                  </StandardTableRow>
                ))
              )}
            </StandardTableBody>
          </StandardTable>
        </CardContent>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={totalPages}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              onPageChange={goToPage}
              onPageSizeChange={setPageSize}
              showPageSizeSelector={true}
            />
          </div>
        )}
      </Card>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? t.employees.updateEmployeeInfo : t.employees.createNewAccount}
            </DialogTitle>
            <DialogDescription>
              {editingEmployee 
                ? t.employees.updateEmployeeInfo
                : t.employees.addNewEmployeeToSystem}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.employees.basicInfo}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">{t.employees.fullName} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder={t.employees.enterFullName}
                  />
                </div>

                <div>
                  <Label htmlFor="email">{t.employees.email} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder={t.employees.enterEmail}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">{t.employees.phoneNumber}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder={t.employees.enterPhoneNumber}
                  />
                </div>

                <div>
                  <Label htmlFor="position">{t.employees.position} *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    placeholder={t.employees.enterPosition}
                  />
                </div>

                <div>
                  <Label htmlFor="employeeId">{t.employees.employeeId} *</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    placeholder="EMP0001"
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">{t.employees.startDate} *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="department">{t.employees.department} *</Label>
                  <Select value={formData.departmentId} onValueChange={(value) => setFormData({...formData, departmentId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.employees.selectDepartment} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="role">{t.employees.role}</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">{t.employees.employee}</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Authentication Information - Only for new employees */}
            {!editingEmployee && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.employees.loginCredentials}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="username">{t.employees.username} *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="username"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">{t.employees.loginPassword} *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder={t.employees.passwordForEmployeeLogin}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={handleGeneratePassword}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {t.employees.clickToGenerateRandom}
                    </Button>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="confirmPassword">{t.employees.confirmPassword} *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        placeholder={t.employees.confirmPassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {t.employees.employeeWillUseEmailPassword}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button 
                onClick={handleSaveEmployee}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t.common.creating}
                  </>
                ) : (
                  editingEmployee ? t.employees.update : t.employees.createAccount
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
