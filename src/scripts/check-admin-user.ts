import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

async function checkAdminUser() {
  console.log('🔍 Checking admin user in database...');

  try {
    // Check employees collection for admin user
    const employeesRef = collection(db, 'employees');
    const adminQuery = query(employeesRef, where('email', '==', 'db@y99.vn'));
    const adminSnapshot = await getDocs(adminQuery);

    if (adminSnapshot.empty) {
      console.log('❌ Admin user not found in employees collection');
      return;
    }

    const adminDoc = adminSnapshot.docs[0];
    const adminData = adminDoc.data();

    console.log('✅ Admin user found:');
    console.log(`   ID: ${adminDoc.id}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Name: ${adminData.name}`);
    console.log(`   Role: ${adminData.role}`);
    console.log(`   Is Active: ${adminData.isActive}`);
    console.log(`   Full data:`, adminData);

    // Check if there's also a user record
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', 'db@y99.vn'));
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      console.log('✅ User record also exists:');
      console.log(`   ID: ${userDoc.id}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Role: ${userData.role}`);
    } else {
      console.log('⚠️ User record not found in users collection');
    }

  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  }
}

// Run the check
checkAdminUser()
  .then(() => {
    console.log('\n✅ Admin user check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Admin user check failed:', error);
    process.exit(1);
  });
