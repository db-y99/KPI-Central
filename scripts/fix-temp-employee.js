const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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

async function fixTempEmployeeIssue() {
  console.log('🔧 Fixing temporary employee issue...\n');

  try {
    // 1. Get all employees and departments
    console.log('1. Getting employees and departments...');
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const employees = employeesSnap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    
    const departmentsSnap = await getDocs(collection(db, 'departments'));
    const departments = departmentsSnap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    
    console.log(`   Found ${employees.length} employees and ${departments.length} departments`);
    
    // 2. Find the temp employee
    const tempEmployee = employees.find(emp => emp.uid === 'temp_1758939938071_5sk8lqgqh');
    
    if (tempEmployee) {
      console.log('\n2. Found temp employee:');
      console.log(`   - Name: ${tempEmployee.name}`);
      console.log(`   - UID: ${tempEmployee.uid}`);
      console.log(`   - Department ID: ${tempEmployee.departmentId}`);
      
      // 3. Check if department exists
      const department = departments.find(dept => dept.docId === tempEmployee.departmentId);
      
      if (!department) {
        console.log('   ❌ Department not found, fixing...');
        
        // Find a valid department to assign
        const validDepartment = departments.find(dept => dept.name === 'general');
        if (validDepartment) {
          console.log(`   ✅ Assigning to department: ${validDepartment.name} (${validDepartment.docId})`);
          
          // Update employee department
          await updateDoc(doc(db, 'employees', tempEmployee.docId), {
            departmentId: validDepartment.docId,
            updatedAt: new Date().toISOString()
          });
          
          console.log('   ✅ Employee department updated');
        } else {
          console.log('   ⚠️  No valid department found');
        }
      } else {
        console.log(`   ✅ Department found: ${department.name}`);
      }
      
      // 4. Test KPI visibility
      console.log('\n3. Testing KPI visibility...');
      const kpiRecordsSnap = await getDocs(collection(db, 'kpiRecords'));
      const kpiRecords = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const employeeKpis = kpiRecords.filter(record => record.employeeId === tempEmployee.uid);
      console.log(`   Employee: ${tempEmployee.name}`);
      console.log(`   Assigned KPIs: ${employeeKpis.length}`);
      
      if (employeeKpis.length > 0) {
        console.log('   ✅ Employee has assigned KPIs:');
        employeeKpis.forEach(record => {
          console.log(`     - KPI ID: ${record.kpiId}`);
          console.log(`       Status: ${record.status}`);
          console.log(`       Target: ${record.target}`);
          console.log(`       Period: ${record.period}`);
        });
      }
      
      // 5. Check if employee can login
      console.log('\n4. Checking login capability...');
      
      // The temp employee might not be able to login because they don't have Firebase Auth
      // Let's check if they have a temp password
      if (tempEmployee.tempPassword) {
        console.log('   ✅ Employee has temporary password for development');
        console.log('   💡 This employee can login using the temp password');
      } else {
        console.log('   ⚠️  Employee has no password set');
        console.log('   💡 This employee cannot login');
      }
      
      // 6. Recommendations
      console.log('\n5. Recommendations:');
      console.log('   💡 To test KPI visibility:');
      console.log('     1. Login as this employee using temp password');
      console.log('     2. Check if KPIs are visible in employee dashboard');
      console.log('     3. If not visible, check data context loading');
      
      console.log('   💡 For production:');
      console.log('     1. Create proper Firebase Auth user for this employee');
      console.log('     2. Update employee record with real UID');
      console.log('     3. Update KPI records with new UID');
      
    } else {
      console.log('2. Temp employee not found');
    }
    
    // 7. Test with a real employee
    console.log('\n6. Testing with real employee...');
    const realEmployee = employees.find(emp => emp.uid && !emp.uid.startsWith('temp_') && emp.role !== 'admin');
    
    if (realEmployee) {
      console.log(`   Testing with: ${realEmployee.name} (${realEmployee.uid})`);
      
      const employeeKpis = kpiRecords.filter(record => record.employeeId === realEmployee.uid);
      console.log(`   Assigned KPIs: ${employeeKpis.length}`);
      
      if (employeeKpis.length === 0) {
        console.log('   ⚠️  Real employee has no KPIs assigned');
        console.log('   💡 This explains why employees cannot see KPIs');
        console.log('   💡 Admin needs to assign KPIs to real employees');
      }
    }

  } catch (error) {
    console.error('❌ Error during fix:', error);
  }
}

// Run the fix function
fixTempEmployeeIssue().then(() => {
  console.log('\n🏁 Fix completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});
