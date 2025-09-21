'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  Calculator,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  User,
  Calendar,
  Download
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
import { usePDFExport } from '@/lib/pdf-export';

interface RewardCalculation {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  period: string;
  totalReward: number;
  totalPenalty: number;
  netAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  breakdown: {
    rewards: Array<{
      type: string;
      amount: number;
      description: string;
    }>;
    penalties: Array<{
      type: string;
      amount: number;
      description: string;
      severity: string;
    }>;
  };
}

export default function RewardCalculationsPage() {
  const { employees, departments, rewardCalculations } = useContext(DataContext);
  const { exportToPDF } = usePDFExport();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Get unique periods from calculations
  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(rewardCalculations.map(calc => calc.period))];
    return uniquePeriods.sort();
  }, [rewardCalculations]);

  // Filter calculations based on selections
  const filteredCalculations = useMemo(() => {
    return rewardCalculations.filter(calc => {
      const employeeMatch = selectedEmployee === 'all' || calc.employeeId === selectedEmployee;
      const statusMatch = selectedStatus === 'all' || calc.status === selectedStatus;
      const periodMatch = selectedPeriod === 'all' || calc.period === selectedPeriod;
      return employeeMatch && statusMatch && periodMatch;
    });
  }, [rewardCalculations, selectedEmployee, selectedStatus, selectedPeriod]);

  const handleApprove = (calculationId: string) => {
    // Here you would typically update the calculation status
    console.log('Approving calculation:', calculationId);
  };

  const handleReject = (calculationId: string) => {
    // Here you would typically update the calculation status
    console.log('Rejecting calculation:', calculationId);
  };

  const handleBulkApprove = () => {
    const pendingCalculations = filteredCalculations.filter(calc => calc.status === 'pending');
    pendingCalculations.forEach(calc => handleApprove(calc.id));
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(
        'reward-calculations-report',
        'bao-cao-tinh-toan-thuong.pdf',
        'Báo cáo tính toán thưởng',
        {
          includeHeader: true,
          includeFooter: true,
          includePageNumbers: true,
          orientation: 'portrait'
        }
      );
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Đã duyệt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Từ chối</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tính toán thưởng/phạt</h1>
          <p className="text-muted-foreground">Xem và phê duyệt tính toán thưởng/phạt cho nhân viên</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
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
            <div className="text-2xl font-bold">{filteredCalculations.length}</div>
            <p className="text-xs text-muted-foreground">Tổng số tính toán</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredCalculations.filter(c => c.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Chờ duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredCalculations.filter(c => c.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Đã duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(filteredCalculations.reduce((sum, c) => sum + c.netAmount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Tổng thực nhận</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Nhân viên:</span>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhân viên</SelectItem>
                  {nonAdminEmployees.map(emp => (
                    <SelectItem key={emp.uid} value={emp.uid!}>
                      {emp.name}
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
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
          </div>
        </CardContent>
      </Card>

      {/* Calculations List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tính toán</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="reward-calculations-report" className="space-y-4">
            {filteredCalculations.length === 0 ? (
              <div className="text-center py-8">
                <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Không có tính toán nào</p>
              </div>
            ) : (
              filteredCalculations.map((calculation) => (
                <div key={calculation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{calculation.employeeName}</h4>
                        <p className="text-sm text-muted-foreground">{calculation.position}</p>
                        <p className="text-sm text-muted-foreground">{calculation.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(calculation.status)}
                      {calculation.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(calculation.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(calculation.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(calculation.totalReward)}
                      </div>
                      <p className="text-xs text-muted-foreground">Tổng thưởng</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">
                        {formatCurrency(calculation.totalPenalty)}
                      </div>
                      <p className="text-xs text-muted-foreground">Tổng phạt</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(calculation.netAmount)}
                      </div>
                      <p className="text-xs text-muted-foreground">Thực nhận</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-600">
                        {calculation.period}
                      </div>
                      <p className="text-xs text-muted-foreground">Kỳ</p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-green-600 mb-2">Chi tiết thưởng</h5>
                      {calculation.breakdown.rewards.map((reward, index) => (
                        <div key={index} className="flex justify-between items-center py-1">
                          <span>{reward.description}</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(reward.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h5 className="font-medium text-red-600 mb-2">Chi tiết phạt</h5>
                      {calculation.breakdown.penalties.map((penalty, index) => (
                        <div key={index} className="flex justify-between items-center py-1">
                          <span>{penalty.description}</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(penalty.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
