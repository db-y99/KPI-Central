'use client';

import * as React from 'react';
import { addDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  setDate,
}: DateRangePickerProps) {
  
  const handlePresetChange = (value: string) => {
    const now = new Date();
    let from: Date | undefined;
    let to: Date | undefined = now;

    switch (value) {
      case 'this-month':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'this-quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), quarter * 3, 1);
        to = new Date(from.getFullYear(), from.getMonth() + 3, 0);
        break;
      case 'this-year':
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        from = undefined;
        to = undefined;
    }
     setDate({ from, to });
  };


  return (
    <div className={cn('grid gap-2 md:flex md:items-center', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal md:w-[300px]',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd/MM/y', { locale: vi })} -{' '}
                  {format(date.to, 'dd/MM/y', { locale: vi })}
                </>
              ) : (
                format(date.from, 'dd/MM/y', { locale: vi })
              )
            ) : (
              <span>Chọn khoảng thời gian</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={vi}
          />
        </PopoverContent>
      </Popover>
      <div className="w-full md:w-[180px]">
        <Select onValueChange={handlePresetChange}>
          <SelectTrigger>
            <SelectValue placeholder="Hoặc chọn nhanh..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">Tháng này</SelectItem>
            <SelectItem value="this-quarter">Quý này</SelectItem>
            <SelectItem value="this-year">Năm nay</SelectItem>
          </SelectContent>
        </Select>
      </div>
       <Button variant="ghost" onClick={() => setDate(undefined)}>Xóa bộ lọc</Button>
    </div>
  );
}
