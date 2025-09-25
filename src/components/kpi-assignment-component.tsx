'use client';
import { useState, useContext } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, Target, Calendar } from 'lucide-react';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

export default function KpiAssignmentComponent() {
  const { employees, kpis, departments, kpiRecords, assignKpiToEmployee } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedKpis, setSelectedKpis] = useState<string[]>([]);
  const [assignmentPeriod, setAssignmentPeriod] = useState<string>('Q1-2024');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter non-admin employees
  const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

  // Filter employees based on search
  const filteredEmployees = nonAdminEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignKpi = () => {
    if (!selectedEmployee || selectedKpis.length === 0) {
      toast({
        title: "Error",
        description: "Please select an employee and at least one KPI",
        variant: "destructive",
      });
      return;
    }

    // Assign KPIs to employee
    selectedKpis.forEach(kpiId => {
      const kpi = kpis.find(k => k.id === kpiId);
      if (kpi) {
        assignKpiToEmployee(selectedEmployee, kpiId, {
          target: kpi.targetValue,
          period: assignmentPeriod,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
        });
      }
    });

    toast({
      title: "Success",
      description: `Assigned ${selectedKpis.length} KPI(s) to employee`,
    });

    // Reset form
    setSelectedEmployee('');
    setSelectedKpis([]);
    setIsDialogOpen(false);
  };

  const handleKpiToggle = (kpiId: string) => {
    setSelectedKpis(prev =>
      prev.includes(kpiId)
        ? prev.filter(id => id !== kpiId)
        : [...prev, kpiId]
    );
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.uid === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  const getKpiName = (kpiId: string) => {
    const kpi = kpis.find(k => k.id === kpiId);
    return kpi?.name || 'Unknown KPI';
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department?.name || 'Unknown Department';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            KPI Assignment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Assign KPIs to employees and track their performance
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Assign KPI
        </Button>
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
            <CardTitle className="text-sm font-medium">Available KPIs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.length}</div>
            <p className="text-xs text-muted-foreground">KPI definitions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiRecords.length}</div>
            <p className="text-xs text-muted-foreground">KPI assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Assignments</CardTitle>
          <CardDescription>
            View and manage KPI assignments for each employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="space-y-4">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No employees found matching your search.
              </div>
            ) : (
              filteredEmployees.map((employee) => {
                const employeeKpis = kpiRecords.filter(record => record.employeeId === employee.uid);
                return (
                  <div key={employee.uid} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{employee.name}</h4>
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{getDepartmentName(employee.departmentId)}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Assigned KPIs</Label>
                        <p className="font-medium">{employeeKpis.length}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Current Period</Label>
                        <p className="font-medium">{assignmentPeriod}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <p className="font-medium">
                          {employeeKpis.length > 0 ? 'Active' : 'No KPIs assigned'}
                        </p>
                      </div>
                    </div>

                    {employeeKpis.length > 0 && (
                      <div className="mt-3">
                        <Label className="text-muted-foreground">Assigned KPIs:</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {employeeKpis.map((record) => (
                            <Badge key={record.id} variant="secondary">
                              {getKpiName(record.kpiId)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign KPIs to Employee</DialogTitle>
            <DialogDescription>
              Select an employee and assign KPIs for the current period
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Select Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {nonAdminEmployees.map((employee) => (
                    <SelectItem key={employee.uid} value={employee.uid!}>
                      {employee.name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Assignment Period</Label>
              <Input
                value={assignmentPeriod}
                onChange={(e) => setAssignmentPeriod(e.target.value)}
                placeholder="e.g., Q1-2024"
              />
            </div>

            <div>
              <Label>Select KPIs to Assign</Label>
              <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                {kpis.map((kpi) => (
                  <div key={kpi.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={kpi.id}
                      checked={selectedKpis.includes(kpi.id)}
                      onCheckedChange={() => handleKpiToggle(kpi.id)}
                    />
                    <Label htmlFor={kpi.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>{kpi.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {kpi.weight}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{kpi.description}</p>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignKpi} disabled={!selectedEmployee || selectedKpis.length === 0}>
                Assign KPIs
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
