import { useContext, useState, useRef } from 'react';
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import type { KpiRecord } from '@/types';

export interface KpiActionsConfig {
  record: KpiRecord;
  onUpdate?: (recordId: string, updates: Partial<KpiRecord>) => void;
  onReport?: (recordId: string, report: string, files?: File[]) => void;
  onApprove?: (recordId: string) => void;
  onReject?: (recordId: string, comment: string) => void;
}

export function useKpiActions(config: KpiActionsConfig) {
  const { user } = useContext(AuthContext);
  const { updateKpiRecord, submitReport, approveKpi, rejectKpi } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [inputValue, setInputValue] = useState(config.record.actual.toString());
  const [rejectionComment, setRejectionComment] = useState('');
  
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === 'admin';
  const isEmployee = !isAdmin;

  const canUpdate = isEmployee && (config.record.status === 'pending' || config.record.status === 'rejected');
  const canSubmit = isEmployee && config.record.status === 'pending' && config.record.actual > 0;
  const canApprove = isAdmin && config.record.status === 'awaiting_approval';

  const completionPercentage =
    config.record.target > 0 ? Math.round((config.record.actual / config.record.target) * 100) : 0;

  const handleUpdate = () => {
    const newActual = parseFloat(inputValue);
    if (!isNaN(newActual)) {
      // Update actual value and change status to awaiting_approval if actual > 0
      const updates: Partial<KpiRecord> = { actual: newActual };
      if (newActual > 0 && config.record.status === 'pending') {
        updates.status = 'awaiting_approval';
      }
      
      if (config.onUpdate) {
        config.onUpdate(config.record.id, updates);
      } else {
        updateKpiRecord(config.record.id, updates);
      }
      
      toast({
        title: "Thành công!",
        description: `Đã cập nhật kết quả cho KPI "${config.record.name}".`
      });
    }
    setUpdateDialogOpen(false);
  };
  
  const handleSubmitReport = () => {
    const reportText = fileInputRef.current?.files?.[0]?.name || 'Báo cáo đã được gửi';
    
    if (config.onReport) {
      config.onReport(config.record.id, reportText, fileInputRef.current?.files ? Array.from(fileInputRef.current.files) : []);
    } else {
      submitReport(config.record.id, reportText);
    }
    
    toast({
      title: "Thành công!",
      description: `Đã gửi báo cáo cho KPI "${config.record.name}".`
    });
    setReportDialogOpen(false);
  };

  const handleApprove = () => {
    if (config.onApprove) {
      config.onApprove(config.record.id);
    } else {
      approveKpi(config.record.id);
    }
    
    toast({
      title: "Thành công!",
      description: `Đã phê duyệt KPI "${config.record.name}".`
    });
  };

  const handleReject = () => {
    if (config.onReject) {
      config.onReject(config.record.id, rejectionComment);
    } else {
      rejectKpi(config.record.id, rejectionComment);
    }
    
    toast({
      title: "Thành công!",
      description: `Đã từ chối KPI "${config.record.name}".`
    });
    setRejectDialogOpen(false);
    setRejectionComment('');
  };

  const getStatusConfig = () => {
    const statusConfig = {
      pending: { 
        label: t.kpis.status.pending, 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: '⏳' 
      },
      awaiting_approval: { 
        label: t.kpis.status.awaitingApproval, 
        color: 'bg-blue-100 text-blue-800', 
        icon: '📋' 
      },
      approved: { 
        label: t.kpis.status.approved, 
        color: 'bg-green-100 text-green-800', 
        icon: '✅' 
      },
      rejected: { 
        label: t.kpis.status.rejected, 
        color: 'bg-red-100 text-red-800', 
        icon: '❌' 
      },
    };
    return statusConfig;
  };

  const getStatusInfo = () => {
    const config = getStatusConfig();
    return config[config.record.status] || config.pending;
  };

  return {
    // State
    inputValue,
    setInputValue,
    rejectionComment,
    setRejectionComment,
    updateDialogOpen,
    setUpdateDialogOpen,
    reportDialogOpen,
    setReportDialogOpen,
    rejectDialogOpen,
    setRejectDialogOpen,
    fileInputRef,
    
    // Computed values
    isAdmin,
    isEmployee,
    canUpdate,
    canSubmit,
    canApprove,
    completionPercentage,
    statusInfo: getStatusInfo(),
    
    // Actions
    handleUpdate,
    handleSubmitReport,
    handleApprove,
    handleReject,
    
    // Utils
    getStatusConfig,
  };
}
