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

async function checkCurrentData() {
  console.log('🔍 Checking current data in database...');

  try {
    // Check all collections
    const collections = [
      'employees',
      'departments',
      'kpis',
      'kpiRecords',
      'notifications',
      'rewardPrograms',
      'rewardCalculations'
    ];

    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log(`\n📋 ${collectionName.toUpperCase()} (${docs.length} documents):`);
      if (docs.length === 0) {
        console.log('   ❌ No data found');
      } else {
        docs.forEach(doc => {
          console.log(`   ✅ ${doc.name || doc.title || doc.id}: ${JSON.stringify(doc)}`);
        });
      }
    }

    // Check specific data relationships
    console.log('\n🔗 Checking data relationships...');

    const employeesRef = collection(db, 'employees');
    const employeesSnap = await getDocs(employeesRef);
    const employees = employeesSnap.docs.map(doc => doc.data());

    const kpiRecordsRef = collection(db, 'kpiRecords');
    const kpiRecordsSnap = await getDocs(kpiRecordsRef);
    const kpiRecords = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`✅ Employee-KPI relationships:`);
    kpiRecords.forEach(record => {
      const employee = employees.find(emp => emp.uid === record.employeeId);
      if (employee) {
        console.log(`   - ${employee.name} → KPI Record: ${record.status} (Target: ${record.target}, Actual: ${record.actual || 0})`);
      } else {
        console.log(`   - ❌ Orphaned record: Employee ${record.employeeId} not found`);
      }
    });

    console.log('\n✅ Data check completed!');

  } catch (error) {
    console.error('❌ Error checking data:', error);
  }
}

// Run the check
checkCurrentData()
  .then(() => {
    console.log('\n✅ Current data check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Current data check failed:', error);
    process.exit(1);
  });
