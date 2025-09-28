const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword } = require('firebase/auth');
const { getFirestore, doc, getDoc, setDoc, collection, getDocs, updateDoc } = require('firebase/firestore');

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

async function resetEmployeePasswords() {
  try {
    console.log('🔧 Resetting employee passwords...');
    
    // 1. Get all employees from Firestore
    console.log('\n1. Getting all employees...');
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${employees.length} employees`);
    
    // 2. Set a standard password for all employees
    const standardPassword = 'employee123';
    
    for (const employee of employees) {
      console.log(`\n🔧 Processing: ${employee.name} (${employee.email})`);
      
      try {
        // Try to sign in with current password first
        let needsPasswordReset = false;
        try {
          await signInWithEmailAndPassword(auth, employee.email, standardPassword);
          console.log(`✅ ${employee.name} can already login with standard password`);
          await auth.signOut();
          continue;
        } catch (error) {
          console.log(`📝 ${employee.name} needs password reset`);
          needsPasswordReset = true;
        }
        
        if (needsPasswordReset) {
          // Try to sign in with temp password to update
          let tempPassword = employee.tempPassword || 'default123';
          
          try {
            const userCredential = await signInWithEmailAndPassword(auth, employee.email, tempPassword);
            console.log(`✅ Signed in with temp password for ${employee.name}`);
            
            // Update password
            await updatePassword(userCredential.user, standardPassword);
            console.log(`✅ Updated password for ${employee.name}`);
            
            // Update employee document
            await updateDoc(doc(db, 'employees', employee.uid), {
              tempPassword: undefined,
              needsAuthSetup: false,
              updatedAt: new Date().toISOString()
            });
            
            await auth.signOut();
            
          } catch (tempError) {
            console.log(`❌ Could not sign in with temp password for ${employee.name}: ${tempError.message}`);
            
            // Try to create new account
            try {
              const newUserCredential = await createUserWithEmailAndPassword(auth, employee.email, standardPassword);
              console.log(`✅ Created new Firebase Auth account for ${employee.name}`);
              
              // Update employee document with new UID
              await updateDoc(doc(db, 'employees', employee.uid), {
                uid: newUserCredential.user.uid,
                tempPassword: undefined,
                needsAuthSetup: false,
                updatedAt: new Date().toISOString()
              });
              
              await auth.signOut();
              
            } catch (createError) {
              console.log(`❌ Could not create account for ${employee.name}: ${createError.message}`);
            }
          }
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${employee.name}:`, error.message);
      }
    }
    
    // 3. Test login for all employees
    console.log('\n3. Testing login for all employees...');
    for (const employee of employees) {
      try {
        console.log(`🔐 Testing: ${employee.email}`);
        const signInResult = await signInWithEmailAndPassword(auth, employee.email, standardPassword);
        console.log(`✅ Login successful: ${employee.name}`);
        await auth.signOut();
      } catch (error) {
        console.log(`❌ Login failed for ${employee.email}: ${error.message}`);
      }
    }
    
    console.log('\n✅ Password reset completed!');
    console.log('\n📋 Summary:');
    console.log(`- Standard password for all employees: ${standardPassword}`);
    console.log(`- All employees should now be able to login`);
    
  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
  }
}

// Run the reset
resetEmployeePasswords().then(() => {
  console.log('\n🎉 Password reset completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Password reset failed:', error);
  process.exit(1);
});
