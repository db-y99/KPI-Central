'use client';
import { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save } from 'lucide-react';
import type { RewardProgram, RewardCriteria, RewardCondition } from '@/types';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';

interface AddRewardProgramFormProps {
  onClose: () => void;
  existingProgram?: RewardProgram;
  mode?: 'create' | 'edit';
}

export default function AddRewardProgramForm({ 
  onClose, 
  existingProgram, 
  mode = 'create' 
}: AddRewardProgramFormProps) {
  const { addRewardProgram, updateRewardProgram } = useContext(DataContext);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: existingProgram?.name || '',
    description: existingProgram?.description || '',
    position: existingProgram?.position || '',
    year: existingProgram?.year || new Date().getFullYear(),
    isActive: existingProgram?.isActive ?? true,
  });

  const [quarterlyRewards, setQuarterlyRewards] = useState<RewardCriteria[]>(
    existingProgram?.quarterlyRewards || []
  );
  const [monthlyRewards, setMonthlyRewards] = useState<RewardCriteria[]>(
    existingProgram?.monthlyRewards || []
  );
  const [annualRewards, setAnnualRewards] = useState<RewardCriteria[]>(
    existingProgram?.annualRewards || []
  );

  const positions = [
    'IT Staff',
    'Head of Marketing', 
    'Marketing Assistant',
    'Customer Service Officer',
    'Credit Appraiser',
    'HR/Admin Staff',
    'Accountant'
  ];

  const addRewardCriteria = (frequency: 'monthly' | 'quarterly' | 'annually') => {
    const newCriteria: RewardCriteria = {
      id: `criteria-${Date.now()}`,
      name: '',
      description: '',
      type: 'fixed',
      value: 0,
      frequency,
      conditions: [],
      isActive: true
    };

    if (frequency === 'monthly') {
      setMonthlyRewards(prev => [...prev, newCriteria]);
    } else if (frequency === 'quarterly') {
      setQuarterlyRewards(prev => [...prev, newCriteria]);
    } else {
      setAnnualRewards(prev => [...prev, newCriteria]);
    }
  };

  const updateRewardCriteria = (
    frequency: 'monthly' | 'quarterly' | 'annually',
    index: number,
    updates: Partial<RewardCriteria>
  ) => {
    if (frequency === 'monthly') {
      setMonthlyRewards(prev => prev.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      ));
    } else if (frequency === 'quarterly') {
      setQuarterlyRewards(prev => prev.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      ));
    } else {
      setAnnualRewards(prev => prev.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      ));
    }
  };

  const removeRewardCriteria = (frequency: 'monthly' | 'quarterly' | 'annually', index: number) => {
    if (frequency === 'monthly') {
      setMonthlyRewards(prev => prev.filter((_, i) => i !== index));
    } else if (frequency === 'quarterly') {
      setQuarterlyRewards(prev => prev.filter((_, i) => i !== index));
    } else {
      setAnnualRewards(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addCondition = (
    frequency: 'monthly' | 'quarterly' | 'annually',
    criteriaIndex: number
  ) => {
    const newCondition: RewardCondition = {
      id: `condition-${Date.now()}`,
      metric: '',
      operator: 'gte',
      value: 0
    };

    updateRewardCriteria(frequency, criteriaIndex, {
      conditions: [...(getRewardsList(frequency)[criteriaIndex]?.conditions || []), newCondition]
    });
  };

  const updateCondition = (
    frequency: 'monthly' | 'quarterly' | 'annually',
    criteriaIndex: number,
    conditionIndex: number,
    updates: Partial<RewardCondition>
  ) => {
    const criteria = getRewardsList(frequency)[criteriaIndex];
    const updatedConditions = criteria.conditions.map((condition, i) =>
      i === conditionIndex ? { ...condition, ...updates } : condition
    );
    updateRewardCriteria(frequency, criteriaIndex, { conditions: updatedConditions });
  };

  const removeCondition = (
    frequency: 'monthly' | 'quarterly' | 'annually',
    criteriaIndex: number,
    conditionIndex: number
  ) => {
    const criteria = getRewardsList(frequency)[criteriaIndex];
    const updatedConditions = criteria.conditions.filter((_, i) => i !== conditionIndex);
    updateRewardCriteria(frequency, criteriaIndex, { conditions: updatedConditions });
  };

  const getRewardsList = (frequency: 'monthly' | 'quarterly' | 'annually') => {
    return frequency === 'monthly' ? monthlyRewards :
           frequency === 'quarterly' ? quarterlyRewards :
           annualRewards;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const programData: Omit<RewardProgram, 'id'> = {
        ...formData,
        quarterlyRewards,
        monthlyRewards,
        annualRewards,
        createdAt: existingProgram?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (mode === 'edit' && existingProgram) {
        await updateRewardProgram(existingProgram.id, programData);
        toast({
          title: 'Thành công!',
          description: 'Đã cập nhật chương trình khen thưởng.',
        });
      } else {
        await addRewardProgram(programData);
        toast({
          title: 'Thành công!',
          description: 'Đã tạo chương trình khen thưởng mới.',
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu chương trình khen thưởng.',
        variant: 'destructive'
      });
    }
  };

  const renderRewardCriteriaForm = (
    criteria: RewardCriteria,
    frequency: 'monthly' | 'quarterly' | 'annually',
    index: number
  ) => (
    <Card key={criteria.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Tiêu chí {index + 1}</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeRewardCriteria(frequency, index)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Tên tiêu chí</Label>
            <Input
              value={criteria.name}
              onChange={(e) => updateRewardCriteria(frequency, index, { name: e.target.value })}
              placeholder="Tên tiêu chí khen thưởng"
            />
          </div>
          <div>
            <Label>Loại thưởng</Label>
            <Select
              value={criteria.type}
              onValueChange={(value: any) => updateRewardCriteria(frequency, index, { type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Cố định</SelectItem>
                <SelectItem value="variable">Biến động</SelectItem>
                <SelectItem value="percentage">Phần trăm</SelectItem>
                <SelectItem value="points">Điểm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Mô tả</Label>
          <Textarea
            value={criteria.description}
            onChange={(e) => updateRewardCriteria(frequency, index, { description: e.target.value })}
            placeholder="Mô tả tiêu chí khen thưởng"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Giá trị thưởng</Label>
            <Input
              type="number"
              value={criteria.value}
              onChange={(e) => updateRewardCriteria(frequency, index, { value: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
          {(criteria.type === 'variable' || criteria.type === 'percentage') && (
            <div>
              <Label>Giá trị tối đa</Label>
              <Input
                type="number"
                value={criteria.maxValue || ''}
                onChange={(e) => updateRewardCriteria(frequency, index, { 
                  maxValue: e.target.value ? Number(e.target.value) : undefined 
                })}
                placeholder="Không giới hạn"
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Điều kiện ({criteria.conditions.length})</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addCondition(frequency, index)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Thêm điều kiện
            </Button>
          </div>

          {criteria.conditions.map((condition, conditionIndex) => (
            <div key={condition.id} className="border p-3 rounded mb-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <div>
                  <Label className="text-xs">Metric</Label>
                  <Input
                    value={condition.metric}
                    onChange={(e) => updateCondition(frequency, index, conditionIndex, { metric: e.target.value })}
                    placeholder="metric_name"
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Điều kiện</Label>
                  <Select
                    value={condition.operator}
                    onValueChange={(value: any) => updateCondition(frequency, index, conditionIndex, { operator: value })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gt">Lớn hơn (&gt;)</SelectItem>
                      <SelectItem value="gte">Lớn hơn bằng (&gt;=)</SelectItem>
                      <SelectItem value="lt">Nhỏ hơn (&lt;)</SelectItem>
                      <SelectItem value="lte">Nhỏ hơn bằng (&lt;=)</SelectItem>
                      <SelectItem value="eq">Bằng (=)</SelectItem>
                      <SelectItem value="range">Trong khoảng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Giá trị</Label>
                  <Input
                    type="number"
                    value={condition.value}
                    onChange={(e) => updateCondition(frequency, index, conditionIndex, { value: Number(e.target.value) })}
                    className="text-xs"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCondition(frequency, index, conditionIndex)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Tên chương trình *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Tên chương trình khen thưởng"
          />
        </div>
        <div>
          <Label htmlFor="position">Vị trí *</Label>
          <Select
            value={formData.position}
            onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn vị trí" />
            </SelectTrigger>
            <SelectContent>
              {positions.map(position => (
                <SelectItem key={position} value={position}>{position}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year">Năm</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
            min="2020"
            max="2030"
          />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="rounded"
          />
          <Label htmlFor="isActive">Chương trình đang hoạt động</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          placeholder="Mô tả chương trình khen thưởng"
        />
      </div>

      <Tabs defaultValue="quarterly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quarterly">
            Theo quý ({quarterlyRewards.length})
          </TabsTrigger>
          <TabsTrigger value="monthly">
            Theo tháng ({monthlyRewards.length})
          </TabsTrigger>
          <TabsTrigger value="annual">
            Theo năm ({annualRewards.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quarterly" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Khen thưởng theo quý</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => addRewardCriteria('quarterly')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Thêm tiêu chí
            </Button>
          </div>
          {quarterlyRewards.map((criteria, index) => 
            renderRewardCriteriaForm(criteria, 'quarterly', index)
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Khen thưởng theo tháng</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => addRewardCriteria('monthly')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Thêm tiêu chí
            </Button>
          </div>
          {monthlyRewards.map((criteria, index) => 
            renderRewardCriteriaForm(criteria, 'monthly', index)
          )}
        </TabsContent>

        <TabsContent value="annual" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Khen thưởng theo năm</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => addRewardCriteria('annually')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Thêm tiêu chí
            </Button>
          </div>
          {annualRewards.map((criteria, index) => 
            renderRewardCriteriaForm(criteria, 'annually', index)
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
          <Save className="h-4 w-4 mr-2" />
          {mode === 'edit' ? 'Cập nhật' : 'Tạo'} chương trình
        </Button>
      </div>
    </form>
  );
}
