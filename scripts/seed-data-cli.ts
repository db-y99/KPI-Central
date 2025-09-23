#!/usr/bin/env node

/**
 * CLI script để seed dữ liệu mẫu vào hệ thống KPI Central
 * 
 * Usage:
 *   npm run seed:data
 *   npm run seed:reset
 *   npm run seed:policies
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

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
const auth = getAuth(app);

// Connect to emulators if in development
if (process.env.NODE_ENV === 'development') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('🔗 Connected to Firebase emulators');
  } catch (error) {
    console.log('📡 Using production Firebase (emulators not available)');
  }
}

// Import seed functions
async function importSeedFunctions() {
  const { seedSampleData, resetAndSeedAllData } = await import('../src/lib/seed-sample-data');
  const { initializeCompanyPolicies } = await import('../src/lib/init-company-policies');
  const { resetSystem } = await import('../src/lib/init-system');

  return { seedSampleData, resetAndSeedAllData, initializeCompanyPolicies, resetSystem };
}

async function main() {
  const command = process.argv[2];
  
  console.log('🚀 KPI Central Seed Data CLI');
  console.log('============================');
  
  try {
    const { seedSampleData, resetAndSeedAllData, initializeCompanyPolicies, resetSystem } = await importSeedFunctions();
    
    switch (command) {
      case 'policies':
        console.log('📋 Initializing company policies...');
        const policiesResult = await initializeCompanyPolicies();
        if (policiesResult.success) {
          console.log('✅ Company policies initialized successfully!');
          console.log(`   - ${policiesResult.departments} departments`);
          console.log(`   - ${policiesResult.rewardPrograms} reward programs`);
          console.log(`   - ${policiesResult.kpis} KPIs`);
        } else {
          console.error('❌ Failed to initialize policies:', policiesResult.error);
          process.exit(1);
        }
        break;
        
      case 'data':
        console.log('🌱 Seeding sample data...');
        const dataResult = await seedSampleData();
        if (dataResult.success) {
          console.log('✅ Sample data seeded successfully!');
          console.log(`   - ${dataResult.employees} employees`);
          console.log(`   - ${dataResult.kpiRecords} KPI records`);
          console.log(`   - ${dataResult.reports} reports`);
          console.log(`   - ${dataResult.metricData} metric data`);
        } else {
          console.error('❌ Failed to seed sample data:', dataResult.error);
          process.exit(1);
        }
        break;
        
      case 'reset':
        console.log('🔄 Resetting and seeding all data...');
        const resetResult = await resetAndSeedAllData();
        if (resetResult.success) {
          console.log('✅ All data reset and seeded successfully!');
        } else {
          console.error('❌ Failed to reset and seed data:', resetResult.error);
          process.exit(1);
        }
        break;
        
      case 'clear':
        console.log('🗑️ Clearing all data...');
        const clearResult = await resetSystem();
        if (clearResult.success) {
          console.log('✅ All data cleared successfully!');
        } else {
          console.error('❌ Failed to clear data:', clearResult.error);
          process.exit(1);
        }
        break;
        
      default:
        console.log('Usage:');
        console.log('  npm run seed:policies  - Initialize company policies');
        console.log('  npm run seed:data      - Seed sample data');
        console.log('  npm run seed:reset    - Reset and seed all data');
        console.log('  npm run seed:clear    - Clear all data');
        console.log('');
        console.log('Examples:');
        console.log('  npm run seed:policies');
        console.log('  npm run seed:data');
        console.log('  npm run seed:reset');
        break;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
  
  console.log('🎉 Done!');
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
