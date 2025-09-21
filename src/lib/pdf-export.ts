import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface PDFExportOptions {
  title: string;
  subtitle?: string;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  margin?: number;
  includeHeader?: boolean;
  includeFooter?: boolean;
  includePageNumbers?: boolean;
  includeCharts?: boolean;
  chartQuality?: 'low' | 'medium' | 'high';
  watermark?: string;
  logo?: string;
}

export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'department' | 'company' | 'kpi-specific' | 'custom';
  template: string; // Template identifier
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  config: {
    headerHeight?: number;
    footerHeight?: number;
    chartHeight?: number;
    tableStyle?: any;
    fontFamily?: string;
    fontSize?: number;
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      text?: string;
    };
  };
}

export interface ChartExportOptions {
  chartElementId: string;
  chartType: 'bar' | 'line' | 'pie' | 'area';
  title?: string;
  width?: number;
  height?: number;
  quality?: 'low' | 'medium' | 'high';
}

export interface TableExportOptions {
  data: any[];
  columns: { key: string; label: string; width?: number; align?: 'left' | 'center' | 'right' }[];
  title?: string;
  showHeader?: boolean;
  striped?: boolean;
}

export class PDFExportService {
  private static instance: PDFExportService;
  private templates: Map<string, PDFTemplate> = new Map();
  
  public static getInstance(): PDFExportService {
    if (!PDFExportService.instance) {
      PDFExportService.instance = new PDFExportService();
    }
    return PDFExportService.instance;
  }

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize default templates
   */
  private initializeTemplates(): void {
    const defaultTemplates: PDFTemplate[] = [
      {
        id: 'individual-report',
        name: 'Individual Performance Report',
        description: 'Comprehensive individual KPI performance report',
        type: 'individual',
        template: 'individual-report-template',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        config: {
          headerHeight: 30,
          footerHeight: 20,
          chartHeight: 200,
          fontFamily: 'helvetica',
          fontSize: 10,
          colors: {
            primary: '#2563eb',
            secondary: '#64748b',
            accent: '#f59e0b',
            text: '#1f2937'
          }
        }
      },
      {
        id: 'department-report',
        name: 'Department Performance Report',
        description: 'Department-wide performance analysis report',
        type: 'department',
        template: 'department-report-template',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        config: {
          headerHeight: 30,
          footerHeight: 20,
          chartHeight: 200,
          fontFamily: 'helvetica',
          fontSize: 10,
          colors: {
            primary: '#059669',
            secondary: '#64748b',
            accent: '#dc2626',
            text: '#1f2937'
          }
        }
      },
      {
        id: 'kpi-specific-report',
        name: 'KPI Specific Report',
        description: 'Detailed KPI-specific performance analysis',
        type: 'kpi-specific',
        template: 'kpi-specific-template',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        config: {
          headerHeight: 30,
          footerHeight: 20,
          chartHeight: 250,
          fontFamily: 'helvetica',
          fontSize: 10,
          colors: {
            primary: '#7c3aed',
            secondary: '#64748b',
            accent: '#ea580c',
            text: '#1f2937'
          }
        }
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Export HTML element to PDF with enhanced features
   */
  async exportElementToPDF(
    element: HTMLElement,
    options: PDFExportOptions
  ): Promise<void> {
    try {
      const scale = this.getScaleForQuality(options.chartQuality || 'medium');
      
      // Create canvas from HTML element
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure charts are fully rendered
          const charts = clonedDoc.querySelectorAll('.recharts-wrapper');
          charts.forEach(chart => {
            (chart as HTMLElement).style.transform = 'none';
          });
        }
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.format || 'a4'
      });

      const imgWidth = options.format === 'a4' ? 210 : 216;
      const pageHeight = options.format === 'a4' ? 295 : 279;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = options.margin || 20;

      // Add watermark if specified
      if (options.watermark) {
        this.addWatermark(pdf, options.watermark);
      }

      // Add header if specified
      if (options.includeHeader) {
        this.addEnhancedHeader(pdf, options);
        position += 25;
      }

      // Add title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(options.title, options.margin || 20, position);
      position += 10;

      if (options.subtitle) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(options.subtitle, options.margin || 20, position);
        position += 15;
      }

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', 0.95);
      pdf.addImage(imgData, 'PNG', options.margin || 20, position, imgWidth - (options.margin || 20) * 2, heightLeft);

      heightLeft -= pageHeight - position - (options.margin || 20);

      // Add new pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', options.margin || 20, position, imgWidth - (options.margin || 20) * 2, imgHeight);
        heightLeft -= pageHeight - (options.margin || 20);
      }

