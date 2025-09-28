const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where, deleteDoc } = require('firebase/firestore');

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

async function fixEmployeeLogin() {
  try {
    console.log('🔧 Fixing employee login issues...');
    
    // 1. Get all employees from Firestore
    console.log('\n1. Checking existing employees...');
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${employees.length} employees in Firestore`);
    
    // 2. Check which employees have temp UIDs (development mode)
    const tempEmployees = employees.filter(emp => emp.uid && emp.uid.startsWith('temp_'));
    console.log(`Found ${tempEmployees.length} employees with temp UIDs`);
    
    if (tempEmployees.length === 0) {
      console.log('✅ No temp employees found. All employees should be able to login.');
      return;
    }
    
    // 3. For each temp employee, create proper Firebase Auth account
    for (const employee of tempEmployees) {
      console.log(`\n🔧 Processing employee: ${employee.name} (${employee.email})`);
      
      try {
        // Check if Firebase Auth user already exists
        try {
          const testSignIn = await signInWithEmailAndPassword(auth, employee.email, employee.tempPassword || 'default123');
          console.log(`✅ Firebase Auth user already exists for ${employee.email}`);
          await auth.signOut();
          continue;
        } catch (authError) {
          // User doesn't exist in Firebase Auth, create it
          console.log(`📝 Creating Firebase Auth user for ${employee.email}...`);
        }
        
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          employee.email, 
          employee.tempPassword || 'default123'
        );
        
        console.log(`✅ Created Firebase Auth user: ${userCredential.user.uid}`);
        
        // Update employee document with real Firebase Auth UID
        const newEmployeeData = {
          ...employee,
          uid: userCredential.user.uid,
          // Remove temp fields
          tempPassword: undefined,
          needsAuthSetup: false
        };
        
        // Delete old document with temp UID
        await deleteDoc(doc(db, 'employees', employee.uid));
        
        // Create new document with real UID
        await setDoc(doc(db, 'employees', userCredential.user.uid), newEmployeeData);
        
        console.log(`✅ Updated employee document with real UID: ${userCredential.user.uid}`);
        
        // Sign out
        await auth.signOut();
        
      } catch (error) {
        console.error(`❌ Error processing employee ${employee.name}:`, error.message);
      }
    }
    
    // 4. Test login for a few employees
    console.log('\n4. Testing employee login...');
    const testEmployees = employees.filter(emp => !emp.uid.startsWith('temp_')).slice(0, 3);
    
    for (const employee of testEmployees) {
      try {
        console.log(`🔐 Testing login for: ${employee.email}`);
        const signInResult = await signInWithEmailAndPassword(auth, employee.email, 'default123');
        console.log(`✅ Login successful for ${employee.name}`);
        await auth.signOut();
      } catch (error) {
        console.log(`❌ Login failed for ${employee.email}: ${error.message}`);
      }
    }
    
    console.log('\n✅ Employee login fix completed!');
    console.log('\n📋 Summary:');
    console.log(`- Processed ${tempEmployees.length} temp employees`);
    console.log(`- All employees should now be able to login with their email and password`);
    console.log(`- Default password for employees: default123`);
    
  } catch (error) {
    console.error('❌ Error fixing employee login:', error);
  }
}

// Run the fix
fixEmployeeLogin().then(() => {
  console.log('\n🎉 Fix completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});
