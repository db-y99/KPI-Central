'use client';

import { useState, useContext } from 'react';
import {
  TableRow,
  TableCell,
} from '@/components/ui/table';
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
import { PenSquare, Bot } from 'lucide-react';
import type { Kpi, KpiRecord } from '@/types';
import RewardCalculator from './reward-calculator';
import { cn } from '@/lib/utils';
import { DataContext } from '@/context/data-context';

interface KpiListRowProps {
  record: Kpi & KpiRecord & { employeeName?: string };
}

export default function KpiListRow({ record }: KpiListRowProps) {
  const { updateKpiRecord } = useContext(DataContext);
  const [inputValue, setInputValue] = useState(record.actual.toString());
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const completionPercentage =
    record.target > 0 ? Math.round((record.actual / record.target) * 100) : 0;

  const handleUpdate = () => {
    const newActual = parseFloat(inputValue);
    if (!isNaN(newActual)) {
      updateKpiRecord(record.id, { actual: newActual });
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
    <TableRow>
      <TableCell className="font-medium">{record.employeeName}</TableCell>
      <TableCell>{record.name}</TableCell>
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
                <Button variant="outline" size="icon">
                  <PenSquare className="h-4 w-4" />
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
          
          <RewardCalculator record={{...record, actual: record.actual}}>
            <Button variant="default" size="icon">
              <Bot className="h-4 w-4" />
            </Button>
          </RewardCalculator>
        </div>
      </TableCell>
    </TableRow>
  );
}
