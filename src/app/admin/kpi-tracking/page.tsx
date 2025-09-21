'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Building2,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  User,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';

export default function KpiTrackingPage() {
  const { employees, kpis, kpiRecords, departments } = useContext(DataContext);
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Create enriched KPI records
  const enrichedRecords = useMemo(() => {
    return kpiRecords.map(record => {
      const employee = employees.find(emp => emp.uid === record.employeeId);
      const kpi = kpis.find(k => k.id === record.kpiId);
      const department = employee ? departments.find(d => d.id === employee.departmentId) : null;

      return {
        ...record,
        employeeName: employee?.name || 'Unknown',
        employeePosition: employee?.position || '',
        kpiName: kpi?.name || 'Unknown',
        kpiDescription: kpi?.description || '',
        kpiUnit: kpi?.unit || '',
        departmentName: department?.name || 'Unknown',
        progress: record.target > 0 ? ((record.actual || 0) / record.target * 100) : 0,
      };
    });
  }, [kpiRecords, employees, kpis, departments]);

  // Filter records based on search and department
  const filteredRecords = useMemo(() => {
    return enrichedRecords.filter(record => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.kpiName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' ||
                               record.departmentName === departments.find(d => d.id === selectedDepartment)?.name;
      return matchesSearch && matchesDepartment;
    });
  }, [enrichedRecords, searchTerm, selectedDepartment, departments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />{t.kpiTracking.completed}</Badge>;
      case 'awaiting_approval':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />{t.kpiTracking.awaitingApproval}</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />{t.kpiTracking.pending}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />{t.kpiTracking.rejected}</Badge>;
      default:
        return <Badge variant="outline">{t.kpiTracking.notStarted}</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 50) return 'text-blue-600';
    if (progress >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.kpiTracking.title}</h1>
          <p className="text-muted-foreground">{t.kpiTracking.subtitle}</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{nonAdminEmployees.length}</div>
            <p className="text-xs text-muted-foreground">{t.kpiTracking.employees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{enrichedRecords.length}</div>
            <p className="text-xs text-muted-foreground">{t.kpiTracking.assignedKpis}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {enrichedRecords.filter(r => r.status === 'approved' || r.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.kpiTracking.completed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">
              {enrichedRecords.filter(r => {
                const endDate = new Date(r.endDate);
                const today = new Date();
                return endDate < today && r.status !== 'completed' && r.status !== 'approved';
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">{t.kpiTracking.overdue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <div className="flex-1">
                <Input
                placeholder={t.kpiTracking.searchEmployeeKpi}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.kpiTracking.selectDepartment} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.kpiTracking.allDepartments}</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPI List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
            <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t.kpiTracking.noKpisFoundMessage}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{record.kpiName}</h4>
                      {getStatusBadge(record.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t.kpiTracking.employeeLabel}: {record.employeeName} ({record.employeePosition})
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t.kpiTracking.departmentLabel}: {record.departmentName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t.kpiTracking.deadlineLabel}: {new Date(record.endDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getProgressColor(record.progress)}`}>
                      {record.progress.toFixed(0)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t.kpiTracking.progressLabel
                        .replace('{actual}', (record.actual || 0).toString())
                        .replace('{target}', record.target.toString())
                        .replace('{unit}', record.kpiUnit)}
                    </p>
                      </div>
                </div>
                <Progress value={record.progress} className="h-2" />
                  </CardContent>
                </Card>
          ))
        )}
      </div>
    </div>
  );
}