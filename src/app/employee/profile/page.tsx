'use client';

import { useContext, useMemo } from 'react';
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Loading from '@/app/loading';
import {
  List,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Edit,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { format, subMonths, getMonth, getYear } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const { kpis, kpiRecords, departments } = useContext(DataContext);

  if (!user) {
    return <Loading />;
  }

  const { t } = useLanguage();
  
  const userKpiRecords = kpiRecords.filter(r => r.employeeId === user.uid);
  const departmentName =
    departments.find(d => d.id === user.departmentId)?.name || t.employeeProfile.unknown;

  const completedKpiRecords = useMemo(() => {
    return userKpiRecords
      .map(record => {
        const kpiDetail = kpis.find(k => k.id === record.kpiId || k.documentId === record.kpiId);
        const completion =
          record.target > 0 ? (record.actual / record.target) * 100 : 0;
        return {
          ...record,
          name: kpiDetail?.name || t.employeeProfile.notDefined,
          unit: kpiDetail?.unit || '',
          completion: Math.round(completion),
        };
      })
      .filter(record => record.completion >= 100);
  }, [userKpiRecords, kpis]);

  const overachievedKpis = completedKpiRecords.filter(
    record => record.completion > 100
  ).length;

  const totalCompletionPercentage = userKpiRecords.reduce((acc, record) => {
    const completion =
      record.target > 0 ? (record.actual / record.target) * 100 : 0;
    return acc + completion;
  }, 0);

  const averageCompletion =
    userKpiRecords.length > 0
      ? Math.round(totalCompletionPercentage / userKpiRecords.length)
      : 0;

  const performanceByMonth = useMemo(() => {
    const last12Months = Array.from({ length: 12 }, (_, i) =>
      subMonths(new Date(), i)
    ).reverse();

    return last12Months.map(date => {
      const month = getMonth(date);
      const year = getYear(date);
      const name = format(date, 'MMM yyyy', { locale: vi });

      const completedThisMonth = completedKpiRecords.filter(record => {
        const endDate = new Date(record.endDate);
        return getMonth(endDate) === month && getYear(endDate) === year;
      }).length;

      return { name, completed: completedThisMonth };
    });
  }, [completedKpiRecords]);
  
  const chartConfig = {
      completed: {
          label: t.employeeProfile.kpisCompleted,
          color: 'hsl(var(--chart-1))',
      },
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24 border-4 border-primary">
            <AvatarImage
              src={user.avatar}
              alt={user.name}
              data-ai-hint="person"
            />
            <AvatarFallback className="text-3xl">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left flex-1">
            <CardTitle className="text-3xl">{user.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {user.position}
            </CardDescription>
            <Badge variant="secondary" className="mt-2">
              {departmentName}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Link href="/employee/profile/edit">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                {t.employeeProfile.editProfile}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">{t.employeeProfile.personalDetails}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>{t.employeeProfile.role}:</strong>{' '}
                <span className="capitalize">
                  {user.role === 'admin' ? t.employeeProfile.admin : t.employeeProfile.employee}
                </span>
              </p>
              <p>
                <strong>{t.employeeProfile.department}:</strong> {departmentName}
              </p>
              <p>
                <strong>{t.employeeProfile.employeeId}:</strong> {user.employeeId || user.id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.employeeProfile.kpiOverview}</CardTitle>
          <CardDescription>{t.employeeProfile.kpiOverviewDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-lg bg-muted">
              <List className="mx-auto mb-2 h-8 w-8 text-primary" />
              <p className="text-2xl font-bold">{userKpiRecords.length}</p>
              <p className="text-sm text-muted-foreground">{t.employeeProfile.totalKpis}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
              <p className="text-2xl font-bold">{completedKpiRecords.length}</p>
              <p className="text-sm text-muted-foreground">{t.employeeProfile.completedKpis}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <TrendingUp className="mx-auto mb-2 h-8 w-8 text-blue-500" />
              <p className="text-2xl font-bold">{averageCompletion}%</p>
              <p className="text-sm text-muted-foreground">{t.employeeProfile.averageCompletion}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <Award className="mx-auto mb-2 h-8 w-8 text-amber-500" />
              <p className="text-2xl font-bold">{overachievedKpis}</p>
              <p className="text-sm text-muted-foreground">{t.employeeProfile.exceededKpis}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t.employeeProfile.monthlyPerformance}</CardTitle>
          <CardDescription>{t.employeeProfile.monthlyDescription}</CardDescription>
        </CardHeader>
        <CardContent>
           <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer>
              <BarChart data={performanceByMonth}>
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis allowDecimals={false} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="completed"
                  fill="var(--color-completed)"
                  radius={4}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>{t.employeeProfile.completedKpisList}</CardTitle>
              <CardDescription>{t.employeeProfile.completedKpisDescription}</CardDescription>
          </CardHeader>
          <CardContent>
              {completedKpiRecords.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t.employeeProfile.kpiName}</TableHead>
                            <TableHead className="text-center">{t.employeeProfile.target}</TableHead>
                            <TableHead className="text-center">{t.employeeProfile.actual}</TableHead>
                            <TableHead className="w-[150px] text-right">{t.employeeProfile.completion}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {completedKpiRecords.map(record => (
                            <TableRow key={record.id}>
                                <TableCell className="font-medium">{record.name}</TableCell>
                                <TableCell className="text-center">{record.target.toLocaleString()} {record.unit}</TableCell>
                                <TableCell className="text-center">{record.actual.toLocaleString()} {record.unit}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <span>{record.completion}%</span>
                                        <Progress value={record.completion > 100 ? 100 : record.completion} className="w-20 h-2" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t.employeeProfile.noCompletedKpis}</p>
              )}
          </CardContent>
      </Card>

    </div>
  );
}
