'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Calculator } from 'lucide-react';
import RewardProgramsTab from './reward-programs-tab';
import RewardCalculationsTab from './reward-calculations-tab';

export default function RewardsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Thưởng</h1>
        <p className="text-muted-foreground">
          Quản lý chương trình thưởng và tính toán thưởng
        </p>
      </div>

      <Tabs defaultValue="programs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Chương trình thưởng
          </TabsTrigger>
          <TabsTrigger value="calculations" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Tính toán thưởng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <RewardProgramsTab />
        </TabsContent>

        <TabsContent value="calculations">
          <RewardCalculationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
