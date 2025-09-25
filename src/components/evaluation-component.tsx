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
  Clock
} from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

export default function EvaluationComponent() {
  const { employees, kpis, kpiRecords, departments } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [evaluationForm, setEvaluationForm] = useState({
    overallRating: 5,
    comments: '',
    recommendations: '',
    nextPeriodGoals: ''
  });

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Create employee evaluations
  const employeeEvaluations = useMemo(() => {
    return nonAdminEmployees.map(employee => {
      const employeeKpis = kpiRecords.filter(record => record.employeeId === employee.uid);
      const department = departments.find(d => d.id === employee.departmentId);
      
      // Calculate overall performance
      const totalProgress = employeeKpis.reduce((sum, record) => {
        const progress = record.target > 0 ? ((record.actual || 0) / record.target * 100) : 0;
        return sum + progress;
      }, 0);
      
      const averageProgress = employeeKpis.length > 0 ? totalProgress / employeeKpis.length : 0;
      
      // Determine performance level
      let performanceLevel = 'Needs Improvement';
      let performanceColor = 'red';
      
      if (averageProgress >= 100) {
        performanceLevel = 'Exceeds Expectations';
        performanceColor = 'green';
      } else if (averageProgress >= 80) {
        performanceLevel = 'Meets Expectations';
        performanceColor = 'blue';
      } else if (averageProgress >= 60) {
        performanceLevel = 'Partially Meets';
        performanceColor = 'yellow';
      }

      return {
        ...employee,
        departmentName: department?.name || 'Unknown',
        kpiCount: employeeKpis.length,
        averageProgress,
        performanceLevel,
        performanceColor,
        completedKpis: employeeKpis.filter(r => r.status === 'approved').length,
        pendingKpis: employeeKpis.filter(r => r.status === 'pending' || r.status === 'awaiting_approval').length
      };
    });
  }, [nonAdminEmployees, kpiRecords, departments]);

  // Filter evaluations based on search and department
  const filteredEvaluations = useMemo(() => {
    return employeeEvaluations.filter(evaluation => {
      const matchesSearch = evaluation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           evaluation.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || evaluation.departmentId === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [employeeEvaluations, searchTerm, selectedDepartment]);

  const getPerformanceBadge = (level: string, color: string) => {
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colorClasses[color as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800'}>
        <Star className="w-3 h-3 mr-1" />
        {level}
      </Badge>
    );
  };

  const handleEvaluateEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setEvaluationForm({
      overallRating: 5,
      comments: '',
      recommendations: '',
      nextPeriodGoals: ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveEvaluation = () => {
    if (selectedEmployee) {
      // Here you would typically save the evaluation to your data store
      console.log('Saving evaluation for:', selectedEmployee.name, evaluationForm);
      
      toast({
        title: "Success",
        description: `Evaluation saved for ${selectedEmployee.name}`,
      });
      
      setIsDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedEmployee(null);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Employee Evaluation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Evaluate employee performance and provide feedback
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nonAdminEmployees.length}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exceeds Expectations</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {employeeEvaluations.filter(e => e.performanceLevel === 'Exceeds Expectations').length}
            </div>
            <p className="text-xs text-muted-foreground">Top performers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meets Expectations</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {employeeEvaluations.filter(e => e.performanceLevel === 'Meets Expectations').length}
            </div>
            <p className="text-xs text-muted-foreground">Good performers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {employeeEvaluations.filter(e => e.performanceLevel === 'Needs Improvement').length}
            </div>
            <p className="text-xs text-muted-foreground">Require support</p>
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
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Performance ({filteredEvaluations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvaluations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No employees found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedDepartment !== 'all' 
                  ? 'No employees match your search criteria.' 
                  : 'No employees available for evaluation.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>KPIs</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Overall Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvaluations.map((evaluation) => (
                  <TableRow key={evaluation.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={evaluation.avatar} />
                          <AvatarFallback>
                            {evaluation.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{evaluation.name}</p>
                          <p className="text-sm text-muted-foreground">{evaluation.position}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{evaluation.departmentName}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span>{evaluation.completedKpis} completed</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-3 h-3 text-orange-500" />
                          <span>{evaluation.pendingKpis} pending</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {getPerformanceBadge(evaluation.performanceLevel, evaluation.performanceColor)}
                        <div className="text-sm">
                          <span className="font-medium">{evaluation.averageProgress.toFixed(1)}%</span>
                          <span className="text-muted-foreground"> average</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getRatingStars(5)} {/* Default rating, would come from evaluation data */}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEvaluateEmployee(evaluation)}
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Evaluate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Evaluation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Employee Evaluation - {selectedEmployee?.name}
            </DialogTitle>
            <DialogDescription>
              Provide detailed evaluation and feedback for this employee
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Employee Info Section */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedEmployee.avatar} />
                  <AvatarFallback className="text-lg">
                    {selectedEmployee.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.position}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedEmployee.departmentName}</Badge>
                    {getPerformanceBadge(selectedEmployee.performanceLevel, selectedEmployee.performanceColor)}
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{selectedEmployee.kpiCount}</p>
                  <p className="text-sm text-muted-foreground">Total KPIs</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{selectedEmployee.completedKpis}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{selectedEmployee.averageProgress.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Average Progress</p>
                </div>
              </div>

              {/* Evaluation Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rating">Overall Rating</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {getRatingStars(evaluationForm.overallRating)}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {evaluationForm.overallRating}/5
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={evaluationForm.overallRating === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEvaluationForm(prev => ({ ...prev, overallRating: rating }))}
                        className="w-8 h-8 p-0"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="comments">Performance Comments</Label>
                  <Textarea
                    id="comments"
                    value={evaluationForm.comments}
                    onChange={(e) => setEvaluationForm(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Provide detailed feedback on employee performance..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="recommendations">Recommendations</Label>
                  <Textarea
                    id="recommendations"
                    value={evaluationForm.recommendations}
                    onChange={(e) => setEvaluationForm(prev => ({ ...prev, recommendations: e.target.value }))}
                    placeholder="Suggestions for improvement or development..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="goals">Next Period Goals</Label>
                  <Textarea
                    id="goals"
                    value={evaluationForm.nextPeriodGoals}
                    onChange={(e) => setEvaluationForm(prev => ({ ...prev, nextPeriodGoals: e.target.value }))}
                    placeholder="Goals and objectives for the next evaluation period..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={closeDialog}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEvaluation}
                  className="flex-1"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Save Evaluation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
