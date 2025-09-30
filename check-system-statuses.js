const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function checkSystemStatuses() {
  console.log('🔍 CHECKING SYSTEM STATUSES');
  console.log('============================\n');

  try {
    // Check KPI Records Status Distribution
    console.log('📊 KPI RECORDS STATUS DISTRIBUTION:');
    const kpiRecordsRef = collection(db, 'kpiRecords');
    const kpiRecordsSnap = await getDocs(kpiRecordsRef);
    const kpiRecords = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const statusCounts = {};
    kpiRecords.forEach(record => {
      statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;
    });

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} records`);
    });

    // Check Employee Status
    console.log('\n👥 EMPLOYEE STATUS DISTRIBUTION:');
    const employeesRef = collection(db, 'employees');
    const employeesSnap = await getDocs(employeesRef);
    const employees = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const employeeStatusCounts = {};
    employees.forEach(emp => {
      employeeStatusCounts[emp.isActive ? 'active' : 'inactive'] = (employeeStatusCounts[emp.isActive ? 'active' : 'inactive'] || 0) + 1;
    });

    Object.entries(employeeStatusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} employees`);
    });

    // Check Department Status
    console.log('\n🏢 DEPARTMENT STATUS DISTRIBUTION:');
    const departmentsRef = collection(db, 'departments');
    const departmentsSnap = await getDocs(departmentsRef);
    const departments = departmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const deptStatusCounts = {};
    departments.forEach(dept => {
      deptStatusCounts[dept.isActive ? 'active' : 'inactive'] = (deptStatusCounts[dept.isActive ? 'active' : 'inactive'] || 0) + 1;
    });

    Object.entries(deptStatusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} departments`);
    });

    // Check Notifications Status
    console.log('\n🔔 NOTIFICATIONS STATUS DISTRIBUTION:');
    const notificationsRef = collection(db, 'notifications');
    const notificationsSnap = await getDocs(notificationsRef);
    const notifications = notificationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const notificationStatusCounts = {
      read: 0,
      unread: 0,
      important: 0,
      normal: 0
    };

    notifications.forEach(notif => {
      if (notif.isRead) {
        notificationStatusCounts.read++;
      } else {
        notificationStatusCounts.unread++;
      }

      if (notif.isImportant) {
        notificationStatusCounts.important++;
      } else {
        notificationStatusCounts.normal++;
      }
    });

    console.log(`  Read: ${notificationStatusCounts.read} notifications`);
    console.log(`  Unread: ${notificationStatusCounts.unread} notifications`);
    console.log(`  Important: ${notificationStatusCounts.important} notifications`);
    console.log(`  Normal: ${notificationStatusCounts.normal} notifications`);

    // Check Sample Records for Status Transitions
    console.log('\n🔄 SAMPLE STATUS DETAILS:');

    if (kpiRecords.length > 0) {
      console.log('\nKPI Records:');
      kpiRecords.slice(0, 3).forEach((record, index) => {
        console.log(`  Record ${index + 1}:`);
        console.log(`    ID: ${record.id}`);
        console.log(`    Status: ${record.status}`);
        console.log(`    Employee: ${record.employeeName || 'Unknown'}`);
        console.log(`    KPI: ${record.kpiName || 'Unknown'}`);
        console.log(`    Progress: ${record.progress || 0}%`);
        console.log(`    Updated: ${record.updatedAt ? new Date(record.updatedAt).toLocaleString() : 'Never'}`);
        console.log('---');
      });
    }

    if (employees.length > 0) {
      console.log('\nEmployees:');
      employees.slice(0, 3).forEach((emp, index) => {
        console.log(`  Employee ${index + 1}:`);
        console.log(`    ID: ${emp.id}`);
        console.log(`    Name: ${emp.name}`);
        console.log(`    Status: ${emp.isActive ? 'Active' : 'Inactive'}`);
        console.log(`    Department: ${emp.departmentId || 'Not assigned'}`);
        console.log(`    Role: ${emp.role}`);
        console.log('---');
      });
    }

    // System Health Check
    console.log('\n🏥 SYSTEM HEALTH CHECK:');
    console.log('------------------------');

    const issues = [];

    // Check for KPI records without proper status
    const invalidKpiStatuses = kpiRecords.filter(r => !['not_started', 'in_progress', 'awaiting_approval', 'approved', 'rejected'].includes(r.status));
    if (invalidKpiStatuses.length > 0) {
      issues.push(`❌ ${invalidKpiStatuses.length} KPI records have invalid status`);
    }

    // Check for employees without department
    const employeesWithoutDept = employees.filter(emp => !emp.departmentId);
    if (employeesWithoutDept.length > 0) {
      issues.push(`❌ ${employeesWithoutDept.length} employees without department`);
    }

    // Check for unread notifications (should be fine)
    if (notificationStatusCounts.unread === 0) {
      console.log('ℹ️ All notifications have been read');
    }

    if (issues.length === 0) {
      console.log('✅ All system statuses are valid');
    } else {
      issues.forEach(issue => console.log(issue));
    }

    console.log('\n✅ STATUS CHECK COMPLETED');

  } catch (error) {
    console.error('❌ Error checking system statuses:', error.message);
  }
}

checkSystemStatuses();
