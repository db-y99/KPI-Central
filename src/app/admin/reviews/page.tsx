'use client';

import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ReviewPeriodSelector from '@/components/review-period-selector';
import ReviewsTable from '@/components/reviews-table';

export default function ReviewsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <div className="p-6 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá & Xếp loại cuối kỳ</CardTitle>
          <CardDescription>
            Tổng hợp, xem xét và xác nhận kết quả hoạt động của nhân viên vào cuối kỳ.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <ReviewPeriodSelector onDateChange={setDateRange} />
        </CardContent>
      </Card>
      
      <ReviewsTable dateRange={dateRange} />

    </div>
  );
}
