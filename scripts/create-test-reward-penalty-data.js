const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

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

async function createTestRewardPenaltyData() {
  try {
    console.log('Creating test reward/penalty data...');
    
    const testData = [
      {
        kpiRecordId: 'test-record-1',
        employeeId: 'employee-1',
        employeeName: 'Trần Quang Khái',
        department: 'IT',
        kpiId: 'kpi-1',
        kpiName: 'Nâng cấp hệ thống',
        period: '2025-Q3',
        targetValue: 2,
        actualValue: 3,
        achievementRate: 150.0,
        rewardAmount: 500000,
        penaltyAmount: 0,
        netAmount: 500000,
        status: 'calculated',
        calculatedAt: new Date().toISOString(),
        notes: 'Vượt mục tiêu đề ra'
      },
      {
        kpiRecordId: 'test-record-2',
        employeeId: 'employee-2',
        employeeName: 'Nguyễn Văn Nam',
        department: 'Marketing',
        kpiId: 'kpi-2',
        kpiName: 'Tăng doanh thu',
        period: '2025-Q3',
        targetValue: 5,
        actualValue: 4,
        achievementRate: 80.0,
        rewardAmount: 200000,
        penaltyAmount: 50000,
        netAmount: 150000,
        status: 'approved',
        calculatedAt: new Date().toISOString(),
        approvedBy: 'Admin',
        approvedAt: new Date().toISOString(),
        notes: 'Đạt mục tiêu cơ bản'
      },
      {
        kpiRecordId: 'test-record-3',
        employeeId: 'employee-3',
        employeeName: 'Lê Thị Minh',
        department: 'Kế toán',
        kpiId: 'kpi-3',
        kpiName: 'Submit application on time',
        period: '2025-Q3',
        targetValue: 10,
        actualValue: 8,
        achievementRate: 80.0,
        rewardAmount: 300000,
        penaltyAmount: 0,
        netAmount: 300000,
        status: 'paid',
        calculatedAt: new Date().toISOString(),
        approvedBy: 'Admin',
        approvedAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        notes: 'Hoàn thành đúng thời hạn'
      }
    ];

    const promises = testData.map(data => 
      addDoc(collection(db, 'kpiRewardPenalties'), data)
    );

    const docRefs = await Promise.all(promises);
    
    console.log(`✅ Successfully created ${docRefs.length} test reward/penalty records:`);
    docRefs.forEach((ref, index) => {
      console.log(`  - ${testData[index].employeeName}: ${testData[index].status}`);
    });
    
    console.log('\n📊 Test Data Summary:');
    console.log(`- Total records: ${testData.length}`);
    console.log(`- Statuses: calculated(1), approved(1), paid(1)`);
    console.log('- Periods: 2025-Q3');
    console.log('\n🎯 You can now test the approval and payment functions!');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
}

// Run the script
createTestRewardPenaltyData()
  .then(() => {
    console.log('\n🎉 Test data creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test data creation failed:', error);
    process.exit(1);
  });
