const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
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

async function createWorkingAdmin() {
  try {
    console.log('🔧 Creating working admin user...');

    const email = 'admin@y99.vn';
    const password = 'admin123456';

    console.log(`📧 Creating admin user: ${email}`);

    // Create user in Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Created auth user:', userCredential.user.uid);

    // Create admin profile in Firestore
    const adminData = {
      id: 'admin-working',
      uid: userCredential.user.uid,
      email: email,
      username: 'admin',
      name: 'Administrator',
      position: 'System Admin',
      departmentId: 'admin',
      avatar: '/avatars/admin.jpg',
      role: 'admin',
      startDate: new Date().toISOString(),
      employeeId: 'ADM001',
      isActive: true,
      phone: '',
      address: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'employees', userCredential.user.uid), adminData);
    console.log('✅ Created Firestore document');

    // Test login
    await auth.signOut();
    console.log('🔐 Testing login...');
    const signInResult = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Login test successful:', signInResult.user.uid);

    await auth.signOut();
    console.log('✅ Working admin user created successfully');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Role: admin`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

createWorkingAdmin().then(() => {
  console.log('\n🎉 Admin user creation completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Admin user creation failed:', error);
  process.exit(1);
});

