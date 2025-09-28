'use client';
import { useState, useContext } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle, Target, Search, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import type { Kpi } from '@/types';
import KpiForm from '@/components/unified-kpi-form';

export default function KpiDefinitionsComponent() {
  const { kpis, departments, addKpi, updateKpi, deleteKpi } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isKpiDetailsDialogOpen, setIsKpiDetailsDialogOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<Kpi | null>(null);

  // Filter KPIs based on search and ensure uniqueness
  const filteredKpis = kpis.filter(kpi => {
    const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kpi.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kpi.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).reduce((acc, kpi) => {
    // Additional safety check to prevent duplicates
    if (!acc.find(existingKpi => existingKpi.id === kpi.id)) {
      acc.push(kpi);
    }
    return acc;
  }, [] as Kpi[]);

  const handleCreateKpi = () => {
    setIsCreateDialogOpen(true);
  };

  const handleKpiRowClick = (kpi: Kpi) => {
    setSelectedKpi(kpi);
    setIsKpiDetailsDialogOpen(true);
  };

  const handleEditKpi = (kpi: Kpi) => {
    setSelectedKpi(kpi);
    setIsEditDialogOpen(true);
    setIsKpiDetailsDialogOpen(false);
  };

  const handleDeleteKpi = async (kpi: Kpi) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa KPI "${kpi.name}"?`)) {
      try {
        await deleteKpi(kpi.id);
        toast({
          title: "Thành công!",
          description: `Đã xóa KPI "${kpi.name}".`
        });
      } catch (error) {
        console.error('Error deleting KPI:', error);
        toast({
          variant: 'destructive',
          title: "Lỗi!",
          description: 'Không thể xóa KPI.'
        });
      }
    }
  };

  const handleKpiSave = (kpi: Kpi) => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsKpiDetailsDialogOpen(false);
    setSelectedKpi(null);
  };

  const handleKpiClose = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsKpiDetailsDialogOpen(false);
    setSelectedKpi(null);
  };

  const getDepartmentName = (department: string) => {
    // KPI has department as string (name), not departmentId
    return department || 'Unknown Department';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.kpis.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t.kpis.subtitle}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              {t.kpis.addKpi}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.kpis.addKpiTitle}</DialogTitle>
              <DialogDescription>
                {t.kpis.addKpiDescription}
              </DialogDescription>
            </DialogHeader>
            <KpiForm
              mode="add"
              onSave={handleKpiSave}
              onClose={handleKpiClose}
            />
          </DialogContent>
        </Dialog>

        {/* KPI Details Dialog */}
        <Dialog open={isKpiDetailsDialogOpen} onOpenChange={setIsKpiDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết KPI</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết và các thao tác cho KPI.
              </DialogDescription>
            </DialogHeader>
            {selectedKpi && (
              <div className="space-y-6">
                {/* KPI Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tên KPI</label>
                    <p className="text-lg font-semibold">{selectedKpi.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phòng ban</label>
                    <p className="text-lg">{getDepartmentName(selectedKpi.department)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Danh mục</label>
                    <p className="text-lg">{selectedKpi.category || 'Chưa phân loại'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Loại</label>
                    <p className="text-lg">{selectedKpi.type || 'Chưa xác định'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tần suất</label>
                    <p className="text-lg">{selectedKpi.frequency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Đơn vị</label>
                    <p className="text-lg">{selectedKpi.unit}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mục tiêu</label>
                    <p className="text-lg">{selectedKpi.target || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Trọng số</label>
                    <p className="text-lg">{selectedKpi.weight}%</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Mô tả</label>
                  <p className="text-lg mt-1">{selectedKpi.description}</p>
                </div>

                {selectedKpi.formula && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Công thức</label>
                    <p className="text-lg font-mono bg-gray-100 p-2 rounded mt-1">{selectedKpi.formula}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsKpiDetailsDialogOpen(false)}
                  >
                    Đóng
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsKpiDetailsDialogOpen(false);
                      handleDeleteKpi(selectedKpi);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa KPI
                  </Button>
                  <Button
                    onClick={() => handleEditKpi(selectedKpi)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit KPI Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa KPI</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin KPI đã chọn.
              </DialogDescription>
            </DialogHeader>
            {selectedKpi && (
              <KpiForm
                mode="edit"
                kpi={selectedKpi}
                onSave={handleKpiSave}
                onClose={handleKpiClose}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.kpis.totalKpis}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.length}</div>
            <p className="text-xs text-muted-foreground">
              {t.kpis.activeKpiDefinitions}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.kpis.categories}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(kpis.map(kpi => kpi.category).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              {t.kpis.uniqueKpiCategories}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.kpis.departments}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              {t.kpis.departmentCoverage}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>{t.kpis.title}</CardTitle>
          <CardDescription>
            {t.kpis.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.common.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* KPI Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.kpis.kpiName}</TableHead>
                  <TableHead>{t.kpis.kpiDescription}</TableHead>
                  <TableHead>{t.kpis.kpiCategory}</TableHead>
                  <TableHead>{t.kpis.kpiDepartment}</TableHead>
                  <TableHead>{t.kpis.weight}</TableHead>
                  <TableHead>{t.kpis.target}</TableHead>
                  <TableHead>{t.kpis.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKpis.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? t.kpis.noKpisFound : t.kpis.noKpisDescription}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKpis.map((kpi) => (
                    <TableRow
                      key={kpi.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleKpiRowClick(kpi)}
                    >
                      <TableCell className="font-medium">{kpi.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {kpi.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {kpi.category || t.kpis.noCategory}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getDepartmentName(kpi.department)}
                      </TableCell>
                      <TableCell>{kpi.weight}%</TableCell>
                      <TableCell>
                        {kpi.target || 0}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          {t.kpis.active}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
