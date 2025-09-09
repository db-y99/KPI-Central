'use client';
import { useState, useContext, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DataContext } from '@/context/data-context';
import AddKpiForm from '@/components/add-kpi-form';
import EditKpiForm from '@/components/edit-kpi-form';
import type { Kpi } from '@/types';

export default function KpiDefinitionsTab() {
  const { kpis, addKpi, deleteKpi, departments } = useContext(DataContext);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<Kpi | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const { toast } = useToast();

  const filteredKpis = useMemo(() => {
    if (selectedDepartment === 'all') {
      return kpis;
    }
    return kpis.filter(kpi => kpi.department === selectedDepartment);
  }, [kpis, selectedDepartment]);

  const handleSaveKpi = (newKpi: Kpi) => {
    addKpi(newKpi);
    toast({
      title: 'Thành công!',
      description: `Đã thêm KPI "${newKpi.name}" thành công.`,
    });
  };

  const handleEditKpi = (kpiId: string) => {
    const kpi = kpis.find(k => k.id === kpiId);
    if (kpi) {
      setEditingKpi(kpi);
      setIsEditDialogOpen(true);
    }
  };

  const handleDeleteKpi = (kpiId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa KPI này?')) {
      const kpiToDelete = kpis.find(k => k.id === kpiId);
      deleteKpi(kpiId);
      toast({
        title: 'Thành công!',
        description: `Đã xóa KPI "${kpiToDelete?.name}".`,
        variant: 'destructive'
      });
    }
  };

  const frequencyMap = {
    daily: 'Hàng ngày',
    weekly: 'Hàng tuần',
    monthly: 'Hàng tháng',
    quarterly: 'Hàng quý',
    annually: 'Hàng năm'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Định nghĩa KPI</CardTitle>
            <CardDescription>
              Tạo và quản lý các chỉ số đánh giá hiệu suất công việc
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Thêm KPI
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Thêm KPI mới</DialogTitle>
                </DialogHeader>
                <AddKpiForm 
                  onSave={handleSaveKpi} 
                  onClose={() => setIsAddDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Sửa KPI</DialogTitle>
                </DialogHeader>
                {editingKpi && (
                  <EditKpiForm 
                    kpi={editingKpi} 
                    onSave={() => {
                      setIsEditDialogOpen(false);
                      setEditingKpi(null);
                    }} 
                    onClose={() => {
                      setIsEditDialogOpen(false);
                      setEditingKpi(null);
                    }} 
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 w-full md:w-1/3">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo phòng ban..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng ban</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            {filteredKpis.map(kpi => (
              <TableRow key={kpi.id}>
                <TableCell className="font-medium">{kpi.name}</TableCell>
                <TableCell>{kpi.department}</TableCell>
                <TableCell>{kpi.unit}</TableCell>
                <TableCell>{frequencyMap[kpi.frequency as keyof typeof frequencyMap]}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
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
  );
}
