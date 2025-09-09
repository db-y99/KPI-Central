'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import type { RewardCondition, PenaltyCondition } from '@/types';

interface RewardConditionManagerProps {
  conditions: (RewardCondition | PenaltyCondition)[];
  onConditionsChange: (conditions: (RewardCondition | PenaltyCondition)[]) => void;
  title?: string;
  description?: string;
}

export function RewardConditionManager({ 
  conditions, 
  onConditionsChange, 
  title = "Điều kiện thưởng",
  description = "Thiết lập các điều kiện cần đạt được để nhận thưởng"
}: RewardConditionManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newCondition, setNewCondition] = useState<Partial<RewardCondition>>({
    metric: '',
    operator: '>=',
    value: 0,
    secondValue: null,
    unit: null
  });

  const operators = [
    { value: '>=', label: 'Lớn hơn hoặc bằng (≥)' },
    { value: '>', label: 'Lớn hơn (>)' },
    { value: '<=', label: 'Nhỏ hơn hoặc bằng (≤)' },
    { value: '<', label: 'Nhỏ hơn (<)' },
    { value: '==', label: 'Bằng (=)' },
    { value: '!=', label: 'Khác (!=)' },
    { value: 'between', label: 'Trong khoảng' },
    { value: 'contains', label: 'Chứa' },
    { value: 'not_contains', label: 'Không chứa' }
  ];

  const commonMetrics = [
    'Số lượng khách hàng',
    'Tỷ lệ hoàn thành',
    'Doanh thu',
    'Lợi nhuận',
    'Thời gian phản hồi',
    'Chất lượng dịch vụ',
    'Số lượng sản phẩm',
    'Tỷ lệ chuyển đổi',
    'Điểm đánh giá',
    'Số giờ làm việc',
    'Tỷ lệ tăng trưởng',
    'Số lỗi',
    'Thời gian chết hệ thống',
    'Tỷ lệ nợ xấu',
    'Số hồ sơ xử lý'
  ];

  const commonUnits = [
    'VND',
    '%',
    'khách hàng',
    'sản phẩm',
    'giờ',
    'ngày',
    'tháng',
    'năm',
    'lần',
    'điểm',
    'file',
    'báo cáo'
  ];

  const handleAddCondition = () => {
    if (newCondition.metric && newCondition.operator && newCondition.value !== undefined) {
      const condition: RewardCondition = {
        metric: newCondition.metric!,
        operator: newCondition.operator as any,
        value: newCondition.value!,
        secondValue: newCondition.secondValue || null,
        unit: newCondition.unit || null
      };

      onConditionsChange([...conditions, condition]);
      setNewCondition({
        metric: '',
        operator: '>=',
        value: 0,
        secondValue: null,
        unit: null
      });
    }
  };

  const handleEditCondition = (index: number) => {
    const condition = conditions[index];
    setNewCondition({
      metric: condition.metric,
      operator: condition.operator,
      value: condition.value,
      secondValue: condition.secondValue,
      unit: condition.unit
    });
    setEditingIndex(index);
  };

  const handleUpdateCondition = () => {
    if (editingIndex !== null && newCondition.metric && newCondition.operator && newCondition.value !== undefined) {
      const updatedConditions = [...conditions];
      updatedConditions[editingIndex] = {
        metric: newCondition.metric!,
        operator: newCondition.operator as any,
        value: newCondition.value!,
        secondValue: newCondition.secondValue || null,
        unit: newCondition.unit || null
      };
      
      onConditionsChange(updatedConditions);
      setEditingIndex(null);
      setNewCondition({
        metric: '',
        operator: '>=',
        value: 0,
        secondValue: null,
        unit: null
      });
    }
  };

  const handleDeleteCondition = (index: number) => {
    const updatedConditions = conditions.filter((_, i) => i !== index);
    onConditionsChange(updatedConditions);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewCondition({
      metric: '',
      operator: '>=',
      value: 0,
      secondValue: null,
      unit: null
    });
  };

  const formatCondition = (condition: RewardCondition | PenaltyCondition) => {
    let text = `${condition.metric} ${condition.operator} ${condition.value}`;
    
    if (condition.operator === 'between' && condition.secondValue) {
      text = `${condition.metric} từ ${condition.value} đến ${condition.secondValue}`;
    } else if (condition.operator === 'contains' || condition.operator === 'not_contains') {
      text = `${condition.metric} ${condition.operator === 'contains' ? 'chứa' : 'không chứa'} "${condition.value}"`;
    }
    
    if (condition.unit) {
      text += ` ${condition.unit}`;
    }
    
    return text;
  };

  const getOperatorLabel = (operator: string) => {
    const op = operators.find(o => o.value === operator);
    return op ? op.label : operator;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{title}</span>
          <Badge variant="outline">{conditions.length}</Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Form */}
        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
          <h4 className="font-medium">
            {editingIndex !== null ? 'Chỉnh sửa điều kiện' : 'Thêm điều kiện mới'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metric">Chỉ số</Label>
              <Select
                value={newCondition.metric || ''}
                onValueChange={(value) => setNewCondition(prev => ({ ...prev, metric: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chỉ số" />
                </SelectTrigger>
                <SelectContent>
                  {commonMetrics.map(metric => (
                    <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="operator">Toán tử</Label>
              <Select
                value={newCondition.operator || '>='}
                onValueChange={(value) => setNewCondition(prev => ({ ...prev, operator: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn toán tử" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map(op => (
                    <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Giá trị</Label>
              <Input
                id="value"
                type="number"
                value={newCondition.value || ''}
                onChange={(e) => setNewCondition(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
            
            {(newCondition.operator === 'between') && (
              <div className="space-y-2">
                <Label htmlFor="secondValue">Giá trị thứ 2</Label>
                <Input
                  id="secondValue"
                  type="number"
                  value={newCondition.secondValue || ''}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, secondValue: parseFloat(e.target.value) || null }))}
                  placeholder="0"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="unit">Đơn vị (tùy chọn)</Label>
              <Select
                value={newCondition.unit || 'none'}
                onValueChange={(value) => setNewCondition(prev => ({ ...prev, unit: value === 'none' ? null : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có đơn vị</SelectItem>
                  {commonUnits.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            {editingIndex !== null ? (
              <>
                <Button onClick={handleUpdateCondition} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Cập nhật
                </Button>
                <Button onClick={handleCancelEdit} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
              </>
            ) : (
              <Button onClick={handleAddCondition} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Thêm điều kiện
              </Button>
            )}
          </div>
        </div>

        {/* Conditions List */}
        {conditions.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium">Danh sách điều kiện</h4>
            <div className="space-y-2">
              {conditions.map((condition, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div className="flex-1">
                    <div className="font-medium">{formatCondition(condition)}</div>
                    <div className="text-sm text-muted-foreground">
                      {getOperatorLabel(condition.operator)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCondition(index)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCondition(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Chưa có điều kiện nào</p>
            <p className="text-sm">Thêm điều kiện đầu tiên bằng form ở trên</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
