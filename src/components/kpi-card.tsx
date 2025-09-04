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
import { PenSquare, User, Upload, FileCheck } from 'lucide-react';
import type { Kpi, KpiRecord } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';

interface KpiCardProps {
  record: Kpi & KpiRecord & { employeeName?: string };
  showEmployee?: boolean;
}

export default function KpiCard({
  record,
  showEmployee = false,
}: KpiCardProps) {
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
    <Card className="flex flex-col transition-all">
      <CardHeader className="min-h-[140px]">
        {showEmployee && record.employeeName && (
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{record.employeeName}</span>
          </div>
        )}
        <CardTitle className="text-lg">{record.name}</CardTitle>
        <CardDescription className="truncate">{record.description}</CardDescription>
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
            Tần suất:{' '}
            <Badge variant="outline" className="text-xs">
              {record.frequency}
            </Badge>
          </div>
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
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 p-6 pt-0">
        <div className="w-full">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Tiến độ</span>
                <span className={cn('font-bold', progressColorClass)}>
                    {completionPercentage}%
                </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
        </div>
        <div className="grid w-full grid-cols-2 gap-2">
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
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

             <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
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
                        <Button type="button" onClick={handleSubmitReport}>Lưu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
}
