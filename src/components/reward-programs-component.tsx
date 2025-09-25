'use client';
import { useState, useContext, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Gift, 
  Search, 
  Star, 
  TrendingUp, 
  Users,
  Target,
  Calendar,
  Award,
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { rewardProgramsData } from '@/lib/reward-programs-data';

export default function RewardProgramsComponent() {
  const { employees, departments } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: '',
    position: '',
    year: new Date().getFullYear(),
    frequency: 'quarterly' as 'monthly' | 'quarterly' | 'annually',
    isActive: true
  });

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Get unique positions
  const positions = useMemo(() => {
    const uniquePositions = [...new Set(nonAdminEmployees.map(emp => emp.position))];
    return uniquePositions.sort();
  }, [nonAdminEmployees]);

  // Filter programs based on search and position
  const filteredPrograms = useMemo(() => {
    return rewardProgramsData.filter(program => {
      const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           program.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = selectedPosition === 'all' || program.position === selectedPosition;
      return matchesSearch && matchesPosition;
    });
  }, [searchTerm, selectedPosition]);

  // Calculate program statistics
  const programStats = useMemo(() => {
    const totalPrograms = rewardProgramsData.length;
    const activePrograms = rewardProgramsData.filter(p => p.isActive).length;
    const positionsWithPrograms = [...new Set(rewardProgramsData.map(p => p.position))].length;
    const totalRewardCriteria = rewardProgramsData.reduce((sum, program) => 
      sum + program.monthlyRewards.length + program.quarterlyRewards.length + program.annualRewards.length, 0
    );

    return {
      totalPrograms,
      activePrograms,
      positionsWithPrograms,
      totalRewardCriteria
    };
  }, []);

  const handleViewProgram = (program: any) => {
    setSelectedProgram(program);
    setIsDialogOpen(true);
  };

  const handleCreateProgram = () => {
    // Here you would typically save the program to your data store
    console.log('Creating new program:', newProgram);
    
    toast({
      title: "Success",
      description: "Reward program created successfully",
    });
    
    setIsCreateDialogOpen(false);
    setNewProgram({
      name: '',
      description: '',
      position: '',
      year: new Date().getFullYear(),
      frequency: 'quarterly',
      isActive: true
    });
  };

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'fixed': return <Target className="w-4 h-4 text-blue-500" />;
      case 'variable': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'percentage': return <Award className="w-4 h-4 text-purple-500" />;
      default: return <Gift className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedProgram(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reward Programs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage reward programs and criteria for different positions
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Program
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programStats.totalPrograms}</div>
            <p className="text-xs text-muted-foreground">Active programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{programStats.activePrograms}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positions Covered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{programStats.positionsWithPrograms}</div>
            <p className="text-xs text-muted-foreground">Different positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Criteria</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{programStats.totalRewardCriteria}</div>
            <p className="text-xs text-muted-foreground">Reward criteria</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map(position => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Programs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reward Programs ({filteredPrograms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No programs found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedPosition !== 'all' 
                  ? 'No programs match your search criteria.' 
                  : 'No reward programs available.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Reward Criteria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.map((program, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{program.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {program.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{program.position}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{program.year}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {program.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-3 h-3 text-blue-500" />
                          <span>{program.monthlyRewards.length} monthly</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-3 h-3 text-green-500" />
                          <span>{program.quarterlyRewards.length} quarterly</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-3 h-3 text-purple-500" />
                          <span>{program.annualRewards.length} annual</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={program.isActive ? "default" : "secondary"}
                        className={program.isActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {program.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProgram(program)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Program Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              {selectedProgram?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedProgram?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProgram && (
            <div className="space-y-6">
              {/* Program Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Badge variant="outline" className="mb-2">{selectedProgram.position}</Badge>
                  <p className="text-sm text-muted-foreground">Position</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <span className="text-2xl font-bold">{selectedProgram.year}</span>
                  <p className="text-sm text-muted-foreground">Year</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Badge variant="secondary" className="mb-2 capitalize">
                    {selectedProgram.frequency}
                  </Badge>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                </div>
              </div>

              {/* Monthly Rewards */}
              {selectedProgram.monthlyRewards.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Monthly Rewards
                  </h3>
                  <div className="space-y-3">
                    {selectedProgram.monthlyRewards.map((reward: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                {getRewardTypeIcon(reward.type)}
                                <h4 className="font-medium">{reward.name}</h4>
                                <Badge variant="outline" className="capitalize">
                                  {reward.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{reward.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="font-medium">
                                  {formatCurrency(reward.value)}
                                </span>
                                {reward.maxValue && (
                                  <span className="text-muted-foreground">
                                    Max: {formatCurrency(reward.maxValue)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Quarterly Rewards */}
              {selectedProgram.quarterlyRewards.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    Quarterly Rewards
                  </h3>
                  <div className="space-y-3">
                    {selectedProgram.quarterlyRewards.map((reward: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                {getRewardTypeIcon(reward.type)}
                                <h4 className="font-medium">{reward.name}</h4>
                                <Badge variant="outline" className="capitalize">
                                  {reward.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{reward.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="font-medium">
                                  {formatCurrency(reward.value)}
                                </span>
                                {reward.maxValue && (
                                  <span className="text-muted-foreground">
                                    Max: {formatCurrency(reward.maxValue)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Annual Rewards */}
              {selectedProgram.annualRewards.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    Annual Rewards
                  </h3>
                  <div className="space-y-3">
                    {selectedProgram.annualRewards.map((reward: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                {getRewardTypeIcon(reward.type)}
                                <h4 className="font-medium">{reward.name}</h4>
                                <Badge variant="outline" className="capitalize">
                                  {reward.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{reward.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="font-medium">
                                  {formatCurrency(reward.value)}
                                </span>
                                {reward.maxValue && (
                                  <span className="text-muted-foreground">
                                    Max: {formatCurrency(reward.maxValue)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Penalties */}
              {selectedProgram.penalties.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500" />
                    Penalties
                  </h3>
                  <div className="space-y-3">
                    {selectedProgram.penalties.map((penalty: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-red-500" />
                                <h4 className="font-medium">{penalty.name}</h4>
                                <Badge variant="destructive" className="capitalize">
                                  {penalty.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{penalty.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="font-medium text-red-600">
                                  {formatCurrency(penalty.value)}
                                </span>
                                <Badge variant="outline" className="capitalize">
                                  {penalty.frequency}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Program Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Reward Program
            </DialogTitle>
            <DialogDescription>
              Create a new reward program for a specific position
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="program-name">Program Name</Label>
              <Input
                id="program-name"
                value={newProgram.name}
                onChange={(e) => setNewProgram(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter program name"
              />
            </div>

            <div>
              <Label htmlFor="program-description">Description</Label>
              <Textarea
                id="program-description"
                value={newProgram.description}
                onChange={(e) => setNewProgram(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter program description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="program-position">Position</Label>
                <Select value={newProgram.position} onValueChange={(value) => setNewProgram(prev => ({ ...prev, position: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map(position => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="program-frequency">Frequency</Label>
                <Select value={newProgram.frequency} onValueChange={(value: any) => setNewProgram(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => setIsCreateDialogOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProgram}
                className="flex-1"
                disabled={!newProgram.name || !newProgram.position}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Program
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
