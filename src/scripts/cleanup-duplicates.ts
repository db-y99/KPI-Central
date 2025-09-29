import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

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

async function cleanupDuplicates() {
  console.log('🧹 Cleaning up duplicate data...');

  try {
    // Clean up duplicate departments
    await cleanupCollection('departments', ['name']);

    // Clean up duplicate KPIs
    await cleanupCollection('kpis', ['name', 'department']);

    // Clean up duplicate reward programs
    await cleanupCollection('rewardPrograms', ['name']);

    console.log('✅ Cleanup completed!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

async function cleanupCollection(collectionName: string, uniqueFields: string[]) {
  console.log(`\n🔍 Cleaning ${collectionName}...`);

  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(query(collectionRef, orderBy('createdAt')));

  const docs = snapshot.docs.map(doc => ({
    id: doc.id,
    data: doc.data(),
    createdAt: doc.data().createdAt
  }));

  // Find duplicates based on unique fields
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const doc of docs) {
    const key = uniqueFields.map(field => doc.data[field]).join('|');

    if (seen.has(key)) {
      duplicates.push(doc.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`   Found ${duplicates.length} duplicates in ${collectionName}`);

  // Delete duplicates (keep the first occurrence)
  for (const duplicateId of duplicates) {
    try {
      await deleteDoc(doc(db, collectionName, duplicateId));
      console.log(`   ✅ Deleted duplicate: ${duplicateId}`);
    } catch (error) {
      console.error(`   ❌ Failed to delete ${duplicateId}:`, error);
    }
  }

  console.log(`   ✅ ${collectionName} cleanup completed`);
}

// Run the cleanup
cleanupDuplicates()
  .then(() => {
    console.log('\n🎉 Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });
