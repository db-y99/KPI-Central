const { initializeApp, getApps } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where,
  doc,
  getDoc 
} = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

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
const auth = getAuth(app);

// Core collections to check
const CORE_COLLECTIONS = [
  'departments',
  'employees',
  'kpis',
  'kpiRecords',
  'reports',
  'notifications',
  'notificationSettings',
  'rewardPrograms',
  'positionConfigs',
  'employeePoints',
  'rewardCalculations',
  'metricData'
];

const systemCheck = {
  timestamp: new Date().toISOString(),
  overall: 'PENDING',
  checks: {},
  issues: [],
  recommendations: []
};

// Helper functions
function logSection(title) {
  console.log('\n' + '='.repeat(80));
  console.log(`  ${title}`);
  console.log('='.repeat(80) + '\n');
}

function logSuccess(message) {
  console.log('✅', message);
}

function logWarning(message) {
  console.log('⚠️', message);
  systemCheck.issues.push({ type: 'WARNING', message });
}

function logError(message) {
  console.log('❌', message);
  systemCheck.issues.push({ type: 'ERROR', message });
}

function logInfo(message) {
  console.log('ℹ️', message);
}

// 1. Check Firebase Connection
async function checkFirebaseConnection() {
  logSection('1. KIỂM TRA KẾT NỐI FIREBASE');
  
  try {
    const testRef = collection(db, 'employees');
    const snapshot = await getDocs(testRef);
    
    logSuccess(`Kết nối Firebase thành công`);
    logInfo(`Project ID: ${firebaseConfig.projectId}`);
    logInfo(`Có thể truy vấn collection: ${snapshot.size} documents`);
    systemCheck.checks.firebaseConnection = 'PASSED';
    return true;
  } catch (error) {
    logError(`Lỗi kết nối Firebase: ${error.message}`);
    systemCheck.checks.firebaseConnection = 'FAILED';
    return false;
  }
}

// 2. Check Collections Structure
async function checkCollectionsStructure() {
  logSection('2. KIỂM TRA CẤU TRÚC COLLECTIONS');
  
  const collectionStats = {};
  
  for (const collectionName of CORE_COLLECTIONS) {
    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      const count = snapshot.size;
      
      collectionStats[collectionName] = {
        exists: true,
        documentCount: count,
        status: count > 0 ? 'HAS_DATA' : 'EMPTY'
      };
      
      if (count > 0) {
        logSuccess(`${collectionName}: ${count} documents`);
      } else {
        logWarning(`${collectionName}: Trống (chưa có dữ liệu)`);
      }
    } catch (error) {
      collectionStats[collectionName] = {
        exists: false,
        error: error.message
      };
      logError(`${collectionName}: Lỗi - ${error.message}`);
    }
  }
  
  systemCheck.checks.collections = collectionStats;
  return collectionStats;
}

