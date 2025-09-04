import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IndividualReport from './individual-report';
import DepartmentReport from './department-report';

export default function ReportsTabs() {
  return (
    <Tabs defaultValue="individual" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
        <TabsTrigger value="individual">Báo cáo cá nhân</TabsTrigger>
        <TabsTrigger value="department">Báo cáo phòng ban</TabsTrigger>
      </TabsList>
      <TabsContent value="individual">
        <IndividualReport />
      </TabsContent>
      <TabsContent value="department">
        <DepartmentReport />
      </TabsContent>
    </Tabs>
  );
}
