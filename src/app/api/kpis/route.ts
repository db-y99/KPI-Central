import { NextRequest } from 'next/server';
import { withSecurity, createSuccessResponse, createErrorResponse, defaultRateLimit, logApiAccess } from '@/lib/api-security';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, orderBy, limit, startAfter } from 'firebase/firestore';

// KPI Management API
async function handleGetKPIs(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'get-kpis');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const department = searchParams.get('department');
    const status = searchParams.get('status');

    let q = query(collection(db, 'kpis'), orderBy('createdAt', 'desc'));

    // Apply filters
    if (department) {
      q = query(q, where('department', '==', department));
    }
    if (status) {
      q = query(q, where('status', '==', status));
    }

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    if (startIndex > 0) {
      // In a real implementation, you would use startAfter with document snapshots
      // For now, we'll limit the results
      q = query(q, limit(pageSize));
    } else {
      q = query(q, limit(pageSize));
    }

    const querySnapshot = await getDocs(q);
    const kpis = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return createSuccessResponse({
      kpis,
      pagination: {
        page,
        pageSize,
        total: kpis.length, // In real implementation, get total count separately
        hasMore: kpis.length === pageSize
      }
    }, 'KPIs retrieved successfully');

  } catch (error) {
    console.error('Get KPIs error:', error);
    return createErrorResponse('Failed to retrieve KPIs', 500);
  }
}

async function handleCreateKPI(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'create-kpi');
    
    if (user?.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const body = await request.json();
    const { name, description, department, weight, target, unit, frequency } = body;

    if (!name || !department || !weight || !target) {
      return createErrorResponse('Required fields missing', 400);
    }

    const kpiData = {
      name,
      description: description || '',
      department,
      weight: parseFloat(weight),
      target: parseFloat(target),
      unit: unit || '',
      frequency: frequency || 'monthly',
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'kpis'), kpiData);

    return createSuccessResponse({
      id: docRef.id,
      ...kpiData
    }, 'KPI created successfully');

  } catch (error) {
    console.error('Create KPI error:', error);
    return createErrorResponse('Failed to create KPI', 500);
  }
}

async function handleUpdateKPI(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'update-kpi');
    
    if (user?.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const kpiId = searchParams.get('id');

    if (!kpiId) {
      return createErrorResponse('KPI ID required', 400);
    }

    const body = await request.json();
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid
    };

    await updateDoc(doc(db, 'kpis', kpiId), updateData);

    return createSuccessResponse({}, 'KPI updated successfully');

  } catch (error) {
    console.error('Update KPI error:', error);
    return createErrorResponse('Failed to update KPI', 500);
  }
}

async function handleDeleteKPI(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'delete-kpi');
    
    if (user?.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const kpiId = searchParams.get('id');

    if (!kpiId) {
      return createErrorResponse('KPI ID required', 400);
    }

    await deleteDoc(doc(db, 'kpis', kpiId));

    return createSuccessResponse({}, 'KPI deleted successfully');

  } catch (error) {
    console.error('Delete KPI error:', error);
    return createErrorResponse('Failed to delete KPI', 500);
  }
}

// Export handlers with security
export const GET = withSecurity(handleGetKPIs, {
  requireAuth: true,
  rateLimit: defaultRateLimit
});

export const POST = withSecurity(handleCreateKPI, {
  requireAuth: true,
  requireRole: 'admin',
  rateLimit: defaultRateLimit
});

export const PUT = withSecurity(handleUpdateKPI, {
  requireAuth: true,
  requireRole: 'admin',
  rateLimit: defaultRateLimit
});

export const DELETE = withSecurity(handleDeleteKPI, {
  requireAuth: true,
  requireRole: 'admin',
  rateLimit: defaultRateLimit
});
