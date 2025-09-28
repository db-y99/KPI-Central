const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB8QqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQ",
  authDomain: "kpi-central-1kjf8.firebaseapp.com",
  projectId: "kpi-central-1kjf8",
  storageBucket: "kpi-central-1kjf8.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugKpiAssignment() {
  console.log('🔍 Debugging KPI Assignment Issues...\n');

  try {
    // 1. Check employees
    console.log('1. Checking employees...');
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const employees = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`   Found ${employees.length} employees`);
    
    const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');
    console.log(`   Non-admin employees: ${nonAdminEmployees.length}`);
    
    if (nonAdminEmployees.length > 0) {
      console.log('   Sample non-admin employees:');
      nonAdminEmployees.slice(0, 3).forEach(emp => {
        console.log(`     - ${emp.name} (${emp.uid}) - Dept: ${emp.departmentId}`);
      });
    }

    // 2. Check KPIs
    console.log('\n2. Checking KPIs...');
    const kpisSnap = await getDocs(collection(db, 'kpis'));
    const kpis = kpisSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`   Found ${kpis.length} KPIs`);
    
    if (kpis.length > 0) {
      console.log('   Sample KPIs:');
      kpis.slice(0, 3).forEach(kpi => {
        console.log(`     - ${kpi.name} (${kpi.id}) - Unit: ${kpi.unit}`);
      });
    }

    // 3. Check KPI Records
    console.log('\n3. Checking KPI Records...');
    const kpiRecordsSnap = await getDocs(collection(db, 'kpiRecords'));
    const kpiRecords = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`   Found ${kpiRecords.length} KPI records`);
    
    if (kpiRecords.length > 0) {
      console.log('   Sample KPI records:');
      kpiRecords.slice(0, 5).forEach(record => {
        const employee = employees.find(emp => emp.uid === record.employeeId);
        const kpi = kpis.find(k => k.id === record.kpiId);
        console.log(`     - Employee: ${employee?.name || 'Unknown'} (${record.employeeId})`);
        console.log(`       KPI: ${kpi?.name || 'Unknown'} (${record.kpiId})`);
        console.log(`       Status: ${record.status}`);
        console.log(`       Target: ${record.target}, Actual: ${record.actual || 0}`);
        console.log(`       Period: ${record.period}`);
        console.log(`       Created: ${record.createdAt}`);
        console.log('       ---');
      });
    }

    // 4. Check for specific employee's KPIs
    console.log('\n4. Checking specific employee KPIs...');
    if (nonAdminEmployees.length > 0) {
      const testEmployee = nonAdminEmployees[0];
      const employeeKpis = kpiRecords.filter(record => record.employeeId === testEmployee.uid);
      
      console.log(`   Employee: ${testEmployee.name} (${testEmployee.uid})`);
      console.log(`   Assigned KPIs: ${employeeKpis.length}`);
      
      if (employeeKpis.length > 0) {
        console.log('   KPI Details:');
        employeeKpis.forEach(record => {
          const kpi = kpis.find(k => k.id === record.kpiId);
          console.log(`     - ${kpi?.name || 'Unknown KPI'}`);
          console.log(`       Status: ${record.status}`);
          console.log(`       Target: ${record.target} ${kpi?.unit || ''}`);
          console.log(`       Period: ${record.period}`);
        });
      } else {
        console.log('   ⚠️  No KPIs assigned to this employee!');
      }
    }

    // 5. Check notifications
    console.log('\n5. Checking notifications...');
    const notificationsSnap = await getDocs(collection(db, 'notifications'));
    const notifications = notificationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`   Found ${notifications.length} notifications`);
    
    const kpiNotifications = notifications.filter(notif => notif.category === 'kpi_assigned');
    console.log(`   KPI assignment notifications: ${kpiNotifications.length}`);
    
    if (kpiNotifications.length > 0) {
      console.log('   Sample KPI notifications:');
      kpiNotifications.slice(0, 3).forEach(notif => {
        console.log(`     - User: ${notif.userId}`);
        console.log(`       Title: ${notif.title}`);
        console.log(`       Message: ${notif.message}`);
        console.log(`       Created: ${notif.createdAt}`);
        console.log('       ---');
      });
    }

    // 6. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   - Employees: ${employees.length} (${nonAdminEmployees.length} non-admin)`);
    console.log(`   - KPIs: ${kpis.length}`);
    console.log(`   - KPI Records: ${kpiRecords.length}`);
    console.log(`   - Notifications: ${notifications.length} (${kpiNotifications.length} KPI-related)`);
    
    // Check for potential issues
    const issues = [];
    
    if (nonAdminEmployees.length === 0) {
      issues.push('No non-admin employees found');
    }
    
    if (kpis.length === 0) {
      issues.push('No KPIs defined');
    }
    
    if (kpiRecords.length === 0) {
      issues.push('No KPI records found');
    }
    
    const employeesWithKpis = [...new Set(kpiRecords.map(record => record.employeeId))];
    if (employeesWithKpis.length === 0 && nonAdminEmployees.length > 0) {
      issues.push('No KPIs assigned to any employees');
    }
    
    if (issues.length > 0) {
      console.log('\n⚠️  POTENTIAL ISSUES:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('\n✅ No obvious issues found');
    }

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

// Run the debug function
debugKpiAssignment().then(() => {
  console.log('\n🏁 Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
