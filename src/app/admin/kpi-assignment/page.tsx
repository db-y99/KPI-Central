'use client';
import { useState, useContext } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Target, User, Calendar, CheckCircle2 } from 'lucide-react';
import type { Employee, Kpi } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { DataContext } from '@/context/data-context';

export default function KpiAssignmentPage() {
  const { employees, kpis, departments, assignKpi } = useContext(DataContext);
  const [selectedEmployeeUid, setSelectedEmployeeUid] = useState<string | undefined>();
  const [selectedKpiId, setSelectedKpiId] = useState<string | undefined>();
  const [target, setTarget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { t } = useLanguage();

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  const selectedEmployee = employees.find(e => e.uid === selectedEmployeeUid);
  const selectedKpi = kpis.find(k => k.id === selectedKpiId);

  const handleSubmit = async () => {
    if (!selectedEmployeeUid || !selectedKpiId || !target) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.kpiAssignment.pleaseSelectEmployeeKpiTarget as string,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Set default dates (current quarter)
      const today = new Date();
      const startDate = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0);

      await assignKpi({
        employeeId: selectedEmployeeUid,
        kpiId: selectedKpiId,
        target: parseFloat(target),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      toast({
        title: t.kpiAssignment.success as string,
        description: t.kpiAssignment.kpiAssignedSuccess
          .replace('{kpiName}', selectedKpi?.name || '')
          .replace('{employeeName}', selectedEmployee?.name || '') as string,
      });

      // Reset form
      setSelectedEmployeeUid(undefined);
      setSelectedKpiId(undefined);
      setTarget('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.kpiAssignment.errorOccurred as string,
      });
      console.error("Failed to assign KPI: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.kpiAssignment.title}</h1>
          <p className="text-muted-foreground">{t.kpiAssignment.subtitle}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{nonAdminEmployees.length}</div>
            <p className="text-xs text-muted-foreground">{t.kpiAssignment.employeesCanReceiveKpi}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{kpis.length}</div>
            <p className="text-xs text-muted-foreground">{t.kpiAssignment.availableKpis}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {employees.filter(emp => emp.role !== 'admin').length - nonAdminEmployees.length}
            </div>
            <p className="text-xs text-muted-foreground">{t.kpiAssignment.alreadyHaveKpi}</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t.kpiAssignment.assignNewKpi}
          </CardTitle>
          <CardDescription>
            {t.kpiAssignment.assignNewKpiDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chọn nhân viên */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t.kpiAssignment.selectEmployee}
            </Label>
            <Select onValueChange={setSelectedEmployeeUid} value={selectedEmployeeUid}>
              <SelectTrigger>
                <SelectValue placeholder={t.kpiAssignment.selectEmployeePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {nonAdminEmployees.map(employee => (
                  <SelectItem key={employee.uid} value={employee.uid!}>
                    {employee.name} - {employee.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chọn KPI */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {t.kpiAssignment.selectKpi}
            </Label>
            <Select onValueChange={setSelectedKpiId} value={selectedKpiId}>
              <SelectTrigger>
                <SelectValue placeholder={t.kpiAssignment.selectKpiPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {kpis.map(kpi => (
                  <SelectItem key={kpi.id} value={kpi.id}>
                    {kpi.name} - {kpi.unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* KPI Info */}
          {selectedKpi && (
            <Card className="bg-blue-50">
              <CardContent className="pt-4 text-sm">
                <p><strong>{t.kpiAssignment.description}:</strong> {selectedKpi.description}</p>
                <p><strong>{t.kpiAssignment.unit}:</strong> {selectedKpi.unit}</p>
                <p><strong>{t.kpiAssignment.frequency}:</strong> {selectedKpi.frequency}</p>
              </CardContent>
            </Card>
          )}

          {/* Chỉ tiêu */}
          {selectedKpi && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {t.kpiAssignment.target}
              </Label>
              <Input
                type="number"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder={t.kpiAssignment.targetPlaceholder.replace('"{unit}"', selectedKpi.unit)}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Submit Button */}
          {selectedKpi && (
            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? t.kpiAssignment.processing : t.kpiAssignment.assignKpi}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>{t.kpiAssignment.recentAssignments}</CardTitle>
          <CardDescription>
            {t.kpiAssignment.recentAssignmentsDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t.kpiAssignment.noKpisAssigned}</p>
            <p className="text-sm">{t.kpiAssignment.noKpisAssignedDescription}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
