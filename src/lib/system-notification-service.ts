import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Notification, KpiRecord, Report, Employee } from '@/types';

export class SystemNotificationService {
  /**
   * Tạo thông báo khi KPI được giao cho nhân viên
   */
  static async notifyKpiAssigned(kpiRecord: KpiRecord, employee: Employee, kpiName: string, kpiUnit?: string): Promise<void> {
    const unit = kpiUnit || 'đơn vị'; // Default unit if not provided
    const notification: Omit<Notification, 'id' | 'createdAt' | 'readAt'> = {
      userId: employee.uid,
      title: 'KPI mới được giao',
      message: `Bạn đã được giao KPI "${kpiName}" với chỉ tiêu ${kpiRecord.target} ${unit}. Hạn hoàn thành: ${new Date(kpiRecord.endDate).toLocaleDateString('vi-VN')}`,
      type: 'kpi',
      category: 'kpi_assigned',
      isRead: false,
      isImportant: true,
      actionUrl: '/employee/self-update-metrics',
      actionText: 'Cập nhật KPI',
      data: {
        kpiRecordId: kpiRecord.id,
        kpiName,
        target: kpiRecord.target,
        unit: unit,
        endDate: kpiRecord.endDate
      }
    };

    await addDoc(collection(db, 'notifications'), {
      ...notification,
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Tạo thông báo khi báo cáo được nộp
   */
  static async notifyReportSubmitted(report: Report, employee: Employee): Promise<void> {
    // Thông báo cho nhân viên
    const employeeNotification: Omit<Notification, 'id' | 'createdAt' | 'readAt'> = {
      userId: employee.uid,
      title: 'Báo cáo đã được nộp',
      message: `Báo cáo "${report.title}" đã được nộp thành công và đang chờ phê duyệt.`,
      type: 'success',
      category: 'report_submitted',
      isRead: false,
      isImportant: false,
      actionUrl: '/employee/reports',
      actionText: 'Xem báo cáo',
      data: {
        reportId: report.id,
        reportTitle: report.title
      }
    };

    await addDoc(collection(db, 'notifications'), {
      ...employeeNotification,
      createdAt: new Date().toISOString()
    });

    // Thông báo cho admin/quản lý
    const adminNotification: Omit<Notification, 'id' | 'createdAt' | 'readAt'> = {
      userId: 'admin', // Hoặc có thể lấy từ cấu hình
      title: 'Báo cáo mới cần phê duyệt',
      message: `${employee.name} đã nộp báo cáo "${report.title}" cần phê duyệt.`,
      type: 'report',
      category: 'report_submitted',
      isRead: false,
      isImportant: true,
      actionUrl: '/admin/approval',
      actionText: 'Phê duyệt',
      data: {
        reportId: report.id,
        reportTitle: report.title,
        employeeName: employee.name,
        employeeId: employee.uid
      }
    };

    await addDoc(collection(db, 'notifications'), {
      ...adminNotification,
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Tạo thông báo khi báo cáo được phê duyệt
   */
  static async notifyReportApproved(report: Report, employee: Employee, feedback?: string): Promise<void> {
    const notification: Omit<Notification, 'id' | 'createdAt' | 'readAt'> = {
      userId: employee.uid,
      title: 'Báo cáo đã được phê duyệt',
      message: `Báo cáo "${report.title}" đã được phê duyệt thành công.${feedback ? ` Phản hồi: ${feedback}` : ''}`,
      type: 'success',
      category: 'report_approved',
      isRead: false,
      isImportant: false,
      actionUrl: '/employee/reports',
      actionText: 'Xem báo cáo',
      data: {
        reportId: report.id,
        reportTitle: report.title,
        feedback
      }
    };

    await addDoc(collection(db, 'notifications'), {
      ...notification,
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Tạo thông báo khi báo cáo bị từ chối
   */
  static async notifyReportRejected(report: Report, employee: Employee, feedback: string): Promise<void> {
    const notification: Omit<Notification, 'id' | 'createdAt' | 'readAt'> = {
      userId: employee.uid,
      title: 'Báo cáo cần chỉnh sửa',
      message: `Báo cáo "${report.title}" cần được chỉnh sửa. Lý do: ${feedback}`,
      type: 'warning',
      category: 'report_revision_requested',
      isRead: false,
      isImportant: true,
      actionUrl: '/employee/reports',
      actionText: 'Chỉnh sửa',
      data: {
        reportId: report.id,
        reportTitle: report.title,
        feedback
      }
    };

    await addDoc(collection(db, 'notifications'), {
      ...notification,
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Tạo thông báo nhắc nhở KPI sắp hết hạn
   */
  static async notifyKpiDeadlineReminder(kpiRecord: KpiRecord, employee: Employee, kpiName: string, daysLeft: number): Promise<void> {
    const notification: Omit<Notification, 'id' | 'createdAt' | 'readAt'> = {
      userId: employee.uid,
      title: 'KPI sắp hết hạn',
      message: `KPI "${kpiName}" sẽ hết hạn trong ${daysLeft} ngày. Hãy hoàn thành và nộp báo cáo sớm.`,
      type: 'warning',
      category: 'kpi_deadline_reminder',
      isRead: false,
      isImportant: daysLeft <= 3,
      actionUrl: '/employee/self-update-metrics',
      actionText: 'Cập nhật ngay',
      data: {
        kpiRecordId: kpiRecord.id,
        kpiName,
        daysLeft,
        endDate: kpiRecord.endDate
      }
    };

    await addDoc(collection(db, 'notifications'), {
      ...notification,
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Tạo thông báo khi KPI quá hạn
   */
  static async notifyKpiOverdue(kpiRecord: KpiRecord, employee: Employee, kpiName: string, overdueDays: number): Promise<void> {
    const notification: Omit<Notification, 'id' | 'createdAt' | 'readAt'> = {
      userId: employee.uid,
      title: 'KPI đã quá hạn',
      message: `KPI "${kpiName}" đã quá hạn ${overdueDays} ngày. Vui lòng hoàn thành và nộp báo cáo ngay lập tức.`,
      type: 'error',
      category: 'kpi_overdue',
      isRead: false,
      isImportant: true,
      actionUrl: '/employee/self-update-metrics',
      actionText: 'Cập nhật ngay',
      data: {
        kpiRecordId: kpiRecord.id,
        kpiName,
        overdueDays,
        endDate: kpiRecord.endDate
      }
    };

    await addDoc(collection(db, 'notifications'), {
      ...notification,
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Tạo thông báo hệ thống
   */
  static async notifySystemUpdate(title: string, message: string, userIds?: string[]): Promise<void> {
    if (userIds && userIds.length > 0) {
      // Gửi cho danh sách user cụ thể
      const notifications = userIds.map(userId => ({
        userId,
        title,
        message,
        type: 'system' as const,
        category: 'system_update' as const,
        isRead: false,
        isImportant: false,
        actionUrl: '/admin',
        actionText: 'Tìm hiểu thêm',
        createdAt: new Date().toISOString()
      }));

      for (const notification of notifications) {
        await addDoc(collection(db, 'notifications'), notification);
      }
    } else {
      // Gửi cho tất cả user (cần implement logic lấy danh sách user)
      const notification: Omit<Notification, 'id' | 'createdAt' | 'readAt'> = {
        userId: 'all', // Placeholder, cần implement logic gửi cho tất cả
        title,
        message,
        type: 'system',
        category: 'system_update',
        isRead: false,
        isImportant: false,
        actionUrl: '/admin',
        actionText: 'Tìm hiểu thêm'
      };

      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: new Date().toISOString()
      });
    }
  }

  /**
   * Kiểm tra và tạo thông báo nhắc nhở KPI
   */
  static async checkAndCreateKpiReminders(): Promise<void> {
    try {
      // Lấy tất cả KPI records đang pending
      const kpiRecordsQuery = query(
        collection(db, 'kpiRecords'),
        where('status', '==', 'pending'),
        orderBy('endDate', 'asc')
      );
      
      const kpiRecordsSnapshot = await getDocs(kpiRecordsQuery);
      const today = new Date();
      
      for (const doc of kpiRecordsSnapshot.docs) {
        const kpiRecord = { id: doc.id, ...doc.data() } as KpiRecord;
        const endDate = new Date(kpiRecord.endDate);
        const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Lấy thông tin employee và KPI
        const employeeQuery = query(
          collection(db, 'employees'),
          where('uid', '==', kpiRecord.employeeId),
          limit(1)
        );
        const employeeSnapshot = await getDocs(employeeQuery);
        
        if (employeeSnapshot.empty) continue;
        
        const employee = { id: employeeSnapshot.docs[0].id, ...employeeSnapshot.docs[0].data() } as Employee;
        
        // Lấy tên KPI
        const kpiQuery = query(
          collection(db, 'kpis'),
          where('id', '==', kpiRecord.kpiId),
          limit(1)
        );
        const kpiSnapshot = await getDocs(kpiQuery);
        
        if (kpiSnapshot.empty) continue;
        
        const kpiName = kpiSnapshot.docs[0].data().name;
        
        // Tạo thông báo dựa trên số ngày còn lại
        if (daysLeft <= 0) {
          // KPI đã quá hạn
          await this.notifyKpiOverdue(kpiRecord, employee, kpiName, Math.abs(daysLeft));
        } else if (daysLeft <= 7) {
          // KPI sắp hết hạn
          await this.notifyKpiDeadlineReminder(kpiRecord, employee, kpiName, daysLeft);
        }
      }
    } catch (error) {
      console.error('Error checking KPI reminders:', error);
    }
  }

  /**
   * Tạo thông báo chào mừng cho user mới
   */
  static async notifyNewUserWelcome(employee: Employee): Promise<void> {
    const notification: Omit<Notification, 'id' | 'createdAt' | 'readAt'> = {
      userId: employee.uid,
      title: 'Chào mừng đến với hệ thống KPI!',
      message: `Chào mừng ${employee.name}! Bạn đã được thêm vào hệ thống quản lý KPI. Hãy bắt đầu cập nhật các chỉ số của mình.`,
      type: 'success',
      category: 'general',
      isRead: false,
      isImportant: true,
      actionUrl: '/employee/self-update-metrics',
      actionText: 'Bắt đầu',
      data: {
        employeeName: employee.name,
        employeeId: employee.uid
      }
    };

    await addDoc(collection(db, 'notifications'), {
      ...notification,
      createdAt: new Date().toISOString()
    });
  }
}