// 3. Check Data Relationships
async function checkDataRelationships() {
  logSection('3. KIỂM TRA QUAN HỆ DỮ LIỆU');
  
  const relationships = {};
  
  try {
    // Get all data
    const [employeesSnap, kpisSnap, kpiRecordsSnap, departmentsSnap] = await Promise.all([
      getDocs(collection(db, 'employees')),
      getDocs(collection(db, 'kpis')),
      getDocs(collection(db, 'kpiRecords')),
      getDocs(collection(db, 'departments'))
    ]);
    
    const employees = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const kpis = kpisSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const kpiRecords = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const departments = departmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    logInfo(`Tổng số employees: ${employees.length}`);
    logInfo(`Tổng số departments: ${departments.length}`);
    logInfo(`Tổng số KPIs: ${kpis.length}`);
    logInfo(`Tổng số KPI Records: ${kpiRecords.length}`);
    
    // Check employee-department relationships
    let orphanedEmployees = 0;
    for (const emp of employees) {
      if (emp.departmentId && !departments.find(d => d.id === emp.departmentId)) {
        orphanedEmployees++;
        logWarning(`Employee ${emp.name} (${emp.id}) có departmentId không hợp lệ: ${emp.departmentId}`);
      }
    }
    
    relationships.orphanedEmployees = orphanedEmployees;
    
    // Check KPI-employee relationships
    let orphanedKpiRecords = 0;
    let invalidKpiReferences = 0;
    
    for (const record of kpiRecords) {
      const employeeExists = employees.find(e => e.uid === record.employeeId || e.id === record.employeeId);
      if (!employeeExists) {
        orphanedKpiRecords++;
        logWarning(`KPI Record ${record.id} tham chiếu đến employee không tồn tại: ${record.employeeId}`);
      }
      
      const kpiExists = kpis.find(k => k.id === record.kpiId);
      if (!kpiExists) {
        invalidKpiReferences++;
        logWarning(`KPI Record ${record.id} tham chiếu đến KPI không tồn tại: ${record.kpiId}`);
      }
    }
    
    relationships.orphanedKpiRecords = orphanedKpiRecords;
    relationships.invalidKpiReferences = invalidKpiReferences;
    
    // Check KPI status consistency
    const statusDistribution = {};
    for (const record of kpiRecords) {
      const status = record.status || 'undefined';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    }
    
    logInfo('\nPhân bố trạng thái KPI Records:');
    for (const [status, count] of Object.entries(statusDistribution)) {
      console.log(`  - ${status}: ${count}`);
    }
    
    relationships.statusDistribution = statusDistribution;
    
    // Summary
    if (orphanedEmployees === 0 && orphanedKpiRecords === 0 && invalidKpiReferences === 0) {
      logSuccess('Tất cả quan hệ dữ liệu đều hợp lệ');
      systemCheck.checks.dataRelationships = 'PASSED';
    } else {
      logError(`Phát hiện ${orphanedEmployees + orphanedKpiRecords + invalidKpiReferences} vấn đề về quan hệ dữ liệu`);
      systemCheck.checks.dataRelationships = 'FAILED';
    }
    
    return relationships;
    
  } catch (error) {
    logError(`Lỗi khi kiểm tra quan hệ dữ liệu: ${error.message}`);
    systemCheck.checks.dataRelationships = 'ERROR';
    return null;
  }
}

// 4. Check Authentication Flow
async function checkAuthenticationFlow() {
  logSection('4. KIỂM TRA LUỒNG AUTHENTICATION');
  
  try {
    // Get admin credentials from environment or use default
    const adminEmail = process.env.ADMIN_EMAIL || 'db@y99.vn';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Dby996868@';
    
    logInfo(`Thử đăng nhập với admin: ${adminEmail}`);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      logSuccess(`✅ Đăng nhập thành công - UID: ${userCredential.user.uid}`);
      
      // Check if user exists in employees collection
      const employeeQuery = query(
        collection(db, 'employees'),
        where('uid', '==', userCredential.user.uid)
      );
      const employeeSnap = await getDocs(employeeQuery);
      
      if (!employeeSnap.empty) {
        const employeeData = employeeSnap.docs[0].data();
        logSuccess(`Employee record tìm thấy - Role: ${employeeData.role}`);
        
        if (employeeData.role === 'admin') {
          logSuccess('Xác nhận quyền admin');
        } else {
          logWarning('User không có quyền admin');
        }
      } else {
        logError('Không tìm thấy employee record trong Firestore');
      }
      
      // Sign out
      await auth.signOut();
      logInfo('Đăng xuất thành công');
      
      systemCheck.checks.authentication = 'PASSED';
      return true;
      
    } catch (authError) {
      logError(`Lỗi đăng nhập: ${authError.code} - ${authError.message}`);
      
      if (authError.code === 'auth/user-not-found') {
        systemCheck.recommendations.push('Cần tạo tài khoản admin trong Firebase Authentication');
      } else if (authError.code === 'auth/wrong-password') {
        systemCheck.recommendations.push('Mật khẩu admin không đúng, cần reset');
      } else if (authError.code === 'auth/invalid-api-key') {
        systemCheck.recommendations.push('Firebase API key không hợp lệ, kiểm tra cấu hình .env.local');
      }
      
      systemCheck.checks.authentication = 'FAILED';
      return false;
    }
    
  } catch (error) {
    logError(`Lỗi khi kiểm tra authentication: ${error.message}`);
    systemCheck.checks.authentication = 'ERROR';
    return false;
  }
}

