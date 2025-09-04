'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IndividualReport from './individual-report';
import DepartmentReport from './department-report';
import { DateRangePicker } from './date-range-picker';
import { type DateRange } from 'react-day-picker';
import { subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function ReportsTabs() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  return (
    <Tabs defaultValue="individual" className="w-full space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="individual">Báo cáo cá nhân</TabsTrigger>
          <TabsTrigger value="department">Báo cáo phòng ban</TabsTrigger>
        </TabsList>
        <DateRangePicker date={date} setDate={setDate} />
      </div>
      <TabsContent value="individual">
        <IndividualReport dateRange={date} />
      </TabsContent>
      <TabsContent value="department">
        <DepartmentReport dateRange={date} />
      </TabsContent>
    </Tabs>
  );
}
