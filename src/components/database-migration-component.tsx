'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Building2, 
  Users, 
  Target,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

interface MigrationStats {
  organizationId: string;
  departments: number;
  employees: number;
  kpis: number;
  kpiRecords: number;
  completedRecords: number;
  completionRate: number;
  lastUpdated: string;
}

export default function DatabaseMigrationComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [organizationId, setOrganizationId] = useState('');
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const runMigration = async () => {
    setIsLoading(true);
    setMigrationStatus('running');
    setError(null);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'run_migration'
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = await response.json();

      if (result.success) {
        setMigrationStatus('completed');
        setOrganizationId(result.organizationId || 'default-org');
      } else {
        setMigrationStatus('error');
        setError(result.message || 'Migration failed');
      }
    } catch (err) {
      setMigrationStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const validateMigration = async () => {
    if (!organizationId) {
      setError('Please enter an Organization ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'validate_migration',
          organizationId
        }),
      });

      const result = await response.json();

      if (result.success) {
        setError(null);
        // Get stats after validation
        await getOrganizationStats();
      } else {
        setError(result.message || 'Validation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const getOrganizationStats = async () => {
    if (!organizationId) return;

    try {
      const response = await fetch(`/api/migration?organizationId=${organizationId}`);
      const result = await response.json();

      if (result.success) {
        setStats(result.stats);
      }
    } catch (err) {
      console.error('Error getting stats:', err);
    }
  };

  const getStatusIcon = () => {
    switch (migrationStatus) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Database className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (migrationStatus) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Idle</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Migration Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Database Migration
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {migrationStatus === 'running' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Migration Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button 
              onClick={runMigration}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Run Migration
            </Button>

            <div className="flex gap-2 flex-1">
              <Input
                placeholder="Organization ID"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={validateMigration}
                disabled={isLoading || !organizationId}
                variant="outline"
              >
                Validate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.departments}</div>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.employees}</div>
              <p className="text-xs text-muted-foreground">Active employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">KPIs</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.kpis}</div>
              <p className="text-xs text-muted-foreground">Active KPIs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.completedRecords} / {stats.kpiRecords} records
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Migration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">What gets migrated:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Organizations (default organization created)</li>
                <li>• Departments (with organization context)</li>
                <li>• Employees (with enhanced structure)</li>
                <li>• KPIs (with categories and settings)</li>
                <li>• KPI Records (with improved structure)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">New features:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Multi-tenant support</li>
                <li>• Hierarchical departments</li>
                <li>• Enhanced employee profiles</li>
                <li>• KPI categories</li>
                <li>• Improved security rules</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
