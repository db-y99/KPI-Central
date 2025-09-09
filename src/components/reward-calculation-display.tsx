'use client';
import { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Award,
  AlertTriangle,
  Eye,
  MinusCircle,
  ShieldAlert
} from 'lucide-react';
import type { RewardCalculation, RewardBreakdown, PenaltyBreakdown, Employee } from '@/types';
import { DataContext } from '@/context/data-context';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

interface RewardCalculationDisplayProps {
  calculation: RewardCalculation;
  showActions?: boolean;
}

export default function RewardCalculationDisplay({ 
  calculation, 
  showActions = false 
}: RewardCalculationDisplayProps) {
  const { 
    employees, 
    approveRewardCalculation, 
    rejectRewardCalculation 
  } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const [showDetails, setShowDetails] = useState(false);
  const [processing, setProcessing] = useState(false);

  const employee = employees.find(e => e.uid === calculation.employeeId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'calculated':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'calculated':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async () => {
    if (!user) return;
    
    setProcessing(true);
    try {
      await approveRewardCalculation(calculation.id, user.uid!);
      toast({
        title: 'Thành công!',
        description: 'Đã phê duyệt tính toán thưởng.',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể phê duyệt tính toán thưởng.',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Lý do từ chối:');
    if (!reason) return;
    
    setProcessing(true);
    try {
      await rejectRewardCalculation(calculation.id, reason);
      toast({
        title: 'Đã từ chối',
        description: 'Đã từ chối tính toán thưởng.',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể từ chối tính toán thưởng.',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const renderConditionStatus = (breakdown: RewardBreakdown) => {
    const totalConditions = breakdown.conditions.length;
    const metConditions = breakdown.conditions.filter(c => c.met).length;
    const percentage = totalConditions > 0 ? (metConditions / totalConditions) * 100 : 0;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Điều kiện đạt được:</span>
          <span className="font-medium">{metConditions}/{totalConditions}</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="space-y-1">
          {breakdown.conditions.map((condition, index) => (
            <div key={index} className="flex items-center text-xs">
              {condition.met ? (
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={condition.met ? 'text-green-700' : 'text-red-700'}>
                {condition.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span>Tính toán thưởng - {calculation.frequency === 'monthly' ? 'Tháng' : 
                                       calculation.frequency === 'quarterly' ? 'Quý' : 'Năm'}</span>
              </CardTitle>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span>{employee?.name}</span>
                <span>•</span>
                <span>{employee?.position}</span>
                <span>•</span>
                <span>{calculation.period}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(calculation.status)}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(calculation.status)}
                  <span className="capitalize">{calculation.status}</span>
                </div>
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Tổng thưởng</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(calculation.totalReward)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MinusCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-red-600 font-medium">Tổng phạt</p>
                    <p className="text-2xl font-bold text-red-700">
                      {formatCurrency(calculation.totalPenalty || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Thực nhận</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(calculation.netAmount || calculation.totalReward)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Tiêu chí đạt</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {calculation.breakdown.filter(b => b.rewardAmount > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Vi phạm</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {(calculation.penalties || []).filter(p => p.penaltyAmount > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Chi tiết tính toán</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(true)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Xem chi tiết
              </Button>
            </div>

            <div className="space-y-3">
              {calculation.breakdown.slice(0, 3).map((breakdown, index) => (
                <Card key={index} className={`p-4 ${breakdown.rewardAmount > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{breakdown.criteriaName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{breakdown.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {breakdown.rewardAmount > 0 ? 
                          formatCurrency(breakdown.rewardAmount) : 
                          <span className="text-gray-400">Không đạt</span>
                        }
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {breakdown.type === 'fixed' ? 'Cố định' :
                         breakdown.type === 'variable' ? 'Biến động' :
                         breakdown.type === 'percentage' ? 'Phần trăm' : 'Điểm'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
              
              {calculation.breakdown.length > 3 && (
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowDetails(true)}
                  >
                    Xem thêm {calculation.breakdown.length - 3} tiêu chí...
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Penalties Section */}
          {(calculation.penalties || []).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-red-600 flex items-center">
                  <ShieldAlert className="h-5 w-5 mr-2" />
                  Vi phạm và Phạt
                </h3>
              </div>

              <div className="space-y-3">
                {(calculation.penalties || []).slice(0, 3).map((penalty, index) => (
                  <Card key={index} className={`p-4 ${penalty.penaltyAmount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium flex items-center">
                          {penalty.criteriaName}
                          <Badge 
                            variant="outline" 
                            className={`ml-2 text-xs ${
                              penalty.severity === 'high' ? 'border-red-300 text-red-600' :
                              penalty.severity === 'medium' ? 'border-yellow-300 text-yellow-600' :
                              'border-gray-300 text-gray-600'
                            }`}
                          >
                            {penalty.severity === 'high' ? 'Nghiêm trọng' :
                             penalty.severity === 'medium' ? 'Trung bình' : 'Nhẹ'}
                          </Badge>
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{penalty.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {penalty.penaltyAmount > 0 ? (
                            <span className="text-red-600">-{formatCurrency(penalty.penaltyAmount)}</span>
                          ) : penalty.type === 'warning' ? (
                            <span className="text-yellow-600">Cảnh cáo</span>
                          ) : (
                            <span className="text-gray-400">Không vi phạm</span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {penalty.type === 'fixed' ? 'Cố định' :
                           penalty.type === 'variable' ? 'Biến động' :
                           penalty.type === 'percentage' ? 'Phần trăm' : 'Cảnh cáo'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {(calculation.penalties || []).length > 3 && (
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowDetails(true)}
                    >
                      Xem thêm {(calculation.penalties || []).length - 3} vi phạm...
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {showActions && calculation.status === 'calculated' && (
            <div className="flex space-x-4 pt-4 border-t">
              <Button
                onClick={handleApprove}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Phê duyệt
              </Button>
              <Button
                onClick={handleReject}
                disabled={processing}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Từ chối
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <div>Tính toán lúc: {new Date(calculation.calculatedAt).toLocaleString('vi-VN')}</div>
            {calculation.approvedAt && (
              <div>Phê duyệt lúc: {new Date(calculation.approvedAt).toLocaleString('vi-VN')}</div>
            )}
            {calculation.notes && (
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                <span>Ghi chú: {calculation.notes}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết tính toán thưởng</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
              <div>
                <p className="text-sm text-gray-600">Nhân viên:</p>
                <p className="font-medium">{employee?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vị trí:</p>
                <p className="font-medium">{employee?.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kỳ đánh giá:</p>
                <p className="font-medium">{calculation.period}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tần suất:</p>
                <p className="font-medium capitalize">{calculation.frequency}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Chi tiết từng tiêu chí</h3>
              <div className="space-y-4">
                {calculation.breakdown.map((breakdown, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{breakdown.criteriaName}</h4>
                          <p className="text-sm text-gray-600">{breakdown.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            {formatCurrency(breakdown.rewardAmount)}
                          </div>
                          <Badge variant="outline">
                            {breakdown.type === 'fixed' ? 'Cố định' :
                             breakdown.type === 'variable' ? 'Biến động' :
                             breakdown.type === 'percentage' ? 'Phần trăm' : 'Điểm'}
                          </Badge>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Giá trị cơ sở:</p>
                          <p className="font-medium">{formatCurrency(breakdown.baseValue)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Giá trị thực tế:</p>
                          <p className="font-medium">{breakdown.actualValue}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Thưởng nhận được:</p>
                          <p className="font-medium text-green-600">{formatCurrency(breakdown.rewardAmount)}</p>
                        </div>
                      </div>

                      {breakdown.conditions.length > 0 && (
                        <>
                          <Separator />
                          {renderConditionStatus(breakdown)}
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Penalty Details Section */}
            {(calculation.penalties || []).length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4 text-red-600 flex items-center">
                  <ShieldAlert className="h-5 w-5 mr-2" />
                  Chi tiết Vi phạm và Phạt
                </h3>
                <div className="space-y-4">
                  {(calculation.penalties || []).map((penalty, index) => (
                    <Card key={index} className="p-4 border-red-200">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium flex items-center">
                              {penalty.criteriaName}
                              <Badge 
                                variant="outline" 
                                className={`ml-2 text-xs ${
                                  penalty.severity === 'high' ? 'border-red-300 text-red-600' :
                                  penalty.severity === 'medium' ? 'border-yellow-300 text-yellow-600' :
                                  'border-gray-300 text-gray-600'
                                }`}
                              >
                                {penalty.severity === 'high' ? 'Nghiêm trọng' :
                                 penalty.severity === 'medium' ? 'Trung bình' : 'Nhẹ'}
                              </Badge>
                            </h4>
                            <p className="text-sm text-gray-600">{penalty.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">
                              {penalty.penaltyAmount > 0 ? (
                                <span className="text-red-600">-{formatCurrency(penalty.penaltyAmount)}</span>
                              ) : penalty.type === 'warning' ? (
                                <span className="text-yellow-600">Cảnh cáo</span>
                              ) : (
                                <span className="text-gray-400">Không vi phạm</span>
                              )}
                            </div>
                            <Badge variant="outline">
                              {penalty.type === 'fixed' ? 'Cố định' :
                               penalty.type === 'variable' ? 'Biến động' :
                               penalty.type === 'percentage' ? 'Phần trăm' : 'Cảnh cáo'}
                            </Badge>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Giá trị phạt cơ sở:</p>
                            <p className="font-medium">{penalty.type === 'warning' ? 'Cảnh cáo' : formatCurrency(penalty.baseValue)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Giá trị thực tế:</p>
                            <p className="font-medium">{penalty.actualValue}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Phạt áp dụng:</p>
                            <p className="font-medium text-red-600">
                              {penalty.penaltyAmount > 0 ? formatCurrency(penalty.penaltyAmount) : 
                               penalty.type === 'warning' ? 'Cảnh cáo' : 'Không áp dụng'}
                            </p>
                          </div>
                        </div>

                        {penalty.conditions.length > 0 && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Điều kiện vi phạm:</span>
                                <span className="font-medium">
                                  {penalty.conditions.filter(c => c.met).length}/{penalty.conditions.length}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {penalty.conditions.map((condition, condIndex) => (
                                  <div key={condIndex} className="flex items-center text-xs">
                                    {condition.met ? (
                                      <XCircle className="h-3 w-3 text-red-500 mr-1" />
                                    ) : (
                                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                    )}
                                    <span className={condition.met ? 'text-red-700' : 'text-green-700'}>
                                      {condition.description}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
