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
import { PlusCircle, MoreHorizontal, Pen, Trash2, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DataContext } from '@/context/data-context';
import Loading from '@/app/loading';


export default function EmployeeManagementPage() {
  const { employees, deleteEmployee, departments, loading } = useContext(DataContext);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const handleSaveEmployee = () => {
    // Toast is now handled inside the form for better feedback
  };

  const handleEditEmployee = (employeeId: string) => {
    toast({
        title: 'Tính năng đang phát triển',
        description: 'Chức năng sửa thông tin nhân viên sẽ được cập nhật sớm.',
    });
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
              <CardTitle>Quản lý nhân viên</CardTitle>
              <CardDescription>
                Thêm, sửa, hoặc xóa thông tin nhân viên trong tổ chức.
              </CardDescription>
            </div>
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
                <AddEmployeeForm onSave={handleSaveEmployee} onClose={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
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
                        {employee.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
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
    </div>
  );
}