      // Add footer if specified
      if (options.includeFooter) {
        this.addEnhancedFooter(pdf, options);
      }

      // Save PDF
      const filename = options.filename || `${options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Failed to export PDF');
    }
  }

  /**
   * Export chart to PDF
   */
  async exportChartToPDF(
    chartElementId: string,
    options: ChartExportOptions
  ): Promise<void> {
    try {
      const chartElement = document.getElementById(chartElementId);
      if (!chartElement) {
        throw new Error(`Chart element with id ${chartElementId} not found`);
      }

      const scale = this.getScaleForQuality(options.quality || 'medium');
      
      const canvas = await html2canvas(chartElement, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: options.width || chartElement.scrollWidth,
        height: options.height || chartElement.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure chart is fully rendered
          const chart = clonedDoc.getElementById(chartElementId);
          if (chart) {
            (chart as HTMLElement).style.transform = 'none';
          }
        }
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 200;
      
      let yPosition = 20;
      
      if (options.title) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(options.title, 20, yPosition);
        yPosition += 15;
      }

      const imgData = canvas.toDataURL('image/png', 0.95);
      pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);

      const filename = options.title 
        ? `${options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chart.pdf`
        : `chart_${chartElementId}.pdf`;
      
      pdf.save(filename);

    } catch (error) {
      console.error('Error exporting chart to PDF:', error);
      throw new Error('Failed to export chart to PDF');
    }
  }

  /**
   * Export table to PDF
   */
  async exportTableToPDF(
    tableOptions: TableExportOptions,
    pdfOptions: PDFExportOptions
  ): Promise<void> {
    try {
      const pdf = new jsPDF({
        orientation: pdfOptions.orientation || 'portrait',
        unit: 'mm',
        format: pdfOptions.format || 'a4'
      });

      let yPosition = 20;

      // Add header
      if (pdfOptions.includeHeader) {
        this.addEnhancedHeader(pdf, pdfOptions);
        yPosition += 25;
      }

      // Add title
      if (tableOptions.title) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(tableOptions.title, pdfOptions.margin || 20, yPosition);
        yPosition += 15;
      }

      // Prepare table data
      const tableData = tableOptions.data.map(row => 
        tableOptions.columns.map(col => {
          const value = row[col.key];
          return value !== null && value !== undefined ? String(value) : '';
        })
      );

      const tableHeaders = tableOptions.columns.map(col => col.label);

      // Add table using autoTable
      (pdf as any).autoTable({
        head: tableOptions.showHeader !== false ? [tableHeaders] : [],
        body: tableData,
        startY: yPosition,
        margin: { left: pdfOptions.margin || 20, right: pdfOptions.margin || 20 },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          halign: 'left',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [37, 99, 235], // Blue header
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: tableOptions.striped ? {
          fillColor: [248, 250, 252] // Light gray
        } : undefined,
        columnStyles: tableOptions.columns.reduce((acc, col, index) => {
          if (col.align) {
            acc[index] = { halign: col.align };
          }
          return acc;
        }, {} as any),
        didDrawPage: (data: any) => {
          // Add page numbers
          if (pdfOptions.includePageNumbers) {
            const pageCount = pdf.getNumberOfPages();
            pdf.setFontSize(8);
            pdf.text(
              `Trang ${data.pageNumber} / ${pageCount}`,
              pdf.internal.pageSize.getWidth() / 2 - 10,
              pdf.internal.pageSize.getHeight() - 10
            );
          }
        }
      });

      // Add footer
      if (pdfOptions.includeFooter) {
        this.addEnhancedFooter(pdf, pdfOptions);
      }

      const filename = pdfOptions.filename || 
        `${tableOptions.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'table'}.pdf`;
      
      pdf.save(filename);

    } catch (error) {
      console.error('Error exporting table to PDF:', error);
      throw new Error('Failed to export table to PDF');
    }
  }

  /**
   * Export data to PDF with custom template
   */
  async exportDataToPDF(
    data: any,
    template: PDFTemplate,
    options: PDFExportOptions
  ): Promise<void> {
    try {
      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.format || 'a4'
      });

      // Add watermark if specified
      if (options.watermark) {
        this.addWatermark(pdf, options.watermark);
      }

      // Add header
      if (options.includeHeader) {
        this.addEnhancedHeader(pdf, options);
      }

      // Add title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(options.title, options.margin || 20, 30);

      // Add subtitle
      if (options.subtitle) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(options.subtitle, options.margin || 20, 40);
      }

      // Process template and add content
      await this.processTemplate(pdf, data, template, options);

      // Add footer
      if (options.includeFooter) {
        this.addEnhancedFooter(pdf, options);
      }

      // Save PDF
      const filename = options.filename || `${options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Error exporting data to PDF:', error);
      throw new Error('Failed to export PDF');
    }
  }

