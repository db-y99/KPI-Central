import { NextRequest } from 'next/server';
import { withSecurity, createSuccessResponse, createErrorResponse, strictRateLimit, logApiAccess } from '@/lib/api-security';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, addDoc } from 'firebase/firestore';

// System Monitoring API
async function handleGetSystemStats(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'get-system-stats');
    
    if (user?.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    // Get user statistics
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    const users = usersSnapshot.docs.map(doc => doc.data());
    
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const employeeUsers = users.filter(u => u.role === 'employee').length;

    // Get KPI statistics
    const kpisQuery = query(collection(db, 'kpis'));
    const kpisSnapshot = await getDocs(kpisQuery);
    const kpis = kpisSnapshot.docs.map(doc => doc.data());
    
    const totalKPIs = kpis.length;
    const activeKPIs = kpis.filter(k => k.status === 'active').length;

    // Get metrics statistics
    const metricsQuery = query(collection(db, 'metrics'));
    const metricsSnapshot = await getDocs(metricsQuery);
    const metrics = metricsSnapshot.docs.map(doc => doc.data());
    
    const totalMetrics = metrics.length;
    const pendingMetrics = metrics.filter(m => m.status === 'pending').length;
    const approvedMetrics = metrics.filter(m => m.status === 'approved').length;

    // Get department statistics
    const departmentStats = users.reduce((acc, user) => {
      if (user.role === 'employee') {
        const dept = user.department || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Calculate system health score
    const healthScore = Math.round(
      ((activeUsers / totalUsers) * 0.3 + 
       (activeKPIs / totalKPIs) * 0.3 + 
       (approvedMetrics / totalMetrics) * 0.4) * 100
    );

    return createSuccessResponse({
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        employees: employeeUsers
      },
      kpis: {
        total: totalKPIs,
        active: activeKPIs
      },
      metrics: {
        total: totalMetrics,
        pending: pendingMetrics,
        approved: approvedMetrics
      },
      departments: departmentStats,
      systemHealth: {
        score: healthScore,
        status: healthScore >= 80 ? 'excellent' : healthScore >= 60 ? 'good' : 'needs-attention'
      },
      timestamp: new Date().toISOString()
    }, 'System statistics retrieved successfully');

  } catch (error) {
    console.error('Get system stats error:', error);
    return createErrorResponse('Failed to retrieve system statistics', 500);
  }
}

async function handleGetAuditLogs(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'get-audit-logs');
    
    if (user?.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'));

    // Apply filters
    if (action) {
      q = query(q, where('action', '==', action));
    }
    if (userId) {
      q = query(q, where('userId', '==', userId));
    }
    if (startDate) {
      q = query(q, where('timestamp', '>=', startDate));
    }
    if (endDate) {
      q = query(q, where('timestamp', '<=', endDate));
    }

    // Apply pagination
    q = query(q, limit(pageSize));

    const querySnapshot = await getDocs(q);
    const logs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return createSuccessResponse({
      logs,
      pagination: {
        page,
        pageSize,
        total: logs.length,
        hasMore: logs.length === pageSize
      }
    }, 'Audit logs retrieved successfully');

  } catch (error) {
    console.error('Get audit logs error:', error);
    return createErrorResponse('Failed to retrieve audit logs', 500);
  }
}

async function handleCreateAuditLog(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'create-audit-log');
    
    const body = await request.json();
    const { action, details, targetId, targetType } = body;

    if (!action) {
      return createErrorResponse('Action is required', 400);
    }

    const auditLogData = {
      action,
      details: details || '',
      targetId: targetId || null,
      targetType: targetType || null,
      userId: user?.uid || 'system',
      userEmail: user?.email || 'system',
      userRole: user?.role || 'system',
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString()
    };

    await addDoc(collection(db, 'audit_logs'), auditLogData);

    return createSuccessResponse({}, 'Audit log created successfully');

  } catch (error) {
    console.error('Create audit log error:', error);
    return createErrorResponse('Failed to create audit log', 500);
  }
}

async function handleGetPerformanceMetrics(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'get-performance-metrics');
    
    if (user?.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    // Get recent API access logs to calculate performance metrics
    const logsQuery = query(
      collection(db, 'audit_logs'),
      where('action', 'in', ['api-access', 'login-success', 'logout']),
      orderBy('timestamp', 'desc'),
      limit(1000)
    );
    const logsSnapshot = await getDocs(logsQuery);
    const logs = logsSnapshot.docs.map(doc => doc.data());

    // Calculate metrics
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentLogs = logs.filter(log => new Date(log.timestamp) >= last24h);
    const weeklyLogs = logs.filter(log => new Date(log.timestamp) >= last7d);

    const apiCalls24h = recentLogs.filter(log => log.action === 'api-access').length;
    const logins24h = recentLogs.filter(log => log.action === 'login-success').length;
    const logouts24h = recentLogs.filter(log => log.action === 'logout').length;

    // Calculate average response time (mock data for now)
    const avgResponseTime = Math.random() * 200 + 50; // 50-250ms

    // Calculate error rate (mock data for now)
    const errorRate = Math.random() * 5; // 0-5%

    // Calculate uptime (mock data for now)
    const uptime = 99.9 + Math.random() * 0.1; // 99.9-100%

    return createSuccessResponse({
      performance: {
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        uptime: Math.round(uptime * 100) / 100
      },
      activity: {
        apiCalls24h,
        logins24h,
        logouts24h,
        totalLogs24h: recentLogs.length,
        totalLogs7d: weeklyLogs.length
      },
      timestamp: new Date().toISOString()
    }, 'Performance metrics retrieved successfully');

  } catch (error) {
    console.error('Get performance metrics error:', error);
    return createErrorResponse('Failed to retrieve performance metrics', 500);
  }
}

// Export handlers with security
export const GET = withSecurity(handleGetSystemStats, {
  requireAuth: true,
  requireRole: 'admin',
  rateLimit: strictRateLimit
});

export const POST = withSecurity(handleCreateAuditLog, {
  requireAuth: true,
  rateLimit: strictRateLimit
});

// Additional endpoints
export async function PUT(request: NextRequest) {
  return withSecurity(handleGetAuditLogs, {
    requireAuth: true,
    requireRole: 'admin',
    rateLimit: strictRateLimit
  })(request);
}

export async function PATCH(request: NextRequest) {
  return withSecurity(handleGetPerformanceMetrics, {
    requireAuth: true,
    requireRole: 'admin',
    rateLimit: strictRateLimit
  })(request);
}
