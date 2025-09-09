'use client';
import { useContext, useState } from 'react';
import { 
  FileCheck, 
  Eye, 
  Download, 
  CheckCircle2, 
  XCircle, 
  MessageCircle, 
  Clock,
  Filter,
  Search,
  User,
  Calendar,
  AlertTriangle
} from 'lucide-react';
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
import { DataContext } from '@/context/data-context';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

interface ReportSubmission {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  kpiId: string;
  kpiName: string;
  reportType: 'monthly' | 'quarterly' | 'yearly';
  period: string;
  title: string;
  description: string;
  files: { name: string; size: number; type: string; url: string }[];
  status: 'submitted' | 'approved' | 'rejected' | 'needs_revision';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  feedback?: string;
  priority: 'high' | 'medium' | 'low';
}

export default function ReportApprovalPage() {
  const { user } = useContext(AuthContext);
  const { employees, kpis, departments } = useContext(DataContext);
  const { toast } = useToast();
  
  const [selectedReport, setSelectedReport] = useState<ReportSubmission | null>(null);
  const [feedback, setFeedback] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for reports pending approval
  const [reports, setReports] = useState<ReportSubmission[]>([]);
  
  // TODO: Integrate with real report submission system
  // Reports will be populated from database when report submission feature is implemented

  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { 
            ...report, 
            status: 'approved' as const,
            reviewedAt: new Date(),
            reviewedBy: user?.name,
            feedback: feedback.trim() || undefined
          }
        : report
    ));
    
    toast({
      title: "Báo cáo đã được duyệt",
      description: "Nhân viên sẽ nhận được thông báo về việc duyệt báo cáo.",
    });
    
    setSelectedReport(null);
    setFeedback('');
  };

  const handleReject = (reportId: string) => {
    if (!feedback.trim()) {
      toast({
        title: "Cần có lý do từ chối",
        description: "Vui lòng nhập lý do từ chối báo cáo",
        variant: "destructive"
      });
      return;
    }

    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { 
            ...report, 
            status: 'rejected' as const,
            reviewedAt: new Date(),
            reviewedBy: user?.name,
            feedback: feedback.trim()
          }
        : report
    ));
    
    toast({
      title: "Báo cáo đã bị từ chối",
      description: "Nhân viên sẽ nhận được thông báo và lý do từ chối.",
    });
    
    setSelectedReport(null);
    setFeedback('');
  };

  const handleRequestRevision = (reportId: string) => {
    if (!feedback.trim()) {
      toast({
        title: "Cần có yêu cầu chỉnh sửa",
        description: "Vui lòng nhập yêu cầu chỉnh sửa cụ thể",
        variant: "destructive"
      });
      return;
    }

    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { 
            ...report, 
            status: 'needs_revision' as const,
            reviewedAt: new Date(),
            reviewedBy: user?.name,
            feedback: feedback.trim()
          }
        : report
    ));
    
    toast({
      title: "Đã yêu cầu chỉnh sửa",
      description: "Nhân viên sẽ nhận được yêu cầu chỉnh sửa chi tiết.",
    });
    
    setSelectedReport(null);
    setFeedback('');
  };

  const getStatusBadge = (status: ReportSubmission['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="badge-status-approved">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Đã duyệt
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="badge-status-rejected">
          <XCircle className="w-3 h-3 mr-1" />
          Từ chối
        </Badge>;
      case 'needs_revision':
        return <Badge variant="outline" className="badge-status-revision">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Cần chỉnh sửa
        </Badge>;
      case 'submitted':
        return <Badge variant="outline" className="badge-status-pending">
          <Clock className="w-3 h-3 mr-1" />
          Chờ duyệt
        </Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: ReportSubmission['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="badge-priority-high text-xs">Cao</Badge>;
      case 'medium':
        return <Badge variant="outline" className="badge-priority-medium text-xs">Trung bình</Badge>;
      case 'low':
        return <Badge variant="outline" className="badge-priority-low text-xs">Thấp</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pendingCount = reports.filter(r => r.status === 'submitted').length;
  const approvedCount = reports.filter(r => r.status === 'approved').length;
  const rejectedCount = reports.filter(r => r.status === 'rejected').length;

  return (
    <div className="h-full p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Duyệt báo cáo KPI</h1>
          <p className="text-muted-foreground">
            Xem xét và duyệt báo cáo từ nhân viên
          </p>
        </div>
        <div className="flex gap-4">
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pendingCount}</div>
              <div className="text-xs text-muted-foreground">Chờ duyệt</div>
            </div>
          </Card>
          <Card className="p-4 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedCount}</div>
              <div className="text-xs text-muted-foreground">Đã duyệt</div>
            </div>
          </Card>
          <Card className="p-4 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{rejectedCount}</div>
              <div className="text-xs text-muted-foreground">Từ chối</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề hoặc tên nhân viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="submitted">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
                <SelectItem value="needs_revision">Cần chỉnh sửa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="grid gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className={`transition-all hover:shadow-md ${report.status === 'submitted' ? 'border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-900/20' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{report.title}</h3>
                    {getStatusBadge(report.status)}
                    {getPriorityBadge(report.priority)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {report.employeeName} - {report.department}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Kỳ: {report.period}
                    </div>
                    <div>KPI: {report.kpiName}</div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                  
                  {/* Files */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {report.files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs bg-muted px-2 py-1 rounded">
                        <FileCheck className="w-3 h-3" />
                        {file.name} ({formatFileSize(file.size)})
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Nộp lúc: {report.submittedAt.toLocaleString('vi-VN')}
                    {report.reviewedAt && (
                      <span> • Duyệt lúc: {report.reviewedAt.toLocaleString('vi-VN')} bởi {report.reviewedBy}</span>
                    )}
                  </div>

                  {report.feedback && (
                    <Alert className="mt-3">
                      <MessageCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Phản hồi:</strong> {report.feedback}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Xem chi tiết
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Chi tiết báo cáo</DialogTitle>
                      </DialogHeader>
                      {selectedReport && (
                        <div className="space-y-6">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <Label className="text-sm font-medium">Nhân viên</Label>
                              <p className="text-sm">{selectedReport.employeeName}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Phòng ban</Label>
                              <p className="text-sm">{selectedReport.department}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">KPI liên quan</Label>
                              <p className="text-sm">{selectedReport.kpiName}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Kỳ báo cáo</Label>
                              <p className="text-sm">{selectedReport.period}</p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Mô tả</Label>
                            <p className="text-sm mt-1">{selectedReport.description}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">File đính kèm</Label>
                            <div className="mt-2 space-y-2">
                              {selectedReport.files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded">
                                  <div className="flex items-center gap-2">
                                    <FileCheck className="w-4 h-4" />
                                    <span className="text-sm">{file.name}</span>
                                    <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-4 h-4 mr-1" />
                                      Xem
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Download className="w-4 h-4 mr-1" />
                                      Tải
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {selectedReport.status === 'submitted' && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="feedback">Phản hồi (tùy chọn)</Label>
                                <Textarea
                                  id="feedback"
                                  placeholder="Nhập phản hồi hoặc yêu cầu chỉnh sửa..."
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  className="min-h-[100px]"
                                />
                              </div>
                              
                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleApprove(selectedReport.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Duyệt
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handleRequestRevision(selectedReport.id)}
                                >
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Yêu cầu chỉnh sửa
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleReject(selectedReport.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Từ chối
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Không có báo cáo nào</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== 'all' 
                ? 'Không tìm thấy báo cáo phù hợp với bộ lọc'
                : 'Chưa có báo cáo nào được nộp'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
