'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  Gift, 
  Award,
  TrendingUp,
  Users,
  Calculator,
  Star,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Target,
  FileText,
  Calendar,
  Filter,
  Download,
  Play,
  Settings,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';

interface EmployeeEvaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  avatar?: string;
  
  // KPI Performance
  totalKpis: number;
  completedKpis: number;
  overdueKpis: number;
  averageCompletion: number; // %
  
  // Report Submission
  reportSubmissionRate: number; // %
  onTimeSubmissions: number;
  lateSubmissions: number;
  
  // Scoring
  kpiScore: number; // 0-60 points
  reportScore: number; // 0-20 points
  behaviorScore: number; // 0-20 points
  totalScore: number; // 0-100 points
  
  // Classification
  grade: 'A' | 'B' | 'C' | 'D';
  
  // Rewards/Penalties
  baseBonus: number;
  performanceMultiplier: number;
  finalReward: number;
  penalty: number;
  netAmount: number;
  
  // Status
  evaluationStatus: 'pending' | 'completed' | 'approved' | 'paid';
  evaluationDate?: Date;
  approvedBy?: string;
}

export default function EvaluationPage() {
  const { employees, departments, kpis, kpiRecords } = useContext(DataContext);
  const { toast } = useToast();
  
  const [selectedPeriod, setSelectedPeriod] = useState('2024-04');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Real evaluation data based on actual KPI performance
  const evaluationData = useMemo(() => {
    if (employees.length === 0) {
      return [];
    }

    // Filter out administrators from evaluation
    const nonAdminEmployees = employees.filter(employee => employee.role !== 'admin');

    const realData: EmployeeEvaluation[] = nonAdminEmployees.map((employee) => {
      const dept = departments.find(d => d.id === employee.departmentId);
      
      // Real KPI stats from actual data
      const employeeKpis = kpiRecords.filter(r => 
        r.employeeId === employee.uid || r.employeeId === employee.id
      );
      const totalKpis = employeeKpis.length;
      const completedKpis = employeeKpis.filter(r => r.status === 'completed').length;
      const overdueKpis = employeeKpis.filter(r => r.status === 'overdue').length;
      const averageCompletion = totalKpis > 0 ? (completedKpis / totalKpis * 100) : 0;
      
      // Report stats - to be integrated with actual report data
      const reportSubmissionRate = 0; // Will be calculated from real report data
      const onTimeSubmissions = 0;
      const lateSubmissions = 0;
      
      // Calculate scores based on real performance
      const kpiScore = Math.min(60, Math.round(averageCompletion * 0.6));
      const reportScore = 0; // Will be calculated when report system is integrated
      const behaviorScore = 0; // Will be set manually by manager
      const totalScore = kpiScore + reportScore + behaviorScore;
      
      // Determine grade based on actual score
      let grade: 'A' | 'B' | 'C' | 'D' = 'D';
      if (totalScore >= 90) grade = 'A';
      else if (totalScore >= 75) grade = 'B';
      else if (totalScore >= 60) grade = 'C';
      
      // Financial calculations - will be based on reward programs
      const baseBonus = 0; // To be set based on reward programs
      const performanceMultiplier = 1.0;
      const finalReward = 0;
      const penalty = 0;
      const netAmount = 0;
      
      const evaluationStatus: EmployeeEvaluation['evaluationStatus'] = 'pending';

      return {
        id: employee.uid || employee.id,
        employeeId: employee.uid || employee.id,
        employeeName: employee.name,
        department: dept?.name || 'Unknown',
        position: employee.position,
        avatar: employee.avatar,
        
        totalKpis,
        completedKpis,
        overdueKpis,
        averageCompletion,
        
        reportSubmissionRate,
        onTimeSubmissions,
        lateSubmissions,
        
        kpiScore,
        reportScore,
        behaviorScore,
        totalScore,
        
        grade,
        
        baseBonus,
        performanceMultiplier,
        finalReward,
        penalty,
        netAmount,
        
        evaluationStatus,
        evaluationDate: undefined,
        approvedBy: undefined,
      };
    });

    return realData;
  }, [employees, departments, kpiRecords]);

  // Filter data
  const filteredData = useMemo(() => {
    return evaluationData.filter(item => {
      const matchesDepartment = selectedDepartment === 'all' || item.department === selectedDepartment;
      return matchesDepartment;
    });
  }, [evaluationData, selectedDepartment]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredData.length;
    const gradeA = filteredData.filter(item => item.grade === 'A').length;
    const gradeB = filteredData.filter(item => item.grade === 'B').length;
    const gradeC = filteredData.filter(item => item.grade === 'C').length;
    const gradeD = filteredData.filter(item => item.grade === 'D').length;
    
    const pending = filteredData.filter(item => item.evaluationStatus === 'pending').length;
    const completed = filteredData.filter(item => item.evaluationStatus === 'completed').length;
    const approved = filteredData.filter(item => item.evaluationStatus === 'approved').length;
    
    const totalRewards = filteredData.reduce((acc, item) => acc + item.finalReward, 0);
    const totalPenalties = filteredData.reduce((acc, item) => acc + item.penalty, 0);
    const netAmount = totalRewards - totalPenalties;
    
    const avgScore = total > 0 ? filteredData.reduce((acc, item) => acc + item.totalScore, 0) / total : 0;

    return {
      total,
      grades: { gradeA, gradeB, gradeC, gradeD },
      statuses: { pending, completed, approved },
      amounts: { totalRewards, totalPenalties, netAmount },
      avgScore: Math.round(avgScore)
    };
  }, [filteredData]);

  const getGradeBadge = (grade: 'A' | 'B' | 'C' | 'D') => {
    switch (grade) {
      case 'A':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 font-bold text-xs px-2 py-0.5">A - Xuất sắc</Badge>;
      case 'B':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 font-bold text-xs px-2 py-0.5">B - Tốt</Badge>;
      case 'C':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 font-bold text-xs px-2 py-0.5">C - Đạt</Badge>;
      case 'D':
        return <Badge variant="destructive" className="font-bold text-xs px-2 py-0.5">D - Không đạt</Badge>;
    }
  };

  const getStatusBadge = (status: EmployeeEvaluation['evaluationStatus']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs px-2 py-0.5">Đã duyệt</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs px-2 py-0.5">Hoàn thành</Badge>;
      case 'paid':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 text-xs px-2 py-0.5">Đã chi trả</Badge>;
      default:
        return <Badge variant="outline" className="text-xs px-2 py-0.5">Chờ đánh giá</Badge>;
    }
  };

  const handleAutoEvaluate = async () => {
    setIsEvaluating(true);
    
    // Simulate evaluation process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast({
      title: "Đánh giá hoàn thành",
      description: `Đã tính toán thưởng/phạt cho ${summaryStats.statuses.pending} nhân viên`,
    });
    
    setIsEvaluating(false);
  };

  return (
    <div className="h-full p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đánh giá & Tính thưởng/phạt</h1>
          <p className="text-muted-foreground">
            Tự động tính toán thưởng/phạt dựa trên hiệu suất KPI
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-04">Tháng 4/2024</SelectItem>
              <SelectItem value="2024-03">Tháng 3/2024</SelectItem>
              <SelectItem value="2024-Q1">Quý 1/2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button onClick={handleAutoEvaluate} disabled={isEvaluating}>
            {isEvaluating ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Đang tính toán...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Tính toán tự động
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Tổng quan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-2xl font-bold">{summaryStats.total}</p>
                <p className="text-muted-foreground">Nhân viên</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{summaryStats.statuses.approved}</p>
                <p className="text-muted-foreground">Đã duyệt</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Chờ đánh giá:</span>
                <span className="font-medium">{summaryStats.statuses.pending}</span>
              </div>
              <div className="flex justify-between">
                <span>Hoàn thành:</span>
                <span className="font-medium">{summaryStats.statuses.completed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Phân loại hiệu suất</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>Xuất sắc (A):</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{summaryStats.grades.gradeA}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Tốt (B):</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{summaryStats.grades.gradeB}</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Đạt (C):</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{summaryStats.grades.gradeC}</span>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Không đạt (D):</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{summaryStats.grades.gradeD}</span>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>Điểm TB:</span>
                <span className="font-bold text-blue-600">{summaryStats.avgScore}/100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Thưởng & Phạt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tổng thưởng:</span>
                <span className="font-medium text-green-600">
                  {summaryStats.amounts.totalRewards.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tổng phạt:</span>
                <span className="font-medium text-red-600">
                  {summaryStats.amounts.totalPenalties.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between">
                <span className="font-medium">Tổng chi:</span>
                <span className="font-bold text-blue-600">
                  {summaryStats.amounts.netAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quy trình đánh giá</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>KPI: 0-60 điểm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Báo cáo: 0-20 điểm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Thái độ: 0-20 điểm</span>
              </div>
            </div>
            <div className="pt-2 border-t text-xs text-muted-foreground">
              <p>A: 90-100, B: 75-89</p>
              <p>C: 60-74, D: &lt;60</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="details">Chi tiết cá nhân</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt đánh giá</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {summaryStats.statuses.pending > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Còn {summaryStats.statuses.pending} nhân viên chưa được đánh giá. 
                <Button 
                  variant="link" 
                  className="p-0 ml-2 h-auto"
                  onClick={handleAutoEvaluate}
                  disabled={isEvaluating}
                >
                  Thực hiện ngay
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Employee Evaluation Grid */}
          <div className="grid gap-4">
            {filteredData.map((employee) => (
              <Card key={employee.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">{employee.employeeName}</h3>
                        <p className="text-xs text-muted-foreground">{employee.position} - {employee.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getGradeBadge(employee.grade)}
                      {getStatusBadge(employee.evaluationStatus)}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-600">{employee.totalScore}</p>
                      <p className="text-xs text-muted-foreground">Tổng điểm</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-green-600">{employee.completedKpis}/{employee.totalKpis}</p>
                      <p className="text-xs text-muted-foreground">KPI hoàn thành</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-purple-600">{employee.reportSubmissionRate.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Tỷ lệ nộp BC</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-green-600">
                        {employee.netAmount.toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-xs text-muted-foreground">Thưởng thực tế</p>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-xs">
                      <span>Điểm chi tiết:</span>
                      <span>KPI: {employee.kpiScore} | BC: {employee.reportScore} | TĐ: {employee.behaviorScore}</span>
                    </div>
                    <Progress value={employee.totalScore} className="h-1.5" />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {employee.evaluationDate && (
                        <span>Đánh giá: {employee.evaluationDate.toLocaleDateString('vi-VN')}</span>
                      )}
                      {employee.approvedBy && (
                        <span> • Duyệt bởi: {employee.approvedBy}</span>
                      )}
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelectedEmployee(employee)}>
                          <Eye className="w-3 h-3 mr-1" />
                          Chi tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Chi tiết đánh giá - {employee.employeeName}</DialogTitle>
                        </DialogHeader>
                        {selectedEmployee && (
                          <div className="space-y-6">
                            {/* Employee Info */}
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <Label>Họ tên</Label>
                                <p>{selectedEmployee.employeeName}</p>
                              </div>
                              <div>
                                <Label>Phòng ban</Label>
                                <p>{selectedEmployee.department}</p>
                              </div>
                              <div>
                                <Label>Chức vụ</Label>
                                <p>{selectedEmployee.position}</p>
                              </div>
                              <div>
                                <Label>Xếp loại</Label>
                                <div className="mt-1">
                                  {getGradeBadge(selectedEmployee.grade)}
                                </div>
                              </div>
                            </div>

                            {/* Performance Metrics */}
                            <div>
                              <Label className="text-base font-medium">Hiệu suất KPI</Label>
                              <div className="grid gap-3 mt-3 md:grid-cols-3">
                                <div className="text-center p-3 border rounded">
                                  <p className="text-xl font-bold text-green-600">{selectedEmployee.completedKpis}</p>
                                  <p className="text-sm text-muted-foreground">Hoàn thành</p>
                                </div>
                                <div className="text-center p-3 border rounded">
                                  <p className="text-xl font-bold text-red-600">{selectedEmployee.overdueKpis}</p>
                                  <p className="text-sm text-muted-foreground">Quá hạn</p>
                                </div>
                                <div className="text-center p-3 border rounded">
                                  <p className="text-xl font-bold text-blue-600">{selectedEmployee.averageCompletion.toFixed(1)}%</p>
                                  <p className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</p>
                                </div>
                              </div>
                            </div>

                            {/* Score Breakdown */}
                            <div>
                              <Label className="text-base font-medium">Phân tích điểm số</Label>
                              <div className="space-y-3 mt-3">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>KPI Score</span>
                                    <span>{selectedEmployee.kpiScore}/60</span>
                                  </div>
                                  <Progress value={(selectedEmployee.kpiScore / 60) * 100} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Report Score</span>
                                    <span>{selectedEmployee.reportScore}/20</span>
                                  </div>
                                  <Progress value={(selectedEmployee.reportScore / 20) * 100} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Behavior Score</span>
                                    <span>{selectedEmployee.behaviorScore}/20</span>
                                  </div>
                                  <Progress value={(selectedEmployee.behaviorScore / 20) * 100} className="h-2" />
                                </div>
                                <div className="pt-2 border-t">
                                  <div className="flex justify-between font-medium">
                                    <span>Tổng điểm</span>
                                    <span className="text-lg text-blue-600">{selectedEmployee.totalScore}/100</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Financial Calculation */}
                            <div>
                              <Label className="text-base font-medium">Tính toán thưởng/phạt</Label>
                              <div className="space-y-2 mt-3 text-sm">
                                <div className="flex justify-between">
                                  <span>Thưởng cơ bản:</span>
                                  <span>{selectedEmployee.baseBonus.toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Hệ số hiệu suất:</span>
                                  <span>{selectedEmployee.performanceMultiplier}x</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Thưởng theo hiệu suất:</span>
                                  <span className="text-green-600">{selectedEmployee.finalReward.toLocaleString('vi-VN')}đ</span>
                                </div>
                                {selectedEmployee.penalty > 0 && (
                                  <div className="flex justify-between">
                                    <span>Phạt:</span>
                                    <span className="text-red-600">-{selectedEmployee.penalty.toLocaleString('vi-VN')}đ</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-medium text-base border-t pt-2">
                                  <span>Tổng thực nhận:</span>
                                  <span className="text-blue-600">{selectedEmployee.netAmount.toLocaleString('vi-VN')}đ</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              {selectedEmployee.evaluationStatus === 'completed' && (
                                <Button className="flex-1">
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Duyệt đánh giá
                                </Button>
                              )}
                              <Button variant="outline" className="flex-1">
                                <FileText className="w-4 h-4 mr-2" />
                                Xuất báo cáo chi tiết
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Chức năng đang phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt đánh giá</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Chức năng đang phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
