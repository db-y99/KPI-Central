const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kpi-central-1kjf8',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:852984596237:web:b47d9c1694189fe1319244',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'kpi-central-1kjf8.firebasestorage.app',
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAaw3qMdPZD-C2qH9Ik-nTwNKVp-4x0scs',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'kpi-central-1kjf8.firebaseapp.com',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '852984596237',
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

async function debugDataRelationships() {
  console.log('🔍 DEBUGGING DATA RELATIONSHIPS');
  console.log('===============================\n');

  try {
    // Get all collections
    const [employeesSnap, kpiRecordsSnap, kpisSnap, departmentsSnap] = await Promise.all([
      getDocs(collection(db, 'employees')),
      getDocs(collection(db, 'kpiRecords')),
      getDocs(collection(db, 'kpis')),
      getDocs(collection(db, 'departments'))
    ]);

    const employees = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const kpiRecords = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const kpis = kpisSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const departments = departmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`📊 DATA SUMMARY:`);
    console.log(`  Employees: ${employees.length}`);
    console.log(`  KPI Records: ${kpiRecords.length}`);
    console.log(`  KPIs: ${kpis.length}`);
    console.log(`  Departments: ${departments.length}\n`);

    // Check Employee-KPI Record relationships
    console.log('🔗 EMPLOYEE-KPI RECORD RELATIONSHIPS:');
    kpiRecords.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(`  ID: ${record.id}`);
      console.log(`  EmployeeId: ${record.employeeId}`);
      console.log(`  KPI Id: ${record.kpiId}`);

      // Find employee
      const employee = employees.find(emp => {
        // Try different matching strategies
        return emp.uid === record.employeeId ||
               emp.id === record.employeeId ||
               emp.employeeId === record.employeeId;
      });

      if (employee) {
        console.log(`  ✅ Employee Found: ${employee.name} (${employee.uid})`);
      } else {
        console.log(`  ❌ Employee NOT Found for ID: ${record.employeeId}`);
        console.log(`     Available Employee UIDs: ${employees.map(e => e.uid).join(', ')}`);
      }

      // Find KPI
      const kpi = kpis.find(k => k.id === record.kpiId);
      if (kpi) {
        console.log(`  ✅ KPI Found: ${kpi.name}`);
      } else {
        console.log(`  ❌ KPI NOT Found for ID: ${record.kpiId}`);
        console.log(`     Available KPI IDs: ${kpis.map(k => k.id).join(', ')}`);
      }
    });

    // Check Employee-Department relationships
    console.log('\n🏢 EMPLOYEE-DEPARTMENT RELATIONSHIPS:');
    employees.forEach((emp, index) => {
      console.log(`\nEmployee ${index + 1}: ${emp.name}`);
      console.log(`  ID: ${emp.id}`);
      console.log(`  UID: ${emp.uid}`);
      console.log(`  DepartmentId: ${emp.departmentId}`);

      const department = departments.find(dept => dept.id === emp.departmentId);
      if (department) {
        console.log(`  ✅ Department: ${department.name}`);
      } else if (emp.departmentId) {
        console.log(`  ❌ Department NOT Found for ID: ${emp.departmentId}`);
        console.log(`     Available Department IDs: ${departments.map(d => d.id).join(', ')}`);
      } else {
        console.log(`  ⚠️ No Department Assigned`);
      }
    });

    // Check for data inconsistencies
    console.log('\n🔍 DATA INCONSISTENCIES:');

    const issues = [];

    // Check orphaned KPI records
    const orphanedRecords = kpiRecords.filter(record => {
      return !employees.some(emp => emp.uid === record.employeeId || emp.id === record.employeeId);
    });

    if (orphanedRecords.length > 0) {
      issues.push(`❌ ${orphanedRecords.length} KPI records reference non-existent employees`);
    }

    // Check KPI records with invalid KPIs
    const invalidKpiRecords = kpiRecords.filter(record => {
      return !kpis.some(kpi => kpi.id === record.kpiId);
    });

    if (invalidKpiRecords.length > 0) {
      issues.push(`❌ ${invalidKpiRecords.length} KPI records reference non-existent KPIs`);
    }

    // Check employees with invalid departments
    const invalidDeptEmployees = employees.filter(emp => {
      return emp.departmentId && !departments.some(dept => dept.id === emp.departmentId);
    });

    if (invalidDeptEmployees.length > 0) {
      issues.push(`❌ ${invalidDeptEmployees.length} employees reference non-existent departments`);
    }

    if (issues.length === 0) {
      console.log('✅ No data inconsistencies found');
    } else {
      issues.forEach(issue => console.log(issue));
    }

    console.log('\n✅ RELATIONSHIP DEBUG COMPLETED');

  } catch (error) {
    console.error('❌ Error debugging relationships:', error.message);
  }
}

debugDataRelationships();