  /**
   * Export comprehensive report with charts and tables
   */
  async exportComprehensiveReport(
    reportData: {
      title: string;
      subtitle?: string;
      charts?: Array<{
        elementId: string;
        title: string;
        type: 'bar' | 'line' | 'pie' | 'area';
      }>;
      tables?: Array<{
        data: any[];
        columns: { key: string; label: string; width?: number; align?: 'left' | 'center' | 'right' }[];
        title: string;
      }>;
      summary?: {
        text: string;
        metrics: Array<{ label: string; value: string | number }>;
      };
    },
    options: PDFExportOptions
  ): Promise<void> {
    try {
      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.format || 'a4'
      });

      let yPosition = 20;

      // Add watermark if specified
      if (options.watermark) {
        this.addWatermark(pdf, options.watermark);
      }

      // Add header
      if (options.includeHeader) {
        this.addEnhancedHeader(pdf, options);
        yPosition += 25;
      }

      // Add title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(reportData.title, options.margin || 20, yPosition);
      yPosition += 12;

      // Add subtitle
      if (reportData.subtitle) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(reportData.subtitle, options.margin || 20, yPosition);
        yPosition += 15;
      }

      // Add summary if provided
      if (reportData.summary) {
        yPosition = await this.addSummarySection(pdf, reportData.summary, yPosition, options);
        yPosition += 10;
      }

      // Add charts
      if (reportData.charts && options.includeCharts) {
        for (const chart of reportData.charts) {
          yPosition = await this.addChartToPDF(pdf, chart.elementId, chart.title, yPosition, options);
          yPosition += 10;
        }
      }

      // Add tables
      if (reportData.tables) {
        for (const table of reportData.tables) {
          yPosition = await this.addTableToPDF(pdf, table, yPosition, options);
          yPosition += 10;
        }
      }

      // Add footer
      if (options.includeFooter) {
        this.addEnhancedFooter(pdf, options);
      }

      const filename = options.filename || `${reportData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Error exporting comprehensive report:', error);
      throw new Error('Failed to export comprehensive report');
    }
  }

  /**
   * Export KPI Report to PDF
   */
  async exportKPIReport(
    kpiData: any,
    options: PDFExportOptions
  ): Promise<void> {
    const template: PDFTemplate = {
      id: 'kpi-report',
      name: 'KPI Report Template',
      description: 'Standard KPI report template',
      type: 'individual',
      template: 'kpi-report-template',
      config: {
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.exportDataToPDF(kpiData, template, options);
  }

  /**
   * Export Performance Breakdown to PDF
   */
  async exportPerformanceBreakdown(
    breakdownData: any,
    options: PDFExportOptions
  ): Promise<void> {
    const template: PDFTemplate = {
      id: 'performance-breakdown',
      name: 'Performance Breakdown Template',
      description: 'Performance breakdown analysis template',
      type: 'individual',
      template: 'performance-breakdown-template',
      config: {
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.exportDataToPDF(breakdownData, template, options);
  }

  /**
   * Export Department Report to PDF
   */
  async exportDepartmentReport(
    departmentData: any,
    options: PDFExportOptions
  ): Promise<void> {
    const template: PDFTemplate = {
      id: 'department-report',
      name: 'Department Report Template',
      description: 'Department performance report template',
      type: 'department',
      template: 'department-report-template',
      config: {
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.exportDataToPDF(departmentData, template, options);
  }

  /**
   * Get scale factor based on quality setting
   */
  private getScaleForQuality(quality: 'low' | 'medium' | 'high'): number {
    switch (quality) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      default: return 2;
    }
  }

  /**
   * Add watermark to PDF
   */
  private addWatermark(pdf: jsPDF, watermark: string): void {
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setGState(new (pdf as any).GState({ opacity: 0.1 }));
      pdf.setFontSize(50);
      pdf.setFont('helvetica', 'bold');
      pdf.text(watermark, 105, 150, { angle: 45, align: 'center' });
      pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
    }
  }

  /**
   * Add enhanced header to PDF
   */
  private addEnhancedHeader(pdf: jsPDF, options: PDFExportOptions): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = options.margin || 20;
    
    // Company logo area
    if (options.logo) {
      // Placeholder for logo - in real implementation, you'd load and add the actual logo
      pdf.setFillColor(37, 99, 235);
      pdf.rect(margin, 10, 20, 15, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.text('LOGO', margin + 2, 20);
      pdf.setTextColor(0, 0, 0);
    } else {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KPI Central System', margin, 20);
    }
    
    // Date and time
    const currentDate = new Date().toLocaleDateString('vi-VN');
    const currentTime = new Date().toLocaleTimeString('vi-VN');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${currentDate} - ${currentTime}`, pageWidth - margin - 50, 20);
    
    // Header line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, 25, pageWidth - margin, 25);
  }

  /**
   * Add enhanced footer to PDF
   */
  private addEnhancedFooter(pdf: jsPDF, options: PDFExportOptions): void {
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = options.margin || 20;
    
    // Footer line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    // Footer text
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      'Báo cáo được tạo từ hệ thống KPI Central',
      margin,
      pageHeight - 8
    );
    
    // Page numbers
    if (options.includePageNumbers) {
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(
          `Trang ${i} / ${pageCount}`,
          pageWidth / 2 - 10,
          pageHeight - 8
        );
      }
    }
  }

  /**
   * Add summary section to PDF
   */
  private async addSummarySection(
    pdf: jsPDF,
    summary: { text: string; metrics: Array<{ label: string; value: string | number }> },
    yPosition: number,
    options: PDFExportOptions
  ): Promise<number> {
    const margin = options.margin || 20;
    
    // Summary title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Tóm tắt', margin, yPosition);
    yPosition += 10;
    
    // Summary text
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(summary.text, 170);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * 5 + 5;
    
    // Metrics
    if (summary.metrics.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Chỉ số chính:', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      summary.metrics.forEach(metric => {
        pdf.text(`${metric.label}: ${metric.value}`, margin + 10, yPosition);
        yPosition += 5;
      });
    }
    
    return yPosition;
  }

  /**
   * Add chart to PDF
   */
  private async addChartToPDF(
    pdf: jsPDF,
    chartElementId: string,
    chartTitle: string,
    yPosition: number,
    options: PDFExportOptions
  ): Promise<number> {
    try {
      const chartElement = document.getElementById(chartElementId);
      if (!chartElement) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Chart not found: ${chartElementId}`, options.margin || 20, yPosition);
        return yPosition + 10;
      }

      const scale = this.getScaleForQuality(options.chartQuality || 'medium');
      
      const canvas = await html2canvas(chartElement, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: chartElement.scrollWidth,
        height: chartElement.scrollHeight
      });

      const margin = options.margin || 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const chartWidth = pageWidth - margin * 2;
      const chartHeight = (canvas.height * chartWidth) / canvas.width;
      
      // Check if chart fits on current page
      if (yPosition + chartHeight > pdf.internal.pageSize.getHeight() - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Chart title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(chartTitle, margin, yPosition);
      yPosition += 8;
      
      // Add chart image
      const imgData = canvas.toDataURL('image/png', 0.95);
      pdf.addImage(imgData, 'PNG', margin, yPosition, chartWidth, chartHeight);
      
      return yPosition + chartHeight + 10;
      
    } catch (error) {
      console.error('Error adding chart to PDF:', error);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Error rendering chart: ${chartTitle}`, options.margin || 20, yPosition);
      return yPosition + 10;
    }
  }

  /**
   * Add table to PDF
   */
  private async addTableToPDF(
    pdf: jsPDF,
    table: { data: any[]; columns: { key: string; label: string; width?: number; align?: 'left' | 'center' | 'right' }[]; title: string },
    yPosition: number,
    options: PDFExportOptions
  ): Promise<number> {
    const margin = options.margin || 20;
    
    // Table title
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(table.title, margin, yPosition);
    yPosition += 8;
    
    // Prepare table data
    const tableData = table.data.map(row => 
      table.columns.map(col => {
        const value = row[col.key];
        return value !== null && value !== undefined ? String(value) : '';
      })
    );

    const tableHeaders = table.columns.map(col => col.label);

    // Add table using autoTable
    (pdf as any).autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: yPosition,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: table.columns.reduce((acc, col, index) => {
        if (col.align) {
          acc[index] = { halign: col.align };
        }
        return acc;
      }, {} as any)
    });

    // Get final Y position after table
    const finalY = (pdf as any).lastAutoTable.finalY || yPosition + 50;
    return finalY + 10;
  }

  /**
   * Process template and add content to PDF
   */
  private async processTemplate(
    pdf: jsPDF,
    data: any,
    template: PDFTemplate,
    options: PDFExportOptions
  ): Promise<void> {
    let yPosition = 50;

    switch (template.template) {
      case 'individual-report-template':
        yPosition = await this.addIndividualReportContent(pdf, data, yPosition, options);
        break;
      case 'department-report-template':
        yPosition = await this.addDepartmentReportContent(pdf, data, yPosition, options);
        break;
      case 'kpi-specific-template':
        yPosition = await this.addKPISpecificContent(pdf, data, yPosition, options);
        break;
      case 'performance-breakdown-template':
        yPosition = await this.addPerformanceBreakdownContent(pdf, data, yPosition, options);
        break;
      default:
        yPosition = await this.addGenericContent(pdf, data, yPosition, options);
    }
  }

  /**
   * Template management methods
   */
  getTemplate(templateId: string): PDFTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): PDFTemplate[] {
    return Array.from(this.templates.values());
  }

  addTemplate(template: PDFTemplate): void {
    this.templates.set(template.id, template);
  }

  updateTemplate(templateId: string, updates: Partial<PDFTemplate>): boolean {
    const template = this.templates.get(templateId);
    if (template) {
      const updatedTemplate = { ...template, ...updates, updatedAt: new Date().toISOString() };
      this.templates.set(templateId, updatedTemplate);
      return true;
    }
    return false;
  }

  deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  /**
   * Add Individual Report content
   */
  private async addIndividualReportContent(
    pdf: jsPDF,
    data: any,
    yPosition: number,
    options: PDFExportOptions
  ): Promise<number> {
    const margin = options.margin || 20;

    // Employee info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Thông tin nhân viên:', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Tên: ${data.employee?.name || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Phòng ban: ${data.employee?.department || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Chức vụ: ${data.employee?.position || 'N/A'}`, margin, yPosition);
    yPosition += 15;

    // Performance Summary
    if (data.summary) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Tóm tắt hiệu suất:', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Tỷ lệ đạt trung bình: ${data.summary.averageCompletion || 0}%`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Số KPI đạt mục tiêu: ${data.summary.achievedKPIs || 0}/${data.summary.totalKPIs || 0}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Xu hướng: ${data.summary.trend || 'N/A'}`, margin, yPosition);
      yPosition += 15;
    }

    // KPI Table
    const tableData = data.kpis || [];
    if (tableData.length > 0) {
      const tableOptions = {
        data: tableData,
        columns: [
          { key: 'name', label: 'KPI', align: 'left' as const },
          { key: 'target', label: 'Mục tiêu', align: 'right' as const },
          { key: 'actual', label: 'Thực tế', align: 'right' as const },
          { key: 'completion', label: 'Tỷ lệ đạt (%)', align: 'right' as const }
        ],
        title: 'Chi tiết KPI'
      };

      yPosition = await this.addTableToPDF(pdf, tableOptions, yPosition, options);
    }

    return yPosition + 20;
  }

  /**
   * Add KPI Specific content
   */
  private async addKPISpecificContent(
    pdf: jsPDF,
    data: any,
    yPosition: number,
    options: PDFExportOptions
  ): Promise<number> {
    const margin = options.margin || 20;

    // KPI Info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Thông tin KPI:', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Tên KPI: ${data.kpi?.name || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Mô tả: ${data.kpi?.description || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Đơn vị: ${data.kpi?.unit || 'N/A'}`, margin, yPosition);
    yPosition += 15;

    // Performance Analysis
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Phân tích hiệu suất:', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Mục tiêu: ${data.target || 0}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Thực tế: ${data.actual || 0}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Tỷ lệ đạt: ${data.completion || 0}%`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Xu hướng: ${data.trend || 'N/A'}`, margin, yPosition);
    yPosition += 15;

    // Employee Performance Table
    if (data.employeePerformance && data.employeePerformance.length > 0) {
      const tableOptions = {
        data: data.employeePerformance,
        columns: [
          { key: 'employeeName', label: 'Nhân viên', align: 'left' as const },
          { key: 'actual', label: 'Thực tế', align: 'right' as const },
          { key: 'completion', label: 'Tỷ lệ đạt (%)', align: 'right' as const },
          { key: 'rank', label: 'Xếp hạng', align: 'center' as const }
        ],
        title: 'Hiệu suất theo nhân viên'
      };

      yPosition = await this.addTableToPDF(pdf, tableOptions, yPosition, options);
    }

    return yPosition + 20;
  }

  /**
   * Add Performance Breakdown content
   */
  private async addPerformanceBreakdownContent(
    pdf: jsPDF,
    data: any,
    yPosition: number,
    options: PDFExportOptions
  ): Promise<number> {
    const margin = options.margin || 20;

    // Performance Summary
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Phân tích hiệu suất:', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Thời gian: ${data.period || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Xu hướng: ${data.trend || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Tỷ lệ đạt: ${data.achievementRate?.toFixed(1) || '0'}%`, margin, yPosition);
    yPosition += 15;

    // Insights
    if (data.insights && data.insights.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Nhận xét:', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      data.insights.forEach((insight: string) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(`• ${insight}`, margin, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }

    // Recommendations
    if (data.recommendations && data.recommendations.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Khuyến nghị:', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      data.recommendations.forEach((recommendation: string) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(`• ${recommendation}`, margin, yPosition);
        yPosition += 6;
      });
    }

    return yPosition + 20;
  }

  /**
   * Add Department Report content
   */
  private async addDepartmentReportContent(
    pdf: jsPDF,
    data: any,
    yPosition: number,
    options: PDFExportOptions
  ): Promise<number> {
    const margin = options.margin || 20;

    // Department info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Thông tin phòng ban:', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Tên phòng ban: ${data.department?.name || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Số nhân viên: ${data.employeeCount || 0}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Thời gian báo cáo: ${data.period || 'N/A'}`, margin, yPosition);
    yPosition += 15;

    // Department performance summary
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Tổng quan hiệu suất:', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Tỷ lệ đạt trung bình: ${data.averageAchievement?.toFixed(1) || '0'}%`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Số KPI đạt mục tiêu: ${data.achievedKPIs || 0}/${data.totalKPIs || 0}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Xu hướng: ${data.trend || 'N/A'}`, margin, yPosition);
    yPosition += 15;

    // Employee Performance Table
    if (data.employeePerformance && data.employeePerformance.length > 0) {
      const tableOptions = {
        data: data.employeePerformance,
        columns: [
          { key: 'name', label: 'Nhân viên', align: 'left' as const },
          { key: 'avgCompletion', label: 'Tỷ lệ đạt TB (%)', align: 'right' as const },
          { key: 'kpiCount', label: 'Số KPI', align: 'center' as const },
          { key: 'rank', label: 'Xếp hạng', align: 'center' as const }
        ],
        title: 'Hiệu suất theo nhân viên'
      };

      yPosition = await this.addTableToPDF(pdf, tableOptions, yPosition, options);
    }

    return yPosition + 20;
  }

  /**
   * Add generic content
   */
  private async addGenericContent(
    pdf: jsPDF,
    data: any,
    yPosition: number,
    options: PDFExportOptions
  ): Promise<number> {
    const margin = options.margin || 20;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Try to format data nicely
    if (typeof data === 'object' && data !== null) {
      const lines = pdf.splitTextToSize(JSON.stringify(data, null, 2), 170);
      pdf.text(lines, margin, yPosition);
      return yPosition + lines.length * 5 + 20;
    } else {
      pdf.text(String(data), margin, yPosition);
      return yPosition + 20;
    }
  }
}

