import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

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

async function createTestUser() {
  try {
    console.log('🔐 Creating test user...');
    
    const email = 'test@y99.vn';
    const password = 'test123456';
    
    // Try to create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Test user created successfully:', userCredential.user.uid);
    
    // Sign out
    await auth.signOut();
    
    // Try to sign in
    console.log('🔐 Testing login...');
    const signInResult = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Login successful:', signInResult.user.uid);
    
    await auth.signOut();
    console.log('✅ Test completed successfully');
    
  } catch (error: any) {
    console.error('❌ Error:', error.code, error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ User already exists, testing login...');
      try {
        const signInResult = await signInWithEmailAndPassword(auth, 'test@y99.vn', 'test123456');
        console.log('✅ Login successful:', signInResult.user.uid);
        await auth.signOut();
      } catch (signInError: any) {
        console.error('❌ Login failed:', signInError.code, signInError.message);
      }
    }
  }
}

// Run the function
createTestUser().then(() => {
  console.log('🎉 Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});

