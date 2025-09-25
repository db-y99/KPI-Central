import { NextRequest } from 'next/server';
import { withSecurity, createSuccessResponse, createErrorResponse, defaultRateLimit, logApiAccess } from '@/lib/api-security';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, orderBy, limit } from 'firebase/firestore';

// Employee Management API
async function handleGetEmployees(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'get-employees');
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

    // Apply filters
    if (department) {
      q = query(q, where('department', '==', department));
    }
    if (role) {
      q = query(q, where('role', '==', role));
    }

    // Apply pagination
    q = query(q, limit(pageSize));

    const querySnapshot = await getDocs(q);
    const employees = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Remove sensitive data
      const { password, ...safeData } = data;
      return {
        id: doc.id,
        ...safeData
      };
    });

    return createSuccessResponse({
      employees,
      pagination: {
        page,
        pageSize,
        total: employees.length,
        hasMore: employees.length === pageSize
      }
    }, 'Employees retrieved successfully');

  } catch (error) {
    console.error('Get employees error:', error);
    return createErrorResponse('Failed to retrieve employees', 500);
  }
}

async function handleGetEmployee(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'get-employee');
    
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('id');

    if (!employeeId) {
      return createErrorResponse('Employee ID required', 400);
    }

    // Check if user can access this employee's data
    if (user?.role === 'employee' && user.uid !== employeeId) {
      return createErrorResponse('Access denied', 403);
    }

    const employeeDoc = await getDoc(doc(db, 'users', employeeId));
    
    if (!employeeDoc.exists()) {
      return createErrorResponse('Employee not found', 404);
    }

    const data = employeeDoc.data();
    const { password, ...safeData } = data;

    return createSuccessResponse({
      id: employeeDoc.id,
      ...safeData
    }, 'Employee retrieved successfully');

  } catch (error) {
    console.error('Get employee error:', error);
    return createErrorResponse('Failed to retrieve employee', 500);
  }
}

async function handleCreateEmployee(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'create-employee');
    
    if (user?.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const body = await request.json();
    const { email, name, department, role, position, phone } = body;

    if (!email || !name || !department || !role) {
      return createErrorResponse('Required fields missing', 400);
    }

    // Check if email already exists
    const existingUserQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    const existingUserSnapshot = await getDocs(existingUserQuery);
    
    if (!existingUserSnapshot.empty) {
      return createErrorResponse('Email already exists', 409);
    }

    const employeeData = {
      email,
      name,
      department,
      role,
      position: position || '',
      phone: phone || '',
      password: 'default-password', // In real app, generate secure password
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'users'), employeeData);

    const { password, ...safeData } = employeeData;
    return createSuccessResponse({
      id: docRef.id,
      ...safeData
    }, 'Employee created successfully');

  } catch (error) {
    console.error('Create employee error:', error);
    return createErrorResponse('Failed to create employee', 500);
  }
}

async function handleUpdateEmployee(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'update-employee');
    
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('id');

    if (!employeeId) {
      return createErrorResponse('Employee ID required', 400);
    }

    // Check if user can update this employee
    if (user?.role === 'employee' && user.uid !== employeeId) {
      return createErrorResponse('Access denied', 403);
    }

    const body = await request.json();
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid
    };

    // Remove sensitive fields that shouldn't be updated via API
    delete updateData.password;
    delete updateData.role; // Role changes should be done by admin only

    await updateDoc(doc(db, 'users', employeeId), updateData);

    return createSuccessResponse({}, 'Employee updated successfully');

  } catch (error) {
    console.error('Update employee error:', error);
    return createErrorResponse('Failed to update employee', 500);
  }
}

// Export handlers with security
export const GET = withSecurity(handleGetEmployees, {
  requireAuth: true,
  rateLimit: defaultRateLimit
});

export const POST = withSecurity(handleCreateEmployee, {
  requireAuth: true,
  requireRole: 'admin',
  rateLimit: defaultRateLimit
});

export const PUT = withSecurity(handleUpdateEmployee, {
  requireAuth: true,
  rateLimit: defaultRateLimit
});

// Handle individual employee requests
export async function OPTIONS() {
  return new Response(null, { status: 200 });
}
