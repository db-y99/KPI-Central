'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Eye,
  Edit,
  RefreshCw,
  Play,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import { KpiStatusService, KpiStatus } from '@/lib/kpi-status-service';

export default function KpiTrackingComponent() {
  const { employees, kpis, kpiRecords, departments } = useContext(DataContext);
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    actual: '',
    notes: '',
    status: 'pending'
  });

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
    try {
      const statusConfig = KpiStatusService.getStatusConfig(status as KpiStatus);
      
      // Icon mapping
      const iconMap = {
        'Clock': Clock,
        'Play': Play,
        'AlertCircle': AlertCircle,
        'CheckCircle': CheckCircle2,
        'XCircle': AlertTriangle
      };
      
      const IconComponent = iconMap[statusConfig.icon as keyof typeof iconMap] || Clock;
      
      return (
        <Badge className={`${statusConfig.color.replace('bg-', 'bg-').replace('-500', '-100')} text-${statusConfig.color.replace('bg-', '').replace('-500', '-800')}`}>
          <IconComponent className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>
      );
    } catch (error) {
      // Fallback cho trạng thái cũ
      switch (status) {
        case 'approved':
        case 'completed':
          return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Hoàn thành</Badge>;
        case 'awaiting_approval':
          return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
        case 'pending':
          return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />Chưa bắt đầu</Badge>;
        case 'rejected':
          return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Từ chối</Badge>;
        default:
          return <Badge variant="outline">Chưa bắt đầu</Badge>;
      }
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRefreshData = () => {
    window.location.reload();
  };

  const handleRowClick = (record: any) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
  };

  const handleViewDetails = () => {
    if (selectedRecord) {
      setIsHistoryDialogOpen(true);
    }
  };

  const handleUpdateProgress = () => {
    if (selectedRecord) {
      setUpdateForm({
        actual: selectedRecord.actual?.toString() || '',
        notes: selectedRecord.notes || '',
        status: selectedRecord.status
      });
      setIsUpdateDialogOpen(true);
    }
  };

  const handleSaveUpdate = () => {
    if (selectedRecord && updateForm.actual) {
      console.log('Saving update:', {
        recordId: selectedRecord.id,
        actual: parseFloat(updateForm.actual),
        notes: updateForm.notes,
        status: updateForm.status
      });
      
      alert('Cập nhật tiến độ thành công!');
      setIsUpdateDialogOpen(false);
      setIsDialogOpen(false);
      setSelectedRecord(null);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedRecord(null);
  };

  const closeHistoryDialog = () => {
    setIsHistoryDialogOpen(false);
  };

  const closeUpdateDialog = () => {
    setIsUpdateDialogOpen(false);
    setUpdateForm({ actual: '', notes: '', status: 'pending' });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{nonAdminEmployees.length}</div>
            <p className="text-xs text-muted-foreground">Total Employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{enrichedRecords.length}</div>
            <p className="text-xs text-muted-foreground">Total KPIs</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {enrichedRecords.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Completed KPIs</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">
              {enrichedRecords.filter(r => {
                const endDate = new Date(r.endDate);
                const today = new Date();
                return endDate < today && r.status !== 'approved';
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Overdue KPIs</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Tracking Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              KPI Tracking ({filteredRecords.length})
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Input
                  placeholder="Search employees or KPIs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleRefreshData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No KPIs Assigned</h3>
              <p className="text-muted-foreground mb-4">
                No KPIs have been assigned to employees yet.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Create KPIs at <a href="/admin/kpi-management?tab=definitions" className="text-blue-600 hover:underline">KPI Definitions</a></p>
                <p>• Assign KPIs at <a href="/admin/kpi-management?tab=assignment" className="text-blue-600 hover:underline">KPI Assignment</a></p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>KPI</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const daysRemaining = getDaysRemaining(record.endDate);
                  const employee = employees.find(emp => emp.uid === record.employeeId);
                  
                  return (
                    <TableRow 
                      key={record.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(record)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={employee?.avatar} />
                            <AvatarFallback>
                              {record.employeeName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{record.employeeName}</p>
                            <p className="text-sm text-muted-foreground">{record.employeePosition}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.kpiName}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.actual || 0} / {record.target} {record.kpiUnit}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.departmentName}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">
                              {record.progress.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={record.progress} className="h-2 w-20" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {new Date(record.endDate).toLocaleDateString('vi-VN')}
                          </p>
                          <p className={`text-xs ${
                            daysRemaining < 0 ? 'text-red-600' : 
                            daysRemaining <= 7 ? 'text-orange-600' : 'text-muted-foreground'
                          }`}>
                            {daysRemaining < 0 
                              ? `Overdue ${Math.abs(daysRemaining)} days`
                              : daysRemaining === 0 
                              ? 'Due today'
                              : `${daysRemaining} days left`
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Employee KPI Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              KPI Details - {selectedRecord?.employeeName}
            </DialogTitle>
            <DialogDescription>
              Detailed information about KPI and progress
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              {/* Employee Info Section */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={employees.find(emp => emp.uid === selectedRecord.employeeId)?.avatar} />
                  <AvatarFallback className="text-lg">
                    {selectedRecord.employeeName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedRecord.employeeName}</h3>
                  <p className="text-muted-foreground">{selectedRecord.employeePosition}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedRecord.departmentName}</Badge>
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                </div>
              </div>

              {/* KPI Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    KPI Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">KPI Name</label>
                      <p className="font-medium">{selectedRecord.kpiName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Description</label>
                      <p className="text-sm">{selectedRecord.kpiDescription || 'No description'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Unit</label>
                      <p className="font-medium">{selectedRecord.kpiUnit}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Progress
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Target</label>
                      <p className="font-medium text-lg">{selectedRecord.target} {selectedRecord.kpiUnit}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Current</label>
                      <p className="font-medium text-lg text-blue-600">{selectedRecord.actual || 0} {selectedRecord.kpiUnit}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Completion Rate</label>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedRecord.progress} className="flex-1 h-3" />
                        <span className="font-semibold text-lg">{selectedRecord.progress.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleViewDetails}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View History
                </Button>
                <Button
                  onClick={handleUpdateProgress}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update Progress
                </Button>
                <Button
                  onClick={closeDialog}
                  variant="ghost"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Progress Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Update KPI Progress
            </DialogTitle>
            <DialogDescription>
              Update progress for {selectedRecord?.employeeName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
              {/* KPI Info */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium">{selectedRecord.kpiName}</h4>
                <p className="text-sm text-muted-foreground">
                  Target: {selectedRecord.target} {selectedRecord.kpiUnit}
                </p>
              </div>

              {/* Update Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="actual">Current Progress ({selectedRecord.kpiUnit})</Label>
                  <Input
                    id="actual"
                    type="number"
                    value={updateForm.actual}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, actual: e.target.value }))}
                    placeholder={`Enter ${selectedRecord.kpiUnit} completed`}
                    min="0"
                    max={selectedRecord.target * 2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {selectedRecord.actual || 0} / {selectedRecord.target} {selectedRecord.kpiUnit}
                  </p>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={updateForm.status} 
                    onValueChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">In Progress</SelectItem>
                      <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={updateForm.notes}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter notes about progress..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={closeUpdateDialog} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveUpdate} className="flex-1" disabled={!updateForm.actual}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Update
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
