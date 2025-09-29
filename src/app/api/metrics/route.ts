import { NextRequest } from 'next/server';
import { withSecurity, createSuccessResponse, createErrorResponse, defaultRateLimit, logApiAccess } from '@/lib/api-security';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, orderBy, limit } from 'firebase/firestore';

// Metrics API
async function handleGetMetrics(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'get-metrics');
    
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const kpiId = searchParams.get('kpiId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    let q = query(collection(db, 'metrics'), orderBy('createdAt', 'desc'));

    // Apply filters
    if (employeeId) {
      q = query(q, where('employeeId', '==', employeeId));
    }
    if (kpiId) {
      q = query(q, where('kpiId', '==', kpiId));
    }
    if (month) {
      q = query(q, where('month', '==', parseInt(month)));
    }
    if (year) {
      q = query(q, where('year', '==', parseInt(year)));
    }

    // Check access permissions
    if (user?.role === 'employee' && employeeId && user.uid !== employeeId) {
      return createErrorResponse('Access denied', 403);
    }

    // Apply pagination
    q = query(q, limit(pageSize));

    const querySnapshot = await getDocs(q);
    const metrics = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return createSuccessResponse({
      metrics,
      pagination: {
        page,
        pageSize,
        total: metrics.length,
        hasMore: metrics.length === pageSize
      }
    }, 'Metrics retrieved successfully');

  } catch (error) {
    console.error('Get metrics error:', error);
    return createErrorResponse('Failed to retrieve metrics', 500);
  }
}

async function handleCreateMetric(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'create-metric');
    
    const body = await request.json();
    const { kpiId, value, month, year, notes } = body;

    if (!kpiId || value === undefined || !month || !year) {
      return createErrorResponse('Required fields missing', 400);
    }

    // Check if user can create metrics for this KPI
    const kpiDoc = await getDoc(doc(db, 'kpis', kpiId));
    if (!kpiDoc.exists()) {
      return createErrorResponse('KPI not found', 404);
    }

    const kpiData = kpiDoc.data();
    
    // Check if employee can submit metrics for this KPI
    if (user?.role === 'employee' && kpiData.department !== user.department) {
      return createErrorResponse('Access denied', 403);
    }

    // Check if metric already exists for this period
    const existingMetricQuery = query(
      collection(db, 'metrics'),
      where('kpiId', '==', kpiId),
      where('employeeId', '==', user.uid),
      where('month', '==', parseInt(month)),
      where('year', '==', parseInt(year))
    );
    const existingMetricSnapshot = await getDocs(existingMetricQuery);
    
    if (!existingMetricSnapshot.empty) {
      return createErrorResponse('Metric already exists for this period', 409);
    }

    const metricData = {
      kpiId,
      employeeId: user.uid,
      value: parseFloat(value),
      month: parseInt(month),
      year: parseInt(year),
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'metrics'), metricData);

    return createSuccessResponse({
      id: docRef.id,
      ...metricData
    }, 'Metric created successfully');

  } catch (error) {
    console.error('Create metric error:', error);
    return createErrorResponse('Failed to create metric', 500);
  }
}

async function handleUpdateMetric(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'update-metric');
    
    const { searchParams } = new URL(request.url);
    const metricId = searchParams.get('id');

    if (!metricId) {
      return createErrorResponse('Metric ID required', 400);
    }

    const metricDoc = await getDoc(doc(db, 'metrics', metricId));
    if (!metricDoc.exists()) {
      return createErrorResponse('Metric not found', 404);
    }

    const metricData = metricDoc.data();
    
    // Check if user can update this metric
    if (user?.role === 'employee' && metricData.employeeId !== user.uid) {
      return createErrorResponse('Access denied', 403);
    }

    const body = await request.json();
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid
    };

    await updateDoc(doc(db, 'metrics', metricId), updateData);

    return createSuccessResponse({}, 'Metric updated successfully');

  } catch (error) {
    console.error('Update metric error:', error);
    return createErrorResponse('Failed to update metric', 500);
  }
}

// Performance Dashboard API
async function handleGetDashboardData(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'get-dashboard-data');
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const month = searchParams.get('month') || new Date().getMonth() + 1;
    const year = searchParams.get('year') || new Date().getFullYear();

    // Get KPIs
    let kpiQuery = query(collection(db, 'kpis'), where('status', '==', 'active'));
    if (department) {
      kpiQuery = query(kpiQuery, where('department', '==', department));
    }
    const kpiSnapshot = await getDocs(kpiQuery);
    const kpis = kpiSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get metrics for the period
    let metricQuery = query(
      collection(db, 'metrics'),
      where('month', '==', parseInt(month)),
      where('year', '==', parseInt(year))
    );
    const metricSnapshot = await getDocs(metricQuery);
    const metrics = metricSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate performance statistics
    const totalKPIs = kpis.length;
    const completedMetrics = metrics.length;
    const completionRate = totalKPIs > 0 ? (completedMetrics / totalKPIs) * 100 : 0;

    // Calculate average performance
    const validMetrics = metrics.filter(m => m.value !== null && m.value !== undefined);
    const averagePerformance = validMetrics.length > 0 
      ? validMetrics.reduce((sum, m) => sum + m.value, 0) / validMetrics.length 
      : 0;

    // Get department performance if admin
    let departmentStats = null;
    if (user?.role === 'admin') {
      const departmentsQuery = query(collection(db, 'employees'), where('role', '==', 'employee'));
      const departmentsSnapshot = await getDocs(departmentsQuery);
      const employees = departmentsSnapshot.docs.map(doc => doc.data());
      
      const departmentGroups = employees.reduce((acc, emp) => {
        const dept = emp.department || 'Unknown';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(emp);
        return acc;
      }, {} as Record<string, any[]>);

      departmentStats = Object.keys(departmentGroups).map(dept => ({
        department: dept,
        employeeCount: departmentGroups[dept].length,
        // Add more department-specific metrics here
      }));
    }

    return createSuccessResponse({
      summary: {
        totalKPIs,
        completedMetrics,
        completionRate: Math.round(completionRate * 100) / 100,
        averagePerformance: Math.round(averagePerformance * 100) / 100,
        period: { month: parseInt(month), year: parseInt(year) }
      },
      kpis,
      metrics,
      departmentStats
    }, 'Dashboard data retrieved successfully');

  } catch (error) {
    console.error('Get dashboard data error:', error);
    return createErrorResponse('Failed to retrieve dashboard data', 500);
  }
}

// Export handlers with security
export const GET = withSecurity(handleGetMetrics, {
  requireAuth: true,
  rateLimit: defaultRateLimit
});

export const POST = withSecurity(handleCreateMetric, {
  requireAuth: true,
  rateLimit: defaultRateLimit
});

export const PUT = withSecurity(handleUpdateMetric, {
  requireAuth: true,
  rateLimit: defaultRateLimit
});

// Dashboard endpoint
export async function PATCH(request: NextRequest) {
  return withSecurity(handleGetDashboardData, {
    requireAuth: true,
    rateLimit: defaultRateLimit
  })(request);
}
