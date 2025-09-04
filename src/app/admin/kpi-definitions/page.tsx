'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Pen, Trash2 } from 'lucide-react';
import { kpis as initialKpis } from '@/lib/data';
import type { Kpi } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AddKpiForm from '@/components/add-kpi-form';
import { useToast } from '@/hooks/use-toast';


export default function KpiDefinitionsPage() {
  const [kpis, setKpis] = useState<Kpi[]>(initialKpis);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();


  const handleSaveKpi = (newKpi: Kpi) => {
    setKpis(prevKpis => [...prevKpis, newKpi]);
    toast({
      title: 'Thành công!',
      description: `Đã thêm KPI "${newKpi.name}" thành công.`,
    });
  };

  const handleEditKpi = (kpiId: string) => {
    // This will be implemented later
    console.log(`Open Edit KPI modal for ${kpiId}`);
    toast({
        title: 'Tính năng đang phát triển',
        description: 'Chức năng sửa KPI sẽ được cập nhật sớm.',
    });
  };

  const handleDeleteKpi = (kpiId: string) => {
    // Show a confirmation and then delete
    if (window.confirm('Bạn có chắc chắn muốn xóa KPI này không?')) {
      const kpiToDelete = kpis.find(k => k.id === kpiId);
      setKpis(kpis.filter(k => k.id !== kpiId));
      toast({
        title: 'Đã xóa!',
        description: `Đã xóa KPI "${kpiToDelete?.name}".`,
        variant: 'destructive'
      });
    }
  };

  const frequencyMap = {
      daily: "Hằng ngày",
      weekly: "Hằng tuần",
      monthly: "Hằng tháng",
      quarterly: "Hằng quý",
      annually: "Hằng năm"
  }

  return (
    <div className="p-6 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quản lý định nghĩa KPI</CardTitle>
              <CardDescription>
                Tạo và quản lý các KPI mẫu cho tổ chức của bạn.
              </CardDescription>
            </div>
             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Thêm KPI mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Thêm KPI mới</DialogTitle>
                </DialogHeader>
                <AddKpiForm onSave={handleSaveKpi} onClose={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên KPI</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead>Tần suất</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpis.map(kpi => (
                <TableRow key={kpi.id}>
                  <TableCell className="font-medium">{kpi.name}</TableCell>
                  <TableCell>{kpi.department}</TableCell>
                  <TableCell>{kpi.unit}</TableCell>
                  <TableCell>{frequencyMap[kpi.frequency]}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditKpi(kpi.id)}>
                          <Pen className="mr-2 h-4 w-4" />
                          Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 hover:text-red-500 focus:text-red-500"
                          onClick={() => handleDeleteKpi(kpi.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

