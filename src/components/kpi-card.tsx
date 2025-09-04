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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

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
    <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="flex flex-col transition-all cursor-pointer hover:bg-muted/50">
          <CardHeader>
             {showEmployee && record.employeeName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <User className="h-4 w-4" />
                <span>{record.employeeName}</span>
              </div>
            )}
            <CardTitle className="text-lg">{record.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex items-center gap-3">
              <Progress
                value={Math.min(completionPercentage, 100)}
                className="w-full"
              />
              <div
                className={cn(
                  'w-12 text-right text-lg font-bold',
                  progressColorClass
                )}
              >
                {completionPercentage}%
              </div>
            </div>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{record.name}</DialogTitle>
          <DialogDescription>{record.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
           <div className="flex items-center gap-3">
              <Progress
                value={Math.min(completionPercentage, 100)}
                className="w-full"
              />
              <div
                className={cn(
                  'w-12 text-right text-lg font-bold',
                  progressColorClass
                )}
              >
                {completionPercentage}%
              </div>
            </div>

          <div className="flex justify-between text-sm font-medium">
            <span>
              Thực tế:{' '}
              <span className="font-bold">
                {new Intl.NumberFormat('vi-VN').format(actualValue)}{' '}
                {record.unit}
              </span>
            </span>
            <span className="text-muted-foreground text-right">
              Chỉ tiêu:{' '}
              {new Intl.NumberFormat('vi-VN').format(record.target)}{' '}
              {record.unit}
            </span>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-2">
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
        </div>
        <div className="flex gap-2 pt-4">
           {/* Nested Dialog for Updating */}
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
      </DialogContent>
    </Dialog>
  );
}
