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
import { PenSquare, Upload } from 'lucide-react';
import type { Kpi, KpiRecord } from '@/types';
import { cn } from '@/lib/utils';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';

interface KpiListRowProps {
  record: Kpi & KpiRecord & { employeeName?: string };
  isEmployeeView?: boolean;
}

export default function KpiListRow({ record, isEmployeeView = false }: KpiListRowProps) {
  const { updateKpiRecord, submitReport } = useContext(DataContext);
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState(record.actual.toString());
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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


  const isOverAchieved = completionPercentage > 100;
  const progressColorClass = isOverAchieved
    ? 'text-green-500'
    : completionPercentage >= 80
    ? 'text-accent'
    : completionPercentage >= 50
    ? 'text-yellow-500'
    : 'text-destructive';

  return (
    <TableRow>
      {!isEmployeeView && <TableCell className="font-medium">{record.employeeName}</TableCell>}
      <TableCell className={isEmployeeView ? "font-medium" : ""}>
        <div className="flex flex-col">
            <span>{record.name}</span>
            {isEmployeeView && <span className="text-xs text-muted-foreground">{record.submittedReport ? `Đã nộp: ${record.submittedReport}` : "Chưa nộp báo cáo"}</span>}
        </div>
      </TableCell>
      <TableCell>
        <Progress value={completionPercentage} className="h-2" />
      </TableCell>
      <TableCell className={cn('text-right font-bold', progressColorClass)}>
        {completionPercentage}%
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size={isEmployeeView ? "sm" : "icon"}>
                <PenSquare className={cn(isEmployeeView && "mr-2", "h-4 w-4")} /> {isEmployeeView && "Cập nhật"}
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
           {isEmployeeView && (
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
        </div>
      </TableCell>
    </TableRow>
  );
}
