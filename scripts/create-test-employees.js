const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, collection, getDocs } = require('firebase/firestore');

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

async function createTestEmployees() {
  try {
    console.log('🔧 Creating test employees with proper Firebase Auth...');
    
    // Test employees data
    const testEmployees = [
      {
        name: 'Nguyễn Văn A',
        email: 'employee1@y99.vn',
        username: 'employee1',
        position: 'Developer',
        departmentId: 'it',
        role: 'employee',
        phone: '0123456789',
        employeeId: 'EMP001'
      },
      {
        name: 'Trần Thị B',
        email: 'employee2@y99.vn',
        username: 'employee2',
        position: 'Designer',
        departmentId: 'design',
        role: 'employee',
        phone: '0987654321',
        employeeId: 'EMP002'
      },
      {
        name: 'Lê Văn C',
        email: 'employee3@y99.vn',
        username: 'employee3',
        position: 'Manager',
        departmentId: 'hr',
        role: 'employee',
        phone: '0555666777',
        employeeId: 'EMP003'
      }
    ];
    
    const standardPassword = 'employee123';
    
    for (const employeeData of testEmployees) {
      console.log(`\n🔧 Creating employee: ${employeeData.name}`);
      
      try {
        // Check if employee already exists
        const existingQuery = await getDocs(collection(db, 'employees'));
        const existingEmployees = existingQuery.docs.map(doc => doc.data());
        
        if (existingEmployees.some(emp => emp.email === employeeData.email)) {
          console.log(`⚠️ Employee ${employeeData.email} already exists, skipping...`);
          continue;
        }
        
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          employeeData.email, 
          standardPassword
        );
        
        console.log(`✅ Created Firebase Auth user: ${userCredential.user.uid}`);
        
        // Create employee document in Firestore
        const employeeDoc = {
          id: `emp-${Date.now()}`,
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
        console.error(`❌ Error creating employee ${employeeData.name}:`, error.message);
      }
    }
    
    console.log('\n✅ Test employees creation completed!');
    console.log('\n📋 Summary:');
    console.log(`- Created test employees with proper Firebase Auth`);
    console.log(`- Standard password: ${standardPassword}`);
    console.log(`- Employees can now login with their email and password`);
    
  } catch (error) {
    console.error('❌ Error creating test employees:', error);
  }
}

// Run the creation
createTestEmployees().then(() => {
  console.log('\n🎉 Test employees creation completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test employees creation failed:', error);
  process.exit(1);
});