// 5. Check KPI Workflow
async function checkKpiWorkflow() {
  logSection('5. KIỂM TRA LUỒNG KPI WORKFLOW');
  
  try {
    const [kpisSnap, kpiRecordsSnap, employeesSnap] = await Promise.all([
      getDocs(collection(db, 'kpis')),
      getDocs(collection(db, 'kpiRecords')),
      getDocs(collection(db, 'employees'))
    ]);
    
    const kpis = kpisSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const kpiRecords = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const employees = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const workflow = {
      totalKpis: kpis.length,
      activeKpis: kpis.filter(k => k.isActive).length,
      assignedKpis: kpiRecords.length,
      employeesWithKpis: new Set(kpiRecords.map(r => r.employeeId)).size,
      totalEmployees: employees.filter(e => e.role !== 'admin').length
    };
    
    logInfo(`Total KPIs defined: ${workflow.totalKpis}`);
    logInfo(`Active KPIs: ${workflow.activeKpis}`);
    logInfo(`KPI assignments: ${workflow.assignedKpis}`);
    logInfo(`Employees with KPIs: ${workflow.employeesWithKpis}/${workflow.totalEmployees}`);
    
    // Check for employees without KPIs
    const nonAdminEmployees = employees.filter(e => e.role !== 'admin');
    const employeesWithoutKpis = nonAdminEmployees.filter(emp => {
      return !kpiRecords.some(r => r.employeeId === emp.uid || r.employeeId === emp.id);
    });
    
    if (employeesWithoutKpis.length > 0) {
      logWarning(`${employeesWithoutKpis.length} nhân viên chưa được giao KPI:`);
      employeesWithoutKpis.forEach(emp => {
        console.log(`   - ${emp.name} (${emp.email})`);
      });
    } else {
      logSuccess('Tất cả nhân viên đều đã được giao KPI');
    }
    
    // Check KPI status transitions
    const validStatuses = ['not_started', 'in_progress', 'submitted', 'approved', 'rejected'];
    const invalidStatuses = kpiRecords.filter(r => !validStatuses.includes(r.status));
    
    if (invalidStatuses.length > 0) {
      logWarning(`${invalidStatuses.length} KPI records có trạng thái không hợp lệ`);
    } else {
      logSuccess('Tất cả KPI records có trạng thái hợp lệ');
    }
    
    systemCheck.checks.kpiWorkflow = workflow;
    return workflow;
    
  } catch (error) {
    logError(`Lỗi khi kiểm tra KPI workflow: ${error.message}`);
    systemCheck.checks.kpiWorkflow = 'ERROR';
    return null;
  }
}

// 6. Check Rewards & Penalties
async function checkRewardsPenalties() {
  logSection('6. KIỂM TRA HỆ THỐNG THƯỞNG PHẠT');
  
  try {
    const [rewardProgramsSnap, rewardCalculationsSnap, kpiRecordsSnap] = await Promise.all([
      getDocs(collection(db, 'rewardPrograms')),
      getDocs(collection(db, 'rewardCalculations')),
      getDocs(collection(db, 'kpiRecords'))
    ]);
    
    const rewardPrograms = rewardProgramsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const rewardCalculations = rewardCalculationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const kpiRecords = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    logInfo(`Reward programs: ${rewardPrograms.length}`);
    logInfo(`Reward calculations: ${rewardCalculations.length}`);
    
    // Check if KPIs have reward/penalty configured
    const kpisWithRewards = kpiRecordsSnap.docs.filter(doc => {
      const data = doc.data();
      return data.rewardAmount !== undefined || data.penaltyAmount !== undefined;
    }).length;
    
    logInfo(`KPI records với thưởng/phạt: ${kpisWithRewards}/${kpiRecords.length}`);
    
    if (rewardPrograms.length === 0) {
      logWarning('Chưa có reward program nào được cấu hình');
      systemCheck.recommendations.push('Tạo reward programs để tự động tính thưởng/phạt');
    }
    
    systemCheck.checks.rewardsPenalties = {
      rewardPrograms: rewardPrograms.length,
      calculations: rewardCalculations.length,
      kpisWithRewards
    };
    
    return true;
    
  } catch (error) {
    logError(`Lỗi khi kiểm tra rewards/penalties: ${error.message}`);
    systemCheck.checks.rewardsPenalties = 'ERROR';
    return false;
  }
}

