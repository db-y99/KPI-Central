'use client';

import { useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Kpi, KpiRecord } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { calculatePerformanceRewardAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';

interface RewardCalculatorProps {
  record: Kpi & KpiRecord;
}

const formSchema = z.object({
  performanceRatingFactors: z
    .string()
    .min(10, 'Vui lòng cung cấp một số yếu tố để xem xét.'),
});

export default function RewardCalculator({ record }: RewardCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    performanceRating: string;
    potentialRewards: string;
  } | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      performanceRatingFactors:
        'A: >100% mục tiêu, B: 80-100%, C: 60-80%, D: <60%',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await calculatePerformanceRewardAction({
        kpiResults: record.actual,
        target: record.target,
        performanceRatingFactors: values.performanceRatingFactors,
      });
      if (response) {
        setResult(response);
      } else {
        throw new Error('Không nhận được phản hồi từ AI.');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tính toán phần thưởng. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        setOpen(open);
        if (!open) {
          // Đặt lại trạng thái khi đóng
          setResult(null);
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" className="w-full">
          <Bot className="mr-2 h-4 w-4" /> Tính thưởng
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Máy tính thưởng AI</DialogTitle>
          <DialogDescription>
            Tính toán xếp hạng hiệu suất và phần thưởng tiềm năng cho: {record.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="text-sm">
            <p>
              <strong>Thực tế:</strong> {record.actual}
            </p>
            <p>
              <strong>Mục tiêu:</strong> {record.target}
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-4 space-y-4"
            >
              <FormField
                control={form.control}
                name="performanceRatingFactors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yếu tố xếp hạng hiệu suất</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="VD: A: >100% mục tiêu, B: 80-100%, ..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Tính toán
              </Button>
            </form>
          </Form>

          {result && (
            <Card className="mt-6 bg-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Gợi ý từ AI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Xếp hạng hiệu suất:</strong>{' '}
                  <span className="text-xl font-bold text-primary">
                    {result.performanceRating}
                  </span>
                </p>
                <p>
                  <strong>Phần thưởng tiềm năng:</strong> {result.potentialRewards}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
