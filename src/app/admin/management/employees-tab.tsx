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
import { PlusCircle, MoreHorizontal, Pen, Trash2 } from 'lucide-react';
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
import AddEmployeeForm from '@/components/add-employee-form';
import EditEmployeeForm from '@/components/edit-employee-form';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import type { Employee } from '@/types';

export default function EmployeesTab() {
  const { employees, departments } = useContext(DataContext);
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();
  
  const handleEditEmployee = (employeeId: string) => {
    const employee = employees.find(emp => emp.uid === employeeId);
    if (employee) {
      setEditingEmployee(employee);
      setIsEditDialogOpen(true);
    } else {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy thông tin nhân viên.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteEmployee = async (employeeUid: string) => {
    toast({
      title: 'Tính năng bị vô hiệu hóa',
      description: 'Để đảm bảo an toàn, việc xóa người dùng cần được thực hiện từ Firebase Console.',
      variant: 'destructive'
    });
  };
  
  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name ?? 'Không rõ';
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quản lý nhân viên</CardTitle>
            <CardDescription>
              Thêm, sửa và quản lý thông tin nhân viên
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Thêm nhân viên
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Thêm nhân viên mới</DialogTitle>
                </DialogHeader>
                <AddEmployeeForm 
                  onSave={() => setIsAddDialogOpen(false)} 
                  onClose={() => setIsAddDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>

            {/* Edit Employee Dialog */}
            {isEditDialogOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="fixed inset-0 bg-black/50" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingEmployee(null);
                }} />
                <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4">
                  <h2 className="text-lg font-semibold mb-4">Sửa thông tin nhân viên</h2>
                  {editingEmployee && (
                    <EditEmployeeForm 
                      employee={editingEmployee} 
                      onSave={() => {
                        setIsEditDialogOpen(false);
                        setEditingEmployee(null);
                      }} 
                      onClose={() => {
                        setIsEditDialogOpen(false);
                        setEditingEmployee(null);
                      }} 
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Chức vụ</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map(employee => (
              <TableRow key={employee.uid}>
                <TableCell className="font-medium">
                   <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                          <AvatarImage src={employee.avatar} alt={employee.name} />
                          <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{employee.name}</span>
                   </div>
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{getDepartmentName(employee.departmentId)}</TableCell>
                <TableCell>
                  <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'}>
                      {employee.role === 'admin' ? 'Admin' : 'Nhân viên'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditEmployee(employee.uid!)}>
                        <Pen className="mr-2 h-4 w-4" />
                        Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 hover:text-red-500 focus:text-red-500"
                        onClick={() => handleDeleteEmployee(employee.uid!)}
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
