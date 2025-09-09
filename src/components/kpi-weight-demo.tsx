'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calculator, Target, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

interface KpiData {
  name: string;
  weight: number;
  target: number;
  actual: number;
  unit: string;
  icon: React.ReactNode;
}

export function KpiWeightDemo() {
  const [kpis, setKpis] = useState<KpiData[]>([
    {
      name: 'Số khách hàng tiềm năng',
      weight: 40,
      target: 50,
      actual: 45,
      unit: 'khách hàng',
      icon: <Users className="w-4 h-4" />
    },
    {
      name: 'Tỷ lệ chuyển đổi',
      weight: 30,
      target: 20,
      actual: 18,
      unit: '%',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      name: 'Chi phí marketing',
      weight: 20,
      target: 10000000,
      actual: 9500000,
      unit: 'VND',
      icon: <DollarSign className="w-4 h-4" />
    },
    {
      name: 'Thời gian phản hồi',
      weight: 10,
      target: 2,
      actual: 1.5,
      unit: 'giờ',
      icon: <Clock className="w-4 h-4" />
    }
  ]);

  const updateKpi = (index: number, field: keyof KpiData, value: any) => {
    const newKpis = [...kpis];
    newKpis[index] = { ...newKpis[index], [field]: value };
    setKpis(newKpis);
  };

  const calculateScore = (kpi: KpiData) => {
    if (kpi.target === 0) return 0;
    const percentage = (kpi.actual / kpi.target) * 100;
    return Math.min(percentage, 100); // Tối đa 100 điểm
  };

  const calculateWeightedScore = () => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    kpis.forEach(kpi => {
      const score = calculateScore(kpi);
      const weightedScore = (score * kpi.weight) / 100;
      totalWeightedScore += weightedScore;
      totalWeight += kpi.weight;
    });

    return totalWeight > 0 ? totalWeightedScore / (totalWeight / 100) : 0;
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    }
    return `${value} ${unit}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const totalWeight = kpis.reduce((sum, kpi) => sum + kpi.weight, 0);
  const weightedScore = calculateWeightedScore();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Demo Tính Điểm KPI Có Trọng Số
          </CardTitle>
          <CardDescription>
            Minh họa cách trọng số ảnh hưởng đến điểm tổng thể của KPI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* KPI List */}
          <div className="space-y-4">
            {kpis.map((kpi, index) => {
              const score = calculateScore(kpi);
              const weightedScore = (score * kpi.weight) / 100;
              
              return (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      {/* KPI Info */}
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          {kpi.icon}
                          <Label className="font-medium">{kpi.name}</Label>
                        </div>
                        <Badge variant="outline" className={getScoreBadge(score)}>
                          {score.toFixed(1)} điểm
                        </Badge>
                      </div>

                      {/* Weight */}
                      <div>
                        <Label className="text-sm text-muted-foreground">Trọng số</Label>
                        <Input
                          type="number"
                          value={kpi.weight}
                          onChange={(e) => updateKpi(index, 'weight', parseInt(e.target.value) || 0)}
                          className="w-20"
                          min="0"
                          max="100"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>

                      {/* Target */}
                      <div>
                        <Label className="text-sm text-muted-foreground">Mục tiêu</Label>
                        <Input
                          type="number"
                          value={kpi.target}
                          onChange={(e) => updateKpi(index, 'target', parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-xs text-muted-foreground">{kpi.unit}</span>
                      </div>

                      {/* Actual */}
                      <div>
                        <Label className="text-sm text-muted-foreground">Thực tế</Label>
                        <Input
                          type="number"
                          value={kpi.actual}
                          onChange={(e) => updateKpi(index, 'actual', parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-xs text-muted-foreground">{kpi.unit}</span>
                      </div>

                      {/* Weighted Score */}
                      <div className="text-center">
                        <Label className="text-sm text-muted-foreground">Điểm có trọng số</Label>
                        <div className={`text-lg font-bold ${getScoreColor(weightedScore)}`}>
                          {weightedScore.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tiến độ: {formatValue(kpi.actual, kpi.unit)} / {formatValue(kpi.target, kpi.unit)}</span>
                        <span className={getScoreColor(score)}>{score.toFixed(1)}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalWeight}%</div>
                  <div className="text-sm text-muted-foreground">Tổng trọng số</div>
                  {totalWeight !== 100 && (
                    <div className="text-xs text-red-600 mt-1">
                      ⚠️ Tổng trọng số phải = 100%
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(weightedScore)}`}>
                    {weightedScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Điểm tổng thể</div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {weightedScore >= 90 ? 'Xuất sắc' : 
                     weightedScore >= 70 ? 'Tốt' : 
                     weightedScore >= 50 ? 'Trung bình' : 'Cần cải thiện'}
                  </div>
                  <div className="text-sm text-muted-foreground">Đánh giá</div>
                </div>
              </div>

              {/* Formula */}
              <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/30 rounded-lg">
                <div className="text-sm font-mono text-center">
                  <div className="font-semibold mb-2">Công thức tính:</div>
                  <div>
                    Điểm tổng = Σ(KPIi × Trọng sối) ÷ 100
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Ví dụ: (45×40 + 18×30 + 95×20 + 75×10) ÷ 100 = {weightedScore.toFixed(1)} điểm
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setKpis([
                  {
                    name: 'Số khách hàng tiềm năng',
                    weight: 40,
                    target: 50,
                    actual: 45,
                    unit: 'khách hàng',
                    icon: <Users className="w-4 h-4" />
                  },
                  {
                    name: 'Tỷ lệ chuyển đổi',
                    weight: 30,
                    target: 20,
                    actual: 18,
                    unit: '%',
                    icon: <TrendingUp className="w-4 h-4" />
                  },
                  {
                    name: 'Chi phí marketing',
                    weight: 20,
                    target: 10000000,
                    actual: 9500000,
                    unit: 'VND',
                    icon: <DollarSign className="w-4 h-4" />
                  },
                  {
                    name: 'Thời gian phản hồi',
                    weight: 10,
                    target: 2,
                    actual: 1.5,
                    unit: 'giờ',
                    icon: <Clock className="w-4 h-4" />
                  }
                ]);
              }}
            >
              <Target className="w-4 h-4 mr-2" />
              Reset về mặc định
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
