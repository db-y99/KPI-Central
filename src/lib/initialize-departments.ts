import { collection, getDocs, addDoc, doc, writeBatch, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Department } from '@/types';

// Department data for the 7 job positions
export const departmentsData: Omit<Department, 'id'>[] = [
  {
    name: 'Phòng Công nghệ Thông tin',
    description: 'Quản lý hệ thống IT, bảo trì, sao lưu dữ liệu và hỗ trợ kỹ thuật',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Phòng Marketing',
    description: 'Phát triển thị trường, thu hút khách hàng tiềm năng và quản lý chiến dịch marketing',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Phòng Chăm sóc Khách hàng',
    description: 'Hỗ trợ khách hàng, xử lý yêu cầu và duy trì mối quan hệ khách hàng',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Phòng Thẩm định Tín dụng',
    description: 'Đánh giá rủi ro tín dụng, thẩm định hồ sơ vay và quản lý danh mục nợ',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Phòng Hành chính - Nhân sự',
    description: 'Quản lý nhân sự, hồ sơ nhân viên, bảng lương và các vấn đề hành chính',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Phòng Kế toán',
    description: 'Quản lý tài chính, lập báo cáo, đối chiếu tài khoản và khai báo thuế',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initializeDepartments = async () => {
  try {
    console.log('Starting departments initialization...');
    
    // Check if departments already exist
    const departmentsSnap = await getDocs(collection(db, 'departments'));
    const existingDepartments = departmentsSnap.docs.map(doc => doc.data() as Department);
    
    console.log(`Found ${existingDepartments.length} existing departments`);
    
    // Use batch writes for efficiency
    const batch = writeBatch(db);
    let batchCount = 0;
    const maxBatchSize = 500; // Firestore batch limit
    
    // Add departments
    console.log('Adding departments...');
    for (const deptData of departmentsData) {
      // Check if department already exists
      const existingDept = existingDepartments.find(dept => 
        dept.name === deptData.name
      );
      
      if (!existingDept) {
        const deptRef = doc(collection(db, 'departments'));
        batch.set(deptRef, deptData);
        batchCount++;
        
        // Commit batch if approaching limit
        if (batchCount >= maxBatchSize) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} departments`);
          batchCount = 0;
        }
      } else {
        console.log(`Department "${deptData.name}" already exists, skipping...`);
      }
    }
    
    // Commit remaining departments
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} departments`);
    }
    
    console.log('✅ Departments initialization completed successfully!');
    
    return {
      success: true,
      message: 'Departments initialized successfully',
      addedDepartments: departmentsData.length
    };
    
  } catch (error) {
    console.error('❌ Error initializing departments:', error);
    throw new Error(`Failed to initialize departments: ${error}`);
  }
};

// Function to check departments status
export const checkDepartmentsStatus = async () => {
  try {
    const departmentsSnap = await getDocs(collection(db, 'departments'));
    
    const departments = departmentsSnap.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Department));
    
    return {
      totalDepartments: departments.length,
      departments,
      isInitialized: departments.length > 0
    };
    
  } catch (error) {
    console.error('Error checking departments status:', error);
    throw error;
  }
};
