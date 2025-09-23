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
import { PlusCircle, Target, Edit2, Trash2, Search, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import type { Kpi } from '@/types';

export default function KpiDefinitionsPage() {
  const { kpis, departments, addKpi, updateKpi, deleteKpi } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<Kpi | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<Kpi | null>(null);

  // Add KPI Form State
  const [newKpi, setNewKpi] = useState({
    name: '',
    description: '',
    departmentId: '',
    unit: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually',
    reward: 0,
    penalty: 0,
    category: '',
    weight: 1
  });

  // Edit KPI Form State
  const [editKpi, setEditKpi] = useState({
    name: '',
    description: '',
    departmentId: '',
    unit: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually',
    reward: 0,
    penalty: 0,
    category: '',
    weight: 1
  });


  // Filter KPIs based on search
  const filteredKpis = kpis.filter(kpi => {
    const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kpi.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kpi.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAddKpi = async () => {
    if (!newKpi.name || !newKpi.description || !newKpi.departmentId || !newKpi.unit) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.kpis.fillRequiredFields as string,
      });
      return;
    }

    try {
      await addKpi({
        ...newKpi,
        department: departments.find(d => d.id === newKpi.departmentId)?.name || '',
        createdAt: new Date().toISOString()
      });

      toast({
        title: t.common.success as string,
        description: t.kpis.saveSuccess as string,
      });

      // Reset form
      setNewKpi({
        name: '',
        description: '',
        departmentId: '',
        unit: '',
        frequency: 'monthly',
        reward: 0,
        penalty: 0,
        category: '',
        weight: 1
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.kpis.saveError as string,
      });
      console.error('Failed to add KPI:', error);
    }
  };

  const handleRowClick = (kpi: Kpi) => {
    setSelectedKpi(kpi);
    setIsDetailsDialogOpen(true);
  };

  const handleEditKpi = (kpi: Kpi) => {
    setEditingKpi(kpi);
    setEditKpi({
      name: kpi.name,
      description: kpi.description,
      departmentId: kpi.departmentId || '',
      unit: kpi.unit,
      frequency: kpi.frequency,
      reward: kpi.reward || 0,
      penalty: kpi.penalty || 0,
      category: kpi.category || '',
      weight: kpi.weight || 1
    });
    setIsEditDialogOpen(true);
    setIsDetailsDialogOpen(false);
  };

  const handleUpdateKpi = async () => {
    if (!editingKpi || !editKpi.name || !editKpi.description || !editKpi.departmentId) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.kpis.fillRequiredFields as string,
      });
      return;
    }

    try {
      await updateKpi(editingKpi.id, {
        ...editKpi,
        department: departments.find(d => d.id === editKpi.departmentId)?.name || ''
      });

      toast({
        title: t.common.success as string,
        description: t.kpis.updateSuccess as string,
      });

      setIsEditDialogOpen(false);
      setEditingKpi(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: t.kpis.updateError as string,
      });
      console.error('Failed to update KPI:', error);
    }
  };

  const handleDeleteKpi = async (kpi: Kpi) => {
    if (confirm(t.kpis.confirmDelete)) {
      try {
        await deleteKpi(kpi.id);
        
        toast({
          title: t.common.success as string,
          description: t.kpis.deleteSuccess as string,
        });
        setIsDetailsDialogOpen(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: t.common.error as string,
          description: t.kpis.deleteError as string,
        });
        console.error('Failed to delete KPI:', error);
      }
    }
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : t.kpis.notAssigned;
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: t.kpis.daily as string,
      weekly: t.kpis.weekly as string,
      monthly: t.kpis.monthly as string,
      quarterly: t.kpis.quarterly as string,
      annually: t.kpis.annually as string
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Add KPI Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.kpis.addKpiTitle as string}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t.kpis.addKpiDescription as string}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.kpis.name as string} *</Label>
              <Input
                id="name"
                value={newKpi.name}
                onChange={(e) => setNewKpi({...newKpi, name: e.target.value})}
                placeholder={t.kpis.enterKpiName as string}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{t.kpis.description as string} *</Label>
              <Textarea
                id="description"
                value={newKpi.description}
                onChange={(e) => setNewKpi({...newKpi, description: e.target.value})}
                placeholder={t.kpis.enterDescription as string}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">{t.kpis.department as string} *</Label>
              <Select value={newKpi.departmentId} onValueChange={(value) => setNewKpi({...newKpi, departmentId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t.kpis.selectDepartment as string} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">{t.kpis.unit as string} *</Label>
              <Input
                id="unit"
                value={newKpi.unit}
                onChange={(e) => setNewKpi({...newKpi, unit: e.target.value})}
                placeholder={t.kpis.enterUnit as string}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">{t.kpis.frequency as string}</Label>
              <Select value={newKpi.frequency} onValueChange={(value) => setNewKpi({...newKpi, frequency: value as any})}>
                <SelectTrigger>
                  <SelectValue placeholder={t.kpis.selectFrequency as string} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t.kpis.daily as string}</SelectItem>
                  <SelectItem value="weekly">{t.kpis.weekly as string}</SelectItem>
                  <SelectItem value="monthly">{t.kpis.monthly as string}</SelectItem>
                  <SelectItem value="quarterly">{t.kpis.quarterly as string}</SelectItem>
                  <SelectItem value="annually">{t.kpis.annually as string}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reward">{t.kpis.reward as string} (VND)</Label>
                <Input
                  id="reward"
                  type="number"
                  value={newKpi.reward}
                  onChange={(e) => setNewKpi({...newKpi, reward: parseFloat(e.target.value) || 0})}
                  placeholder={t.kpis.enterReward as string}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="penalty">{t.kpis.penalty as string} (VND)</Label>
                <Input
                  id="penalty"
                  type="number"
                  value={newKpi.penalty}
                  onChange={(e) => setNewKpi({...newKpi, penalty: parseFloat(e.target.value) || 0})}
                  placeholder={t.kpis.enterPenalty as string}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">{t.kpis.category as string}</Label>
              <Input
                id="category"
                value={newKpi.category}
                onChange={(e) => setNewKpi({...newKpi, category: e.target.value})}
                placeholder={t.kpis.enterCategory as string}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">{t.kpis.weight as string}</Label>
              <Input
                id="weight"
                type="number"
                min="1"
                max="10"
                value={newKpi.weight}
                onChange={(e) => setNewKpi({...newKpi, weight: parseFloat(e.target.value) || 1})}
                placeholder={t.kpis.enterWeight as string}
              />
              <p className="text-xs text-muted-foreground">
                {t.kpis.weightDescription as string}
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t.common.cancel as string}
              </Button>
              <Button onClick={handleAddKpi}>
                {t.kpis.saveKpi as string}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{kpis.length}</div>
            <p className="text-xs text-muted-foreground">{t.kpis.totalKpis as string}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">{t.kpis.departments as string}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {kpis.filter(kpi => kpi.frequency === 'monthly').length}
            </div>
            <p className="text-xs text-muted-foreground">{t.kpis.monthlyKpis as string}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {new Set(kpis.map(kpi => kpi.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">{t.kpis.categories as string}</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {t.kpis.kpiName as string} ({filteredKpis.length})
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Input
                  placeholder={t.common.search as string}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    {t.kpis.addKpi as string}
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredKpis.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.kpis.noKpisFound as string}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.kpis.kpiName as string}</TableHead>
                  <TableHead>{t.kpis.kpiDepartment as string}</TableHead>
                  <TableHead>{t.kpis.kpiUnit as string}</TableHead>
                  <TableHead>{t.kpis.kpiFrequency as string}</TableHead>
                  <TableHead>{t.kpis.kpiCategory as string}</TableHead>
                  <TableHead>{t.kpis.kpiRewardPenalty as string}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKpis.map((kpi) => (
                  <TableRow 
                    key={kpi.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(kpi)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{kpi.name}</p>
                        <p className="text-sm text-muted-foreground">{kpi.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getDepartmentName(kpi.departmentId || '')}
                      </Badge>
                    </TableCell>
                    <TableCell>{kpi.unit}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getFrequencyLabel(kpi.frequency)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {kpi.category && (
                        <Badge variant="outline">{kpi.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {kpi.reward && kpi.reward > 0 && (
                          <p className="text-green-600">+{kpi.reward.toLocaleString()} VND</p>
                        )}
                        {kpi.penalty && kpi.penalty > 0 && (
                          <p className="text-red-600">-{kpi.penalty.toLocaleString()} VND</p>
                        )}
                        {(!kpi.reward || kpi.reward === 0) && (!kpi.penalty || kpi.penalty === 0) && (
                          <p className="text-muted-foreground">{t.kpis.noRewardPenalty as string}</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* KPI Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {selectedKpi?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedKpi && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t.kpis.description as string}
                  </Label>
                  <p className="text-sm">{selectedKpi.description}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t.kpis.department as string}
                  </Label>
                  <Badge variant="outline">
                    {getDepartmentName(selectedKpi.departmentId || '')}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t.kpis.unit as string}
                  </Label>
                  <p className="text-sm">{selectedKpi.unit}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t.kpis.frequency as string}
                  </Label>
                  <Badge variant="secondary">
                    {getFrequencyLabel(selectedKpi.frequency)}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t.kpis.category as string}
                  </Label>
                  {selectedKpi.category ? (
                    <Badge variant="outline">{selectedKpi.category}</Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.kpis.noCategory as string}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t.kpis.weight as string}
                  </Label>
                  <p className="text-sm">{selectedKpi.weight || 1}</p>
                </div>
              </div>
              
              {/* Reward/Penalty Information */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  {t.kpis.kpiRewardPenalty as string}
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">{t.kpis.reward as string}</p>
                    {selectedKpi.reward && selectedKpi.reward > 0 ? (
                      <p className="text-lg font-semibold text-green-600">
                        +{selectedKpi.reward.toLocaleString()} VND
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t.kpis.noReward as string}</p>
                    )}
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">{t.kpis.penalty as string}</p>
                    {selectedKpi.penalty && selectedKpi.penalty > 0 ? (
                      <p className="text-lg font-semibold text-red-600">
                        -{selectedKpi.penalty.toLocaleString()} VND
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t.kpis.noPenalty as string}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  {t.common.close as string}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteKpi(selectedKpi)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t.kpis.deleteKpi as string}
                </Button>
                <Button onClick={() => handleEditKpi(selectedKpi)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  {t.kpis.editKpi as string}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit KPI Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.kpis.editKpiTitle as string}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t.kpis.name as string} *</Label>
              <Input
                id="edit-name"
                value={editKpi.name}
                onChange={(e) => setEditKpi({...editKpi, name: e.target.value})}
                placeholder={t.kpis.enterKpiName as string}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">{t.kpis.description as string} *</Label>
              <Textarea
                id="edit-description"
                value={editKpi.description}
                onChange={(e) => setEditKpi({...editKpi, description: e.target.value})}
                placeholder={t.kpis.enterDescription as string}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-department">{t.kpis.department as string} *</Label>
              <Select value={editKpi.departmentId} onValueChange={(value) => setEditKpi({...editKpi, departmentId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t.kpis.selectDepartment as string} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-unit">{t.kpis.unit as string} *</Label>
              <Input
                id="edit-unit"
                value={editKpi.unit}
                onChange={(e) => setEditKpi({...editKpi, unit: e.target.value})}
                placeholder={t.kpis.enterUnit as string}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-frequency">{t.kpis.frequency as string}</Label>
              <Select value={editKpi.frequency} onValueChange={(value) => setEditKpi({...editKpi, frequency: value as any})}>
                <SelectTrigger>
                  <SelectValue placeholder={t.kpis.selectFrequency as string} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t.kpis.daily as string}</SelectItem>
                  <SelectItem value="weekly">{t.kpis.weekly as string}</SelectItem>
                  <SelectItem value="monthly">{t.kpis.monthly as string}</SelectItem>
                  <SelectItem value="quarterly">{t.kpis.quarterly as string}</SelectItem>
                  <SelectItem value="annually">{t.kpis.annually as string}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-reward">{t.kpis.reward as string} (VND)</Label>
                <Input
                  id="edit-reward"
                  type="number"
                  value={editKpi.reward}
                  onChange={(e) => setEditKpi({...editKpi, reward: parseFloat(e.target.value) || 0})}
                  placeholder={t.kpis.enterReward as string}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-penalty">{t.kpis.penalty as string} (VND)</Label>
                <Input
                  id="edit-penalty"
                  type="number"
                  value={editKpi.penalty}
                  onChange={(e) => setEditKpi({...editKpi, penalty: parseFloat(e.target.value) || 0})}
                  placeholder={t.kpis.enterPenalty as string}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category">{t.kpis.category as string}</Label>
              <Input
                id="edit-category"
                value={editKpi.category}
                onChange={(e) => setEditKpi({...editKpi, category: e.target.value})}
                placeholder={t.kpis.enterCategory as string}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-weight">{t.kpis.weight as string}</Label>
              <Input
                id="edit-weight"
                type="number"
                min="1"
                max="10"
                value={editKpi.weight}
                onChange={(e) => setEditKpi({...editKpi, weight: parseFloat(e.target.value) || 1})}
                placeholder={t.kpis.enterWeight as string}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t.common.cancel as string}
              </Button>
              <Button onClick={handleUpdateKpi}>
                {t.kpis.updateKpi as string}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
