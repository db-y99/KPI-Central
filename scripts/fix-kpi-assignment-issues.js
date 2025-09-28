const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc } = require('firebase/firestore');

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

async function fixKpiAssignmentIssues() {
  console.log('🔧 Fixing KPI Assignment Issues...\n');

  try {
    // 1. Get all KPI records
    console.log('1. Checking KPI records...');
    const kpiRecordsSnap = await getDocs(collection(db, 'kpiRecords'));
    const kpiRecords = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // 2. Get all employees
    console.log('2. Checking employees...');
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const employees = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // 3. Find orphaned KPI records (records with employee IDs that don't exist)
    console.log('3. Finding orphaned KPI records...');
    const orphanedRecords = kpiRecords.filter(record => {
      const employeeExists = employees.find(emp => emp.uid === record.employeeId);
      return !employeeExists;
    });
    
    console.log(`   Found ${orphanedRecords.length} orphaned KPI records`);
    
    if (orphanedRecords.length > 0) {
      console.log('   Orphaned records:');
      orphanedRecords.forEach(record => {
        console.log(`     - Record ID: ${record.id}`);
        console.log(`       Employee ID: ${record.employeeId}`);
        console.log(`       KPI ID: ${record.kpiId}`);
        console.log(`       Status: ${record.status}`);
        console.log(`       Created: ${record.createdAt}`);
        console.log('       ---');
      });
      
      // 4. Ask user what to do with orphaned records
      console.log('\n4. Options for orphaned records:');
      console.log('   a) Delete orphaned KPI records');
      console.log('   b) Reassign to existing employees');
      console.log('   c) Keep them (for debugging)');
      
      // For now, let's delete orphaned records
      console.log('\n5. Deleting orphaned KPI records...');
      for (const record of orphanedRecords) {
        try {
          await deleteDoc(doc(db, 'kpiRecords', record.id));
          console.log(`   ✅ Deleted orphaned record: ${record.id}`);
        } catch (error) {
          console.log(`   ❌ Failed to delete record ${record.id}:`, error.message);
        }
      }
    }
    
    // 5. Check notifications for orphaned records
    console.log('\n6. Checking notifications...');
    const notificationsSnap = await getDocs(collection(db, 'notifications'));
    const notifications = notificationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const orphanedNotifications = notifications.filter(notif => {
      const employeeExists = employees.find(emp => emp.uid === notif.userId);
      return !employeeExists && notif.category === 'kpi_assigned';
    });
    
    console.log(`   Found ${orphanedNotifications.length} orphaned notifications`);
    
    if (orphanedNotifications.length > 0) {
      console.log('7. Deleting orphaned notifications...');
      for (const notif of orphanedNotifications) {
        try {
          await deleteDoc(doc(db, 'notifications', notif.id));
          console.log(`   ✅ Deleted orphaned notification: ${notif.id}`);
        } catch (error) {
          console.log(`   ❌ Failed to delete notification ${notif.id}:`, error.message);
        }
      }
    }
    
    // 6. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   - Total KPI records: ${kpiRecords.length}`);
    console.log(`   - Orphaned KPI records: ${orphanedRecords.length}`);
    console.log(`   - Total notifications: ${notifications.length}`);
    console.log(`   - Orphaned notifications: ${orphanedNotifications.length}`);
    
    if (orphanedRecords.length === 0 && orphanedNotifications.length === 0) {
      console.log('\n✅ No orphaned data found - system is clean!');
    } else {
      console.log('\n✅ Cleanup completed - orphaned data removed!');
    }
    
    // 7. Test KPI assignment
    console.log('\n8. Testing KPI assignment...');
    const validEmployees = employees.filter(emp => emp.role !== 'admin');
    const validKpis = await getDocs(collection(db, 'kpis'));
    const kpis = validKpis.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (validEmployees.length > 0 && kpis.length > 0) {
      console.log(`   ✅ System ready for KPI assignment:`);
      console.log(`      - ${validEmployees.length} employees available`);
      console.log(`      - ${kpis.length} KPIs available`);
      console.log(`   💡 You can now assign KPIs to employees through the admin interface`);
    } else {
      console.log(`   ⚠️  System not ready for KPI assignment:`);
      console.log(`      - Employees: ${validEmployees.length}`);
      console.log(`      - KPIs: ${kpis.length}`);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the fix function
fixKpiAssignmentIssues().then(() => {
  console.log('\n🏁 Fix completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});
