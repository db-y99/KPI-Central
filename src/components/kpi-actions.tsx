import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Edit, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Upload,
  Eye
} from 'lucide-react';
import { useKpiActions, type KpiActionsConfig } from '@/hooks/use-kpi-actions';
import type { KpiRecord } from '@/types';

interface KpiActionsProps extends KpiActionsConfig {
  variant?: 'card' | 'row';
  showProgress?: boolean;
  showStatus?: boolean;
  className?: string;
}

export default function KpiActions({
  record,
  onUpdate,
  onReport,
  onApprove,
  onReject,
  variant = 'card',
  showProgress = true,
  showStatus = true,
  className = ''
}: KpiActionsProps) {
  const {
    inputValue,
    setInputValue,
    rejectionComment,
    setRejectionComment,
    updateDialogOpen,
    setUpdateDialogOpen,
    reportDialogOpen,
    setReportDialogOpen,
    rejectDialogOpen,
    setRejectDialogOpen,
    fileInputRef,
    isAdmin,
    canUpdate,
    canSubmit,
    canApprove,
    completionPercentage,
    statusInfo,
    handleUpdate,
    handleSubmitReport,
    handleApprove,
    handleReject,
  } = useKpiActions({ record, onUpdate, onReport, onApprove, onReject });

  const isCardVariant = variant === 'card';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status and Progress */}
      {showStatus && (
        <div className="flex items-center justify-between">
          <Badge className={statusInfo.color}>
            <span className="mr-1">{statusInfo.icon}</span>
            {statusInfo.label}
          </Badge>
          {showProgress && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{completionPercentage}%</span>
              <Progress value={completionPercentage} className="w-20 h-2" />
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className={`flex gap-2 ${isCardVariant ? 'flex-wrap' : 'flex-nowrap'}`}>
        {/* Update Button */}
        {canUpdate && (
          <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Cập nhật
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cập nhật kết quả KPI</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="actual-value">Kết quả thực tế</Label>
                  <Input
                    id="actual-value"
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

        {/* Submit Report Button */}
        {canSubmit && (
          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Gửi báo cáo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gửi báo cáo KPI</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="report-file">Tệp báo cáo</Label>
                  <Input
                    id="report-file"
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                </div>
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

        {/* Approve Button */}
        {canApprove && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleApprove}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            Phê duyệt
          </Button>
        )}

        {/* Reject Button */}
        {canApprove && (
          <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Từ chối
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Từ chối KPI</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejection-comment">Lý do từ chối</Label>
                  <Textarea
                    id="rejection-comment"
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
                  <Button variant="destructive" onClick={handleReject}>
                    Từ chối
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* View Details Button */}
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Chi tiết
        </Button>
      </div>
    </div>
  );
}
