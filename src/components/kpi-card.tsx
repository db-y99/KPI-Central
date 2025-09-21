'use client';

import { useState, useContext, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PenSquare, User, Upload, FileCheck, ThumbsUp, ThumbsDown, AlertCircle, Info } from 'lucide-react';
import type { Kpi, KpiRecord } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { Textarea } from './ui/textarea';
import { AuthContext } from '@/context/auth-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface KpiCardProps {
  record: Kpi & KpiRecord & { employeeName?: string };
  showEmployee?: boolean;
}

const getStatusConfig = (t: any) => ({
    pending: { label: 'Đang làm', color: 'bg-gray-500', icon: Info },
    awaiting_approval: { label: t.reports.submitted as string, color: 'bg-yellow-500', icon: AlertCircle },
    approved: { label: t.reports.approved as string, color: 'bg-green-500', icon: ThumbsUp },
    rejected: { label: 'Làm lại', color: 'bg-red-500', icon: ThumbsDown },
});


export default function KpiCard({
  record,
  showEmployee = false,
}: KpiCardProps) {
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
  const isEmployee = !isAdmin;

  const canUpdate = isEmployee && (record.status === 'pending' || record.status === 'rejected');
  const canSubmit = isEmployee && record.status === 'pending' && record.actual > 0;
  const canApprove = isAdmin && record.status === 'awaiting_approval';


  const completionPercentage =
    record.target > 0 ? Math.round((record.actual / record.target) * 100) : 0;
  
  const handleUpdate = () => {
    const newActual = parseFloat(inputValue);
    if (!isNaN(newActual)) {
      // Update actual value and change status to awaiting_approval if actual > 0
      const updates: Partial<KpiRecord> = { actual: newActual };
      if (newActual > 0 && record.status === 'pending') {
        updates.status = 'awaiting_approval';
      }
      updateKpiRecord(record.id, updates);
      toast({
        title: "Thành công!",
        description: `Đã cập nhật kết quả cho KPI "${record.name}".`
      })
    }
    setUpdateDialogOpen(false);
  };
  
  const handleSubmitReport = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      submitReport(record.id, file.name);
      toast({
        title: "Thành công!",
        description: `Đã nộp báo cáo "${file.name}" cho KPI "${record.name}". Trạng thái chuyển thành {t.reports.submitted as string}.`
      })
      setReportDialogOpen(false);
    } else {
       toast({
        title: t.common.error as string,
        description: "Vui lòng chọn một tệp để nộp.",
        variant: 'destructive'
      })
    }
  };

  const handleApprove = () => {
    approveKpi(record.id);
    toast({
        title: "Thành công!",
        description: `Đã duyệt KPI "${record.name}".`
    })
  }

  const handleReject = () => {
    if (!rejectionComment) {
         toast({
            title: t.common.error as string,
            description: "Vui lòng nhập lý do từ chối.",
            variant: 'destructive'
        });
        return;
    }
    rejectKpi(record.id, rejectionComment);
     toast({
        title: "Đã từ chối!",
        description: `Đã từ chối KPI "${record.name}" và gửi lại cho nhân viên.`,
        variant: 'destructive'
    });
    setRejectDialogOpen(false);
    setRejectionComment('');
  }

  const statusConfig = getStatusConfig(t);
  const currentStatus = statusConfig[record.status];
  const StatusIcon = currentStatus.icon;

  return (
    <Card className="relative flex flex-col transition-all">
       <TooltipProvider>
          <Tooltip>
              <TooltipTrigger asChild>
                  <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className={cn("border-0 text-white", currentStatus.color)}>
                           <StatusIcon className="mr-1.5 h-3 w-3" />
                           <span className="text-xs">{currentStatus.label}</span>
                      </Badge>
                  </div>
              </TooltipTrigger>
              <TooltipContent>
                  <p>{currentStatus.label}</p>
                  {record.status === 'rejected' && record.approvalComment && (
                      <p className="text-xs text-muted-foreground italic">Lý do: {record.approvalComment}</p>
                  )}
              </TooltipContent>
          </Tooltip>
      </TooltipProvider>

      <CardHeader>
        {showEmployee && record.employeeName && (
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{record.employeeName}</span>
          </div>
        )}
        <CardTitle className="text-lg pr-8">{record.name}</CardTitle>
        <CardDescription className="truncate pt-1">{record.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-left">
            Thực tế:
            <br />
            <span className="font-bold">
              {new Intl.NumberFormat('vi-VN').format(record.actual)} {record.unit}
            </span>
          </span>
          <span className="text-right text-muted-foreground">
            Chỉ tiêu:
            <br />
            {new Intl.NumberFormat('vi-VN').format(record.target)} {record.unit}
          </span>
        </div>
        <div className="space-y-1 pt-2 text-xs text-muted-foreground">
          <div>
            Thời gian:{' '}
            {new Date(record.startDate).toLocaleDateString('vi-VN')} -{' '}
            {new Date(record.endDate).toLocaleDateString('vi-VN')}
          </div>
           {record.submittedReport && (
            <div className="flex items-center gap-1.5 pt-1 text-green-600">
                <FileCheck className="h-4 w-4" />
                <span className="font-medium">{record.submittedReport}</span>
            </div>
           )}
           {isEmployee && record.status === 'rejected' && record.approvalComment && (
             <p className="pt-1 text-xs text-red-500 italic">
                Lý do từ chối: {record.approvalComment}
              </p>
           )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 p-6 pt-0">
        <div className="grid w-full grid-cols-2 gap-2">
            {canUpdate && (
                <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                    <PenSquare className="mr-2 h-4 w-4" /> Cập nhật
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Cập nhật kết quả KPI</DialogTitle>
                    <DialogDescription>{record.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="actualValue">Kết quả thực tế</Label>
                        <Input
                        id="actualValue"
                        type="number"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Nhập kết quả..."
                        />
                    </div>
                    </div>
                    <Button onClick={handleUpdate}>Lưu thay đổi</Button>
                </DialogContent>
                </Dialog>
            )}

            {canSubmit && (
                <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Upload className="mr-2 h-4 w-4" /> Nộp báo cáo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nộp tệp báo cáo</DialogTitle>
                            <DialogDescription>
                                Tải lên tệp báo cáo liên quan cho KPI: {record.name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid w-full max-w-sm items-center gap-1.5 py-4">
                            <Label htmlFor="report-file">Chọn tệp</Label>
                            <Input id="report-file" type="file" ref={fileInputRef} />
                        </div>
                        <DialogFooter>
                           <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Hủy
                              </Button>
                            </DialogClose>
                            <Button type="button" onClick={handleSubmitReport}>Nộp</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {canApprove && (
                <>
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                    <ThumbsUp className="mr-2 h-4 w-4" /> Duyệt
                </Button>
                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <DialogTrigger asChild>
                         <Button size="sm" variant="destructive">
                            <ThumbsDown className="mr-2 h-4 w-4" /> Từ chối
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Từ chối duyệt KPI</DialogTitle>
                            <DialogDescription>
                                KPI: {record.name} <br/>
                                Nhân viên: {record.employeeName}
                            </DialogDescription>
                        </DialogHeader>
                         <div className="py-4">
                           <Label htmlFor="comment">Lý do từ chối (bắt buộc)</Label>
                           <Textarea 
                             id="comment"
                             value={rejectionComment}
                             onChange={(e) => setRejectionComment(e.target.value)}
                             placeholder="Nhập lý do và hướng dẫn cho nhân viên..."
                             className="mt-2"
                           />
                         </div>
                        <DialogFooter>
                             <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Hủy
                              </Button>
                            </DialogClose>
                            <Button type="button" variant="destructive" onClick={handleReject}>Xác nhận từ chối</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                </>
            )}

        </div>
         <div className="w-full">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Tiến độ</span>
                <span className={cn('font-bold', completionPercentage >= 100 && 'text-green-500')}>
                    {completionPercentage}%
                </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardFooter>
    </Card>
  );
}
