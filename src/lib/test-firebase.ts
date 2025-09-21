'use server';

// Test server action to verify Firebase Admin SDK is working
export async function testFirebaseAdmin() {
  try {
    // Dynamic import to avoid bundling issues
    const { getApps } = await import('firebase-admin/app');
    
    return {
      success: true,
      message: 'Firebase Admin SDK is available',
      appsCount: getApps().length
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Firebase Admin SDK not available'
    };
  }
}

