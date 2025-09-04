'use client';

import { useState, useContext, useRef } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
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
import { PenSquare, Upload, ThumbsUp, ThumbsDown, Info, AlertCircle } from 'lucide-react';
import type { Kpi, KpiRecord } from '@/types';
import { cn } from '@/lib/utils';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/context/auth-context';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Textarea } from './ui/textarea';

interface KpiListRowProps {
  record: Kpi & KpiRecord & { employeeName?: string };
  isEmployeeView?: boolean;
}

const statusConfig = {
    pending: { label: 'Đang làm', color: 'bg-gray-500', icon: Info },
    awaiting_approval: { label: 'Chờ duyệt', color: 'bg-yellow-500', icon: AlertCircle },
    approved: { label: 'Đã duyệt', color: 'bg-green-500', icon: ThumbsUp },
    rejected: { label: 'Làm lại', color: 'bg-red-500', icon: ThumbsDown },
};


export default function KpiListRow({ record, isEmployeeView = false }: KpiListRowProps) {
  const { user } = useContext(AuthContext);
  const { updateKpiRecord, submitReport, approveKpi, rejectKpi } = useContext(DataContext);
  const { toast } = useToast();
  
  const [inputValue, setInputValue] = useState(record.actual.toString());
  const [rejectionComment, setRejectionComment] = useState('');
  
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === 'admin';
  
  const canUpdate = !isEmployeeView ? false : (record.status === 'pending' || record.status === 'rejected');
  const canSubmit = !isEmployeeView ? false : (record.status === 'pending' && record.actual > 0);
  const canApprove = isAdmin && record.status === 'awaiting_approval';

  const completionPercentage =
    record.target > 0 ? Math.round((record.actual / record.target) * 100) : 0;

  const handleUpdate = () => {
    const newActual = parseFloat(inputValue);
    if (!isNaN(newActual)) {
      updateKpiRecord(record.id, { actual: newActual });
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
        description: `Đã nộp báo cáo "${file.name}" cho KPI "${record.name}".`
      })
      setReportDialogOpen(false);
    } else {
       toast({
        title: "Lỗi",
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
            title: "Lỗi",
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

  const currentStatus = statusConfig[record.status];
  const StatusIcon = currentStatus.icon;

  return (
    <TableRow>
      {!isEmployeeView && <TableCell className="font-medium">{record.employeeName}</TableCell>}
      <TableCell className={isEmployeeView ? "font-medium" : ""}>
        <div className="flex flex-col">
            <span>{record.name}</span>
            <span className="text-xs text-muted-foreground">
              {record.submittedReport ? `Đã nộp: ${record.submittedReport}` : (isEmployeeView ? "Chưa nộp báo cáo" : "")}
            </span>
            {record.status === 'rejected' && record.approvalComment && isEmployeeView && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <span className="text-xs text-red-500 italic cursor-pointer">Lý do từ chối: {record.approvalComment}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{record.approvalComment}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            )}
        </div>
      </TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
                <Badge variant="outline" size="icon" className={cn("border-0 text-white", currentStatus.color)}>
                  <StatusIcon className="h-4 w-4" />
                </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{currentStatus.label}</p>
              {isAdmin && record.status === 'rejected' && record.approvalComment && (
                <p className="text-xs text-muted-foreground italic">Lý do: {record.approvalComment}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        <Progress value={completionPercentage} className="h-2" />
      </TableCell>
      <TableCell className={cn('text-right font-bold', completionPercentage >= 100 && 'text-green-500')}>
        {completionPercentage}%
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {canUpdate && (
             <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <PenSquare className="mr-2 h-4 w-4" /> Cập nhật
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
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
                 <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Hủy
                      </Button>
                    </DialogClose>
                    <Button onClick={handleUpdate}>Lưu thay đổi</Button>
                 </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

           {canSubmit && (
             <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" /> Nộp
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
                        <Button type="button" onClick={handleSubmitReport}>Lưu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
           )}

           {canApprove && (
             <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={handleApprove}>
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Duyệt</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

               <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <DialogTrigger asChild>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                                <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Từ chối</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
      </TableCell>
    </TableRow>
  );
}
