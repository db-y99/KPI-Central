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
import { 
  PlusCircle, 
  Building2, 
  Edit2, 
  Trash2, 
  Search, 
  Users,
  MapPin,
  Phone,
  Mail,
  User,
  MoreVertical
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import type { Department } from '@/types';

export default function DepartmentsPage() {
  const { departments, employees, addDepartment, updateDepartment, deleteDepartment } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  
  // Form State
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    manager: '',
    location: '',
    phone: '',
    email: '',
    budget: 0,
    establishedDate: ''
  });

  const [editDepartment, setEditDepartment] = useState({
    name: '',
    description: '',
    manager: '',
    location: '',
    phone: '',
    email: '',
    budget: 0,
    establishedDate: ''
  });

  // Filter departments based on search
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAddDepartment = async () => {
    if (!newDepartment.name.trim()) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.departments.nameRequired as string,
      });
      return;
    }

    try {
      await addDepartment({
        ...newDepartment,
        budget: Number(newDepartment.budget) || 0,
        establishedDate: newDepartment.establishedDate || new Date().toISOString()
      });
      
      toast({
        title: t.common.success as string,
        description: t.departments.createSuccess as string,
      });
      
      setNewDepartment({
        name: '',
        description: '',
        manager: '',
        location: '',
        phone: '',
        email: '',
        budget: 0,
        establishedDate: ''
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.departments.createError as string,
      });
    }
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setEditDepartment({
      name: department.name,
      description: department.description || '',
      manager: department.manager || '',
      location: department.location || '',
      phone: department.phone || '',
      email: department.email || '',
      budget: department.budget || 0,
      establishedDate: department.establishedDate || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment || !editDepartment.name.trim()) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.departments.nameRequired as string,
      });
      return;
    }

    try {
      await updateDepartment(editingDepartment.id, {
        ...editDepartment,
        budget: Number(editDepartment.budget) || 0
      });
      
      toast({
        title: t.common.success as string,
        description: t.departments.updateSuccess as string,
      });
      
      setIsEditDialogOpen(false);
      setEditingDepartment(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.departments.updateError as string,
      });
    }
  };

  const handleDeleteDepartment = async (departmentId: string, departmentName: string) => {
    if (!confirm(t.departments.confirmDelete)) {
      return;
    }

    try {
      await deleteDepartment(departmentId);
      toast({
        title: t.common.success as string,
        description: t.departments.deleteSuccess as string,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.departments.deleteError as string,
      });
    }
  };

  // Get employee count for each department
  const getEmployeeCount = (departmentId: string) => {
    return employees.filter(emp => emp.departmentId === departmentId).length;
  };

  // Get manager name
  const getManagerName = (managerId: string) => {
    const manager = employees.find(emp => emp.uid === managerId);
    return manager ? manager.name : t.departments.notAssigned as string;
  };

  // Calculate stats
  const totalEmployees = employees.filter(emp => emp.role !== 'admin').length;
  const departmentsWithManagers = departments.filter(dept => dept.manager).length;
  const totalBudget = departments.reduce((sum, dept) => sum + (dept.budget || 0), 0);
  const avgEmployeesPerDept = departments.length > 0 ? Math.round(totalEmployees / departments.length) : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">{t.departments.totalDepartments as string}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">{t.departments.totalEmployees as string}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{departmentsWithManagers}</div>
            <p className="text-xs text-muted-foreground">{t.departments.withManagers as string}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{avgEmployeesPerDept}</div>
            <p className="text-xs text-muted-foreground">{t.departments.avgEmployeesPerDept as string}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Department Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.departments.addDepartmentTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t.departments.name} *</Label>
                <Input
                  id="name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  placeholder={t.departments.enterDepartmentName as string}
                />
              </div>
              <div>
                <Label htmlFor="manager">{t.departments.manager}</Label>
                <Input
                  id="manager"
                  value={newDepartment.manager}
                  onChange={(e) => setNewDepartment({ ...newDepartment, manager: e.target.value })}
                  placeholder={t.departments.enterManagerName as string}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">{t.departments.description}</Label>
              <Textarea
                id="description"
                value={newDepartment.description}
                onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                placeholder={t.departments.enterDescription as string}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">{t.departments.location}</Label>
                <Input
                  id="location"
                  value={newDepartment.location}
                  onChange={(e) => setNewDepartment({ ...newDepartment, location: e.target.value })}
                  placeholder={t.departments.enterLocation as string}
                />
              </div>
              <div>
                <Label htmlFor="budget">{t.departments.budget}</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newDepartment.budget}
                  onChange={(e) => setNewDepartment({ ...newDepartment, budget: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">{t.departments.phone}</Label>
                <Input
                  id="phone"
                  value={newDepartment.phone}
                  onChange={(e) => setNewDepartment({ ...newDepartment, phone: e.target.value })}
                  placeholder={t.departments.enterPhone as string}
                />
              </div>
              <div>
                <Label htmlFor="email">{t.departments.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={newDepartment.email}
                  onChange={(e) => setNewDepartment({ ...newDepartment, email: e.target.value })}
                  placeholder={t.departments.enterEmail as string}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="establishedDate">{t.departments.establishedDate}</Label>
              <Input
                id="establishedDate"
                type="date"
                value={newDepartment.establishedDate}
                onChange={(e) => setNewDepartment({ ...newDepartment, establishedDate: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleAddDepartment}>
                {t.departments.addDepartment}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {t.departments.departmentList} ({filteredDepartments.length})
              </CardTitle>
              <CardDescription>
                {t.departments.manageDepartmentInfo}
              </CardDescription>
            </div>
            
            {/* Search and Add Department - Top Right */}
            <div className="flex items-center gap-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.departments.searchPlaceholder as string}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    {t.departments.addDepartment}
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.departments.departmentName}</TableHead>
                <TableHead>{t.departments.departmentHead}</TableHead>
                <TableHead>{t.departments.employees}</TableHead>
                <TableHead>{t.departments.location}</TableHead>
                <TableHead>{t.departments.budgetAmount}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((department) => (
                <TableRow 
                  key={department.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors group"
                  onClick={() => handleEditDepartment(department)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{department.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {department.description || t.departments.noDescription as string}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{getManagerName(department.manager || '')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      <Users className="w-3 h-3 mr-1" />
                      {getEmployeeCount(department.id)} {t.departments.employeesCount as string}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{department.location || t.departments.notUpdated as string}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {department.budget ? 
                          new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(department.budget) : 
                          t.departments.notSet as string
                        }
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditDepartment(department);
                          }}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            {t.departments.editDepartment}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDepartment(department.id, department.name);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t.departments.deleteDepartment}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.departments.editDepartment}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">{t.departments.name} *</Label>
                <Input
                  id="edit-name"
                  value={editDepartment.name}
                  onChange={(e) => setEditDepartment({ ...editDepartment, name: e.target.value })}
                  placeholder={t.departments.enterDepartmentNameEdit as string}
                />
              </div>
              <div>
                <Label htmlFor="edit-manager">{t.departments.manager}</Label>
                <Input
                  id="edit-manager"
                  value={editDepartment.manager}
                  onChange={(e) => setEditDepartment({ ...editDepartment, manager: e.target.value })}
                  placeholder={t.departments.enterManagerNameEdit as string}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">{t.departments.description}</Label>
              <Textarea
                id="edit-description"
                value={editDepartment.description}
                onChange={(e) => setEditDepartment({ ...editDepartment, description: e.target.value })}
                placeholder={t.departments.enterDescriptionEdit as string}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-location">{t.departments.location}</Label>
                <Input
                  id="edit-location"
                  value={editDepartment.location}
                  onChange={(e) => setEditDepartment({ ...editDepartment, location: e.target.value })}
                  placeholder={t.departments.enterLocationEdit as string}
                />
              </div>
              <div>
                <Label htmlFor="edit-budget">{t.departments.budget}</Label>
                <Input
                  id="edit-budget"
                  type="number"
                  value={editDepartment.budget}
                  onChange={(e) => setEditDepartment({ ...editDepartment, budget: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">{t.departments.phone}</Label>
                <Input
                  id="edit-phone"
                  value={editDepartment.phone}
                  onChange={(e) => setEditDepartment({ ...editDepartment, phone: e.target.value })}
                  placeholder={t.departments.enterPhoneEdit as string}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">{t.departments.email}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editDepartment.email}
                  onChange={(e) => setEditDepartment({ ...editDepartment, email: e.target.value })}
                  placeholder={t.departments.enterEmailEdit as string}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-establishedDate">{t.departments.establishedDate}</Label>
              <Input
                id="edit-establishedDate"
                type="date"
                value={editDepartment.establishedDate}
                onChange={(e) => setEditDepartment({ ...editDepartment, establishedDate: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleUpdateDepartment}>
                {t.departments.update}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}