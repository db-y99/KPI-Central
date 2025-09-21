#!/usr/bin/env node

/**
 * Script để khởi tạo dữ liệu chính sách công ty vào Firebase Firestore
 * Chạy script này bằng: npx tsx src/scripts/init-policies-cli.ts
 */

import { initializeCompanyPolicies } from '../lib/init-company-policies';

async function main() {
  console.log('🚀 Bắt đầu khởi tạo dữ liệu chính sách công ty...');
  console.log('📋 Chính sách sẽ được tạo:');
  console.log('   • 6 phòng ban (IT, Marketing, Customer Service, Credit, HR/Admin, Accounting)');
  console.log('   • 7 chương trình thưởng cho từng vị trí');
  console.log('   • 18 KPI definitions với thưởng/phạt chi tiết');
  console.log('');

  try {
    const result = await initializeCompanyPolicies();
    
    if (result.success) {
      console.log('✅ Khởi tạo thành công!');
      console.log('');
      console.log('📊 Thống kê:');
      console.log(`   • Phòng ban: ${result.departments}`);
      console.log(`   • Chương trình thưởng: ${result.rewardPrograms}`);
      console.log(`   • KPI definitions: ${result.kpis}`);
      console.log('');
      console.log('🎉 Bạn có thể bắt đầu sử dụng hệ thống KPI ngay bây giờ!');
      console.log('');
      console.log('📝 Các bước tiếp theo:');
      console.log('   1. Truy cập /admin/kpi-definitions để xem các KPI đã tạo');
      console.log('   2. Truy cập /admin/reward-programs để xem chương trình thưởng');
      console.log('   3. Truy cập /admin/kpi-assignment để gán KPI cho nhân viên');
      console.log('   4. Truy cập /admin/kpi-tracking để theo dõi hiệu suất');
    } else {
      console.error('❌ Khởi tạo thất bại:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error);
    process.exit(1);
  }
}

// Chạy script
main();
