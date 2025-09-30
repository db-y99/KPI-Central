const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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

async function fixEmployeeDepartmentRelationships() {
  console.log('🔧 FIXING EMPLOYEE-DEPARTMENT RELATIONSHIPS');
  console.log('==========================================\n');

  try {
    // Get all departments
    const departmentsRef = collection(db, 'departments');
    const departmentsSnap = await getDocs(departmentsRef);
    const departments = departmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get all employees
    const employeesRef = collection(db, 'employees');
    const employeesSnap = await getDocs(employeesRef);
    const employees = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log('Available departments:');
    departments.forEach(dept => {
      console.log(`  ${dept.id}: ${dept.name}`);
    });

    console.log(`\nFixing ${employees.length} employees:`);

    // Define department assignments
    const departmentAssignments = {
      // Admin gets Admin department
      'admin-1': 'Ju1fXXIQGvPM9aHsFdXr', // Admin department

      // Other employees get first non-admin department
      'emp-RpjtrCuI': 'SOG76gkRapnxkuBuDbSI', // Phòng Kỹ Thuật
      'emp-dRj7oUJi': 'SOG76gkRapnxkuBuDbSI', // Phòng Kỹ Thuật

      // Lê Hồng Phúc already has correct department
      'e3': null // No change needed
    };

    let fixedCount = 0;

    for (const employee of employees) {
      const currentDeptId = employee.departmentId;
      const targetDeptId = departmentAssignments[employee.id];

      if (targetDeptId && targetDeptId !== currentDeptId) {
        console.log(`  ✅ ${employee.name}: ${currentDeptId || 'none'} -> ${targetDeptId}`);

        try {
          await updateDoc(doc(db, 'employees', employee.id), {
            departmentId: targetDeptId,
            updatedAt: new Date().toISOString()
          });
          fixedCount++;
        } catch (error) {
          console.log(`  ❌ Failed to update ${employee.name}: ${error.message}`);
        }
      } else if (!currentDeptId || currentDeptId === 'general' || currentDeptId === 'admin') {
        console.log(`  ✅ ${employee.name}: needs manual assignment`);
      } else {
        const dept = departments.find(d => d.id === currentDeptId);
        console.log(`  ✅ ${employee.name}: already correct (${dept?.name})`);
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} employee-department relationships`);

  } catch (error) {
    console.error('❌ Error fixing employee-department relationships:', error.message);
  }
}

fixEmployeeDepartmentRelationships();
