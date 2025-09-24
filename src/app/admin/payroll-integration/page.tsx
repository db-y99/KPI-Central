'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  Download,
  Upload,
  FileText,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import { usePDFExport } from '@/lib/pdf-export';

interface PayrollData {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  period: string;
  baseSalary: number;
  rewardAmount: number;
  penaltyAmount: number;
  netSalary: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export default function PayrollIntegrationPage() {
  const { employees, departments, rewardCalculations } = useContext(DataContext);
  const { t } = useLanguage();
  const { exportToPDF } = usePDFExport();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Get unique periods
  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(rewardCalculations.map(calc => calc.period))];
    return uniquePeriods.sort();
  }, [rewardCalculations]);

  // Generate payroll data
  const payrollData = useMemo(() => {
    return nonAdminEmployees.map(employee => {
      const department = departments.find(d => d.id === employee.departmentId);
      const calculation = rewardCalculations.find(calc => calc.employeeId === employee.uid);
      
      // Mock base salary - in real implementation, this would come from HR system
      const baseSalary = 10000000; // 10M VND base salary
      
      return {
        id: `payroll-${employee.uid}-${calculation?.period || 'Q1-2024'}`,
        employeeId: employee.uid!,
        employeeName: employee.name,
        department: department?.name || 'Chưa phân công',
        position: employee.position,
        period: calculation?.period || 'Q1-2024',
        baseSalary,
        rewardAmount: calculation?.totalReward || 0,
        penaltyAmount: calculation?.totalPenalty || 0,
        netSalary: baseSalary + (calculation?.netAmount || 0),
        status: calculation?.status === 'approved' ? 'approved' : 'pending',
        createdAt: calculation?.createdAt || new Date().toISOString(),
        updatedAt: calculation?.updatedAt || new Date().toISOString()
      };
    });
  }, [nonAdminEmployees, departments, rewardCalculations]);

  // Filter payroll data
  const filteredPayrollData = useMemo(() => {
    return payrollData.filter(data => {
      const periodMatch = selectedPeriod === 'all' || data.period === selectedPeriod;
      const statusMatch = selectedStatus === 'all' || data.status === selectedStatus;
      const departmentMatch = selectedDepartment === 'all' || data.department === selectedDepartment;
      return periodMatch && statusMatch && departmentMatch;
    });
  }, [payrollData, selectedPeriod, selectedStatus, selectedDepartment]);

  const handleExportPayroll = async () => {
    try {
      await exportToPDF(
        'payroll-report',
        'bao-cao-luong.pdf',
        'Báo cáo lương',
        {
          includeHeader: true,
          includeFooter: true,
          includePageNumbers: true,
          orientation: 'portrait'
        }
      );
    } catch (error) {
      console.error('Error exporting payroll PDF:', error);
    }
  };

  const handleExportCSV = () => {
    const csvData = filteredPayrollData.map(data => ({
      'Mã NV': data.employeeId,
      'Tên NV': data.employeeName,
      'Phong ban': data.department,
      'Chuc vu': data.position,
      'Kỳ': data.period,
      'Lương cơ bản': data.baseSalary,
      'Thuong': data.rewardAmount,
      'Phat': data.penaltyAmount,
      'Lương thực nhận': data.netSalary,
      'Trang thai': data.status === 'approved' ? 'Da duyet' : 'Da nop'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bao-cao-luong.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkApprove = () => {
    const pendingData = filteredPayrollData.filter(data => data.status === 'pending');
    pendingData.forEach(data => {
      // Here you would typically update the status
      console.log('Approving payroll for:', data.employeeName);
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Đã duyệt</Badge>;
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-800"><DollarSign className="w-3 h-3 mr-1" />Đã chi</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tích hợp Payroll</h1>
          <p className="text-muted-foreground">Xuất dữ liệu thưởng/phạt cho hệ thống lương</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Xuất CSV
          </Button>
          <Button onClick={handleExportPayroll} variant="outline" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Xuất PDF
          </Button>
          <Button onClick={handleBulkApprove} className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Duyệt hàng loạt
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{filteredPayrollData.length}</div>
            <p className="text-xs text-muted-foreground">Tổng số nhân viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredPayrollData.filter(d => d.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Đã duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(filteredPayrollData.reduce((sum, d) => sum + d.netSalary, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Tổng lương</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(filteredPayrollData.reduce((sum, d) => sum + d.rewardAmount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Tổng thưởng</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Kỳ:</span>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn kỳ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả kỳ</SelectItem>
                  {periods.map(period => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Trạng thái:</span>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="paid">Đã chi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Phòng ban:</span>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng ban</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dữ liệu Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="payroll-report" className="space-y-4">
            {filteredPayrollData.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Không có dữ liệu payroll nào</p>
              </div>
            ) : (
              filteredPayrollData.map((data) => (
                <div key={data.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{data.employeeName}</h4>
                        <p className="text-sm text-muted-foreground">{data.position}</p>
                        <p className="text-sm text-muted-foreground">{data.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(data.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(data.baseSalary)}
                      </div>
                      <p className="text-xs text-muted-foreground">Lương cơ bản</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(data.rewardAmount)}
                      </div>
                      <p className="text-xs text-muted-foreground">Thưởng</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">
                        {formatCurrency(data.penaltyAmount)}
                      </div>
                      <p className="text-xs text-muted-foreground">Phạt</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {formatCurrency(data.netSalary)}
                      </div>
                      <p className="text-xs text-muted-foreground">Thực nhận</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-600">
                        {data.period}
                      </div>
                      <p className="text-xs text-muted-foreground">Kỳ</p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <span className="text-muted-foreground">Tổng thu nhập:</span>
                        <p className="font-medium">{formatCurrency(data.baseSalary + data.rewardAmount)}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-muted-foreground">Tổng khấu trừ:</span>
                        <p className="font-medium">{formatCurrency(data.penaltyAmount)}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-muted-foreground">Lương cuối cùng:</span>
                        <p className="font-bold text-lg">{formatCurrency(data.netSalary)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn xuất dữ liệu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Xuất CSV cho HR</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  File CSV chứa đầy đủ thông tin lương, thưởng, phạt để import vào hệ thống HR.
                </p>
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Tải CSV
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Xuất PDF báo cáo</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Báo cáo PDF chi tiết để lưu trữ và trình bày cho ban lãnh đạo.
                </p>
                <Button onClick={handleExportPayroll} variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Tải PDF
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
