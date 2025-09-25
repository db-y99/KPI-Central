const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, writeBatch } = require('firebase/firestore');

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

async function fixEmployeeConsistencyFinal() {
  try {
    console.log('🔧 Final fix for employee consistency issues...');
    
    // Get employees with correct structure
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const employees = employeesSnap.docs.map(doc => ({ 
      docId: doc.id,  // This is the actual document ID
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
      console.log(`Processing employee: ${employee.name || employee.docId}`);
      console.log(`  Document ID: ${employee.docId}`);
      console.log(`  UID: ${employee.uid}`);
      
      // Fix 1: Create user record if missing
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(doc => doc.data());
      const userExists = users.find(user => user.uid === employee.uid);
      
      if (!userExists) {
        console.log(`  Creating user record for UID: ${employee.uid}`);
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
        console.log(`  ✅ User record will be created`);
      } else {
        console.log(`  ✅ User record already exists`);
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
          } else {
            console.log(`  ✅ Department reference is valid: ${employee.departmentId}`);
          }
        } else {
          // Assign to first available department
          newDeptId = departments[0].id;
          needsDeptUpdate = true;
          console.log(`  Assigning department: ${newDeptId}`);
        }
        
        if (needsDeptUpdate) {
          // Use the actual document ID, not the data.id field
          const employeeRef = doc(db, 'employees', employee.docId);
          batch.update(employeeRef, { 
            departmentId: newDeptId,
            updatedAt: new Date().toISOString()
          });
          fixesApplied++;
          console.log(`  ✅ Department will be updated to: ${newDeptId}`);
        }
      } else {
        console.log(`  ⚠️ No departments available for assignment`);
      }
    }
    
    if (fixesApplied > 0) {
      console.log(`\nCommitting ${fixesApplied} fixes...`);
      await batch.commit();
      console.log(`✅ Successfully applied ${fixesApplied} fixes to employee consistency`);
    } else {
      console.log('✅ No employee consistency fixes needed');
    }
    
    return { success: true, message: `Applied ${fixesApplied} fixes`, fixesApplied };
    
  } catch (error) {
    console.error('❌ Error fixing employee consistency:', error);
    return { success: false, error: error.message };
  }
}

async function runFinalFix() {
  console.log('🚀 Running final employee consistency fix...\n');
  
  const result = await fixEmployeeConsistencyFinal();
  
  console.log('\n📊 FINAL FIX RESULT');
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
  console.log('✅ Final fix completed!');
  
  return result;
}

// Run the final fix
runFinalFix().catch(console.error);
