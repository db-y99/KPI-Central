'use client';
import { useState, useContext, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  StandardTable,
  StandardTableBody,
  StandardTableCell,
  StandardTableHead,
  StandardTableHeader,
  StandardTableRow,
  TableEmptyState,
} from '@/components/ui/standard-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Award, 
  Search, 
  TrendingUp, 
  Users,
  Target,
  Calendar,
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  DollarSign,
  BarChart3,
  RefreshCw,
  Download,
  Calculator,
  Gift,
  TrendingDown
} from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import { rewardCalculationService, type RewardCalculation } from '@/lib/reward-calculation-service';

interface RewardPenaltyRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  kpiId: string;
  kpiName: string;
  period: string;
  targetValue: number;
  actualValue: number;
  achievementRate: number;
  rewardAmount: number;
  penaltyAmount: number;
  netAmount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
  updatedAt: string;
}

interface RewardStats {
  totalRecords: number;
  totalRewardAmount: number;
  totalPenaltyAmount: number;
  netAmount: number;
  performanceDistribution: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
  };
}

export default function RewardPenaltyComponent() {
  const { employees, kpis, kpiRecords, departments } = useContext(DataContext);
  const { t } = useLanguage();
  const [isCalculating, setIsCalculating] = useState(false);
  const [records, setRecords] = useState<RewardPenaltyRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<RewardPenaltyRecord | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [stats, setStats] = useState<RewardStats>({
    totalRecords: 0,
    totalRewardAmount: 0,
    totalPenaltyAmount: 0,
    netAmount: 0,
    performanceDistribution: {
      excellent: 0,
      good: 0,
      acceptable: 0,
      poor: 0
    }
  });

  // Load initial data - DISABLED AUTO CALCULATION
  useEffect(() => {
    // loadRewardPenaltyData(); // Disabled automatic reward calculation
    setRecords([]); // Initialize with empty records
  }, [kpiRecords]);

  const loadRewardPenaltyData = async () => {
    try {
      // DISABLED: Automatic reward calculation
      // Get all non-admin employees for bulk calculation
      // const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');
      // const employeeIds = nonAdminEmployees.map(emp => emp.id);
      
      // DISABLED: Calculate rewards for all employees
      // const calculations = await rewardCalculationService.calculateBulkRewards(employeeIds, 'Q1-2024');
      
      // DISABLED: Convert RewardCalculation to RewardPenaltyRecord format
      // const formattedRecords: RewardPenaltyRecord[] = calculations.map(calc => {
      //   const employee = nonAdminEmployees.find(emp => emp.id === calc.employeeId);
      //   const department = departments.find(dept => dept.id === employee?.departmentId);
        
      //   // For now, we'll use the first KPI record for this employee to get KPI details
      //   const employeeKpiRecords = kpiRecords.filter(record => record.employeeId === calc.employeeId);
      //   const firstKpiRecord = employeeKpiRecords[0];
      //   const kpi = kpis.find(k => k.id === firstKpiRecord?.kpiId);
        
      //   // Calculate achievement rate from total score
      //   const achievementRate = Math.min(100, (calc.totalScore / 100) * 100);

      // return {
      //     id: calc.id,
      //     employeeId: calc.employeeId,
      //     employeeName: calc.employeeName,
      //     department: calc.department,
      //     kpiId: firstKpiRecord?.kpiId || 'unknown',
      //     kpiName: kpi?.name || 'KPI Performance',
      //     period: calc.period,
      //     targetValue: firstKpiRecord?.target || 100,
      //     actualValue: firstKpiRecord?.actual || Math.round(achievementRate),
      //     achievementRate: achievementRate,
      //     rewardAmount: calc.performanceReward,
      //     penaltyAmount: calc.penalty,
      //     netAmount: calc.performanceReward - calc.penalty,
      //     status: calc.status,
      //     createdAt: calc.createdAt,
      //     updatedAt: calc.updatedAt
      //   };
      // });

      // DISABLED: setRecords(formattedRecords);
      // calculateStats(formattedRecords); // Disabled since formattedRecords is not created
      calculateStats([]); // Calculate stats with empty array
    } catch (error) {
      console.error('Error loading reward penalty data:', error);
      // Fallback to mock data if service fails
      loadMockData();
    }
  };

  const loadMockData = () => {
    // Lọc bỏ admin user khỏi danh sách employees
    const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');
    
    const mockRecords: RewardPenaltyRecord[] = nonAdminEmployees.slice(0, 5).map((employee, index) => {
      const department = departments.find(dept => dept.id === employee.departmentId);
      const achievementRate = 60 + (index * 8); // 60%, 68%, 76%, 84%, 92%
      const targetValue = 100;
      const actualValue = Math.round((achievementRate / 100) * targetValue);
      const rewardAmount = achievementRate >= 80 ? 1000000 : achievementRate >= 60 ? 800000 : 500000;
      const penaltyAmount = achievementRate < 60 ? 200000 : 0;
      
      return {
        id: `mock-${employee.id}`,
        employeeId: employee.id,
        employeeName: employee.name,
        department: department?.name || 'Unknown Department',
        kpiId: 'kpi-1',
        kpiName: 'Sales Target',
        period: 'Q1-2024',
        targetValue,
        actualValue,
        achievementRate,
        rewardAmount,
        penaltyAmount,
        netAmount: rewardAmount - penaltyAmount,
        status: index % 3 === 0 ? 'pending' : index % 3 === 1 ? 'approved' : 'paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
    
    setRecords(mockRecords);
    calculateStats(mockRecords);
  };

  const calculateStats = (records: RewardPenaltyRecord[]) => {
    const totalRewardAmount = records.reduce((sum, record) => sum + record.rewardAmount, 0);
    const totalPenaltyAmount = records.reduce((sum, record) => sum + record.penaltyAmount, 0);
    const netAmount = totalRewardAmount - totalPenaltyAmount;

    const performanceDistribution = {
      excellent: records.filter(r => r.achievementRate >= 100).length,
      good: records.filter(r => r.achievementRate >= 80 && r.achievementRate < 100).length,
      acceptable: records.filter(r => r.achievementRate >= 60 && r.achievementRate < 80).length,
      poor: records.filter(r => r.achievementRate < 60).length
    };

    setStats({
      totalRecords: records.length,
      totalRewardAmount,
      totalPenaltyAmount,
      netAmount,
      performanceDistribution
    });
  };

  const handleRecalculate = async () => {
    setIsCalculating(true);
    try {
      await loadRewardPenaltyData();
    } catch (error) {
      console.error('Error recalculating rewards:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleMarkAsPaid = async (recordId: string) => {
    setRecords(prev => prev.map(record => 
      record.id === recordId 
        ? { ...record, status: 'paid' as const, updatedAt: new Date().toISOString() }
        : record
    ));
    
    // Recalculate stats after status change
    const updatedRecords = records.map(record => 
      record.id === recordId 
        ? { ...record, status: 'paid' as const, updatedAt: new Date().toISOString() }
        : record
    );
    calculateStats(updatedRecords);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.kpiName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
      const matchesEmployee = selectedEmployee === 'all' || record.employeeName === selectedEmployee;
      
      return matchesSearch && matchesDepartment && matchesEmployee;
    });
  }, [records, searchTerm, selectedDepartment, selectedEmployee]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Chờ duyệt' },
      approved: { variant: 'default' as const, text: 'Đã duyệt' },
      paid: { variant: 'default' as const, text: 'Đã trả' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 100) return <Badge className="bg-green-100 text-green-800">{t.rewardPenalty.excellent}</Badge>;
    if (rate >= 80) return <Badge className="bg-blue-100 text-blue-800">{t.rewardPenalty.good}</Badge>;
    if (rate >= 60) return <Badge className="bg-yellow-100 text-yellow-800">{t.rewardPenalty.average}</Badge>;
    return <Badge className="bg-red-100 text-red-800">{t.rewardPenalty.poor}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.rewardPenalty.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t.rewardPenalty.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.rewardPenalty.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {/* Filters */}
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t.rewardPenalty.allDepartments} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.rewardPenalty.allDepartments}</SelectItem>
              {departments.map((dept, index) => (
                <SelectItem key={dept.id || `dept-${index}`} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t.rewardPenalty.allEmployees} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.rewardPenalty.allEmployees}</SelectItem>
              {employees.map((emp, index) => (
                <SelectItem key={emp.id || `emp-${index}`} value={emp.name}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button 
              onClick={handleRecalculate}
              disabled={isCalculating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
              {isCalculating ? t.common.updating : t.rewardPenalty.recalculateAll}
            </Button>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
{t.rewardPenalty.addRewardPenalty}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.rewardPenalty.totalKpi}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">{t.rewardPenalty.calculatedKpi}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.rewardPenalty.totalRewards}</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRewardAmount)}
            </div>
            <p className="text-xs text-muted-foreground">{t.rewardPenalty.rewardAmount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.rewardPenalty.totalPenalties}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalPenaltyAmount)}
            </div>
            <p className="text-xs text-muted-foreground">{t.rewardPenalty.penaltyAmount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.rewardPenalty.netAmount}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.netAmount)}
            </div>
            <p className="text-xs text-muted-foreground">{t.rewardPenalty.netAmount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t.rewardPenalty.performanceDistribution}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.performanceDistribution.excellent}</div>
              <p className="text-sm font-medium text-green-700">{t.rewardPenalty.excellent}</p>
              <p className="text-xs text-muted-foreground">≥ 100%</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.performanceDistribution.good}</div>
              <p className="text-sm font-medium text-blue-700">{t.rewardPenalty.good}</p>
              <p className="text-xs text-muted-foreground">80-99%</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.performanceDistribution.acceptable}</div>
              <p className="text-sm font-medium text-yellow-700">{t.rewardPenalty.average}</p>
              <p className="text-xs text-muted-foreground">60-79%</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.performanceDistribution.poor}</div>
              <p className="text-sm font-medium text-red-700">{t.rewardPenalty.poor}</p>
              <p className="text-xs text-muted-foreground">&lt; 60%</p>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.rewardPenalty.rewardPenaltyDetails} ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <StandardTable>
            <StandardTableHeader>
              <StandardTableRow>
                <StandardTableHead>{t.rewardPenalty.employee}</StandardTableHead>
                <StandardTableHead>{t.rewardPenalty.kpi}</StandardTableHead>
                <StandardTableHead>{t.rewardPenalty.period}</StandardTableHead>
                <StandardTableHead align="right">{t.rewardPenalty.target}</StandardTableHead>
                <StandardTableHead align="right">{t.rewardPenalty.actual}</StandardTableHead>
                <StandardTableHead align="right">{t.rewardPenalty.achievementRate}</StandardTableHead>
                <StandardTableHead align="right">{t.rewardPenalty.rewardAmount}</StandardTableHead>
                <StandardTableHead align="right">{t.rewardPenalty.penaltyAmount}</StandardTableHead>
                <StandardTableHead align="right">{t.rewardPenalty.netAmount}</StandardTableHead>
                <StandardTableHead>{t.rewardPenalty.status}</StandardTableHead>
                <StandardTableHead>{t.common.actions}</StandardTableHead>
              </StandardTableRow>
            </StandardTableHeader>
            <StandardTableBody>
              {filteredRecords.length === 0 ? (
                <TableEmptyState
                  icon={<Award className="w-12 h-12 text-muted-foreground" />}
                  title={t.rewardPenalty.noData}
                  description={searchTerm || selectedDepartment !== 'all' || selectedEmployee !== 'all'
                    ? t.rewardPenalty.noDataMatching
                    : ''}
                  colSpan={11}
                />
              ) : (
                filteredRecords.map((record) => (
                    <StandardTableRow key={record.id}>
                      <StandardTableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={`/api/placeholder/32/32`} />
                            <AvatarFallback>
                              {record.employeeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{record.employeeName}</div>
                            <div className="text-sm text-muted-foreground">{record.department}</div>
                          </div>
                        </div>
                      </StandardTableCell>
                      <StandardTableCell className="font-medium">{record.kpiName}</StandardTableCell>
                      <StandardTableCell>{record.period}</StandardTableCell>
                      <StandardTableCell className="text-right">{record.targetValue}</StandardTableCell>
                      <StandardTableCell className="text-right">{record.actualValue}</StandardTableCell>
                      <StandardTableCell className="text-right">
                        <div className="flex items-center gap-2">
                          {record.achievementRate.toFixed(1)}%
                          {getPerformanceBadge(record.achievementRate)}
                        </div>
                      </StandardTableCell>
                      <StandardTableCell className="text-green-600 font-medium text-right">
                          {formatCurrency(record.rewardAmount)}
                      </StandardTableCell>
                      <StandardTableCell className="text-red-600 font-medium text-right">
                          {formatCurrency(record.penaltyAmount)}
                      </StandardTableCell>
                      <StandardTableCell className={`font-bold text-right ${record.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(record.netAmount)}
                      </StandardTableCell>
                      <StandardTableCell>{getStatusBadge(record.status)}</StandardTableCell>
                      <StandardTableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {record.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsPaid(record.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Đánh dấu đã trả
                            </Button>
                          )}
                        </div>
                      </StandardTableCell>
                    </StandardTableRow>
                  ))
              )}
            </StandardTableBody>
          </StandardTable>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Chi tiết Thưởng & Phạt - {selectedRecord?.employeeName}
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về thưởng và phạt KPI
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={`/api/placeholder/48/48`} />
                  <AvatarFallback>
                    {selectedRecord.employeeName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedRecord.employeeName}</h3>
                  <p className="text-muted-foreground">{selectedRecord.department}</p>
                </div>
              </div>

              {/* KPI Performance */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Hiệu suất KPI</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedRecord.targetValue}</p>
                    <p className="text-sm text-muted-foreground">Mục tiêu</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedRecord.actualValue}</p>
                    <p className="text-sm text-muted-foreground">Thực tế</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedRecord.achievementRate.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Tỷ lệ đạt</p>
                  </div>
                </div>
              </div>

              {/* Reward/Penalty Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Phân tích Thưởng & Phạt</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Tỷ lệ đạt KPI</span>
                    <span className="font-medium">{selectedRecord.achievementRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Thưởng</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(selectedRecord.rewardAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Phạt</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(selectedRecord.penaltyAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg bg-green-50">
                    <span className="font-semibold">Số dư ròng</span>
                    <span className={`font-bold text-lg ${selectedRecord.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(selectedRecord.netAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Đóng
                  </Button>
                {selectedRecord.status === 'approved' && (
                  <Button 
                    onClick={() => {
                      handleMarkAsPaid(selectedRecord.id);
                      setIsDetailDialogOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Đánh dấu đã trả
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Reward/Penalty Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Thêm Thưởng/Phạt KPI
            </DialogTitle>
            <DialogDescription>
              Thêm thưởng hoặc phạt cho KPI cụ thể
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
              <div>
              <Label htmlFor="employee">Nhân viên *</Label>
              <Select>
                  <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                  {employees.map((emp, index) => (
                    <SelectItem key={emp.id || `emp-${index}`} value={emp.id}>
                      {emp.name}
                      </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
              <Label htmlFor="kpi">KPI *</Label>
              <Select>
                  <SelectTrigger>
                  <SelectValue placeholder="Chọn KPI" />
                  </SelectTrigger>
                  <SelectContent>
                  {kpis.map((kpi, index) => (
                    <SelectItem key={kpi.id || `kpi-${index}`} value={kpi.id}>
                      {kpi.name}
                      </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
            </div>

            <div>
              <Label htmlFor="period">Kỳ *</Label>
              <Input id="period" placeholder="VD: Q1-2024" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reward-amount">Số tiền thưởng (VND)</Label>
                <Input
                  id="reward-amount"
                  type="number"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="penalty-amount">Số tiền phạt (VND)</Label>
                <Input
                  id="penalty-amount"
                  type="number"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Thêm ghi chú (tùy chọn)"
                rows={3}
              />
            </div>
            </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
              </Button>
            <Button onClick={() => setIsAddDialogOpen(false)}>
              Thêm
              </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
