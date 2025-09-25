'use client';
import React, { useState, useContext, useMemo, useCallback } from 'react';
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
import { PlusCircle, Target, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { useCachedData, useDebouncedSearch, usePerformanceMonitor } from '@/hooks/use-cache';
import type { Kpi } from '@/types';

// Memoized KPI row component for better performance
const KpiRow = React.memo(({ kpi, onRowClick }: { kpi: Kpi; onRowClick: (kpi: Kpi) => void }) => {
  const handleClick = useCallback(() => {
    onRowClick(kpi);
  }, [kpi, onRowClick]);

  return (
    <TableRow 
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={handleClick}
    >
      <TableCell className="font-medium">{kpi.name}</TableCell>
      <TableCell className="text-gray-600">{kpi.description}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {kpi.category || 'General'}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-medium">
        {kpi.weight}%
      </TableCell>
      <TableCell className="text-right">
        <Badge 
          variant={kpi.status === 'active' ? 'default' : 'secondary'}
          className={kpi.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
        >
          {kpi.status}
        </Badge>
      </TableCell>
    </TableRow>
  );
});

KpiRow.displayName = 'KpiRow';

export default function KpiDefinitionsComponent() {
  const { kpis, departments, addKpi, updateKpi, deleteKpi } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Performance monitoring
  usePerformanceMonitor('KpiDefinitionsComponent');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Memoized filtered KPIs for better performance
  const filteredKpis = useMemo(() => {
    return kpis.filter(kpi => {
      const matchesSearch = searchTerm === '' || 
        kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kpi.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kpi.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === '' || kpi.department === selectedDepartment;
      const matchesStatus = selectedStatus === '' || kpi.status === selectedStatus;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [kpis, searchTerm, selectedDepartment, selectedStatus]);

  // Memoized statistics
  const stats = useMemo(() => {
    const total = kpis.length;
    const active = kpis.filter(k => k.status === 'active').length;
    const inactive = total - active;
    const avgWeight = total > 0 ? kpis.reduce((sum, k) => sum + (k.weight || 0), 0) / total : 0;

    return { total, active, inactive, avgWeight };
  }, [kpis]);

  // Optimized handlers
  const handleCreateKpi = useCallback(() => {
    console.log('Create KPI functionality');
    toast({
      title: "Create KPI",
      description: "KPI creation functionality will be implemented here.",
    });
  }, [toast]);

  const handleRowClick = useCallback((kpi: Kpi) => {
    console.log('KPI clicked:', kpi.name);
    toast({
      title: "KPI Selected",
      description: `Selected: ${kpi.name}`,
    });
  }, [toast]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleDepartmentChange = useCallback((value: string) => {
    setSelectedDepartment(value);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setSelectedStatus(value);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedStatus('');
  }, []);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total KPIs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active KPIs</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive KPIs</CardTitle>
            <Target className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{stats.inactive}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Weight</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgWeight.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">KPI Definitions</CardTitle>
              <CardDescription>
                Manage and define Key Performance Indicators for your organization
              </CardDescription>
            </div>
            <Button onClick={handleCreateKpi} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create KPI
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search KPIs..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedDepartment}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            {(searchTerm || selectedDepartment || selectedStatus) && (
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredKpis.length} of {kpis.length} KPIs
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKpis.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No KPIs found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKpis.map((kpi) => (
                    <KpiRow 
                      key={kpi.id} 
                      kpi={kpi} 
                      onRowClick={handleRowClick}
                    />
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
