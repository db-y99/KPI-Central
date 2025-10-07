const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, collection, getDocs } = require('firebase/firestore');

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
const db = getFirestore(app);

async function fixAdminRole() {
  try {
    console.log('🔧 Fixing admin role...');

    const email = 'admin-test@y99.vn';

    // Find the user in Firestore
    console.log('📊 Finding user in Firestore...');
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const user = employees.find(emp => emp.email === email);
    if (!user) {
      console.log('❌ User not found in Firestore');
      return;
    }

    console.log('✅ Found user:', user);
    console.log('Current role:', user.role);

    // Update the role to admin
    console.log('🔄 Updating role to admin...');
    await updateDoc(doc(db, 'employees', user.uid), {
      role: 'admin',
      position: 'System Admin',
      departmentId: 'admin',
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Role updated successfully');

    // Verify the update
    const updatedDoc = await getDocs(collection(db, 'employees'));
    const updatedEmployees = updatedDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const updatedUser = updatedEmployees.find(emp => emp.email === email);

    console.log('✅ Verification - New role:', updatedUser?.role);

  } catch (error) {
    console.error('❌ Error fixing admin role:', error);
  }
}

fixAdminRole().then(() => {
  console.log('\n🎉 Admin role fix completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Admin role fix failed:', error);
  process.exit(1);
});

