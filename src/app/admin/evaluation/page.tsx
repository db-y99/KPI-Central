'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  Users,
  Star,
  AlertTriangle,
  Target,
  Trophy,
  Search,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
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

interface EmployeeEvaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  avatar?: string;
  totalKpis: number;
  completedKpis: number;
  completionRate: number;
  status: 'excellent' | 'good' | 'average' | 'needs_improvement';
}

export default function EvaluationPage() {
  const { employees, kpiRecords, departments } = useContext(DataContext);
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Create employee evaluations
  const employeeEvaluations = useMemo(() => {
    return nonAdminEmployees.map(employee => {
      const employeeKpis = kpiRecords.filter(record => record.employeeId === employee.uid);
      const completedKpis = employeeKpis.filter(kpi => kpi.status === 'approved');
      const totalKpis = employeeKpis.length;
      const completedCount = completedKpis.length;

      // Calculate completion rate
      const completionRate = totalKpis > 0 ? (completedCount / totalKpis) * 100 : 0;

      // Get employee department
      const department = departments.find(d => d.id === employee.departmentId);

      return {
        id: employee.uid!,
        employeeId: employee.uid!,
        employeeName: employee.name,
        position: employee.position,
        department: department?.name || 'Chưa phân bổ',
        avatar: employee.avatar,
        totalKpis,
        completedKpis: completedCount,
        completionRate,
        status: completionRate >= 80 ? 'excellent' :
                completionRate >= 60 ? 'good' :
                completionRate >= 40 ? 'average' : 'needs_improvement'
      } as EmployeeEvaluation;
    });
  }, [nonAdminEmployees, kpiRecords, departments]);

  // Filter employees based on department and search
  const filteredEvaluations = useMemo(() => {
    return employeeEvaluations.filter(emp => {
      const departmentMatch = selectedDepartment === 'all' || emp.department === selectedDepartment;
      const searchMatch = searchTerm === '' || 
        emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      return departmentMatch && searchMatch;
    });
  }, [employeeEvaluations, selectedDepartment, searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800"><Trophy className="w-3 h-3 mr-1" />Xuất sắc</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800"><Star className="w-3 h-3 mr-1" />Tốt</Badge>;
      case 'average':
        return <Badge className="bg-yellow-100 text-yellow-800"><Target className="w-3 h-3 mr-1" />Trung bình</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Cần cải thiện</Badge>;
    }
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Chưa phân bổ';
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
            <div className="text-2xl font-bold text-green-600">
              {employeeEvaluations.filter(emp => emp.status === 'excellent').length}
            </div>
            <p className="text-xs text-muted-foreground">Nhân viên xuất sắc</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {employeeEvaluations.filter(emp => emp.status === 'good').length}
            </div>
            <p className="text-xs text-muted-foreground">Nhân viên tốt</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">
              {employeeEvaluations.filter(emp => emp.status === 'needs_improvement').length}
            </div>
            <p className="text-xs text-muted-foreground">Cần cải thiện</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Evaluation Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Đánh giá nhân viên ({filteredEvaluations.length})
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Input
                  placeholder="Tìm kiếm nhân viên..."
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
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEvaluations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              {employeeEvaluations.length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">Chưa có nhân viên để đánh giá</h3>
                  <p className="text-muted-foreground mb-4">
                    Hệ thống cần có nhân viên và KPI để thực hiện đánh giá.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Thêm nhân viên tại <a href="/admin/employees" className="text-blue-600 hover:underline">Quản lý nhân viên</a></p>
                    <p>• Giao KPI tại <a href="/admin/kpi-assignment" className="text-blue-600 hover:underline">Giao KPI</a></p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">Không tìm thấy nhân viên</h3>
                  <p className="text-muted-foreground">
                    Không có nhân viên nào phù hợp với tiêu chí tìm kiếm.
                  </p>
                </>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>KPI</TableHead>
                  <TableHead>Tỷ lệ đạt</TableHead>
                  <TableHead>Đánh giá</TableHead>
                  <TableHead>Tiến độ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={evaluation.avatar} />
                          <AvatarFallback>
                            {evaluation.employeeName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{evaluation.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{evaluation.position}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{evaluation.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>Hoàn thành: {evaluation.completedKpis}</p>
                        <p className="text-muted-foreground">Tổng: {evaluation.totalKpis}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-lg">
                        {evaluation.completionRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(evaluation.status)}
                    </TableCell>
                    <TableCell>
                      <div className="w-20">
                        <Progress value={evaluation.completionRate} className="h-2" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}