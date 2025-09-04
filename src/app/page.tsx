import DashboardHeader from '@/components/dashboard-header';
import KpiCard from '@/components/kpi-card';
import { employees, kpis, kpiRecords } from '@/lib/data';
import type { Kpi, KpiRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Assume the logged-in user is 'Nguyễn Văn A' (e1) for demonstration
const LOGGED_IN_EMPLOYEE_ID = 'e1';

export default function DashboardPage() {
  const user = employees.find(e => e.id === LOGGED_IN_EMPLOYEE_ID);
  const userKpiRecords = kpiRecords.filter(
    r => r.employeeId === LOGGED_IN_EMPLOYEE_ID
  );

  const enrichedKpiRecords = userKpiRecords.map(record => {
    const kpiDetails = kpis.find(k => k.id === record.kpiId);
    // This combines the record with its definition for easy access in components
    return { ...record, ...kpiDetails };
  });

  return (
    <div className="flex h-full flex-col">
      <DashboardHeader title="Dashboard" user={user} />
      <div className="flex-1 space-y-8 overflow-y-auto p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrichedKpiRecords.map(record => (
            <KpiCard key={record.id} record={record as Kpi & KpiRecord} />
          ))}
        </div>

        {enrichedKpiRecords.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No KPIs Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You do not have any KPIs assigned for the current period.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
