const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

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

const audit = {
  timestamp: new Date().toISOString(),
  sections: {},
  issues: [],
  recommendations: [],
  score: 0,
  maxScore: 0
};

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  console.log(`  ${title}`);
  console.log('='.repeat(80) + '\n');
}

function score(points, max, message) {
  audit.score += points;
  audit.maxScore += max;
  const percentage = Math.round((points / max) * 100);
  const icon = percentage === 100 ? '✅' : percentage >= 80 ? '🟢' : percentage >= 60 ? '🟡' : '🔴';
  console.log(`${icon} ${message} (${points}/${max} points)`);
}

function issue(severity, message) {
  audit.issues.push({ severity, message });
  console.log(`   ⚠️  ${severity}: ${message}`);
}

function recommend(message) {
  audit.recommendations.push(message);
}

// 1. Check API Endpoints
async function checkAPIEndpoints() {
  logSection('1. KIỂM TRA API ENDPOINTS');
  
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
  const endpoints = [];
  
  function scanDirectory(dir, basePath = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, path.join(basePath, item));
      } else if (item === 'route.ts') {
        endpoints.push(basePath || 'root');
      }
    }
  }
  
  try {
    scanDirectory(apiDir);
    
    console.log(`Tìm thấy ${endpoints.length} API endpoints:\n`);
    endpoints.forEach(ep => console.log(`   - /api/${ep}`));
    
    // Check each endpoint file
    const checks = {
      hasErrorHandling: 0,
      hasValidation: 0,
      hasAuth: 0,
      hasLogging: 0
    };
    
    console.log('\nKiểm tra chất lượng code:\n');
    
    for (const endpoint of endpoints) {
      const routePath = path.join(apiDir, endpoint, 'route.ts');
      const content = fs.readFileSync(routePath, 'utf8');
      
      // Check for error handling
      if (content.includes('try') && content.includes('catch')) {
        checks.hasErrorHandling++;
      }
      
      // Check for validation
      if (content.includes('validate') || content.includes('schema') || content.includes('zod')) {
        checks.hasValidation++;
      }
      
      // Check for auth
      if (content.includes('auth') || content.includes('requireAuth') || content.includes('withSecurity')) {
        checks.hasAuth++;
      }
      
      // Check for logging
      if (content.includes('console.log') || content.includes('logApiAccess')) {
        checks.hasLogging++;
      }
    }
    
    const total = endpoints.length;
    
    score(checks.hasErrorHandling, total, `Error handling: ${checks.hasErrorHandling}/${total} endpoints`);
    score(checks.hasValidation, total, `Input validation: ${checks.hasValidation}/${total} endpoints`);
    score(checks.hasAuth, total, `Authentication: ${checks.hasAuth}/${total} endpoints`);
    score(checks.hasLogging, total, `Logging: ${checks.hasLogging}/${total} endpoints`);
    
    if (checks.hasErrorHandling < total) {
      issue('MEDIUM', `${total - checks.hasErrorHandling} endpoints thiếu error handling`);
      recommend('Thêm try-catch blocks cho tất cả API endpoints');
    }
    
    if (checks.hasValidation < total) {
      issue('MEDIUM', `${total - checks.hasValidation} endpoints thiếu input validation`);
      recommend('Sử dụng Zod hoặc validation library cho input validation');
    }
    
    audit.sections.apiEndpoints = {
      total: endpoints.length,
      endpoints: endpoints,
      checks: checks
    };
    
  } catch (error) {
    console.error('Lỗi khi kiểm tra API endpoints:', error);
  }
}

