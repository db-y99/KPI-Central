'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Mail, Play, Pause, Settings, Plus, Download, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { scheduledReportService, defaultReportTemplates, type ScheduledReport, type ReportExecution, type ReportTemplate } from '@/lib/scheduled-report-service';
import { useLanguage } from '@/context/language-context';

export function ScheduledReports() {
  const { t } = useLanguage();
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [reportExecutions, setReportExecutions] = useState<ReportExecution[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reports, executions, reportTemplates] = await Promise.all([
        scheduledReportService.getScheduledReports(),
        scheduledReportService.getReportExecutions(),
        scheduledReportService.getReportTemplates()
      ]);
      
      setScheduledReports(reports);
      setReportExecutions(executions);
      setTemplates(reportTemplates);
    } catch (error) {
      console.error('Error loading scheduled report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleReport = async (reportId: string, isActive: boolean) => {
    try {
      await scheduledReportService.updateScheduledReport(reportId, { isActive });
      setScheduledReports(prev => 
        prev.map(report => 
          report.id === reportId ? { ...report, isActive } : report
        )
      );
    } catch (error) {
      console.error('Error toggling scheduled report:', error);
    }
  };

  const handleExecuteReport = async (reportId: string) => {
    try {
      await scheduledReportService.executeReport(reportId);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error executing report:', error);
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'weekly':
        return 'bg-green-100 text-green-800';
      case 'monthly':
        return 'bg-yellow-100 text-yellow-800';
      case 'quarterly':
        return 'bg-orange-100 text-orange-800';
      case 'annually':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const activeReports = scheduledReports.filter(report => report.isActive);
  const totalExecutions = reportExecutions.length;
  const successfulExecutions = reportExecutions.filter(exec => exec.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scheduled Reports</h2>
          <p className="text-muted-foreground">
            Manage automated report generation and distribution
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Scheduled Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Scheduled Report</DialogTitle>
            </DialogHeader>
            <CreateScheduledReportForm 
              onClose={() => setIsCreateDialogOpen(false)}
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                loadData();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{scheduledReports.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Reports</p>
                <p className="text-2xl font-bold text-green-600">{activeReports.length}</p>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold text-purple-600">{totalExecutions}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0}%
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="executions">Execution History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Manage your automated report schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getFrequencyColor(report.frequency)}>
                          {report.frequency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(report.nextRun).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={report.isActive}
                            onCheckedChange={(checked) => handleToggleReport(report.id, checked)}
                          />
                          <span className="text-sm">
                            {report.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExecuteReport(report.id)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>
                View past report executions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportExecutions.map((execution) => (
                    <TableRow key={execution.id}>
                      <TableCell>
                        <div className="font-medium">
                          {scheduledReports.find(r => r.id === execution.reportId)?.name || 'Unknown Report'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.status)}
                          <Badge className={getStatusColor(execution.status)}>
                            {execution.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(execution.startedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {execution.completedAt ? 
                          `${Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)}s` :
                          'Running...'
                        }
                      </TableCell>
                      <TableCell>
                        {execution.result?.recordCount || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {execution.result?.fileUrl && (
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>
                Use predefined templates to create reports quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge variant="outline">{template.type}</Badge>
                        {template.isDefault && (
                          <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                        )}
                      </div>
                      <Button 
                        className="w-full mt-4"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Create Scheduled Report Form Component
function CreateScheduledReportForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'kpi_summary',
    frequency: 'weekly',
    schedule: {
      dayOfWeek: 1,
      hour: 9,
      minute: 0,
      timezone: 'Asia/Ho_Chi_Minh'
    },
    recipients: [] as string[],
    format: 'pdf',
    filters: {} as Record<string, any>,
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await scheduledReportService.createScheduledReport({
        ...formData,
        frequency: formData.frequency as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually',
        type: formData.type as 'kpi_summary' | 'employee_performance' | 'department_analysis' | 'reward_calculation' | 'custom',
        format: formData.format as 'email' | 'pdf' | 'excel' | 'csv',
        createdBy: 'current-user-id' // This would come from auth context
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating scheduled report:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Report Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Report Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kpi_summary">KPI Summary</SelectItem>
              <SelectItem value="employee_performance">Employee Performance</SelectItem>
              <SelectItem value="department_analysis">Department Analysis</SelectItem>
              <SelectItem value="reward_calculation">Reward Calculation</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="format">Format</Label>
          <Select
            value={formData.format}
            onValueChange={(value) => setFormData(prev => ({ ...prev, format: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="hour">Hour</Label>
          <Input
            id="hour"
            type="number"
            min="0"
            max="23"
            value={formData.schedule.hour}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              schedule: { ...prev.schedule, hour: Number(e.target.value) }
            }))}
          />
        </div>
        <div>
          <Label htmlFor="minute">Minute</Label>
          <Input
            id="minute"
            type="number"
            min="0"
            max="59"
            value={formData.schedule.minute}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              schedule: { ...prev.schedule, minute: Number(e.target.value) }
            }))}
          />
        </div>
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={formData.schedule.timezone}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              schedule: { ...prev.schedule, timezone: value }
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">America/New_York</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create Report
        </Button>
      </div>
    </form>
  );
}
