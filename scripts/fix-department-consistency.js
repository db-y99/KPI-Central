const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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

async function debugDepartmentConsistency() {
  try {
    console.log('🔍 Debugging department consistency issue...\n');
    
    // Get employees
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const employees = employeesSnap.docs.map(doc => ({ 
      docId: doc.id, 
      ...doc.data() 
    }));
    
    // Get departments
    const departmentsSnap = await getDocs(collection(db, 'departments'));
    const departments = departmentsSnap.docs.map(doc => ({ 
      docId: doc.id, 
      ...doc.data() 
    }));
    
    console.log('📋 EMPLOYEES:');
    employees.forEach(emp => {
      console.log(`- ${emp.name || emp.docId}`);
      console.log(`  Document ID: ${emp.docId}`);
      console.log(`  Department ID: ${emp.departmentId}`);
      console.log(`  Role: ${emp.role}`);
    });
    
    console.log('\n🏢 DEPARTMENTS:');
    departments.forEach(dept => {
      console.log(`- ${dept.name}`);
      console.log(`  Document ID: ${dept.docId}`);
      console.log(`  Active: ${dept.isActive}`);
    });
    
    console.log('\n🔍 CONSISTENCY CHECK:');
    const employeesWithInvalidDepts = employees.filter(emp => {
      if (!emp.departmentId) {
        console.log(`❌ ${emp.name || emp.docId}: No department ID`);
        return true;
      }
      
      const validDept = departments.find(dept => dept.docId === emp.departmentId);
      if (!validDept) {
        console.log(`❌ ${emp.name || emp.docId}: Invalid department ID "${emp.departmentId}"`);
        return true;
      }
      
      console.log(`✅ ${emp.name || emp.docId}: Valid department "${validDept.name}"`);
      return false;
    });
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`- Total employees: ${employees.length}`);
    console.log(`- Total departments: ${departments.length}`);
    console.log(`- Employees with invalid departments: ${employeesWithInvalidDepts.length}`);
    
    return { employees, departments, employeesWithInvalidDepts };
    
  } catch (error) {
    console.error('❌ Error debugging department consistency:', error);
    return { error: error.message };
  }
}

async function fixDepartmentConsistency() {
  try {
    console.log('🔧 Fixing department consistency...\n');
    
    const debugResult = await debugDepartmentConsistency();
    
    if (debugResult.error) {
      return { success: false, error: debugResult.error };
    }
    
    const { employees, departments, employeesWithInvalidDepts } = debugResult;
    
    if (employeesWithInvalidDepts.length === 0) {
      console.log('✅ No department consistency issues found');
      return { success: true, message: 'No issues to fix' };
    }
    
    if (departments.length === 0) {
      console.log('❌ No departments available for assignment');
      return { success: false, error: 'No departments available' };
    }
    
    // Fix each employee with invalid department
    for (const employee of employeesWithInvalidDepts) {
      console.log(`\nFixing employee: ${employee.name || employee.docId}`);
      
      // Assign to first available department
      const firstDept = departments[0];
      console.log(`  Assigning to department: ${firstDept.name} (${firstDept.docId})`);
      
      const employeeRef = doc(db, 'employees', employee.docId);
      await updateDoc(employeeRef, {
        departmentId: firstDept.docId,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`  ✅ Updated successfully`);
    }
    
    console.log(`\n✅ Fixed ${employeesWithInvalidDepts.length} department consistency issues`);
    
    return { 
      success: true, 
      message: `Fixed ${employeesWithInvalidDepts.length} issues`,
      fixesApplied: employeesWithInvalidDepts.length
    };
    
  } catch (error) {
    console.error('❌ Error fixing department consistency:', error);
    return { success: false, error: error.message };
  }
}

// Run the fix
fixDepartmentConsistency().then(result => {
  console.log('\n📊 FINAL RESULT');
  console.log('='.repeat(50));
  
  if (result.success) {
    console.log(`✅ ${result.message}`);
    if (result.fixesApplied) {
      console.log(`   - Fixes applied: ${result.fixesApplied}`);
    }
  } else {
    console.log(`❌ Error: ${result.error}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Department consistency fix completed!');
}).catch(console.error);
