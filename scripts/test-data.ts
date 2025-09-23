#!/usr/bin/env node

/**
 * Test script để kiểm tra dữ liệu mẫu đã được tạo
 *
 * Usage:
 *   tsx scripts/test-data.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs, query, where } from 'firebase/firestore';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '..', '.env.local') });

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulators if in development
if (process.env.NODE_ENV === 'development') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔗 Connected to Firebase emulators');
  } catch (error) {
    console.log('📡 Using production Firebase (emulators not available)');
  }
}

async function testData() {
  console.log('🧪 Testing sample data...');
  console.log('=======================');

  try {
    // Test 1: Check Departments
    console.log('\n1. Checking Departments...');
    const departmentsSnapshot = await getDocs(collection(db, 'departments'));
    console.log(`   Found ${departmentsSnapshot.size} departments:`);
    departmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${data.name} (ID: ${data.id})`);
    });

    // Test 2: Check Employees
    console.log('\n2. Checking Employees...');
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    console.log(`   Found ${employeesSnapshot.size} employees:`);
    employeesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${data.name} (ID: ${data.id}) - Position: ${data.position}`);
    });

    // Test 3: Check KPIs
    console.log('\n3. Checking KPIs...');
    const kpisSnapshot = await getDocs(collection(db, 'kpis'));
    console.log(`   Found ${kpisSnapshot.size} KPIs:`);
    kpisSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${data.name} (ID: ${data.id}) - Department: ${data.department}`);
    });

    // Test 4: Check KPI Records
    console.log('\n4. Checking KPI Records...');
    const kpiRecordsSnapshot = await getDocs(collection(db, 'kpiRecords'));
    console.log(`   Found ${kpiRecordsSnapshot.size} KPI records:`);
    kpiRecordsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - Employee: ${data.employeeId} - KPI ID: ${data.kpiId} - Status: ${data.status}`);
    });

    // Test 5: Validate KPI relationships
    console.log('\n5. Validating KPI relationships...');

    const kpiIds = new Set();
    const employeeIds = new Set();

    // Collect all KPI IDs and Employee IDs
    kpisSnapshot.forEach((doc) => {
      const data = doc.data();
      kpiIds.add(data.id);
    });

    employeesSnapshot.forEach((doc) => {
      const data = doc.data();
      employeeIds.add(data.id);
    });

    // Check KPI Records for invalid references
    kpiRecordsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!employeeIds.has(data.employeeId)) {
        console.log(`   ❌ KPI Record ${doc.id} references non-existent employee: ${data.employeeId}`);
      }
      if (!kpiIds.has(data.kpiId)) {
        console.log(`   ❌ KPI Record ${doc.id} references non-existent KPI: ${data.kpiId}`);
      }
    });

    // Test 6: Check specific KPI lookups
    console.log('\n6. Testing specific KPI lookups...');
    kpiRecordsSnapshot.docs.slice(0, 5).forEach((doc) => {
      const data = doc.data();
      const kpiDoc = kpisSnapshot.docs.find(kpiDoc => kpiDoc.data().id === data.kpiId);
      if (kpiDoc) {
        console.log(`   ✅ Found KPI "${kpiDoc.data().name}" for kpiId "${data.kpiId}"`);
      } else {
        console.log(`   ❌ No KPI found for kpiId "${data.kpiId}"`);
      }
    });

    // Test 7: Check reports and their KPI references
    console.log('\n7. Testing reports and KPI references...');
    const reportsSnapshot = await getDocs(collection(db, 'reports'));
    console.log(`   Found ${reportsSnapshot.size} reports:`);
    reportsSnapshot.docs.slice(0, 5).forEach((doc) => {
      const data = doc.data();
      const kpiDoc = kpisSnapshot.docs.find(kpiDoc => kpiDoc.data().id === data.kpiId);
      console.log(`   - Report: ${data.title} - KPI ID: ${data.kpiId}`);
      if (kpiDoc) {
        console.log(`     ✅ KPI Name: "${kpiDoc.data().name}"`);
      } else {
        console.log(`     ❌ KPI not found for ID: "${data.kpiId}"`);
      }
    });

    console.log('\n✅ Data validation completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Departments: ${departmentsSnapshot.size}`);
    console.log(`   - Employees: ${employeesSnapshot.size}`);
    console.log(`   - KPIs: ${kpisSnapshot.size}`);
    console.log(`   - KPI Records: ${kpiRecordsSnapshot.size}`);
    console.log(`   - Reports: ${reportsSnapshot.size}`);

    // Show all available KPI IDs
    console.log('\n🔍 Available KPI IDs:');
    kpisSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${data.id}: ${data.name}`);
    });

  } catch (error) {
    console.error('❌ Error testing data:', error);
  }
}

// Run the test
testData().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
