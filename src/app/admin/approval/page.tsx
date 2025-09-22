'use client';
import { useContext, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Download,
  FileText,
  User,
  Building2,
  Calendar,
  Target,
  Clock,
  Filter,
  Search
} from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ReportSubmission {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  kpiId: string;
  kpiName: string;
  title: string;
  description: string;
  period: string;
  actualValue: number;
  targetValue: number;
  unit: string;
  files: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  status: 'submitted' | 'approved' | 'rejected' | 'needs_revision';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  feedback?: string;
  priority: 'high' | 'medium' | 'low';
}

export default function AdminApprovalPage() {
  const { reports, employees, departments, kpis, approveReport, rejectReport, requestReportRevision } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [selectedReport, setSelectedReport] = useState<ReportSubmission | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false);
  
  const [feedback, setFeedback] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [revisionRequest, setRevisionRequest] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Get reports for approval
  const reportsForApproval = useMemo(() => {
    return reports
      .filter(report => report.status === 'submitted')
      .map(report => {
        const employee = employees.find(e => e.uid === report.employeeId);
        const department = departments.find(d => d.id === employee?.departmentId);
        const kpi = kpis.find(k => k.id === report.kpiId);
        
        return {
          id: report.id,
          employeeId: report.employeeId,
          employeeName: employee?.name || 'Unknown',
          department: department?.name || 'Unknown',
          kpiId: report.kpiId,
          kpiName: kpi?.name || 'Unknown KPI',
          title: report.title,
          description: report.description,
          period: report.period,
          actualValue: report.actualValue,
          targetValue: report.targetValue,
          unit: report.unit,
          files: report.files || [],
          status: report.status as 'submitted' | 'approved' | 'rejected' | 'needs_revision',
          submittedAt: report.submittedAt || '',
          reviewedAt: report.reviewedAt,
          reviewedBy: report.reviewedBy,
          feedback: report.feedback,
          priority: 'medium' as const // Default priority
        };
      });
  }, [reports, employees, departments, kpis]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reportsForApproval.filter(report => {
      const matchesSearch = 
        report.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.kpiName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [reportsForApproval, searchTerm, statusFilter, priorityFilter]);

  const handleViewDetails = (report: ReportSubmission) => {
    setSelectedReport(report);
    setIsDetailDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedReport) return;
    
    try {
      await approveReport(selectedReport.id, feedback);
      toast({
        title: t.admin.successApproved as string,
        description: t.admin.reportApprovedSuccess.replace('{title}', selectedReport.title) as string,
      });
      setIsApproveDialogOpen(false);
      setIsDetailDialogOpen(false);
      setFeedback('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.admin.cannotApproveReport as string,
      });
    }
  };

  const handleReject = async () => {
    if (!selectedReport || !rejectReason.trim()) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.admin.pleaseEnterRejectReason as string,
      });
      return;
    }
    
    try {
      await rejectReport(selectedReport.id, rejectReason);
      toast({
        title: t.admin.successRejected as string,
        description: t.admin.reportRejectedSuccess.replace('{title}', selectedReport.title) as string,
      });
      setIsRejectDialogOpen(false);
      setIsDetailDialogOpen(false);
      setRejectReason('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.admin.cannotRejectReport as string,
      });
    }
  };

  const handleRequestRevision = async () => {
    if (!selectedReport || !revisionRequest.trim()) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.admin.pleaseEnterRevisionRequest as string,
      });
      return;
    }
    
    try {
      await requestReportRevision(selectedReport.id, revisionRequest);
      toast({
        title: t.admin.successRequestSent as string,
        description: t.admin.revisionRequestSent.replace('{title}', selectedReport.title) as string,
      });
      setIsRevisionDialogOpen(false);
      setIsDetailDialogOpen(false);
      setRevisionRequest('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.admin.cannotSendRevisionRequest as string,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />{t.admin.awaitingApproval}</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />{t.admin.approved}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />{t.admin.rejected}</Badge>;
      case 'needs_revision':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />{t.admin.needsRevision}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">{t.admin.high}</Badge>;
      case 'medium':
        return <Badge variant="secondary">{t.admin.medium}</Badge>;
      case 'low':
        return <Badge variant="outline">{t.admin.low}</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return `0 ${t.admin.bytes}`;
    const k = 1024;
    const sizes = [t.admin.bytes, t.admin.kb, t.admin.mb, t.admin.gb];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {reportsForApproval.length}
            </div>
            <p className="text-xs text-muted-foreground">{t.admin.awaitingApproval}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.admin.approved}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">
              {reports.filter(r => r.status === 'rejected').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.admin.rejected}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">
              {reports.filter(r => r.status === 'needs_revision').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.admin.needsRevision}</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t.admin.reportsList} ({filteredReports.length})
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t.admin.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t.departments.status as string} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.admin.allStatuses}</SelectItem>
                  <SelectItem value="submitted">{t.admin.awaitingApproval}</SelectItem>
                  <SelectItem value="approved">{t.admin.approved}</SelectItem>
                  <SelectItem value="rejected">{t.admin.rejected}</SelectItem>
                  <SelectItem value="needs_revision">{t.admin.needsRevision}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t.admin.priority} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.admin.allPriorities}</SelectItem>
                  <SelectItem value="high">{t.admin.high}</SelectItem>
                  <SelectItem value="medium">{t.admin.medium}</SelectItem>
                  <SelectItem value="low">{t.admin.low}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.admin.noReportsMessage}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.employee}</TableHead>
                  <TableHead>KPI</TableHead>
                  <TableHead>{t.admin.reportTitle}</TableHead>
                  <TableHead>{t.admin.reportPeriod}</TableHead>
                  <TableHead>{t.admin.status}</TableHead>
                  <TableHead>{t.admin.priority}</TableHead>
                  <TableHead>{t.admin.submittedAt}</TableHead>
                  <TableHead>{t.admin.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{report.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{report.department}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{report.kpiName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{report.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{report.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{report.period}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(report.submittedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(report)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.admin.reportDetails}</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Report Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t.admin.reportInfo}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">{t.admin.reportTitle}</Label>
                      <p className="text-sm">{selectedReport.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">{t.admin.description}</Label>
                      <p className="text-sm">{selectedReport.description}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">{t.admin.reportPeriod}</Label>
                      <p className="text-sm">{selectedReport.period}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">{t.admin.status}</Label>
                      <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t.admin.kpiInfo}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Tên KPI</Label>
                      <p className="text-sm">{selectedReport.kpiName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">{t.admin.target}</Label>
                      <p className="text-sm">{selectedReport.targetValue} {selectedReport.unit}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">{t.admin.actual}</Label>
                      <p className="text-sm">{selectedReport.actualValue} {selectedReport.unit}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">{t.admin.completionRate}</Label>
                      <p className="text-sm">
                        {((selectedReport.actualValue / selectedReport.targetValue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Employee Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.admin.employeeInfo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedReport.employeeName}</p>
                      <p className="text-sm text-muted-foreground">{selectedReport.department}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Files */}
              {selectedReport.files.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t.admin.attachedFiles}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedReport.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {t.admin.downloadFile}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              {selectedReport.status === 'submitted' && (
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      setIsRevisionDialogOpen(true);
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {t.admin.requestRevision}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      setIsRejectDialogOpen(true);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {t.admin.reject}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      setIsApproveDialogOpen(true);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t.admin.approve}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.approveReport}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">{t.admin.feedbackOptional}</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t.admin.feedbackPlaceholder}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                {t.admin.cancel}
              </Button>
              <Button onClick={handleApprove}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t.admin.approve}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.rejectReport}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">{t.admin.rejectReason} *</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t.admin.rejectReasonPlaceholder}
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                {t.admin.cancel}
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                <XCircle className="w-4 h-4 mr-2" />
                {t.admin.reject}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revision Dialog */}
      <Dialog open={isRevisionDialogOpen} onOpenChange={setIsRevisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.requestRevision}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="revisionRequest">{t.admin.revisionRequest} *</Label>
              <Textarea
                id="revisionRequest"
                value={revisionRequest}
                onChange={(e) => setRevisionRequest(e.target.value)}
                placeholder={t.admin.revisionRequestPlaceholder}
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRevisionDialogOpen(false)}>
                {t.admin.cancel}
              </Button>
              <Button onClick={handleRequestRevision}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                {t.admin.sendRequest}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
