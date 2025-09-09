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
import { PlusCircle, MoreHorizontal, Pen, Trash2, Eye } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DataContext } from '@/context/data-context';
import AddRewardProgramForm from '@/components/add-reward-program-form';
import { RewardProgramDetailModal } from '@/components/reward-program-detail-modal';
import { EditRewardProgramForm } from '@/components/edit-reward-program-form';
import type { RewardProgram } from '@/types';

export default function RewardProgramsTab() {
  const { rewardPrograms, deleteRewardProgram, updateRewardProgram } = useContext(DataContext);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<RewardProgram | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDeleteProgram = async (programId: string) => {
    const program = rewardPrograms?.find(p => p.id === programId);
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa chương trình thưởng "${program?.name}"?`)) {
      try {
        await deleteRewardProgram(programId);
        toast({
          title: 'Thành công!',
          description: `Đã xóa chương trình thưởng "${program?.name}".`,
        });
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: 'Đã có lỗi xảy ra khi xóa chương trình thưởng.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleEditProgram = (program: RewardProgram) => {
    setEditingProgram(program);
    setIsEditDialogOpen(true);
  };

  const handleSaveProgram = async (updatedProgram: RewardProgram) => {
    try {
      await updateRewardProgram(updatedProgram);
      setEditingProgram(null);
      setIsEditDialogOpen(false);
      toast({
        title: 'Thành công!',
        description: 'Chương trình thưởng đã được cập nhật.',
      });
    } catch (error) {
      console.error('Error updating reward program:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật chương trình thưởng.',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Hoạt động' : 'Không hoạt động'}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Chương trình thưởng</CardTitle>
            <CardDescription>
              Tạo và quản lý các chương trình thưởng dựa trên KPI
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm chương trình
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Thêm chương trình thưởng mới</DialogTitle>
              </DialogHeader>
              <AddRewardProgramForm onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {!rewardPrograms || rewardPrograms.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
              <PlusCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Chưa có chương trình thưởng</h3>
            <p className="text-muted-foreground mb-4">
              Bắt đầu bằng cách tạo chương trình thưởng đầu tiên của bạn
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm chương trình
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {rewardPrograms.map(program => (
              <Card key={program.id} className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{program.name}</h3>
                        {getStatusBadge(program.isActive)}
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {program.position}
                        </Badge>
                        <Badge variant="secondary">
                          Năm {program.year}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{program.description}</p>
                      
                      <div className="grid gap-4 md:grid-cols-3">
                        {/* Quarterly Rewards */}
                        {program.quarterlyRewards.length > 0 && (
                          <div className="p-4 bg-white/70 dark:bg-slate-800/70 rounded-lg border">
                            <h4 className="font-medium mb-2 text-green-700 dark:text-green-400">
                              Thưởng hàng quý
                            </h4>
                            <div className="space-y-2">
                              {program.quarterlyRewards.slice(0, 3).map(reward => (
                                <div key={reward.id} className="text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="truncate mr-2">{reward.name}</span>
                                    <span className="font-medium text-green-600">
                                      {reward.type === 'percentage' ? `${reward.value}%` : formatCurrency(reward.value)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {program.quarterlyRewards.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{program.quarterlyRewards.length - 3} tiêu chí khác
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Monthly Rewards */}
                        {program.monthlyRewards && program.monthlyRewards.length > 0 && (
                          <div className="p-4 bg-white/70 dark:bg-slate-800/70 rounded-lg border">
                            <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-400">
                              Thưởng hàng tháng
                            </h4>
                            <div className="space-y-2">
                              {program.monthlyRewards.slice(0, 3).map(reward => (
                                <div key={reward.id} className="text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="truncate mr-2">{reward.name}</span>
                                    <span className="font-medium text-blue-600">
                                      {reward.type === 'percentage' ? `${reward.value}%` : formatCurrency(reward.value)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Annual Rewards */}
                        {program.annualRewards.length > 0 && (
                          <div className="p-4 bg-white/70 dark:bg-slate-800/70 rounded-lg border">
                            <h4 className="font-medium mb-2 text-purple-700 dark:text-purple-400">
                              Thưởng hàng năm
                            </h4>
                            <div className="space-y-2">
                              {program.annualRewards.slice(0, 3).map(reward => (
                                <div key={reward.id} className="text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="truncate mr-2">{reward.name}</span>
                                    <span className="font-medium text-purple-600">
                                      {reward.type === 'percentage' ? `${reward.value}%` : formatCurrency(reward.value)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {program.annualRewards.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{program.annualRewards.length - 3} tiêu chí khác
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Penalties */}
                      {program.penalties.length > 0 && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <h4 className="font-medium mb-2 text-red-700 dark:text-red-400 flex items-center gap-2">
                            <span>Hình phạt ({program.penalties.length})</span>
                          </h4>
                          <div className="grid gap-2 md:grid-cols-2">
                            {program.penalties.slice(0, 4).map(penalty => (
                              <div key={penalty.id} className="text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="truncate mr-2">{penalty.name}</span>
                                  <span className="font-medium text-red-600">
                                    {penalty.type === 'warning' ? 'Cảnh cáo' : formatCurrency(penalty.value)}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {program.penalties.length > 4 && (
                              <div className="text-xs text-muted-foreground col-span-2">
                                +{program.penalties.length - 4} hình phạt khác
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <RewardProgramDetailModal
                            program={program}
                            onEdit={handleEditProgram}
                            onDelete={handleDeleteProgram}
                          >
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                          </RewardProgramDetailModal>
                          <DropdownMenuItem onClick={() => handleEditProgram(program)}>
                            <Pen className="mr-2 h-4 w-4" />
                            Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 hover:text-red-500 focus:text-red-500"
                            onClick={() => handleDeleteProgram(program.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      {editingProgram && (
        <EditRewardProgramForm
          program={editingProgram}
          onSave={handleSaveProgram}
          onCancel={() => {
            setEditingProgram(null);
            setIsEditDialogOpen(false);
          }}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </Card>
  );
}
