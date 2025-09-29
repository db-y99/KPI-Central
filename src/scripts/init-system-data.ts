import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kpi-central-1kjf8',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:852984596237:web:b47d9c1694189fe1319244',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'kpi-central-1kjf8.firebasestorage.app',
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAaw3qMdPZD-C2qH9Ik-nTwNKVp-4x0scs',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'kpi-central-1kjf8.firebaseapp.com',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '852984596237',
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

async function initializeSystemData() {
  console.log('🚀 Initializing system data...');

  try {
    // 1. Create default departments
    await initializeDepartments();

    // 2. Create admin user in Firebase Auth and Firestore
    await initializeAdminUser();

    // 3. Create sample KPIs
    await initializeSampleKPIs();

    // 4. Create reward programs
    await initializeRewardPrograms();

    console.log('✅ System data initialized successfully!');

  } catch (error) {
    console.error('❌ Error initializing system data:', error);
    process.exit(1);
  }
}

async function initializeDepartments() {
  console.log('📁 Creating default departments...');

  const departmentsRef = collection(db, 'departments');

  const defaultDepartments = [
    {
      name: 'Phòng Hành Chính Nhân Sự',
      description: 'Quản lý nhân sự và hành chính công ty',
      managerId: null,
      location: 'Tầng 1',
      phone: '0283.812.3456',
      email: 'hr@y99.vn',
      budget: 500000000, // 500M VND
      establishedDate: '2020-01-01',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Phòng Kỹ Thuật',
      description: 'Phát triển và bảo trì hệ thống kỹ thuật',
      managerId: null,
      location: 'Tầng 2',
      phone: '0283.812.3457',
      email: 'tech@y99.vn',
      budget: 800000000, // 800M VND
      establishedDate: '2020-01-01',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Phòng Kinh Doanh',
      description: 'Phát triển kinh doanh và chăm sóc khách hàng',
      managerId: null,
      location: 'Tầng 3',
      phone: '0283.812.3458',
      email: 'sales@y99.vn',
      budget: 600000000, // 600M VND
      establishedDate: '2020-01-01',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Phòng Marketing',
      description: 'Marketing và quảng bá thương hiệu',
      managerId: null,
      location: 'Tầng 4',
      phone: '0283.812.3459',
      email: 'marketing@y99.vn',
      budget: 400000000, // 400M VND
      establishedDate: '2020-01-01',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  for (const dept of defaultDepartments) {
    try {
      await addDoc(departmentsRef, dept);
      console.log(`  ✅ Created department: ${dept.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to create department ${dept.name}:`, error);
    }
  }
}

async function initializeAdminUser() {
  console.log('👑 Creating admin user...');

  try {
    // Check if admin already exists
    const employeesRef = collection(db, 'employees');
    const adminQuery = query(employeesRef, where('email', '==', 'db@y99.vn'));
    const existingAdmin = await getDocs(adminQuery);

    if (!existingAdmin.empty) {
      console.log('  ✅ Admin user already exists');
      return;
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, 'db@y99.vn', 'admin123');
    const firebaseUser = userCredential.user;

    // Create user document in Firestore
    const employeeData = {
      uid: firebaseUser.uid,
      name: 'Administrator',
      email: 'db@y99.vn',
      username: 'admin',
      position: 'Giám đốc điều hành',
      departmentId: 'dept-admin',
      avatar: 'https://ui-avatars.com/api/?name=Administrator&background=3b82f6&color=ffffff',
      role: 'admin',
      phone: '0901.234.567',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      startDate: '2020-01-01',
      employeeId: 'EMP001',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'employees', firebaseUser.uid), employeeData);
    console.log('  ✅ Created admin user in Firestore');

  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('  ✅ Admin user already exists in Auth');
    } else {
      console.error('  ❌ Failed to create admin user:', error);
    }
  }
}

async function initializeSampleKPIs() {
  console.log('🎯 Creating sample KPIs...');

  const kpisRef = collection(db, 'kpis');

  const sampleKPIs = [
    {
      name: 'Tỷ lệ hoàn thành công việc đúng hạn',
      description: 'Đo lường khả năng hoàn thành công việc đúng thời hạn quy định',
      department: 'Phòng Hành Chính Nhân Sự',
      departmentId: 'dept-hr',
      unit: '%',
      frequency: 'monthly',
      type: 'Hiệu suất',
      category: 'Thời gian',
      target: 95,
      weight: 25,
      reward: 500000,
      penalty: 200000,
      rewardThreshold: 90,
      penaltyThreshold: 80,
      rewardType: 'percentage',
      penaltyType: 'fixed',
      maxReward: 1000000,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Độ hài lòng của khách hàng',
      description: 'Đo lường mức độ hài lòng của khách hàng với dịch vụ',
      department: 'Phòng Kinh Doanh',
      departmentId: 'dept-sales',
      unit: 'điểm',
      frequency: 'quarterly',
      type: 'Chất lượng',
      category: 'Khách hàng',
      target: 4.5,
      weight: 30,
      reward: 800000,
      penalty: 300000,
      rewardThreshold: 4.0,
      penaltyThreshold: 3.5,
      rewardType: 'fixed',
      penaltyType: 'percentage',
      maxReward: 1500000,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Số lượng lỗi kỹ thuật',
      description: 'Theo dõi số lượng lỗi phát sinh trong hệ thống',
      department: 'Phòng Kỹ Thuật',
      departmentId: 'dept-tech',
      unit: 'lỗi/tháng',
      frequency: 'monthly',
      type: 'Chất lượng',
      category: 'Kỹ thuật',
      target: 5,
      weight: 20,
      reward: 300000,
      penalty: 400000,
      rewardThreshold: 3,
      penaltyThreshold: 10,
      rewardType: 'fixed',
      penaltyType: 'variable',
      maxReward: 600000,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  for (const kpi of sampleKPIs) {
    try {
      await addDoc(kpisRef, kpi);
      console.log(`  ✅ Created KPI: ${kpi.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to create KPI ${kpi.name}:`, error);
    }
  }
}

async function initializeRewardPrograms() {
  console.log('🏆 Creating reward programs...');

  const rewardProgramsRef = collection(db, 'rewardPrograms');

  const rewardPrograms = [
    {
      name: 'Chương trình thưởng hiệu suất Q1 2024',
      description: 'Chương trình thưởng cho hiệu suất xuất sắc quý 1',
      position: 'all',
      year: 2024,
      frequency: 'quarterly',
      isActive: true,
      criteria: [
        {
          name: 'Đạt KPI xuất sắc',
          description: 'Nhân viên đạt từ 90% KPI trở lên',
          type: 'kpi_score',
          condition: { operator: 'gte', value: 90 },
          reward: 1000000,
          maxReward: 2000000,
          isActive: true,
        }
      ],
      penalties: [
        {
          name: 'Không đạt KPI',
          description: 'Nhân viên không đạt KPI dưới 70%',
          type: 'kpi_score',
          condition: { operator: 'lt', value: 70 },
          penalty: 500000,
          maxPenalty: 1000000,
          isActive: true,
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  for (const program of rewardPrograms) {
    try {
      await addDoc(rewardProgramsRef, program);
      console.log(`  ✅ Created reward program: ${program.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to create reward program ${program.name}:`, error);
    }
  }
}

// Run the initialization
initializeSystemData()
  .then(() => {
    console.log('🎉 System initialization completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 System initialization failed:', error);
    process.exit(1);
  });
