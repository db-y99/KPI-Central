// Test script to verify departments data structure
import { departmentsData } from './initialize-departments';

export const testDepartmentsStructure = () => {
  console.log('Testing departments data structure...');
  
  console.log(`\n🏢 Departments: ${departmentsData.length} items`);
  departmentsData.forEach((dept, index) => {
    const hasUndefined = Object.values(dept).some(value => value === undefined);
    if (hasUndefined) {
      console.error(`❌ Department ${index + 1} (${dept.name}) has undefined values:`, dept);
    } else {
      console.log(`✅ Department ${index + 1}: ${dept.name}`);
      console.log(`   - Description: ${dept.description}`);
      console.log(`   - Active: ${dept.isActive}`);
    }
  });
  
  console.log('\n✅ Departments data structure test completed!');
  return true;
};
