const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, writeBatch, query, where } = require('firebase/firestore');

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

async function checkEmployeeData() {
  try {
    console.log('🔍 Checking employee data structure...');
    
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const employees = employeesSnap.docs.map(doc => ({ 
      id: doc.id, 
      data: doc.data() 
    }));
    
    console.log(`Found ${employees.length} employees:`);
    employees.forEach(emp => {
      console.log(`- ID: ${emp.id}`);
      console.log(`  Data:`, JSON.stringify(emp.data, null, 2));
    });
    
    return employees;
    
  } catch (error) {
    console.error('❌ Error checking employee data:', error);
    return [];
  }
}

async function fixEmployeeConsistencyCorrected() {
  try {
    console.log('🔧 Fixing employee consistency issues (corrected version)...');
    
    // Get employees with correct structure
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const employees = employeesSnap.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    if (employees.length === 0) {
      console.log('⚠️ No employees found');
      return { success: true, message: 'No employees to fix' };
    }
    
    console.log(`Found ${employees.length} employees to process`);
    
    const batch = writeBatch(db);
    let fixesApplied = 0;
    
    for (const employee of employees) {
      console.log(`Processing employee: ${employee.name || employee.id}`);
      
      // Fix 1: Create user record if missing
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(doc => doc.data());
      const userExists = users.find(user => user.uid === employee.uid);
      
      if (!userExists) {
        console.log(`  Creating user record for: ${employee.name || employee.uid}`);
        const userRef = doc(collection(db, 'users'));
        const userData = {
          uid: employee.uid,
          email: employee.email || `${employee.name?.toLowerCase().replace(/\s+/g, '.')}@company.com`,
          displayName: employee.name || 'Employee',
          role: employee.role || 'employee',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        batch.set(userRef, userData);
        fixesApplied++;
      } else {
        console.log(`  User record already exists for: ${employee.name || employee.uid}`);
      }
      
      // Fix 2: Fix department reference
      const departmentsSnap = await getDocs(collection(db, 'departments'));
      const departments = departmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (departments.length > 0) {
        let needsDeptUpdate = false;
        let newDeptId = null;
        
        if (employee.departmentId) {
          const validDept = departments.find(dept => dept.id === employee.departmentId);
          if (!validDept) {
            // Assign to first available department
            newDeptId = departments[0].id;
            needsDeptUpdate = true;
            console.log(`  Fixing department reference: ${employee.departmentId} -> ${newDeptId}`);
          }
        } else {
          // Assign to first available department
          newDeptId = departments[0].id;
          needsDeptUpdate = true;
          console.log(`  Assigning department: ${newDeptId}`);
        }
        
        if (needsDeptUpdate) {
          const employeeRef = doc(db, 'employees', employee.id);
          batch.update(employeeRef, { 
            departmentId: newDeptId,
            updatedAt: new Date().toISOString()
          });
          fixesApplied++;
        }
      } else {
        console.log(`  No departments available for assignment`);
      }
    }
    
    if (fixesApplied > 0) {
      await batch.commit();
      console.log(`✅ Applied ${fixesApplied} fixes to employee consistency`);
    } else {
      console.log('✅ No employee consistency fixes needed');
    }
    
    return { success: true, message: `Applied ${fixesApplied} fixes`, fixesApplied };
    
  } catch (error) {
    console.error('❌ Error fixing employee consistency:', error);
    return { success: false, error: error.message };
  }
}

async function runCorrectedFix() {
  console.log('🚀 Running corrected employee consistency fix...\n');
  
  // First, check current employee data
  await checkEmployeeData();
  
  console.log('\n' + '='.repeat(50));
  
  // Then fix the issues
  const result = await fixEmployeeConsistencyCorrected();
  
  console.log('\n📊 FIX RESULT');
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
  console.log('✅ Corrected fix completed!');
  
  return result;
}

// Run the corrected fix
runCorrectedFix().catch(console.error);
