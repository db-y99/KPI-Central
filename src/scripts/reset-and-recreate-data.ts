import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, addDoc, writeBatch } from 'firebase/firestore';

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

async function resetAndRecreateData() {
  console.log('🔄 Resetting and recreating system data...');

  try {
    // 1. Clean up existing problematic data
    await cleanupProblematicData();

    // 2. Create clean sample data
    await createCleanSampleData();

    console.log('✅ System data reset and recreated successfully!');

  } catch (error) {
    console.error('❌ Error resetting data:', error);
  }
}

async function cleanupProblematicData() {
  console.log('🧹 Cleaning up problematic data...');

  // Delete all KPI records (they have orphaned references)
  const kpiRecordsRef = collection(db, 'kpiRecords');
  const kpiRecordsSnap = await getDocs(kpiRecordsRef);
  const deletePromises = kpiRecordsSnap.docs.map(doc => deleteDoc(doc.ref));

  await Promise.all(deletePromises);
  console.log(`✅ Deleted ${kpiRecordsSnap.docs.length} KPI records`);

  // Delete orphaned notifications
  const notificationsRef = collection(db, 'notifications');
  const notificationsSnap = await getDocs(notificationsRef);
  const orphanedNotifications = notificationsSnap.docs.filter(doc => {
    const data = doc.data();
    return data.category === 'kpi_assigned' && !data.data?.kpiRecordId;
  });

  const deleteNotificationPromises = orphanedNotifications.map(doc => deleteDoc(doc.ref));
  await Promise.all(deleteNotificationPromises);
  console.log(`✅ Deleted ${orphanedNotifications.length} orphaned notifications`);
}

async function createCleanSampleData() {
  console.log('📊 Creating clean sample data...');

  // Get existing entities
  const [employeesSnap, departmentsSnap, kpisSnap] = await Promise.all([
    getDocs(collection(db, 'employees')),
    getDocs(collection(db, 'departments')),
    getDocs(collection(db, 'kpis'))
  ]);

  const employees = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const departments = departmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const kpis = kpisSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  console.log(`✅ Found ${employees.length} employees, ${departments.length} departments, ${kpis.length} KPIs`);

  // Get non-admin employee for assignments
  const nonAdminEmployee = employees.find(emp => emp.role !== 'admin');
  if (!nonAdminEmployee) {
    console.log('⚠️ No non-admin employee found for KPI assignments');
    return;
  }

  console.log(`✅ Using employee: ${nonAdminEmployee.name} for KPI assignments`);

  // Create clean KPI records
  const batch = writeBatch(db);
  let recordsCreated = 0;

  // Assign 2-3 KPIs to the employee
  const kpisToAssign = kpis.slice(0, 3); // Take first 3 KPIs

  for (const kpi of kpisToAssign) {
    const recordData = {
      kpiId: kpi.id,
      employeeId: nonAdminEmployee.uid,
      period: '2024-Q4',
      target: kpi.target || 100,
      actual: Math.floor(Math.random() * (kpi.target || 100)) + 50,
      status: Math.random() > 0.5 ? 'approved' : 'in_progress',
      startDate: '2024-10-01',
      endDate: '2024-12-31',
      submittedAt: new Date().toISOString(),
      approvedAt: Math.random() > 0.5 ? new Date().toISOString() : null,
      approvedBy: Math.random() > 0.5 ? 'admin' : null,
      notes: `Sample KPI record for ${kpi.name}`,
      submittedReport: `Progress report for ${kpi.name}`,
      approvalComment: Math.random() > 0.5 ? 'Good performance' : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [{
        status: 'in_progress',
        changedAt: new Date().toISOString(),
        changedBy: nonAdminEmployee.uid,
        comment: 'KPI assigned and started'
      }]
    };

    const recordRef = doc(collection(db, 'kpiRecords'));
    batch.set(recordRef, recordData);
    recordsCreated++;

    console.log(`   ✅ Created KPI record: ${nonAdminEmployee.name} → ${kpi.name}`);
  }

  await batch.commit();
  console.log(`✅ Created ${recordsCreated} clean KPI records`);

  // Create notifications for the assignments
  const notificationBatch = writeBatch(db);
  let notificationsCreated = 0;

  for (const kpi of kpisToAssign) {
    const notificationData = {
      userId: nonAdminEmployee.uid,
      title: 'KPI mới được giao',
      message: `Bạn đã được giao KPI "${kpi.name}" với chỉ tiêu ${kpi.target} ${kpi.unit}`,
      type: 'kpi',
      category: 'kpi_assigned',
      isRead: false,
      isImportant: true,
      actionUrl: '/employee/self-update-metrics',
      actionText: 'Cập nhật KPI',
      data: {
        kpiId: kpi.id,
        kpiName: kpi.name,
        target: kpi.target,
        unit: kpi.unit
      },
      createdAt: new Date().toISOString()
    };

    const notificationRef = doc(collection(db, 'notifications'));
    notificationBatch.set(notificationRef, notificationData);
    notificationsCreated++;
  }

  await notificationBatch.commit();
  console.log(`✅ Created ${notificationsCreated} notifications`);
}

// Run the reset and recreate
resetAndRecreateData()
  .then(() => {
    console.log('\n✅ Data reset and recreation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Data reset failed:', error);
    process.exit(1);
  });
