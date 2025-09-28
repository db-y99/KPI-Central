'use server';

// Dynamic import approach to avoid bundling issues
let auth: any = null;
let db: any = null;

async function initializeFirebaseAdmin() {
  try {
    // Dynamic imports to avoid bundling issues
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');
    const { getFirestore } = await import('firebase-admin/firestore');

    // This is a temporary, insecure way to store service account credentials.
    // In a production app, use a secure secret management service.
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID || 'kpi-central-1kjf8',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'default@kpi-central-1kjf8.iam.gserviceaccount.com',
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || 'dummy-key',
    };

    // Only initialize if we have valid credentials
    if (getApps().length === 0 && serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey !== 'dummy-key') {
      try {
        initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (error) {
        console.warn('Firebase Admin SDK initialization failed:', error);
        return false;
      }
    }

    // Initialize Firebase Admin services
    auth = getAuth();
    db = getFirestore();
    return true;
  } catch (error) {
    console.warn('Firebase Admin SDK not available:', error);
    return false;
  }
}

interface CreateUserParams {
  email: string;
  username: string;
  password?: string;
  confirmPassword?: string;
  name: string;
  position: string;
  departmentId: string;
  role: 'admin' | 'employee';
  phone?: string;
  address?: string;
  startDate: string;
  employeeId: string;
}

export async function createUserAction(userData: CreateUserParams) {
  try {
    // Initialize Firebase Admin SDK dynamically
    const isInitialized = await initializeFirebaseAdmin();

    // Check if Firebase Admin services are available
    if (!isInitialized || !auth || !db) {
      // Fallback: Create user using Firebase Client SDK
      console.warn('Firebase Admin SDK not available, using client SDK for user creation');
      
      // Import Firebase client SDK
      const { auth: clientAuth } = await import('@/lib/firebase');
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { db: clientDb } = await import('@/lib/firebase');
      const { doc, setDoc, collection, getDocs } = await import('firebase/firestore');
      
      // Check if username already exists
      const usernameQuery = await getDocs(collection(clientDb, 'employees'));
      const existingEmployees = usernameQuery.docs.map(doc => doc.data());
      
      if (existingEmployees.some(emp => emp.username === userData.username)) {
        return { success: false, error: 'Tên đăng nhập đã tồn tại' };
      }
      
      if (existingEmployees.some(emp => emp.employeeId === userData.employeeId)) {
        return { success: false, error: 'Mã nhân viên đã tồn tại' };
      }

      // Create user in Firebase Auth using client SDK
      const userCredential = await createUserWithEmailAndPassword(
        clientAuth, 
        userData.email, 
        userData.password!
      );
      const firebaseUser = userCredential.user;

      // Create employee document in Firestore
      const employeeData = {
        id: `e${existingEmployees.length + 1}`,
        uid: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        username: userData.username,
        position: userData.position,
        departmentId: userData.departmentId,
        role: userData.role,
        phone: userData.phone || '',
        startDate: userData.startDate,
        employeeId: userData.employeeId,
        avatar: `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(clientDb, 'employees', firebaseUser.uid), employeeData);

      return {
        success: true,
        uid: firebaseUser.uid,
        message: `Tài khoản nhân viên ${userData.name} đã được tạo thành công!`
      };
    }

    // Validate password confirmation
    if (userData.password !== userData.confirmPassword) {
      return { success: false, error: 'Mật khẩu xác nhận không khớp' };
    }

    // Check if username already exists
    const usernameQuery = await db.collection('employees')
      .where('username', '==', userData.username)
      .get();

    if (!usernameQuery.empty) {
      return { success: false, error: 'Tên đăng nhập đã tồn tại' };
    }

    // Check if employeeId already exists
    const employeeIdQuery = await db.collection('employees')
      .where('employeeId', '==', userData.employeeId)
      .get();

    if (!employeeIdQuery.empty) {
      return { success: false, error: 'Mã nhân viên đã tồn tại' };
    }

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
      uid: userRecord.uid, // Firebase Auth UID
      name: userData.name,
      email: userData.email,
      username: userData.username,
      position: userData.position,
      departmentId: userData.departmentId,
      role: userData.role,
      phone: userData.phone || '',
      address: userData.address || '',
      startDate: userData.startDate,
      employeeId: userData.employeeId,
      avatar: `https://picsum.photos/seed/${userRecord.uid}/100/100`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Use the Auth UID as the document ID in Firestore
    await db.collection('employees').doc(userRecord.uid).set(employeeData);

    return {
      success: true,
      uid: userRecord.uid,
      message: `Tài khoản nhân viên ${userData.name} đã được tạo thành công!`
    };
  } catch (error: any) {
    console.error('Error creating user:', error);
    // It's good practice to delete the auth user if firestore write fails
    if (error.uid && auth) {
      try {
        await auth.deleteUser(error.uid);
      } catch (deleteError) {
        console.error('Failed to delete user after error:', deleteError);
      }
    }
    return { success: false, error: error.message };
  }
}

export async function deleteUserAction(uid: string) {
  try {
    // Initialize Firebase Admin SDK dynamically
    const isInitialized = await initializeFirebaseAdmin();

    // Check if Firebase Admin services are available
    if (!isInitialized || !auth || !db) {
      return { success: false, error: 'Firebase Admin SDK chưa được cấu hình. Vui lòng thiết lập biến môi trường.' };
    }

    // 1. Delete from Firestore first
    await db.collection('employees').doc(uid).delete();

    // 2. Delete from Firebase Auth
    await auth.deleteUser(uid);

    return {
      success: true,
      message: 'Tài khoản nhân viên đã được xóa thành công!'
    };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
}
