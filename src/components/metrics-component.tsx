'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Target,
  TrendingUp,
  Calendar,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataContext } from '@/context/data-context';
import { usePDFExport } from '@/lib/pdf-export';

interface MetricData {
  id: string;
  employeeId: string;
  kpiId: string;
  period: string;
  targetValue: number;
  actualValue: number;
  completionRate: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export default function MetricsComponent() {
  const { employees, kpis, kpiRecords, departments } = useContext(DataContext);
  const { exportToPDF } = usePDFExport();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<MetricData | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedKpi, setSelectedKpi] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    kpiId: '',
    period: '',
    targetValue: '',
    actualValue: '',
    notes: ''
  });

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Get unique periods from kpiRecords
  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(kpiRecords.map(record => record.period))];
    return uniquePeriods.sort();
  }, [kpiRecords]);

  // Filter metrics based on selections
  const filteredMetrics = useMemo(() => {
    return kpiRecords.filter(record => {
      const employeeMatch = selectedEmployee === 'all' || record.employeeId === selectedEmployee;
      const kpiMatch = selectedKpi === 'all' || record.kpiId === selectedKpi;
      const periodMatch = selectedPeriod === 'all' || record.period === selectedPeriod;
      return employeeMatch && kpiMatch && periodMatch;
    });
  }, [kpiRecords, selectedEmployee, selectedKpi, selectedPeriod]);

  const handleAddMetric = () => {
    setEditingMetric(null);
    setFormData({
      employeeId: '',
      kpiId: '',
      period: '',
      targetValue: '',
      actualValue: '',
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditMetric = (metric: any) => {
    setEditingMetric(metric);
    setFormData({
      employeeId: metric.employeeId,
      kpiId: metric.kpiId,
      period: metric.period,
      targetValue: metric.targetValue?.toString() || '',
      actualValue: metric.actualValue?.toString() || '',
      notes: metric.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveMetric = () => {
    console.log('Saving metric:', formData);
    setIsDialogOpen(false);
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(
        'metrics-report',
        'bao-cao-du-lieu-kpi.pdf',
        'Báo cáo dữ liệu KPI',
        {
          includeHeader: true,
          includeFooter: true,
          includePageNumbers: true,
          orientation: 'portrait'
        }
      );
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.uid === employeeId);
    return employee?.name || 'Unknown';
  };

  const getKpiName = (kpiId: string) => {
    const kpi = kpis.find(k => k.id === kpiId);
    return kpi?.name || 'Unknown';
  };

  const getCompletionRate = (target: number, actual: number) => {
    if (target === 0) return 0;
    return Math.min((actual / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{filteredMetrics.length}</div>
            <p className="text-xs text-muted-foreground">Total Records</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredMetrics.filter(m => m.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredMetrics.filter(m => m.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">
              {filteredMetrics.filter(m => m.status === 'rejected').length}
            </div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Employee:</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {nonAdminEmployees.map((emp, index) => (
                    <SelectItem key={emp.uid || `emp-${index}`} value={emp.uid!}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>KPI:</Label>
              <Select value={selectedKpi} onValueChange={setSelectedKpi}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select KPI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All KPIs</SelectItem>
                  {kpis.map((kpi, index) => (
                    <SelectItem key={kpi.id || `kpi-${index}`} value={kpi.id}>
                      {kpi.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Period:</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {periods.map((period, index) => (
                    <SelectItem key={period || `period-${index}`} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>KPI Data</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Export PDF
              </Button>
              <Button onClick={handleAddMetric} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div id="metrics-report" className="space-y-4">
            {filteredMetrics.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No KPI data available</p>
              </div>
            ) : (
              filteredMetrics.map((metric, index) => (
                <div key={metric.id || `metric-${index}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{getEmployeeName(metric.employeeId)}</h4>
                        <p className="text-sm text-muted-foreground">{getKpiName(metric.kpiId)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(metric.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMetric(metric)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Period</Label>
                      <p className="font-medium">{metric.period}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Target</Label>
                      <p className="font-medium">{metric.targetValue}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Actual</Label>
                      <p className="font-medium">{metric.actualValue}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Completion Rate</Label>
                      <p className="font-medium">
                        {getCompletionRate(metric.targetValue, metric.actualValue).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {metric.notes && (
                    <div className="mt-3">
                      <Label className="text-muted-foreground">Notes</Label>
                      <p className="text-sm">{metric.notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Metric Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMetric ? 'Edit KPI Data' : 'Add KPI Data'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select value={formData.employeeId} onValueChange={(value) => setFormData({...formData, employeeId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {nonAdminEmployees.map((emp, index) => (
                    <SelectItem key={emp.uid || `emp-${index}`} value={emp.uid!}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>KPI</Label>
              <Select value={formData.kpiId} onValueChange={(value) => setFormData({...formData, kpiId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select KPI" />
                </SelectTrigger>
                <SelectContent>
                  {kpis.map((kpi, index) => (
                    <SelectItem key={kpi.id || `kpi-${index}`} value={kpi.id}>
                      {kpi.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Period</Label>
              <Input
                value={formData.period}
                onChange={(e) => setFormData({...formData, period: e.target.value})}
                placeholder="e.g., Q1-2024, January 2024"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target</Label>
                <Input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Actual</Label>
                <Input
                  type="number"
                  value={formData.actualValue}
                  onChange={(e) => setFormData({...formData, actualValue: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes (optional)"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveMetric}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
