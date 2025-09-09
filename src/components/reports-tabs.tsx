'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IndividualReport from './individual-report';
import DepartmentReport from './department-report';
import KpiSpecificReport from './kpi-specific-report'; // Import component mới
import { DateRangePicker } from './date-range-picker';
import { type DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import PDFExportButton from './pdf-export-button';
import { FileText } from 'lucide-react';

export default function ReportsTabs() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [comparisonDate, setComparisonDate] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState('individual');

  const getReportTitle = () => {
    const dateStr = date?.from ? date.from.toLocaleDateString('vi-VN') : 'N/A';
    switch (activeTab) {
      case 'individual':
        return `Báo cáo cá nhân - ${dateStr}`;
      case 'department':
        return `Báo cáo phòng ban - ${dateStr}`;
      case 'kpi-specific':
        return `Báo cáo theo KPI - ${dateStr}`;
      default:
        return `Báo cáo KPI - ${dateStr}`;
    }
  };

  const getReportFilename = () => {
    const dateStr = date?.from ? date.from.toISOString().split('T')[0] : 'unknown';
    switch (activeTab) {
      case 'individual':
        return `bao-cao-ca-nhan-${dateStr}.pdf`;
      case 'department':
        return `bao-cao-phong-ban-${dateStr}.pdf`;
      case 'kpi-specific':
        return `bao-cao-kpi-${dateStr}.pdf`;
      default:
        return `bao-cao-kpi-${dateStr}.pdf`;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl p-4 bg-card/50 border">
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="individual">Báo cáo cá nhân</TabsTrigger>
          <TabsTrigger value="department">Báo cáo phòng ban</TabsTrigger>
          <TabsTrigger value="kpi-specific">Báo cáo theo KPI</TabsTrigger>
        </TabsList>
        
        <div className="flex gap-2">
          <PDFExportButton
            elementId={`report-content-${activeTab}`}
            filename={getReportFilename()}
            title={getReportTitle()}
            variant="outline"
            size="sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Xuất PDF
          </PDFExportButton>
        </div>
      </div>

      <div className="flex flex-col gap-6 rounded-2xl border p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="space-y-2 rounded-xl p-3 bg-muted/30">
            <Label>Kỳ báo cáo chính</Label>
            <DateRangePicker date={date} setDate={setDate} />
        </div>
        <Separator />
        <div className="space-y-2 rounded-xl p-3 bg-muted/30">
            <Label>Kỳ so sánh (tùy chọn)</Label>
            <DateRangePicker date={comparisonDate} setDate={setComparisonDate} />
        </div>
      </div>


      <TabsContent value="individual">
        <div id="report-content-individual">
          <IndividualReport dateRange={date} comparisonDateRange={comparisonDate} />
        </div>
      </TabsContent>
      <TabsContent value="department">
        <div id="report-content-department">
          <DepartmentReport dateRange={date} comparisonDateRange={comparisonDate} />
        </div>
      </TabsContent>
       <TabsContent value="kpi-specific">
        <div id="report-content-kpi-specific">
          <KpiSpecificReport dateRange={date} comparisonDateRange={comparisonDate} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
