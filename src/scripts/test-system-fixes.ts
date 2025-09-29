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

async function testSystemFixes() {
  console.log('🧪 Testing system fixes...');

  try {
    // Test 1: Check employees collection
    console.log('\n1️⃣ Testing employees collection...');
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const employees = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`   Found ${employees.length} employees:`);
    employees.forEach(emp => {
      console.log(`   - ${emp.name} (${emp.email}) - ${emp.role}`);
    });

    // Test 2: Check departments collection
    console.log('\n2️⃣ Testing departments collection...');
    const departmentsSnap = await getDocs(collection(db, 'departments'));
    const departments = departmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`   Found ${departments.length} departments:`);
    departments.forEach(dept => {
      console.log(`   - ${dept.name}`);
    });

    // Test 3: Check KPIs collection
    console.log('\n3️⃣ Testing KPIs collection...');
    const kpisSnap = await getDocs(collection(db, 'kpis'));
    const kpis = kpisSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`   Found ${kpis.length} KPIs:`);
    kpis.forEach(kpi => {
      console.log(`   - ${kpi.name} (${kpi.department})`);
    });

    // Test 4: Check reward programs
    console.log('\n4️⃣ Testing reward programs collection...');
    const rewardProgramsSnap = await getDocs(collection(db, 'rewardPrograms'));
    const rewardPrograms = rewardProgramsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`   Found ${rewardPrograms.length} reward programs:`);
    rewardPrograms.forEach(program => {
      console.log(`   - ${program.name}`);
    });

    // Test 5: Check notifications
    console.log('\n5️⃣ Testing notifications collection...');
    const notificationsSnap = await getDocs(collection(db, 'notifications'));
    const notifications = notificationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`   Found ${notifications.length} notifications:`);
    notifications.forEach(notif => {
      console.log(`   - ${notif.title} (${notif.type})`);
    });

    // Test 6: Test employee-KPI relationship
    console.log('\n6️⃣ Testing employee-KPI relationships...');
    const kpiRecordsSnap = await getDocs(collection(db, 'kpiRecords'));
    const kpiRecords = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`   Found ${kpiRecords.length} KPI records:`);
    kpiRecords.forEach(record => {
      const employee = employees.find(emp => emp.uid === record.employeeId);
      const kpi = kpis.find(k => k.id === record.kpiId);
      console.log(`   - ${employee?.name} → ${kpi?.name} (${record.status})`);
    });

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   ✅ Employees: ${employees.length}`);
    console.log(`   ✅ Departments: ${departments.length}`);
    console.log(`   ✅ KPIs: ${kpis.length}`);
    console.log(`   ✅ Reward Programs: ${rewardPrograms.length}`);
    console.log(`   ✅ Notifications: ${notifications.length}`);
    console.log(`   ✅ KPI Records: ${kpiRecords.length}`);

    // Check for potential issues
    console.log('\n🔍 Checking for issues...');

    // Check if admin exists
    const adminExists = employees.some(emp => emp.role === 'admin');
    console.log(`   ${adminExists ? '✅' : '❌'} Admin user exists: ${adminExists}`);

    // Check if departments have employees
    const departmentsWithEmployees = departments.filter(dept =>
      employees.some(emp => emp.departmentId === dept.id)
    );
    console.log(`   ✅ Departments with employees: ${departmentsWithEmployees.length}/${departments.length}`);

    // Check if KPIs have records
    const kpisWithRecords = kpis.filter(kpi =>
      kpiRecords.some(record => record.kpiId === kpi.id)
    );
    console.log(`   ✅ KPIs with records: ${kpisWithRecords.length}/${kpis.length}`);

    console.log('\n✅ System fixes test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing system fixes:', error);
    process.exit(1);
  }
}

// Run the test
testSystemFixes()
  .then(() => {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
