/**
 * Migration Script for KPI Status Update
 * 
 * Script này sẽ giúp chuyển đổi trạng thái KPI cũ sang trạng thái mới
 * Chạy script này một lần sau khi deploy để cập nhật dữ liệu hiện tại
 */

import { collection, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { KpiStatusService } from '@/lib/kpi-status-service';

export class KpiStatusMigration {
  private static readonly BATCH_SIZE = 100;

  /**
   * Migrate tất cả KPI records từ trạng thái cũ sang trạng thái mới
   */
  static async migrateAllKpiRecords(): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    console.log('🚀 Bắt đầu migration KPI status...');
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    try {
      // Lấy tất cả KPI records
      const kpiRecordsRef = collection(db, 'kpiRecords');
      const snapshot = await getDocs(kpiRecordsRef);
      
      console.log(`📊 Tìm thấy ${snapshot.size} KPI records cần migration`);

      // Xử lý theo batch để tránh timeout
      const records = snapshot.docs;
      for (let i = 0; i < records.length; i += this.BATCH_SIZE) {
        const batch = records.slice(i, i + this.BATCH_SIZE);
        const batchResults = await this.migrateBatch(batch);
        
        results.success += batchResults.success;
        results.failed += batchResults.failed;
        results.errors.push(...batchResults.errors);
        
        console.log(`✅ Đã xử lý batch ${Math.floor(i / this.BATCH_SIZE) + 1}/${Math.ceil(records.length / this.BATCH_SIZE)}`);
      }

      console.log('🎉 Migration hoàn thành!');
      console.log(`✅ Thành công: ${results.success}`);
      console.log(`❌ Thất bại: ${results.failed}`);
      
      if (results.errors.length > 0) {
        console.log('⚠️ Lỗi chi tiết:', results.errors);
      }

    } catch (error) {
      console.error('💥 Lỗi migration:', error);
      results.errors.push(`Migration failed: ${error}`);
    }

    return results;
  }

  /**
   * Migrate một batch KPI records
   */
  private static async migrateBatch(records: any[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    const batch = writeBatch(db);

    for (const recordDoc of records) {
      try {
        const record = recordDoc.data();
        const oldStatus = record.status;
        
        // Skip nếu đã là trạng thái mới
        if (this.isNewStatus(oldStatus)) {
          results.success++;
          continue;
        }

        // Migrate status
        const newStatus = KpiStatusService.migrateOldStatus(oldStatus);
        
        // Tạo status history entry
        const statusHistoryEntry = {
          status: newStatus,
          changedAt: new Date().toISOString(),
          changedBy: 'migration-script',
          comment: `Migrated from ${oldStatus} to ${newStatus}`
        };

        // Cập nhật record
        const updates = {
          status: newStatus,
          statusHistory: [
            ...(record.statusHistory || []),
            statusHistoryEntry
          ],
          lastStatusChange: new Date().toISOString(),
          lastStatusChangedBy: 'migration-script'
        };

        batch.update(recordDoc.ref, updates);
        results.success++;

        console.log(`🔄 Migrated ${recordDoc.id}: ${oldStatus} → ${newStatus}`);

      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to migrate ${recordDoc.id}: ${error}`);
        console.error(`❌ Failed to migrate ${recordDoc.id}:`, error);
      }
    }

    try {
      await batch.commit();
    } catch (error) {
      console.error('❌ Batch commit failed:', error);
      results.errors.push(`Batch commit failed: ${error}`);
    }

    return results;
  }

  /**
   * Kiểm tra xem status có phải là trạng thái mới không
   */
  private static isNewStatus(status: string): boolean {
    const newStatuses = ['not_started', 'in_progress', 'submitted', 'approved', 'rejected'];
    return newStatuses.includes(status);
  }

  /**
   * Validate migration results
   */
  static async validateMigration(): Promise<{
    totalRecords: number;
    migratedRecords: number;
    oldStatusRecords: number;
    details: Record<string, number>;
  }> {
    console.log('🔍 Validating migration results...');

    const kpiRecordsRef = collection(db, 'kpiRecords');
    const snapshot = await getDocs(kpiRecordsRef);
    
    const results = {
      totalRecords: snapshot.size,
      migratedRecords: 0,
      oldStatusRecords: 0,
      details: {} as Record<string, number>
    };

    snapshot.docs.forEach(doc => {
      const status = doc.data().status;
      results.details[status] = (results.details[status] || 0) + 1;
      
      if (this.isNewStatus(status)) {
        results.migratedRecords++;
      } else {
        results.oldStatusRecords++;
      }
    });

    console.log('📊 Migration validation results:');
    console.log(`Total records: ${results.totalRecords}`);
    console.log(`Migrated records: ${results.migratedRecords}`);
    console.log(`Old status records: ${results.oldStatusRecords}`);
    console.log('Status distribution:', results.details);

    return results;
  }

  /**
   * Rollback migration (chỉ dùng trong trường hợp khẩn cấp)
   */
  static async rollbackMigration(): Promise<void> {
    console.log('⚠️ ROLLBACK: Chuyển trạng thái về dạng cũ...');
    
    const migrationMap: Record<string, string> = {
      'not_started': 'pending',
      'in_progress': 'pending',
      'submitted': 'awaiting_approval',
      'approved': 'approved',
      'rejected': 'rejected'
    };

    const kpiRecordsRef = collection(db, 'kpiRecords');
    const snapshot = await getDocs(kpiRecordsRef);
    
    const batch = writeBatch(db);
    let count = 0;

    snapshot.docs.forEach(doc => {
      const record = doc.data();
      const currentStatus = record.status;
      
      if (migrationMap[currentStatus]) {
        batch.update(doc.ref, {
          status: migrationMap[currentStatus],
          lastStatusChange: new Date().toISOString(),
          lastStatusChangedBy: 'rollback-script'
        });
        count++;
      }
    });

    await batch.commit();
    console.log(`🔄 Rollback completed: ${count} records reverted`);
  }
}

// Export để sử dụng trong console hoặc script khác
export default KpiStatusMigration;
