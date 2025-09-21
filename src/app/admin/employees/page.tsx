'use client';
import { useState, useContext } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Users, Search, Edit2, Trash2, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { createUserAction } from '@/lib/server-actions';
import type { Employee } from '@/types';

export default function EmployeesPage() {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Add Employee Form State
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    position: '',
    departmentId: '',
    phone: '',
    password: '123456' // Mật khẩu mặc định để nhân viên đăng nhập
  });

  // Edit Employee Form State
  const [editEmployee, setEditEmployee] = useState({
    name: '',
    email: '',
    position: '',
    departmentId: '',
    phone: ''
  });

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Filter employees based on search and department
  const filteredEmployees = nonAdminEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' ||
                             employee.departmentId === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.position || !newEmployee.departmentId || !newEmployee.password) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.employees.fillRequiredFields as string,
      });
      return;
    }

    try {
      // Generate unique username from email
      const username = newEmployee.email.split('@')[0];
      
      // Generate unique employee ID
      const employeeId = `EMP${Date.now().toString().slice(-6)}`;
      
      // Call server action to create user
      const result = await createUserAction({
        email: newEmployee.email,
        username: username,
        password: newEmployee.password,
        confirmPassword: newEmployee.password,
        name: newEmployee.name,
        position: newEmployee.position,
        departmentId: newEmployee.departmentId,
        role: 'employee',
        phone: newEmployee.phone || '',
        startDate: new Date().toISOString(),
        employeeId: employeeId
      });

      if (result.success) {
        toast({
          title: t.employees.success as string,
          description: result.message || t.employees.accountCreatedForEmployee.replace('{name}', newEmployee.name).replace('{email}', newEmployee.email),
        });

        // Reset form
        setNewEmployee({
          name: '',
          email: '',
          position: '',
          departmentId: '',
          phone: '',
          password: '123456'
        });
        setIsAddDialogOpen(false);
        
        // Refresh data to show new employee
        await addEmployee();
      } else {
        toast({
          variant: 'destructive',
          title: t.common.error as string,
          description: result.error || t.employees.errorOccurredAddingEmployee as string,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.employees.errorOccurredAddingEmployee as string,
      });
      console.error('Failed to add employee:', error);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditEmployee({
      name: employee.name,
      email: employee.email,
      position: employee.position,
      departmentId: employee.departmentId || '',
      phone: employee.phone || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee || !editEmployee.name || !editEmployee.email || !editEmployee.position) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.employees.fillRequiredFields as string,
      });
      return;
    }

    try {
      await updateEmployee(editingEmployee.uid!, editEmployee);

      toast({
        title: t.employees.updateSuccess as string,
        description: t.employees.updatedEmployeeInfo.replace('{name}', editEmployee.name),
      });

      setIsEditDialogOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.employees.errorOccurredUpdatingEmployee as string,
      });
      console.error('Failed to update employee:', error);
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (confirm(t.employees.confirmDeleteEmployee.replace('{name}', employee.name))) {
      try {
        await deleteEmployee(employee.uid!);
        
        toast({
          title: t.employees.employeeDeleteSuccess as string,
          description: t.employees.deletedEmployee.replace('{name}', employee.name),
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: t.common.error as string,
          description: t.employees.errorOccurredDeletingEmployee as string,
        });
        console.error('Failed to delete employee:', error);
      }
    }
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : t.departments.notAssigned as string;
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewEmployee({...newEmployee, password});
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.employees.title}</h1>
          <p className="text-muted-foreground">{t.employees.subtitle}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              {t.employees.createNewAccount}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t.employees.createNewAccount}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {t.employees.addNewEmployeeToSystem}
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.employees.fullName} *</Label>
                <Input
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  placeholder={t.employees.enterFullName as string}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  placeholder="Nhập email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">{t.employees.position} *</Label>
                <Input
                  id="position"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                  placeholder={t.employees.enterPosition as string}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">{t.employees.department} *</Label>
                <Select value={newEmployee.departmentId} onValueChange={(value) => setNewEmployee({...newEmployee, departmentId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.employees.selectDepartment as string} />
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
              
              <div className="space-y-2">
                <Label htmlFor="phone">{t.employees.phoneNumber}</Label>
                <Input
                  id="phone"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  placeholder={t.employees.enterPhoneNumber as string}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t.employees.loginPassword} *</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                    placeholder={t.employees.passwordForEmployeeLogin as string}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateRandomPassword}
                    className="flex-shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.employees.employeeWillUseEmailPassword}
                  <RefreshCw className="w-3 h-3 inline mx-1" /> {t.employees.clickToGenerateRandom}.
                </p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t.common.cancel}
                </Button>
                <Button onClick={handleAddEmployee}>
                  {t.employees.createAccount}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>


      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{nonAdminEmployees.length}</div>
            <p className="text-xs text-muted-foreground">{t.employees.totalEmployees}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">{t.departments.title}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {nonAdminEmployees.filter(emp => emp.departmentId).length}
            </div>
            <p className="text-xs text-muted-foreground">{t.employees.assigned}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={t.employees.searchByNameEmailPosition as string}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.employees.selectDepartment as string} />
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
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t.employees.employeeList} ({filteredEmployees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.employees.noEmployeesFound}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.employees.employee}</TableHead>
                  <TableHead>{t.employees.position}</TableHead>
                  <TableHead>{t.employees.department}</TableHead>
                  <TableHead>{t.employees.contact}</TableHead>
                  <TableHead>{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback>
                            {employee.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getDepartmentName(employee.departmentId || '')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{employee.phone || t.employees.noPhone as string}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.employees.editEmployee}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t.employees.fullName} *</Label>
              <Input
                id="edit-name"
                value={editEmployee.name}
                onChange={(e) => setEditEmployee({...editEmployee, name: e.target.value})}
                placeholder={t.employees.enterFullName as string}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmployee.email}
                onChange={(e) => setEditEmployee({...editEmployee, email: e.target.value})}
                placeholder="Nhập email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-position">{t.employees.position} *</Label>
              <Input
                id="edit-position"
                value={editEmployee.position}
                onChange={(e) => setEditEmployee({...editEmployee, position: e.target.value})}
                placeholder={t.employees.enterPosition as string}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-department">{t.employees.department}</Label>
              <Select value={editEmployee.departmentId} onValueChange={(value) => setEditEmployee({...editEmployee, departmentId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t.employees.selectDepartment as string} />
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
            
            <div className="space-y-2">
              <Label htmlFor="edit-phone">{t.employees.phoneNumber}</Label>
              <Input
                id="edit-phone"
                value={editEmployee.phone}
                onChange={(e) => setEditEmployee({...editEmployee, phone: e.target.value})}
                placeholder={t.employees.enterPhoneNumber as string}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleUpdateEmployee}>
                {t.employees.update}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}