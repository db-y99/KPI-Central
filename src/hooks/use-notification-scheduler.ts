'use client';
import { useEffect, useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';
import { SystemNotificationService } from '@/lib/system-notification-service';

export function useNotificationScheduler() {
  const { user } = useContext(AuthContext);
  const { kpiRecords, employees, kpis } = useContext(DataContext);

  useEffect(() => {
    if (!user || !kpiRecords.length || !employees.length || !kpis.length) {
      return;
    }

    // Chạy kiểm tra thông báo KPI mỗi 5 phút
    const interval = setInterval(async () => {
      try {
        await SystemNotificationService.checkAndCreateKpiReminders();
      } catch (error) {
        console.error('Error checking KPI reminders:', error);
      }
    }, 5 * 60 * 1000); // 5 phút

    // Chạy ngay lập tức lần đầu
    SystemNotificationService.checkAndCreateKpiReminders().catch(error => {
      console.error('Error checking KPI reminders on mount:', error);
    });

    return () => clearInterval(interval);
  }, [user, kpiRecords.length, employees.length, kpis.length]);

  return null;
}
