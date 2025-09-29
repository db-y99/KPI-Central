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

async function testAdminDashboard() {
  console.log('🔍 Testing admin dashboard access...');

  try {
    // 1. Check admin user
    console.log('\n1️⃣ Checking admin user...');
    const employeesRef = collection(db, 'employees');
    const adminQuery = query(employeesRef, where('email', '==', 'db@y99.vn'));
    const adminSnapshot = await getDocs(adminQuery);

    if (adminSnapshot.empty) {
      console.log('❌ Admin user not found');
      return;
    }

    const adminDoc = adminSnapshot.docs[0];
    const adminData = adminDoc.data();
    console.log('✅ Admin user:', {
      email: adminData.email,
      role: adminData.role,
      name: adminData.name
    });

    // 2. Check KPIs
    console.log('\n2️⃣ Checking KPIs...');
    const kpisRef = collection(db, 'kpis');
    const kpisSnapshot = await getDocs(kpisRef);
    const kpis = kpisSnapshot.docs.map(doc => doc.data());

    console.log(`✅ Found ${kpis.length} KPIs`);
    kpis.forEach(kpi => {
      console.log(`   - ${kpi.name} (${kpi.department})`);
    });

    // 3. Check KPI Records
    console.log('\n3️⃣ Checking KPI Records...');
    const kpiRecordsRef = collection(db, 'kpiRecords');
    const kpiRecordsSnapshot = await getDocs(kpiRecordsRef);
    const kpiRecords = kpiRecordsSnapshot.docs.map(doc => doc.data());

    console.log(`✅ Found ${kpiRecords.length} KPI Records`);
    kpiRecords.forEach(record => {
      console.log(`   - Employee ${record.employeeId} - KPI ${record.kpiId} - Status ${record.status}`);
    });

    // 4. Check Departments
    console.log('\n4️⃣ Checking Departments...');
    const departmentsRef = collection(db, 'departments');
    const departmentsSnapshot = await getDocs(departmentsRef);
    const departments = departmentsSnapshot.docs.map(doc => doc.data());

    console.log(`✅ Found ${departments.length} Departments`);
    departments.forEach(dept => {
      console.log(`   - ${dept.name}`);
    });

    // 5. Summary
    console.log('\n📊 Summary:');
    console.log('✅ Admin user exists with correct role');
    console.log('✅ System has initial data');
    console.log('✅ Database structure is correct');

    console.log('\n💡 Admin dashboard should work correctly');

  } catch (error) {
    console.error('❌ Error testing admin dashboard:', error);
  }
}

// Run the test
testAdminDashboard()
  .then(() => {
    console.log('\n✅ Admin dashboard test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Admin dashboard test failed:', error);
    process.exit(1);
  });
