import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, writeBatch } from 'firebase/firestore';

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

async function fixDataRelationships() {
  console.log('🔧 Fixing data relationships...');

  try {
    // 1. Assign employees to departments
    await assignEmployeesToDepartments();

    // 2. Fix orphaned KPI records
    await fixOrphanedKpiRecords();

    // 3. Validate data integrity
    await validateDataIntegrity();

    console.log('✅ Data relationships fixed!');

  } catch (error) {
    console.error('❌ Error fixing data relationships:', error);
  }
}

async function assignEmployeesToDepartments() {
  console.log('👥 Assigning employees to departments...');

  const employeesRef = collection(db, 'employees');
  const departmentsRef = collection(db, 'departments');

  const [employeesSnap, departmentsSnap] = await Promise.all([
    getDocs(employeesRef),
    getDocs(departmentsRef)
  ]);

  const employees = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const departments = departmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const batch = writeBatch(db);
  let updates = 0;

  for (const employee of employees) {
    // Skip admin users for department assignment
    if (employee.role === 'admin') {
      console.log(`   ⏭️ Skipping admin user: ${employee.name}`);
      continue;
    }

    if (!employee.departmentId) {
      // Assign to first available department
      const availableDept = departments.find(dept => dept.name !== 'Admin');
      if (availableDept) {
        batch.update(doc(db, 'employees', employee.id), {
          departmentId: availableDept.id,
          updatedAt: new Date().toISOString()
        });
        updates++;
        console.log(`   ✅ Assigned ${employee.name} to ${availableDept.name}`);
      }
    }
  }

  if (updates > 0) {
    await batch.commit();
    console.log(`✅ Updated ${updates} employee department assignments`);
  } else {
    console.log('✅ All employees already have department assignments');
  }
}

async function fixOrphanedKpiRecords() {
  console.log('📊 Fixing orphaned KPI records...');

  const [employeesSnap, kpisSnap, kpiRecordsSnap] = await Promise.all([
    getDocs(collection(db, 'employees')),
    getDocs(collection(db, 'kpis')),
    getDocs(collection(db, 'kpiRecords'))
  ]);

  const employees = employeesSnap.docs.map(doc => doc.data());
  const kpis = kpisSnap.docs.map(doc => doc.data());
  const kpiRecords = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const batch = writeBatch(db);
  let fixes = 0;

  for (const record of kpiRecords) {
    const employee = employees.find(emp => emp.uid === record.employeeId);
    const kpi = kpis.find(k => k.id === record.kpiId);

    if (!employee) {
      console.log(`   ⚠️ Orphaned record: No employee found for ${record.employeeId}`);
      // Mark as deleted
      batch.update(doc(db, 'kpiRecords', record.id), {
        isDeleted: true,
        deletedAt: new Date().toISOString()
      });
      fixes++;
    } else if (!kpi) {
      console.log(`   ⚠️ Orphaned record: No KPI found for ${record.kpiId}`);
      // Mark as deleted
      batch.update(doc(db, 'kpiRecords', record.id), {
        isDeleted: true,
        deletedAt: new Date().toISOString()
      });
      fixes++;
    } else {
      // Validate and fix record data
      if (record.target <= 0) {
        console.log(`   ⚠️ Invalid target for record ${record.id}, setting to 1`);
        batch.update(doc(db, 'kpiRecords', record.id), {
          target: 1,
          updatedAt: new Date().toISOString()
        });
        fixes++;
      }
    }
  }

  if (fixes > 0) {
    await batch.commit();
    console.log(`✅ Fixed ${fixes} orphaned/problematic records`);
  } else {
    console.log('✅ No orphaned records found');
  }
}

async function validateDataIntegrity() {
  console.log('🔍 Validating data integrity...');

  const [employeesSnap, departmentsSnap, kpisSnap, kpiRecordsSnap] = await Promise.all([
    getDocs(collection(db, 'employees')),
    getDocs(collection(db, 'departments')),
    getDocs(collection(db, 'kpis')),
    getDocs(collection(db, 'kpiRecords'))
  ]);

  const employees = employeesSnap.docs.map(doc => doc.data());
  const departments = departmentsSnap.docs.map(doc => doc.data());
  const kpis = kpisSnap.docs.map(doc => doc.data());
  const kpiRecords = kpiRecordsSnap.docs.map(doc => doc.data());

  // Filter active records only
  const activeRecords = kpiRecords.filter(record => !record.isDeleted);

  console.log(`✅ Active KPI records: ${activeRecords.length}`);

  // Check data integrity
  const validRecords = activeRecords.filter(record => {
    const employee = employees.find(emp => emp.uid === record.employeeId);
    const kpi = kpis.find(k => k.id === record.kpiId);
    const department = employee ? departments.find(d => d.id === employee.departmentId) : null;

    return employee && kpi && department && record.target > 0;
  });

  const integrityScore = activeRecords.length > 0 ? (validRecords.length / activeRecords.length) * 100 : 100;

  console.log(`✅ Data integrity score: ${integrityScore.toFixed(1)}% (${validRecords.length}/${activeRecords.length})`);

  if (integrityScore < 100) {
    console.log('⚠️ Data integrity issues found:');
    activeRecords.forEach(record => {
      const employee = employees.find(emp => emp.uid === record.employeeId);
      const kpi = kpis.find(k => k.id === record.kpiId);

      if (!employee) {
        console.log(`   - Record ${record.id}: Missing employee ${record.employeeId}`);
      }
      if (!kpi) {
        console.log(`   - Record ${record.id}: Missing KPI ${record.kpiId}`);
      }
      if (record.target <= 0) {
        console.log(`   - Record ${record.id}: Invalid target ${record.target}`);
      }
    });
  } else {
    console.log('✅ Perfect data integrity!');
  }
}

// Run the fix
fixDataRelationships()
  .then(() => {
    console.log('\n✅ Data relationships fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Data relationships fix failed:', error);
    process.exit(1);
  });
