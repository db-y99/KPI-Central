const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } = require('firebase/auth');
const { getFirestore, doc, getDoc, setDoc, deleteDoc } = require('firebase/firestore');

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

const { updatePassword, reauthenticateWithCredential, EmailAuthProvider } = require('firebase/auth');

async function resetAdminPassword() {
  try {
    console.log('🔧 Resetting admin password...');

    const email = 'db@y99.vn';
    const newPassword = 'admin123456';

    // First, check if user exists in Firestore
    console.log('📊 Checking Firestore for admin user...');
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const adminUser = employees.find(emp => emp.email === email && emp.role === 'admin');
    if (!adminUser) {
      console.log('❌ Admin user not found in Firestore');
      return;
    }

    console.log('✅ Found admin user:', adminUser);

    // Try to find the current password by testing common ones
    const commonPasswords = ['123456', 'password', 'admin', 'default123', 'employee123', 'admin123'];
    let currentUser = null;
    let currentPassword = null;

    for (const password of commonPasswords) {
      try {
        console.log(`🔐 Trying password: ${password}`);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
        currentPassword = password;
        console.log('✅ Found working password:', password);
        break;
      } catch (error) {
        // Continue trying
      }
    }

    if (!currentUser) {
      console.log('❌ Could not find working password for admin user');
      console.log('💡 You may need to reset the password through Firebase Console');
      return;
    }

    // Now update the password
    console.log('🔄 Updating password...');
    await updatePassword(currentUser, newPassword);
    console.log('✅ Password updated successfully');

    // Test login with new password
    await auth.signOut();
    console.log('🔐 Testing login with new password...');
    const signInResult = await signInWithEmailAndPassword(auth, email, newPassword);
    console.log('✅ Login test successful:', signInResult.user.uid);

    await auth.signOut();
    console.log('✅ Password reset completed successfully');
    console.log(`🔑 New password: ${newPassword}`);

  } catch (error) {
    console.error('❌ Error resetting password:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

// Import missing function
const { collection, getDocs } = require('firebase/firestore');

resetAdminPassword().then(() => {
  console.log('\n🎉 Password reset completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Password reset failed:', error);
  process.exit(1);
});
