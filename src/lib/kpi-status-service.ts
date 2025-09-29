import { KpiRecord } from '@/types';

/**
 * KPI Status Service - Quản lý logic trạng thái KPI nhất quán
 * 
 * Workflow trạng thái:
 * not_started → in_progress → submitted → approved
 *                    ↓           ↓
 *                 rejected ← rejected
 */

export type KpiStatus = 'not_started' | 'in_progress' | 'submitted' | 'awaiting_approval' | 'approved' | 'rejected';

export interface StatusTransition {
  from: KpiStatus;
  to: KpiStatus[];
  description: string;
}

export interface StatusConfig {
  label: string;
  color: string;
  icon: string;
  description: string;
}

export class KpiStatusService {
  // Định nghĩa các transition hợp lệ
  private static readonly VALID_TRANSITIONS: Record<KpiStatus, KpiStatus[]> = {
    'not_started': ['in_progress', 'awaiting_approval'],
    'in_progress': ['submitted', 'awaiting_approval', 'rejected'],
    'submitted': ['approved', 'rejected'],
    'awaiting_approval': ['approved', 'rejected'],
    'approved': [], // Trạng thái cuối cùng
    'rejected': ['in_progress'] // Có thể thử lại
  };

  // Cấu hình hiển thị cho từng trạng thái
  private static readonly STATUS_CONFIGS: Record<KpiStatus, StatusConfig> = {
    'not_started': {
      label: 'Chưa bắt đầu',
      color: 'bg-gray-500',
      icon: 'Clock',
      description: 'KPI chưa được bắt đầu thực hiện'
    },
    'in_progress': {
      label: 'Đang thực hiện',
      color: 'bg-blue-500',
      icon: 'Play',
      description: 'KPI đang được thực hiện'
    },
    'submitted': {
      label: 'Đã nộp',
      color: 'bg-yellow-500',
      icon: 'AlertCircle',
      description: 'KPI đã được nộp và chờ duyệt'
    },
    'awaiting_approval': {
      label: 'Chờ duyệt',
      color: 'bg-orange-500',
      icon: 'Clock',
      description: 'KPI đang chờ admin duyệt'
    },
    'approved': {
      label: 'Đã duyệt',
      color: 'bg-green-500',
      icon: 'CheckCircle',
      description: 'KPI đã được duyệt và hoàn thành'
    },
    'rejected': {
      label: 'Từ chối',
      color: 'bg-red-500',
      icon: 'XCircle',
      description: 'KPI bị từ chối và cần sửa lại'
    }
  };

  /**
   * Kiểm tra xem có thể chuyển từ trạng thái này sang trạng thái khác không
   */
  static canTransition(from: KpiStatus, to: KpiStatus): boolean {
    return this.VALID_TRANSITIONS[from]?.includes(to) || false;
  }

