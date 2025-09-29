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

async function debugAuthFlow() {
  console.log('🔍 Debugging authentication flow...');

  try {
    // 1. Check admin user in employees collection
    console.log('\n1️⃣ Checking admin user in employees collection...');
    const employeesRef = collection(db, 'employees');
    const adminQuery = query(employeesRef, where('email', '==', 'db@y99.vn'));
    const adminSnapshot = await getDocs(adminQuery);

    if (adminSnapshot.empty) {
      console.log('❌ Admin user not found in employees collection');
      return;
    }

    const adminDoc = adminSnapshot.docs[0];
    const adminData = adminDoc.data();
    console.log('✅ Admin user found:', {
      id: adminDoc.id,
      email: adminData.email,
      name: adminData.name,
      role: adminData.role,
      uid: adminData.uid
    });

    // 2. Check if user record exists in users collection
    console.log('\n2️⃣ Checking user record in users collection...');
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', 'db@y99.vn'));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      console.log('⚠️ User record not found in users collection');
      console.log('💡 This might be the issue - API routes expect users collection but data is in employees');
    } else {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      console.log('✅ User record found:', {
        id: userDoc.id,
        email: userData.email,
        role: userData.role
      });
    }

    // 3. Check if admin user has Firebase Auth UID
    console.log('\n3️⃣ Checking Firebase Auth UID consistency...');
    if (adminData.uid) {
      console.log('✅ Admin user has Firebase Auth UID:', adminData.uid);

      // Try to get the same user by UID
      const userByUid = await getDoc(doc(db, 'employees', adminData.uid));
      if (userByUid.exists()) {
        const uidData = userByUid.data();
        console.log('✅ User data consistent:', {
          email: uidData.email,
          role: uidData.role,
          name: uidData.name
        });
      } else {
        console.log('❌ User not found by UID in employees collection');
      }
    } else {
      console.log('❌ Admin user missing Firebase Auth UID');
    }

    // 4. Check admin dashboard route
    console.log('\n4️⃣ Checking admin dashboard route accessibility...');
    console.log('💡 Admin layout should check: user && user.role === "admin"');
    console.log('💡 If user.role is not "admin", it redirects to /login');
    console.log('💡 Login page then redirects based on role to /admin or /employee');

    console.log('\n🔧 Potential fix:');
    console.log('1. Ensure admin user has role: "admin" ✅');
    console.log('2. Ensure auth context queries correct collection ✅');
    console.log('3. Ensure admin layout checks role correctly ✅');
    console.log('4. Check if there are any middleware redirects');

  } catch (error) {
    console.error('❌ Error debugging auth flow:', error);
  }
}

// Run the debug
debugAuthFlow()
  .then(() => {
    console.log('\n✅ Auth flow debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Auth flow debug failed:', error);
    process.exit(1);
  });
