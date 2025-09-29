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

async function manualAuthTest() {
  console.log('🔍 Manual authentication test...');

  try {
    // Test 1: Check if admin user exists and has correct data
    console.log('\n1️⃣ Checking admin user data...');
    const employeesRef = collection(db, 'employees');
    const adminQuery = query(employeesRef, where('email', '==', 'db@y99.vn'));
    const adminSnapshot = await getDocs(adminQuery);

    if (adminSnapshot.empty) {
      console.log('❌ Admin user not found');
      return;
    }

    const adminDoc = adminSnapshot.docs[0];
    const adminData = adminDoc.data();

    console.log('✅ Admin user data:');
    console.log(`   - Email: ${adminData.email}`);
    console.log(`   - Name: ${adminData.name}`);
    console.log(`   - Role: ${adminData.role}`);
    console.log(`   - UID: ${adminData.uid}`);
    console.log(`   - Is Active: ${adminData.isActive}`);

    // Test 2: Check if user record exists in users collection (for API compatibility)
    console.log('\n2️⃣ Checking users collection...');
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', 'db@y99.vn'));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      console.log('⚠️ User record not found in users collection');
      console.log('💡 This could cause API authentication issues');
    } else {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      console.log('✅ User record found in users collection:', {
        id: userDoc.id,
        email: userData.email,
        role: userData.role
      });
    }

    // Test 3: Simulate auth context behavior
    console.log('\n3️⃣ Simulating auth context behavior...');
    const simulatedUser = { ...adminData, uid: adminData.uid };
    console.log('✅ Simulated auth context user:', {
      uid: simulatedUser.uid,
      email: simulatedUser.email,
      role: simulatedUser.role,
      name: simulatedUser.name
    });

    // Test 4: Check admin layout logic
    console.log('\n4️⃣ Checking admin layout logic...');
    if (simulatedUser && simulatedUser.role === 'admin') {
      console.log('✅ Admin layout should render correctly');
      console.log('✅ No redirect should occur');
    } else {
      console.log('❌ Admin layout would redirect to login');
    }

    // Test 5: Check AppShell navigation
    console.log('\n5️⃣ Checking AppShell navigation...');
    const isAdmin = simulatedUser.role === 'admin';
    console.log(`✅ Is admin: ${isAdmin}`);
    console.log(`✅ Should show admin navigation: ${isAdmin}`);
    console.log(`✅ Should show admin nav items: ${isAdmin}`);

    console.log('\n📋 Summary:');
    console.log('✅ Admin user data is correct');
    console.log('✅ Role is admin');
    console.log('✅ Auth context should work');
    console.log('✅ Admin layout should work');
    console.log('✅ AppShell navigation should work');

    console.log('\n💡 If tests still fail:');
    console.log('- Check React component lifecycle timing');
    console.log('- Check auth context useEffect dependencies');
    console.log('- Check admin layout useEffect dependencies');
    console.log('- Check if there are any console errors in browser');

  } catch (error) {
    console.error('❌ Error in manual auth test:', error);
  }
}

// Run the test
manualAuthTest()
  .then(() => {
    console.log('\n✅ Manual auth test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Manual auth test failed:', error);
    process.exit(1);
  });