// Export singleton instance
export const pdfExportService = PDFExportService.getInstance();

// Export hook for React components
export function usePDFExport() {
  const service = pdfExportService;

  const exportToPDF = async (
    elementId: string,
    filename: string,
    title?: string,
    options?: Partial<PDFExportOptions>
  ) => {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id ${elementId} not found`);
    }

    const exportOptions: PDFExportOptions = {
      title: title || filename,
      filename,
      includeHeader: true,
      includeFooter: true,
      includePageNumbers: true,
      includeCharts: true,
      chartQuality: 'medium',
      ...options
    };

    await service.exportElementToPDF(element, exportOptions);
  };

  const exportChartToPDF = async (
    chartElementId: string,
    filename: string,
    title?: string,
    options?: Partial<ChartExportOptions>
  ) => {
    const chartOptions: ChartExportOptions = {
      chartElementId,
      chartType: options?.chartType || 'bar',
      title: title || filename,
      quality: 'medium',
      ...options
    };

    await service.exportChartToPDF(chartElementId, chartOptions);
  };

  const exportTableToPDF = async (
    data: any[],
    columns: { key: string; label: string; width?: number; align?: 'left' | 'center' | 'right' }[],
    filename: string,
    title?: string,
    options?: Partial<PDFExportOptions>
  ) => {
    const tableOptions: TableExportOptions = {
      data,
      columns,
      title: title || filename,
      showHeader: true,
      striped: true
    };

    const pdfOptions: PDFExportOptions = {
      title: title || filename,
      filename,
      includeHeader: true,
      includeFooter: true,
      includePageNumbers: true,
      ...options
    };

    await service.exportTableToPDF(tableOptions, pdfOptions);
  };

  const exportComprehensiveReport = async (
    reportData: {
      title: string;
      subtitle?: string;
      charts?: Array<{
        elementId: string;
        title: string;
        type: 'bar' | 'line' | 'pie' | 'area';
      }>;
      tables?: Array<{
        data: any[];
        columns: { key: string; label: string; width?: number; align?: 'left' | 'center' | 'right' }[];
        title: string;
      }>;
      summary?: {
        text: string;
        metrics: Array<{ label: string; value: string | number }>;
      };
    },
    filename: string,
    options?: Partial<PDFExportOptions>
  ) => {
    const exportOptions: PDFExportOptions = {
      title: reportData.title,
      filename,
      includeHeader: true,
      includeFooter: true,
      includePageNumbers: true,
      includeCharts: true,
      chartQuality: 'medium',
      ...options
    };

    await service.exportComprehensiveReport(reportData, exportOptions);
  };

  return {
    exportToPDF,
    exportChartToPDF,
    exportTableToPDF,
    exportComprehensiveReport,
    getTemplate: service.getTemplate.bind(service),
    getAllTemplates: service.getAllTemplates.bind(service),
    addTemplate: service.addTemplate.bind(service),
    updateTemplate: service.updateTemplate.bind(service),
    deleteTemplate: service.deleteTemplate.bind(service)
  };
}