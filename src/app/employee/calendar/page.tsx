'use client';
import { useContext, useState, useMemo } from 'react';
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  FileText
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isPast, isFuture } from 'date-fns';
import { vi } from 'date-fns/locale';

interface KPICalendarEvent {
  id: string;
  kpiId: string;
  kpiName: string;
  title: string;
  date: Date;
  type: 'deadline' | 'reminder' | 'milestone' | 'review';
  status: 'pending' | 'completed' | 'overdue' | 'upcoming';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  progress?: number;
}

export default function KPICalendarPage() {
  const { user } = useContext(AuthContext);
  const { kpis, kpiRecords } = useContext(DataContext);
  const { t } = useLanguage();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Get user's KPI records
  const userKpiRecords = useMemo(() => {
    if (!user?.uid) return [];
    return kpiRecords.filter(record => record.employeeId === user.uid);
  }, [kpiRecords, user?.uid]);

  // Create calendar events from KPI records
  const calendarEvents = useMemo(() => {
    const events: KPICalendarEvent[] = [];
    const today = new Date();

    userKpiRecords.forEach(record => {
      const kpi = kpis.find(k => k.id === record.kpiId || k.documentId === record.kpiId);
      if (!kpi) return;

      const startDate = new Date(record.startDate);
      const endDate = new Date(record.endDate);
      
      // Add deadline event
      events.push({
        id: `${record.id}-deadline`,
        kpiId: record.kpiId,
        kpiName: kpi.name,
        title: `${t.employeeCalendar.deadlinePrefix} ${kpi.name}`,
        date: endDate,
        type: 'deadline',
        status: endDate < today ? 'overdue' : 
                endDate.getTime() - today.getTime() <= 3 * 24 * 60 * 60 * 1000 ? 'upcoming' : 'pending',
        priority: endDate.getTime() - today.getTime() <= 24 * 60 * 60 * 1000 ? 'urgent' : 'high',
        description: t.employeeCalendar.completeKpi.replace('{name}', kpi.name),
        progress: record.target > 0 ? ((record.actual || 0) / record.target * 100) : 0
      });

      // Add reminder events (3 days before deadline)
      const reminderDate = new Date(endDate);
      reminderDate.setDate(reminderDate.getDate() - 3);
      
      if (reminderDate > today) {
        events.push({
          id: `${record.id}-reminder`,
          kpiId: record.kpiId,
          kpiName: kpi.name,
          title: `${t.employeeCalendar.reminderPrefix} ${kpi.name}`,
          date: reminderDate,
          type: 'reminder',
          status: 'upcoming',
          priority: 'medium',
          description: t.employeeCalendar.reminderDescription.replace('{name}', kpi.name)
        });
      }

      // Add milestone events (quarterly checkpoints)
      if (kpi.frequency === 'quarterly') {
        const quarterStart = new Date(startDate);
        const quarterEnd = new Date(endDate);
        const quarterLength = quarterEnd.getTime() - quarterStart.getTime();
        
        for (let i = 1; i <= 3; i++) {
          const milestoneDate = new Date(quarterStart.getTime() + (quarterLength * i / 4));
          if (milestoneDate <= endDate && milestoneDate >= today) {
            events.push({
              id: `${record.id}-milestone-${i}`,
              kpiId: record.kpiId,
              kpiName: kpi.name,
              title: `${t.employeeCalendar.milestone.replace('{number}', i.toString())}: ${kpi.name}`,
              date: milestoneDate,
              type: 'milestone',
              status: 'upcoming',
              priority: 'medium',
              description: t.employeeCalendar.quarterlyCheck.replace('{quarter}', i.toString())
            });
          }
        }
      }
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [userKpiRecords, kpis]);

  // Filter events based on status and priority
  const filteredEvents = useMemo(() => {
    return calendarEvents.filter(event => {
      const statusMatch = filterStatus === 'all' || event.status === filterStatus;
      const priorityMatch = filterPriority === 'all' || event.priority === filterPriority;
      return statusMatch && priorityMatch;
    });
  }, [calendarEvents, filterStatus, filterPriority]);

  // Get events for current month
  const monthEvents = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    return filteredEvents.filter(event => 
      event.date >= monthStart && event.date <= monthEnd
    );
  }, [filteredEvents, currentDate]);

  // Get events for specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, date));
  };

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return days;
  }, [currentDate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />{t.employeeCalendar.completed}</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />{t.employeeCalendar.overdue}</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />{t.employeeCalendar.upcoming}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />{t.employeeCalendar.pending}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">{t.employeeCalendar.urgent}</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">{t.employeeCalendar.high}</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">{t.employeeCalendar.medium}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{t.employeeCalendar.low}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Target className="w-4 h-4" />;
      case 'reminder':
        return <Clock className="w-4 h-4" />;
      case 'milestone':
        return <TrendingUp className="w-4 h-4" />;
      case 'review':
        return <FileText className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.employeeCalendar.title}</h1>
          <p className="text-muted-foreground">
            {t.employeeCalendar.subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => navigateMonth('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">{t.employeeCalendar.filterBy}</span>
            </div>
            <div className="flex gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t.common.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.employeeCalendar.allStatuses}</SelectItem>
                  <SelectItem value="pending">{t.employeeCalendar.pending}</SelectItem>
                  <SelectItem value="upcoming">{t.employeeCalendar.upcoming}</SelectItem>
                  <SelectItem value="overdue">{t.employeeCalendar.overdue}</SelectItem>
                  <SelectItem value="completed">{t.employeeCalendar.completed}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t.employeeCalendar.priority} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.employeeCalendar.allPriorities}</SelectItem>
                  <SelectItem value="urgent">{t.employeeCalendar.urgent}</SelectItem>
                  <SelectItem value="high">{t.employeeCalendar.high}</SelectItem>
                  <SelectItem value="medium">{t.employeeCalendar.medium}</SelectItem>
                  <SelectItem value="low">{t.employeeCalendar.low}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week' | 'day')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="month">{t.employeeCalendar.monthView}</TabsTrigger>
          <TabsTrigger value="week">{t.employeeCalendar.weekView}</TabsTrigger>
                  <TabsTrigger value="day">{t.employeeCalendar.dayView}</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-4">
          {/* Month Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {format(currentDate, 'MMMM yyyy', { locale: vi })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const isCurrentDay = isToday(day);
                  const isPastDay = isPast(day) && !isCurrentDay;
                  
                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[100px] p-2 border border-border rounded-lg
                        ${isCurrentDay ? 'bg-primary/10 border-primary' : ''}
                        ${isPastDay ? 'bg-muted/50' : ''}
                      `}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-medium ${isCurrentDay ? 'text-primary' : ''}`}>
                          {format(day, 'd')}
                        </span>
                        {dayEvents.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {dayEvents.length}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`
                              text-xs p-1 rounded cursor-pointer truncate
                              ${event.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                event.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'}
                            `}
                            title={event.title}
                          >
                            {getTypeIcon(event.type)}
                            <span className="ml-1">{event.kpiName}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            {t.employeeCalendar.otherEvents.replace('{count}', (dayEvents.length - 2).toString())}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.employeeCalendar.currentWeek}</CardTitle>
              <CardDescription>
                {t.employeeCalendar.weekDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {getTypeIcon(event.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{event.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {format(event.date, 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </span>
                        {getStatusBadge(event.status)}
                        {getPriorityBadge(event.priority)}
                      </div>
                    </div>
                    {event.progress !== undefined && (
                      <div className="flex-shrink-0 w-20">
                        <Progress value={event.progress} className="h-2" />
                        <span className="text-xs text-muted-foreground mt-1">
                          {Math.round(event.progress)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.employeeCalendar.today}</CardTitle>
              <CardDescription>
                {t.employeeCalendar.todayDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getEventsForDate(new Date()).map((event) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {getTypeIcon(event.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{event.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {format(event.date, 'HH:mm', { locale: vi })}
                        </span>
                        {getStatusBadge(event.status)}
                        {getPriorityBadge(event.priority)}
                      </div>
                    </div>
                    {event.progress !== undefined && (
                      <div className="flex-shrink-0 w-20">
                        <Progress value={event.progress} className="h-2" />
                        <span className="text-xs text-muted-foreground mt-1">
                          {Math.round(event.progress)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {getEventsForDate(new Date()).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t.employeeCalendar.noEventsToday}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t.employeeCalendar.upcomingEvents}
          </CardTitle>
          <CardDescription>
            {t.employeeCalendar.upcomingDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents
              .filter(event => {
                const daysDiff = Math.ceil((event.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff >= 0 && daysDiff <= 7;
              })
              .slice(0, 5)
              .map((event) => (
                <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {getTypeIcon(event.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{event.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {format(event.date, 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </span>
                      {getStatusBadge(event.status)}
                      {getPriorityBadge(event.priority)}
                    </div>
                  </div>
                  {event.progress !== undefined && (
                    <div className="flex-shrink-0 w-20">
                      <Progress value={event.progress} className="h-2" />
                      <span className="text-xs text-muted-foreground mt-1">
                        {Math.round(event.progress)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
