'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { usePDFExport } from '@/lib/pdf-export';
import { useToast } from '@/hooks/use-toast';

interface PDFExportButtonProps {
  elementId: string;
  filename: string;
  title?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export default function PDFExportButton({
  elementId,
  filename,
  title,
  variant = 'outline',
  size = 'default',
  className = '',
  children
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { exportToPDF } = usePDFExport();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportToPDF(elementId, filename, title);
      
      toast({
        title: 'Thành công',
        description: 'Đã xuất PDF thành công!',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xuất PDF. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      size={size}
      className={`${className} ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileText className="w-4 h-4 mr-2" />
      )}
      {children || (isExporting ? 'Đang tạo PDF...' : 'Xuất PDF')}
    </Button>
  );
}

interface PDFTableExportButtonProps {
  data: any[];
  columns: { key: string; label: string; width?: number }[];
  filename: string;
  title?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function PDFTableExportButton({
  data,
  columns,
  filename,
  title,
  variant = 'outline',
  size = 'default',
  className = '',
  children
}: PDFTableExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { exportTableToPDF } = usePDFExport();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportTableToPDF(data, columns, filename, title);
      
      toast({
        title: 'Thành công',
        description: 'Đã xuất PDF thành công!',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xuất PDF. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      size={size}
      className={`${className} ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileText className="w-4 h-4 mr-2" />
      )}
      {children || (isExporting ? 'Đang tạo PDF...' : 'Xuất PDF')}
    </Button>
  );
}

interface PDFChartExportButtonProps {
  chartElementId: string;
  filename: string;
  title?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function PDFChartExportButton({
  chartElementId,
  filename,
  title,
  variant = 'outline',
  size = 'default',
  className = '',
  children
}: PDFChartExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { exportChartToPDF } = usePDFExport();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportChartToPDF(chartElementId, filename, title);
      
      toast({
        title: 'Thành công',
        description: 'Đã xuất PDF thành công!',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xuất PDF. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      size={size}
      className={`${className} ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileText className="w-4 h-4 mr-2" />
      )}
      {children || (isExporting ? 'Đang tạo PDF...' : 'Xuất PDF')}
    </Button>
  );
}
