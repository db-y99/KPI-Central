import { NextRequest, NextResponse } from 'next/server';
import DatabaseMigrationService from '@/lib/database-migration-service';
import MultiTenantService from '@/lib/multi-tenant-service';

export async function POST(request: NextRequest) {
  try {
    const { action, organizationId } = await request.json();

    const migrationService = DatabaseMigrationService.getInstance();
    const multiTenantService = MultiTenantService.getInstance();

    switch (action) {
      case 'run_migration':
        console.log('Starting complete database migration...');
        await migrationService.runCompleteMigration();
        
        return NextResponse.json({
          success: true,
          message: 'Database migration completed successfully',
          timestamp: new Date().toISOString()
        });

      case 'validate_migration':
        if (!organizationId) {
          return NextResponse.json({
            success: false,
            message: 'Organization ID is required for validation'
          }, { status: 400 });
        }

        const isValid = await migrationService.validateMigration(organizationId);
        
        return NextResponse.json({
          success: isValid,
          message: isValid ? 'Migration validation passed' : 'Migration validation failed',
          organizationId
        });

      case 'create_organization':
        const newOrgId = await migrationService.createDefaultOrganization();
        
        return NextResponse.json({
          success: true,
          message: 'Default organization created',
          organizationId: newOrgId
        });

      case 'get_stats':
        if (!organizationId) {
          return NextResponse.json({
            success: false,
            message: 'Organization ID is required for stats'
          }, { status: 400 });
        }

        multiTenantService.setCurrentOrganization(organizationId);
        const stats = await multiTenantService.getOrganizationStats();
        
        return NextResponse.json({
          success: true,
          stats
        });

      case 'get_hierarchy':
        if (!organizationId) {
          return NextResponse.json({
            success: false,
            message: 'Organization ID is required for hierarchy'
          }, { status: 400 });
        }

        multiTenantService.setCurrentOrganization(organizationId);
        const hierarchy = await multiTenantService.getDepartmentHierarchy();
        
        return NextResponse.json({
          success: true,
          hierarchy
        });

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Supported actions: run_migration, validate_migration, create_organization, get_stats, get_hierarchy'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Migration API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Migration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    const multiTenantService = MultiTenantService.getInstance();

    if (!organizationId) {
      // Get all organizations (admin view)
      const organizations = await multiTenantService.getAllOrganizations();
      
      return NextResponse.json({
        success: true,
        organizations
      });
    }

    // Get specific organization data
    multiTenantService.setCurrentOrganization(organizationId);
    
    const [organization, departments, employees, kpis, stats] = await Promise.all([
      multiTenantService.getOrganization(organizationId),
      multiTenantService.getDepartments(),
      multiTenantService.getEmployees(),
      multiTenantService.getKpis(),
      multiTenantService.getOrganizationStats()
    ]);

    return NextResponse.json({
      success: true,
      organization,
      departments,
      employees,
      kpis,
      stats
    });

  } catch (error) {
    console.error('Get organization data error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to get organization data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
