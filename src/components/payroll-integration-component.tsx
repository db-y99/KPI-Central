'use client';
import { useState, useContext, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CreditCard, 
  CheckCircle2,
  AlertTriangle,
  Settings,
  Upload,
  Download,
  RefreshCw,
  Link,
  Shield,
  Database,
  FileText,
  Users,
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { DataContext } from '@/context/data-context';

interface PayrollIntegration {
  isConnected: boolean;
  provider: string;
  apiKey: string;
  apiSecret: string;
  webhookUrl: string;
  syncEnabled: boolean;
  autoSync: boolean;
  syncInterval: number; // hours
  lastSync: string;
  totalEmployees: number;
  processedPayrolls: number;
  lastPayrollDate: string;
}

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  overtime: number;
  bonus: number;
  totalSalary: number;
  status: 'pending' | 'processed' | 'paid';
  payPeriod: string;
  processedDate: string;
}

export default function PayrollIntegrationComponent() {
  const { employees, departments } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [integration, setIntegration] = useState<PayrollIntegration>({
    isConnected: false,
    provider: '',
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    syncEnabled: true,
    autoSync: true,
    syncInterval: 24,
    lastSync: '',
    totalEmployees: 0,
    processedPayrolls: 0,
    lastPayrollDate: ''
  });

  const [credentials, setCredentials] = useState({
    provider: '',
    apiKey: '',
    apiSecret: '',
    webhookUrl: 'https://your-domain.com/webhook/payroll'
  });

  // Mock payroll records
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([
    {
      id: '1',
      employeeId: 'emp1',
      employeeName: 'Nguyen Van A',
      department: 'IT',
      basicSalary: 15000000,
      allowances: 2000000,
      deductions: 500000,
      overtime: 1000000,
      bonus: 3000000,
      totalSalary: 19000000,
      status: 'processed',
      payPeriod: '2024-01',
      processedDate: '2024-01-31'
    },
    {
      id: '2',
      employeeId: 'emp2',
      employeeName: 'Tran Thi B',
      department: 'Marketing',
      basicSalary: 12000000,
      allowances: 1500000,
      deductions: 400000,
      overtime: 800000,
      bonus: 2000000,
      totalSalary: 15900000,
      status: 'pending',
      payPeriod: '2024-01',
      processedDate: ''
    }
  ]);

  const handleConnectPayroll = async () => {
    setIsConnecting(true);
    try {
      // Simulate payroll system connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegration(prev => ({
        ...prev,
        isConnected: true,
        provider: credentials.provider,
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        webhookUrl: credentials.webhookUrl,
        lastSync: new Date().toISOString(),
        totalEmployees: employees.length,
        processedPayrolls: payrollRecords.length,
        lastPayrollDate: new Date().toISOString().split('T')[0]
      }));
      
      toast({
        title: "Success",
        description: "Payroll system connected successfully",
      });
    } catch (error) {
      console.error('Error connecting to payroll system:', error);
      toast({
        title: "Error",
        description: "Failed to connect to payroll system",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectPayroll = () => {
    setIntegration(prev => ({
      ...prev,
      isConnected: false,
      apiKey: '',
      apiSecret: '',
      webhookUrl: '',
      lastSync: '',
      totalEmployees: 0,
      processedPayrolls: 0,
      lastPayrollDate: ''
    }));
    
    toast({
      title: "Disconnected",
      description: "Payroll system has been disconnected",
    });
  };

  const handleSyncPayroll = async () => {
    setIsSyncing(true);
    try {
      // Simulate payroll sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setIntegration(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        totalEmployees: employees.length,
        processedPayrolls: payrollRecords.length
      }));
      
      toast({
        title: "Sync Complete",
        description: "Payroll data synchronized successfully",
      });
    } catch (error) {
      console.error('Error syncing payroll:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize payroll data",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleProcessPayroll = async () => {
    setIsProcessing(true);
    try {
      // Simulate payroll processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update pending records to processed
      setPayrollRecords(prev => prev.map(record => 
        record.status === 'pending' 
          ? { ...record, status: 'processed', processedDate: new Date().toISOString().split('T')[0] }
          : record
      ));
      
      toast({
        title: "Payroll Processed",
        description: "Payroll has been processed successfully",
      });
    } catch (error) {
      console.error('Error processing payroll:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process payroll",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Connection Test",
        description: "Payroll system connection is working properly",
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Unable to connect to payroll system",
        variant: "destructive",
      });
    }
  };

  const updateIntegration = (key: keyof PayrollIntegration, value: any) => {
    setIntegration(prev => ({ ...prev, [key]: value }));
  };

  const updateCredentials = (key: keyof typeof credentials, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSalary = payrollRecords.reduce((sum, record) => sum + record.totalSalary, 0);
    const pendingRecords = payrollRecords.filter(record => record.status === 'pending').length;
    const processedRecords = payrollRecords.filter(record => record.status === 'processed').length;
    const paidRecords = payrollRecords.filter(record => record.status === 'paid').length;

    return {
      totalSalary,
      pendingRecords,
      processedRecords,
      paidRecords
    };
  }, [payrollRecords]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Payroll Integration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Integrate with external payroll systems for automated salary processing
          </p>
        </div>
        <div className="flex items-center gap-2">
          {integration.isConnected && (
            <Button 
              onClick={handleTestConnection}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Test Connection
            </Button>
          )}
          {integration.isConnected ? (
            <Button 
              onClick={handleDisconnectPayroll}
              variant="outline"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Disconnect
            </Button>
          ) : (
            <Button 
              onClick={handleConnectPayroll}
              disabled={isConnecting || !credentials.provider || !credentials.apiKey}
              className="flex items-center gap-2"
            >
              <Link className="w-4 h-4" />
              {isConnecting ? 'Connecting...' : 'Connect Payroll System'}
            </Button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {integration.isConnected ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {integration.isConnected ? `Connected to ${integration.provider}` : 'Not Connected'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {integration.isConnected 
                    ? `Last sync: ${integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}`
                    : 'Configure credentials to connect'
                  }
                </p>
              </div>
            </div>
            <Badge variant={integration.isConnected ? "default" : "secondary"}>
              {integration.isConnected ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Statistics */}
      {integration.isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSalary)}</div>
              <p className="text-xs text-muted-foreground">Current period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingRecords}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.processedRecords}</div>
              <p className="text-xs text-muted-foreground">Ready for payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.paidRecords}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payroll System Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Payroll System Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider">Payroll Provider</Label>
              <Select value={credentials.provider} onValueChange={(value) => updateCredentials('provider', value)}>
                <SelectTrigger disabled={integration.isConnected}>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bamboo">BambooHR</SelectItem>
                  <SelectItem value="workday">Workday</SelectItem>
                  <SelectItem value="adp">ADP</SelectItem>
                  <SelectItem value="paychex">Paychex</SelectItem>
                  <SelectItem value="custom">Custom API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                value={credentials.apiKey}
                onChange={(e) => updateCredentials('apiKey', e.target.value)}
                placeholder="Enter API Key"
                disabled={integration.isConnected}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="api-secret">API Secret</Label>
              <Input
                id="api-secret"
                type="password"
                value={credentials.apiSecret}
                onChange={(e) => updateCredentials('apiSecret', e.target.value)}
                placeholder="Enter API Secret"
                disabled={integration.isConnected}
              />
            </div>
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                value={credentials.webhookUrl}
                onChange={(e) => updateCredentials('webhookUrl', e.target.value)}
                placeholder="Enter webhook URL"
                disabled={integration.isConnected}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Synchronization Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sync-enabled">Enable Synchronization</Label>
              <p className="text-sm text-muted-foreground">Allow data sync with payroll system</p>
            </div>
            <Switch
              id="sync-enabled"
              checked={integration.syncEnabled}
              onCheckedChange={(checked) => updateIntegration('syncEnabled', checked)}
              disabled={!integration.isConnected}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-sync">Auto Synchronization</Label>
              <p className="text-sm text-muted-foreground">Automatically sync data at intervals</p>
            </div>
            <Switch
              id="auto-sync"
              checked={integration.autoSync}
              onCheckedChange={(checked) => updateIntegration('autoSync', checked)}
              disabled={!integration.isConnected || !integration.syncEnabled}
            />
          </div>
          
          <div>
            <Label htmlFor="sync-interval">Sync Interval (hours)</Label>
            <Input
              id="sync-interval"
              type="number"
              value={integration.syncInterval}
              onChange={(e) => updateIntegration('syncInterval', parseInt(e.target.value))}
              min="1"
              max="168"
              disabled={!integration.isConnected || !integration.syncEnabled || !integration.autoSync}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSyncPayroll}
              disabled={!integration.isConnected || !integration.syncEnabled || isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
            <Button 
              onClick={handleProcessPayroll}
              disabled={!integration.isConnected || isProcessing}
              className="flex items-center gap-2"
            >
              <Settings className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Processing...' : 'Process Payroll'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Records */}
      {integration.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Payroll Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Total Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pay Period</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{record.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.department}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(record.basicSalary)}</TableCell>
                    <TableCell>{formatCurrency(record.allowances)}</TableCell>
                    <TableCell>{formatCurrency(record.deductions)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(record.totalSalary)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span>{record.payPeriod}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* File Management */}
      {integration.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              File Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Payroll Data
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Reports
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Employee Sync
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
