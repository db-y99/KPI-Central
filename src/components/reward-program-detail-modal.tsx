'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Edit, Eye, Calendar, DollarSign, AlertTriangle, CheckCircle2, Users, Target } from 'lucide-react';
import type { RewardProgram } from '@/types';

interface RewardProgramDetailModalProps {
  program: RewardProgram;
  onEdit?: (program: RewardProgram) => void;
  onDelete?: (programId: string) => void;
  children: React.ReactNode;
}

export function RewardProgramDetailModal({ 
  program, 
  onEdit, 
  onDelete, 
  children 
}: RewardProgramDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getFrequencyColor = (frequency: string | undefined) => {
    if (!frequency) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    
    switch (frequency.toLowerCase()) {
      case 'quarterly': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'monthly': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'annual': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getFrequencyIcon = (frequency: string | undefined) => {
    if (!frequency) return <Calendar className="w-4 h-4" />;
    
    switch (frequency.toLowerCase()) {
      case 'quarterly': return <Calendar className="w-4 h-4" />;
      case 'monthly': return <Calendar className="w-4 h-4" />;
      case 'annual': return <Calendar className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{program.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">{program.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={program.isActive ? "default" : "secondary"}
                className={program.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
              >
                {program.isActive ? "Hoạt động" : "Tạm dừng"}
              </Badge>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    onEdit(program);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Program Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Thông tin chương trình
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Vị trí</label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{program.position}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Năm</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{program.year}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tần suất thưởng</label>
                  <Badge className={getFrequencyColor(program.frequency)}>
                    {getFrequencyIcon(program.frequency)}
                    <span className="ml-1">
                      {program.frequency === 'quarterly' ? 'Hàng quý' : 
                       program.frequency === 'monthly' ? 'Hàng tháng' : 
                       program.frequency === 'annual' ? 'Hàng năm' : 
                       'Không xác định'}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rewards and Penalties Tabs */}
          <Tabs defaultValue="quarterly" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quarterly">Thưởng quý</TabsTrigger>
              <TabsTrigger value="monthly">Thưởng tháng</TabsTrigger>
              <TabsTrigger value="annual">Thưởng năm</TabsTrigger>
              <TabsTrigger value="penalties">Phạt</TabsTrigger>
            </TabsList>

            {/* Quarterly Rewards */}
            <TabsContent value="quarterly" className="space-y-4">
              <Card className="min-h-[400px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    Thưởng hàng quý
                  </CardTitle>
                  <CardDescription>
                    Các khoản thưởng được tính theo quý cho vị trí {program.position}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  {program.quarterlyRewards.length > 0 ? (
                    <div className="space-y-4 flex-1">
                      {program.quarterlyRewards.map((reward, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-lg">{reward.name}</h4>
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              {formatCurrency(reward.value)}
                            </Badge>
                          </div>
                          
                          {reward.description && (
                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                          )}
                          
                          {reward.conditions && reward.conditions.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">Điều kiện:</h5>
                              <div className="space-y-1">
                                {reward.conditions.map((condition, condIndex) => (
                                  <div key={condIndex} className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">{condition.metric}:</span>
                                    <span>{condition.operator} {condition.value}</span>
                                    {condition.unit && <span className="text-muted-foreground">({condition.unit})</span>}
                                    {condition.secondValue && (
                                      <span className="text-muted-foreground">
                                        - {condition.secondValue} {condition.unit}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                      <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Chưa có thưởng quý</h3>
                      <p className="text-sm">Chương trình này chưa có khoản thưởng quý nào được thiết lập</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monthly Rewards */}
            <TabsContent value="monthly" className="space-y-4">
              <Card className="min-h-[400px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <CheckCircle2 className="w-5 h-5" />
                    Thưởng hàng tháng
                  </CardTitle>
                  <CardDescription>
                    Các khoản thưởng được tính theo tháng cho vị trí {program.position}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  {program.monthlyRewards && program.monthlyRewards.length > 0 ? (
                    <div className="space-y-4 flex-1">
                      {program.monthlyRewards.map((reward, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-lg">{reward.name}</h4>
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              {formatCurrency(reward.value)}
                            </Badge>
                          </div>
                          
                          {reward.description && (
                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                          )}
                          
                          {reward.conditions && reward.conditions.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">Điều kiện:</h5>
                              <div className="space-y-1">
                                {reward.conditions.map((condition, condIndex) => (
                                  <div key={condIndex} className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">{condition.metric}:</span>
                                    <span>{condition.operator} {condition.value}</span>
                                    {condition.unit && <span className="text-muted-foreground">({condition.unit})</span>}
                                    {condition.secondValue && (
                                      <span className="text-muted-foreground">
                                        - {condition.secondValue} {condition.unit}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                      <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Chưa có thưởng tháng</h3>
                      <p className="text-sm">Chương trình này chưa có khoản thưởng tháng nào được thiết lập</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Annual Rewards */}
            <TabsContent value="annual" className="space-y-4">
              <Card className="min-h-[400px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-600">
                    <CheckCircle2 className="w-5 h-5" />
                    Thưởng hàng năm
                  </CardTitle>
                  <CardDescription>
                    Các khoản thưởng được tính theo năm cho vị trí {program.position}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  {program.annualRewards.length > 0 ? (
                    <div className="space-y-4 flex-1">
                      {program.annualRewards.map((reward, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-lg">{reward.name}</h4>
                            <Badge variant="outline" className="text-purple-600 border-purple-200">
                              {formatCurrency(reward.value)}
                            </Badge>
                          </div>
                          
                          {reward.description && (
                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                          )}
                          
                          {reward.conditions && reward.conditions.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">Điều kiện:</h5>
                              <div className="space-y-1">
                                {reward.conditions.map((condition, condIndex) => (
                                  <div key={condIndex} className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">{condition.metric}:</span>
                                    <span>{condition.operator} {condition.value}</span>
                                    {condition.unit && <span className="text-muted-foreground">({condition.unit})</span>}
                                    {condition.secondValue && (
                                      <span className="text-muted-foreground">
                                        - {condition.secondValue} {condition.unit}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                      <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Chưa có thưởng năm</h3>
                      <p className="text-sm">Chương trình này chưa có khoản thưởng năm nào được thiết lập</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Penalties */}
            <TabsContent value="penalties" className="space-y-4">
              <Card className="min-h-[400px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Hình phạt
                  </CardTitle>
                  <CardDescription>
                    Các khoản phạt áp dụng cho vị trí {program.position}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  {program.penalties.length > 0 ? (
                    <div className="space-y-4 flex-1">
                      {program.penalties.map((penalty, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3 border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-lg text-red-800 dark:text-red-200">{penalty.name}</h4>
                            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                              -{formatCurrency(penalty.value)}
                            </Badge>
                          </div>
                          
                          {penalty.description && (
                            <p className="text-sm text-muted-foreground">{penalty.description}</p>
                          )}
                          
                          {penalty.conditions && penalty.conditions.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">Điều kiện:</h5>
                              <div className="space-y-1">
                                {penalty.conditions.map((condition, condIndex) => (
                                  <div key={condIndex} className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">{condition.metric}:</span>
                                    <span>{condition.operator} {condition.value}</span>
                                    {condition.unit && <span className="text-muted-foreground">({condition.unit})</span>}
                                    {condition.secondValue && (
                                      <span className="text-muted-foreground">
                                        - {condition.secondValue} {condition.unit}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                      <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Chưa có hình phạt</h3>
                      <p className="text-sm">Chương trình này chưa có khoản phạt nào được thiết lập</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
