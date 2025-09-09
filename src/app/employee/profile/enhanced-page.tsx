'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  User,
  Target,
  Award,
  TrendingUp,
  Calendar,
  Star,
  Trophy,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Edit,
  Building2,
  Mail,
  Phone,
  MapPin,
  Badge as BadgeIcon,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';

export default function EnhancedEmployeeProfilePage() {
  const { user } = useContext(AuthContext);
  const { kpis, kpiRecords, departments, employees } = useContext(DataContext);
  
  const [selectedPeriod, setSelectedPeriod] = useState('2024-04');
  
  // Get user's department
  const userDepartment = departments.find(d => d.id === user?.departmentId);
  
  // Get user's KPI records and performance
  const userKpiRecords = useMemo(() => {
    return kpiRecords.filter(record => record.employeeId === user?.uid);
  }, [kpiRecords, user?.uid]);

  // Mock performance data
  const performanceData = useMemo(() => {
    const totalKpis = userKpiRecords.length;
    const completedKpis = userKpiRecords.filter(r => r.status === 'approved').length;
    const pendingKpis = userKpiRecords.filter(r => r.status === 'pending').length;
    const overdueKpis = 1; // Mock
    
    const completionRate = totalKpis > 0 ? (completedKpis / totalKpis) * 100 : 0;
    
    // Mock scores and rankings
    const monthlyScores = [
      { month: '2024-01', score: 85, rank: 12 },
      { month: '2024-02', score: 88, rank: 10 },
      { month: '2024-03', score: 92, rank: 8 },
      { month: '2024-04', score: 87, rank: 9 }
    ];
    
    const currentScore = monthlyScores[monthlyScores.length - 1]?.score || 0;
    const currentRank = monthlyScores[monthlyScores.length - 1]?.rank || 0;
    
    // Mock rewards and achievements
    const totalRewards = 12500000;
    const monthlyReward = 2500000;
    const achievements = [
      { id: '1', name: 'Top Performer Q1', date: '2024-03-31', type: 'quarterly' },
      { id: '2', name: 'Perfect Attendance', date: '2024-02-29', type: 'monthly' },
      { id: '3', name: 'Customer Satisfaction Star', date: '2024-01-15', type: 'special' }
    ];
    
    return {
      totalKpis,
      completedKpis,
      pendingKpis,
      overdueKpis,
      completionRate,
      currentScore,
      currentRank,
      monthlyScores,
      totalRewards,
      monthlyReward,
      achievements
    };
  }, [userKpiRecords]);

  // Mock career progression data
  const careerData = {
    joinDate: new Date('2022-08-15'),
    currentLevel: 'Senior Staff',
    yearsOfService: 1.7,
    promotions: [
      { date: '2022-08-15', position: 'Junior Staff', level: 1 },
      { date: '2023-06-01', position: 'Staff', level: 2 },
      { date: '2024-01-01', position: 'Senior Staff', level: 3 }
    ],
    skills: [
      { name: 'Project Management', level: 85, category: 'Professional' },
      { name: 'Communication', level: 92, category: 'Soft Skills' },
      { name: 'Data Analysis', level: 78, category: 'Technical' },
      { name: 'Leadership', level: 80, category: 'Soft Skills' },
      { name: 'Problem Solving', level: 88, category: 'Professional' }
    ],
    certifications: [
      { name: 'PMP Certificate', issuer: 'PMI', date: '2023-05-15' },
      { name: 'Agile Methodology', issuer: 'Scrum Alliance', date: '2023-02-20' }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Hoàn thành</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Quá hạn</Badge>;
      default:
        return <Badge variant="outline">Đang thực hiện</Badge>;
    }
  };

  const getAchievementBadge = (type: string) => {
    switch (type) {
      case 'quarterly':
        return <Badge className="bg-gold-100 text-gold-800"><Trophy className="w-3 h-3 mr-1" />Quý</Badge>;
      case 'monthly':
        return <Badge className="bg-blue-100 text-blue-800"><Star className="w-3 h-3 mr-1" />Tháng</Badge>;
      case 'special':
        return <Badge className="bg-purple-100 text-purple-800"><Award className="w-3 h-3 mr-1" />Đặc biệt</Badge>;
      default:
        return <Badge variant="outline">Khác</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="h-full p-6 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <p className="text-lg text-muted-foreground">{user?.position}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {userDepartment?.name}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {careerData.yearsOfService.toFixed(1)} năm kinh nghiệm
              </div>
              <div className="flex items-center gap-1">
                <BadgeIcon className="w-4 h-4" />
                {careerData.currentLevel}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Xuất CV
          </Button>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Điểm hiệu suất</p>
                <p className="text-3xl font-bold text-blue-600">{performanceData.currentScore}</p>
                <p className="text-xs text-muted-foreground">/ 100 điểm</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Xếp hạng</p>
                <p className="text-3xl font-bold text-green-600">#{performanceData.currentRank}</p>
                <p className="text-xs text-muted-foreground">trong công ty</p>
              </div>
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">KPI hoàn thành</p>
                <p className="text-3xl font-bold text-purple-600">{performanceData.completedKpis}/{performanceData.totalKpis}</p>
                <p className="text-xs text-muted-foreground">{performanceData.completionRate.toFixed(1)}%</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-4">
              <Progress value={performanceData.completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Thưởng tháng này</p>
                <p className="text-3xl font-bold text-orange-600">{formatCurrency(performanceData.monthlyReward)}</p>
              </div>
              <Award className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="kpis">KPI của tôi</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          <TabsTrigger value="achievements">Thành tích</TabsTrigger>
          <TabsTrigger value="career">Sự nghiệp</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Thông tin cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">+84 (0) 123 456 789</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Hồ Chí Minh, Việt Nam</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{userDepartment?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Gia nhập: {careerData.joinDate.toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Hoạt động gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Hoàn thành KPI "Doanh số Q1"</p>
                      <p className="text-xs text-muted-foreground">2 ngày trước</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Nộp báo cáo tháng 4</p>
                      <p className="text-xs text-muted-foreground">1 tuần trước</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50">
                    <Award className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Nhận thưởng hiệu suất</p>
                      <p className="text-xs text-muted-foreground">2 tuần trước</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>KPI hiện tại</CardTitle>
            </CardHeader>
            <CardContent>
              {userKpiRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Bạn chưa có KPI nào được giao</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userKpiRecords.map((record) => {
                    const kpiDetail = kpis.find(k => k.id === record.kpiId);
                    return (
                      <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{kpiDetail?.name}</h4>
                          <p className="text-sm text-muted-foreground">{kpiDetail?.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span>Target: {record.target} {kpiDetail?.unit}</span>
                            <span>Thực hiện: {record.actual || 0} {kpiDetail?.unit}</span>
                            <span>Hạn: {new Date(record.endDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="mt-2">
                            <Progress 
                              value={record.target > 0 ? ((record.actual || 0) / record.target * 100) : 0} 
                              className="h-2" 
                            />
                          </div>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(record.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ hiệu suất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-3">Điểm theo tháng</h4>
                    <div className="space-y-2">
                      {performanceData.monthlyScores.map((score, index) => (
                        <div key={score.month} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{score.month}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{score.score} điểm</span>
                            <Badge variant="outline" className="text-xs">#{score.rank}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Phân tích KPI</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Hoàn thành đúng hạn</span>
                        <span className="font-medium">{performanceData.completedKpis}/{performanceData.totalKpis}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Đang chờ duyệt</span>
                        <span className="font-medium">{performanceData.pendingKpis}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Quá hạn</span>
                        <span className="font-medium text-red-600">{performanceData.overdueKpis}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Thành tích & Giải thưởng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Đạt được vào {new Date(achievement.date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    {getAchievementBadge(achievement.type)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tổng kết thưởng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(performanceData.totalRewards)}</p>
                  <p className="text-sm text-muted-foreground">Tổng thưởng năm nay</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(performanceData.monthlyReward)}</p>
                  <p className="text-sm text-muted-foreground">Thưởng tháng này</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="career" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lộ trình thăng tiến</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {careerData.promotions.map((promotion, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                        {promotion.level}
                      </div>
                      <div>
                        <p className="font-medium">{promotion.position}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(promotion.date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kỹ năng & Năng lực</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {careerData.skills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{skill.category}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Chứng chỉ & Đào tạo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {careerData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{new Date(cert.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}