#!/usr/bin/env node

/**
 * Cleanup Script: Remove Duplicate KPI Records
 *
 * This script identifies and removes duplicate KPI records from the database.
 * Duplicates are identified by employeeId + kpiId + period combination.
 * Only the most recent record for each unique combination is kept.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, orderBy, getDocs, updateDoc, doc } = require('firebase/firestore');

// Firebase configuration (same as in your app)
const firebaseConfig = {
  // You should load this from environment variables or config file
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupDuplicateKpiRecords() {
  console.log('🔍 Starting KPI records cleanup...');

  try {
    // Get all KPI records ordered by employeeId, kpiId, period, and updatedAt
    const recordsRef = collection(db, 'kpiRecords');
    const q = query(recordsRef, orderBy('employeeId'), orderBy('kpiId'), orderBy('period'), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    console.log(`📊 Found ${querySnapshot.size} total KPI records`);

    const groupedRecords = {};
    const duplicateIds = [];

    // Group records by employeeId-kpiId-period combination
    querySnapshot.forEach((doc) => {
      const record = { id: doc.id, ...doc.data() };
      const key = `${record.employeeId}-${record.kpiId}-${record.period}`;

      if (!groupedRecords[key]) {
        groupedRecords[key] = [];
      }
      groupedRecords[key].push(record);
    });

    // Identify duplicates (keep the most recent one)
    let totalDuplicates = 0;
    Object.entries(groupedRecords).forEach(([key, records]) => {
      if (records.length > 1) {
        console.log(`🔍 Found ${records.length} duplicate records for key: ${key}`);
        // Keep the first one (most recent due to ordering), mark others for deletion
        const duplicates = records.slice(1);
        duplicates.forEach((duplicate) => {
          duplicateIds.push(duplicate.id);
        });
        totalDuplicates += duplicates.length;
      }
    });

    if (duplicateIds.length === 0) {
      console.log('✅ No duplicate KPI records found!');
      return;
    }

    console.log(`🗑️  Found ${duplicateIds.length} duplicate records to remove`);

    // Confirm with user before proceeding
    if (process.argv.includes('--dry-run')) {
      console.log('🔍 DRY RUN MODE - No changes will be made');
      console.log('📋 Records that would be removed:');
      duplicateIds.forEach(id => {
        const record = querySnapshot.docs.find(doc => doc.id === id);
        if (record) {
          const data = record.data();
          console.log(`  - ${id}: ${data.employeeId} - ${data.kpiId} - ${data.period}`);
        }
      });
      return;
    }

    // Proceed with deletion
    if (!process.argv.includes('--yes')) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        rl.question(`⚠️  Are you sure you want to delete ${duplicateIds.length} duplicate records? (yes/no): `, resolve);
        rl.close();
      });

      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Operation cancelled by user');
        return;
      }
    }

    // Soft delete duplicates
    console.log('🗑️  Removing duplicates...');
    const deletePromises = duplicateIds.map(async (id) => {
      try {
        await updateDoc(doc(db, 'kpiRecords', id), {
          deletedAt: new Date().toISOString(),
          isDeleted: true
        });
        return id;
      } catch (error) {
        console.error(`❌ Failed to delete record ${id}:`, error);
        return null;
      }
    });

    const results = await Promise.all(deletePromises);
    const successfulDeletes = results.filter(id => id !== null).length;
    const failedDeletes = results.length - successfulDeletes;

    console.log(`✅ Successfully removed ${successfulDeletes} duplicate records`);
    if (failedDeletes > 0) {
      console.log(`❌ Failed to remove ${failedDeletes} records`);
    }

    // Summary
    const remainingRecords = querySnapshot.size - successfulDeletes;
    console.log(`📊 Summary:`);
    console.log(`  - Total records before: ${querySnapshot.size}`);
    console.log(`  - Duplicates removed: ${successfulDeletes}`);
    console.log(`  - Remaining records: ${remainingRecords}`);
    console.log(`  - Unique combinations: ${Object.keys(groupedRecords).length}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupDuplicateKpiRecords()
  .then(() => {
    console.log('🎉 Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });
