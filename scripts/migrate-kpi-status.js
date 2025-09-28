#!/usr/bin/env node

/**
 * Script để migrate trạng thái KPI từ hệ thống cũ sang hệ thống mới
 * Chạy: node scripts/migrate-kpi-status.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

// Firebase config - cần cập nhật với config thực tế
const firebaseConfig = {
  // Thêm config Firebase của bạn ở đây
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mapping trạng thái cũ sang mới
const statusMigrationMap = {
  'pending': 'not_started',
  'awaiting_approval': 'submitted',
  'approved': 'approved',
  'rejected': 'rejected',
  'completed': 'approved',
  'in-progress': 'in_progress'
};

async function migrateKpiStatus() {
  console.log('🚀 Bắt đầu migration trạng thái KPI...');
  
  try {
    // Lấy tất cả KPI records
    const kpiRecordsRef = collection(db, 'kpiRecords');
    const snapshot = await getDocs(kpiRecordsRef);
    
    console.log(`📊 Tìm thấy ${snapshot.size} KPI records`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const oldStatus = data.status;
      
      // Kiểm tra xem có cần migration không
      if (statusMigrationMap[oldStatus]) {
        const newStatus = statusMigrationMap[oldStatus];
        
        // Cập nhật trạng thái mới
        await updateDoc(doc(db, 'kpiRecords', docSnapshot.id), {
          status: newStatus,
          updatedAt: new Date().toISOString(),
          migrationNote: `Migrated from ${oldStatus} to ${newStatus}`
        });
        
        console.log(`✅ Migrated ${docSnapshot.id}: ${oldStatus} → ${newStatus}`);
        migratedCount++;
      } else {
        console.log(`⏭️ Skipped ${docSnapshot.id}: status '${oldStatus}' không cần migration`);
        skippedCount++;
      }
    }
    
    console.log('\n📈 Kết quả migration:');
    console.log(`✅ Đã migrate: ${migratedCount} records`);
    console.log(`⏭️ Đã bỏ qua: ${skippedCount} records`);
    console.log(`📊 Tổng cộng: ${snapshot.size} records`);
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình migration:', error);
    process.exit(1);
  }
}

// Chạy migration
migrateKpiStatus()
  .then(() => {
    console.log('\n🎉 Migration hoàn thành thành công!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration thất bại:', error);
    process.exit(1);
  });

