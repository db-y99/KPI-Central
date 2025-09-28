const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, addDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB8QqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQ",
  authDomain: "kpi-central-1kjf8.firebaseapp.com",
  projectId: "kpi-central-1kjf8",
  storageBucket: "kpi-central-1kjf8.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestKpiAssignments() {
  console.log('🎯 Creating test KPI assignments for real employees...\n');

  try {
    // 1. Get all data
    console.log('1. Getting data...');
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const employees = employeesSnap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    
    const kpisSnap = await getDocs(collection(db, 'kpis'));
    const kpis = kpisSnap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    
    const kpiRecordsSnap = await getDocs(collection(db, 'kpiRecords'));
    const kpiRecords = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`   - Employees: ${employees.length}`);
    console.log(`   - KPIs: ${kpis.length}`);
    console.log(`   - Existing KPI Records: ${kpiRecords.length}`);
    
    // 2. Find real employees (non-admin, non-temp)
    const realEmployees = employees.filter(emp => 
      emp.role !== 'admin' && 
      emp.uid && 
      !emp.uid.startsWith('temp_')
    );
    
    console.log(`\n2. Found ${realEmployees.length} real employees:`);
    realEmployees.forEach(emp => {
      console.log(`   - ${emp.name} (${emp.uid})`);
    });
    
    // 3. Check which employees already have KPIs
    console.log('\n3. Checking existing KPI assignments...');
    const employeesWithKpis = [...new Set(kpiRecords.map(record => record.employeeId))];
    
    realEmployees.forEach(emp => {
      const hasKpis = employeesWithKpis.includes(emp.uid);
      console.log(`   - ${emp.name}: ${hasKpis ? '✅ Has KPIs' : '❌ No KPIs'}`);
    });
    
    // 4. Create KPI assignments for employees without KPIs
    console.log('\n4. Creating KPI assignments...');
    
    const employeesWithoutKpis = realEmployees.filter(emp => 
      !employeesWithKpis.includes(emp.uid)
    );
    
    if (employeesWithoutKpis.length > 0 && kpis.length > 0) {
      console.log(`   Creating KPIs for ${employeesWithoutKpis.length} employees...`);
      
      for (const employee of employeesWithoutKpis) {
        // Assign first available KPI
        const kpi = kpis[0];
        
        const newKpiRecord = {
          employeeId: employee.uid,
          kpiId: kpi.docId,
          period: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
          target: 100, // Default target
          actual: 0,
          status: 'not_started',
          submittedReport: '',
          approvalComment: '',
          statusHistory: [{
            status: 'not_started',
            changedAt: new Date().toISOString(),
            changedBy: 'system',
            comment: 'KPI được giao tự động'
          }],
          lastStatusChange: new Date().toISOString(),
          lastStatusChangedBy: 'system',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        try {
          const docRef = await addDoc(collection(db, 'kpiRecords'), newKpiRecord);
          console.log(`   ✅ Created KPI for ${employee.name}: ${docRef.id}`);
          
          // Create notification
          const notification = {
            userId: employee.uid,
            title: 'KPI mới được giao',
            message: `Bạn đã được giao KPI "${kpi.name}" với chỉ tiêu ${newKpiRecord.target} ${kpi.unit}. Hạn hoàn thành: ${new Date(newKpiRecord.endDate).toLocaleDateString('vi-VN')}`,
            type: 'kpi',
            category: 'kpi_assigned',
            isRead: false,
            isImportant: true,
            actionUrl: '/employee/self-update-metrics',
            actionText: 'Cập nhật KPI',
            data: {
              kpiRecordId: docRef.id,
              kpiName: kpi.name,
              target: newKpiRecord.target,
              unit: kpi.unit,
              endDate: newKpiRecord.endDate
            },
            createdAt: new Date().toISOString()
          };
          
          await addDoc(collection(db, 'notifications'), notification);
          console.log(`   ✅ Created notification for ${employee.name}`);
          
        } catch (error) {
          console.log(`   ❌ Failed to create KPI for ${employee.name}:`, error.message);
        }
      }
    } else {
      console.log('   ✅ All employees already have KPIs assigned');
    }
    
    // 5. Final verification
    console.log('\n5. Final verification...');
    const finalKpiRecordsSnap = await getDocs(collection(db, 'kpiRecords'));
    const finalKpiRecords = finalKpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`   Total KPI records: ${finalKpiRecords.length}`);
    
    realEmployees.forEach(emp => {
      const employeeKpis = finalKpiRecords.filter(record => record.employeeId === emp.uid);
      console.log(`   - ${emp.name}: ${employeeKpis.length} KPIs`);
    });
    
    // 6. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   - Real employees: ${realEmployees.length}`);
    console.log(`   - Total KPI records: ${finalKpiRecords.length}`);
    console.log(`   - Available KPIs: ${kpis.length}`);
    
    const employeesWithKpisNow = [...new Set(finalKpiRecords.map(record => record.employeeId))];
    const realEmployeesWithKpis = realEmployees.filter(emp => employeesWithKpisNow.includes(emp.uid));
    
    console.log(`   - Real employees with KPIs: ${realEmployeesWithKpis.length}/${realEmployees.length}`);
    
    if (realEmployeesWithKpis.length === realEmployees.length) {
      console.log('\n✅ SUCCESS: All real employees now have KPIs assigned!');
      console.log('💡 Employees should now be able to see their KPIs in the employee dashboard');
    } else {
      console.log('\n⚠️  Some employees still don\'t have KPIs assigned');
    }

  } catch (error) {
    console.error('❌ Error during KPI assignment:', error);
  }
}

// Run the function
createTestKpiAssignments().then(() => {
  console.log('\n🏁 KPI assignment completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ KPI assignment failed:', error);
  process.exit(1);
});
