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
import { PenSquare, User, ChevronsUpDown } from 'lucide-react';
import type { Kpi, KpiRecord } from '@/types';
import RewardCalculator from './reward-calculator';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

interface KpiCardProps {
  record: Kpi & KpiRecord & { employeeName?: string };
  showEmployee?: boolean;
}

export default function KpiCard({
  record,
  showEmployee = false,
}: KpiCardProps) {
  // Trạng thái cục bộ cho mục đích demo. Trong một ứng dụng thực tế, điều này sẽ đến từ giải pháp quản lý trạng thái máy chủ.
  const [actualValue, setActualValue] = useState(record.actual);
  const [inputValue, setInputValue] = useState(record.actual.toString());
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
  // Màu xanh lá nếu vượt 100, màu nhấn nếu 80-100, màu vàng nếu 50-80, màu đỏ nếu ngược lại.
  const progressColorClass = isOverAchieved
    ? 'text-green-500'
    : completionPercentage >= 80
    ? 'text-accent'
    : completionPercentage >= 50
    ? 'text-yellow-500'
    : 'text-destructive';

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="flex flex-col transition-all">
        <CollapsibleTrigger className="w-full text-left p-6 cursor-pointer hover:bg-muted/50 rounded-t-lg">
          <div className="flex justify-between items-start">
             <div>
              {showEmployee && record.employeeName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  <span>{record.employeeName}</span>
                </div>
              )}
              <CardTitle className="text-lg">{record.name}</CardTitle>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>

          <div className="flex-grow space-y-4 pt-4">
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
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
             <CardDescription className="pt-2">{record.description}</CardDescription>
            <div className="space-y-2 pt-4">
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
          </CardContent>
          <CardFooter className="gap-2">
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
          </CardFooter>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}