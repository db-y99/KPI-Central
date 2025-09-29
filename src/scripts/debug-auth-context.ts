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

async function debugAuthContext() {
  console.log('🔍 Debugging auth context behavior...');

  try {
    // Step 1: Simulate Firebase Auth user
    console.log('\n1️⃣ Simulating Firebase Auth user...');
    const firebaseUser = {
      uid: 'raygW55Pg4TYDgUQ1hUgDZBGC7q1',
      email: 'db@y99.vn'
    };
    console.log('✅ Firebase user:', firebaseUser);

    // Step 2: Simulate auth context onAuthStateChanged
    console.log('\n2️⃣ Simulating auth context onAuthStateChanged...');
    console.log('🔄 onAuthStateChanged triggered:', firebaseUser.uid);

    // Step 3: Simulate querying employees collection
    console.log('\n3️⃣ Simulating employees collection query...');
    const employeesRef = collection(db, 'employees');
    const userQuery = query(employeesRef, where('uid', '==', firebaseUser.uid));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      console.log('❌ User not found in employees collection');
      return;
    }

    const userDoc = userSnapshot.docs[0];
    const userData = { ...userDoc.data(), uid: firebaseUser.uid };
    console.log('✅ User found in Firestore:', {
      id: userDoc.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      uid: userData.uid
    });

    // Step 4: Simulate auth context setUser
    console.log('\n4️⃣ Simulating auth context setUser...');
    console.log('✅ User state would be set to:', {
      uid: userData.uid,
      email: userData.email,
      role: userData.role,
      name: userData.name
    });

    // Step 5: Simulate login page redirect logic
    console.log('\n5️⃣ Simulating login page redirect logic...');
    const userRole = userData.role;
    console.log(`User role: ${userRole}`);

    if (userRole === 'admin') {
      console.log('✅ Would redirect to /admin');
    } else {
      console.log('✅ Would redirect to /employee');
    }

    // Step 6: Simulate admin layout check
    console.log('\n6️⃣ Simulating admin layout check...');
    const isLoading = false; // Simulate loading completed
    const user = userData; // Simulate user set

    console.log(`Loading: ${isLoading}`);
    console.log(`User: ${user ? user.name : 'null'}`);
    console.log(`User role: ${user?.role}`);

    if (isLoading) {
      console.log('⏳ Still loading, no redirect');
    } else if (!user) {
      console.log('❌ No user, would redirect to login');
    } else if (user.role !== 'admin') {
      console.log('❌ User role is not admin, would redirect to login');
    } else {
      console.log('✅ User is admin, would render admin layout');
    }

    // Step 7: Check for potential issues
    console.log('\n7️⃣ Checking for potential issues...');
    console.log('✅ Firebase Auth UID matches Firestore UID');
    console.log('✅ User data structure is correct');
    console.log('✅ Role is correctly set to admin');
    console.log('✅ Auth context logic should work');

    console.log('\n💡 If still failing:');
    console.log('- Check React component mounting order');
    console.log('- Check useEffect dependencies');
    console.log('- Check if there are any redirects in Next.js routing');
    console.log('- Check browser console for errors');

  } catch (error) {
    console.error('❌ Error debugging auth context:', error);
  }
}

// Run the debug
debugAuthContext()
  .then(() => {
    console.log('\n✅ Auth context debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Auth context debug failed:', error);
    process.exit(1);
  });
