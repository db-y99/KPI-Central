'use client';

import { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Shield, 
  Plus, 
  Trash2, 
  Save, 
  X,
  Eye,
  Edit,
  BarChart3
} from 'lucide-react';
import type { Kpi, Employee, Department } from '@/types';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DataContext } from '@/context/data-context';

interface KpiPermission {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAssign: boolean;
  };
}

interface KpiPermissionsModalProps {
  kpi: Kpi | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function KpiPermissionsModal({ kpi, isOpen, onClose, onSave }: KpiPermissionsModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [permissions, setPermissions] = useState<KpiPermission[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { updateKpi } = useContext(DataContext);

  // Load employees and departments
  useEffect(() => {
    if (isOpen && kpi) {
      loadData();
    }
  }, [isOpen, kpi]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load employees
      const employeesRef = collection(db, 'employees');
      const employeesQuery = query(employeesRef, where('isActive', '==', true), orderBy('name'));
      const employeesSnapshot = await getDocs(employeesQuery);
      const employeesData: Employee[] = [];
      employeesSnapshot.forEach((doc) => {
        employeesData.push({ id: doc.id, ...doc.data() } as Employee);
      });
      setEmployees(employeesData);

      // Load departments
      const departmentsRef = collection(db, 'departments');
      const departmentsQuery = query(departmentsRef, where('isActive', '==', true), orderBy('name'));
      const departmentsSnapshot = await getDocs(departmentsQuery);
      const departmentsData: Department[] = [];
      departmentsSnapshot.forEach((doc) => {
        departmentsData.push({ id: doc.id, ...doc.data() } as Department);
      });
      setDepartments(departmentsData);

      // Load existing permissions for this KPI
      if (kpi?.permissions) {
        const permissionsData: KpiPermission[] = [];
        for (const [employeeId, perm] of Object.entries(kpi.permissions)) {
          const employee = employeesData.find(emp => emp.id === employeeId);
          if (employee) {
            permissionsData.push({
              id: employeeId,
              employeeId,
              employeeName: employee.name,
              department: employee.department,
              permissions: perm as any
            });
          }
        }
        setPermissions(permissionsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu.',
      });
    } finally {
      setLoading(false);
    }
  };

  const addPermission = () => {
    if (!selectedEmployee) return;

    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) return;

    // Check if permission already exists
    if (permissions.find(p => p.employeeId === selectedEmployee)) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Nhân viên này đã có quyền truy cập KPI.',
      });
      return;
    }

    const newPermission: KpiPermission = {
      id: selectedEmployee,
      employeeId: selectedEmployee,
      employeeName: employee.name,
      department: employee.department,
      permissions: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canAssign: false,
      }
    };

    setPermissions([...permissions, newPermission]);
    setSelectedEmployee('');
  };

  const removePermission = (employeeId: string) => {
    setPermissions(permissions.filter(p => p.employeeId !== employeeId));
  };

  const updatePermission = (employeeId: string, permissionType: keyof KpiPermission['permissions'], value: boolean) => {
    setPermissions(permissions.map(p => 
      p.employeeId === employeeId 
        ? { ...p, permissions: { ...p.permissions, [permissionType]: value } }
        : p
    ));
  };

  const handleSave = async () => {
    if (!kpi) return;

    setIsSaving(true);
    try {
      // Convert permissions to the format expected by KPI
      const permissionsData: Record<string, any> = {};
      permissions.forEach(perm => {
        permissionsData[perm.employeeId] = perm.permissions;
      });

      console.log('Saving permissions for KPI:', kpi.id, permissionsData);

      // Update KPI using context function
      await updateKpi(kpi.id, {
        permissions: permissionsData,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật quyền truy cập KPI.',
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể lưu quyền truy cập.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const availableEmployees = employees.filter(emp => 
    !permissions.find(p => p.employeeId === emp.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Phân quyền KPI: {kpi?.name}
          </DialogTitle>
          <DialogDescription>
            Quản lý quyền truy cập và chỉnh sửa KPI cho từng nhân viên
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add new permission */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thêm quyền truy cập</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="employee-select">Chọn nhân viên</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhân viên..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEmployees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={addPermission}
                    disabled={!selectedEmployee || loading}
                    className="btn-gradient"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quyền truy cập hiện tại</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Đang tải...</div>
              ) : permissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có quyền truy cập nào được thiết lập</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{permission.employeeName}</h4>
                            <Badge variant="secondary">{permission.department}</Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePermission(permission.employeeId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`view-${permission.id}`}
                            checked={permission.permissions.canView}
                            onCheckedChange={(checked) => 
                              updatePermission(permission.employeeId, 'canView', checked as boolean)
                            }
                          />
                          <Label htmlFor={`view-${permission.id}`} className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Xem
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${permission.id}`}
                            checked={permission.permissions.canEdit}
                            onCheckedChange={(checked) => 
                              updatePermission(permission.employeeId, 'canEdit', checked as boolean)
                            }
                          />
                          <Label htmlFor={`edit-${permission.id}`} className="flex items-center gap-1">
                            <Edit className="w-3 h-3" />
                            Sửa
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`delete-${permission.id}`}
                            checked={permission.permissions.canDelete}
                            onCheckedChange={(checked) => 
                              updatePermission(permission.employeeId, 'canDelete', checked as boolean)
                            }
                          />
                          <Label htmlFor={`delete-${permission.id}`} className="flex items-center gap-1">
                            <Trash2 className="w-3 h-3" />
                            Xóa
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`assign-${permission.id}`}
                            checked={permission.permissions.canAssign}
                            onCheckedChange={(checked) => 
                              updatePermission(permission.employeeId, 'canAssign', checked as boolean)
                            }
                          />
                          <Label htmlFor={`assign-${permission.id}`} className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            Gán
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSaving}
          >
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="btn-gradient"
          >
            {isSaving && <Save className="w-4 h-4 mr-2 animate-spin" />}
            Lưu quyền truy cập
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
