'use client';

import { useContext, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval } from 'date-fns';
import { DataContext } from '@/context/data-context';
import type { Employee, Kpi } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Download, ChevronsRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ReviewsTableProps {
  dateRange: DateRange | undefined;
}

interface ReviewData {
  employee: Employee;
  totalKpis: number;
  averageCompletion: number;
  grade: string;
  rewardPenalty: number;
}

const getGrade = (completion: number): string => {
    if (completion >= 110) return 'A+';
    if (completion >= 100) return 'A';
    if (completion >= 90) return 'B';
    if (completion >= 75) return 'C';
    return 'D';
}

const gradeColors: { [key: string]: string } = {
    'A+': 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white',
    'A': 'bg-green-600 hover:bg-green-700 text-white',
    'B': 'bg-blue-600 hover:bg-blue-700 text-white',
    'C': 'bg-yellow-500 hover:bg-yellow-600 text-white',
    'D': 'bg-red-600 hover:bg-red-700 text-white',
};

const calculateRewardPenalty = (records: any[], kpis: Kpi[]): number => {
    return records.reduce((acc, record) => {
        const kpiDetail = kpis.find(k => k.id === record.kpiId);
        if (!kpiDetail) return acc;

        // Penalty logic
        if (kpiDetail.penalty && record.actual > record.target) {
            return acc - kpiDetail.penalty * record.actual;
        }

        // Reward logic
        if (kpiDetail.reward && record.actual >= record.target) {
            // For boolean-like KPIs (target=0, actual=1 or target=1, actual=1)
            if (record.target === 0 && record.actual > 0) {
                 return acc + kpiDetail.reward * record.actual;
            }
             if (record.target > 0 && record.actual >= record.target){
                 return acc + kpiDetail.reward;
             }
        }
        
        return acc;
    }, 0);
}


export default function ReviewsTable({ dateRange }: ReviewsTableProps) {
  const { employees, kpis, kpiRecords } = useContext(DataContext);
  const [reviewData, setReviewData] = useState<ReviewData[]>([]);
  const { toast } = useToast();

  useMemo(() => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      setReviewData([]);
      return;
    }

    const calculatedData = employees.map(employee => {
      const employeeRecords = kpiRecords.filter(r =>
        r.employeeId === employee.id &&
        r.status === 'approved' &&
        isWithinInterval(new Date(r.endDate), { start: dateRange.from as Date, end: dateRange.to as Date })
      );

      if (employeeRecords.length === 0) {
        return null;
      }

      const totalCompletion = employeeRecords.reduce((acc, record) => {
        const completion = record.target > 0 ? (record.actual / record.target) * 100 : (record.actual > 0 ? 100 : 0);
        return acc + completion;
      }, 0);

      const averageCompletion = Math.round(totalCompletion / employeeRecords.length);
      const grade = getGrade(averageCompletion);
      const rewardPenalty = calculateRewardPenalty(employeeRecords, kpis);

      return { employee, totalKpis: employeeRecords.length, averageCompletion, grade, rewardPenalty };
    }).filter((item): item is ReviewData => item !== null)
      .sort((a, b) => b.averageCompletion - a.averageCompletion);
      
    setReviewData(calculatedData);
  }, [dateRange, employees, kpiRecords, kpis]);

  const handleGradeChange = (employeeId: string, newGrade: string) => {
    setReviewData(prevData =>
      prevData.map(item =>
        item.employee.id === employeeId ? { ...item, grade: newGrade } : item
      )
    );
  };
  
  const handleConfirmReviews = () => {
    // In a real app, this would send the data to a server
    console.log("Confirmed Reviews:", reviewData);
    toast({
        title: "Đã xác nhận!",
        description: "Kết quả đánh giá đã được lưu lại."
    })
  }

  if (!dateRange || !dateRange.from) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center">
             <ChevronsRight className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
             <h3 className="text-lg font-semibold">Bắt đầu đánh giá</h3>
             <p className="mt-2 text-sm text-muted-foreground">
              Vui lòng chọn một khoảng thời gian ở trên để tổng hợp dữ liệu và tiến hành đánh giá nhân viên.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (reviewData.length === 0) {
     return (
       <Card>
        <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-12">Không có dữ liệu KPI đã duyệt nào trong khoảng thời gian đã chọn để đánh giá.</p>
        </CardContent>
      </Card>
     )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bảng tổng hợp kết quả</CardTitle>
        <Button onClick={handleConfirmReviews}>
            <Download className="mr-2 h-4 w-4" />
            Xác nhận & Lưu kết quả
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead className="text-center">Số KPI</TableHead>
              <TableHead className="text-center">Hoàn thành TB</TableHead>
              <TableHead className="text-center">Thưởng/Phạt (VND)</TableHead>
              <TableHead className="w-[150px] text-center">Xếp loại</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviewData.map(item => (
              <TableRow key={item.employee.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={item.employee.avatar} alt={item.employee.name} data-ai-hint="person" />
                      <AvatarFallback>{item.employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span>{item.employee.name}</span>
                        <span className="text-xs text-muted-foreground">{item.employee.position}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">{item.totalKpis}</TableCell>
                <TableCell className="text-center font-bold">{item.averageCompletion}%</TableCell>
                <TableCell className={cn("text-center font-bold", item.rewardPenalty > 0 ? "text-green-500" : "text-red-500")}>
                    <div className="flex items-center justify-center gap-1">
                        {item.rewardPenalty > 0 && <TrendingUp className="h-4 w-4" />}
                        {item.rewardPenalty < 0 && <TrendingDown className="h-4 w-4" />}
                        {new Intl.NumberFormat('vi-VN').format(item.rewardPenalty)}
                    </div>
                </TableCell>
                <TableCell className="text-center">
                   <Select value={item.grade} onValueChange={(newGrade) => handleGradeChange(item.employee.id, newGrade)}>
                        <SelectTrigger className={cn("w-24 mx-auto border-0 font-semibold", gradeColors[item.grade])}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(gradeColors).map(grade => (
                                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                            ))}
                        </SelectContent>
                   </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
