const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

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

async function detailedEmployeeCheck() {
  console.log('🔍 Detailed Employee Check...\n');

  try {
    // 1. Get all employees with detailed info
    console.log('1. Getting all employees...');
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const employees = employeesSnap.docs.map(doc => ({ 
      docId: doc.id, 
      ...doc.data() 
    }));
    
    console.log(`   Found ${employees.length} employees:`);
    employees.forEach(emp => {
      console.log(`     - Doc ID: ${emp.docId}`);
      console.log(`       UID: ${emp.uid}`);
      console.log(`       Name: ${emp.name}`);
      console.log(`       Role: ${emp.role}`);
      console.log(`       Department: ${emp.departmentId}`);
      console.log(`       Created: ${emp.createdAt}`);
      console.log('       ---');
    });
    
    // 2. Check specific problematic employee
    console.log('\n2. Checking specific problematic employee...');
    const problematicUid = 'temp_1758939938071_5sk8lqgqh';
    
    // Try to get by document ID
    const docRef = doc(db, 'employees', problematicUid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const empData = docSnap.data();
      console.log('   ✅ Employee found by document ID:');
      console.log(`     - Doc ID: ${docSnap.id}`);
      console.log(`     - UID: ${empData.uid}`);
      console.log(`     - Name: ${empData.name}`);
      console.log(`     - Role: ${empData.role}`);
      console.log(`     - Department: ${empData.departmentId}`);
      console.log(`     - Created: ${empData.createdAt}`);
    } else {
      console.log('   ❌ Employee not found by document ID');
    }
    
    // 3. Check KPI records
    console.log('\n3. Checking KPI records...');
    const kpiRecordsSnap = await getDocs(collection(db, 'kpiRecords'));
    const kpiRecords = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`   Found ${kpiRecords.length} KPI records:`);
    kpiRecords.forEach(record => {
      console.log(`     - Record ID: ${record.id}`);
      console.log(`       Employee ID: ${record.employeeId}`);
      console.log(`       KPI ID: ${record.kpiId}`);
      console.log(`       Status: ${record.status}`);
      console.log(`       Created: ${record.createdAt}`);
      
      // Check if employee exists
      const employee = employees.find(emp => emp.uid === record.employeeId);
      if (employee) {
        console.log(`       ✅ Employee found: ${employee.name}`);
      } else {
        console.log(`       ❌ Employee not found in employees list`);
      }
      console.log('       ---');
    });
    
    // 4. Check data context loading issue
    console.log('\n4. Analyzing data context loading issue...');
    
    // The issue might be that the employee exists but is not being loaded properly
    // in the data context due to some filtering or query issue
    
    const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');
    console.log(`   Non-admin employees: ${nonAdminEmployees.length}`);
    
    const employeesWithTempId = employees.filter(emp => emp.uid && emp.uid.startsWith('temp_'));
    console.log(`   Employees with temp ID: ${employeesWithTempId.length}`);
    
    if (employeesWithTempId.length > 0) {
      console.log('   Temp employees:');
      employeesWithTempId.forEach(emp => {
        console.log(`     - ${emp.name} (${emp.uid})`);
      });
    }
    
    // 5. Recommendations
    console.log('\n5. Recommendations:');
    
    if (employeesWithTempId.length > 0) {
      console.log('   ⚠️  Found employees with temporary IDs');
      console.log('   💡 These employees were created in development mode');
      console.log('   💡 They need to be properly migrated to production mode');
      console.log('   💡 Or their KPIs need to be reassigned to real employees');
    }
    
    const orphanedKpis = kpiRecords.filter(record => {
      const employee = employees.find(emp => emp.uid === record.employeeId);
      return !employee;
    });
    
    if (orphanedKpis.length > 0) {
      console.log(`   ⚠️  Found ${orphanedKpis.length} orphaned KPI records`);
      console.log('   💡 These need to be cleaned up or reassigned');
    } else {
      console.log('   ✅ No orphaned KPI records found');
    }

  } catch (error) {
    console.error('❌ Error during detailed check:', error);
  }
}

// Run the detailed check
detailedEmployeeCheck().then(() => {
  console.log('\n🏁 Detailed check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Detailed check failed:', error);
  process.exit(1);
});
