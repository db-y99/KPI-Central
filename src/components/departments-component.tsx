'use client';
import { useState, useContext } from 'react';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Search, Building2, Users, Mail, Phone } from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

export default function DepartmentsComponent() {
  const { departments, employees, addDepartment, updateDepartment, deleteDepartment } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: '',
    email: '',
    phone: ''
  });

  // Filter departments based on search
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setFormData({
      name: '',
      description: '',
      managerId: '',
      email: '',
      phone: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditDepartment = (department: any) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      managerId: department.managerId || '',
      email: department.email || '',
      phone: department.phone || ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveDepartment = () => {
    if (!formData.name) {
      toast({
        title: t.common.error,
        description: t.departments.nameRequired,
        variant: "destructive",
      });
      return;
    }

    if (editingDepartment) {
      updateDepartment(editingDepartment.id, formData);
      toast({
        title: t.common.success,
        description: t.departments.updateSuccess,
      });
    } else {
      addDepartment(formData);
      toast({
        title: t.common.success,
        description: t.departments.createSuccess,
      });
    }

    setIsDialogOpen(false);
    setEditingDepartment(null);
  };

  const getManagerName = (managerId: string) => {
    const manager = employees.find(emp => emp.uid === managerId);
    return manager?.name || 'No manager assigned';
  };

  const getEmployeeCount = (departmentId: string) => {
    return employees.filter(emp => emp.departmentId === departmentId).length;
  };

  const getManagers = () => {
    return employees.filter(emp => emp.role === 'manager' || emp.role === 'admin');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.departments.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t.departments.subtitle}
          </p>
        </div>
        <Button onClick={handleAddDepartment} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          {t.departments.addDepartment}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">{t.employees.totalEmployees}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">{t.employees.allEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.employees.managers}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter(emp => emp.role === 'manager').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.employees.departmentManagers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.employees.avgEmployees}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.length > 0 ? Math.round(employees.length / departments.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">{t.employees.perDepartment}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Department Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.departments.departmentList} ({filteredDepartments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.departments.department}</TableHead>
                <TableHead>{t.departments.manager}</TableHead>
                <TableHead>{t.departments.employees}</TableHead>
                <TableHead>{t.employees.contact}</TableHead>
                <TableHead>{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchTerm 
                      ? 'No departments found matching your search.' 
                      : 'No departments found. Add your first department to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{department.name}</p>
                        {department.description && (
                          <p className="text-sm text-muted-foreground">{department.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getManagerName(department.managerId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{getEmployeeCount(department.id)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {department.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3" />
                            {department.email}
                          </div>
                        )}
                        {department.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3" />
                            {department.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDepartment(department)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Department Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </DialogTitle>
            <DialogDescription>
              {editingDepartment 
                ? 'Update department information' 
                : 'Add a new department to your organization'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Department Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder={t.departments.enterDepartmentName}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={t.departments.enterDescription}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="manager">Manager</Label>
              <select
                id="manager"
                value={formData.managerId}
                onChange={(e) => setFormData({...formData, managerId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a manager</option>
                {getManagers().map(manager => (
                  <option key={manager.uid} value={manager.uid}>
                    {manager.name} - {manager.position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder={t.departments.enterEmail}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder={t.departments.enterPhone}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveDepartment}>
                {editingDepartment ? 'Update' : 'Add'} Department
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
