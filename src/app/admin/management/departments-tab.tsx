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
import { PlusCircle, MoreHorizontal, Pen, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DataContext } from '@/context/data-context';
import AddDepartmentForm from '@/components/add-department-form';
import EditDepartmentForm from '@/components/edit-department-form';
import type { Department } from '@/types';
import { useRouter } from 'next/navigation';

export default function DepartmentsTab() {
  const { departments, employees, deleteDepartment } = useContext(DataContext);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setIsEditDialogOpen(true);
  };

  const handleViewDepartment = (departmentId: string) => {
    router.push(`/admin/departments/${departmentId}`);
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    const employeeCount = employees.filter(emp => emp.departmentId === departmentId).length;
    
    if (employeeCount > 0) {
      toast({
        title: 'Không thể xóa',
        description: `Không thể xóa phòng ban vì còn ${employeeCount} nhân viên trong phòng ban này.`,
        variant: 'destructive'
      });
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa phòng ban "${department?.name}"?`)) {
      try {
        await deleteDepartment(departmentId);
        toast({
          title: 'Thành công!',
          description: `Đã xóa phòng ban "${department?.name}".`,
        });
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: 'Đã có lỗi xảy ra khi xóa phòng ban.',
          variant: 'destructive'
        });
      }
    }
  };

  const getEmployeeCount = (departmentId: string) => {
    return employees.filter(emp => emp.departmentId === departmentId).length;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quản lý phòng ban</CardTitle>
            <CardDescription>
              Thêm, sửa và quản lý các phòng ban trong công ty
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm phòng ban
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Thêm phòng ban mới</DialogTitle>
              </DialogHeader>
              <AddDepartmentForm 
                onSave={() => setIsAddDialogOpen(false)}
                onClose={() => setIsAddDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Sửa thông tin phòng ban</DialogTitle>
              </DialogHeader>
              {editingDepartment && (
                <EditDepartmentForm 
                  department={editingDepartment}
                  onSave={() => {
                    setIsEditDialogOpen(false);
                    setEditingDepartment(null);
                  }}
                  onClose={() => {
                    setIsEditDialogOpen(false);
                    setEditingDepartment(null);
                  }} 
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên phòng ban</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Số nhân viên</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map(department => (
              <TableRow key={department.id}>
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {department.description || 'Không có mô tả'}
                </TableCell>
                <TableCell>
                  <Badge variant={department.isActive ? 'default' : 'secondary'}>
                    {department.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </TableCell>
                <TableCell>{getEmployeeCount(department.id)} người</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDepartment(department.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditDepartment(department)}>
                        <Pen className="mr-2 h-4 w-4" />
                        Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 hover:text-red-500 focus:text-red-500"
                        onClick={() => handleDeleteDepartment(department.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