// 2. Check Components
async function checkComponents() {
  logSection('2. KIỂM TRA COMPONENTS');
  
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  
  try {
    const files = fs.readdirSync(componentsDir).filter(f => 
      f.endsWith('.tsx') || f.endsWith('.ts')
    );
    
    console.log(`Tìm thấy ${files.length} component files\n`);
    
    const checks = {
      hasTypeScript: 0,
      hasProperExport: 0,
      hasErrorBoundary: 0,
      hasAccessibility: 0,
      hasI18n: 0
    };
    
    for (const file of files) {
      const filePath = path.join(componentsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check TypeScript usage
      if (file.endsWith('.tsx') && content.includes('interface') || content.includes('type ')) {
        checks.hasTypeScript++;
      }
      
      // Check proper exports
      if (content.includes('export default') || content.includes('export function')) {
        checks.hasProperExport++;
      }
      
      // Check error boundary
      if (content.includes('ErrorBoundary') || content.includes('try') || content.includes('Suspense')) {
        checks.hasErrorBoundary++;
      }
      
      // Check accessibility
      if (content.includes('aria-') || content.includes('role=') || content.includes('alt=')) {
        checks.hasAccessibility++;
      }
      
      // Check i18n
      if (content.includes('useLanguage') || content.includes('t(') || content.includes('t.')) {
        checks.hasI18n++;
      }
    }
    
    const total = files.length;
    
    score(checks.hasTypeScript, total, `TypeScript types: ${checks.hasTypeScript}/${total} components`);
    score(checks.hasProperExport, total, `Proper exports: ${checks.hasProperExport}/${total} components`);
    score(checks.hasErrorBoundary, total, `Error handling: ${checks.hasErrorBoundary}/${total} components`);
    score(checks.hasAccessibility, total, `Accessibility: ${checks.hasAccessibility}/${total} components`);
    score(checks.hasI18n, total, `Internationalization: ${checks.hasI18n}/${total} components`);
    
    if (checks.hasAccessibility < total * 0.8) {
      issue('LOW', 'Nhiều components thiếu accessibility attributes');
      recommend('Thêm aria-labels, roles, và alt text cho accessibility');
    }
    
    audit.sections.components = {
      total: files.length,
      checks: checks
    };
    
  } catch (error) {
    console.error('Lỗi khi kiểm tra components:', error);
  }
}

// 3. Check Security
async function checkSecurity() {
  logSection('3. KIỂM TRA SECURITY');
  
  const securityChecks = {
    firestoreRules: false,
    envVariables: false,
    jwtImplementation: false,
    rateLimit: false,
    inputSanitization: false,
    xssProtection: false,
    csrfProtection: false
  };
  
  // Check Firestore rules
  try {
    const rulesPath = path.join(process.cwd(), 'firestore.rules');
    if (fs.existsSync(rulesPath)) {
      const rules = fs.readFileSync(rulesPath, 'utf8');
      securityChecks.firestoreRules = rules.includes('isAdmin') && rules.includes('isAuthenticated');
    }
  } catch (error) {
    console.error('Lỗi khi đọc firestore.rules');
  }
  
  // Check env variables
  try {
    const envExample = path.join(process.cwd(), 'env.example');
    if (fs.existsSync(envExample)) {
      securityChecks.envVariables = true;
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra env.example');
  }
  
  // Check JWT implementation
  try {
    const jwtPath = path.join(process.cwd(), 'src', 'lib', 'jwt.ts');
    if (fs.existsSync(jwtPath)) {
      const jwt = fs.readFileSync(jwtPath, 'utf8');
      securityChecks.jwtImplementation = jwt.includes('validateToken') && jwt.includes('generateToken');
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra JWT');
  }
  
  // Check rate limiting
  try {
    const apiSecPath = path.join(process.cwd(), 'src', 'lib', 'api-security.ts');
    if (fs.existsSync(apiSecPath)) {
      const apiSec = fs.readFileSync(apiSecPath, 'utf8');
      securityChecks.rateLimit = apiSec.includes('rateLimit') || apiSec.includes('RateLimit');
      securityChecks.inputSanitization = apiSec.includes('sanitize') || apiSec.includes('validate');
      securityChecks.xssProtection = apiSec.includes('xss') || apiSec.includes('sanitize');
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra API security');
  }
  
  // CSRF protection check
  const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
  if (fs.existsSync(nextConfigPath)) {
    const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    securityChecks.csrfProtection = nextConfig.includes('csrf') || nextConfig.includes('security');
  }
  
  // Score each check
  const checkCount = Object.keys(securityChecks).length;
  const passedCount = Object.values(securityChecks).filter(v => v).length;
  
  console.log('Kiểm tra bảo mật:\n');
  
  for (const [key, passed] of Object.entries(securityChecks)) {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${key}: ${passed ? 'PASS' : 'FAIL'}`);
  }
  
  score(passedCount, checkCount, `\nTổng điểm security: ${passedCount}/${checkCount}`);
  
  if (!securityChecks.firestoreRules) {
    issue('HIGH', 'Firestore rules chưa được cấu hình đầy đủ');
    recommend('Thêm helper functions isAdmin() và isAuthenticated() vào Firestore rules');
  }
  
  if (!securityChecks.rateLimit) {
    issue('MEDIUM', 'Rate limiting chưa được implement');
    recommend('Thêm rate limiting middleware cho API endpoints');
  }
  
  if (!securityChecks.csrfProtection) {
    issue('MEDIUM', 'CSRF protection chưa rõ ràng');
    recommend('Xem xét thêm CSRF protection cho forms');
  }
  
  audit.sections.security = securityChecks;
}

// 4. Check Performance
async function checkPerformance() {
  logSection('4. KIỂM TRA PERFORMANCE & OPTIMIZATION');
  
  const performanceChecks = {
    dynamicImports: 0,
    imageOptimization: 0,
    codeSpitting: 0,
    lazyLoading: 0,
    caching: 0,
    memoization: 0
  };
  
  // Scan all TypeScript/TSX files
  function scanForPerformance(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      if (item === 'node_modules' || item === '.next') continue;
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanForPerformance(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        if (content.includes('dynamic(') || content.includes('import(')) {
          performanceChecks.dynamicImports++;
        }
        
        if (content.includes('Image') && content.includes('next/image')) {
          performanceChecks.imageOptimization++;
        }
        
        if (content.includes('React.lazy') || content.includes('Suspense')) {
          performanceChecks.lazyLoading++;
        }
        
        if (content.includes('useMemo') || content.includes('useCallback') || content.includes('memo(')) {
          performanceChecks.memoization++;
        }
        
        if (content.includes('cache') || content.includes('Cache')) {
          performanceChecks.caching++;
        }
      }
    }
  }
  
  const srcDir = path.join(process.cwd(), 'src');
  scanForPerformance(srcDir);
  
  console.log('Optimization techniques detected:\n');
  
  for (const [key, count] of Object.entries(performanceChecks)) {
    const icon = count > 0 ? '✅' : '⚠️';
    console.log(`${icon} ${key}: ${count} usages`);
  }
  
  const totalOptimizations = Object.values(performanceChecks).reduce((a, b) => a + b, 0);
  score(Math.min(totalOptimizations, 20), 20, `\nTổng optimization techniques: ${totalOptimizations}`);
  
  if (performanceChecks.dynamicImports < 3) {
    recommend('Xem xét thêm dynamic imports cho code splitting');
  }
  
  if (performanceChecks.memoization < 5) {
    recommend('Sử dụng useMemo/useCallback để tối ưu re-renders');
  }
  
  audit.sections.performance = performanceChecks;
}

// 5. Check Data Integrity
async function checkDataIntegrity() {
  logSection('5. KIỂM TRA DATA INTEGRITY');
  
  try {
    // Check for orphaned records
    const [employeesSnap, kpisSnap, kpiRecordsSnap, departmentsSnap] = await Promise.all([
      getDocs(collection(db, 'employees')),
      getDocs(collection(db, 'kpis')),
      getDocs(collection(db, 'kpiRecords')),
      getDocs(collection(db, 'departments'))
    ]);
    
    const employees = employeesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const kpis = kpisSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const kpiRecords = kpiRecordsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const departments = departmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    let integrityScore = 0;
    const maxIntegrityScore = 5;
    
    // Check 1: All employees have valid departments
    const employeesWithInvalidDept = employees.filter(emp => 
      !departments.find(dept => dept.id === emp.departmentId)
    );
    
    if (employeesWithInvalidDept.length === 0) {
      integrityScore++;
      console.log('✅ Tất cả employees có department hợp lệ');
    } else {
      console.log(`❌ ${employeesWithInvalidDept.length} employees có department không hợp lệ`);
      issue('HIGH', `${employeesWithInvalidDept.length} employees có department ID không tồn tại`);
    }
    
    // Check 2: All KPI records have valid employee references
    const orphanedKpiRecords = kpiRecords.filter(record => 
      !employees.find(emp => emp.uid === record.employeeId || emp.id === record.employeeId)
    );
    
    if (orphanedKpiRecords.length === 0) {
      integrityScore++;
      console.log('✅ Tất cả KPI records có employee hợp lệ');
    } else {
      console.log(`❌ ${orphanedKpiRecords.length} KPI records có employee không hợp lệ`);
      issue('HIGH', `${orphanedKpiRecords.length} KPI records orphaned`);
    }
    
    // Check 3: All KPI records have valid KPI references
    const invalidKpiRecords = kpiRecords.filter(record => 
      !kpis.find(kpi => kpi.id === record.kpiId)
    );
    
    if (invalidKpiRecords.length === 0) {
      integrityScore++;
      console.log('✅ Tất cả KPI records có KPI definition hợp lệ');
    } else {
      console.log(`❌ ${invalidKpiRecords.length} KPI records có KPI không hợp lệ`);
      issue('HIGH', `${invalidKpiRecords.length} KPI records có KPI ID không tồn tại`);
    }
    
    // Check 4: No duplicate employee emails
    const emailMap = {};
    const duplicates = [];
    
    employees.forEach(emp => {
      if (emailMap[emp.email]) {
        duplicates.push(emp.email);
      }
      emailMap[emp.email] = true;
    });
    
    if (duplicates.length === 0) {
      integrityScore++;
      console.log('✅ Không có email trùng lặp');
    } else {
      console.log(`❌ ${duplicates.length} emails bị trùng lặp`);
      issue('MEDIUM', `${duplicates.length} emails trùng lặp trong hệ thống`);
    }
    
    // Check 5: All records have required fields
    const incompleteEmployees = employees.filter(emp => 
      !emp.name || !emp.email || !emp.role
    );
    
    if (incompleteEmployees.length === 0) {
      integrityScore++;
      console.log('✅ Tất cả employees có dữ liệu đầy đủ');
    } else {
      console.log(`❌ ${incompleteEmployees.length} employees thiếu dữ liệu bắt buộc`);
      issue('MEDIUM', `${incompleteEmployees.length} employees có dữ liệu không đầy đủ`);
    }
    
    score(integrityScore, maxIntegrityScore, `\nĐiểm data integrity: ${integrityScore}/${maxIntegrityScore}`);
    
    audit.sections.dataIntegrity = {
      employeesWithInvalidDept: employeesWithInvalidDept.length,
      orphanedKpiRecords: orphanedKpiRecords.length,
      invalidKpiRecords: invalidKpiRecords.length,
      duplicateEmails: duplicates.length,
      incompleteEmployees: incompleteEmployees.length
    };
    
  } catch (error) {
    console.error('Lỗi khi kiểm tra data integrity:', error);
    score(0, 5, 'Data integrity check failed');
  }
}

// Generate final report
function generateFinalReport() {
  logSection('📊 KẾT QUẢ TỔNG THỂ');
  
  const percentage = Math.round((audit.score / audit.maxScore) * 100);
  let grade = 'F';
  let status = '🔴 CẦN CẢI THIỆN NGHIÊM TRỌNG';
  
  if (percentage >= 90) {
    grade = 'A';
    status = '🎉 XUẤT SẮC';
  } else if (percentage >= 80) {
    grade = 'B';
    status = '✅ TỐT';
  } else if (percentage >= 70) {
    grade = 'C';
    status = '🟡 KHÁ';
  } else if (percentage >= 60) {
    grade = 'D';
    status = '🟠 TRUNG BÌNH';
  }
  
  console.log(`Điểm số: ${audit.score}/${audit.maxScore} (${percentage}%)`);
  console.log(`Xếp loại: ${grade}`);
  console.log(`Trạng thái: ${status}\n`);
  
  // Issues summary
  const criticalIssues = audit.issues.filter(i => i.severity === 'HIGH');
  const mediumIssues = audit.issues.filter(i => i.severity === 'MEDIUM');
  const lowIssues = audit.issues.filter(i => i.severity === 'LOW');
  
  console.log(`Vấn đề phát hiện:`);
  console.log(`  🔴 Critical: ${criticalIssues.length}`);
  console.log(`  🟡 Medium: ${mediumIssues.length}`);
  console.log(`  🟢 Low: ${lowIssues.length}`);
  
  if (criticalIssues.length > 0) {
    console.log(`\n🔴 Vấn đề CRITICAL cần sửa ngay:`);
    criticalIssues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue.message}`);
    });
  }
  
  if (audit.recommendations.length > 0) {
    console.log(`\n💡 Khuyến nghị (${audit.recommendations.length}):`);
    audit.recommendations.slice(0, 10).forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }
  
  // Save report
  const reportPath = 'DEEP-SYSTEM-AUDIT-REPORT.md';
  const markdown = generateMarkdownReport(audit, percentage, grade, status);
  fs.writeFileSync(reportPath, markdown);
  
  console.log(`\n📄 Báo cáo chi tiết: ${reportPath}\n`);
}

function generateMarkdownReport(audit, percentage, grade, status) {
  let md = `# BÁO CÁO KIỂM TRA SÂU HỆ THỐNG KPI CENTRAL\n\n`;
  md += `**Thời gian:** ${new Date(audit.timestamp).toLocaleString('vi-VN')}\n`;
  md += `**Điểm số:** ${audit.score}/${audit.maxScore} (${percentage}%)\n`;
  md += `**Xếp loại:** ${grade}\n`;
  md += `**Trạng thái:** ${status}\n\n`;
  md += `---\n\n`;
  
  md += `## 📊 TỔNG QUAN\n\n`;
  md += `| Tiêu chí | Điểm | Tỷ lệ |\n`;
  md += `|----------|------|-------|\n`;
  
  // Calculate section scores
  for (const [section, data] of Object.entries(audit.sections)) {
    md += `| ${section} | - | - |\n`;
  }
  
  md += `\n## ⚠️ VẤN ĐỀ PHÁT HIỆN (${audit.issues.length})\n\n`;
  
  const criticalIssues = audit.issues.filter(i => i.severity === 'HIGH');
  const mediumIssues = audit.issues.filter(i => i.severity === 'MEDIUM');
  const lowIssues = audit.issues.filter(i => i.severity === 'LOW');
  
  if (criticalIssues.length > 0) {
    md += `### 🔴 Critical (${criticalIssues.length})\n\n`;
    criticalIssues.forEach((issue, i) => {
      md += `${i + 1}. ${issue.message}\n`;
    });
    md += `\n`;
  }
  
  if (mediumIssues.length > 0) {
    md += `### 🟡 Medium (${mediumIssues.length})\n\n`;
    mediumIssues.forEach((issue, i) => {
      md += `${i + 1}. ${issue.message}\n`;
    });
    md += `\n`;
  }
  
  if (lowIssues.length > 0) {
    md += `### 🟢 Low (${lowIssues.length})\n\n`;
    lowIssues.forEach((issue, i) => {
      md += `${i + 1}. ${issue.message}\n`;
    });
    md += `\n`;
  }
  
  if (audit.recommendations.length > 0) {
    md += `## 💡 KHUYẾN NGHỊ (${audit.recommendations.length})\n\n`;
    audit.recommendations.forEach((rec, i) => {
      md += `${i + 1}. ${rec}\n`;
    });
    md += `\n`;
  }
  
  md += `## 🎯 KẾT LUẬN\n\n`;
  
  if (percentage >= 80) {
    md += `Hệ thống đạt chất lượng tốt với điểm ${percentage}%. `;
    md += `Có một số điểm cần cải thiện nhỏ nhưng nhìn chung hệ thống hoạt động ổn định và đáng tin cậy.\n\n`;
  } else if (percentage >= 60) {
    md += `Hệ thống đạt mức trung bình với điểm ${percentage}%. `;
    md += `Cần cải thiện một số vấn đề về bảo mật, performance và data integrity để nâng cao chất lượng.\n\n`;
  } else {
    md += `Hệ thống cần cải thiện nghiêm trọng với điểm ${percentage}%. `;
    md += `Có nhiều vấn đề critical cần được giải quyết trước khi deploy production.\n\n`;
  }
  
  return md;
}

// Main execution
async function runDeepAudit() {
  console.clear();
  logSection('🔍 KIỂM TRA SÂU HỆ THỐNG KPI CENTRAL');
  
  console.log(`Thời gian bắt đầu: ${new Date().toLocaleString('vi-VN')}\n`);
  console.log('Kiểm tra chi tiết tất cả các khía cạnh của hệ thống...\n');
  
  try {
    await checkAPIEndpoints();
    await checkComponents();
    await checkSecurity();
    await checkPerformance();
    await checkDataIntegrity();
    
    generateFinalReport();
    
    console.log(`Thời gian kết thúc: ${new Date().toLocaleString('vi-VN')}\n`);
    
  } catch (error) {
    console.error('\n❌ Lỗi nghiêm trọng:', error);
    process.exit(1);
  }
}

runDeepAudit();

