'use client';
import { useState, useContext, useMemo } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import RewardCalculationDisplay from '@/components/reward-calculation-display';
import type { RewardCalculation } from '@/types';
import { DataContext } from '@/context/data-context';

export default function RewardCalculationsTab() {
  const { rewardCalculations, employees, departments } = useContext(DataContext);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCalculationDialogOpen, setIsCalculationDialogOpen] = useState(false);

  // Filter and search logic
  const filteredCalculations = useMemo(() => {
    if (!rewardCalculations) return [];
    
    return rewardCalculations.filter(calc => {
      const employee = employees.find(e => e.id === calc.employeeId);
      const matchesDepartment = selectedDepartment === 'all' || employee?.departmentId === selectedDepartment;
      const matchesEmployee = selectedEmployee === 'all' || calc.employeeId === selectedEmployee;
      const matchesSearch = searchTerm === '' || 
                           employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesDepartment && matchesEmployee && matchesSearch;
    });
  }, [rewardCalculations, selectedDepartment, selectedEmployee, searchTerm, employees]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalAmount = filteredCalculations.reduce((sum, calc) => sum + calc.totalReward, 0);
    const totalEmployees = new Set(filteredCalculations.map(calc => calc.employeeId)).size;
    const completedCalculations = filteredCalculations.filter(calc => calc.status === 'completed').length;
    
    return {
      totalAmount,
      totalEmployees,
      completedCalculations,
      totalCalculations: filteredCalculations.length
    };
  }, [filteredCalculations]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Hoàn thành</Badge>;
      case 'pending':
        return <Badge variant="secondary">Đang chờ</Badge>;
      case 'processing':
        return <Badge variant="outline">Đang xử lý</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Unknown';
  };

  const getDepartmentName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    const department = departments.find(d => d.id === employee?.departmentId);
    return department?.name || 'Unknown';
  };

  // Filter options
  const departmentEmployees = selectedDepartment === 'all' 
    ? employees 
    : employees.filter(emp => emp.departmentId === selectedDepartment);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tính toán thưởng</CardTitle>
            <CardDescription>
              Xem và quản lý các kết quả tính toán thưởng cho nhân viên
            </CardDescription>
          </div>
          <Dialog open={isCalculationDialogOpen} onOpenChange={setIsCalculationDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient">
                <Calculator className="mr-2 h-4 w-4" />
                Tính toán mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tính toán thưởng</DialogTitle>
              </DialogHeader>
              <RewardCalculationDisplay onClose={() => setIsCalculationDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Tổng thưởng</p>
                  <p className="text-xl font-bold">{formatCurrency(summaryStats.totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Nhân viên</p>
                  <p className="text-2xl font-bold">{summaryStats.totalEmployees}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calculator className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Tổng tính toán</p>
                  <p className="text-2xl font-bold">{summaryStats.totalCalculations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Hoàn thành</p>
                  <p className="text-2xl font-bold">{summaryStats.completedCalculations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phòng ban</label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phòng ban..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nhân viên</label>
            <Select 
              value={selectedEmployee} 
              onValueChange={setSelectedEmployee}
              disabled={selectedDepartment !== 'all' && departmentEmployees.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhân viên..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhân viên</SelectItem>
                {departmentEmployees.map(employee => (
                  <SelectItem key={employee.uid} value={employee.id!}>{employee.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Kỳ tính toán</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Chọn kỳ..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Tháng hiện tại</SelectItem>
                <SelectItem value="last">Tháng trước</SelectItem>
                <SelectItem value="quarter">Quý hiện tại</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calculations Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>Kỳ tính toán</TableHead>
              <TableHead>Tổng thưởng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tính toán</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCalculations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Không có dữ liệu tính toán thưởng
                </TableCell>
              </TableRow>
            ) : (
              filteredCalculations.map(calculation => (
                <TableRow key={calculation.id}>
                  <TableCell className="font-medium">
                    {getEmployeeName(calculation.employeeId)}
                  </TableCell>
                  <TableCell>
                    {getDepartmentName(calculation.employeeId)}
                  </TableCell>
                  <TableCell>
                    {new Date(calculation.calculationDate).toLocaleDateString('vi-VN', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatCurrency(calculation.totalReward)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(calculation.status)}
                  </TableCell>
                  <TableCell>
                    {new Date(calculation.calculationDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
