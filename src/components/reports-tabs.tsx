'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IndividualReport from './individual-report';
import DepartmentReport from './department-report';
import { DateRangePicker } from './date-range-picker';
import { type DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Separator } from './ui/separator';
import { Label } from './ui/label';

export default function ReportsTabs() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [comparisonDate, setComparisonDate] = useState<DateRange | undefined>();

  return (
    <Tabs defaultValue="individual" className="w-full space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="individual">Báo cáo cá nhân</TabsTrigger>
          <TabsTrigger value="department">Báo cáo phòng ban</TabsTrigger>
        </TabsList>
      </div>

      <div className="flex flex-col gap-6 rounded-lg border p-4">
        <div className="space-y-2">
            <Label>Kỳ báo cáo chính</Label>
            <DateRangePicker date={date} setDate={setDate} />
        </div>
        <Separator />
        <div className="space-y-2">
            <Label>Kỳ so sánh (tùy chọn)</Label>
            <DateRangePicker date={comparisonDate} setDate={setComparisonDate} />
        </div>
      </div>


      <TabsContent value="individual">
        <IndividualReport dateRange={date} comparisonDateRange={comparisonDate} />
      </TabsContent>
      <TabsContent value="department">
        <DepartmentReport dateRange={date} comparisonDateRange={comparisonDate} />
      </TabsContent>
    </Tabs>
  );
}
