import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  margin?: number;
}

export class PDFExporter {
  private static defaultOptions: PDFExportOptions = {
    filename: 'report.pdf',
    title: 'KPI Report',
    orientation: 'portrait',
    format: 'a4',
    margin: 20
  };

  /**
   * Export a React component/element to PDF
   */
  static async exportElementToPDF(
    elementId: string, 
    options: PDFExportOptions = {}
  ): Promise<void> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }

      // Show loading state
      const originalContent = element.innerHTML;
      element.innerHTML = '<div style="text-align: center; padding: 50px;">Đang tạo PDF...</div>';

      // Create canvas from element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Restore original content
      element.innerHTML = originalContent;

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: mergedOptions.orientation,
        unit: 'mm',
        format: mergedOptions.format
      });

      const imgWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add title if provided
      if (mergedOptions.title) {
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(mergedOptions.title, mergedOptions.margin!, 20);
        position = 30;
        heightLeft -= 10;
      }

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', mergedOptions.margin!, position, imgWidth - (mergedOptions.margin! * 2), heightLeft);
      heightLeft -= pageHeight;

      // Add new pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', mergedOptions.margin!, position, imgWidth - (mergedOptions.margin! * 2), heightLeft);
        heightLeft -= pageHeight;
      }

      // Add footer with timestamp
      const pageCount = (pdf as any).getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Trang ${i} / ${pageCount} - Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`,
          mergedOptions.margin!,
          pageHeight - 10
        );
      }

      // Save PDF
      pdf.save(mergedOptions.filename || 'report.pdf');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Không thể tạo PDF. Vui lòng thử lại.');
    }
  }

  /**
   * Export table data to PDF
   */
  static async exportTableToPDF(
    tableData: any[],
    columns: { key: string; label: string; width?: number }[],
    options: PDFExportOptions = {}
  ): Promise<void> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      const pdf = new jsPDF({
        orientation: mergedOptions.orientation,
        unit: 'mm',
        format: mergedOptions.format
      });

      // Add title
      if (mergedOptions.title) {
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(mergedOptions.title, mergedOptions.margin!, 20);
      }

      // Calculate column widths
      const pageWidth = pdf.internal.pageSize.getWidth();
      const availableWidth = pageWidth - (mergedOptions.margin! * 2);
      const columnWidth = availableWidth / columns.length;

      // Add table headers
      let yPosition = 40;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      
      columns.forEach((column, index) => {
        const xPosition = mergedOptions.margin! + (index * columnWidth);
        pdf.text(column.label, xPosition, yPosition);
      });

      // Add table data
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      tableData.forEach((row, rowIndex) => {
        // Check if we need a new page
        if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        columns.forEach((column, colIndex) => {
          const xPosition = mergedOptions.margin! + (colIndex * columnWidth);
          const cellValue = row[column.key] || '';
          pdf.text(String(cellValue), xPosition, yPosition);
        });

        yPosition += 8;
      });

      // Add footer
      const pageCount = (pdf as any).getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(
          `Trang ${i} / ${pageCount} - Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`,
          mergedOptions.margin!,
          pdf.internal.pageSize.getHeight() - 10
        );
      }

      pdf.save(mergedOptions.filename || 'report.pdf');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Không thể tạo PDF. Vui lòng thử lại.');
    }
  }

  /**
   * Export chart to PDF
   */
  static async exportChartToPDF(
    chartElementId: string,
    options: PDFExportOptions = {}
  ): Promise<void> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      const chartElement = document.getElementById(chartElementId);
      if (!chartElement) {
        throw new Error(`Chart element with id "${chartElementId}" not found`);
      }

      const canvas = await html2canvas(chartElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: mergedOptions.orientation,
        unit: 'mm',
        format: mergedOptions.format
      });

      const imgWidth = pdf.internal.pageSize.getWidth() - (mergedOptions.margin! * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add title
      if (mergedOptions.title) {
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(mergedOptions.title, mergedOptions.margin!, 20);
      }

      // Add chart image
      const yPosition = mergedOptions.title ? 40 : mergedOptions.margin!;
      pdf.addImage(imgData, 'PNG', mergedOptions.margin!, yPosition, imgWidth, imgHeight);

      // Add footer
      pdf.setFontSize(8);
      pdf.text(
        `Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`,
        mergedOptions.margin!,
        pdf.internal.pageSize.getHeight() - 10
      );

      pdf.save(mergedOptions.filename || 'report.pdf');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Không thể tạo PDF. Vui lòng thử lại.');
    }
  }
}

/**
 * Hook for PDF export functionality
 */
export const usePDFExport = () => {
  const exportToPDF = async (
    elementId: string,
    filename: string,
    title?: string
  ) => {
    try {
      await PDFExporter.exportElementToPDF(elementId, {
        filename,
        title,
        orientation: 'portrait',
        format: 'a4'
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  };

  const exportTableToPDF = async (
    data: any[],
    columns: { key: string; label: string; width?: number }[],
    filename: string,
    title?: string
  ) => {
    try {
      await PDFExporter.exportTableToPDF(data, columns, {
        filename,
        title,
        orientation: 'landscape',
        format: 'a4'
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  };

  const exportChartToPDF = async (
    chartElementId: string,
    filename: string,
    title?: string
  ) => {
    try {
      await PDFExporter.exportChartToPDF(chartElementId, {
        filename,
        title,
        orientation: 'landscape',
        format: 'a4'
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  };

  return {
    exportToPDF,
    exportTableToPDF,
    exportChartToPDF
  };
};