// 7. Check Data Synchronization
async function checkDataSynchronization() {
  logSection('7. KIỂM TRA ĐỒNG BỘ DỮ LIỆU');
  
  try {
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const employees = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Check for duplicate employees
    const emailMap = {};
    const duplicateEmails = [];
    
    employees.forEach(emp => {
      if (emailMap[emp.email]) {
        duplicateEmails.push(emp.email);
      }
      emailMap[emp.email] = (emailMap[emp.email] || 0) + 1;
    });
    
    if (duplicateEmails.length > 0) {
      logWarning(`Phát hiện ${duplicateEmails.length} email trùng lặp`);
      duplicateEmails.forEach(email => {
        console.log(`   - ${email}`);
      });
    } else {
      logSuccess('Không có email trùng lặp');
    }
    
    // Check for inconsistent data
    const inconsistentEmployees = employees.filter(emp => {
      return !emp.name || !emp.email || !emp.departmentId || !emp.position;
    });
    
    if (inconsistentEmployees.length > 0) {
      logWarning(`${inconsistentEmployees.length} employee có dữ liệu không đầy đủ`);
    } else {
      logSuccess('Tất cả employee có dữ liệu đầy đủ');
    }
    
    systemCheck.checks.dataSynchronization = {
      duplicateEmails: duplicateEmails.length,
      inconsistentRecords: inconsistentEmployees.length
    };
    
    return true;
    
  } catch (error) {
    logError(`Lỗi khi kiểm tra đồng bộ dữ liệu: ${error.message}`);
    systemCheck.checks.dataSynchronization = 'ERROR';
    return false;
  }
}

// Main execution
async function runComprehensiveCheck() {
  console.clear();
  logSection('🔍 KIỂM TRA TOÀN DIỆN HỆ THỐNG KPI CENTRAL');
  
  console.log(`Thời gian bắt đầu: ${new Date().toLocaleString('vi-VN')}\n`);
  
  try {
    // Run all checks
    await checkFirebaseConnection();
    await checkCollectionsStructure();
    await checkDataRelationships();
    await checkAuthenticationFlow();
    await checkKpiWorkflow();
    await checkRewardsPenalties();
    await checkDataSynchronization();
    
    // Final summary
    logSection('📊 TỔNG KẾT KẾT QUẢ KIỂM TRA');
    
    const totalChecks = Object.keys(systemCheck.checks).length;
    const passedChecks = Object.values(systemCheck.checks).filter(v => v === 'PASSED').length;
    const failedChecks = Object.values(systemCheck.checks).filter(v => v === 'FAILED').length;
    const errorChecks = Object.values(systemCheck.checks).filter(v => v === 'ERROR').length;
    
    console.log(`\nTổng số kiểm tra: ${totalChecks}`);
    console.log(`✅ Passed: ${passedChecks}`);
    console.log(`❌ Failed: ${failedChecks}`);
    console.log(`⚠️  Errors: ${errorChecks}`);
    
    // Issues summary
    if (systemCheck.issues.length > 0) {
      console.log(`\n⚠️  Tổng số vấn đề phát hiện: ${systemCheck.issues.length}`);
      
      const errors = systemCheck.issues.filter(i => i.type === 'ERROR');
      const warnings = systemCheck.issues.filter(i => i.type === 'WARNING');
      
      if (errors.length > 0) {
        console.log(`\nLỗi nghiêm trọng (${errors.length}):`);
        errors.forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue.message}`);
        });
      }
      
      if (warnings.length > 0) {
        console.log(`\nCảnh báo (${warnings.length}):`);
        warnings.forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue.message}`);
        });
      }
    } else {
      logSuccess('\nKhông phát hiện vấn đề nào!');
    }
    
    // Recommendations
    if (systemCheck.recommendations.length > 0) {
      console.log(`\n💡 Khuyến nghị (${systemCheck.recommendations.length}):`);
      systemCheck.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    // Overall status
    if (failedChecks === 0 && errorChecks === 0) {
      systemCheck.overall = 'HEALTHY';
      console.log('\n🎉 HỆ THỐNG HOẠT ĐỘNG TỐT!\n');
    } else if (failedChecks > 0 || errorChecks > 2) {
      systemCheck.overall = 'CRITICAL';
      console.log('\n🚨 HỆ THỐNG CÓ VẤN ĐỀ NGHIÊM TRỌNG!\n');
    } else {
      systemCheck.overall = 'WARNING';
      console.log('\n⚠️  HỆ THỐNG CẦN ĐƯỢC KIỂM TRA VÀ TỐI ƯU HÓA\n');
    }
    
    console.log(`Thời gian kết thúc: ${new Date().toLocaleString('vi-VN')}\n`);
    
    // Save report
    const fs = require('fs');
    const reportPath = 'COMPREHENSIVE-SYSTEM-CHECK-REPORT.md';
    
    const report = generateMarkdownReport(systemCheck);
    fs.writeFileSync(reportPath, report);
    
    console.log(`📄 Báo cáo chi tiết đã được lưu tại: ${reportPath}\n`);
    
  } catch (error) {
    console.error('\n❌ Lỗi khi chạy kiểm tra:', error);
    process.exit(1);
  }
}

