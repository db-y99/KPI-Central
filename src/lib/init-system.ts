import { writeBatch, doc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const initializeKPISystem = async () => {
  try {
    console.log('🚀 Initializing KPI Central System...');
    
    // Check if system is already initialized
    const existingDepartments = await getDocs(collection(db, 'departments'));
    
    if (existingDepartments.empty) {
      console.log('📊 System is ready for manual data setup...');
      console.log('');
      console.log('🔑 Login credentials:');
      console.log('   Admin: db@y99.vn / 123456');
      console.log('');
      console.log('📝 Next steps:');
      console.log('   1. Add departments in Admin > Management');
      console.log('   2. Add employees in Admin > Management');
      console.log('   3. Create KPIs in Admin > KPI Definitions');
      console.log('   4. Set up reward programs in Admin > Rewards');
      
      return {
        success: true,
        message: 'System ready for manual setup',
        data: null
      };
    } else {
      console.log('✅ System already initialized');
      return {
        success: true,
        message: 'System already initialized',
        data: null
      };
    }
  } catch (error) {
    console.error('❌ Error initializing system:', error);
    return {
      success: false,
      message: 'Failed to initialize system',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const getSystemStatus = async () => {
  try {
    const collections = [
      'departments',
      'employees',
      'kpis',
      'kpiRecords',
      'rewardPrograms',
      'positionConfigs'
    ];
    
    const status: Record<string, number> = {};
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      status[collectionName] = snapshot.size;
    }
    
    const isInitialized = Object.values(status).some(count => count > 0);
    
    return {
      isInitialized,
      collections: status,
      summary: {
        totalDepartments: status.departments,
        totalEmployees: status.employees,
        totalKpis: status.kpis,
        totalKpiRecords: status.kpiRecords,
        totalRewardPrograms: status.rewardPrograms,
        totalPositionConfigs: status.positionConfigs
      }
    };
  } catch (error) {
    console.error('Error getting system status:', error);
    return {
      isInitialized: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Utility function to reset the system
export const resetSystem = async () => {
  try {
    console.log('🔄 Resetting KPI Central System...');
    
    const collections = [
      'departments',
      'employees', 
      'kpis',
      'kpiRecords',
      'rewardPrograms',
      'positionConfigs',
      'employeePoints',
      'rewardCalculations',
      'metricData'
    ];

    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      const batch = writeBatch(db);
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      if (snapshot.docs.length > 0) {
        await batch.commit();
        console.log(`🗑️ Cleared ${snapshot.docs.length} documents from ${collectionName}`);
      }
    }
    
    console.log('✅ System reset completed');
    return { success: true, message: 'System reset successfully' };
  } catch (error) {
    console.error('❌ Error resetting system:', error);
    return { 
      success: false, 
      message: 'Failed to reset system',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
