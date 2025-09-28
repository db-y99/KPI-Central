const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc, query, where } = require('firebase/firestore');

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

async function findAndFixMissingEmployee() {
  console.log('🔍 Finding and fixing missing employee issue...\n');

  try {
    // 1. Get all KPI records
    const kpiRecordsSnap = await getDocs(collection(db, 'kpiRecords'));
    const kpiRecords = kpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // 2. Get all employees
    const employeesSnap = await getDocs(collection(db, 'employees'));
    const employees = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // 3. Find the problematic record
    const problematicRecord = kpiRecords.find(record => 
      record.employeeId === 'temp_1758939938071_5sk8lqgqh'
    );
    
    if (problematicRecord) {
      console.log('1. Found problematic KPI record:');
      console.log(`   - Record ID: ${problematicRecord.id}`);
      console.log(`   - Employee ID: ${problematicRecord.employeeId}`);
      console.log(`   - KPI ID: ${problematicRecord.kpiId}`);
      console.log(`   - Status: ${problematicRecord.status}`);
      console.log(`   - Created: ${problematicRecord.createdAt}`);
      
      // 4. Check if employee exists in employees collection
      const employeeExists = employees.find(emp => emp.uid === problematicRecord.employeeId);
      
      if (!employeeExists) {
        console.log('\n2. Employee not found in employees collection');
        console.log('   This means the employee was created in development mode but not properly saved');
        
        // 5. Check if there's a similar employee we can reassign to
        const similarEmployees = employees.filter(emp => 
          emp.name && emp.name.includes('Trần') || 
          emp.name && emp.name.includes('Khái')
        );
        
        if (similarEmployees.length > 0) {
          console.log('\n3. Found similar employees:');
          similarEmployees.forEach(emp => {
            console.log(`   - ${emp.name} (${emp.uid}) - ${emp.position}`);
          });
          
          // Reassign to first similar employee
          const targetEmployee = similarEmployees[0];
          console.log(`\n4. Reassigning KPI to: ${targetEmployee.name} (${targetEmployee.uid})`);
          
          try {
            await updateDoc(doc(db, 'kpiRecords', problematicRecord.id), {
              employeeId: targetEmployee.uid,
              updatedAt: new Date().toISOString()
            });
            console.log('   ✅ KPI record updated successfully');
            
            // Update notification
            const notificationsSnap = await getDocs(collection(db, 'notifications'));
            const notifications = notificationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const relatedNotification = notifications.find(notif => 
              notif.userId === problematicRecord.employeeId && 
              notif.category === 'kpi_assigned'
            );
            
            if (relatedNotification) {
              await updateDoc(doc(db, 'notifications', relatedNotification.id), {
                userId: targetEmployee.uid,
                updatedAt: new Date().toISOString()
              });
              console.log('   ✅ Notification updated successfully');
            }
            
          } catch (error) {
            console.log('   ❌ Failed to update KPI record:', error.message);
          }
          
        } else {
          console.log('\n3. No similar employees found');
          console.log('   Options:');
          console.log('   a) Delete the KPI record');
          console.log('   b) Reassign to any available employee');
          
          // For now, let's reassign to the first available employee
          if (employees.length > 0) {
            const targetEmployee = employees[0];
            console.log(`\n4. Reassigning KPI to first available employee: ${targetEmployee.name} (${targetEmployee.uid})`);
            
            try {
              await updateDoc(doc(db, 'kpiRecords', problematicRecord.id), {
                employeeId: targetEmployee.uid,
                updatedAt: new Date().toISOString()
              });
              console.log('   ✅ KPI record updated successfully');
              
            } catch (error) {
              console.log('   ❌ Failed to update KPI record:', error.message);
            }
          }
        }
        
      } else {
        console.log('\n2. Employee exists in employees collection');
        console.log('   This means there might be a data loading issue');
      }
      
    } else {
      console.log('1. No problematic KPI record found');
    }
    
    // 6. Final verification
    console.log('\n5. Final verification...');
    const updatedKpiRecordsSnap = await getDocs(collection(db, 'kpiRecords'));
    const updatedKpiRecords = updatedKpiRecordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const stillProblematic = updatedKpiRecords.find(record => 
      record.employeeId === 'temp_1758939938071_5sk8lqgqh'
    );
    
    if (!stillProblematic) {
      console.log('   ✅ Problematic record has been fixed');
    } else {
      console.log('   ⚠️  Problematic record still exists');
    }
    
    // 7. Test employee KPI visibility
    console.log('\n6. Testing employee KPI visibility...');
    const testEmployee = employees.find(emp => emp.role !== 'admin');
    if (testEmployee) {
      const employeeKpis = updatedKpiRecords.filter(record => record.employeeId === testEmployee.uid);
      console.log(`   Employee: ${testEmployee.name} (${testEmployee.uid})`);
      console.log(`   Assigned KPIs: ${employeeKpis.length}`);
      
      if (employeeKpis.length > 0) {
        console.log('   ✅ Employee can see assigned KPIs');
        employeeKpis.forEach(record => {
          console.log(`     - KPI ID: ${record.kpiId}, Status: ${record.status}`);
        });
      } else {
        console.log('   ⚠️  Employee has no assigned KPIs');
      }
    }

  } catch (error) {
    console.error('❌ Error during fix:', error);
  }
}

// Run the fix function
findAndFixMissingEmployee().then(() => {
  console.log('\n🏁 Fix completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});
