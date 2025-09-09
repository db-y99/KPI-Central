'use client';
import { useContext, useState } from 'react';
import { 
  Settings, 
  Building2, 
  Users, 
  Target, 
  Gift,
  Plus,
  Edit,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  UserPlus,
  Shield,
  Database,
  Loader2,
  Zap,
  Eye,
  Cog
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RewardProgramDetailModal } from '@/components/reward-program-detail-modal';
import { EditRewardProgramForm } from '@/components/edit-reward-program-form';
import EditDepartmentForm from '@/components/edit-department-form';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { RewardProgram } from '@/types';

interface RewardPenaltyRule {
  id: string;
  kpiId: string;
  kpiName: string;
  performanceLevel: 'excellent' | 'good' | 'average' | 'poor';
  rewardAmount: number;
  penaltyAmount: number;
  description: string;
}

interface KPIPermission {
  id: string;
  kpiId: string;
  employeeId: string;
  departmentId: string;
  canView: boolean;
  canEdit: boolean;
  canSubmitReport: boolean;
  assignedBy: string;
  assignedDate: Date;
}

export default function AdminSetupPage() {
  console.log('AdminSetupPage rendered');
  const { departments, employees, kpis, rewardPrograms, updateRewardProgram, deleteRewardProgram, deleteDepartment } = useContext(DataContext);
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditKpiDialogOpen, setIsEditKpiDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<any>(null);
  
  // Reward program modal states
  const [isEditRewardDialogOpen, setIsEditRewardDialogOpen] = useState(false);
  const [editingRewardProgram, setEditingRewardProgram] = useState<RewardProgram | null>(null);
  
  // Department modal states
  const [isEditDepartmentDialogOpen, setIsEditDepartmentDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);

  // Reward/penalty rules - will be managed through reward programs
  const [rewardRules, setRewardRules] = useState<RewardPenaltyRule[]>([]);

  // Reward program handlers
  const handleEditRewardProgram = (program: RewardProgram) => {
    console.log('Edit reward program clicked:', program);
    setEditingRewardProgram(program);
    setIsEditRewardDialogOpen(true);
  };

  const handleCloseEditRewardDialog = () => {
    setIsEditRewardDialogOpen(false);
    setEditingRewardProgram(null);
  };

  const handleSaveRewardProgram = async (updatedProgram: RewardProgram) => {
    try {
      await updateRewardProgram(updatedProgram);
      toast({
        title: t.common.success,
        description: 'Chương trình thưởng đã được cập nhật.',
      });
      setIsEditRewardDialogOpen(false);
      setEditingRewardProgram(null);
    } catch (error) {
      console.error('Error updating reward program:', error);
      toast({
        title: t.common.error,
        description: t.setup.saveError,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRewardProgram = (programId: string) => {
    const program = rewardPrograms.find(p => p.id === programId);
    if (window.confirm(`${t.setup.confirmDelete} "${program?.name}"?`)) {
      deleteRewardProgram(programId);
      toast({
        title: t.common.success,
        description: `${t.setup.programDeleted} "${program?.name}".`,
        variant: 'destructive'
      });
    }
  };

  // Department handlers
  const handleEditDepartment = (department: any) => {
    console.log('Edit department clicked:', department);
    setEditingDepartment(department);
    setIsEditDepartmentDialogOpen(true);
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    console.log('Delete department clicked:', departmentId);
    const department = departments.find(d => d.id === departmentId);
    const employeeCount = employees.filter(emp => emp.departmentId === departmentId).length;
  
    if (employeeCount > 0) {
      toast({
        title: t.common.error,
        description: t.setup.cannotDeleteDepartment.replace('{count}', employeeCount.toString()),
        variant: 'destructive'
      });
      return;
    }

    if (window.confirm(`${t.setup.confirmDelete} "${department?.name}"?`)) {
      try {
        await deleteDepartment(departmentId);
        toast({
          title: t.common.success,
          description: `${t.setup.departmentDeleted} "${department?.name}".`,
        });
      } catch (error) {
        console.error('Error deleting department:', error);
        toast({
          title: t.common.error,
          description: t.setup.errorDeletingDepartment,
          variant: 'destructive'
        });
      }
    }
  };

  // Department management
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '', managerId: '' });
  const [newEmployee, setNewEmployee] = useState({ 
    name: '', 
    email: '', 
    position: '', 
    departmentId: '',
    role: 'employee' as 'admin' | 'manager' | 'employee'
  });

  // KPI definition
  const [newKPI, setNewKPI] = useState({
    name: '',
    description: '',
    formula: '',
    unit: '',
    target: 0,
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    category: '',
    weight: 1
  });

  // Reward rule
  const [newRewardRule, setNewRewardRule] = useState({
    kpiId: '',
    performanceLevel: 'excellent' as RewardPenaltyRule['performanceLevel'],
    rewardAmount: 0,
    penaltyAmount: 0,
    description: ''
  });

  const setupProgress = {
    departments: departments.length,
    employees: employees.length,
    kpis: kpis.length,
    rewardPrograms: rewardPrograms.length,
    completion: Math.round(((departments.length > 0 ? 25 : 0) + (employees.length > 0 ? 25 : 0) + (kpis.length > 0 ? 25 : 0) + (rewardPrograms.length > 0 ? 25 : 0)))
  };


  const handleCreateDepartment = () => {
    if (!newDepartment.name.trim()) {
      toast({
        title: t.common.error,
        description: t.setup.pleaseEnterDepartmentName,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: t.common.success,
        description: t.setup.departmentCreated,
    });

    setNewDepartment({ name: '', description: '', managerId: '' });
    setIsDialogOpen(false);
  };

  const handleCreateEmployee = () => {
    if (!newEmployee.name.trim() || !newEmployee.email.trim()) {
      toast({
        title: t.common.error, 
        description: t.setup.pleaseEnterEmployeeInfo,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: t.common.success,
      description: t.setup.employeeCreated,
    });

    setNewEmployee({ name: '', email: '', position: '', departmentId: '', role: 'employee' });
    setIsDialogOpen(false);
  };

  const handleCreateKPI = () => {
    if (!newKPI.name.trim() || !newKPI.description.trim()) {
      toast({
        title: t.common.error,
        description: t.setup.pleaseEnterKpiInfo, 
        variant: "destructive"
      });
      return;
    }

    toast({
      title: t.common.success, 
      description: t.setup.kpiCreated,
    });

    setNewKPI({
      name: '', description: '', formula: '', unit: '', target: 0, 
      frequency: 'monthly', category: '', weight: 1
    });
    setIsDialogOpen(false);
  };

  const handleCreateRewardRule = () => {
    if (!newRewardRule.kpiId || !newRewardRule.description.trim()) {
      toast({
        title: t.common.error,
        description: t.setup.pleaseSelectKpiAndDescription,
        variant: "destructive"
      });
      return;
    }

    const kpiName = kpis.find(k => k.id === newRewardRule.kpiId)?.name || 'Unknown';
    const newRule: RewardPenaltyRule = {
      id: Date.now().toString(),
      kpiId: newRewardRule.kpiId,
      kpiName,
      performanceLevel: newRewardRule.performanceLevel,
      rewardAmount: newRewardRule.rewardAmount,
      penaltyAmount: newRewardRule.penaltyAmount,
      description: newRewardRule.description
    };

    setRewardRules([...rewardRules, newRule]);
    
    toast({
      title: t.common.success,
      description: t.setup.rewardRuleCreated,
    });

    setNewRewardRule({
      kpiId: '', performanceLevel: 'excellent', rewardAmount: 0, penaltyAmount: 0, description: ''
    });
    setIsDialogOpen(false);
  };

  const handleEditKpi = (kpi: any) => {
    console.log('Edit KPI clicked:', kpi);
    console.log('Setting editing KPI and opening dialog');
    setEditingKpi(kpi);
    setIsEditKpiDialogOpen(true);
    console.log('Dialog should be open now');
  };

  const handlePermissionsKpi = (kpi: any) => {
    console.log('Permissions KPI clicked:', kpi);
    setEditingKpi(kpi);
    setIsPermissionsDialogOpen(true);
  };

  const handleCloseEditKpiDialog = () => {
    setIsEditKpiDialogOpen(false);
    setEditingKpi(null);
  };

  const handleClosePermissionsDialog = () => {
    setIsPermissionsDialogOpen(false);
    setEditingKpi(null);
  };

  const getPerformanceLevelBadge = (level: RewardPenaltyRule['performanceLevel']) => {
    switch (level) {
      case 'excellent':
        return <Badge className="badge-success">{t.setup.excellent}</Badge>;
      case 'good':
        return <Badge className="badge-info">{t.setup.good}</Badge>;
      case 'average':
        return <Badge variant="secondary">{t.setup.average}</Badge>;
      case 'poor':
        return <Badge variant="destructive">{t.setup.poor}</Badge>;
      default:
        return <Badge variant="secondary">{t.setup.undefined}</Badge>;
    }
  };

  return (
    <div className="h-full p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.setup.title}</h1>
          <p className="text-muted-foreground">
            {t.setup.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t.setup.progress}</p>
            <p className="text-2xl font-bold text-primary">{setupProgress.completion}%</p>
          </div>
        </div>
      </div>

      {/* Setup Progress Overview - Compact */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={`rounded-2xl shadow-sm hover:shadow-md transition-shadow ${setupProgress.departments > 0 ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${setupProgress.departments > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                <Building2 className={`w-5 h-5 ${setupProgress.departments > 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive dark:text-red-400'}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.setup.departments}</p>
                <p className="text-xl font-bold">{setupProgress.departments}</p>
              </div>
            </div>
            {setupProgress.departments === 0 && (
              <Alert className="mt-2 py-1.5 rounded-2xl alert-error">
                <AlertTriangle className="h-3 w-3" />
                <AlertDescription className="text-xs">{t.setup.needCreateDepartment}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className={`rounded-2xl shadow-sm hover:shadow-md transition-shadow ${setupProgress.employees > 0 ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${setupProgress.employees > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                <Users className={`w-5 h-5 ${setupProgress.employees > 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive dark:text-red-400'}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.setup.employees}</p>
                <p className="text-xl font-bold">{setupProgress.employees}</p>
              </div>
            </div>
            {setupProgress.employees === 0 && (
              <Alert className="mt-2 py-1.5 rounded-2xl alert-error">
                <AlertTriangle className="h-3 w-3" />
                <AlertDescription className="text-xs">{t.setup.needCreateEmployee}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className={`rounded-2xl shadow-sm hover:shadow-md transition-shadow ${setupProgress.kpis > 0 ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${setupProgress.kpis > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                <Target className={`w-5 h-5 ${setupProgress.kpis > 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive dark:text-red-400'}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.setup.kpis}</p>
                <p className="text-xl font-bold">{setupProgress.kpis}</p>
              </div>
            </div>
            {setupProgress.kpis === 0 && (
              <Alert className="mt-2 py-1.5 rounded-2xl alert-error">
                <AlertTriangle className="h-3 w-3" />
                <AlertDescription className="text-xs">{t.setup.needDefineKpi}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className={`rounded-2xl shadow-sm hover:shadow-md transition-shadow ${setupProgress.rewardPrograms > 0 ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${setupProgress.rewardPrograms > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                <Gift className={`w-5 h-5 ${setupProgress.rewardPrograms > 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive dark:text-red-400'}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.setup.rewards}</p>
                <p className="text-xl font-bold">{setupProgress.rewardPrograms}</p>
              </div>
            </div>
            {setupProgress.rewardPrograms === 0 && (
              <Alert className="mt-2 py-1.5 rounded-2xl alert-error">
                <AlertTriangle className="h-3 w-3" />
                <AlertDescription className="text-xs">{t.setup.needSetupReward}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Setup Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="departments">Phòng ban</TabsTrigger>
          <TabsTrigger value="kpis">KPI</TabsTrigger>
          <TabsTrigger value="rewards">Thưởng/Phạt</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn cấu hình</CardTitle>
              <CardDescription>
                Thứ tự khuyến nghị để cấu hình hệ thống KPI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3">
                <div className={`flex items-center gap-3 p-3 border rounded-xl hover:shadow-sm transition-all ${setupProgress.departments > 0 ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-card border-border'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${setupProgress.departments > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted'}`}>
                    {setupProgress.departments > 0 ? 
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" /> : 
                      <span className="text-muted-foreground font-bold text-sm">1</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">Tạo phòng ban</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      Định nghĩa cơ cấu tổ chức và vị trí công việc
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    variant={setupProgress.departments > 0 ? "outline" : "default"} 
                    className={`${setupProgress.departments === 0 ? "btn-gradient" : ""} h-7 px-3 text-xs`}
                    onClick={() => setActiveTab('departments')}
                  >
                    {setupProgress.departments > 0 ? "Quản lý" : "Bắt đầu"}
                  </Button>
                </div>

                <div className={`flex items-center gap-3 p-3 border rounded-xl hover:shadow-sm transition-all ${setupProgress.employees > 0 ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-card border-border'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${setupProgress.employees > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted'}`}>
                    {setupProgress.employees > 0 ? 
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" /> : 
                      <span className="text-muted-foreground font-bold text-sm">2</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">Tạo tài khoản nhân viên</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      Thêm nhân viên và phân quyền truy cập
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    variant={setupProgress.employees > 0 ? "outline" : "default"} 
                    className={`${setupProgress.employees === 0 && setupProgress.departments > 0 ? "btn-gradient" : ""} h-7 px-3 text-xs`}
                    disabled={setupProgress.departments === 0}
                    onClick={() => setActiveTab('employees')}
                  >
                    {setupProgress.employees > 0 ? "Quản lý" : "Tạo nhân viên"}
                  </Button>
                </div>

                <div className={`flex items-center gap-3 p-3 border rounded-xl hover:shadow-sm transition-all ${setupProgress.kpis > 0 ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-card border-border'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${setupProgress.kpis > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted'}`}>
                    {setupProgress.kpis > 0 ? 
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" /> : 
                      <span className="text-muted-foreground font-bold text-sm">3</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">Định nghĩa KPI</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      Thiết lập chỉ số hiệu suất và công thức tính
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    variant={setupProgress.kpis > 0 ? "outline" : "default"} 
                    className={`${setupProgress.kpis === 0 ? "btn-gradient" : ""} h-7 px-3 text-xs`}
                    onClick={() => setActiveTab('kpis')}
                  >
                    {setupProgress.kpis > 0 ? "Quản lý" : "Tạo KPI"}
                  </Button>
                </div>

                <div className={`flex items-center gap-3 p-3 border rounded-xl hover:shadow-sm transition-all ${setupProgress.rewardPrograms > 0 ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-card border-border'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${setupProgress.rewardPrograms > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted'}`}>
                    {setupProgress.rewardPrograms > 0 ? 
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" /> : 
                      <span className="text-muted-foreground font-bold text-sm">4</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">Thiết lập chương trình thưởng</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      Cấu hình thưởng/phạt cho từng vị trí
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    variant={setupProgress.rewardPrograms > 0 ? "outline" : "default"}
                    className={`${setupProgress.rewardPrograms === 0 && setupProgress.kpis > 0 ? "btn-gradient" : ""} h-7 px-3 text-xs`}
                    disabled={setupProgress.kpis === 0} 
                    onClick={() => setActiveTab('rewards')}
                  >
                    {setupProgress.rewardPrograms > 0 ? "Quản lý" : "Thiết lập"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Quản lý phòng ban & nhân viên</h2>
              <p className="text-muted-foreground">Tạo và quản lý cơ cấu tổ chức</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => router.push('/admin/create-department')}
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Tạo phòng ban mới
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setEditingItem('department')}
                    className="btn-gradient"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm phòng ban
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tạo phòng ban mới</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dept-name">Tên phòng ban *</Label>
                      <Input
                        id="dept-name"
                        value={newDepartment.name}
                        onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                        placeholder="Ví dụ: Phòng Kinh doanh"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dept-desc">Mô tả</Label>
                      <Textarea
                        id="dept-desc"
                        value={newDepartment.description}
                        onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                        placeholder="Mô tả chức năng của phòng ban..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="dept-manager">Trưởng phòng</Label>
                      <Select value={newDepartment.managerId} onValueChange={(value) => setNewDepartment({...newDepartment, managerId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trưởng phòng" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCreateDepartment} 
                        className="flex-1 btn-gradient"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Tạo phòng ban
                      </Button>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Hủy
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Thêm nhân viên
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tạo tài khoản nhân viên</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="emp-name">Họ tên *</Label>
                        <Input
                          id="emp-name"
                          value={newEmployee.name}
                          onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emp-email">Email *</Label>
                        <Input
                          id="emp-email"
                          type="email"
                          value={newEmployee.email}
                          onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                          placeholder="nva@company.com"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="emp-position">Chức vụ</Label>
                        <Input
                          id="emp-position"
                          value={newEmployee.position}
                          onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                          placeholder="Nhân viên kinh doanh"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emp-dept">Phòng ban</Label>
                        <Select value={newEmployee.departmentId} onValueChange={(value) => setNewEmployee({...newEmployee, departmentId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn phòng ban" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map(dept => (
                              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="emp-role">Quyền hạn</Label>
                      <Select value={newEmployee.role} onValueChange={(value: 'admin' | 'manager' | 'employee') => setNewEmployee({...newEmployee, role: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Nhân viên</SelectItem>
                          <SelectItem value="manager">Quản lý</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCreateEmployee} 
                        className="flex-1 btn-gradient"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Tạo tài khoản
                      </Button>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Hủy
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Department List */}
          <div className="grid gap-4">
            {departments.map(department => (
              <Card key={department.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">{department.name}</h3>
                        <Badge variant={department.isActive ? "default" : "secondary"}>
                          {department.isActive ? "Hoạt động" : "Tạm ngưng"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{department.description}</p>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Số nhân viên: </span>
                        <span className="font-medium">
                          {employees.filter(emp => emp.departmentId === department.id).length}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          console.log('Edit department button clicked:', department.name);
                          handleEditDepartment(department);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Sửa
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          console.log('Delete department button clicked:', department.name);
                          handleDeleteDepartment(department.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Định nghĩa KPI</h2>
              <p className="text-muted-foreground">Tạo và quản lý các chỉ số hiệu suất</p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="btn-gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm KPI
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Định nghĩa KPI mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="kpi-name">Tên KPI *</Label>
                      <Input
                        id="kpi-name"
                        value={newKPI.name}
                        onChange={(e) => setNewKPI({...newKPI, name: e.target.value})}
                        placeholder="Ví dụ: Doanh số bán hàng"
                      />
                    </div>
                    <div>
                      <Label htmlFor="kpi-category">Danh mục</Label>
                      <Input
                        id="kpi-category"
                        value={newKPI.category}
                        onChange={(e) => setNewKPI({...newKPI, category: e.target.value})}
                        placeholder="Ví dụ: Kinh doanh"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="kpi-desc">Mô tả *</Label>
                    <Textarea
                      id="kpi-desc"
                      value={newKPI.description}
                      onChange={(e) => setNewKPI({...newKPI, description: e.target.value})}
                      placeholder="Mô tả chi tiết về KPI này..."
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="kpi-unit">Đơn vị</Label>
                      <Input
                        id="kpi-unit"
                        value={newKPI.unit}
                        onChange={(e) => setNewKPI({...newKPI, unit: e.target.value})}
                        placeholder="VND, %, Lần..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="kpi-target">Chỉ tiêu</Label>
                      <Input
                        id="kpi-target"
                        type="number"
                        value={newKPI.target}
                        onChange={(e) => setNewKPI({...newKPI, target: parseInt(e.target.value) || 0})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="kpi-weight">Trọng số</Label>
                      <Input
                        id="kpi-weight"
                        type="number"
                        step="0.1"
                        value={newKPI.weight}
                        onChange={(e) => setNewKPI({...newKPI, weight: parseFloat(e.target.value) || 1})}
                        placeholder="1.0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="kpi-frequency">Tần suất đo</Label>
                    <Select value={newKPI.frequency} onValueChange={(value: typeof newKPI.frequency) => setNewKPI({...newKPI, frequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Hàng ngày</SelectItem>
                        <SelectItem value="weekly">Hàng tuần</SelectItem>
                        <SelectItem value="monthly">Hàng tháng</SelectItem>
                        <SelectItem value="quarterly">Hàng quý</SelectItem>
                        <SelectItem value="yearly">Hàng năm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="kpi-formula">Công thức tính</Label>
                    <Textarea
                      id="kpi-formula"
                      value={newKPI.formula}
                      onChange={(e) => setNewKPI({...newKPI, formula: e.target.value})}
                      placeholder="Ví dụ: (Doanh thu thực tế / Doanh thu kế hoạch) * 100"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCreateKPI} 
                      className="flex-1 bg-gradient-to-r from-[#99FFFF] to-[#66CCFF] hover:from-[#7FFFFF] hover:to-[#4DB8FF] text-black border-0"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Tạo KPI
                    </Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Hủy
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* KPI List */}
          <div className="grid gap-4">
            {kpis.map(kpi => (
              <Card key={kpi.id} className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">{kpi.name}</h3>
                        <Badge variant="secondary">{kpi.category || 'Chưa phân loại'}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{kpi.description}</p>
                      <div className="grid gap-2 md:grid-cols-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Chỉ tiêu: </span>
                          <span className="font-medium">{kpi.target} {kpi.unit}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tần suất: </span>
                          <span className="font-medium">{kpi.frequency}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Trọng số: </span>
                          <span className="font-medium">{kpi.weight || 1}</span>
                        </div>
                      </div>
                      {kpi.formula && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Công thức: </span>
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{kpi.formula}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditKpi(kpi)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Sửa
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePermissionsKpi(kpi)}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Phân quyền
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Chương trình thưởng</h2>
              <p className="text-muted-foreground">Quản lý chương trình thưởng/phạt cho từng vị trí công việc</p>
            </div>
            {setupProgress.rewardPrograms === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Chưa có chương trình thưởng nào. Hãy tạo chương trình thưởng đầu tiên.
                </p>
                <Button 
                  onClick={() => setActiveTab('rewards')}
                  className="btn-gradient"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Tạo chương trình thưởng
                </Button>
              </div>
            ) : (
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Thêm chương trình
              </Button>
            )}
          </div>

          {/* Reward Programs List */}
          <div className="grid gap-6">
            {rewardPrograms.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Gift className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Chưa có chương trình thưởng</h3>
                  <p className="text-muted-foreground mb-4">
                    Tạo chương trình thưởng cho các vị trí công việc trong hệ thống
                  </p>
                  <Button 
                    onClick={() => setActiveTab('rewards')}
                    className="btn-gradient"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Tạo chương trình thưởng
                  </Button>
                </CardContent>
              </Card>
            ) : (
              rewardPrograms.map(program => (
                <Card key={program.id} className="card-modern">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Gift className="w-6 h-6 text-primary" />
                          <h3 className="text-xl font-semibold">{program.name}</h3>
                          <Badge variant={program.isActive ? "default" : "secondary"}>
                            {program.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                          </Badge>
                          <Badge variant="outline">{program.position}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{program.description}</p>
                        
                        {/* Quarterly Rewards */}
                        {program.quarterlyRewards.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Thưởng theo quý ({program.quarterlyRewards.length} tiêu chí)
                            </h4>
                            <div className="grid gap-2 pl-6">
                              {program.quarterlyRewards.slice(0, 3).map(reward => (
                                <div key={reward.id} className="flex items-center justify-between text-sm">
                                  <span>{reward.name}</span>
                                  <span className="font-medium text-primary">
                                    {reward.value.toLocaleString('vi-VN')} {reward.type === 'percentage' ? '%' : 'VND'}
                                  </span>
                                </div>
                              ))}
                              {program.quarterlyRewards.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{program.quarterlyRewards.length - 3} tiêu chí khác
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Monthly Rewards */}
                        {program.monthlyRewards && program.monthlyRewards.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Thưởng hàng tháng ({program.monthlyRewards.length} tiêu chí)
                            </h4>
                            <div className="grid gap-2 pl-6">
                              {program.monthlyRewards.slice(0, 2).map(reward => (
                                <div key={reward.id} className="flex items-center justify-between text-sm">
                                  <span>{reward.name}</span>
                                  <span className="font-medium text-primary">
                                    {reward.value.toLocaleString('vi-VN')} {reward.type === 'percentage' ? '%' : 'VND'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Penalties */}
                        {program.penalties.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2 text-destructive">
                              <AlertTriangle className="w-4 h-4" />
                              Hình phạt ({program.penalties.length} tiêu chí)
                            </h4>
                            <div className="grid gap-2 pl-6">
                              {program.penalties.slice(0, 2).map(penalty => (
                                <div key={penalty.id} className="flex items-center justify-between text-sm">
                                  <span>{penalty.name}</span>
                                  <span className="font-medium text-destructive">
                                    {penalty.type === 'warning' ? 'Cảnh cáo' : `${penalty.value.toLocaleString('vi-VN')} VND`}
                                  </span>
                                </div>
                              ))}
                              {program.penalties.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{program.penalties.length - 2} hình phạt khác
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <RewardProgramDetailModal
                          program={program}
                          onEdit={handleEditRewardProgram}
                          onDelete={handleDeleteRewardProgram}
                        >
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => console.log('Details button clicked for program:', program)}
                          >
                            <Eye className="w-4 h-4" />
                            Chi tiết
                          </Button>
                        </RewardProgramDetailModal>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            console.log('Config button clicked for program:', program);
                            handleEditRewardProgram(program);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Cog className="w-4 h-4" />
                          Cấu hình
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit KPI Dialog */}
      <Dialog open={isEditKpiDialogOpen} onOpenChange={(open) => {
        console.log('Edit KPI Dialog onOpenChange:', open);
        setIsEditKpiDialogOpen(open);
        if (!open) {
          setEditingKpi(null);
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sửa KPI: {editingKpi?.name}</DialogTitle>
          </DialogHeader>
          <div>
            <p>Dialog is open: {isEditKpiDialogOpen ? 'Yes' : 'No'}</p>
            <p>Editing KPI: {editingKpi ? editingKpi.name : 'None'}</p>
          </div>
          {editingKpi && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="edit-kpi-name">Tên KPI *</Label>
                  <Input
                    id="edit-kpi-name"
                    defaultValue={editingKpi.name}
                    placeholder="Ví dụ: Doanh số bán hàng"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-kpi-category">Danh mục</Label>
                  <Input
                    id="edit-kpi-category"
                    defaultValue={editingKpi.category || ''}
                    placeholder="Ví dụ: Kinh doanh"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-kpi-desc">Mô tả *</Label>
                <Textarea
                  id="edit-kpi-desc"
                  defaultValue={editingKpi.description}
                  placeholder="Mô tả chi tiết về KPI này..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="edit-kpi-unit">Đơn vị</Label>
                  <Input
                    id="edit-kpi-unit"
                    defaultValue={editingKpi.unit}
                    placeholder="VND, %, Lần..."
                  />
                </div>
                <div>
                  <Label htmlFor="edit-kpi-target">Chỉ tiêu</Label>
                  <Input
                    id="edit-kpi-target"
                    type="number"
                    defaultValue={editingKpi.target}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-kpi-weight">Trọng số</Label>
                  <Input
                    id="edit-kpi-weight"
                    type="number"
                    step="0.1"
                    defaultValue={editingKpi.weight || 1}
                    placeholder="1.0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-kpi-frequency">Tần suất đo</Label>
                <Select defaultValue={editingKpi.frequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Hàng ngày</SelectItem>
                    <SelectItem value="weekly">Hàng tuần</SelectItem>
                    <SelectItem value="monthly">Hàng tháng</SelectItem>
                    <SelectItem value="quarterly">Hàng quý</SelectItem>
                    <SelectItem value="yearly">Hàng năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-kpi-formula">Công thức tính</Label>
                <Textarea
                  id="edit-kpi-formula"
                  defaultValue={editingKpi.formula || ''}
                  placeholder="Ví dụ: (Doanh thu thực tế / Doanh thu kế hoạch) * 100"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    toast({
                      title: t.common.success,
                      description: t.setup.kpiUpdated,
                    });
                    handleCloseEditKpiDialog();
                  }}
                  className="flex-1 btn-gradient"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Cập nhật KPI
                </Button>
                <Button variant="outline" onClick={handleCloseEditKpiDialog}>
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Phân quyền KPI: {editingKpi?.name}</DialogTitle>
          </DialogHeader>
          {editingKpi && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chức năng phân quyền KPI</h3>
                <p className="text-muted-foreground mb-4">
                  Chức năng này sẽ được tích hợp với hệ thống phân quyền chi tiết
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Quản lý quyền xem KPI cho từng nhân viên</p>
                  <p>• Thiết lập quyền chỉnh sửa KPI</p>
                  <p>• Phân quyền báo cáo và đánh giá</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    toast({
                      title: "Thông báo",
                      description: "Chức năng phân quyền đang được phát triển",
                    });
                    handleClosePermissionsDialog();
                  }}
                  className="flex-1 btn-gradient"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Quản lý phân quyền
                </Button>
                <Button variant="outline" onClick={handleClosePermissionsDialog}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Reward Program Dialog */}
      <Dialog open={isEditRewardDialogOpen} onOpenChange={setIsEditRewardDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chương trình thưởng</DialogTitle>
          </DialogHeader>
          {editingRewardProgram && (
            <EditRewardProgramForm
              program={editingRewardProgram}
              onSave={handleSaveRewardProgram}
              onCancel={handleCloseEditRewardDialog}
              isOpen={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      {isEditDepartmentDialogOpen && editingDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
            console.log('Backdrop clicked');
            setIsEditDepartmentDialogOpen(false);
            setEditingDepartment(null);
          }} />
          <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Chỉnh sửa phòng ban</h2>
            <EditDepartmentForm
              key={editingDepartment.id}
              department={editingDepartment}
              onClose={() => {
                console.log('Edit form onClose called');
                setIsEditDepartmentDialogOpen(false);
                setEditingDepartment(null);
              }}
              onSuccess={() => {
                console.log('Edit form onSuccess called');
                setIsEditDepartmentDialogOpen(false);
                setEditingDepartment(null);
                // Data will be refreshed automatically by DataContext
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
