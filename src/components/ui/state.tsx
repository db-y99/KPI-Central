'use client';

import React from 'react';
import { Loader2, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'md',
  text = 'Đang tải...',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Đã xảy ra lỗi',
  message = 'Không thể tải dữ liệu. Vui lòng thử lại.',
  onRetry,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 p-8', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không có dữ liệu',
  message = 'Chưa có dữ liệu để hiển thị.',
  icon,
  action,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 p-8', className)}>
      {icon || (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Info className="h-6 w-6 text-gray-600" />
        </div>
      )}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

interface SuccessStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title = 'Thành công',
  message = 'Thao tác đã được thực hiện thành công.',
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 p-8', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-6 w-6 text-green-600" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
    </div>
  );
};

interface WarningStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export const WarningState: React.FC<WarningStateProps> = ({
  title = 'Cảnh báo',
  message = 'Có một số vấn đề cần chú ý.',
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 p-8', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
        <AlertTriangle className="h-6 w-6 text-yellow-600" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
    </div>
  );
};

// Generic state component that handles different states
interface StateProps {
  state: 'loading' | 'error' | 'empty' | 'success' | 'warning' | 'content';
  loadingProps?: LoadingStateProps;
  errorProps?: ErrorStateProps;
  emptyProps?: EmptyStateProps;
  successProps?: SuccessStateProps;
  warningProps?: WarningStateProps;
  children?: React.ReactNode;
  className?: string;
}

export const State: React.FC<StateProps> = ({
  state,
  loadingProps,
  errorProps,
  emptyProps,
  successProps,
  warningProps,
  children,
  className,
}) => {
  switch (state) {
    case 'loading':
      return <LoadingState {...loadingProps} className={className} />;
    case 'error':
      return <ErrorState {...errorProps} className={className} />;
    case 'empty':
      return <EmptyState {...emptyProps} className={className} />;
    case 'success':
      return <SuccessState {...successProps} className={className} />;
    case 'warning':
      return <WarningState {...warningProps} className={className} />;
    case 'content':
    default:
      return <div className={className}>{children}</div>;
  }
};
