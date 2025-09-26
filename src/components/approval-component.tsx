'use client';
import { useState, useContext, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye,
  Users,
  Target,
  Calendar
} from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { AuthContext } from '@/context/auth-context';

export default function ApprovalComponent() {
  const { employees, kpis, kpiRecords, departments, updateKpiRecord } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    status: 'pending',
    comments: ''
  });

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Create enriched KPI records for approval
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

  // Filter records based on search and status
  const filteredRecords = useMemo(() => {
    return enrichedRecords.filter(record => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.kpiName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedRecords, searchTerm, selectedStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />{t.admin.approved}</Badge>;
      case 'awaiting_approval':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />{t.admin.awaitingApproval}</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />{t.admin.pending}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />{t.admin.rejected}</Badge>;
      default:
        return <Badge variant="outline">{t.dashboard.notStarted}</Badge>;
    }
  };

  const handleRowClick = (record: any) => {
    setSelectedRecord(record);
    setApprovalForm({
      status: record.status,
      comments: record.approvalComments || ''
    });
    setIsDialogOpen(true);
  };

  const handleApprove = async () => {
    if (selectedRecord) {
      try {
        await updateKpiRecord(selectedRecord.id, {
          status: 'approved',
          approvalComment: approvalForm.comments,
          approvedAt: new Date().toISOString(),
          approvedBy: user?.name || 'Admin'
        });
        
        toast({
          title: t.common.success,
          description: t.admin.successApproved,
        });
        
        setIsDialogOpen(false);
        setSelectedRecord(null);
      } catch (error) {
        console.error('Error approving KPI record:', error);
        toast({
          title: t.common.error,
          description: t.admin.cannotApproveReport,
          variant: "destructive",
        });
      }
    }
  };

  const handleReject = async () => {
    if (selectedRecord) {
      try {
        await updateKpiRecord(selectedRecord.id, {
          status: 'rejected',
          approvalComment: approvalForm.comments,
          approvedAt: new Date().toISOString(),
          approvedBy: user?.name || 'Admin'
        });
        
        toast({
          title: t.common.success,
          description: t.admin.successRejected,
        });
        
        setIsDialogOpen(false);
        setSelectedRecord(null);
      } catch (error) {
        console.error('Error rejecting KPI record:', error);
        toast({
          title: t.common.error,
          description: t.admin.cannotRejectReport,
          variant: "destructive",
        });
      }
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.admin.reportApprovalTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t.admin.approvalPageSubtitle}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.totalReports}</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrichedRecords.length}</div>
            <p className="text-xs text-muted-foreground">{t.admin.allReports}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.awaitingApproval}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {enrichedRecords.filter(r => r.status === 'awaiting_approval').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.admin.pending}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.approved}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {enrichedRecords.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.dashboard.completed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.rejected}</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {enrichedRecords.filter(r => r.status === 'rejected').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.admin.needsRevision}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.admin.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.admin.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.admin.allStatuses}</SelectItem>
                <SelectItem value="awaiting_approval">{t.admin.awaitingApproval}</SelectItem>
                <SelectItem value="approved">{t.admin.approved}</SelectItem>
                <SelectItem value="rejected">{t.admin.rejected}</SelectItem>
                <SelectItem value="pending">{t.admin.pending}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Approval Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.admin.reportsList} ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.admin.noReportsFound}</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== 'all' 
                  ? t.admin.noReportsMatchFilter
                  : t.admin.noReportsMessage}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.employee}</TableHead>
                  <TableHead>KPI</TableHead>
                  <TableHead>{t.admin.department}</TableHead>
                  <TableHead>{t.dashboard.progress}</TableHead>
                  <TableHead>{t.admin.status}</TableHead>
                  <TableHead>{t.admin.submittedAt}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow 
                    key={record.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(record)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={employees.find(emp => emp.uid === record.employeeId)?.avatar} />
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
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">
                            {record.progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${Math.min(record.progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(record.updatedAt || record.createdAt).toLocaleDateString('vi-VN')}</p>
                        <p className="text-muted-foreground">
                          {new Date(record.updatedAt || record.createdAt).toLocaleTimeString('vi-VN')}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              {t.admin.reportDetails} - {selectedRecord?.employeeName}
            </DialogTitle>
            <DialogDescription>
              {t.admin.approvalPageSubtitle}
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

              {/* KPI Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {t.admin.kpiInfo}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">{t.kpis.kpiName}</label>
                      <p className="font-medium">{selectedRecord.kpiName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">{t.kpis.description}</label>
                      <p className="text-sm">{selectedRecord.kpiDescription || t.kpis.noDescription}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">{t.kpis.unit}</label>
                      <p className="font-medium">{selectedRecord.kpiUnit}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {t.dashboard.performance}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">{t.kpis.target}</label>
                      <p className="font-medium text-lg">{selectedRecord.target} {selectedRecord.kpiUnit}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">{t.kpis.actual}</label>
                      <p className="font-medium text-lg text-blue-600">{selectedRecord.actual || 0} {selectedRecord.kpiUnit}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">{t.dashboard.completionRate}</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${Math.min(selectedRecord.progress, 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-lg">{selectedRecord.progress.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t.kpis.implementationPeriod}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">{t.kpis.startDate}</label>
                    <p className="font-medium">{new Date(selectedRecord.startDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">{t.kpis.endDate}</label>
                    <p className="font-medium">{new Date(selectedRecord.endDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </div>

              {/* Approval Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">{t.admin.status}</Label>
                  <Select 
                    value={approvalForm.status} 
                    onValueChange={(value) => setApprovalForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awaiting_approval">{t.admin.awaitingApproval}</SelectItem>
                      <SelectItem value="approved">{t.admin.approve}</SelectItem>
                      <SelectItem value="rejected">{t.admin.reject}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="comments">{t.admin.feedbackOptional}</Label>
                  <Textarea
                    id="comments"
                    value={approvalForm.comments}
                    onChange={(e) => setApprovalForm(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder={t.admin.feedbackPlaceholder}
                    rows={4}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {t.admin.reject}
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t.admin.approve}
                </Button>
                <Button
                  onClick={closeDialog}
                  variant="ghost"
                >
                  {t.common.close}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
