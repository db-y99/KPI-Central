import { collection, getDocs, addDoc, doc, writeBatch, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { rewardProgramsData, kpiDefinitions } from './reward-programs-data';
import type { RewardProgram, Kpi } from '@/types';

export const initializeRewardSystem = async () => {
  try {
    console.log('Starting reward system initialization...');
    
    // Check if data already exists
    const rewardProgramsSnap = await getDocs(collection(db, 'rewardPrograms'));
    const kpisSnap = await getDocs(collection(db, 'kpis'));
    
    const existingPrograms = rewardProgramsSnap.docs.map(doc => doc.data() as RewardProgram);
    const existingKpis = kpisSnap.docs.map(doc => doc.data() as Kpi);
    
    console.log(`Found ${existingPrograms.length} existing reward programs`);
    console.log(`Found ${existingKpis.length} existing KPIs`);
    
    // Use batch writes for efficiency
    const batch = writeBatch(db);
    let batchCount = 0;
    const maxBatchSize = 500; // Firestore batch limit
    
    // Add KPI definitions
    console.log('Adding KPI definitions...');
    for (const kpiData of kpiDefinitions) {
      // Check if KPI already exists
      const existingKpi = existingKpis.find(kpi => 
        kpi.name === kpiData.name && kpi.department === kpiData.department
      );
      
      if (!existingKpi) {
        const kpiRef = doc(collection(db, 'kpis'));
        // Ensure all fields are properly defined
        const kpiToSave = {
          ...kpiData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Ensure all required fields are present
          category: kpiData.category || 'general',
          weight: kpiData.weight || 1,
          reward: kpiData.reward || 0,
          penalty: kpiData.penalty || 0
        };
        
        batch.set(kpiRef, kpiToSave);
        batchCount++;
        
        // Commit batch if approaching limit
        if (batchCount >= maxBatchSize) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} KPIs`);
          batchCount = 0;
        }
      } else {
        console.log(`KPI "${kpiData.name}" already exists, skipping...`);
      }
    }
    
    // Commit remaining KPIs
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} KPIs`);
      batchCount = 0;
    }
    
    // Add reward programs
    console.log('Adding reward programs...');
    const newBatch = writeBatch(db);
    
    for (const programData of rewardProgramsData) {
      // Check if program already exists
      const existingProgram = existingPrograms.find(program => 
        program.position === programData.position && program.year === programData.year
      );
      
      if (!existingProgram) {
        const programRef = doc(collection(db, 'rewardPrograms'));
        // Ensure all fields are properly defined and no undefined values
        const programToSave = {
          ...programData,
          // Ensure monthlyRewards is always an array
          monthlyRewards: programData.monthlyRewards || [],
          // Clean up any undefined values in nested objects
          quarterlyRewards: programData.quarterlyRewards.map(reward => ({
            ...reward,
            maxValue: reward.maxValue || null,
            conditions: reward.conditions.map(condition => ({
              ...condition,
              secondValue: condition.secondValue || null,
              unit: condition.unit || null
            }))
          })),
          annualRewards: programData.annualRewards.map(reward => ({
            ...reward,
            maxValue: reward.maxValue || null,
            conditions: reward.conditions.map(condition => ({
              ...condition,
              secondValue: condition.secondValue || null,
              unit: condition.unit || null
            }))
          })),
          penalties: programData.penalties.map(penalty => ({
            ...penalty,
            maxValue: penalty.maxValue || null,
            conditions: penalty.conditions.map(condition => ({
              ...condition,
              secondValue: condition.secondValue || null,
              unit: condition.unit || null
            }))
          }))
        };
        
        newBatch.set(programRef, programToSave);
        batchCount++;
        
        // Commit batch if approaching limit
        if (batchCount >= maxBatchSize) {
          await newBatch.commit();
          console.log(`Committed batch of ${batchCount} reward programs`);
          batchCount = 0;
        }
      } else {
        console.log(`Reward program for "${programData.position}" already exists, skipping...`);
      }
    }
    
    // Commit remaining reward programs
    if (batchCount > 0) {
      await newBatch.commit();
      console.log(`Committed final batch of ${batchCount} reward programs`);
    }
    
    console.log('✅ Reward system initialization completed successfully!');
    
    return {
      success: true,
      message: 'Reward system initialized successfully',
      addedKpis: kpiDefinitions.length,
      addedPrograms: rewardProgramsData.length
    };
    
  } catch (error) {
    console.error('❌ Error initializing reward system:', error);
    throw new Error(`Failed to initialize reward system: ${error}`);
  }
};

// Function to check system status
export const checkRewardSystemStatus = async () => {
  try {
    const rewardProgramsSnap = await getDocs(collection(db, 'rewardPrograms'));
    const kpisSnap = await getDocs(collection(db, 'kpis'));
    
    const programs = rewardProgramsSnap.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as RewardProgram));
    
    const kpis = kpisSnap.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Kpi));
    
    // Group programs by position
    const programsByPosition = programs.reduce((acc, program) => {
      acc[program.position] = program;
      return acc;
    }, {} as Record<string, RewardProgram>);
    
    // Group KPIs by department
    const kpisByDepartment = kpis.reduce((acc, kpi) => {
      if (!acc[kpi.department]) {
        acc[kpi.department] = [];
      }
      acc[kpi.department].push(kpi);
      return acc;
    }, {} as Record<string, Kpi[]>);
    
    return {
      totalPrograms: programs.length,
      totalKpis: kpis.length,
      programsByPosition,
      kpisByDepartment,
      isInitialized: programs.length > 0 && kpis.length > 0
    };
    
  } catch (error) {
    console.error('Error checking reward system status:', error);
    throw error;
  }
};

// Function to reset reward system (for development/testing)
export const resetRewardSystem = async () => {
  try {
    console.log('⚠️ Resetting reward system...');
    
    // Get all documents
    const [rewardProgramsSnap, kpisSnap] = await Promise.all([
      getDocs(collection(db, 'rewardPrograms')),
      getDocs(collection(db, 'kpis'))
    ]);
    
    // Delete all reward programs
    const batch = writeBatch(db);
    let batchCount = 0;
    
    rewardProgramsSnap.docs.forEach(doc => {
      batch.delete(doc.ref);
      batchCount++;
    });
    
    kpisSnap.docs.forEach(doc => {
      batch.delete(doc.ref);
      batchCount++;
    });
    
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Deleted ${batchCount} documents`);
    }
    
    console.log('✅ Reward system reset completed!');
    
    return {
      success: true,
      message: 'Reward system reset successfully',
      deletedDocuments: batchCount
    };
    
  } catch (error) {
    console.error('❌ Error resetting reward system:', error);
    throw new Error(`Failed to reset reward system: ${error}`);
  }
};
