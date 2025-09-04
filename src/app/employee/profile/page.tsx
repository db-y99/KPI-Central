'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Loading from '@/app/loading';
import { List, Target, CheckCircle, Clock, TrendingUp, Award } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const { kpis, kpiRecords, departments } = useContext(DataContext);

  if (!user) {
    return <Loading />;
  }

  const userKpiRecords = kpiRecords.filter(r => r.employeeId === user.id);
  const departmentName = departments.find(d => d.id === user.departmentId)?.name || 'Không rõ';
  
  const completedKpis = userKpiRecords.filter(record => {
      const completion = record.target > 0 ? (record.actual / record.target) * 100 : 0;
      return completion >= 100;
  }).length;
  
  const overachievedKpis = userKpiRecords.filter(record => record.actual > record.target).length;

  const totalCompletionPercentage = userKpiRecords.reduce((acc, record) => {
    const completion = record.target > 0 ? (record.actual / record.target) * 100 : 0;
    return acc + completion;
  }, 0);
  
  const averageCompletion = userKpiRecords.length > 0 ? Math.round(totalCompletionPercentage / userKpiRecords.length) : 0;

  const inProgressKpis = userKpiRecords.length - completedKpis;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary">
                <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person" />
                <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className='text-center md:text-left'>
                <CardTitle className="text-3xl">{user.name}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">{user.position}</CardDescription>
                 <Badge variant="secondary" className="mt-2">{departmentName}</Badge>
            </div>
        </CardHeader>
        <CardContent>
            <div className="border-t pt-6">
                 <h3 className="text-xl font-semibold mb-4">Thông tin chi tiết</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <p><strong>Mã nhân viên:</strong> {user.id}</p>
                    <p><strong>Vai trò:</strong> <span className="capitalize">{user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</span></p>
                    <p><strong>Phòng ban:</strong> {departmentName}</p>
                 </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Tổng quan KPI</CardTitle>
            <CardDescription>Thống kê hiệu suất làm việc của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted">
                    <List className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <p className="text-2xl font-bold">{userKpiRecords.length}</p>
                    <p className="text-sm text-muted-foreground">Tổng KPI</p>
                </div>
                 <div className="p-4 rounded-lg bg-muted">
                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                    <p className="text-2xl font-bold">{completedKpis}</p>
                    <p className="text-sm text-muted-foreground">KPI Hoàn thành</p>
                </div>
                 <div className="p-4 rounded-lg bg-muted">
                    <TrendingUp className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                    <p className="text-2xl font-bold">{averageCompletion}%</p>
                    <p className="text-sm text-muted-foreground">Hoàn thành TB</p>
                </div>
                 <div className="p-4 rounded-lg bg-muted">
                    <Award className="mx-auto mb-2 h-8 w-8 text-amber-500" />
                    <p className="text-2xl font-bold">{overachievedKpis}</p>
                    <p className="text-sm text-muted-foreground">KPI Vượt chỉ tiêu</p>
                </div>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
