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
import { PlusCircle, MoreHorizontal, Pen, Trash2, Loader2, UserPlus } from 'lucide-react';
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
import Loading from '@/app/loading';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/types';


export default function EmployeeManagementPage() {
  const { employees, updateEmployee, deleteEmployee, departments, loading } = useContext(DataContext);
  const { t } = useLanguage();
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();
  
  const handleSaveEmployee = () => {
    // Toast is now handled inside the form for better feedback
  };

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

  const handleSaveEditEmployee = () => {
    // Toast is handled inside the form
    setIsEditDialogOpen(false);
    setEditingEmployee(null);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = async (employeeUid: string) => {
    // Deleting users is now a more complex operation involving server-side logic
    // We've disabled it in the context for now.
    toast({
        title: 'Tính năng bị vô hiệu hóa',
        description: 'Để đảm bảo an toàn, việc xóa người dùng cần được thực hiện từ Firebase Console.',
        variant: 'destructive'
    });
    // await deleteEmployee(employeeId); 
  };
  
  const getDepartmentName = (departmentId: string) => {
      return departments.find(d => d.id === departmentId)?.name ?? 'Không rõ';
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="p-6 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t.employees.title}</CardTitle>
              <CardDescription>
                {t.employees.subtitle}
              </CardDescription>
            </div>
             <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => router.push('/admin/create-employee')}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Tạo nhân viên mới
              </Button>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-gradient">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t.employees.addEmployee}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>{t.employees.addEmployeeTitle}</DialogTitle>
                  </DialogHeader>
                  <AddEmployeeForm onSave={handleSaveEmployee} onClose={() => setIsAddDialogOpen(false)} />
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
                        onSave={handleSaveEditEmployee} 
                        onClose={handleCloseEditDialog} 
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
                <TableHead>{t.employees.name}</TableHead>
                <TableHead>{t.employees.email}</TableHead>
                <TableHead>{t.employees.position}</TableHead>
                <TableHead>{t.employees.department}</TableHead>
                <TableHead>{t.employees.role}</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(employee => (
                <TableRow key={employee.uid}>
                  <TableCell className="font-medium">
                     <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={employee.avatar} alt={employee.name} data-ai-hint="person" />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{employee.name}</span>
                     </div>
                  </TableCell>
                  <TableCell>
                    {employee.email}
                  </TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{getDepartmentName(employee.departmentId)}</TableCell>
                  <TableCell>
                    <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'}>
                        {employee.role === 'admin' ? t.employees.admin : t.employees.employee}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditEmployee(employee.uid!)}>
                          <Pen className="mr-2 h-4 w-4" />
                          {t.common.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 hover:text-red-500 focus:text-red-500"
                          onClick={() => handleDeleteEmployee(employee.uid!)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t.common.delete}
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
    </div>
  );
}
