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
import { PlusCircle, TrendingUp, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataContext } from '@/context/data-context';
import MetricDataForm from '@/components/metric-data-form';
import type { KpiRecord } from '@/types';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';

export default function MetricsTab() {
  const { kpiRecords, employees, kpis, departments } = useContext(DataContext);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterKpi, setFilterKpi] = useState('all');

  const enrichedKpiRecords = useMemo(() => {
    return kpiRecords.map(record => {
      const employee = employees.find(e => e.id === record.employeeId);
      const kpi = kpis.find(k => k.id === record.kpiId);
      const department = departments.find(d => d.id === employee?.departmentId);
      
      return {
        ...record,
        employeeName: employee?.name || 'Unknown',
        kpiName: kpi?.name || 'Unknown',
        kpiUnit: kpi?.unit || '',
        departmentName: department?.name || 'Unknown',
        completionRate: record.actual && record.target ? (record.actual / record.target) * 100 : 0,
      };
    });
  }, [kpiRecords, employees, kpis, departments]);

  const filteredRecords = useMemo(() => {
    return enrichedKpiRecords.filter(record => {
      const employee = employees.find(e => e.id === record.employeeId);
      const matchesDepartment = filterDepartment === 'all' || employee?.departmentId === filterDepartment;
      const matchesEmployee = filterEmployee === 'all' || record.employeeId === filterEmployee;
      const matchesKpi = filterKpi === 'all' || record.kpiId === filterKpi;
      
      return matchesDepartment && matchesEmployee && matchesKpi;
    });
  }, [enrichedKpiRecords, filterDepartment, filterEmployee, filterKpi, employees]);

  const getStatusBadge = (record: any) => {
    const now = new Date();
    const endDate = new Date(record.endDate);
    
    if (record.status === 'completed') {
      return <Badge variant="default">Hoàn thành</Badge>;
    }
    
    if (endDate < now) {
      return <Badge variant="destructive">Quá hạn</Badge>;
    }
    
    if (record.status === 'in-progress') {
      return <Badge variant="secondary">Đang thực hiện</Badge>;
    }
    
    return <Badge variant="outline">Chờ thực hiện</Badge>;
  };

  const getCompletionBadge = (rate: number) => {
    if (rate >= 100) {
      return <Badge variant="default">{rate.toFixed(1)}%</Badge>;
    } else if (rate >= 80) {
      return <Badge variant="secondary">{rate.toFixed(1)}%</Badge>;
    } else if (rate >= 50) {
      return <Badge variant="outline">{rate.toFixed(1)}%</Badge>;
    } else {
      return <Badge variant="destructive">{rate.toFixed(1)}%</Badge>;
    }
  };

  // Filter options
  const departmentEmployees = filterDepartment === 'all' 
    ? employees 
    : employees.filter(emp => emp.departmentId === filterDepartment);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quản lý dữ liệu Metrics</CardTitle>
            <CardDescription>
              Nhập và theo dõi dữ liệu thực tế của các KPI đã giao
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nhập dữ liệu
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nhập dữ liệu Metric</DialogTitle>
              </DialogHeader>
              <MetricDataForm onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Lọc theo phòng ban</label>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
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
            <label className="text-sm font-medium">Lọc theo nhân viên</label>
            <Select 
              value={filterEmployee} 
              onValueChange={setFilterEmployee}
              disabled={filterDepartment !== 'all' && departmentEmployees.length === 0}
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
            <label className="text-sm font-medium">Lọc theo KPI</label>
            <Select value={filterKpi} onValueChange={setFilterKpi}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn KPI..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả KPI</SelectItem>
                {kpis.map(kpi => (
                  <SelectItem key={kpi.id} value={kpi.id}>{kpi.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Tổng KPI</p>
                  <p className="text-2xl font-bold">{filteredRecords.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Hoàn thành</p>
                  <p className="text-2xl font-bold">
                    {filteredRecords.filter(r => r.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Đang thực hiện</p>
                  <p className="text-2xl font-bold">
                    {filteredRecords.filter(r => r.status === 'in-progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Quá hạn</p>
                  <p className="text-2xl font-bold">
                    {filteredRecords.filter(r => {
                      const endDate = new Date(r.endDate);
                      return endDate < new Date() && r.status !== 'completed';
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>KPI</TableHead>
              <TableHead>Chỉ tiêu</TableHead>
              <TableHead>Thực tế</TableHead>
              <TableHead>Hoàn thành</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hạn chót</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Không có dữ liệu KPI nào
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map(record => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.employeeName}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{record.kpiName}</p>
                      <p className="text-sm text-muted-foreground">{record.departmentName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {record.target} {record.kpiUnit}
                  </TableCell>
                  <TableCell>
                    {record.actual || 0} {record.kpiUnit}
                  </TableCell>
                  <TableCell>
                    {getCompletionBadge(record.completionRate)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(record)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(record.endDate), 'dd/MM/yyyy')}
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
