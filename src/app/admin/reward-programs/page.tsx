'use client';
import { useState, useContext, useMemo, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  MoreHorizontal, 
  Pen, 
  Trash2, 
  Award,
  Settings,
  Download,
  Upload,
  Eye,
  Cog
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddRewardProgramForm from '@/components/add-reward-program-form';
import { RewardProgramDetailModal } from '@/components/reward-program-detail-modal';
import { EditRewardProgramForm } from '@/components/edit-reward-program-form';
import type { RewardProgram } from '@/types';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';

export default function RewardProgramsPage() {
  const { 
    rewardPrograms, 
    deleteRewardProgram, 
    updateRewardProgram,
    initializeRewardPrograms,
    loading 
  } = useContext(DataContext);
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<RewardProgram | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const positions = ['IT Staff', 'Head of Marketing', 'Marketing Assistant', 'Customer Service Officer', 'Credit Appraiser'];
  const years = [...new Set(rewardPrograms.map(p => p.year))].sort((a, b) => b - a);

  useEffect(() => {
    // Initialize reward programs on first load if none exist
    console.log('Reward programs:', rewardPrograms);
    console.log('Loading:', loading);
    if (rewardPrograms.length === 0 && !loading) {
      console.log('Initializing reward programs...');
      initializeRewardPrograms();
    }
  }, [rewardPrograms.length, loading, initializeRewardPrograms]);

  const filteredPrograms = useMemo(() => {
    const filtered = rewardPrograms.filter(program => {
      const matchesPosition = selectedPosition === 'all' || program.position === selectedPosition;
      const matchesYear = selectedYear === 'all' || program.year === Number(selectedYear);
      return matchesPosition && matchesYear;
    });
    console.log('Filtered programs:', filtered);
    return filtered;
  }, [rewardPrograms, selectedPosition, selectedYear]);

  const handleEditProgram = (program: RewardProgram) => {
    console.log('Edit program clicked:', program);
    setEditingProgram(program);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingProgram(null);
  };

  const handleSaveProgram = async (updatedProgram: RewardProgram) => {
    try {
      await updateRewardProgram(updatedProgram);
      toast({
        title: 'Thành công!',
        description: 'Chương trình thưởng đã được cập nhật.',
      });
      setIsEditDialogOpen(false);
      setEditingProgram(null);
    } catch (error) {
      console.error('Error updating reward program:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật chương trình thưởng.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteProgram = (programId: string) => {
    const program = rewardPrograms.find(p => p.id === programId);
    if (window.confirm(`Bạn có chắc chắn muốn xóa chương trình "${program?.name}"?`)) {
      deleteRewardProgram(programId);
      toast({
        title: 'Thành công!',
        description: `Đã xóa chương trình "${program?.name}".`,
        variant: 'destructive'
      });
    }
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingProgram(null);
  };

  const getTotalCriteria = (program: RewardProgram) => {
    return program.quarterlyRewards.length + 
           (program.monthlyRewards?.length || 0) + 
           program.annualRewards.length;
  };

  const exportPrograms = () => {
    const dataStr = JSON.stringify(filteredPrograms, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `reward-programs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: 'Xuất dữ liệu thành công!',
      description: 'Đã xuất danh sách chương trình khen thưởng.',
    });
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary" />
                <span>Quản lý chương trình khen thưởng</span>
              </CardTitle>
              <CardDescription>
                Tạo và quản lý các chương trình khen thưởng cho từng vị trí công việc
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportPrograms}
                disabled={filteredPrograms.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Xuất
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => initializeRewardPrograms()}
              >
                <Settings className="h-4 w-4 mr-1" />
                Khởi tạo mẫu
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black hover:bg-gray-800 text-white border-0">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tạo chương trình
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProgram ? 'Chỉnh sửa chương trình' : 'Tạo chương trình khen thưởng'}
                    </DialogTitle>
                  </DialogHeader>
                  <AddRewardProgramForm 
                    onClose={handleCloseDialog}
                    existingProgram={editingProgram || undefined}
                    mode={editingProgram ? 'edit' : 'create'}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-1/3">
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo vị trí..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vị trí</SelectItem>
                  {positions.map(position => (
                    <SelectItem key={position} value={position}>{position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo năm..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả năm</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredPrograms.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có chương trình khen thưởng
              </h3>
              <p className="text-gray-500 mb-4">
                {rewardPrograms.length === 0 
                  ? 'Chưa có chương trình khen thưởng nào. Hãy tạo chương trình đầu tiên để bắt đầu quản lý KPI và thưởng phạt.'
                  : 'Không có chương trình nào khớp với bộ lọc hiện tại.'}
              </p>
              {rewardPrograms.length === 0 && (
                <div className="flex items-center justify-center space-x-2">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Tạo mới
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Tạo chương trình khen thưởng</DialogTitle>
                      </DialogHeader>
                      <AddRewardProgramForm onClose={handleCloseDialog} />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chương trình</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Năm</TableHead>
                  <TableHead>Tiêu chí</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.map(program => (
                  <TableRow key={program.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{program.name}</div>
                        <div className="text-sm text-gray-500">{program.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{program.position}</Badge>
                    </TableCell>
                    <TableCell>{program.year}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">{getTotalCriteria(program)}</span> tiêu chí
                        </div>
                        <div className="text-xs text-gray-500">
                          Q: {program.quarterlyRewards.length} | 
                          M: {program.monthlyRewards?.length || 0} | 
                          Y: {program.annualRewards.length}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={program.isActive ? "default" : "secondary"}
                        className={program.isActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {program.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <RewardProgramDetailModal
                          program={program}
                          onEdit={handleEditProgram}
                          onDelete={handleDeleteProgram}
                        >
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => console.log('Details button clicked for program:', program)}
                          >
                            <Eye className="h-4 w-4" />
                            Chi tiết
                          </Button>
                        </RewardProgramDetailModal>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            console.log('Config button clicked for program:', program);
                            handleEditProgram(program);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Cog className="h-4 w-4" />
                          Cấu hình
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chương trình thưởng</DialogTitle>
          </DialogHeader>
          {editingProgram && (
            <EditRewardProgramForm
              program={editingProgram}
              onSave={handleSaveProgram}
              onCancel={handleCloseEditDialog}
              isOpen={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
