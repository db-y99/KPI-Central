'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Edit, Save, X, DollarSign, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RewardConditionManager } from '@/components/reward-condition-manager';
import type { RewardProgram, RewardCriteria, PenaltyCriteria, RewardCondition, PenaltyCondition } from '@/types';

interface EditRewardProgramFormProps {
  program: RewardProgram;
  onSave: (updatedProgram: RewardProgram) => void;
  onCancel: () => void;
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditRewardProgramForm({ 
  program, 
  onSave, 
  onCancel, 
  children,
  isOpen = false,
  onOpenChange
}: EditRewardProgramFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<RewardProgram>(program);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(program);
  }, [program]);

  const handleInputChange = (field: keyof RewardProgram, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRewardChange = (type: 'quarterly' | 'monthly' | 'annual', index: number, field: keyof RewardCriteria, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const rewards = [...(newData[`${type}Rewards`] as RewardCriteria[])];
      rewards[index] = { ...rewards[index], [field]: value };
      (newData as any)[`${type}Rewards`] = rewards;
      return newData;
    });
  };

  const handlePenaltyChange = (index: number, field: keyof PenaltyCriteria, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const penalties = [...newData.penalties];
      penalties[index] = { ...penalties[index], [field]: value };
      newData.penalties = penalties;
      return newData;
    });
  };

  const addReward = (type: 'quarterly' | 'monthly' | 'annual') => {
    const newReward: RewardCriteria = {
      name: '',
      description: '',
      value: 0,
      maxValue: null,
      conditions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setFormData(prev => {
      const newData = { ...prev };
      const rewards = [...(newData[`${type}Rewards`] as RewardCriteria[]), newReward];
      (newData as any)[`${type}Rewards`] = rewards;
      return newData;
    });
  };

  const removeReward = (type: 'quarterly' | 'monthly' | 'annual', index: number) => {
    setFormData(prev => {
      const newData = { ...prev };
      const rewards = [...(newData[`${type}Rewards`] as RewardCriteria[])];
      rewards.splice(index, 1);
      (newData as any)[`${type}Rewards`] = rewards;
      return newData;
    });
  };

  const addPenalty = () => {
    const newPenalty: PenaltyCriteria = {
      name: '',
      description: '',
      value: 0,
      maxValue: null,
      conditions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setFormData(prev => ({
      ...prev,
      penalties: [...prev.penalties, newPenalty]
    }));
  };

  const removePenalty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      penalties: prev.penalties.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedProgram = {
        ...formData,
        updatedAt: new Date().toISOString()
      };

      await onSave(updatedProgram);
      
      toast({
        title: "Thành công!",
        description: "Chương trình thưởng đã được cập nhật.",
      });

      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating reward program:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật chương trình thưởng. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const renderRewardSection = (
    type: 'quarterly' | 'monthly' | 'annual',
    title: string,
    icon: React.ReactNode,
    color: string
  ) => {
    const rewards = formData[`${type}Rewards`] as RewardCriteria[] || [];
    
    return (
      <TabsContent value={type} className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {icon}
                <CardTitle className={color}>{title}</CardTitle>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addReward(type)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm thưởng
              </Button>
            </div>
            <CardDescription>
              Cấu hình các khoản thưởng {type === 'quarterly' ? 'hàng quý' : type === 'monthly' ? 'hàng tháng' : 'hàng năm'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rewards.length > 0 ? (
              rewards.map((reward, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Thưởng #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReward(type, index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${type}-${index}-name`}>Tên thưởng</Label>
                      <Input
                        id={`${type}-${index}-name`}
                        value={reward.name}
                        onChange={(e) => handleRewardChange(type, index, 'name', e.target.value)}
                        placeholder="Nhập tên thưởng"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${type}-${index}-value`}>Giá trị (VND)</Label>
                      <Input
                        id={`${type}-${index}-value`}
                        type="number"
                        value={reward.value}
                        onChange={(e) => handleRewardChange(type, index, 'value', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`${type}-${index}-description`}>Mô tả</Label>
                    <Textarea
                      id={`${type}-${index}-description`}
                      value={reward.description}
                      onChange={(e) => handleRewardChange(type, index, 'description', e.target.value)}
                      placeholder="Mô tả chi tiết về khoản thưởng"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`${type}-${index}-maxValue`}>Giá trị tối đa (VND) - Tùy chọn</Label>
                    <Input
                      id={`${type}-${index}-maxValue`}
                      type="number"
                      value={reward.maxValue || ''}
                      onChange={(e) => handleRewardChange(type, index, 'maxValue', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Không giới hạn"
                    />
                  </div>
                  
                  {/* Conditions Manager */}
                  <div className="space-y-2">
                    <Label>Điều kiện thưởng</Label>
                    <RewardConditionManager
                      conditions={reward.conditions || []}
                      onConditionsChange={(conditions) => 
                        handleRewardChange(type, index, 'conditions', conditions as RewardCondition[])
                      }
                      title={`Điều kiện cho ${reward.name}`}
                      description="Thiết lập các điều kiện cần đạt được để nhận thưởng này"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có thưởng {type === 'quarterly' ? 'quý' : type === 'monthly' ? 'tháng' : 'năm'}</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addReward(type)}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm thưởng đầu tiên
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    );
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên chương trình</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên chương trình"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Vị trí</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Nhập vị trí"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Mô tả chương trình thưởng"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Năm</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                placeholder="2024"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Tần suất thưởng</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => handleInputChange('frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tần suất" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Hàng tháng</SelectItem>
                  <SelectItem value="quarterly">Hàng quý</SelectItem>
                  <SelectItem value="annual">Hàng năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => {
                    // Use setTimeout to defer the state update
                    setTimeout(() => {
                      handleInputChange('isActive', checked);
                    }, 0);
                  }}
                />
                <Label htmlFor="isActive">Chương trình hoạt động</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình thưởng</CardTitle>
          <CardDescription>
            Thiết lập các khoản thưởng cho từng loại tần suất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quarterly" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quarterly">Thưởng quý</TabsTrigger>
              <TabsTrigger value="monthly">Thưởng tháng</TabsTrigger>
              <TabsTrigger value="annual">Thưởng năm</TabsTrigger>
            </TabsList>

            {renderRewardSection('quarterly', 'Thưởng hàng quý', <CheckCircle2 className="w-5 h-5 text-green-600" />, 'text-green-600')}
            {renderRewardSection('monthly', 'Thưởng hàng tháng', <CheckCircle2 className="w-5 h-5 text-blue-600" />, 'text-blue-600')}
            {renderRewardSection('annual', 'Thưởng hàng năm', <CheckCircle2 className="w-5 h-5 text-purple-600" />, 'text-purple-600')}
          </Tabs>
        </CardContent>
      </Card>

      {/* Penalties Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-600">Cấu hình phạt</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPenalty}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm phạt
            </Button>
          </div>
          <CardDescription>
            Thiết lập các khoản phạt áp dụng cho vị trí này
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.penalties.length > 0 ? (
            formData.penalties.map((penalty, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4 border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-red-800 dark:text-red-200">Phạt #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePenalty(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`penalty-${index}-name`}>Tên phạt</Label>
                    <Input
                      id={`penalty-${index}-name`}
                      value={penalty.name}
                      onChange={(e) => handlePenaltyChange(index, 'name', e.target.value)}
                      placeholder="Nhập tên phạt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`penalty-${index}-value`}>Giá trị (VND)</Label>
                    <Input
                      id={`penalty-${index}-value`}
                      type="number"
                      value={penalty.value}
                      onChange={(e) => handlePenaltyChange(index, 'value', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`penalty-${index}-description`}>Mô tả</Label>
                  <Textarea
                    id={`penalty-${index}-description`}
                    value={penalty.description}
                    onChange={(e) => handlePenaltyChange(index, 'description', e.target.value)}
                    placeholder="Mô tả chi tiết về khoản phạt"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`penalty-${index}-maxValue`}>Giá trị tối đa (VND) - Tùy chọn</Label>
                  <Input
                    id={`penalty-${index}-maxValue`}
                    type="number"
                    value={penalty.maxValue || ''}
                    onChange={(e) => handlePenaltyChange(index, 'maxValue', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Không giới hạn"
                  />
                </div>
                
                {/* Penalty Conditions Manager */}
                <div className="space-y-2">
                  <Label>Điều kiện phạt</Label>
                  <RewardConditionManager
                    conditions={penalty.conditions || []}
                    onConditionsChange={(conditions) => 
                      handlePenaltyChange(index, 'conditions', conditions as PenaltyCondition[])
                    }
                    title={`Điều kiện cho ${penalty.name}`}
                    description="Thiết lập các điều kiện dẫn đến việc bị phạt"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có hình phạt nào</p>
              <Button
                type="button"
                variant="outline"
                onClick={addPenalty}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm phạt đầu tiên
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2" />
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (children) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chương trình thưởng</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // If isOpen is true, just return content without wrapper
  if (isOpen) {
    return content;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Chỉnh sửa chương trình thưởng</h1>
        <p className="text-muted-foreground mt-2">
          Cập nhật thông tin và cấu hình cho chương trình thưởng
        </p>
      </div>
      {content}
    </div>
  );
}
