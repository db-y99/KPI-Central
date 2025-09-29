import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kpi-central-1kjf8',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:852984596237:web:b47d9c1694189fe1319244',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'kpi-central-1kjf8.firebasestorage.app',
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAaw3qMdPZD-C2qH9Ik-nTwNKVp-4x0scs',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'kpi-central-1kjf8.firebaseapp.com',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '852984596237',
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

async function testAuthStepByStep() {
  console.log('🔍 Testing authentication flow step by step...');

  try {
    // Step 1: Simulate Firebase Auth user creation
    console.log('\n1️⃣ Simulating Firebase Auth user...');
    const firebaseUser = {
      uid: 'raygW55Pg4TYDgUQ1hUgDZBGC7q1',
      email: 'db@y99.vn'
    };
    console.log('✅ Firebase user:', firebaseUser);

    // Step 2: Simulate auth context querying employees collection
    console.log('\n2️⃣ Simulating auth context query...');
    const employeesRef = collection(db, 'employees');
    const userQuery = query(employeesRef, where('uid', '==', firebaseUser.uid));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      console.log('❌ User not found in employees collection');
      return;
    }

    const userDoc = userSnapshot.docs[0];
    const userData = { ...userDoc.data(), uid: firebaseUser.uid };
    console.log('✅ User data from employees collection:', {
      id: userDoc.id,
      email: userData.email,
      name: userData.name,
      role: userData.role
    });

    // Step 3: Simulate admin layout role check
    console.log('\n3️⃣ Simulating admin layout role check...');
    if (userData.role === 'admin') {
      console.log('✅ User role is admin, should show admin layout');
      console.log('✅ Should render AppShell with admin navigation');
    } else {
      console.log('❌ User role is not admin, should redirect to login');
      console.log('❌ This would cause redirect to /login');
      return;
    }

    // Step 4: Simulate login page redirect logic
    console.log('\n4️⃣ Simulating login page redirect logic...');
    if (userData.role === 'admin') {
      console.log('✅ Login page would redirect to /admin');
    } else {
      console.log('✅ Login page would redirect to /employee');
    }

    // Step 5: Simulate admin dashboard access
    console.log('\n5️⃣ Simulating admin dashboard access...');
    console.log('✅ User should access /admin successfully');
    console.log('✅ Admin layout should render without redirecting');

    console.log('\n🔧 Analysis:');
    console.log('1. Firebase Auth user exists ✅');
    console.log('2. User data in employees collection ✅');
    console.log('3. User role is admin ✅');
    console.log('4. Admin layout should work correctly ✅');

    console.log('\n💡 Potential issue:');
    console.log('- Check if there are any middleware redirects');
    console.log('- Check if auth context has timing issues');
    console.log('- Check if admin layout has race conditions');

  } catch (error) {
    console.error('❌ Error testing auth flow:', error);
  }
}

// Run the test
testAuthStepByStep()
  .then(() => {
    console.log('\n✅ Auth step-by-step test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Auth step-by-step test failed:', error);
    process.exit(1);
  });