function generateMarkdownReport(check) {
  const timestamp = new Date(check.timestamp).toLocaleString('vi-VN');
  
  let report = `# BÁO CÁO KIỂM TRA TOÀN DIỆN HỆ THỐNG KPI CENTRAL\n\n`;
  report += `**Thời gian:** ${timestamp}\n`;
  report += `**Trạng thái tổng thể:** ${check.overall}\n\n`;
  report += `---\n\n`;
  
  report += `## 📋 TỔNG QUAN\n\n`;
  
  const totalChecks = Object.keys(check.checks).length;
  const passedChecks = Object.values(check.checks).filter(v => v === 'PASSED').length;
  const failedChecks = Object.values(check.checks).filter(v => v === 'FAILED').length;
  
  report += `- **Tổng số kiểm tra:** ${totalChecks}\n`;
  report += `- **Passed:** ${passedChecks} ✅\n`;
  report += `- **Failed:** ${failedChecks} ❌\n`;
  report += `- **Vấn đề phát hiện:** ${check.issues.length}\n\n`;
  
  report += `## 🔍 CHI TIẾT KIỂM TRA\n\n`;
  
  for (const [checkName, result] of Object.entries(check.checks)) {
    const icon = result === 'PASSED' ? '✅' : result === 'FAILED' ? '❌' : '⚠️';
    report += `### ${icon} ${checkName}\n\n`;
    
    if (typeof result === 'object') {
      report += '```json\n';
      report += JSON.stringify(result, null, 2);
      report += '\n```\n\n';
    } else {
      report += `**Trạng thái:** ${result}\n\n`;
    }
  }
  
  if (check.issues.length > 0) {
    report += `## ⚠️ VẤN ĐỀ PHÁT HIỆN\n\n`;
    
    const errors = check.issues.filter(i => i.type === 'ERROR');
    const warnings = check.issues.filter(i => i.type === 'WARNING');
    
    if (errors.length > 0) {
      report += `### ❌ Lỗi nghiêm trọng (${errors.length})\n\n`;
      errors.forEach((issue, index) => {
        report += `${index + 1}. ${issue.message}\n`;
      });
      report += '\n';
    }
    
    if (warnings.length > 0) {
      report += `### ⚠️ Cảnh báo (${warnings.length})\n\n`;
      warnings.forEach((issue, index) => {
        report += `${index + 1}. ${issue.message}\n`;
      });
      report += '\n';
    }
  }
  
  if (check.recommendations.length > 0) {
    report += `## 💡 KHUYẾN NGHỊ\n\n`;
    check.recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
    report += '\n';
  }
  
  report += `## 🎯 KẾT LUẬN\n\n`;
  
  if (check.overall === 'HEALTHY') {
    report += `Hệ thống đang hoạt động tốt. Tất cả các kiểm tra đều passed và không có vấn đề nghiêm trọng nào được phát hiện.\n\n`;
  } else if (check.overall === 'CRITICAL') {
    report += `Hệ thống có vấn đề nghiêm trọng cần được giải quyết ngay lập tức. Vui lòng xem xét các lỗi và khuyến nghị ở trên.\n\n`;
  } else {
    report += `Hệ thống đang hoạt động nhưng cần được tối ưu hóa. Xem xét các cảnh báo và khuyến nghị để cải thiện hiệu suất.\n\n`;
  }
  
  return report;
}

// Run the check
runComprehensiveCheck().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

