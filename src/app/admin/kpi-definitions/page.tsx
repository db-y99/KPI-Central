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

export default function KpiDefinitionsPage() {
  const [kpis, setKpis] = useState<Kpi[]>(initialKpis);

  // In a real app, these would be API calls
  const handleAddKpi = () => {
    // Open a dialog/form to add a new KPI
    console.log('Open Add KPI modal');
  };

  const handleEditKpi = (kpiId: string) => {
    // Open a dialog/form to edit the KPI
    console.log(`Open Edit KPI modal for ${kpiId}`);
  };

  const handleDeleteKpi = (kpiId: string) => {
    // Show a confirmation and then delete
    if (window.confirm('Bạn có chắc chắn muốn xóa KPI này không?')) {
      setKpis(kpis.filter(k => k.id !== kpiId));
    }
  };

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
            <Button onClick={handleAddKpi}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm KPI mới
            </Button>
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
                  <TableCell>{kpi.frequency}</TableCell>
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
                          className="text-red-500"
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
