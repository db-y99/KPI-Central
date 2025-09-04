'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ReviewsPage() {
  return (
    <div className="p-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá & Xếp loại cuối kỳ</CardTitle>
          <CardDescription>
            Tổng hợp, xem xét và xác nhận kết quả hoạt động của nhân viên vào cuối kỳ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center">
            <h3 className="text-lg font-semibold">Chức năng đang được xây dựng</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tính năng tổng hợp kết quả, tự động xếp loại và đề xuất thưởng/phạt sẽ sớm được cập nhật tại đây.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
