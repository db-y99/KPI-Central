'use client';

import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { DateRangePicker } from './date-range-picker';
import { Button } from './ui/button';
import { subQuarters, startOfQuarter, endOfQuarter, subYears, startOfYear, endOfYear } from 'date-fns';

interface ReviewPeriodSelectorProps {
    onDateChange: (dateRange: DateRange | undefined) => void;
}

export default function ReviewPeriodSelector({ onDateChange }: ReviewPeriodSelectorProps) {
    const [date, setDate] = useState<DateRange | undefined>();

    const handleGenerateReport = () => {
        onDateChange(date);
    };

    const setPreviousQuarter = () => {
        const now = new Date();
        const previousQuarter = subQuarters(now, 1);
        const newDateRange = {
            from: startOfQuarter(previousQuarter),
            to: endOfQuarter(previousQuarter)
        };
        setDate(newDateRange);
        onDateChange(newDateRange);
    }
    
    const setPreviousYear = () => {
        const now = new Date();
        const previousYear = subYears(now, 1);
        const newDateRange = {
            from: startOfYear(previousYear),
            to: endOfYear(previousYear)
        };
        setDate(newDateRange);
        onDateChange(newDateRange);
    }

    return (
        <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
                Chọn một khoảng thời gian để xem báo cáo hoặc chọn nhanh các kỳ phổ biến.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
                <DateRangePicker date={date} setDate={setDate} />
                <div className="flex items-center gap-2">
                     <Button variant="outline" onClick={setPreviousQuarter}>Quý trước</Button>
                     <Button variant="outline" onClick={setPreviousYear}>Năm trước</Button>
                </div>
            </div>
        </div>
    )
}
