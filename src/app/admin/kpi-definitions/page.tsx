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
import { PlusCircle, MoreHorizontal, Pen, Trash2, Shield, Target, BarChart3, Loader2 } from 'lucide-react';
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
import EditKpiForm from '@/components/edit-kpi-form';
import { KpiPermissionsModal } from '@/components/kpi-permissions-modal';
import { useToast } from '@/hooks/use-toast';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


export default function KpiDefinitionsPage() {
  const { kpis, addKpi, updateKpi, deleteKpi, departments } = useContext(DataContext);
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<Kpi | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const { toast } = useToast();

  // Debug logging
  console.log('KpiDefinitionsPage render - isEditDialogOpen:', isEditDialogOpen, 'editingKpi:', editingKpi);
  console.log('KpiDefinitionsPage render - isPermissionsDialogOpen:', isPermissionsDialogOpen);
  console.log('KpiDefinitionsPage render - kpis:', kpis);
  console.log('KpiDefinitionsPage render - filteredKpis:', filteredKpis);

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
    console.log('Edit KPI clicked for ID:', kpiId);
    const kpi = kpis.find(k => k.id === kpiId);
    console.log('Found KPI:', kpi);
    if (kpi) {
      setEditingKpi(kpi);
      setIsEditDialogOpen(true);
      console.log('Edit dialog should be open now');
    }
  };

  const handleSaveEditKpi = () => {
    // Toast is handled inside the form
    setIsEditDialogOpen(false);
    setEditingKpi(null);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingKpi(null);
  };

  const handleDeleteKpi = (kpiId: string) => {
    // Show a confirmation and then delete
    if (window.confirm(t.kpis.confirmDelete || 'Are you sure you want to delete this KPI?')) {
      const kpiToDelete = kpis.find(k => k.id === kpiId);
      deleteKpi(kpiId);
      toast({
        title: t.common.success,
        description: `KPI "${kpiToDelete?.name}" ${t.common.delete.toLowerCase()}.`,
        variant: 'destructive'
      });
    }
  };

  const handlePermissionsKpi = (kpiId: string) => {
    console.log('Permissions KPI clicked for ID:', kpiId);
    const kpi = kpis.find(k => k.id === kpiId);
    console.log('Found KPI for permissions:', kpi);
    if (kpi) {
      setEditingKpi(kpi);
      setIsPermissionsDialogOpen(true);
      console.log('Permissions dialog should be open now');
    }
  };

  const handleClosePermissionsDialog = () => {
    setIsPermissionsDialogOpen(false);
    setEditingKpi(null);
  };

  const handleSavePermissions = () => {
    // Close the modal after saving permissions
    setIsPermissionsDialogOpen(false);
    setEditingKpi(null);
  };

  const frequencyMap = {
      daily: t.kpis.daily,
      weekly: t.kpis.weekly,
      monthly: t.kpis.monthly,
      quarterly: t.kpis.quarterly,
      annually: t.kpis.annually
  }

  return (
    <div className="p-6 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{t.kpis.title}</CardTitle>
              <CardDescription>
                {t.kpis.subtitle}
              </CardDescription>
            </div>
             <div className="flex space-x-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-gradient">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t.kpis.addKpi}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t.kpis.addKpiTitle}</DialogTitle>
                  </DialogHeader>
                  <AddKpiForm onSave={handleSaveKpi} onClose={() => setIsAddDialogOpen(false)} />
                </DialogContent>
              </Dialog>

              <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                if (!open) {
                  setIsEditDialogOpen(false);
                  setEditingKpi(null);
                }
              }}>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Sửa KPI</DialogTitle>
                  </DialogHeader>
                  {editingKpi ? (
                    <EditKpiForm 
                      kpi={editingKpi} 
                      onSave={handleSaveEditKpi} 
                      onClose={handleCloseEditDialog} 
                    />
                  ) : (
                    <div className="p-4 text-center">
                      <p>Đang tải...</p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 w-full md:w-1/3">
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

          {/* Test Button */}
          <div className="mb-4">
            <Button 
              onClick={() => {
                alert('Test button clicked!');
                console.log('Test button clicked!');
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              TEST BUTTON - Click me!
            </Button>
          </div>

          {filteredKpis.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có KPI nào</h3>
              <p className="text-muted-foreground mb-4">
                Hãy tạo KPI đầu tiên để bắt đầu quản lý hiệu suất
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="btn-gradient">
                <PlusCircle className="w-4 h-4 mr-2" />
                Tạo KPI đầu tiên
              </Button>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">
                Có {filteredKpis.length} KPI được tìm thấy
              </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredKpis.map(kpi => (
                <Card key={kpi.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base line-clamp-2">{kpi.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {kpi.department}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            alert('Dropdown edit clicked for KPI: ' + kpi.id);
                            console.log('Dropdown edit clicked for KPI:', kpi.id);
                            handleEditKpi(kpi.id);
                          }}>
                            <Pen className="mr-2 h-4 w-4" />
                            Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            alert('Dropdown permissions clicked for KPI: ' + kpi.id);
                            console.log('Dropdown permissions clicked for KPI:', kpi.id);
                            handlePermissionsKpi(kpi.id);
                          }}>
                            <Shield className="mr-2 h-4 w-4" />
                            Phân quyền
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
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {kpi.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Chỉ tiêu:</span>
                          <p className="font-medium">{kpi.target || 0} {kpi.unit}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tần suất:</span>
                          <p className="font-medium">{frequencyMap[kpi.frequency]}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Trọng số:</span>
                          <p className="font-medium">{kpi.weight || 1}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Loại:</span>
                          <p className="font-medium">{kpi.type || 'Chưa xác định'}</p>
                        </div>
                      </div>

                      {kpi.formula && (
                        <div className="pt-2 border-t">
                          <span className="text-xs text-muted-foreground">Công thức:</span>
                          <p className="text-xs font-mono bg-muted p-2 rounded mt-1">
                            {kpi.formula}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            alert('Edit button clicked for KPI: ' + kpi.id);
                            console.log('Card edit button clicked for KPI:', kpi.id);
                            handleEditKpi(kpi.id);
                          }}
                          className="flex-1"
                        >
                          <Pen className="w-3 h-3 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            alert('Permissions button clicked for KPI: ' + kpi.id);
                            console.log('Card permissions button clicked for KPI:', kpi.id);
                            handlePermissionsKpi(kpi.id);
                          }}
                          className="flex-1"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Phân quyền
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Modal */}
      <KpiPermissionsModal
        kpi={editingKpi}
        isOpen={isPermissionsDialogOpen}
        onClose={handleClosePermissionsDialog}
        onSave={handleSavePermissions}
      />
    </div>
  );
}
