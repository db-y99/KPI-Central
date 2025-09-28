const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, collection, getDocs, deleteDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  projectId: 'kpi-central-1kjf8',
  appId: '1:852984596237:web:b47d9c1694189fe1319244',
  storageBucket: 'kpi-central-1kjf8.firebasestorage.app',
  apiKey: 'AIzaSyAaw3qMdPZD-C2qH9Ik-nTwNKVp-4x0scs',
  authDomain: 'kpi-central-1kjf8.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '852984596237',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createWorkingEmployees() {
  try {
    console.log('🔧 Creating working employees with proper authentication...');
    
    // 1. Clean up problematic employees
    console.log('\n1. Cleaning up problematic employees...');
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const problematicEmails = [
      'admin-test@y99.vn',
      'test@y99.vn', 
      'db@y99.vn'
    ];
    
    for (const employee of employees) {
      if (problematicEmails.includes(employee.email)) {
        console.log(`🗑️ Deleting problematic employee: ${employee.name} (${employee.email})`);
        try {
          await deleteDoc(doc(db, 'employees', employee.uid));
          console.log(`✅ Deleted: ${employee.name}`);
        } catch (error) {
          console.log(`❌ Failed to delete ${employee.name}: ${error.message}`);
        }
      }
    }
    
    // 2. Create new working employees
    console.log('\n2. Creating new working employees...');
    const newEmployees = [
      {
        name: 'Nguyễn Văn Admin',
        email: 'admin@y99.vn',
        username: 'admin',
        position: 'System Administrator',
        departmentId: 'admin',
        role: 'admin',
        phone: '0123456789',
        employeeId: 'ADM001'
      },
      {
        name: 'Trần Thị Employee',
        email: 'employee@y99.vn',
        username: 'employee',
        position: 'Staff Member',
        departmentId: 'it',
        role: 'employee',
        phone: '0987654321',
        employeeId: 'EMP001'
      },
      {
        name: 'Lê Văn Manager',
        email: 'manager@y99.vn',
        username: 'manager',
        position: 'Team Manager',
        departmentId: 'hr',
        role: 'employee',
        phone: '0555666777',
        employeeId: 'MGR001'
      }
    ];
    
    const standardPassword = 'employee123';
    
    for (const employeeData of newEmployees) {
      console.log(`\n🔧 Creating: ${employeeData.name} (${employeeData.email})`);
      
      try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          employeeData.email, 
          standardPassword
        );
        
        console.log(`✅ Created Firebase Auth user: ${userCredential.user.uid}`);
        
        // Create employee document
        const employeeDoc = {
          id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          uid: userCredential.user.uid,
          name: employeeData.name,
          email: employeeData.email,
          username: employeeData.username,
          position: employeeData.position,
          departmentId: employeeData.departmentId,
          role: employeeData.role,
          phone: employeeData.phone,
          employeeId: employeeData.employeeId,
          avatar: `https://picsum.photos/seed/${userCredential.user.uid}/100/100`,
          isActive: true,
          startDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'employees', userCredential.user.uid), employeeDoc);
        console.log(`✅ Created employee document for ${employeeData.name}`);
        
        // Sign out
        await auth.signOut();
        
      } catch (error) {
        console.error(`❌ Error creating ${employeeData.name}:`, error.message);
      }
    }
    
    // 3. Test login for all employees
    console.log('\n3. Testing login for all employees...');
    const finalEmployeesSnapshot = await getDocs(collection(db, 'employees'));
    const finalEmployees = finalEmployeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    let loginSuccessCount = 0;
    
    for (const employee of finalEmployees) {
      if (employee.uid && employee.uid.startsWith('temp_')) continue;
      
      try {
        const signInResult = await signInWithEmailAndPassword(auth, employee.email, standardPassword);
        console.log(`✅ Login successful: ${employee.name} (${employee.role})`);
        await auth.signOut();
        loginSuccessCount++;
      } catch (error) {
        console.log(`❌ Login failed: ${employee.name} - ${error.message}`);
      }
    }
    
    console.log('\n✅ Working employees creation completed!');
    console.log('\n📋 Summary:');
    console.log(`- Total employees: ${finalEmployees.length}`);
    console.log(`- Login success: ${loginSuccessCount}/${finalEmployees.filter(e => !e.uid.startsWith('temp_')).length}`);
    console.log(`- Standard password: ${standardPassword}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@y99.vn / employee123');
    console.log('Employee: employee@y99.vn / employee123');
    console.log('Manager: manager@y99.vn / employee123');
    
  } catch (error) {
    console.error('❌ Error creating working employees:', error);
  }
}

// Run the creation
createWorkingEmployees().then(() => {
  console.log('\n🎉 Working employees creation completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Working employees creation failed:', error);
  process.exit(1);
});
