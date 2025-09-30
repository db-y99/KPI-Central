#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running KPI Management Test Suite...\n');

// Ensure we're in the project root
process.chdir(path.resolve(__dirname, '..'));

const testSuites = [
  {
    name: 'KPI Definitions Tab Tests',
    command: 'npx playwright test tests/admin/kpi-management.spec.ts --grep "KPI Definitions"',
    description: 'Testing KPI creation, editing, deletion, and table functionality'
  },
  {
    name: 'KPI Assignment Tab Tests', 
    command: 'npx playwright test tests/admin/kpi-management.spec.ts --grep "KPI Assignment"',
    description: 'Testing individual and bulk KPI assignments'
  },
  {
    name: 'KPI Tracking Tab Tests',
    command: 'npx playwright test tests/admin/kpi-management.spec.ts --grep "KPI Tracking"', 
    description: 'Testing progress tracking and updates'
  },
  {
    name: 'Approval Tab Tests',
    command: 'npx playwright test tests/admin/kpi-management.spec.ts --grep "Approval"',
    description: 'Testing approval workflow and file handling'
  },
  {
    name: 'Reward & Penalty Tab Tests',
    command: 'npx playwright test tests/admin/kpi-management.spec.ts --grep "Reward.*Penalty"',
    description: 'Testing reward/penalty calculation and management'
  },
  {
    name: 'Full Workflow Tests',
    command: 'npx playwright test tests/admin/kpi-management.spec.ts --grep "Full Workflow"',
    description: 'Testing complete workflow from KPI creation to reward calculation'
  },
  {
    name: 'Individual Feature Tests',
    command: 'npx playwright test tests/admin/kpi-management.spec.ts --grep "Individual KPI Management Features"',
    description: 'Testing specific features like form validation, bulk operations'
  },
  {
    name: 'Navigation Tests',
    command: 'npx playwright test tests/admin/kpi-management.spec.ts --grep "Navigation"',
    description: 'Testing tab switching and navigation'
  },
  {
    name: 'Responsive Design Tests',
    command: 'npx playwright test tests/admin/kpi-management.spec.ts --grep "Responsive Design"',
    description: 'Testing mobile and tablet responsiveness'
  },
  {
    name: 'Search and Filter Tests', 
    command: 'npx playwright test tests/admin/kpi-management.spec.ts --grep "Search and Filter"',
    description: 'Testing search and filter functionality across tabs'
  },
  {
    name: 'Error Handling Tests',
    command: 'npx playwright test tests/admin/kpi-management.spec.ts --grep "Error Handling"',
    description: 'Testing error scenarios and edge cases'
  },
  {
    name: 'Data Persistence Tests',
    command: 'npx playwright test tests/admin/kpi-management.spec.ts --grep "Data Persistence"',
    description: 'Testing data persistence across navigation'
  },
  {
    name: 'Performance Tests',
    command: 'npx playwright test tests/admin/kpi-management.spec.ts --grep "Performance Tests"',
    description: 'Testing page load performance and lazy loading'
  }
];

const results = [];

// Run each test suite
for (let i = 0; i < testSuites.length; i++) {
  const suite = testSuites[i];
  
  console.log(`\n${i + 1}/${testSuites.length} Running: ${suite.name}`);
  console.log(`${suite.description}`);
  console.log('-'.repeat(60));
  
  try {
    console.log(`Command: ${suite.command}`);
    
    const startTime = Date.now();
    const output = execSync(suite.command, { 
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    const duration = Date.now() - startTime;
    results.push({
      suite: suite.name,
      status: 'PASSED',
      duration: `${Math.round(duration / 1000)}s`,
      output: output
    });
    
    console.log(`✅ ${suite.name} - PASSED (${Math.round(duration / 1000)}s)`);
    
  } catch (error) {
    console.log(`❌ ${suite.name} - FAILED`);
    console.log(`Error: ${error.message}`);
    
    results.push({
      suite: suite.name,
      status: 'FAILED', 
      duration: '0s',
      error: error.message
    });
  }
}

// Generate summary report
console.log('\n' + '='.repeat(80));
console.log('📊 KPI MANAGEMENT TEST SUITE RESULTS');
console.log('='.repeat(80));

const passed = results.filter(r => r.status === 'PASSED').length;
const failed = results.filter(r => r.status === 'FAILED').length;
const total = results.length;

console.log(`\nTotal Test Suites: ${total}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Pass Rate: ${Math.round((passed / total) * 100)}%`);

if (failed > 0) {
  console.log('\n❌ FAILED TEST SUITES:');
  results.filter(r => r.status === 'FAILED').forEach(result => {
    console.log(`   - ${result.suite}: ${result.error}`);
  });
}

console.log('\n📋 DETAILED RESULTS:');
results.forEach(result => {
  const icon = result.status === 'PASSED' ? '✅' : '❌';
  console.log(`   ${icon} ${result.suite} (${result.duration})`);
});

// Generate HTML report
console.log('\n🔧 Running full test suite to generate HTML report...');
try {
  execSync('npx playwright test tests/admin/kpi-management.spec.ts --reporter=html', {
    encoding: 'utf8',
    stdio: 'inherit'
  });
  console.log('📄 HTML report generated successfully!');
} catch (error) {
  console.log('⚠️  HTML report generation failed:', error.message);
}

console.log('\n🎯 Test execution completed!');
console.log('\n📁 Test artifacts location:');
console.log('   - HTML Report: playwright-report/index.html');
console.log('   - Screenshots: test-results/');
console.log('   - Videos: test-results/');

if (failed > 0) {
  console.log('\n💡 Review failed tests and fix issues before deployment.');
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed! KPI Management system is ready for production.');
  process.exit(0);
}

