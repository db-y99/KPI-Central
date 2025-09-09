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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import RewardCalculationDisplay from '@/components/reward-calculation-display';
import type { RewardCalculation, Employee } from '@/types';
import { DataContext } from '@/context/data-context';
import { AuthContext } from '@/context/auth-context';
import PDFExportButton from '@/components/pdf-export-button';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RewardCalculationsPage() {
  const { 
    rewardCalculations, 
    employees, 
    calculateRewards,
    loading 
  } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFrequency, setSelectedFrequency] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<RewardCalculation | null>(null);

  // Calculate period for new calculations
  const getCurrentPeriod = (frequency: 'monthly' | 'quarterly' | 'annually') => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    switch (frequency) {
      case 'monthly':
        return `${year}-${String(month).padStart(2, '0')}`;
      case 'quarterly':
        const quarter = Math.ceil(month / 3);
        return `${year}-Q${quarter}`;
      case 'annually':
        return String(year);
      default:
        return `${year}-${String(month).padStart(2, '0')}`;
    }
  };

  const periods = [...new Set(rewardCalculations.map(r => r.period))].sort().reverse();
  const frequencies = ['monthly', 'quarterly', 'annually'] as const;

  const filteredCalculations = useMemo(() => {
    return rewardCalculations.filter(calculation => {
      const employee = employees.find(e => e.uid === calculation.employeeId);
      const matchesEmployee = selectedEmployee === 'all' || calculation.employeeId === selectedEmployee;
      const matchesPeriod = selectedPeriod === 'all' || calculation.period === selectedPeriod;
      const matchesStatus = selectedStatus === 'all' || calculation.status === selectedStatus;
      const matchesFrequency = selectedFrequency === 'all' || calculation.frequency === selectedFrequency;
      const matchesSearch = !searchTerm || 
        employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee?.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calculation.period.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesEmployee && matchesPeriod && matchesStatus && matchesFrequency && matchesSearch;
    });
  }, [rewardCalculations, employees, selectedEmployee, selectedPeriod, selectedStatus, selectedFrequency, searchTerm]);

  const handleCalculateRewards = async (
    employeeId: string, 
    frequency: 'monthly' | 'quarterly' | 'annually',
    period?: string
  ) => {
    setCalculating(true);
    try {
      const calculationPeriod = period || getCurrentPeriod(frequency);
      const calculation = await calculateRewards(employeeId, calculationPeriod, frequency);
      
      toast({
        title: 'Thành công!',
        description: `Đã tính toán thưởng cho kỳ ${calculationPeriod}.`,
      });
      
      // Show the calculation result
      setSelectedCalculation(calculation);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tính toán thưởng.',
        variant: 'destructive'
      });
    } finally {
      setCalculating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'calculated':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'calculated':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSummaryStats = () => {
    const totalRewards = filteredCalculations.reduce((sum, calc) => sum + calc.totalReward, 0);
    const approvedRewards = filteredCalculations
      .filter(calc => calc.status === 'approved')
      .reduce((sum, calc) => sum + calc.totalReward, 0);
    const pendingCount = filteredCalculations.filter(calc => calc.status === 'calculated').length;
    const approvedCount = filteredCalculations.filter(calc => calc.status === 'approved').length;
    
    return {
      totalRewards,
      approvedRewards,
      pendingCount,
      approvedCount,
      totalCount: filteredCalculations.length
    };
  };

  const stats = getSummaryStats();

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tính toán thưởng</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi tính toán thưởng/phạt cho nhân viên
          </p>
        </div>
        <div className="flex gap-2">
          <PDFExportButton
            elementId="reward-calculations-content"
            filename={`tinh-toan-thuong-${new Date().toISOString().split('T')[0]}.pdf`}
            title="Tính toán thưởng"
            variant="outline"
            size="sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Xuất PDF
          </PDFExportButton>
        </div>
      </div>
      
      <div id="reward-calculations-content">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Tổng tính toán</p>
                <p className="text-2xl font-bold">{stats.totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Chờ phê duyệt</p>
                <p className="text-2xl font-bold">{stats.pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Đã phê duyệt</p>
                <p className="text-2xl font-bold">{stats.approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Thưởng đã duyệt</p>
                <p className="text-lg font-bold">{formatCurrency(stats.approvedRewards)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-blue-500" />
                <span>Tính toán Khen thưởng</span>
              </CardTitle>
              <CardDescription>
                Tính toán và quản lý khen thưởng cho nhân viên theo từng kỳ
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-black hover:bg-gray-800 text-white border-0">
                    <Calculator className="mr-2 h-4 w-4" />
                    Tính toán mới
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tính toán Khen thưởng</DialogTitle>
                  </DialogHeader>
                  <NewCalculationForm onCalculate={handleCalculateRewards} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <Label>Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm nhân viên, kỳ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label>Nhân viên</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhân viên</SelectItem>
                  {employees.map(employee => (
                    <SelectItem key={employee.uid} value={employee.uid!}>
                      {employee.name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kỳ</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kỳ..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả kỳ</SelectItem>
                  {periods.map(period => (
                    <SelectItem key={period} value={period}>{period}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tần suất</Label>
              <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Tần suất..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="monthly">Hàng tháng</SelectItem>
                  <SelectItem value="quarterly">Hàng quý</SelectItem>
                  <SelectItem value="annually">Hàng năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="calculated">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredCalculations.length === 0 ? (
            <div className="text-center py-12">
              <Calculator className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có tính toán khen thưởng
              </h3>
              <p className="text-gray-500 mb-4">
                {rewardCalculations.length === 0 
                  ? 'Chưa có tính toán khen thưởng nào. Hãy tạo chương trình thưởng và nhập dữ liệu metric trước khi tính toán.'
                  : 'Không có tính toán nào khớp với bộ lọc hiện tại.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Kỳ</TableHead>
                  <TableHead>Tần suất</TableHead>
                  <TableHead>Tổng thưởng</TableHead>
                  <TableHead>Phạt</TableHead>
                  <TableHead>Thực nhận</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tính toán</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalculations.map(calculation => {
                  const employee = employees.find(e => e.uid === calculation.employeeId);
                  return (
                    <TableRow key={calculation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee?.name}</div>
                          <div className="text-sm text-gray-500">{employee?.position}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{calculation.period}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {calculation.frequency === 'monthly' ? 'Hàng tháng' :
                           calculation.frequency === 'quarterly' ? 'Hàng quý' : 'Hàng năm'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">
                          {formatCurrency(calculation.totalReward)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {calculation.breakdown.filter(b => b.rewardAmount > 0).length} tiêu chí đạt
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-red-600">
                          {formatCurrency(calculation.totalPenalty || 0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(calculation.penalties || []).filter(p => p.penaltyAmount > 0).length} vi phạm
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-blue-600">
                          {formatCurrency(calculation.netAmount || calculation.totalReward)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(calculation.totalPenalty || 0) > 0 ? 
                            `Sau trừ phạt ${formatCurrency(calculation.totalPenalty || 0)}` : 
                            'Không có phạt'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(calculation.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(calculation.status)}
                            <span className="capitalize">{calculation.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(calculation.calculatedAt).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(calculation.calculatedAt).toLocaleTimeString('vi-VN')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCalculation(calculation)}
                        >
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Calculation Detail Dialog */}
      <Dialog open={!!selectedCalculation} onOpenChange={() => setSelectedCalculation(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết tính toán khen thưởng</DialogTitle>
          </DialogHeader>
          {selectedCalculation && (
            <RewardCalculationDisplay 
              calculation={selectedCalculation} 
              showActions={user?.role === 'admin'}
            />
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

function NewCalculationForm({ 
  onCalculate 
}: { 
  onCalculate: (employeeId: string, frequency: 'monthly' | 'quarterly' | 'annually', period?: string) => Promise<void> 
}) {
  const { employees } = useContext(DataContext);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');
  const [period, setPeriod] = useState('');
  const [calculating, setCalculating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setCalculating(true);
    try {
      await onCalculate(selectedEmployee, frequency, period || undefined);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nhân viên *</Label>
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee} required>
          <SelectTrigger>
            <SelectValue placeholder="Chọn nhân viên..." />
          </SelectTrigger>
          <SelectContent>
            {employees.map(employee => (
              <SelectItem key={employee.uid} value={employee.uid!}>
                {employee.name} - {employee.position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tần suất *</Label>
        <Select value={frequency} onValueChange={(value: any) => setFrequency(value)} required>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Hàng tháng</SelectItem>
            <SelectItem value="quarterly">Hàng quý</SelectItem>
            <SelectItem value="annually">Hàng năm</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Kỳ (tùy chọn)</Label>
        <Input
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          placeholder={
            frequency === 'monthly' ? 'YYYY-MM (ví dụ: 2024-12)' :
            frequency === 'quarterly' ? 'YYYY-Q1 (ví dụ: 2024-Q4)' :
            'YYYY (ví dụ: 2024)'
          }
        />
        <p className="text-xs text-gray-500 mt-1">
          Để trống để sử dụng kỳ hiện tại
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={calculating || !selectedEmployee}
      >
        {calculating ? 'Đang tính toán...' : 'Tính toán thưởng'}
      </Button>
    </form>
  );
}
