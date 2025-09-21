'use client';
import { useState, useContext, useEffect } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { MetricData, PositionConfig, Employee, PositionMetric } from '@/types';
import { DataContext } from '@/context/data-context';
import { AuthContext } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';

interface MetricDataFormProps {
  onClose: () => void;
  selectedPeriod?: string;
  selectedEmployeeId?: string;
}

export default function MetricDataForm({ 
  onClose, 
  selectedPeriod, 
  selectedEmployeeId 
}: MetricDataFormProps) {
  const { 
    addMetricData, 
    updateMetricData, 
    employees, 
    getPositionMetrics, 
    metricData 
  } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const { toast } = useToast();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [period, setPeriod] = useState(selectedPeriod || getCurrentPeriod());
  const [positionConfig, setPositionConfig] = useState<PositionConfig | null>(null);
  const [metricValues, setMetricValues] = useState<Record<string, string | number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  useEffect(() => {
    // Initialize with current user if no specific employee selected
    if (selectedEmployeeId) {
      const employee = employees.find(e => e.uid === selectedEmployeeId);
      setSelectedEmployee(employee || null);
    } else if (user) {
      const employee = employees.find(e => e.uid === user.uid);
      setSelectedEmployee(employee || null);
    }
  }, [selectedEmployeeId, user, employees]);

  useEffect(() => {
    if (selectedEmployee) {
      const config = getPositionMetrics(selectedEmployee.position);
      setPositionConfig(config || null);
      
      // Load existing metric data for this period
      const existingData = metricData.filter(
        m => m.employeeId === selectedEmployee.uid && m.period === period
      );
      
      const initialValues: Record<string, string | number> = {};
      const initialNotes: Record<string, string> = {};
      
      existingData.forEach(data => {
        initialValues[data.metric] = data.value;
        if (data.metadata?.notes) {
          initialNotes[data.metric] = data.metadata.notes;
        }
      });
      
      setMetricValues(initialValues);
      setNotes(initialNotes);
    }
  }, [selectedEmployee, period, getPositionMetrics, metricData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !positionConfig) return;

    setSaving(true);
    try {
      // Save each metric data entry
      for (const metric of positionConfig.metrics) {
        const value = metricValues[metric.name];
        const note = notes[metric.name];
        
        if (value !== undefined && value !== '') {
          const existingEntry = metricData.find(
            m => m.employeeId === selectedEmployee.uid && 
                 m.period === period && 
                 m.metric === metric.name
          );

          const metricDataEntry: Omit<MetricData, 'id'> = {
            employeeId: selectedEmployee.uid!,
            metric: metric.name,
            value,
            period,
            source: metric.source,
            recordedAt: new Date().toISOString(),
            metadata: {
              displayName: metric.displayName,
              unit: metric.unit,
              notes: note,
              dataType: metric.dataType
            }
          };

          if (existingEntry) {
            await updateMetricData(existingEntry.id, metricDataEntry);
          } else {
            await addMetricData(metricDataEntry);
          }
        }
      }

      toast({
        title: 'Thành công!',
        description: 'Đã lưu dữ liệu metric thành công.',
      });
      
      onClose();
    } catch (error) {
      toast({
        title: t.common.error as string,
        description: 'Không thể lưu dữ liệu metric.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const validateMetric = (metric: PositionMetric, value: string | number) => {
    if (!metric.validationRules) return null;
    
    for (const rule of metric.validationRules) {
      const numValue = Number(value);
      
      switch (rule.type) {
        case 'required':
          if (!value && value !== 0) {
            return rule.message || 'Trường này là bắt buộc';
          }
          break;
        case 'min':
          if (rule.value !== undefined && numValue < rule.value) {
            return rule.message || `Giá trị phải lớn hơn hoặc bằng ${rule.value}`;
          }
          break;
        case 'max':
          if (rule.value !== undefined && numValue > rule.value) {
            return rule.message || `Giá trị phải nhỏ hơn hoặc bằng ${rule.value}`;
          }
          break;
        case 'range':
          if (rule.min !== undefined && rule.max !== undefined) {
            if (numValue < rule.min || numValue > rule.max) {
              return rule.message || `Giá trị phải trong khoảng ${rule.min} - ${rule.max}`;
            }
          }
          break;
      }
    }
    
    return null;
  };

  const renderMetricInput = (metric: PositionMetric) => {
    const value = metricValues[metric.name] || '';
    const note = notes[metric.name] || '';
    const error = validateMetric(metric, value);
    
    return (
      <Card key={metric.id} className={`mb-4 ${error ? 'border-red-300' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-sm">{metric.displayName}</CardTitle>
              {metric.isRequired && (
                <Badge variant="secondary" className="text-xs">Bắt buộc</Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {metric.frequency === 'monthly' ? t.kpis.monthly :
                 metric.frequency === 'quarterly' ? t.kpis.quarterly :
                 metric.frequency === 'annually' ? t.kpis.annually : 
                 metric.frequency}
              </Badge>
            </div>
            {metric.unit && (
              <Badge variant="outline" className="text-xs">{metric.unit}</Badge>
            )}
          </div>
          {metric.description && (
            <p className="text-xs text-gray-600 mt-1">{metric.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">
              Giá trị {metric.isRequired && <span className="text-red-500">*</span>}
            </Label>
            {metric.dataType === 'boolean' ? (
              <Select
                value={String(value)}
                onValueChange={(val) => setMetricValues(prev => ({
                  ...prev,
                  [metric.name]: val === 'true' ? 1 : 0
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giá trị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Có/Đạt</SelectItem>
                  <SelectItem value="false">Không/Chưa đạt</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={metric.dataType === 'number' || metric.dataType === 'currency' || metric.dataType === 'percentage' ? 'number' : 'text'}
                value={value}
                onChange={(e) => setMetricValues(prev => ({
                  ...prev,
                  [metric.name]: metric.dataType === 'number' || metric.dataType === 'currency' || metric.dataType === 'percentage' ? 
                    Number(e.target.value) : e.target.value
                }))}
                placeholder={`Nhập ${metric.displayName.toLowerCase()}`}
                step={metric.dataType === 'currency' ? '1000' : 
                      metric.dataType === 'percentage' ? '0.01' : '1'}
                className={error ? 'border-red-300' : ''}
              />
            )}
            {error && (
              <div className="flex items-center mt-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                {error}
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs">Ghi chú</Label>
            <Textarea
              value={note}
              onChange={(e) => setNotes(prev => ({
                ...prev,
                [metric.name]: e.target.value
              }))}
              placeholder="Ghi chú thêm về metric này..."
              rows={2}
              className="text-xs"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!selectedEmployee || !positionConfig) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">
          {!selectedEmployee ? 'Không tìm thấy thông tin nhân viên.' : 
           'Không tìm thấy cấu hình metrics cho vị trí này.'}
        </p>
        <Button onClick={onClose} variant="outline">Đóng</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Nhân viên</Label>
          <div className="p-2 bg-gray-50 rounded border">
            <div className="font-medium">{selectedEmployee.name}</div>
            <div className="text-sm text-gray-600">{selectedEmployee.position}</div>
          </div>
        </div>
        <div>
          <Label htmlFor="period">Kỳ đánh giá</Label>
          <Input
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="YYYY-MM hoặc YYYY-Q1"
            pattern="^\d{4}-(0[1-9]|1[0-2]|Q[1-4])$"
            title="Định dạng: YYYY-MM (tháng) hoặc YYYY-Q1 (quý)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ví dụ: 2024-12 (tháng 12/2024) hoặc 2024-Q4 (quý 4/2024)
          </p>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            Metrics cho {positionConfig.displayName}
          </h3>
          <Badge variant="outline">
            {positionConfig.metrics.length} metrics
          </Badge>
        </div>

        <div className="space-y-4">
          {positionConfig.metrics.map(metric => renderMetricInput(metric))}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Đang lưu...' : 'Lưu dữ liệu'}
        </Button>
      </div>
    </form>
  );
}
