const { initializeApp, getApps } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp
} = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAaw3qMdPZD-C2qH9Ik-nTwNKVp-4x0scs',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'kpi-central-1kjf8.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kpi-central-1kjf8',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'kpi-central-1kjf8.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '852984596237',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:852984596237:web:b47d9c1694189fe1319244',
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

console.log('🔧 SỬA LỖI TÍNH NHẤT QUÁN DỮ LIỆU\n');
console.log('='.repeat(80) + '\n');

async function fixDepartmentReferences() {
  console.log('📋 BƯỚC 1: Sửa department references trong employees\n');
  
  try {
    // Get existing department
    const departmentsSnap = await getDocs(collection(db, 'departments'));
    const existingDepartment = departmentsSnap.docs[0];
    
    if (!existingDepartment) {
      console.log('❌ Không tìm thấy department nào. Tạo department mới...');
      
      const newDeptRef = await addDoc(collection(db, 'departments'), {
        name: 'General',
        description: 'General Department',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ Đã tạo department mới: ${newDeptRef.id}`);
      return newDeptRef.id;
    }
    
    const validDepartmentId = existingDepartment.id;
    console.log(`✅ Sử dụng department: ${validDepartmentId} - ${existingDepartment.data().name}`);
    
    // Fix all employees with invalid departmentId
    const employeesSnap = await getDocs(collection(db, 'employees'));
    
    let fixedCount = 0;
    for (const empDoc of employeesSnap.docs) {
      const empData = empDoc.data();
      const empId = empDoc.id;
      
      // Check if departmentId is invalid (not matching existing department IDs)
      const isInvalid = !departmentsSnap.docs.find(d => d.id === empData.departmentId);
      
      if (isInvalid) {
        console.log(`🔧 Sửa employee: ${empData.name} (${empId})`);
        console.log(`   Cũ: departmentId = "${empData.departmentId}"`);
        console.log(`   Mới: departmentId = "${validDepartmentId}"`);
        
        await updateDoc(doc(db, 'employees', empId), {
          departmentId: validDepartmentId,
          updatedAt: new Date().toISOString()
        });
        
        fixedCount++;
      }
    }
    
    if (fixedCount > 0) {
      console.log(`\n✅ Đã sửa ${fixedCount} employee(s)`);
    } else {
      console.log('\n✅ Tất cả employees đều có departmentId hợp lệ');
    }
    
    return validDepartmentId;
    
  } catch (error) {
    console.error('❌ Lỗi khi sửa department references:', error);
    throw error;
  }
}

async function createSampleKPIs(departmentId) {
  console.log('\n📋 BƯỚC 2: Tạo KPIs mẫu\n');
  
  try {
    // Check if KPIs already exist
    const kpisSnap = await getDocs(collection(db, 'kpis'));
    if (kpisSnap.size > 0) {
      console.log('ℹ️  KPIs đã tồn tại, bỏ qua bước này');
      return kpisSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    const sampleKPIs = [
      {
        name: 'Sales Target Achievement',
        description: 'Achieve monthly sales target',
        department: departmentId,
        departmentId: departmentId,
        unit: 'VND',
        frequency: 'monthly',
        type: 'Sales',
        category: 'Performance',
        target: 100000000,
        weight: 30,
        reward: 5000000,
        penalty: 2000000,
        rewardThreshold: 80,
        penaltyThreshold: 60,
        rewardType: 'fixed',
        penaltyType: 'fixed',
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        status: 'active'
      },
      {
        name: 'Customer Satisfaction Score',
        description: 'Maintain high customer satisfaction',
        department: departmentId,
        departmentId: departmentId,
        unit: 'Score',
        frequency: 'monthly',
        type: 'Quality',
        category: 'Customer Service',
        target: 90,
        weight: 25,
        reward: 3000000,
        penalty: 1500000,
        rewardThreshold: 85,
        penaltyThreshold: 70,
        rewardType: 'fixed',
        penaltyType: 'fixed',
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        status: 'active'
      },
      {
        name: 'Project Completion Rate',
        description: 'Complete projects on time',
        department: departmentId,
        departmentId: departmentId,
        unit: '%',
        frequency: 'quarterly',
        type: 'Productivity',
        category: 'Project Management',
        target: 95,
        weight: 20,
        reward: 4000000,
        penalty: 2000000,
        rewardThreshold: 90,
        penaltyThreshold: 75,
        rewardType: 'fixed',
        penaltyType: 'fixed',
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        status: 'active'
      }
    ];
    
    const createdKPIs = [];
    for (const kpi of sampleKPIs) {
      const docRef = await addDoc(collection(db, 'kpis'), kpi);
      createdKPIs.push({ id: docRef.id, ...kpi });
      console.log(`✅ Đã tạo KPI: ${kpi.name} (${docRef.id})`);
    }
    
    console.log(`\n✅ Đã tạo ${createdKPIs.length} KPIs mẫu`);
    return createdKPIs;
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo KPIs:', error);
    throw error;
  }
}

async function assignKPIsToEmployees(kpis) {
  console.log('\n📋 BƯỚC 3: Gán KPIs cho nhân viên\n');
  
  try {
    // Get non-admin employees
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const nonAdminEmployees = employeesSnap.docs
      .filter(doc => doc.data().role !== 'admin')
      .map(doc => ({ id: doc.id, uid: doc.data().uid, ...doc.data() }));
    
    if (nonAdminEmployees.length === 0) {
      console.log('⚠️  Không có nhân viên nào để gán KPI');
      return;
    }
    
    console.log(`ℹ️  Tìm thấy ${nonAdminEmployees.length} nhân viên`);
    
    // Check if KPI records already exist
    const kpiRecordsSnap = await getDocs(collection(db, 'kpiRecords'));
    if (kpiRecordsSnap.size > 0) {
      console.log('ℹ️  KPI Records đã tồn tại, bỏ qua bước này');
      return;
    }
    
    let assignedCount = 0;
    
    for (const employee of nonAdminEmployees) {
      console.log(`\n👤 Gán KPIs cho: ${employee.name}`);
      
      for (const kpi of kpis) {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);
        
        const kpiRecord = {
          kpiId: kpi.id,
          employeeId: employee.uid || employee.id,
          period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
          target: kpi.target,
          actual: 0,
          status: 'not_started',
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          statusHistory: [
            {
              status: 'not_started',
              changedAt: now.toISOString(),
              changedBy: 'system',
              comment: 'KPI automatically assigned'
            }
          ],
          lastStatusChange: now.toISOString(),
          lastStatusChangedBy: 'system'
        };
        
        await addDoc(collection(db, 'kpiRecords'), kpiRecord);
        console.log(`   ✅ ${kpi.name}`);
        assignedCount++;
      }
    }
    
    console.log(`\n✅ Đã gán tổng cộng ${assignedCount} KPI assignments`);
    
  } catch (error) {
    console.error('❌ Lỗi khi gán KPIs:', error);
    throw error;
  }
}

async function createRewardProgram(departmentId) {
  console.log('\n📋 BƯỚC 4: Tạo Reward Program\n');
  
  try {
    // Check if reward programs already exist
    const rewardProgramsSnap = await getDocs(collection(db, 'rewardPrograms'));
    if (rewardProgramsSnap.size > 0) {
      console.log('ℹ️  Reward Programs đã tồn tại, bỏ qua bước này');
      return;
    }
    
    const rewardProgram = {
      name: 'Monthly Performance Rewards',
      description: 'Monthly rewards based on KPI achievement',
      position: 'All Positions',
      year: new Date().getFullYear(),
      frequency: 'monthly',
      isActive: true,
      criteria: [
        {
          id: 'cr1',
          name: 'Excellent Performance',
          description: 'Achieve 90% or above',
          type: 'kpi_score',
          condition: {
            operator: 'gte',
            value: 90
          },
          reward: 5000000,
          maxReward: 10000000,
          isActive: true
        },
        {
          id: 'cr2',
          name: 'Good Performance',
          description: 'Achieve 80-89%',
          type: 'kpi_score',
          condition: {
            operator: 'range',
            value: 80,
            secondValue: 89
          },
          reward: 3000000,
          maxReward: 5000000,
          isActive: true
        }
      ],
      penalties: [
        {
          id: 'p1',
          name: 'Poor Performance',
          description: 'Below 60%',
          type: 'kpi_score',
          condition: {
            operator: 'lt',
            value: 60
          },
          penalty: 2000000,
          maxPenalty: 5000000,
          isActive: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'rewardPrograms'), rewardProgram);
    console.log(`✅ Đã tạo Reward Program: ${rewardProgram.name} (${docRef.id})`);
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo Reward Program:', error);
    throw error;
  }
}

async function verifyDataConsistency() {
  console.log('\n📋 BƯỚC 5: Xác minh tính nhất quán dữ liệu\n');
  
  try {
    const [employeesSnap, departmentsSnap, kpisSnap, kpiRecordsSnap, rewardProgramsSnap] = await Promise.all([
      getDocs(collection(db, 'employees')),
      getDocs(collection(db, 'departments')),
      getDocs(collection(db, 'kpis')),
      getDocs(collection(db, 'kpiRecords')),
      getDocs(collection(db, 'rewardPrograms'))
    ]);
    
    console.log('📊 Thống kê sau khi sửa:\n');
    console.log(`   Departments: ${departmentsSnap.size}`);
    console.log(`   Employees: ${employeesSnap.size}`);
    console.log(`   KPIs: ${kpisSnap.size}`);
    console.log(`   KPI Records: ${kpiRecordsSnap.size}`);
    console.log(`   Reward Programs: ${rewardProgramsSnap.size}`);
    
    // Verify all employees have valid departmentId
    let validCount = 0;
    for (const empDoc of employeesSnap.docs) {
      const empData = empDoc.data();
      const deptExists = departmentsSnap.docs.find(d => d.id === empData.departmentId);
      if (deptExists) {
        validCount++;
      }
    }
    
    console.log(`\n✅ ${validCount}/${employeesSnap.size} employees có departmentId hợp lệ`);
    
    if (validCount === employeesSnap.size) {
      console.log('✅ Tất cả dữ liệu đã nhất quán!');
    } else {
      console.log('⚠️  Vẫn còn một số employees có departmentId không hợp lệ');
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi xác minh:', error);
    throw error;
  }
}

async function main() {
  try {
    const departmentId = await fixDepartmentReferences();
    const kpis = await createSampleKPIs(departmentId);
    await assignKPIsToEmployees(kpis);
    await createRewardProgram(departmentId);
    await verifyDataConsistency();
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 HOÀN TẤT SỬA LỖI TÍNH NHẤT QUÁN DỮ LIỆU!');
    console.log('='.repeat(80) + '\n');
    
    console.log('💡 Các bước tiếp theo:');
    console.log('   1. Khởi động lại server: npm run dev');
    console.log('   2. Đăng nhập vào hệ thống');
    console.log('   3. Kiểm tra KPIs trong giao diện admin và employee');
    console.log('   4. Chạy lại comprehensive check: node scripts/comprehensive-system-check.js\n');
    
  } catch (error) {
    console.error('\n❌ Lỗi nghiêm trọng:', error);
    process.exit(1);
  }
}

main();

