import DashboardHeader from '@/components/dashboard-header';
import ReportsTabs from '@/components/reports-tabs';
import { employees } from '@/lib/data';

// Giả sử một quản lý đã đăng nhập để xem báo cáo
const LOGGED_IN_EMPLOYEE_ID = 'e2';

export default function ReportsPage() {
  const user = employees.find(e => e.id === LOGGED_IN_EMPLOYEE_ID);

  return (
    <div className="flex h-full flex-col">
      <DashboardHeader title="Báo cáo hiệu suất" user={user} />
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <ReportsTabs />
      </div>
    </div>
  );
}
