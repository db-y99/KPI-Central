'use client';
import { useContext, useState, useMemo } from 'react';
import { 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Gift,
  AlertTriangle,
  Target,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import { usePDFExport } from '@/lib/pdf-export';

interface RewardProgram {
  id: string;
  name: string;
  description: string;
  position: string;
  year: number;
  frequency: 'monthly' | 'quarterly' | 'annual';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  quarterlyRewards: any[];
  monthlyRewards: any[];
  annualRewards: any[];
  penalties: any[];
}

export default function RewardProgramsPage() {
  const { rewardPrograms, positions, departments } = useContext(DataContext);
  const { exportToPDF } = usePDFExport();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<RewardProgram | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'quarterly' as 'quarterly' | 'monthly' | 'annual',
    isActive: true,
    position: '',
    year: ''
  });

  // Filter programs based on selections
  const filteredPrograms = useMemo(() => {
    if (!rewardPrograms || !Array.isArray(rewardPrograms)) return [];
    return rewardPrograms.filter(program => {
      const typeMatch = selectedType === 'all' || program.frequency === selectedType;
      const statusMatch = selectedStatus === 'all' || 
        (selectedStatus === 'active' && program.isActive) ||
        (selectedStatus === 'inactive' && !program.isActive);
      return typeMatch && statusMatch;
    });
  }, [rewardPrograms, selectedType, selectedStatus]);

  const handleAddProgram = () => {
    setEditingProgram(null);
    setFormData({
      name: '',
      description: '',
      type: 'quarterly',
      isActive: true,
      position: '',
      year: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditProgram = (program: RewardProgram) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      description: program.description,
      type: program.frequency,
      isActive: program.isActive,
      position: program.position,
      year: program.year.toString()
    });
    setIsDialogOpen(true);
  };

  const handleSaveProgram = () => {
    // Here you would typically save to your data store
    console.log('Saving program:', formData);
    setIsDialogOpen(false);
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(
        'reward-programs-report',
        'bao-cao-chuong-trinh-thuong.pdf',
        'Báo cáo chương trình thưởng',
        {
          includeHeader: true,
          includeFooter: true,
          includePageNumbers: true,
          orientation: 'portrait'
        }
      );
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const getTypeBadge = (frequency: string) => {
    switch (frequency) {
      case 'quarterly':
        return <Badge className="bg-blue-100 text-blue-800">Quý</Badge>;
      case 'monthly':
        return <Badge className="bg-green-100 text-green-800">Tháng</Badge>;
      case 'annual':
        return <Badge className="bg-purple-100 text-purple-800">Năm</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Tùy chỉnh</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge className="bg-green-100 text-green-800">Hoat dong</Badge> :
      <Badge className="bg-red-100 text-red-800">Tam dung</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chuong trinh thuong/phat</h1>
          <p className="text-muted-foreground">Quản lý các chương trình thưởng và phạt cho nhân viên</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Xuất PDF
          </Button>
          <Button onClick={handleAddProgram} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Thêm chương trình
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{rewardPrograms?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Tổng số chương trình</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {rewardPrograms?.filter(p => p.isActive).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {rewardPrograms?.filter(p => p.frequency === 'quarterly').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Chương trình quý</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">
              {rewardPrograms?.filter(p => p.frequency === 'annual').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Chương trình năm</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Loại:</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="quarterly">Quý</SelectItem>
                    <SelectItem value="monthly">Tháng</SelectItem>
                    <SelectItem value="annual">Năm</SelectItem>
                  </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Trạng thái:</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Tạm dừng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programs List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách chương trình</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="reward-programs-report" className="space-y-4">
            {!filteredPrograms || filteredPrograms.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Không có chương trình nào</p>
              </div>
            ) : (
              filteredPrograms.map((program) => (
                <div key={program.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Gift className="w-5 h-5 text-primary" />
                        </div>
                      <div>
                        <h4 className="font-semibold">{program.name || 'Chưa có tên'}</h4>
                        <p className="text-sm text-muted-foreground">{program.description || 'Chưa có mô tả'}</p>
                      </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeBadge(program.frequency || 'quarterly')}
                        {getStatusBadge(program.isActive || false)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProgram(program)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Thông tin chương trình</Label>
                      <p className="font-medium">
                        Vị trí: {program.position || 'Chưa xác định'}
                      </p>
                      <p className="font-medium">
                        Năm: {program.year || 'Chưa xác định'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Thưởng</Label>
                      <p className="font-medium">
                        {(program.quarterlyRewards?.length || 0) + (program.monthlyRewards?.length || 0) + (program.annualRewards?.length || 0)} loại thưởng
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(program.quarterlyRewards?.length || 0) > 0 && (
                          <Badge variant="outline" className="text-xs">Quý</Badge>
                        )}
                        {(program.monthlyRewards?.length || 0) > 0 && (
                          <Badge variant="outline" className="text-xs">Tháng</Badge>
                        )}
                        {(program.annualRewards?.length || 0) > 0 && (
                          <Badge variant="outline" className="text-xs">Năm</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phạt</Label>
                      <p className="font-medium">
                        {program.penalties?.length || 0} loại phạt
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(program.penalties || []).map((penalty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {penalty.type || 'Phat'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {program.position && (
                    <div className="mt-3">
                      <Label className="text-muted-foreground">Vị trí áp dụng</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {program.position}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Program Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? 'Chỉnh sửa chương trình' : 'Thêm chương trình mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tên chương trình</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="VD: Chương trình thưởng Q1-2024"
                />
              </div>
              <div>
                <Label>Tần suất</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quý</SelectItem>
                    <SelectItem value="monthly">Tháng</SelectItem>
                    <SelectItem value="annual">Năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Mô tả chi tiết về chương trình..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vị trí áp dụng</Label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  placeholder="VD: IT Staff, Head of Marketing"
                />
              </div>
              <div>
                <Label>Năm</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  placeholder="2024"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="isActive">Chương trình đang hoạt động</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button onClick={handleSaveProgram}>
                <Save className="w-4 h-4 mr-2" />
                Lưu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
