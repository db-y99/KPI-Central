const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword } = require('firebase/auth');
const { getFirestore, doc, getDoc, collection, getDocs, updateDoc, deleteDoc, setDoc } = require('firebase/firestore');

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

async function fixAllEmployeePasswords() {
  try {
    console.log('🔧 Fixing all employee passwords...');
    
    // 1. Get all employees from Firestore
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`\n📊 Found ${employees.length} employees to process:`);
    
    const standardPassword = 'employee123';
    let successCount = 0;
    let failCount = 0;
    
    for (const employee of employees) {
      console.log(`\n👤 Processing: ${employee.name} (${employee.email})`);
      console.log(`   Current UID: ${employee.uid}`);
      
      try {
        // Check if this is a temp employee
        if (employee.uid && employee.uid.startsWith('temp_')) {
          console.log(`   ⚠️ Temp employee detected, skipping...`);
          continue;
        }
        
        // Try different passwords to find the correct one
        const testPasswords = ['123456', 'employee123', 'default123', 'password'];
        let correctPassword = null;
        
        for (const testPassword of testPasswords) {
          try {
            const signInResult = await signInWithEmailAndPassword(auth, employee.email, testPassword);
            console.log(`   ✅ Found correct password: ${testPassword}`);
            correctPassword = testPassword;
            await auth.signOut();
            break;
          } catch (error) {
            // Continue trying other passwords
          }
        }
        
        if (correctPassword) {
          // Update password to standard
          if (correctPassword !== standardPassword) {
            try {
              const signInResult = await signInWithEmailAndPassword(auth, employee.email, correctPassword);
              await updatePassword(signInResult.user, standardPassword);
              console.log(`   ✅ Updated password to: ${standardPassword}`);
              await auth.signOut();
            } catch (updateError) {
              console.log(`   ❌ Failed to update password: ${updateError.message}`);
            }
          } else {
            console.log(`   ✅ Password already correct: ${standardPassword}`);
          }
          
          // Update employee document
          await updateDoc(doc(db, 'employees', employee.uid), {
            updatedAt: new Date().toISOString()
          });
          
          successCount++;
        } else {
          console.log(`   ❌ Could not find correct password for ${employee.email}`);
          
          // Try to create new Firebase Auth account
          try {
            const newUserCredential = await createUserWithEmailAndPassword(auth, employee.email, standardPassword);
            console.log(`   ✅ Created new Firebase Auth account: ${newUserCredential.user.uid}`);
            
            // Update employee document with new UID
            await updateDoc(doc(db, 'employees', employee.uid), {
              uid: newUserCredential.user.uid,
              updatedAt: new Date().toISOString()
            });
            
            await auth.signOut();
            successCount++;
          } catch (createError) {
            console.log(`   ❌ Failed to create new account: ${createError.message}`);
            failCount++;
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error processing ${employee.name}: ${error.message}`);
        failCount++;
      }
    }
    
    // 2. Test login for all employees
    console.log('\n🧪 Testing login for all employees...');
    let loginSuccessCount = 0;
    
    for (const employee of employees) {
      if (employee.uid && employee.uid.startsWith('temp_')) continue;
      
      try {
        const signInResult = await signInWithEmailAndPassword(auth, employee.email, standardPassword);
        console.log(`✅ Login successful: ${employee.name}`);
        await auth.signOut();
        loginSuccessCount++;
      } catch (error) {
        console.log(`❌ Login failed: ${employee.name} - ${error.message}`);
      }
    }
    
    console.log('\n✅ Password fix completed!');
    console.log('\n📋 Summary:');
    console.log(`- Processed: ${employees.length} employees`);
    console.log(`- Success: ${successCount}`);
    console.log(`- Failed: ${failCount}`);
    console.log(`- Login test success: ${loginSuccessCount}/${employees.filter(e => !e.uid.startsWith('temp_')).length}`);
    console.log(`- Standard password: ${standardPassword}`);
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  }
}

// Run the fix
fixAllEmployeePasswords().then(() => {
  console.log('\n🎉 Password fix completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Password fix failed:', error);
  process.exit(1);
});
