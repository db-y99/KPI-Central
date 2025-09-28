const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc, collection, getDocs, setDoc } = require('firebase/firestore');

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

async function checkEmployeeAuth() {
  try {
    console.log('🔍 Checking employee authentication status...');
    
    // 1. Get all employees from Firestore
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`\n📊 Found ${employees.length} employees in Firestore:`);
    
    for (const employee of employees) {
      console.log(`\n👤 Employee: ${employee.name} (${employee.email})`);
      console.log(`   UID: ${employee.uid}`);
      console.log(`   Role: ${employee.role}`);
      
      // Test login with different passwords
      const passwords = ['employee123', 'default123', '123456', 'password'];
      
      for (const password of passwords) {
        try {
          console.log(`   🔐 Testing password: ${password}`);
          const signInResult = await signInWithEmailAndPassword(auth, employee.email, password);
          console.log(`   ✅ Login successful with password: ${password}`);
          console.log(`   🎯 Firebase Auth UID: ${signInResult.user.uid}`);
          await auth.signOut();
          break;
        } catch (error) {
          console.log(`   ❌ Login failed with password: ${password} - ${error.code}`);
        }
      }
    }
    
    // 2. Test creating a new employee
    console.log('\n🧪 Testing employee creation...');
    const testEmail = 'test-employee@y99.vn';
    const testPassword = 'employee123';
    
    try {
      // Try to create new employee
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      console.log(`✅ Created test employee: ${userCredential.user.uid}`);
      
      // Create employee document
      const employeeData = {
        id: `test-${Date.now()}`,
        uid: userCredential.user.uid,
        name: 'Test Employee',
        email: testEmail,
        username: 'test-employee',
        position: 'Tester',
        departmentId: 'it',
        role: 'employee',
        phone: '0123456789',
        employeeId: 'TEST001',
        avatar: `https://picsum.photos/seed/${userCredential.user.uid}/100/100`,
        isActive: true,
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'employees', userCredential.user.uid), employeeData);
      console.log(`✅ Created employee document`);
      
      // Test login
      await auth.signOut();
      const loginResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log(`✅ Test login successful: ${loginResult.user.uid}`);
      await auth.signOut();
      
    } catch (error) {
      console.log(`❌ Test employee creation failed: ${error.message}`);
    }
    
    console.log('\n✅ Employee auth check completed!');
    
  } catch (error) {
    console.error('❌ Error checking employee auth:', error);
  }
}

// Run the check
checkEmployeeAuth().then(() => {
  console.log('\n🎉 Auth check completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Auth check failed:', error);
  process.exit(1);
});
