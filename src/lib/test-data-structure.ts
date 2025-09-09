// Test script to verify data structure before saving to Firestore
import { rewardProgramsData, kpiDefinitions } from './reward-programs-data';

export const testDataStructure = () => {
  console.log('Testing data structure...');
  
  // Test KPI definitions
  console.log(`\n📊 KPI Definitions: ${kpiDefinitions.length} items`);
  kpiDefinitions.forEach((kpi, index) => {
    const hasUndefined = Object.values(kpi).some(value => value === undefined);
    if (hasUndefined) {
      console.error(`❌ KPI ${index + 1} (${kpi.name}) has undefined values:`, kpi);
    } else {
      console.log(`✅ KPI ${index + 1}: ${kpi.name} - ${kpi.department}`);
    }
  });
  
  // Test reward programs
  console.log(`\n🎁 Reward Programs: ${rewardProgramsData.length} items`);
  rewardProgramsData.forEach((program, index) => {
    const hasUndefined = Object.values(program).some(value => value === undefined);
    if (hasUndefined) {
      console.error(`❌ Program ${index + 1} (${program.name}) has undefined values:`, program);
    } else {
      console.log(`✅ Program ${index + 1}: ${program.name} - ${program.position}`);
      console.log(`   - Quarterly: ${program.quarterlyRewards.length} rewards`);
      console.log(`   - Monthly: ${program.monthlyRewards.length} rewards`);
      console.log(`   - Annual: ${program.annualRewards.length} rewards`);
      console.log(`   - Penalties: ${program.penalties.length} penalties`);
    }
  });
  
  // Test nested objects for undefined values
  console.log('\n🔍 Checking nested objects...');
  rewardProgramsData.forEach((program, programIndex) => {
    // Check quarterly rewards
    program.quarterlyRewards.forEach((reward, rewardIndex) => {
      const hasUndefined = Object.values(reward).some(value => value === undefined);
      if (hasUndefined) {
        console.error(`❌ Program ${programIndex + 1} Quarterly Reward ${rewardIndex + 1} has undefined values:`, reward);
      }
      
      // Check conditions
      reward.conditions.forEach((condition, conditionIndex) => {
        const hasUndefined = Object.values(condition).some(value => value === undefined);
        if (hasUndefined) {
          console.error(`❌ Program ${programIndex + 1} Quarterly Reward ${rewardIndex + 1} Condition ${conditionIndex + 1} has undefined values:`, condition);
        }
      });
    });
    
    // Check penalties
    program.penalties.forEach((penalty, penaltyIndex) => {
      const hasUndefined = Object.values(penalty).some(value => value === undefined);
      if (hasUndefined) {
        console.error(`❌ Program ${programIndex + 1} Penalty ${penaltyIndex + 1} has undefined values:`, penalty);
      }
    });
  });
  
  console.log('\n✅ Data structure test completed!');
  return true;
};
