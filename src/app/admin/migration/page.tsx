'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import DatabaseMigrationService, { MigrationProgress, MigrationResult } from '@/lib/database-migration-service';
import { AlertTriangle, CheckCircle, Database, Play, RefreshCw, XCircle } from 'lucide-react';

export default function DatabaseMigrationPage() {
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleStartMigration = async () => {
    setIsRunning(true);
    setMigrationResult(null);
    setMigrationProgress({
      step: 'Starting...',
      completed: 0,
      total: 100,
      status: 'running'
    });

    const migrationService = new DatabaseMigrationService((progress) => {
      setMigrationProgress(progress);
    });

    const result = await migrationService.migrateToMultiTenant();
    setMigrationResult(result);
    setIsRunning(false);
  };

  const handleRollback = async () => {
    if (confirm('Bạn có chắc chắn muốn rollback migration? Tất cả dữ liệu mới sẽ bị xóa!')) {
      setIsRunning(true);
      const migrationService = new DatabaseMigrationService();
      const success = await migrationService.rollbackMigration();
      
      if (success) {
        setMigrationResult({
          success: true,
          message: 'Rollback completed successfully',
          stats: {
            organizationsCreated: 0,
            departmentsMigrated: 0,
            employeesMigrated: 0,
            kpisMigrated: 0,
            recordsMigrated: 0,
            programsCreated: 0
          }
        });
      }
      
      setIsRunning(false);
      setMigrationProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Database Migration</h1>
        <p className="text-muted-foreground">
          Migrate your database to support multi-tenant architecture with enhanced features
        </p>
      </div>

      {/* Migration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migration Status
          </CardTitle>
          <CardDescription>
            Current status of the database migration process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!migrationProgress && !migrationResult && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Ready to start migration. Please ensure you have a backup of your data before proceeding.
              </AlertDescription>
            </Alert>
          )}

          {migrationProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{migrationProgress.step}</span>
                <Badge variant={
                  migrationProgress.status === 'completed' ? 'default' :
                  migrationProgress.status === 'error' ? 'destructive' :
                  'secondary'
                }>
                  {migrationProgress.status}
                </Badge>
              </div>
              <Progress value={migrationProgress.completed} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {migrationProgress.message}
              </p>
            </div>
          )}

          {migrationResult && (
            <Alert variant={migrationResult.success ? 'default' : 'destructive'}>
              {migrationResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {migrationResult.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleStartMigration} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Migration...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Migration
                </>
              )}
            </Button>

            {migrationResult && migrationResult.success && (
              <Button 
                onClick={handleRollback} 
                disabled={isRunning}
                variant="destructive"
              >
                Rollback Migration
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Migration Statistics */}
      {migrationResult && migrationResult.success && (
        <Card>
          <CardHeader>
            <CardTitle>Migration Statistics</CardTitle>
            <CardDescription>
              Summary of migrated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Organizations Created</p>
                <p className="text-2xl font-bold">{migrationResult.stats.organizationsCreated}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Departments Migrated</p>
                <p className="text-2xl font-bold">{migrationResult.stats.departmentsMigrated}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Employees Migrated</p>
                <p className="text-2xl font-bold">{migrationResult.stats.employeesMigrated}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">KPIs Migrated</p>
                <p className="text-2xl font-bold">{migrationResult.stats.kpisMigrated}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Records Migrated</p>
                <p className="text-2xl font-bold">{migrationResult.stats.recordsMigrated}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Programs Created</p>
                <p className="text-2xl font-bold">{migrationResult.stats.programsCreated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Migration Information */}
      <Card>
        <CardHeader>
          <CardTitle>What will be migrated?</CardTitle>
          <CardDescription>
            Overview of the migration process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span><strong>Organization:</strong> Create default organization for multi-tenancy</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span><strong>Departments:</strong> Migrate existing departments with new structure</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span><strong>Employees:</strong> Migrate employee data with enhanced fields</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span><strong>KPI Categories:</strong> Create default KPI categories</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span><strong>KPIs:</strong> Migrate KPIs with enhanced structure</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span><strong>KPI Records:</strong> Migrate all KPI records</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span><strong>Reward Programs:</strong> Create default reward programs</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span><strong>Reward Calculations:</strong> Migrate existing calculations</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Warning */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Please backup your database before running the migration. 
          This process will create new collections and modify existing data structures.
        </AlertDescription>
      </Alert>
    </div>
  );
}
