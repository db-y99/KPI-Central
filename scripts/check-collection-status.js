const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

// All collections defined in the system
const ALL_COLLECTIONS = [
  // Core Collections
  'departments',
  'employees', 
  'kpis',
  'kpiRecords',
  'users',
  'reports',
  'notifications',
  'notificationSettings',
  
  // Reward System
  'rewardPrograms',
  'positionConfigs',
  'employeePoints',
  'rewardCalculations',
  'metricData',
  
  // Advanced Features
  'kpiFormulas',
  'measurementCycles',
  'kpiCycles',
  'bulkImportTemplates',
  'bulkImportResults',
  'scheduledReports',
  'reportExecutions',
  'reportTemplates',
  
  // Employee Self-Service
  'selfUpdateRequests',
  'performanceBreakdowns',
  'performancePredictions',
  'selfServiceSettings',
  'performanceInsights',
  
  // System Collections
  'performanceMetrics',
  'errorLogs',
  'performanceReports',
  'alertRules',
  'notificationTemplates'
];

async function checkCollectionStatus(collectionName) {
  try {
    console.log(`Checking collection: ${collectionName}`);
    
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    return {
      name: collectionName,
      exists: true,
      documentCount: snapshot.size,
      lastModified: snapshot.size > 0 ? 'recent' : 'never'
    };
    
  } catch (error) {
    console.error(`Error checking collection ${collectionName}:`, error.message);
    return {
      name: collectionName,
      exists: false,
      documentCount: 0,
      errors: [error.message]
    };
  }
}

async function checkDataConsistency() {
  const consistencyChecks = [];
  
  try {
    // Check if employees have corresponding users
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const usersSnap = await getDocs(collection(db, 'users'));
    
    const employees = employeesSnap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    const users = usersSnap.docs.map(doc => doc.data());
    
    const employeesWithoutUsers = employees.filter(emp => 
      !users.find(user => user.uid === emp.uid)
    );
    
    consistencyChecks.push({
      check: 'Employees-Users Consistency',
      status: employeesWithoutUsers.length === 0 ? 'PASS' : 'FAIL',
      details: `${employeesWithoutUsers.length} employees without corresponding users`,
      issues: employeesWithoutUsers.map(emp => emp.name || emp.uid)
    });
    
    // Check if KPI records reference valid KPIs
    const kpiRecordsSnap = await getDocs(collection(db, 'kpiRecords'));
    const kpisSnap = await getDocs(collection(db, 'kpis'));
    
    const kpiRecords = kpiRecordsSnap.docs.map(doc => doc.data());
    const kpis = kpisSnap.docs.map(doc => doc.data());
    
    const invalidKpiRecords = kpiRecords.filter(record => 
      !kpis.find(kpi => kpi.id === record.kpiId)
    );
    
    consistencyChecks.push({
      check: 'KPI Records-KPIs Consistency',
      status: invalidKpiRecords.length === 0 ? 'PASS' : 'FAIL',
      details: `${invalidKpiRecords.length} KPI records with invalid KPI references`,
      issues: invalidKpiRecords.map(record => record.id)
    });
    
    // Check if employees belong to valid departments
    const departmentsSnap = await getDocs(collection(db, 'departments'));
    const departments = departmentsSnap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    
    const employeesWithInvalidDepts = employees.filter(emp => 
      emp.departmentId && !departments.find(dept => dept.docId === emp.departmentId)
    );
    
    consistencyChecks.push({
      check: 'Employees-Departments Consistency',
      status: employeesWithInvalidDepts.length === 0 ? 'PASS' : 'FAIL',
      details: `${employeesWithInvalidDepts.length} employees with invalid department references`,
      issues: employeesWithInvalidDepts.map(emp => emp.name || emp.uid)
    });
    
  } catch (error) {
    consistencyChecks.push({
      check: 'Data Consistency Check',
      status: 'ERROR',
      details: 'Failed to perform consistency checks',
      issues: [error.message]
    });
  }
  
  return consistencyChecks;
}

async function generateSystemStatusReport() {
  console.log('🔍 Starting comprehensive collection status check...\n');
  
  const collectionStatuses = [];
  
  // Check all collections
  for (const collectionName of ALL_COLLECTIONS) {
    const status = await checkCollectionStatus(collectionName);
    collectionStatuses.push(status);
  }
  
  // Perform consistency checks
  console.log('\n🔗 Checking data consistency...');
  const consistencyChecks = await checkDataConsistency();
  
  // Generate report
  console.log('\n📊 COLLECTION STATUS REPORT');
  console.log('='.repeat(50));
  
  const existingCollections = collectionStatuses.filter(c => c.exists);
  const emptyCollections = collectionStatuses.filter(c => c.exists && c.documentCount === 0);
  const errorCollections = collectionStatuses.filter(c => c.errors && c.errors.length > 0);
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`- Total collections defined: ${ALL_COLLECTIONS.length}`);
  console.log(`- Collections that exist: ${existingCollections.length}`);
  console.log(`- Collections with data: ${existingCollections.length - emptyCollections.length}`);
  console.log(`- Empty collections: ${emptyCollections.length}`);
  console.log(`- Collections with errors: ${errorCollections.length}`);
  
  console.log(`\n✅ COLLECTIONS WITH DATA:`);
  existingCollections
    .filter(c => c.documentCount > 0)
    .forEach(c => {
      console.log(`  - ${c.name}: ${c.documentCount} documents`);
    });
  
  if (emptyCollections.length > 0) {
    console.log(`\n⚠️  EMPTY COLLECTIONS:`);
    emptyCollections.forEach(c => {
      console.log(`  - ${c.name}: 0 documents`);
    });
  }
  
  if (errorCollections.length > 0) {
    console.log(`\n❌ COLLECTIONS WITH ERRORS:`);
    errorCollections.forEach(c => {
      console.log(`  - ${c.name}: ${c.errors.join(', ')}`);
    });
  }
  
  console.log(`\n🔗 DATA CONSISTENCY CHECKS:`);
  consistencyChecks.forEach(check => {
    const statusIcon = check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`  ${statusIcon} ${check.check}: ${check.details}`);
    if (check.issues && check.issues.length > 0) {
      check.issues.forEach(issue => {
        console.log(`    - ${issue}`);
      });
    }
  });
  
  // Overall system health
  const totalIssues = errorCollections.length + consistencyChecks.filter(c => c.status === 'FAIL').length;
  const systemHealth = totalIssues === 0 ? 'HEALTHY' : totalIssues < 3 ? 'WARNING' : 'CRITICAL';
  
  console.log(`\n🏥 SYSTEM HEALTH: ${systemHealth}`);
  
  if (systemHealth !== 'HEALTHY') {
    console.log(`\n🔧 RECOMMENDATIONS:`);
    if (errorCollections.length > 0) {
      console.log(`- Fix errors in collections: ${errorCollections.map(c => c.name).join(', ')}`);
    }
    if (consistencyChecks.some(c => c.status === 'FAIL')) {
      console.log(`- Resolve data consistency issues`);
    }
    if (emptyCollections.length > 0) {
      console.log(`- Consider initializing empty collections: ${emptyCollections.map(c => c.name).join(', ')}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Collection status check completed!');
}

// Run the check
generateSystemStatusReport().catch(console.error);
