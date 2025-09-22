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
  RefreshCw
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
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Hoàn thành</Badge>;
      case 'awaiting_approval':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />Đang thực hiện</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Từ chối</Badge>;
      default:
        return <Badge variant="outline">Chưa bắt đầu</Badge>;
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
    // Refresh data logic
    window.location.reload();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{nonAdminEmployees.length}</div>
            <p className="text-xs text-muted-foreground">Tổng nhân viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{enrichedRecords.length}</div>
            <p className="text-xs text-muted-foreground">KPI được giao</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {enrichedRecords.filter(r => r.status === 'approved' || r.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Đã hoàn thành</p>
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
            <p className="text-xs text-muted-foreground">Quá hạn</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Tracking Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Theo dõi KPI ({filteredRecords.length})
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Input
                  placeholder="Tìm kiếm nhân viên, KPI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng ban</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleRefreshData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              {enrichedRecords.length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">Chưa có KPI nào được giao</h3>
                  <p className="text-muted-foreground mb-4">
                    Hệ thống cần có nhân viên và KPI để theo dõi.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Tạo KPI tại <a href="/admin/kpi-definitions" className="text-blue-600 hover:underline">Định nghĩa KPI</a></p>
                    <p>• Giao KPI tại <a href="/admin/kpi-assignment" className="text-blue-600 hover:underline">Giao KPI</a></p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">Không tìm thấy KPI</h3>
                  <p className="text-muted-foreground">
                    Không có KPI nào phù hợp với tiêu chí tìm kiếm.
                  </p>
                </>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>KPI</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Tiến độ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hạn chót</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const daysRemaining = getDaysRemaining(record.endDate);
                  const employee = employees.find(emp => emp.uid === record.employeeId);
                  
                  return (
                    <TableRow key={record.id}>
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
                              ? `Quá hạn ${Math.abs(daysRemaining)} ngày`
                              : daysRemaining === 0 
                              ? 'Hết hạn hôm nay'
                              : `Còn ${daysRemaining} ngày`
                            }
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Cập nhật tiến độ"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
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
    </div>
  );
}