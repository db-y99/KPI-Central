'use client';

import { useState, useRef, useContext } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { PenSquare, Upload, ThumbsUp, ThumbsDown, Info, AlertCircle, Clock, Play, CheckCircle, XCircle } from 'lucide-react';
import type { Kpi, KpiRecord } from '@/types';
import { KpiStatusService, KpiStatus } from '@/lib/kpi-status-service';

interface KpiListRowProps {
  record: Kpi & KpiRecord & { employeeName?: string };
  isEmployeeView?: boolean;
}

// Icon mapping cho các trạng thái
const StatusIcons = {
  Clock,
  Play,
  AlertCircle,
  CheckCircle,
  XCircle
};

export default function KpiListRow({ record, isEmployeeView = false }: KpiListRowProps) {
  const { user } = useContext(AuthContext);
  const { updateKpiRecord, submitReport, approveKpi, rejectKpi } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [inputValue, setInputValue] = useState(record.actual.toString());
  const [rejectionComment, setRejectionComment] = useState('');
  
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === 'admin';
  
  // Sử dụng KPI Status Service để lấy cấu hình trạng thái
  const statusConfig = KpiStatusService.getStatusConfig(record.status as KpiStatus);
  const StatusIcon = StatusIcons[statusConfig.icon as keyof typeof StatusIcons] || Info;

  // Sử dụng KPI Status Service để kiểm tra quyền hạn
  const canUpdate = isEmployeeView && KpiStatusService.isEditableStatus(record.status as KpiStatus);
  const canSubmit = isEmployeeView && KpiStatusService.canSubmitStatus(record.status as KpiStatus) && record.actual > 0;
  const canApprove = isAdmin && KpiStatusService.canApproveStatus(record.status as KpiStatus);

  const completionPercentage =
    record.target > 0 ? Math.round((record.actual / record.target) * 100) : 0;

  const handleUpdate = async () => {
    const newActual = parseFloat(inputValue);
    if (!isNaN(newActual)) {
      try {
        const updates: Partial<KpiRecord> = { actual: newActual };
        
        // Sử dụng KPI Status Service để xác định trạng thái tiếp theo
        const nextStatus = KpiStatusService.getNextStatusByAction(record.status as KpiStatus, 'start');
        if (nextStatus && newActual > 0) {
          updates.status = nextStatus;
        }
        
        await updateKpiRecord(record.id, updates);
        toast({
          title: "Thành công!",
          description: `Đã cập nhật kết quả cho KPI "${record.name}".`
        });
      } catch (error) {
        toast({
          title: "Lỗi!",
          description: error instanceof Error ? error.message : "Không thể cập nhật KPI",
          variant: 'destructive'
        });
      }
    }
    setUpdateDialogOpen(false);
  };
  
  const handleSubmitReport = () => {
    if (record.actual > 0) {
      submitReport(record.id, `Báo cáo ${record.name}`);
      toast({
        title: "Báo cáo đã gửi!",
        description: `Báo cáo KPI "${record.name}" đã được gửi để duyệt.`
      });
    }
    setReportDialogOpen(false);
  };

  const handleApprove = () => {
    approveKpi(record.id);
    toast({
      title: "Đã duyệt!",
      description: `KPI "${record.name}" đã được duyệt thành công.`
    });
  };

  const handleReject = () => {
    if (rejectionComment.trim()) {
      rejectKpi(record.id, rejectionComment);
      toast({
        title: "Đã từ chối!",
        description: `KPI "${record.name}" đã bị từ chối với lý do: ${rejectionComment}`
      });
    }
    setRejectDialogOpen(false);
    setRejectionComment('');
  };

  return (
    <TableRow>
      {!isEmployeeView && <TableCell className="font-medium">{record.employeeName}</TableCell>}
      <TableCell className={isEmployeeView ? "font-medium" : ""}>
        <div className="flex flex-col">
            <span>{record.name}</span>
            <span className="text-sm text-muted-foreground">{record.description}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <StatusIcon className="w-4 h-4" />
          <Badge variant="secondary" className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="text-right font-mono">
        {record.target.toLocaleString()}
      </TableCell>
      <TableCell className="text-right font-mono">
        {record.actual.toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center gap-2">
          <Progress value={completionPercentage} className="w-16" />
          <span className="text-sm font-medium">{completionPercentage}%</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {canUpdate && (
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <PenSquare className="w-4 h-4 mr-1" />
                  Cập nhật
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cập nhật KPI: {record.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="actual">Kết quả thực tế</Label>
                    <Input
                      id="actual"
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Nhập kết quả thực tế"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleUpdate}>
                      Cập nhật
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {canSubmit && (
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-1" />
                  Báo cáo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gửi báo cáo KPI: {record.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Bạn có chắc chắn muốn gửi báo cáo này để duyệt không?
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleSubmitReport}>
                      Gửi báo cáo
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {canApprove && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleApprove}
                className="text-green-600 hover:text-green-700"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Duyệt
              </Button>
              <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    Từ chối
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Từ chối KPI: {record.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rejectionComment">Lý do từ chối</Label>
                      <Textarea
                        id="rejectionComment"
                        value={rejectionComment}
                        onChange={(e) => setRejectionComment(e.target.value)}
                        placeholder="Nhập lý do từ chối..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                        Hủy
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleReject}
                        disabled={!rejectionComment.trim()}
                      >
                        Từ chối
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
          
          <Button variant="ghost" size="sm">
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}