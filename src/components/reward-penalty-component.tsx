'use client';
import { useState, useContext, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  XCircle
} from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { AuthContext } from '@/context/auth-context';
import { kpiRewardPenaltyService, type KpiRewardPenaltyCalculationResult } from '@/lib/kpi-reward-penalty-service';
import type { KpiRecord, Employee, Kpi } from '@/types';

interface KpiRewardPenalty {
  id: string;
  kpiId: string;
  kpiName: string;
  employeeId: string;
  employeeName: string;
  department: string;
  period: string;
  targetValue: number;
  actualValue: number;
  achievementRate: number;
  rewardAmount: number;
  penaltyAmount: number;
  netAmount: number;
  status: 'pending' | 'calculated' | 'approved' | 'paid';
  calculatedAt: string;
  notes?: string;
}

export default function RewardPenaltyComponent() {
  const { employees, kpiRecords, departments, kpis } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [kpiRewardPenalties, setKpiRewardPenalties] = useState<KpiRewardPenaltyCalculationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<KpiRewardPenaltyCalculationResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRewardPenalty, setNewRewardPenalty] = useState({
    kpiId: '',
    employeeId: '',
    period: '',
    rewardAmount: 0,
    penaltyAmount: 0,
    notes: ''
  });

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Get unique periods from kpiRecords
  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(kpiRecords.map(record => record.period))];
    // Add default periods if no data exists
    if (uniquePeriods.length === 0) {
      return ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4'];
    }
    return uniquePeriods.sort();
  }, [kpiRecords]);

  // Get unique departments
  const departmentList = useMemo(() => {
    return departments.map(dept => ({ id: dept.id, name: dept.name }));
  }, [departments]);

  // Load KPI reward/penalty data
  useEffect(() => {
    loadKpiRewardPenalties();
  }, [selectedPeriod, periods]); // Add periods dependency

  const loadKpiRewardPenalties = async () => {
    setIsLoading(true);
    try {
      // Load existing calculations for the period
      if (selectedPeriod === 'all') {
        // Load all periods
        const allCalculations = [];
        for (const period of periods) {
          if (period) {
            const calculations = await kpiRewardPenaltyService.getKpiRewardPenalties(period);
            allCalculations.push(...calculations);
          }
        }
        setKpiRewardPenalties(allCalculations);
      } else {
        const calculations = await kpiRewardPenaltyService.getKpiRewardPenalties(selectedPeriod);
        setKpiRewardPenalties(calculations);
      }
    } catch (error) {
      console.error('Error loading KPI reward/penalty data:', error);
      toast({
        title: t.common.error,
        description: "Failed to load KPI reward/penalty data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter records based on search and filters
  const filteredRecords = useMemo(() => {
    return kpiRewardPenalties.filter(record => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.kpiName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
      const matchesEmployee = selectedEmployee === 'all' || record.employeeId === selectedEmployee;
      const matchesPeriod = selectedPeriod === 'all' || record.period === selectedPeriod;
      return matchesSearch && matchesDepartment && matchesEmployee && matchesPeriod;
    });
  }, [kpiRewardPenalties, searchTerm, selectedDepartment, selectedEmployee, selectedPeriod]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRecords = kpiRewardPenalties.length;
    const totalRewardAmount = kpiRewardPenalties.reduce((sum, record) => sum + record.rewardAmount, 0);
    const totalPenaltyAmount = kpiRewardPenalties.reduce((sum, record) => sum + record.penaltyAmount, 0);
    const netAmount = totalRewardAmount - totalPenaltyAmount;
    const averageAchievement = totalRecords > 0 ? 
      kpiRewardPenalties.reduce((sum, record) => sum + record.achievementRate, 0) / totalRecords : 0;
    
    const performanceDistribution = kpiRewardPenalties.reduce((acc, record) => {
      if (record.achievementRate >= 100) acc.excellent++;
      else if (record.achievementRate >= 80) acc.good++;
      else if (record.achievementRate >= 60) acc.acceptable++;
      else acc.poor++;
      return acc;
    }, { excellent: 0, good: 0, acceptable: 0, poor: 0 });

    return {
      totalRecords,
      totalRewardAmount,
      totalPenaltyAmount,
      netAmount,
      averageAchievement,
      performanceDistribution
    };
  }, [kpiRewardPenalties]);

  const handleViewRecord = (record: KpiRewardPenaltyCalculationResult) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
  };

  const handleApproveRecord = async () => {
    if (!selectedRecord) return;

    try {
      setIsUploading(true);
      
      await kpiRewardPenaltyService.updateKpiRewardPenaltyStatus(
        selectedRecord.id,
        'approved',
        user?.name || 'Admin'
      );
      
      toast({
        title: t.common.success,
        description: `Đã duyệt thưởng/phạt cho ${selectedRecord.employeeName}`,
      });
      
      // Reload the data to reflect the changes
      await loadKpiRewardPenalties();
      
      // Update selected record locally
      setSelectedRecord({
        ...selectedRecord,
        status: 'approved',
        approvedBy: user?.name || 'Admin',
        approvedAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error approving reward/penalty:', error);
      toast({
        title: t.common.error,
        description: "Không thể duyệt thưởng/phạt",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedRecord) return;

    try {
      setIsUploading(true);
      
      await kpiRewardPenaltyService.updateKpiRewardPenaltyStatus(
        selectedRecord.id,
        'paid'
      );
      
      toast({
        title: t.common.success,
        description: `Đã đánh dấu đã trả cho ${selectedRecord.employeeName}`,
      });
      
      // Reload the data to reflect the changes
      await loadKpiRewardPenalties();
      
      // Update selected record locally
      setSelectedRecord({
        ...selectedRecord,
        status: 'paid',
        paidAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast({
        title: t.common.error,
        description: "Không thể đánh dấu đã trả",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproveRecordFromTable = async (record: KpiRewardPenaltyCalculationResult) => {
    setSelectedRecord(record);
    await handleApproveRecord();
  };

  const handleMarkAsPaidFromTable = async (record: KpiRewardPenaltyCalculationResult) => {
    setSelectedRecord(record);
    await handleMarkAsPaid();
  };

  const handleCalculateAll = async () => {
    setIsCalculating(true);
    try {
      // Clean up existing duplicates first
      await kpiRewardPenaltyService.removeDuplicateCalculations();
      
      // Get approved KPI records for the period
      const approvedRecords = kpiRecords.filter(record => {
        if (selectedPeriod === 'all') {
          return record.status === 'approved';
        }
        return record.period === selectedPeriod && record.status === 'approved';
      });
      
      if (approvedRecords.length === 0) {
        toast({
          title: t.common.warning,
          description: "No approved KPI records found for calculation",
          variant: "destructive",
        });
        return;
      }
      
      // Calculate reward/penalty for all records
      const calculations = await kpiRewardPenaltyService.calculateBulkKpiRewardPenalties(
        approvedRecords,
        kpis,
        employees
      );
      
      // Reload the data
      await loadKpiRewardPenalties();
      
      toast({
        title: t.common.success,
        description: `KPI reward/penalty calculations completed for ${calculations.length} records`,
      });
    } catch (error) {
      console.error('Error calculating rewards/penalties:', error);
      toast({
        title: t.common.error,
        description: "Failed to calculate rewards/penalties",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCreateRewardPenalty = async () => {
    try {
      setIsUploading(true);
      
      // Find related KPI record for validation
      const kpiRecord = kpiRecords.find(record => 
        record.kpiId === newRewardPenalty.kpiId && 
        record.employeeId === newRewardPenalty.employeeId &&
        record.period === newRewardPenalty.period
      );

      const employee = employees.find(emp => emp.uid === newRewardPenalty.employeeId);
      const kpi = kpis.find(k => k.id === newRewardPenalty.kpiId);

      if (!employee || !kpi) {
        toast({
          title: t.common.error,
          description: "Employee or KPI not found",
          variant: "destructive",
        });
        return;
      }

      // Calculate net amount
      const netAmount = newRewardPenalty.rewardAmount - newRewardPenalty.penaltyAmount;

      // Create reward/penalty calculation result
      const calculationResult: Omit<KpiRewardPenaltyCalculationResult, 'id'> = {
        kpiRecordId: kpiRecord?.id || '',
        employeeId: newRewardPenalty.employeeId,
        employeeName: employee.name,
        department: employee.departmentId || '',
        kpiId: newRewardPenalty.kpiId,
        kpiName: kpi.name,
        period: newRewardPenalty.period,
        targetValue: kpiRecord?.target || 0,
        actualValue: kpiRecord?.actual || 0,
        achievementRate: kpiRecord?.target > 0 ? (kpiRecord.actual / kpiRecord.target) * 100 : 0,
        rewardAmount: newRewardPenalty.rewardAmount,
        penaltyAmount: newRewardPenalty.penaltyAmount,
        netAmount,
        status: 'calculated',
        calculatedAt: new Date().toISOString(),
        calculatedBy: user?.name || 'Admin',
        notes: newRewardPenalty.notes
      };

      console.log('Creating manual reward/penalty record=', calculationResult);
      
      toast({
        title: t.common.success,
        description: "Reward/penalty record created successfully",
      });
      
      setIsCreateDialogOpen(false);
      setNewRewardPenalty({
        kpiId: '',
        employeeId: '',
        period: '',
        rewardAmount: 0,
        penaltyAmount: 0,
        notes: ''
      });

      // Reload data to show new record
      await loadKpiRewardPenalties();
      
    } catch (error) {
      console.error('Error creating reward/penalty record:', error);
      toast({
        title: t.common.error,
        description: "Failed to create reward/penalty record",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const csvContent = await kpiRewardPenaltyService.exportKpiRewardPenalties(selectedPeriod);
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kpi-reward-penalty-${selectedPeriod}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: t.common.success,
        description: "Data exported successfully",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: t.common.error,
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getAchievementColor = (rate: number) => {
    if (rate >= 100) return 'bg-green-100 text-green-800';
    if (rate >= 80) return 'bg-blue-100 text-blue-800';
    if (rate >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'calculated': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Đã duyệt';
      case 'paid': return 'Đã trả';
      case 'calculated': return 'Đã tính';
      case 'pending': return 'Chờ duyệt';
      default: return status;
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.nav.rewardPenalty}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t.evaluation.rewardsAndPenalties}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleExportData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t.common.download}
          </Button>
          <Button 
            onClick={handleCalculateAll}
            disabled={isCalculating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? t.common.updating : t.evaluation.autoCalculate}
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t.common.add}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.evaluation.totalKpis}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">{t.evaluation.calculatedKpis}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.evaluation.totalRewards}</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRewardAmount)}
            </div>
            <p className="text-xs text-muted-foreground">{t.evaluation.totalRewardAmount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.evaluation.totalPenalties}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalPenaltyAmount)}
            </div>
            <p className="text-xs text-muted-foreground">{t.evaluation.totalPenaltyAmount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.evaluation.netBalance}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.netAmount)}
            </div>
            <p className="text-xs text-muted-foreground">{t.evaluation.rewardsMinusPenalties}</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">{t.evaluation.excellent}</p>
                <p className="text-2xl font-bold">{stats.performanceDistribution.excellent}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground">≥100%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">{t.evaluation.good}</p>
                <p className="text-2xl font-bold">{stats.performanceDistribution.good}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground">80-99%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">{t.evaluation.acceptable}</p>
                <p className="text-2xl font-bold">{stats.performanceDistribution.acceptable}</p>
              </div>
              <Target className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground">60-79%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">{t.evaluation.poor}</p>
                <p className="text-2xl font-bold">{stats.performanceDistribution.poor}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground">&lt;60%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.admin.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.admin.selectDepartment} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.admin.allDepartments}</SelectItem>
                {departmentList.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.admin.selectEmployee} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.admin.allEmployees}</SelectItem>
                {nonAdminEmployees.map(emp => (
                  <SelectItem key={emp.uid} value={emp.uid || ''}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.admin.selectPeriod} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.admin.allPeriods || 'Tất cả kỳ'}</SelectItem>
                {periods.map((period, index) => (
                  <SelectItem key={period || `period-${index}`} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.evaluation.rewardPenaltyResults} ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>{t.common.loading}</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.evaluation.noData}</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedDepartment !== 'all' || selectedEmployee !== 'all'
                  ? t.evaluation.noDataMatchFilter
                  : t.evaluation.noDataForPeriod}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.employee}</TableHead>
                  <TableHead>{t.admin.department}</TableHead>
                  <TableHead>KPI</TableHead>
                  <TableHead>{t.admin.period}</TableHead>
                  <TableHead>{t.evaluation.target}</TableHead>
                  <TableHead>{t.evaluation.actual}</TableHead>
                  <TableHead>{t.evaluation.achievementRate}</TableHead>
                  <TableHead>{t.evaluation.reward}</TableHead>
                  <TableHead>{t.evaluation.penalty}</TableHead>
                  <TableHead>{t.evaluation.netBalance}</TableHead>
                  <TableHead>{t.admin.status}</TableHead>
                  <TableHead>{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const employee = employees.find(emp => emp.uid === record.employeeId || emp.id === record.employeeId || emp.documentId === record.employeeId);
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={employee?.avatar} />
                            <AvatarFallback>
                              {record.employeeName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{record.employeeName}</p>
                            <p className="text-sm text-muted-foreground">{employee?.position}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{record.kpiName}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{record.period}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{record.targetValue}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{record.actualValue}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAchievementColor(record.achievementRate)}>
                          {record.achievementRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          {formatCurrency(record.rewardAmount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-red-600">
                          {formatCurrency(record.penaltyAmount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${record.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(record.netAmount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {getStatusText(record.status)}
                        </Badge> 
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRecord(record)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {record.status === 'calculated' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveRecordFromTable(record)}
                              disabled={isUploading}
                              className="text-green-600 hover:text-green-700"
                            >
                              {t.admin.approve}
                            </Button>
                          )}
                          {record.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsPaidFromTable(record)}
                              disabled={isUploading}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {t.evaluation.markAsPaid}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Record Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              {t.evaluation.rewardPenaltyDetails} - {selectedRecord?.employeeName}
            </DialogTitle>
            <DialogDescription>
              {t.evaluation.rewardPenaltyInfo}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={employees.find(emp => emp.uid === selectedRecord.employeeId)?.avatar} />
                  <AvatarFallback className="text-lg">
                    {selectedRecord.employeeName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedRecord.employeeName}</h3>
                  <p className="text-muted-foreground">
                    {employees.find(emp => emp.uid === selectedRecord.employeeId)?.position}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedRecord.department}</Badge>
                    <Badge variant="secondary">{selectedRecord.period}</Badge>
                  </div>
                </div>
              </div>

              {/* KPI Performance */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t.evaluation.kpiPerformance}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedRecord.targetValue}</p>
                    <p className="text-sm text-muted-foreground">{t.evaluation.target}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedRecord.actualValue}</p>
                    <p className="text-sm text-muted-foreground">{t.evaluation.actual}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedRecord.achievementRate.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">{t.evaluation.achievementRate}</p>
                  </div>
                </div>
              </div>

              {/* Reward/Penalty Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t.evaluation.rewardPenaltyAnalysis}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>KPI: {selectedRecord.kpiName}</span>
                    <Badge className={getAchievementColor(selectedRecord.achievementRate)}>
                      {selectedRecord.achievementRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>{t.evaluation.reward}</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(selectedRecord.rewardAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>{t.evaluation.penalty}</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(selectedRecord.penaltyAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg bg-green-50">
                    <span className="font-semibold">{t.evaluation.netBalance}</span>
                    <span className={`font-bold text-lg ${selectedRecord.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(selectedRecord.netAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedRecord.notes && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{t.common.notes}</h3>
                  <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}

              {/* Status and Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t.admin.status}:</span>
                  <Badge className={getStatusColor(selectedRecord.status)}>
                    {getStatusText(selectedRecord.status)}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleApproveRecord}
                    disabled={isUploading || selectedRecord.status === 'approved' || selectedRecord.status === 'paid'}
                  >
                    {isUploading && selectedRecord.status === 'calculated' ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                    ) : null}
                    {t.admin.approve}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleMarkAsPaid}
                    disabled={isUploading || selectedRecord.status !== 'approved' || selectedRecord.status === 'paid'}
                  >
                    {isUploading && selectedRecord.status === 'approved' ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                    ) : null}
                    {t.evaluation.markAsPaid}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Reward/Penalty Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {t.evaluation.addRewardPenalty}
            </DialogTitle>
            <DialogDescription>
              {t.evaluation.addRewardPenaltyDescription}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kpi-select">KPI</Label>
                <Select value={newRewardPenalty.kpiId} onValueChange={(value) => setNewRewardPenalty(prev => ({ ...prev, kpiId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.admin.selectKpi} />
                  </SelectTrigger>
                  <SelectContent>
                    {kpis.map(kpi => (
                      <SelectItem key={kpi.id} value={kpi.id}>
                        {kpi.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="employee-select">{t.admin.employee}</Label>
                <Select value={newRewardPenalty.employeeId} onValueChange={(value) => setNewRewardPenalty(prev => ({ ...prev, employeeId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.admin.selectEmployee} />
                  </SelectTrigger>
                  <SelectContent>
                    {nonAdminEmployees.map(emp => (
                      <SelectItem key={emp.uid} value={emp.uid || ''}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="period-select">{t.admin.period}</Label>
              <Select value={newRewardPenalty.period} onValueChange={(value) => setNewRewardPenalty(prev => ({ ...prev, period: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t.admin.selectPeriod} />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period, index) => (
                    <SelectItem key={period || `period-${index}`} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reward-amount">{t.evaluation.rewardAmount} (VND)</Label>
                <Input
                  id="reward-amount"
                  type="number"
                  value={newRewardPenalty.rewardAmount}
                  onChange={(e) => setNewRewardPenalty(prev => ({ ...prev, rewardAmount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="penalty-amount">{t.evaluation.penaltyAmount} (VND)</Label>
                <Input
                  id="penalty-amount"
                  type="number"
                  value={newRewardPenalty.penaltyAmount}
                  onChange={(e) => setNewRewardPenalty(prev => ({ ...prev, penaltyAmount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">{t.common.notes}</Label>
              <Textarea
                id="notes"
                value={newRewardPenalty.notes}
                onChange={(e) => setNewRewardPenalty(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t.common.enterNotes}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => setIsCreateDialogOpen(false)}
                variant="outline"
                className="flex-1"
              >
                {t.common.cancel}
              </Button>
              <Button
                onClick={handleCreateRewardPenalty}
                className="flex-1"
                disabled={!newRewardPenalty.kpiId || !newRewardPenalty.employeeId || !newRewardPenalty.period || isUploading}
              >
                {isUploading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isUploading ? t.common.updating : t.common.create}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
