const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, updateDoc, doc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

async function fixDuplicateRewardPenalty() {
  try {
    console.log('Starting cleanup of duplicate reward/penalty calculations...');
    
    // Get all calculations grouped by kpiRecordId
    const calculationsRef = collection(db, 'kpiRewardPenalties');
    const q = query(calculationsRef, orderBy('kpiRecordId'), orderBy('calculatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const groupedCalculations = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!groupedCalculations[data.kpiRecordId]) {
        groupedCalculations[data.kpiRecordId] = [];
      }
      groupedCalculations[data.kpiRecordId].push({ id: doc.id, ...data });
    });
    
    console.log(`Found calculations for ${Object.keys(groupedCalculations).length} different KPI records`);
    
    let duplicateCount = 0;
    const updatePromises = [];
    
    // Remove duplicates - keep only the most recent one for each kpiRecordId
    Object.entries(groupedCalculations).forEach(([kpiRecordId, calculations]) => {
      if (calculations.length > 1) {
        console.log(`KPI Record ${kpiRecordId} has ${calculations.length} calculations. Keeping the most recent one.`);
        
        // Keep the first one (most recent due to order), mark the rest as deleted
        const duplicates = calculations.slice(1);
        duplicates.forEach((duplicate) => {
          updatePromises.push(
            updateDoc(doc(db, 'kpiRewardPenalties', duplicate.id), {
              deletedAt: new Date().toISOString(),
              isDeleted: true,
              duplicateOf: calculations[0].id
            })
          );
          duplicateCount++;
        });
      }
    });
    
    if (updatePromises.length > 0) {
      console.log(`Marking ${duplicateCount} duplicate calculations as deleted...`);
      await Promise.all(updatePromises);
      console.log('✅ Successfully cleaned up duplicate reward/penalty calculations!');
    } else {
      console.log('✅ No duplicate calculations found. Database is clean!');
    }
    
    // Summary statistics
    const totalGroups = Object.keys(groupedCalculations).length;
    const groupsWithDuplicates = Object.values(groupedCalculations).filter(group => group.length > 1).length;
    
    console.log('\n📊 Cleanup Summary:');
    console.log(`- Total KPI Records with calculations: ${totalGroups}`);
    console.log(`- KPI Records with duplicates: ${groupsWithDuplicates}`);
    console.log(`- Total duplicate entries cleaned: ${duplicateCount}`);
    
  } catch (error) {
    console.error('❌ Error cleaning up duplicate calculations:', error);
    process.exit(1);
  }
}

// Run the cleanup
fixDuplicateRewardPenalty()
  .then(() => {
    console.log('\n🎉 Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });
