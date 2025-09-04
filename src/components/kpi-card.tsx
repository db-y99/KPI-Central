'use client';

import { useState } from 'react';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PenSquare, User } from 'lucide-react';
import type { Kpi, KpiRecord } from '@/types';
import RewardCalculator from './reward-calculator';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface KpiCardProps {
  record: Kpi & KpiRecord & { employeeName?: string };
  showEmployee?: boolean;
}

export default function KpiCard({
  record,
  showEmployee = false,
}: KpiCardProps) {
  const [actualValue, setActualValue] = useState(record.actual);
  const [inputValue, setInputValue] = useState(record.actual.toString());
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const completionPercentage =
    record.target > 0 ? Math.round((actualValue / record.target) * 100) : 0;

  const handleUpdate = () => {
    const newActual = parseFloat(inputValue);
    if (!isNaN(newActual)) {
      setActualValue(newActual);
    }
    setUpdateDialogOpen(false);
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
      <CardHeader>
        {showEmployee && record.employeeName && (
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{record.employeeName}</span>
          </div>
        )}
        <CardTitle className="text-lg">{record.name}</CardTitle>
        <CardDescription>{record.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-left">
            Thực tế:
            <br />
            <span className="font-bold">
              {new Intl.NumberFormat('vi-VN').format(actualValue)} {record.unit}
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
        <div className="flex w-full gap-2">
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
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
            <RewardCalculator record={{ ...record, actual: actualValue }} />
        </div>
      </CardFooter>
    </Card>
  );
}
