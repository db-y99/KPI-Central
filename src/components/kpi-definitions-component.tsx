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
import { PlusCircle, Target, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import type { Kpi } from '@/types';

export default function KpiDefinitionsComponent() {
  const { kpis, departments, addKpi, updateKpi, deleteKpi } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');

  // Filter KPIs based on search
  const filteredKpis = kpis.filter(kpi => {
    const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kpi.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kpi.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreateKpi = () => {
    // Simple create functionality without dialog
    console.log('Create KPI functionality');
  };

  const handleRowClick = (kpi: Kpi) => {
    // Remove dialog functionality - just log for now
    console.log('KPI clicked:', kpi.name);
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
            KPI Definitions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Define and manage KPI templates for your organization
          </p>
        </div>
        <Button onClick={handleCreateKpi} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Create KPI
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total KPIs
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.length}</div>
            <p className="text-xs text-muted-foreground">
              Active KPI definitions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Categories
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(kpis.map(kpi => kpi.category).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique KPI categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Departments
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Department coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>KPI List</CardTitle>
          <CardDescription>
            Manage your organization's KPI definitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search KPIs..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKpis.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No KPIs found matching your search.' : 'No KPIs defined yet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKpis.map((kpi) => (
                    <TableRow
                      key={kpi.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(kpi)}
                    >
                      <TableCell className="font-medium">{kpi.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {kpi.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {kpi.category || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getDepartmentName(kpi.departmentId)}
                      </TableCell>
                      <TableCell>{kpi.weight}%</TableCell>
                      <TableCell>
                        {kpi.targetType === 'number'
                          ? kpi.targetValue
                          : `${kpi.targetValue}%`
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={kpi.isActive ? 'default' : 'secondary'}>
                          {kpi.isActive ? 'Active' : 'Inactive'}
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
