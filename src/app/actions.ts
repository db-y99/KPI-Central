'use server';

// Simple server action without Firebase Admin SDK
// This file exists to prevent import errors

export async function createUser(data: any) {
  // This is a placeholder function
  // The actual implementation is in src/lib/server-actions.ts
  console.warn('createUser called from placeholder actions.ts - this should not happen');
  return { success: false, error: 'Server action not properly configured' };
}

