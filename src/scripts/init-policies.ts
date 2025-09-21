import { initializeCompanyPolicies } from '../lib/init-company-policies';

// Script để khởi tạo dữ liệu chính sách công ty
const runInitialization = async () => {
  console.log('🚀 Bắt đầu khởi tạo dữ liệu chính sách công ty...');
  
  try {
    const result = await initializeCompanyPolicies();
    
    if (result.success) {
      console.log('✅ Khởi tạo thành công!');
      console.log(`📈 Thống kê:`);
      console.log(`   - Phòng ban: ${result.departments}`);
      console.log(`   - Chương trình thưởng: ${result.rewardPrograms}`);
      console.log(`   - KPI definitions: ${result.kpis}`);
    } else {
      console.error('❌ Khởi tạo thất bại:', result.error);
    }
  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error);
  }
};

// Chạy script
runInitialization();