  /**
   * Validate việc chuyển trạng thái dựa trên business rules
   */
  static validateTransition(
    record: KpiRecord, 
    newStatus: KpiStatus, 
    userRole: string,
    additionalData?: { actual?: number; submittedReport?: string }
  ): { isValid: boolean; error?: string } {
    
    // Kiểm tra trạng thái hiện tại hợp lệ
    if (!record.status || !this.STATUS_CONFIGS[record.status as KpiStatus]) {
      console.warn(`Invalid current KPI status: ${record.status}`);
      return {
        isValid: false,
        error: `Trạng thái hiện tại không hợp lệ: ${record.status}`
      };
    }

    // Kiểm tra trạng thái mới hợp lệ
    if (!newStatus || !this.STATUS_CONFIGS[newStatus]) {
      console.warn(`Invalid new KPI status: ${newStatus}`);
      return {
        isValid: false,
        error: `Trạng thái mới không hợp lệ: ${newStatus}`
      };
    }
    
    // Kiểm tra quyền hạn trước
    if (newStatus === 'submitted' && userRole !== 'employee') {
      return {
        isValid: false,
        error: 'Chỉ nhân viên mới có thể nộp KPI'
      };
    }

    if (newStatus === 'awaiting_approval' && userRole !== 'employee') {
      return {
        isValid: false,
        error: 'Chỉ nhân viên mới có thể nộp KPI chờ duyệt'
      };
    }

    if (['approved', 'rejected'].includes(newStatus) && userRole !== 'admin') {
      return {
        isValid: false,
        error: 'Chỉ admin mới có thể duyệt/từ chối KPI'
      };
    }

    // Admin có thể duyệt trực tiếp từ not_started nếu có actual value
    if (userRole === 'admin' && record.status === 'not_started' && newStatus === 'approved') {
      if (record.actual > 0) {
        return { isValid: true };
      } else {
        return {
          isValid: false,
          error: 'Phải có giá trị thực tế > 0 để duyệt KPI'
        };
      }
    }

    // Employee có thể submit trực tiếp từ not_started sang awaiting_approval nếu có actual value
    if (userRole === 'employee' && record.status === 'not_started' && newStatus === 'awaiting_approval') {
      if (additionalData?.actual && additionalData.actual > 0) {
        return { isValid: true };
      } else {
        return {
          isValid: false,
          error: 'Phải có giá trị thực tế > 0 để nộp KPI'
        };
      }
    }

    // Admin có thể từ chối từ bất kỳ trạng thái nào
    if (userRole === 'admin' && newStatus === 'rejected') {
      return { isValid: true };
    }
    
    // Kiểm tra transition hợp lệ cho các trường hợp khác
    if (!this.canTransition(record.status as KpiStatus, newStatus)) {
      return {
        isValid: false,
        error: `Không thể chuyển từ "${this.getStatusLabel(record.status as KpiStatus)}" sang "${this.getStatusLabel(newStatus)}"`
      };
    }

    // Kiểm tra business rules cụ thể
    if (newStatus === 'submitted') {
      if (!additionalData?.actual || additionalData.actual <= 0) {
        return {
          isValid: false,
          error: 'Phải có giá trị thực tế > 0 để nộp KPI'
        };
      }
    }

    if (newStatus === 'awaiting_approval') {
      if (!additionalData?.actual || additionalData.actual <= 0) {
        return {
          isValid: false,
          error: 'Phải có giá trị thực tế > 0 để nộp KPI chờ duyệt'
        };
      }
    }

    if (newStatus === 'in_progress' && record.status === 'rejected') {
      if (!additionalData?.actual || additionalData.actual <= 0) {
        return {
          isValid: false,
          error: 'Phải cập nhật giá trị thực tế để tiếp tục KPI'
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Lấy cấu hình hiển thị cho trạng thái
   */
  static getStatusConfig(status: KpiStatus): StatusConfig {
    if (!status || !this.STATUS_CONFIGS[status]) {
      console.warn(`Invalid KPI status: ${status}`);
      return {
        label: 'Trạng thái không xác định',
        color: 'bg-gray-500',
        icon: 'HelpCircle',
        description: 'Trạng thái không hợp lệ'
      };
    }
    return this.STATUS_CONFIGS[status];
  }

  /**
   * Lấy label cho trạng thái
   */
  static getStatusLabel(status: KpiStatus): string {
    if (!status || !this.STATUS_CONFIGS[status]) {
      console.warn(`Invalid KPI status: ${status}`);
      return 'Trạng thái không xác định';
    }
    return this.STATUS_CONFIGS[status].label;
  }

  /**
   * Lấy màu sắc cho trạng thái
   */
  static getStatusColor(status: KpiStatus): string {
    if (!status || !this.STATUS_CONFIGS[status]) {
      console.warn(`Invalid KPI status: ${status}`);
      return 'bg-gray-500';
    }
    return this.STATUS_CONFIGS[status].color;
  }

  /**
   * Lấy icon cho trạng thái
   */
  static getStatusIcon(status: KpiStatus): string {
    if (!status || !this.STATUS_CONFIGS[status]) {
      console.warn(`Invalid KPI status: ${status}`);
      return 'HelpCircle';
    }
    return this.STATUS_CONFIGS[status].icon;
  }

  /**
   * Lấy mô tả cho trạng thái
   */
  static getStatusDescription(status: KpiStatus): string {
    if (!status || !this.STATUS_CONFIGS[status]) {
      console.warn(`Invalid KPI status: ${status}`);
      return 'Trạng thái không hợp lệ';
    }
    return this.STATUS_CONFIGS[status].description;
  }

  /**
   * Lấy tất cả trạng thái có thể chuyển đến từ trạng thái hiện tại
   */
  static getAvailableTransitions(currentStatus: KpiStatus): KpiStatus[] {
    return this.VALID_TRANSITIONS[currentStatus] || [];
  }

  /**
   * Kiểm tra xem trạng thái có phải là trạng thái cuối cùng không
   */
  static isFinalStatus(status: KpiStatus): boolean {
    return status === 'approved';
  }

  /**
   * Kiểm tra xem trạng thái có thể chỉnh sửa không
   */
  static isEditableStatus(status: KpiStatus): boolean {
    return ['not_started', 'in_progress', 'rejected'].includes(status);
  }

  /**
   * Kiểm tra xem trạng thái có thể nộp không
   */
  static canSubmitStatus(status: KpiStatus): boolean {
    return status === 'in_progress';
  }

  /**
   * Kiểm tra xem trạng thái có thể duyệt không
   */
  static canApproveStatus(status: KpiStatus): boolean {
    return status === 'submitted';
  }

  /**
   * Lấy trạng thái tiếp theo dựa trên hành động
   */
  static getNextStatusByAction(currentStatus: KpiStatus, action: 'start' | 'submit' | 'approve' | 'reject'): KpiStatus | null {
    switch (action) {
      case 'start':
        return currentStatus === 'not_started' ? 'in_progress' : null;
      case 'submit':
        return currentStatus === 'in_progress' ? 'submitted' : null;
      case 'approve':
        return currentStatus === 'submitted' ? 'approved' : null;
      case 'reject':
        return ['submitted', 'in_progress'].includes(currentStatus) ? 'rejected' : null;
      default:
        return null;
    }
  }

  /**
   * Migrate trạng thái cũ sang trạng thái mới
   */
  static migrateOldStatus(oldStatus: string): KpiStatus {
    const migrationMap: Record<string, KpiStatus> = {
      'pending': 'not_started',
      'awaiting_approval': 'submitted',
      'approved': 'approved',
      'rejected': 'rejected',
      'completed': 'approved',
      'in-progress': 'in_progress'
    };

    return migrationMap[oldStatus] || 'not_started';
  }

  /**
   * Validate và migrate record từ trạng thái cũ
   */
  static migrateRecord(record: KpiRecord): KpiRecord {
    const newStatus = this.migrateOldStatus(record.status);

    return {
      ...record,
      status: newStatus
    };
  }

  /**
   * Lấy tất cả các trạng thái KPI có sẵn
   */
  static getAllStatuses(): Array<{key: KpiStatus, label: string, color: string, icon: string, description: string}> {
    return Object.entries(this.STATUS_CONFIGS).map(([key, config]) => ({
      key: key as KpiStatus,
      label: config.label,
      color: config.color,
      icon: config.icon,
      description: config.description
    }));
  }
}

// Export types và constants để sử dụng trong components
export const KPI_STATUSES: KpiStatus[] = ['not_started', 'in_progress', 'submitted', 'approved', 'rejected'];

export const STATUS_TRANSITIONS: StatusTransition[] = [
  { from: 'not_started', to: ['in_progress'], description: 'Bắt đầu thực hiện KPI' },
  { from: 'in_progress', to: ['submitted', 'rejected'], description: 'Nộp KPI hoặc bị từ chối' },
  { from: 'submitted', to: ['approved', 'rejected'], description: 'Duyệt hoặc từ chối KPI' },
  { from: 'approved', to: [], description: 'KPI đã hoàn thành' },
  { from: 'rejected', to: ['in_progress'], description: 'Sửa lại và tiếp tục KPI' }
];
