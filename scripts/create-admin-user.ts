import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  projectId: 'kpi-central-1kjf8',
  appId: '1:852984596237:web:b47d9c1694189fe1319244',
  storageBucket: 'kpi-central-1kjf8.firebasestorage.app',
  apiKey: 'AIzaSyAaw3qMdPZD-C2qH9Ik-nTwNKVp-4x0scs',
  authDomain: 'kpi-central-1kjf8.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '852984596237',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin test user...');
    
    const email = 'admin-test@y99.vn';
    const password = 'admin123456';
    
    // Try to create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Admin user created successfully:', userCredential.user.uid);
    
    // Create admin profile in Firestore
    const adminData = {
      id: 'admin-test-1',
      uid: userCredential.user.uid,
      email: email,
      username: 'admin-test',
      name: 'Test Administrator',
      position: 'System Admin',
      departmentId: 'admin',
      avatar: '/avatars/admin.jpg',
      role: 'admin',
      startDate: new Date().toISOString(),
      employeeId: 'ADM001',
      isActive: true,
      phone: '',
      address: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'employees', userCredential.user.uid), adminData);
    console.log('✅ Admin profile saved to Firestore');
    
    // Sign out
    await auth.signOut();
    
    // Try to sign in
    console.log('🔐 Testing admin login...');
    const signInResult = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Admin login successful:', signInResult.user.uid);
    
    await auth.signOut();
    console.log('✅ Admin test completed successfully');
    
  } catch (error: any) {
    console.error('❌ Error:', error.code, error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Admin user already exists, testing login...');
      try {
        const signInResult = await signInWithEmailAndPassword(auth, 'admin-test@y99.vn', 'admin123456');
        console.log('✅ Admin login successful:', signInResult.user.uid);
        await auth.signOut();
      } catch (signInError: any) {
        console.error('❌ Admin login failed:', signInError.code, signInError.message);
      }
    }
  }
}

// Run the function
createAdminUser().then(() => {
  console.log('🎉 Admin script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Admin script failed:', error);
  process.exit(1);
});


