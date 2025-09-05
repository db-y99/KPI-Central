'use server';

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// This is a temporary, insecure way to store service account credentials.
// In a production app, use a secure secret management service.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const auth = getAuth();
const db = getFirestore();

interface CreateUserParams {
  email: string;
  password?: string;
  name: string;
  position: string;
  departmentId: string;
  role: 'admin' | 'employee';
}

export async function createUser(userData: CreateUserParams) {
  try {
    // 1. Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.name,
      disabled: false,
    });

    const nextIdNumber =
      (await db.collection('employees').count().get()).data().count + 1;

    // 2. Create corresponding employee document in Firestore
    const employeeData = {
      id: `e${nextIdNumber}`, // Legacy ID, might still be useful
      name: userData.name,
      position: userData.position,
      departmentId: userData.departmentId,
      role: userData.role,
      email: userData.email,
      avatar: `https://picsum.photos/seed/${userRecord.uid}/100/100`,
    };

    // Use the Auth UID as the document ID in Firestore
    await db.collection('employees').doc(userRecord.uid).set(employeeData);

    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    console.error('Error creating user:', error);
    // It's good practice to delete the auth user if firestore write fails
    if (error.uid) {
      await auth.deleteUser(error.uid);
    }
    return { success: false, error: error.message };
  }
}
