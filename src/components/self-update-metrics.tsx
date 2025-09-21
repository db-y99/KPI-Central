'use client';

import { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataContext } from '@/context/data-context';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { Plus, Edit, CheckCircle, XCircle, Clock, Upload, FileText } from 'lucide-react';
import type { SelfUpdateRequest, KpiRecord } from '@/types';

export default function SelfUpdateMetrics() {
  const { user } = useContext(AuthContext);
  const { 
    kpiRecords, 
    kpis, 
    selfUpdateRequests,
    createSelfUpdateRequest,
    getSelfUpdateRequestsByEmployee 
  } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedKpiRecord, setSelectedKpiRecord] = useState<KpiRecord | null>(null);
  const [newRequest, setNewRequest] = useState({
    currentValue: 0,
    newValue: 0,
    reason: '',
    supportingDocuments: [] as string[]
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Get user's KPI records
  const userKpiRecords = kpiRecords.filter(kr => kr.employeeId === user?.uid);
  
  // Get user's update requests
  const userUpdateRequests = user?.uid ? getSelfUpdateRequestsByEmployee(user.uid) : [];

  const handleCreateRequest = async () => {
    if (!selectedKpiRecord || !newRequest.reason.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive"
      });
      return;
    }

    try {
      await createSelfUpdateRequest({
        employeeId: user?.uid || '',
        kpiRecordId: selectedKpiRecord.id,
        currentValue: newRequest.currentValue,
        newValue: newRequest.newValue,
        reason: newRequest.reason,
        supportingDocuments: newRequest.supportingDocuments,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });

      setNewRequest({
        currentValue: 0,
        newValue: 0,
        reason: '',
        supportingDocuments: []
      });
      setUploadedFiles([]);
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Gửi yêu cầu thành công",
        description: "Yêu cầu cập nhật đã được gửi và đang chờ duyệt",
      });
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: t.common.error as string,
        description: "Không thể gửi yêu cầu. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      // In a real implementation, you would upload files to Firebase Storage
      // and get URLs to store in supportingDocuments
      const fileUrls = newFiles.map(file => URL.createObjectURL(file));
      setNewRequest(prev => ({
        ...prev,
        supportingDocuments: [...prev.supportingDocuments, ...fileUrls]
      }));
    }
  };

  const getStatusIcon = (status: SelfUpdateRequest['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: SelfUpdateRequest['status']) => {
    switch (status) {
      case 'approved': return t.reports.approved as string;
      case 'rejected': return 'Bị từ chối';
      case 'pending': return t.reports.submitted as string;
      default: return status;
    }
  };

  const getStatusColor = (status: SelfUpdateRequest['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cập nhật Metrics tự phục vụ</h2>
          <p className="text-muted-foreground">Yêu cầu cập nhật giá trị KPI của bạn</p>
        </div>
      </div>

      {/* KPI Records */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">KPI của bạn</h3>
        <div className="grid gap-4">
          {userKpiRecords.map((kpiRecord) => {
            const kpi = kpis.find(k => k.id === kpiRecord.kpiId);
            return (
              <Card key={kpiRecord.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{kpi?.name || 'Unknown KPI'}</h4>
                        <Badge variant="outline">{kpi?.unit || ''}</Badge>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-3 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Mục tiêu</div>
                          <div className="text-lg font-semibold">{kpiRecord.target}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Hiện tại</div>
                          <div className="text-lg font-semibold">{kpiRecord.actual}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Tỷ lệ đạt</div>
                          <div className="text-lg font-semibold">
                            {((kpiRecord.actual / kpiRecord.target) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedKpiRecord(kpiRecord);
                            setNewRequest({
                              currentValue: kpiRecord.actual,
                              newValue: kpiRecord.actual,
                              reason: '',
                              supportingDocuments: []
                            });
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Cập nhật
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Cập nhật {kpi?.name || (t.nav.kpis as string)}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="current-value">Giá trị hiện tại</Label>
                              <Input
                                id="current-value"
                                type="number"
                                value={newRequest.currentValue}
                                onChange={(e) => setNewRequest(prev => ({ 
                                  ...prev, 
                                  currentValue: parseFloat(e.target.value) || 0 
                                }))}
                                disabled
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="new-value">Giá trị mới</Label>
                              <Input
                                id="new-value"
                                type="number"
                                value={newRequest.newValue}
                                onChange={(e) => setNewRequest(prev => ({ 
                                  ...prev, 
                                  newValue: parseFloat(e.target.value) || 0 
                                }))}
                                placeholder="Nhập giá trị mới"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="reason">Lý do cập nhật</Label>
                            <Textarea
                              id="reason"
                              value={newRequest.reason}
                              onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                              placeholder="Giải thích lý do cập nhật giá trị này..."
                              rows={4}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Tài liệu hỗ trợ</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                              <input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                              />
                              <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex flex-col items-center justify-center py-4"
                              >
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600">
                                  Kéo thả file hoặc click để chọn
                                </span>
                                <span className="text-xs text-gray-400">
                                  Hỗ trợ: PDF, DOC, XLS, PNG, JPG
                                </span>
                              </label>
                            </div>
                            
                            {uploadedFiles.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-sm font-medium">Files đã chọn:</div>
                                {uploadedFiles.map((file, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <FileText className="w-4 h-4" />
                                    <span>{file.name}</span>
                                    <span className="text-muted-foreground">
                                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-4">
                            <Button onClick={handleCreateRequest}>
                              <Plus className="w-4 h-4 mr-2" />
                              Gửi yêu cầu
                            </Button>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                              Hủy
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Update Requests History */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Lịch sử yêu cầu cập nhật</h3>
        <div className="grid gap-4">
          {userUpdateRequests.map((request) => {
            const kpiRecord = kpiRecords.find(kr => kr.id === request.kpiRecordId);
            const kpi = kpis.find(k => k.id === kpiRecord?.kpiId);
            
            return (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{kpi?.name || 'Unknown KPI'}</h4>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusLabel(request.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-3 mb-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Từ</div>
                          <div className="font-medium">{request.currentValue}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Đến</div>
                          <div className="font-medium">{request.newValue}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Thay đổi</div>
                          <div className="font-medium">
                            {((request.newValue - request.currentValue) / request.currentValue * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Lý do:</div>
                        <p className="text-sm">{request.reason}</p>
                      </div>
                      
                      {request.feedback && (
                        <div className="space-y-2 mt-3">
                          <div className="text-sm text-muted-foreground">Phản hồi:</div>
                          <p className="text-sm bg-gray-50 p-2 rounded">{request.feedback}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Gửi: {new Date(request.submittedAt).toLocaleString('vi-VN')}</span>
                        {request.reviewedAt && (
                          <span>Duyệt: {new Date(request.reviewedAt).toLocaleString('vi-VN')}</span>
                        )}
                        {request.reviewedBy && (
                          <span>Bởi: {request.reviewedBy}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {userKpiRecords.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Edit className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có KPI nào</h3>
            <p className="text-muted-foreground">
              Bạn chưa được phân công KPI nào để có thể cập nhật
            </p>
          </CardContent>
        </Card>
      )}

      {userUpdateRequests.length === 0 && userKpiRecords.length > 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có yêu cầu nào</h3>
            <p className="text-muted-foreground">
              Bạn chưa gửi yêu cầu cập nhật KPI nào
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

