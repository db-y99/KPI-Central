'use client';
import { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock,
  Target,
  Calendar,
  Paperclip
} from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import FileUploadComponent from '@/components/file-upload-component';
import { FileUploadResult } from '@/lib/file-upload-service';

export default function EmployeeReportPage() {
  const { kpiRecords, kpis, updateKpiRecord } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [reportData, setReportData] = useState({
    actual: '',
    notes: '',
    submittedReport: ''
  });
  const [attachedFiles, setAttachedFiles] = useState<FileUploadResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter KPI records for current user
  const userKpiRecords = kpiRecords.filter(record => record.employeeId === user?.uid);

  // Get KPI details for each record
  const enrichedRecords = userKpiRecords.map(record => {
    const kpi = kpis.find(k => k.id === record.kpiId);
    return {
      ...record,
      kpiName: kpi?.name || 'Unknown',
      kpiDescription: kpi?.description || '',
      kpiUnit: kpi?.unit || '',
      progress: record.target > 0 ? ((record.actual || 0) / record.target * 100) : 0,
    };
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Đã duyệt</Badge>;
      case 'awaiting_approval':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />Chưa nộp</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><Clock className="w-3 h-3 mr-1" />Bị từ chối</Badge>;
      default:
        return <Badge variant="outline">Chưa bắt đầu</Badge>;
    }
  };

  const handleRecordSelect = (record: any) => {
    setSelectedRecord(record);
    setReportData({
      actual: record.actual?.toString() || '',
      notes: record.notes || '',
      submittedReport: record.submittedReport || ''
    });
    setAttachedFiles(record.attachedFiles || []);
  };

  const handleSubmit = async () => {
    if (!selectedRecord) return;

    if (!reportData.actual || isNaN(Number(reportData.actual))) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng nhập giá trị thực tế hợp lệ.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateKpiRecord(selectedRecord.id, {
        actual: Number(reportData.actual),
        notes: reportData.notes,
        submittedReport: reportData.submittedReport,
        attachedFiles: attachedFiles,
        status: 'awaiting_approval',
        submittedAt: new Date().toISOString(),
      });

      toast({
        title: 'Thành công',
        description: 'Đã nộp báo cáo thành công. Admin sẽ xem xét và duyệt.',
      });

      // Reset form
      setSelectedRecord(null);
      setReportData({ actual: '', notes: '', submittedReport: '' });
      setAttachedFiles([]);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể nộp báo cáo. Vui lòng thử lại.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Báo cáo KPI
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Nộp báo cáo tiến độ và tài liệu liên quan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KPI Records List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách KPI cần báo cáo</CardTitle>
          </CardHeader>
          <CardContent>
            {enrichedRecords.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có KPI nào</h3>
                <p className="text-muted-foreground">
                  Bạn chưa được giao KPI nào để báo cáo.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {enrichedRecords.map((record) => (
                  <div
                    key={record.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRecord?.id === record.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleRecordSelect(record)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{record.kpiName}</h4>
                      {getStatusBadge(record.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{record.kpiDescription}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Mục tiêu: {record.target} {record.kpiUnit}</span>
                      <span>Thực tế: {record.actual || 0} {record.kpiUnit}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Tiến độ</span>
                        <span>{record.progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${Math.min(record.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    {record.attachedFiles && record.attachedFiles.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <Paperclip className="w-3 h-3" />
                        <span>{record.attachedFiles.length} file đã nộp</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Form */}
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo chi tiết</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRecord ? (
              <div className="space-y-6">
                {/* KPI Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Thông tin KPI
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Tên KPI:</span>
                      <span className="ml-2 font-medium">{selectedRecord.kpiName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Mục tiêu:</span>
                      <span className="ml-2 font-medium">{selectedRecord.target} {selectedRecord.kpiUnit}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedRecord.startDate).toLocaleDateString('vi-VN')} - 
                        {new Date(selectedRecord.endDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Report Form */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="actual">Giá trị thực tế *</Label>
                    <Input
                      id="actual"
                      type="number"
                      value={reportData.actual}
                      onChange={(e) => setReportData(prev => ({ ...prev, actual: e.target.value }))}
                      placeholder={`Nhập giá trị thực tế (${selectedRecord.kpiUnit})`}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Ghi chú</Label>
                    <Textarea
                      id="notes"
                      value={reportData.notes}
                      onChange={(e) => setReportData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Nhập ghi chú về tiến độ thực hiện..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="report">Báo cáo chi tiết</Label>
                    <Textarea
                      id="report"
                      value={reportData.submittedReport}
                      onChange={(e) => setReportData(prev => ({ ...prev, submittedReport: e.target.value }))}
                      placeholder="Mô tả chi tiết về quá trình thực hiện KPI..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <Label>Tài liệu hỗ trợ</Label>
                  <FileUploadComponent
                    onFilesChange={setAttachedFiles}
                    existingFiles={attachedFiles}
                    maxFiles={5}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !reportData.actual}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Đang nộp...' : 'Nộp báo cáo'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chọn KPI để báo cáo</h3>
                <p className="text-muted-foreground">
                  Click vào một KPI ở danh sách bên trái để bắt đầu báo cáo.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}