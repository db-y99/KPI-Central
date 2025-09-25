const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, writeBatch } = require('firebase/firestore');

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

// Basic departments data
const departmentsData = [
  {
    name: 'Administration',
    description: 'Phòng ban quản trị',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Information Technology',
    description: 'Phòng ban công nghệ thông tin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Human Resources',
    description: 'Phòng ban nhân sự',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Finance',
    description: 'Phòng ban tài chính',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Marketing',
    description: 'Phòng ban marketing',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Basic KPIs data
const kpisData = [
  {
    name: 'Sales Target Achievement',
    description: 'Tỷ lệ đạt mục tiêu doanh số',
    category: 'Sales',
    unit: 'percentage',
    target: 100,
    weight: 30,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Customer Satisfaction',
    description: 'Mức độ hài lòng của khách hàng',
    category: 'Customer Service',
    unit: 'rating',
    target: 4.5,
    weight: 25,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Project Completion Rate',
    description: 'Tỷ lệ hoàn thành dự án đúng hạn',
    category: 'Project Management',
    unit: 'percentage',
    target: 90,
    weight: 20,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Employee Retention Rate',
    description: 'Tỷ lệ giữ chân nhân viên',
    category: 'Human Resources',
    unit: 'percentage',
    target: 85,
    weight: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Cost Efficiency',
    description: 'Hiệu quả chi phí',
    category: 'Finance',
    unit: 'percentage',
    target: 95,
    weight: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Basic reward programs data
const rewardProgramsData = [
  {
    name: 'Monthly Performance Bonus',
    description: 'Thưởng hiệu suất hàng tháng',
    type: 'monthly',
    criteria: {
      minScore: 80,
      maxScore: 100
    },
    rewards: {
      bronze: { min: 80, max: 85, bonus: 500000 },
      silver: { min: 86, max: 90, bonus: 1000000 },
      gold: { min: 91, max: 95, bonus: 1500000 },
      platinum: { min: 96, max: 100, bonus: 2000000 }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Quarterly Achievement Award',
    description: 'Giải thưởng thành tích quý',
    type: 'quarterly',
    criteria: {
      minScore: 85,
      maxScore: 100
    },
    rewards: {
      bronze: { min: 85, max: 90, bonus: 2000000 },
      silver: { min: 91, max: 95, bonus: 3000000 },
      gold: { min: 96, max: 100, bonus: 5000000 }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function initializeDepartments() {
  try {
    console.log('🏢 Initializing departments...');
    
    // Check if departments already exist
    const departmentsSnap = await getDocs(collection(db, 'departments'));
    const existingDepartments = departmentsSnap.docs.map(doc => doc.data());
    
    if (existingDepartments.length > 0) {
      console.log(`✅ Found ${existingDepartments.length} existing departments`);
      return { success: true, message: 'Departments already exist', count: existingDepartments.length };
    }
    
    // Add departments using batch
    const batch = writeBatch(db);
    const departmentRefs = [];
    
    for (const deptData of departmentsData) {
      const deptRef = doc(collection(db, 'departments'));
      batch.set(deptRef, deptData);
      departmentRefs.push(deptRef);
    }
    
    await batch.commit();
    console.log(`✅ Successfully initialized ${departmentsData.length} departments`);
    
    return { success: true, message: 'Departments initialized successfully', count: departmentsData.length };
    
  } catch (error) {
    console.error('❌ Error initializing departments:', error);
    return { success: false, error: error.message };
  }
}

async function initializeKPIs() {
  try {
    console.log('📊 Initializing KPIs...');
    
    // Check if KPIs already exist
    const kpisSnap = await getDocs(collection(db, 'kpis'));
    const existingKpis = kpisSnap.docs.map(doc => doc.data());
    
    if (existingKpis.length > 0) {
      console.log(`✅ Found ${existingKpis.length} existing KPIs`);
      return { success: true, message: 'KPIs already exist', count: existingKpis.length };
    }
    
    // Add KPIs using batch
    const batch = writeBatch(db);
    
    for (const kpiData of kpisData) {
      const kpiRef = doc(collection(db, 'kpis'));
      batch.set(kpiRef, kpiData);
    }
    
    await batch.commit();
    console.log(`✅ Successfully initialized ${kpisData.length} KPIs`);
    
    return { success: true, message: 'KPIs initialized successfully', count: kpisData.length };
    
  } catch (error) {
    console.error('❌ Error initializing KPIs:', error);
    return { success: false, error: error.message };
  }
}

async function initializeRewardPrograms() {
  try {
    console.log('🎁 Initializing reward programs...');
    
    // Check if reward programs already exist
    const programsSnap = await getDocs(collection(db, 'rewardPrograms'));
    const existingPrograms = programsSnap.docs.map(doc => doc.data());
    
    if (existingPrograms.length > 0) {
      console.log(`✅ Found ${existingPrograms.length} existing reward programs`);
      return { success: true, message: 'Reward programs already exist', count: existingPrograms.length };
    }
    
    // Add reward programs using batch
    const batch = writeBatch(db);
    
    for (const programData of rewardProgramsData) {
      const programRef = doc(collection(db, 'rewardPrograms'));
      batch.set(programRef, programData);
    }
    
    await batch.commit();
    console.log(`✅ Successfully initialized ${rewardProgramsData.length} reward programs`);
    
    return { success: true, message: 'Reward programs initialized successfully', count: rewardProgramsData.length };
    
  } catch (error) {
    console.error('❌ Error initializing reward programs:', error);
    return { success: false, error: error.message };
  }
}

async function fixEmployeeConsistency() {
  try {
    console.log('🔧 Fixing employee consistency issues...');
    
    // Get employees
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const employees = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (employees.length === 0) {
      console.log('⚠️ No employees found');
      return { success: true, message: 'No employees to fix' };
    }
    
    const batch = writeBatch(db);
    let fixesApplied = 0;
    
    for (const employee of employees) {
      let needsUpdate = false;
      const updates = {};
      
      // Fix 1: Create user record if missing
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(doc => doc.data());
      const userExists = users.find(user => user.uid === employee.uid);
      
      if (!userExists) {
        console.log(`Creating user record for employee: ${employee.name || employee.uid}`);
        const userRef = doc(collection(db, 'users'));
        const userData = {
          uid: employee.uid,
          email: employee.email || `${employee.name?.toLowerCase().replace(/\s+/g, '.')}@company.com`,
          displayName: employee.name || 'Employee',
          role: employee.role || 'employee',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        batch.set(userRef, userData);
        fixesApplied++;
      }
      
      // Fix 2: Fix department reference
      const departmentsSnap = await getDocs(collection(db, 'departments'));
      const departments = departmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (employee.departmentId && departments.length > 0) {
        const validDept = departments.find(dept => dept.id === employee.departmentId);
        if (!validDept) {
          // Assign to first available department
          const firstDept = departments[0];
          updates.departmentId = firstDept.id;
          needsUpdate = true;
          console.log(`Fixing department reference for ${employee.name || employee.uid}: ${employee.departmentId} -> ${firstDept.id}`);
        }
      } else if (!employee.departmentId && departments.length > 0) {
        // Assign to first available department
        const firstDept = departments[0];
        updates.departmentId = firstDept.id;
        needsUpdate = true;
        console.log(`Assigning department for ${employee.name || employee.uid}: ${firstDept.id}`);
      }
      
      if (needsUpdate) {
        const employeeRef = doc(db, 'employees', employee.id);
        batch.update(employeeRef, updates);
        fixesApplied++;
      }
    }
    
    if (fixesApplied > 0) {
      await batch.commit();
      console.log(`✅ Applied ${fixesApplied} fixes to employee consistency`);
    } else {
      console.log('✅ No employee consistency fixes needed');
    }
    
    return { success: true, message: `Applied ${fixesApplied} fixes`, fixesApplied };
    
  } catch (error) {
    console.error('❌ Error fixing employee consistency:', error);
    return { success: false, error: error.message };
  }
}

async function initializeNotificationTemplates() {
  try {
    console.log('📧 Initializing notification templates...');
    
    // Check if templates already exist
    const templatesSnap = await getDocs(collection(db, 'notificationTemplates'));
    const existingTemplates = templatesSnap.docs.map(doc => doc.data());
    
    if (existingTemplates.length > 0) {
      console.log(`✅ Found ${existingTemplates.length} existing notification templates`);
      return { success: true, message: 'Notification templates already exist', count: existingTemplates.length };
    }
    
    const templatesData = [
      {
        name: 'KPI Assignment',
        subject: 'Bạn đã được giao KPI mới',
        body: 'Chào {employeeName}, bạn đã được giao KPI "{kpiName}" với mục tiêu {target}. Hãy cập nhật tiến độ thường xuyên.',
        category: 'kpi_assignment',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'KPI Reminder',
        subject: 'Nhắc nhở cập nhật KPI',
        body: 'Chào {employeeName}, hãy cập nhật tiến độ KPI "{kpiName}" của bạn.',
        category: 'kpi_reminder',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Reward Notification',
        subject: 'Thông báo thưởng',
        body: 'Chúc mừng {employeeName}! Bạn đã đạt được {level} với phần thưởng {amount} VNĐ.',
        category: 'reward',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Add templates using batch
    const batch = writeBatch(db);
    
    for (const templateData of templatesData) {
      const templateRef = doc(collection(db, 'notificationTemplates'));
      batch.set(templateRef, templateData);
    }
    
    await batch.commit();
    console.log(`✅ Successfully initialized ${templatesData.length} notification templates`);
    
    return { success: true, message: 'Notification templates initialized successfully', count: templatesData.length };
    
  } catch (error) {
    console.error('❌ Error initializing notification templates:', error);
    return { success: false, error: error.message };
  }
}

async function runFullSystemFix() {
  console.log('🚀 Starting full system fix and initialization...\n');
  
  const results = [];
  
  // Step 1: Initialize departments
  console.log('Step 1: Initializing departments');
  const deptResult = await initializeDepartments();
  results.push({ step: 'Departments', ...deptResult });
  
  // Step 2: Initialize KPIs
  console.log('\nStep 2: Initializing KPIs');
  const kpiResult = await initializeKPIs();
  results.push({ step: 'KPIs', ...kpiResult });
  
  // Step 3: Initialize reward programs
  console.log('\nStep 3: Initializing reward programs');
  const rewardResult = await initializeRewardPrograms();
  results.push({ step: 'Reward Programs', ...rewardResult });
  
  // Step 4: Initialize notification templates
  console.log('\nStep 4: Initializing notification templates');
  const templateResult = await initializeNotificationTemplates();
  results.push({ step: 'Notification Templates', ...templateResult });
  
  // Step 5: Fix employee consistency
  console.log('\nStep 5: Fixing employee consistency');
  const fixResult = await fixEmployeeConsistency();
  results.push({ step: 'Employee Consistency Fix', ...fixResult });
  
  // Summary
  console.log('\n📊 SUMMARY OF FIXES APPLIED');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.step}: ${result.message}`);
    if (result.count) {
      console.log(`   - Items processed: ${result.count}`);
    }
    if (result.fixesApplied) {
      console.log(`   - Fixes applied: ${result.fixesApplied}`);
    }
    if (result.error) {
      console.log(`   - Error: ${result.error}`);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalSteps = results.length;
  
  console.log(`\n🏥 SYSTEM HEALTH AFTER FIX:`);
  if (successCount === totalSteps) {
    console.log('✅ HEALTHY - All fixes applied successfully');
  } else if (successCount >= totalSteps * 0.8) {
    console.log('⚠️ WARNING - Most fixes applied, some issues remain');
  } else {
    console.log('❌ CRITICAL - Multiple fixes failed');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Full system fix completed!');
  
  return results;
}

// Run the fix
runFullSystemFix().catch(console.error);
