'use client';
import { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Users,
  Settings,
  Shield,
  Calendar,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

interface InitStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  estimatedTime: string;
  dependencies: string[];
}

export default function InitPoliciesComponent() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isInitializing, setIsInitializing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [initSteps, setInitSteps] = useState<InitStep[]>([
    {
      id: '1',
      name: 'Company Information Setup',
      description: 'Initialize company profile, logo, and basic information',
      status: 'pending',
      progress: 0,
      estimatedTime: '2 minutes',
      dependencies: []
    },
    {
      id: '2',
      name: 'Department Structure',
      description: 'Create default departments and organizational structure',
      status: 'pending',
      progress: 0,
      estimatedTime: '3 minutes',
      dependencies: ['1']
    },
    {
      id: '3',
      name: 'User Roles & Permissions',
      description: 'Set up user roles, permissions, and access levels',
      status: 'pending',
      progress: 0,
      estimatedTime: '2 minutes',
      dependencies: ['2']
    },
    {
      id: '4',
      name: 'KPI Templates',
      description: 'Initialize default KPI templates and categories',
      status: 'pending',
      progress: 0,
      estimatedTime: '5 minutes',
      dependencies: ['3']
    },
    {
      id: '5',
      name: 'Reward Programs',
      description: 'Set up default reward programs and criteria',
      status: 'pending',
      progress: 0,
      estimatedTime: '4 minutes',
      dependencies: ['4']
    },
    {
      id: '6',
      name: 'System Policies',
      description: 'Initialize company policies and procedures',
      status: 'pending',
      progress: 0,
      estimatedTime: '3 minutes',
      dependencies: ['5']
    },
    {
      id: '7',
      name: 'Email Templates',
      description: 'Set up email templates for notifications',
      status: 'pending',
      progress: 0,
      estimatedTime: '2 minutes',
      dependencies: ['6']
    },
    {
      id: '8',
      name: 'Backup Configuration',
      description: 'Configure automatic backup settings',
      status: 'pending',
      progress: 0,
      estimatedTime: '1 minute',
      dependencies: ['7']
    }
  ]);

  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    industry: '',
    size: '',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    currency: 'VND'
  });

  const [systemSettings, setSystemSettings] = useState({
    enableNotifications: true,
    enableBackup: true,
    enableAuditLog: true,
    enableTwoFactor: false,
    sessionTimeout: 30,
    maxFileSize: 10
  });

  const handleInitializeSystem = async () => {
    setIsInitializing(true);
    
    try {
      for (const step of initSteps) {
        setCurrentStep(step.id);
        
        // Update step status to running
        setInitSteps(prev => prev.map(s => 
          s.id === step.id ? { ...s, status: 'running', progress: 0 } : s
        ));

        // Simulate step execution with progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setInitSteps(prev => prev.map(s => 
            s.id === step.id ? { ...s, progress } : s
          ));
        }

        // Mark step as completed
        setInitSteps(prev => prev.map(s => 
          s.id === step.id ? { ...s, status: 'completed', progress: 100 } : s
        ));
      }

      setCurrentStep(null);
      
      toast({
        title: "Success",
        description: "System initialization completed successfully",
      });
    } catch (error) {
      console.error('Error during initialization:', error);
      toast({
        title: "Error",
        description: "System initialization failed",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleResetSteps = () => {
    setInitSteps(prev => prev.map(step => ({
      ...step,
      status: 'pending',
      progress: 0
    })));
    setCurrentStep(null);
    
    toast({
      title: "Reset Complete",
      description: "Initialization steps have been reset",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'running': return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedSteps = initSteps.filter(step => step.status === 'completed').length;
  const totalSteps = initSteps.length;
  const overallProgress = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Initialize Policies & System
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Set up your company policies and system configuration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleResetSteps}
            variant="outline"
            disabled={isInitializing}
            className="flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            Reset
          </Button>
          <Button 
            onClick={handleInitializeSystem}
            disabled={isInitializing}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isInitializing ? 'Initializing...' : 'Start Initialization'}
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Initialization Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedSteps}/{totalSteps} steps completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {overallProgress.toFixed(1)}% complete
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select value={companyInfo.industry} onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="company-size">Company Size</Label>
              <Select value={companyInfo.size} onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, size: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={companyInfo.timezone} onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</SelectItem>
                  <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
                  <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={companyInfo.currency} onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VND">VND (Vietnamese Dong)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="THB">THB (Thai Baht)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email and push notifications</p>
              </div>
              <Switch
                id="enable-notifications"
                checked={systemSettings.enableNotifications}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableNotifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-backup">Enable Auto Backup</Label>
                <p className="text-sm text-muted-foreground">Automatically backup system data</p>
              </div>
              <Switch
                id="enable-backup"
                checked={systemSettings.enableBackup}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableBackup: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-audit">Enable Audit Log</Label>
                <p className="text-sm text-muted-foreground">Track system activities</p>
              </div>
              <Switch
                id="enable-audit"
                checked={systemSettings.enableAuditLog}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableAuditLog: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-2fa">Enable Two-Factor Auth</Label>
                <p className="text-sm text-muted-foreground">Enhanced security for user accounts</p>
              </div>
              <Switch
                id="enable-2fa"
                checked={systemSettings.enableTwoFactor}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableTwoFactor: checked }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={systemSettings.sessionTimeout}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                min="5"
                max="480"
              />
            </div>
            <div>
              <Label htmlFor="max-file-size">Max File Size (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                value={systemSettings.maxFileSize}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                min="1"
                max="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Initialization Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Initialization Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {initSteps.map((step, index) => (
              <div key={step.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{step.name}</h3>
                        <Badge className={getStatusColor(step.status)}>
                          {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {step.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{step.estimatedTime}</span>
                        </div>
                        {step.dependencies.length > 0 && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Depends on: {step.dependencies.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium mb-1">
                      {step.progress}%
                    </div>
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'running' ? 'bg-blue-500' :
                          step.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Configuration
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import Configuration
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Validate Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
