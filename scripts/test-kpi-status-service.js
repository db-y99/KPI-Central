const { KpiStatusService } = require('./src/lib/kpi-status-service.ts');

console.log('🧪 Testing KPI Status Service...\n');

// Test valid statuses
const validStatuses = ['not_started', 'in_progress', 'submitted', 'awaiting_approval', 'approved', 'rejected'];

console.log('1. Testing valid statuses:');
validStatuses.forEach(status => {
  try {
    const label = KpiStatusService.getStatusLabel(status);
    const color = KpiStatusService.getStatusColor(status);
    const icon = KpiStatusService.getStatusIcon(status);
    const description = KpiStatusService.getStatusDescription(status);
    
    console.log(`   ✅ ${status}: ${label} (${color}, ${icon})`);
  } catch (error) {
    console.log(`   ❌ ${status}: Error - ${error.message}`);
  }
});

console.log('\n2. Testing invalid statuses:');
const invalidStatuses = [undefined, null, '', 'invalid_status', 'pending'];

invalidStatuses.forEach(status => {
  try {
    const label = KpiStatusService.getStatusLabel(status);
    console.log(`   ✅ ${status}: ${label} (handled gracefully)`);
  } catch (error) {
    console.log(`   ❌ ${status}: Error - ${error.message}`);
  }
});

console.log('\n3. Testing transitions:');
const testRecord = {
  id: 'test-1',
  status: 'in_progress',
  actual: 100,
  target: 100
};

try {
  const validation = KpiStatusService.validateTransition(
    testRecord,
    'awaiting_approval',
    'employee',
    { actual: 100 }
  );
  console.log(`   ✅ Transition in_progress → awaiting_approval: ${validation.isValid ? 'Valid' : 'Invalid'}`);
  if (!validation.isValid) {
    console.log(`      Error: ${validation.error}`);
  }
} catch (error) {
  console.log(`   ❌ Transition test error: ${error.message}`);
}

console.log('\n🏁 KPI Status Service test completed');
