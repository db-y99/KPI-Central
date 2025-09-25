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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calculator, 
  Search, 
  TrendingUp, 
  Users,
  Target,
  Calendar,
  Award,
  CheckCircle2,
  Download,
  RefreshCw,
  Eye,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { rewardCalculationService, type RewardCalculation } from '@/lib/reward-calculation-service';

export default function RewardCalculationsComponent() {
  const { employees, kpiRecords, departments } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024-Q1');
  const [calculations, setCalculations] = useState<RewardCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<RewardCalculation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Get unique periods from kpiRecords
  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(kpiRecords.map(record => record.period))];
    return uniquePeriods.sort();
  }, [kpiRecords]);

  // Get unique departments
  const departmentList = useMemo(() => {
    return departments.map(dept => ({ id: dept.id, name: dept.name }));
  }, [departments]);

  // Load calculations for selected period
  useEffect(() => {
    loadCalculations();
  }, [selectedPeriod]);

  const loadCalculations = async () => {
    setIsLoading(true);
    try {
      const data = await rewardCalculationService.getRewardCalculations(selectedPeriod);
      setCalculations(data);
    } catch (error) {
      console.error('Error loading calculations:', error);
      toast({
        title: "Error",
        description: "Failed to load reward calculations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter calculations based on search and department
  const filteredCalculations = useMemo(() => {
    return calculations.filter(calc => {
      const employee = employees.find(emp => emp.uid === calc.employeeId);
      const matchesSearch = calc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (employee?.position.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesDepartment = selectedDepartment === 'all' || calc.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [calculations, searchTerm, selectedDepartment, employees]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEmployees = calculations.length;
    const totalRewardAmount = calculations.reduce((sum, calc) => sum + calc.totalReward, 0);
    const averageReward = totalEmployees > 0 ? totalRewardAmount / totalEmployees : 0;
    
    const gradeDistribution = calculations.reduce((acc, calc) => {
      acc[calc.grade] = (acc[calc.grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEmployees,
      totalRewardAmount,
      averageReward,
      gradeDistribution
    };
  }, [calculations]);

  const handleCalculateRewards = async () => {
    setIsCalculating(true);
    try {
      const employeeIds = nonAdminEmployees.map(emp => emp.uid);
      await rewardCalculationService.calculateBulkRewards(employeeIds, selectedPeriod);
      
      toast({
        title: "Success",
        description: "Reward calculations completed successfully",
      });
      
      // Reload calculations
      await loadCalculations();
    } catch (error) {
      console.error('Error calculating rewards:', error);
      toast({
        title: "Error",
        description: "Failed to calculate rewards",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleViewCalculation = (calculation: RewardCalculation) => {
    setSelectedCalculation(calculation);
    setIsDialogOpen(true);
  };

  const handleExportCalculations = async () => {
    try {
      const csvContent = await rewardCalculationService.exportRewardCalculations(selectedPeriod);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reward-calculations-${selectedPeriod}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Calculations exported successfully",
      });
    } catch (error) {
      console.error('Error exporting calculations:', error);
      toast({
        title: "Error",
        description: "Failed to export calculations",
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

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedCalculation(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reward Calculations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Calculate and manage employee rewards based on performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleExportCalculations}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button 
            onClick={handleCalculateRewards}
            disabled={isCalculating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Calculating...' : 'Calculate Rewards'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Calculated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reward Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRewardAmount)}
            </div>
            <p className="text-xs text-muted-foreground">Total payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Reward</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.averageReward)}
            </div>
            <p className="text-xs text-muted-foreground">Per employee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grade A Employees</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.gradeDistribution.A || 0}
            </div>
            <p className="text-xs text-muted-foreground">Top performers</p>
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
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentList.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Period" />
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
        </CardContent>
      </Card>

      {/* Calculations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reward Calculations ({filteredCalculations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Loading calculations...</span>
            </div>
          ) : filteredCalculations.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No calculations found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedDepartment !== 'all' 
                  ? 'No calculations match your search criteria.' 
                  : 'No reward calculations available for this period.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Total Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Base Reward</TableHead>
                  <TableHead>Performance Reward</TableHead>
                  <TableHead>Penalty</TableHead>
                  <TableHead>Total Reward</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalculations.map((calculation) => {
                  const employee = employees.find(emp => emp.uid === calculation.employeeId);
                  const department = departments.find(d => d.id === calculation.department);
                  
                  return (
                    <TableRow key={calculation.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={employee?.avatar} />
                            <AvatarFallback>
                              {calculation.employeeName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{calculation.employeeName}</p>
                            <p className="text-sm text-muted-foreground">{employee?.position}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{department?.name || 'Unknown'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="w-3 h-3 text-blue-500" />
                            <span>KPI: {calculation.kpiScore}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            <span>Report: {calculation.reportScore}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="w-3 h-3 text-purple-500" />
                            <span>Behavior: {calculation.behaviorScore}</span>
                          </div>
                          <div className="font-medium">
                            Total: {calculation.totalScore}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getGradeColor(calculation.grade)}>
                          Grade {calculation.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(calculation.baseReward)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {formatCurrency(calculation.performanceReward)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ×{calculation.performanceMultiplier}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(calculation.penalty)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600">
                          {formatCurrency(calculation.totalReward)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(calculation.status)}>
                          {calculation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCalculation(calculation)}
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Calculation Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Reward Calculation Details - {selectedCalculation?.employeeName}
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of reward calculation for {selectedPeriod}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCalculation && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={employees.find(emp => emp.uid === selectedCalculation.employeeId)?.avatar} />
                  <AvatarFallback className="text-lg">
                    {selectedCalculation.employeeName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedCalculation.employeeName}</h3>
                  <p className="text-muted-foreground">
                    {employees.find(emp => emp.uid === selectedCalculation.employeeId)?.position}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {departments.find(d => d.id === selectedCalculation.department)?.name || 'Unknown'}
                    </Badge>
                    <Badge className={getGradeColor(selectedCalculation.grade)}>
                      Grade {selectedCalculation.grade}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{selectedCalculation.kpiScore}</p>
                  <p className="text-sm text-muted-foreground">KPI Score (60%)</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{selectedCalculation.reportScore}</p>
                  <p className="text-sm text-muted-foreground">Report Score (20%)</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{selectedCalculation.behaviorScore}</p>
                  <p className="text-sm text-muted-foreground">Behavior Score (20%)</p>
                </div>
              </div>

              {/* Reward Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Reward Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Base Reward</span>
                    <span className="font-medium">{formatCurrency(selectedCalculation.baseReward)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Performance Multiplier</span>
                    <span className="font-medium">×{selectedCalculation.performanceMultiplier}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Performance Reward</span>
                    <span className="font-medium">{formatCurrency(selectedCalculation.performanceReward)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Penalty</span>
                    <span className="font-medium text-red-600">-{formatCurrency(selectedCalculation.penalty)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg bg-green-50">
                    <span className="font-semibold">Total Reward</span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatCurrency(selectedCalculation.totalReward)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(selectedCalculation.status)}>
                    {selectedCalculation.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Approve
                  </Button>
                  <Button variant="outline" size="sm">
                    Mark as Paid
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
