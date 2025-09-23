'use client';
import { useContext, useState } from 'react';
import { 
  FileText, 
  Upload, 
  Calendar, 
  Target,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  FileCheck,
  User,
  Building2
} from 'lucide-react';
import FileUpload from '@/components/file-upload';
import { type UploadedFile } from '@/lib/file-upload-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { format } from 'date-fns';

interface EmployeeReport {
  id: string;
  kpiId: string;
  kpiName: string;
  title: string;
  description: string;
  type: 'monthly' | 'quarterly' | 'special';
  period: string;
  actualValue: number;
  targetValue: number;
  unit: string;
  files: UploadedFile[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'needs_revision';
  submittedAt?: Date;
  reviewedAt?: Date;
  feedback?: string;
  score?: number;
}

export default function EmployeeReportsPage() {
  const { user } = useContext(AuthContext);
  const { kpis, kpiRecords, reports, createReport, updateReport, deleteReport, submitReportForApproval } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<EmployeeReport | null>(null);
  const [newReport, setNewReport] = useState({
    kpiId: '',
    title: '',
    description: '',
    type: 'monthly' as const,
    period: format(new Date(), 'yyyy-MM'),
    actualValue: '',
    files: [] as UploadedFile[]
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Get user's reports from database
  const userReports = reports.filter(report => report.employeeId === user?.uid);
  
  // Convert database reports to EmployeeReport format for UI compatibility
  const employeeReports: EmployeeReport[] = userReports.map(report => ({
    id: report.id,
    kpiId: report.kpiId,
    kpiName: kpis.find(k => k.id === report.kpiId)?.name || 'Unknown KPI',
    title: report.title,
    description: report.description,
    type: report.type,
    period: report.period,
    actualValue: report.actualValue,
    targetValue: report.targetValue,
    unit: report.unit,
    files: report.files.map(file => ({
      id: file.id,
      name: file.name,
      url: file.url,
      size: file.size,
      type: file.type
    })),
    status: report.status,
    submittedAt: report.submittedAt ? new Date(report.submittedAt) : undefined,
    reviewedAt: report.reviewedAt ? new Date(report.reviewedAt) : undefined,
    feedback: report.feedback,
    score: report.score
  }));

  // Get user's KPIs
  const userKpis = kpiRecords.filter(record => record.employeeId === user?.uid);

  const handleCreateReport = async () => {
    if (!newReport.kpiId || !newReport.title.trim() || !newReport.description.trim()) {
      toast({
        title: t.employeeReports.missingInfo,
        description: t.employeeReports.fillAllFields,
        variant: "destructive"
      });
      return;
    }

    const selectedKpi = kpiRecords.find(r => r.id === newReport.kpiId);
    const kpiDetail = kpis.find(k => k.id === selectedKpi?.kpiId);
    
    try {
      const reportData = {
        employeeId: user?.uid || '',
        kpiId: selectedKpi?.kpiId || '',
        kpiRecordId: selectedKpi?.id || '',
        title: newReport.title,
        description: newReport.description,
        type: newReport.type,
        period: newReport.period,
        actualValue: parseFloat(newReport.actualValue) || 0,
        targetValue: selectedKpi?.target || 0,
        unit: kpiDetail?.unit || '',
        files: newReport.files.map(file => ({
          id: file.id,
          name: file.name,
          url: file.url,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user?.uid || ''
        })),
        status: 'draft' as const
      };

      await createReport(reportData);
      
      setNewReport({
        kpiId: '',
        title: '',
        description: '',
        type: 'monthly',
        period: format(new Date(), 'yyyy-MM'),
        actualValue: '',
        files: []
      });
      setUploadedFiles([]);
      setIsCreateDialogOpen(false);
      
      toast({
        title: t.employeeReports.createSuccess,
        description: t.employeeReports.draftSaved,
      });
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: t.common.error as string,
        description: t.employeeReports.cannotCreate,
        variant: "destructive"
      });
    }
  };

  const handleSubmitReport = async (reportId: string) => {
    try {
      await submitReportForApproval(reportId);
      toast({
        title: t.employeeReports.submitSuccess,
        description: t.employeeReports.submitDescription,
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: t.common.error as string,
        description: t.employeeReports.cannotSubmit,
        variant: "destructive"
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteReport(reportId);
      toast({
        title: t.employeeReports.deleteSuccess,
        description: t.employeeReports.deleteDescription,
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: t.common.error as string,
        description: t.employeeReports.cannotDelete,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: EmployeeReport['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />{t.employeeReports.approved}</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />{t.employeeReports.pendingApproval}</Badge>;
      case 'needs_revision':
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />{t.employeeReports.needsRevision}</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{t.common.rejected}</Badge>;
      default:
        return <Badge variant="outline">{t.common.draft}</Badge>;
    }
  };

  const getTypeBadge = (type: EmployeeReport['type']) => {
    switch (type) {
      case 'monthly':
        return <Badge variant="outline" className="text-xs">{t.employeeReports.monthlyReport}</Badge>;
      case 'quarterly':
        return <Badge variant="outline" className="text-xs">{t.employeeReports.quarterlyReport}</Badge>;
      case 'special':
        return <Badge variant="outline" className="text-xs">{t.employeeReports.specialReport}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'VND') {
      return value.toLocaleString('vi-VN') + 'đ';
    }
    return value.toLocaleString('vi-VN') + ' ' + unit;
  };

  const pendingReports = employeeReports.filter(r => r.status === 'submitted').length;
  const approvedReports = employeeReports.filter(r => r.status === 'approved').length;
  const needsRevisionReports = employeeReports.filter(r => r.status === 'needs_revision').length;

  return (
    <div className="h-full p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.employeeReports.title}</h1>
          <p className="text-muted-foreground">
            {t.employeeReports.subtitle}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t.employeeReports.createNew}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.employeeReports.createNewTitle}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="kpi">{t.employeeReports.selectKpi}</Label>
                <Select value={newReport.kpiId} onValueChange={(value) => setNewReport(prev => ({ ...prev, kpiId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.employeeReports.selectKpiPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {userKpis.map(record => {
                      const kpiDetail = kpis.find(k => k.id === record.kpiId);
                      return (
                        <SelectItem key={record.id} value={record.id}>
                          {kpiDetail?.name} - {record.target} {kpiDetail?.unit}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="type">{t.employeeReports.reportType}</Label>
                  <Select value={newReport.type} onValueChange={(value: any) => setNewReport(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{t.employeeReports.monthly}</SelectItem>
                      <SelectItem value="quarterly">{t.employeeReports.quarterly}</SelectItem>
                      <SelectItem value="special">{t.employeeReports.special}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="period">{t.employeeReports.reportPeriod}</Label>
                  <Input
                    id="period"
                    type={newReport.type === 'monthly' ? 'month' : 'text'}
                    value={newReport.period}
                    onChange={(e) => setNewReport(prev => ({ ...prev, period: e.target.value }))}
                    placeholder={newReport.type === 'quarterly' ? t.employeeReports.quarterlyExample : ''}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title">{t.employeeReports.reportTitle}</Label>
                <Input
                  id="title"
                  value={newReport.title}
                  onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t.employeeReports.reportTitlePlaceholder}
                />
              </div>

              <div>
                <Label htmlFor="actualValue">{t.employeeReports.actualValue}</Label>
                <Input
                  id="actualValue"
                  type="number"
                  value={newReport.actualValue}
                  onChange={(e) => setNewReport(prev => ({ ...prev, actualValue: e.target.value }))}
                  placeholder={t.employeeReports.actualValuePlaceholder}
                />
              </div>

              <div>
                <Label htmlFor="description">{t.employeeReports.detailedDescription}</Label>
                <Textarea
                  id="description"
                  value={newReport.description}
                  onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t.employeeReports.descriptionPlaceholder}
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label>{t.employeeReports.attachedFiles}</Label>
                <FileUpload
                  path={`reports/${user?.uid || 'anonymous'}`}
                  onFilesUploaded={(files) => {
                    setUploadedFiles(files);
                    setNewReport(prev => ({ ...prev, files: [...prev.files, ...files] }));
                  }}
                  onFileRemoved={(fileUrl) => {
                    setUploadedFiles(prev => prev.filter(f => f.url !== fileUrl));
                    setNewReport(prev => ({ ...prev, files: prev.files.filter(f => f.url !== fileUrl) }));
                  }}
                  maxFiles={5}
                  maxSize={10 * 1024 * 1024} // 10MB
                  allowedTypes={[
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'text/plain'
                  ]}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleCreateReport} className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  {t.employeeReports.createReport}
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t.employeeReports.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.employeeReports.totalReports}</p>
                <p className="text-2xl font-bold">{employeeReports.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.employeeReports.approved}</p>
                <p className="text-2xl font-bold text-green-600">{approvedReports}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.employeeReports.pendingApproval}</p>
                <p className="text-2xl font-bold text-blue-600">{pendingReports}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.employeeReports.needsRevision}</p>
                <p className="text-2xl font-bold text-orange-600">{needsRevisionReports}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
            {needsRevisionReports > 0 && (
              <div className="mt-2 text-xs text-orange-600">
                {t.employeeReports.needsRevisionAlert}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">{t.employeeReports.allReports} ({employeeReports.length})</TabsTrigger>
          <TabsTrigger value="draft">{t.employeeReports.drafts} ({employeeReports.filter(r => r.status === 'draft').length})</TabsTrigger>
          <TabsTrigger value="submitted">{t.employeeReports.submitted} ({employeeReports.filter(r => r.status === 'submitted').length})</TabsTrigger>
          <TabsTrigger value="approved">{t.employeeReports.approvedReports} ({employeeReports.filter(r => r.status === 'approved').length})</TabsTrigger>
          <TabsTrigger value="needs_revision">{t.employeeReports.needsRevisionReports} ({employeeReports.filter(r => r.status === 'needs_revision').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {employeeReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{report.title}</h3>
                      {getStatusBadge(report.status)}
                      {getTypeBadge(report.type)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {report.kpiName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {t.employeeReports.period}: {report.period}
                      </div>
                      <div>
                        {t.employeeReports.result}: {formatValue(report.actualValue, report.unit)} / {formatValue(report.targetValue, report.unit)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                    
                    {/* Files */}
                    {report.files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {report.files.map((file) => (
                          <div key={file.id} className="flex items-center gap-2 text-xs bg-gray-100 px-2 py-1 rounded">
                            <FileCheck className="w-3 h-3" />
                            {file.name} ({formatFileSize(file.size)})
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      {report.submittedAt && (
                        <span>{t.employeeReports.submittedAt}: {report.submittedAt.toLocaleString('vi-VN')}</span>
                      )}
                      {report.reviewedAt && (
                        <span> • {t.employeeReports.reviewedAt}: {report.reviewedAt.toLocaleString('vi-VN')}</span>
                      )}
                      {report.score && (
                        <span> • {t.employeeReports.points}: {report.score}/10</span>
                      )}
                    </div>

                    {report.feedback && (
                      <Alert className="mt-3">
                        <FileCheck className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{t.employeeReports.managerFeedback}:</strong> {report.feedback}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                          <Eye className="w-4 h-4 mr-1" />
                          {t.employeeReports.viewReport}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{t.employeeReports.reportDetails}</DialogTitle>
                        </DialogHeader>
                        {selectedReport && (
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <Label className="text-sm font-medium">KPI</Label>
                                <p className="text-sm">{selectedReport.kpiName}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">{t.employeeReports.period}</Label>
                                <p className="text-sm">{selectedReport.period}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">{t.employeeReports.result}</Label>
                                <p className="text-sm">{formatValue(selectedReport.actualValue, selectedReport.unit)}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">{t.employeeReports.goal}</Label>
                                <p className="text-sm">{formatValue(selectedReport.targetValue, selectedReport.unit)}</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">{t.employeeReports.detailedDescription}</Label>
                              <p className="text-sm mt-1">{selectedReport.description}</p>
                            </div>

                            {selectedReport.files.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium">{t.employeeReports.attachedFiles}</Label>
                                <div className="mt-2 space-y-2">
                                  {selectedReport.files.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between p-3 border rounded">
                                      <div className="flex items-center gap-2">
                                        <FileCheck className="w-4 h-4" />
                                        <span className="text-sm">{file.name}</span>
                                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                                      </div>
                                      <Button variant="outline" size="sm">
                                        <Download className="w-4 h-4 mr-1" />
                                        {t.employeeReports.downloadFile}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {selectedReport.feedback && (
                              <div>
                                <Label className="text-sm font-medium">{t.employeeReports.managerFeedback}</Label>
                                <div className="mt-2 p-3 bg-gray-50 rounded">
                                  <p className="text-sm">{selectedReport.feedback}</p>
                                  {selectedReport.score && (
                                    <p className="text-sm font-medium mt-2">{t.employeeReports.score}: {selectedReport.score}/10</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {report.status === 'draft' && (
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSubmitReport(report.id)}>
                          <Upload className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteReport(report.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Other tabs with filtered content */}
        {['draft', 'submitted', 'approved', 'needs_revision'].map(status => (
          <TabsContent key={status} value={status} className="space-y-6">
            {employeeReports
              .filter(report => report.status === status)
              .map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {/* Same content as above but filtered */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{report.title}</h3>
                          {getStatusBadge(report.status)}
                          {getTypeBadge(report.type)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {report.kpiName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Kỳ: {report.period}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        ))}
      </Tabs>

      {employeeReports.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t.employeeReports.noReportsYet}</h3>
            <p className="text-muted-foreground mb-4">
              {t.employeeReports.startCreatingReports}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t.employeeReports.createNew}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}