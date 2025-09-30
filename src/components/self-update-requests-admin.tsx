'use client';
import { useContext, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
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
  Clock,
  Eye,
  FileText,
  Download,
  AlertTriangle,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { AuthContext } from '@/context/auth-context';

export default function SelfUpdateRequestsAdminComponent() {
  const { selfUpdateRequests, employees, kpis, kpiRecords, approveSelfUpdateRequest, rejectSelfUpdateRequest } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Enrich self update requests with employee and KPI data
  const enrichedRequests = useMemo(() => {
    return selfUpdateRequests.map(request => {
      const employee = employees.find(emp =>
        emp.uid === request.employeeId ||
        emp.id === request.employeeId ||
        emp.documentId === request.employeeId
      );
      const kpiRecord = kpiRecords.find(kr => kr.id === request.kpiRecordId);
      const kpi = kpiRecord ? kpis.find(k =>
        k.id === kpiRecord.kpiId ||
        k.documentId === kpiRecord.kpiId
      ) : null;

      return {
        ...request,
        employeeName: employee?.name || 'Unknown',
        employeePosition: employee?.position || '',
        kpiName: kpi?.name || 'Unknown',
        kpiUnit: kpi?.unit || '',
        currentProgress: kpiRecord ? (kpiRecord.target > 0 ? ((kpiRecord.actual || 0) / kpiRecord.target * 100) : 0) : 0,
        newProgress: kpiRecord ? (kpiRecord.target > 0 ? (request.newValue / kpiRecord.target * 100) : 0) : 0,
      };
    });
  }, [selfUpdateRequests, employees, kpis, kpiRecords]);

  // Filter requests by status
  const pendingRequests = enrichedRequests.filter(r => r.status === 'not_started');
  const approvedRequests = enrichedRequests.filter(r => r.status === 'approved');
  const rejectedRequests = enrichedRequests.filter(r => r.status === 'rejected');

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setFeedback('');
    setIsDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      await approveSelfUpdateRequest(selectedRequest.id, feedback || undefined);

      toast({
        title: t.common.success,
        description: 'Đã duyệt yêu cầu cập nhật KPI',
      });

      setIsDialogOpen(false);
      setSelectedRequest(null);
      setFeedback('');
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: t.common.error,
        description: 'Không thể duyệt yêu cầu. Vui lòng thử lại.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !feedback.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập lý do từ chối",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await rejectSelfUpdateRequest(selectedRequest.id, feedback);

      toast({
        title: t.common.success,
        description: 'Đã từ chối yêu cầu cập nhật KPI',
      });

      setIsDialogOpen(false);
      setSelectedRequest(null);
      setFeedback('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: t.common.error,
        description: 'Không thể từ chối yêu cầu. Vui lòng thử lại.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Đã duyệt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Từ chối</Badge>;
      case 'not_started':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Yêu cầu cập nhật KPI
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Quản lý các yêu cầu cập nhật KPI từ nhân viên
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Yêu cầu cần xử lý</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedRequests.length}</div>
            <p className="text-xs text-muted-foreground">Đã được chấp nhận</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedRequests.length}</div>
            <p className="text-xs text-muted-foreground">Đã bị từ chối</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu cập nhật ({enrichedRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {enrichedRequests.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có yêu cầu nào</h3>
              <p className="text-muted-foreground">
                Nhân viên sẽ gửi yêu cầu cập nhật KPI tại đây
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>KPI</TableHead>
                  <TableHead>Giá trị hiện tại</TableHead>
                  <TableHead>Giá trị mới</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {request.employeeName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{request.employeePosition}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.kpiName}</p>
                        <p className="text-sm text-muted-foreground">{request.kpiUnit}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="font-semibold">{request.currentValue || 0}</p>
                        <p className="text-xs text-muted-foreground">{request.currentProgress.toFixed(1)}%</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="font-semibold text-blue-600">{request.newValue}</p>
                        <p className="text-xs text-muted-foreground">{request.newProgress.toFixed(1)}%</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm line-clamp-2">{request.reason || 'Không có lý do'}</p>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(request.submittedAt).toLocaleDateString('vi-VN')}</p>
                        <p className="text-muted-foreground">
                          {new Date(request.submittedAt).toLocaleTimeString('vi-VN')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.status === 'not_started' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Xem xét yêu cầu cập nhật KPI
            </DialogTitle>
            <DialogDescription>
              Đánh giá và quyết định về yêu cầu cập nhật từ nhân viên
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg">
                    {selectedRequest.employeeName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedRequest.employeeName}</h3>
                  <p className="text-muted-foreground">{selectedRequest.employeePosition}</p>
                  <Badge variant="outline" className="mt-2">
                    {getStatusBadge(selectedRequest.status)}
                  </Badge>
                </div>
              </div>

              {/* KPI Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold">Thông tin KPI</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Tên KPI</p>
                      <p className="font-medium">{selectedRequest.kpiName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Đơn vị</p>
                      <p className="font-medium">{selectedRequest.kpiUnit}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold">Giá trị cập nhật</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Hiện tại</p>
                      <p className="text-lg font-bold">{selectedRequest.currentValue || 0}</p>
                      <p className="text-xs text-muted-foreground">{selectedRequest.currentProgress.toFixed(1)}%</p>
                    </div>
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Đề xuất</p>
                      <p className="text-lg font-bold text-primary">{selectedRequest.newValue}</p>
                      <p className="text-xs text-muted-foreground">{selectedRequest.newProgress.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason and Documents */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Lý do cập nhật</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedRequest.reason || 'Không có lý do được cung cấp'}
                  </p>
                </div>

                {selectedRequest.supportingDocuments && selectedRequest.supportingDocuments.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Tài liệu đính kèm</Label>
                    <div className="mt-2 space-y-2">
                      {selectedRequest.supportingDocuments.map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
                              {getFileIcon(file.name)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.size}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => window.open(file.url, '_blank')}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => window.open(file.url, '_blank')}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Approval Form */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-gray-600" />
                  <h4 className="font-semibold">Quyết định</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="feedback" className="text-sm font-medium">
                      Phản hồi cho nhân viên (bắt buộc nếu từ chối)
                    </Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Nhập phản hồi, góp ý hoặc lý do từ chối..."
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="flex-1"
                  disabled={isProcessing || !feedback.trim()}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Đang xử lý...' : 'Từ chối'}
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Đang xử lý...' : 'Duyệt'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
