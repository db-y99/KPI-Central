'use client';
import { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    description: ''
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
      description: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditDepartment = (department: any) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || ''
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

    const departmentData = {
      name: formData.name,
      description: formData.description || '',
      managerId: '',
      email: '',
      phone: ''
    };

    if (editingDepartment) {
      updateDepartment(editingDepartment.id, departmentData);
      toast({
        title: t.common.success,
        description: t.departments.updateSuccess,
      });
    } else {
      addDepartment(departmentData);
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.departments.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t.departments.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm phòng ban..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddDepartment} className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              {t.departments.addDepartment}
            </Button>
          </div>
        </div>
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

      {/* Department Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.departments.departmentList} ({filteredDepartments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <StandardTable>
            <StandardTableHeader>
              <StandardTableRow>
                <StandardTableHead>{t.departments.department}</StandardTableHead>
                <StandardTableHead>{t.departments.manager}</StandardTableHead>
                <StandardTableHead>{t.departments.employees}</StandardTableHead>
                <StandardTableHead>{t.employees.contact}</StandardTableHead>
                <StandardTableHead>{t.common.actions}</StandardTableHead>
              </StandardTableRow>
            </StandardTableHeader>
            <StandardTableBody>
              {filteredDepartments.length === 0 ? (
                <TableEmptyState
                  icon={<Building2 className="w-12 h-12 text-muted-foreground" />}
                  title={searchTerm 
                    ? 'Không tìm thấy phòng ban phù hợp' 
                    : 'Chưa có phòng ban nào'}
                  description={searchTerm 
                    ? 'Thử thay đổi từ khóa tìm kiếm' 
                    : 'Bắt đầu bằng cách thêm phòng ban đầu tiên'}
                  colSpan={5}
                />
              ) : (
                filteredDepartments.map((department) => (
                  <StandardTableRow key={department.id}>
                    <StandardTableCell>
                      <div>
                        <p className="font-medium">{department.name}</p>
                        {department.description && (
                          <p className="text-sm text-muted-foreground">{department.description}</p>
                        )}
                      </div>
                    </StandardTableCell>
                    <StandardTableCell>
                      <Badge variant="outline">
                        {getManagerName(department.managerId)}
                      </Badge>
                    </StandardTableCell>
                    <StandardTableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{getEmployeeCount(department.id)}</span>
                      </div>
                    </StandardTableCell>
                    <StandardTableCell>
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
                    </StandardTableCell>
                    <StandardTableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDepartment(department)}
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
              <Label htmlFor="name">Tên phòng ban *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nhập tên phòng ban"
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả (tùy chọn)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Nhập mô tả về phòng ban..."
                rows={3}
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
