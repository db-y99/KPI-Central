/**
 * Test Suite for KPI Status Consistency Fix
 * 
 * File này chứa các test cases để validate tất cả thay đổi về KPI status
 */

import { KpiStatusService, KpiStatus } from '@/lib/kpi-status-service';
import { KpiRecord } from '@/types';

// Mock data cho testing
const mockKpiRecord: KpiRecord = {
  id: 'test-record-1',
  kpiId: 'test-kpi-1',
  employeeId: 'test-employee-1',
  target: 100,
  actual: 0,
  targetValue: 100,
  actualValue: 0,
  period: '2024-01',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  status: 'not_started',
  updatedAt: '2024-01-01T00:00:00Z'
};

export class KpiStatusTestSuite {
  
  /**
   * Test 1: Validate status transitions
   */
  static testStatusTransitions(): boolean {
    console.log('🧪 Testing status transitions...');
    
    const testCases = [
      { from: 'not_started', to: 'in_progress', expected: true },
      { from: 'in_progress', to: 'submitted', expected: true },
      { from: 'submitted', to: 'approved', expected: true },
      { from: 'submitted', to: 'rejected', expected: true },
      { from: 'rejected', to: 'in_progress', expected: true },
      { from: 'approved', to: 'submitted', expected: false }, // Invalid
      { from: 'not_started', to: 'approved', expected: false }, // Invalid
    ];

    let passed = 0;
    let failed = 0;

    testCases.forEach(testCase => {
      const result = KpiStatusService.canTransition(
        testCase.from as KpiStatus, 
        testCase.to as KpiStatus
      );
      
      if (result === testCase.expected) {
        console.log(`✅ ${testCase.from} → ${testCase.to}: ${result}`);
        passed++;
      } else {
        console.log(`❌ ${testCase.from} → ${testCase.to}: expected ${testCase.expected}, got ${result}`);
        failed++;
      }
    });

    console.log(`📊 Status transitions: ${passed} passed, ${failed} failed`);
    return failed === 0;
  }

  /**
   * Test 2: Validate business rules
   */
  static testBusinessRules(): boolean {
    console.log('🧪 Testing business rules...');
    
    let passed = 0;
    let failed = 0;

    // Test employee can submit
    const employeeSubmitTest = KpiStatusService.validateTransition(
      { ...mockKpiRecord, status: 'in_progress', actual: 50 },
      'submitted',
      'employee',
      { actual: 50 }
    );
    
    if (employeeSubmitTest.isValid) {
      console.log('✅ Employee can submit KPI');
      passed++;
    } else {
      console.log('❌ Employee cannot submit KPI:', employeeSubmitTest.error);
      failed++;
    }

    // Test admin can approve
    const adminApproveTest = KpiStatusService.validateTransition(
      { ...mockKpiRecord, status: 'submitted' },
      'approved',
      'admin'
    );
    
    if (adminApproveTest.isValid) {
      console.log('✅ Admin can approve KPI');
      passed++;
    } else {
      console.log('❌ Admin cannot approve KPI:', adminApproveTest.error);
      failed++;
    }

    // Test employee cannot approve
    const employeeApproveTest = KpiStatusService.validateTransition(
      { ...mockKpiRecord, status: 'submitted' },
      'approved',
      'employee'
    );
    
    if (!employeeApproveTest.isValid) {
      console.log('✅ Employee cannot approve KPI (correct)');
      passed++;
    } else {
      console.log('❌ Employee can approve KPI (incorrect)');
      failed++;
    }

    // Test cannot submit without actual value
    const noActualTest = KpiStatusService.validateTransition(
      { ...mockKpiRecord, status: 'in_progress', actual: 0 },
      'submitted',
      'employee',
      { actual: 0 }
    );
    
    if (!noActualTest.isValid) {
      console.log('✅ Cannot submit without actual value (correct)');
      passed++;
    } else {
      console.log('❌ Can submit without actual value (incorrect)');
      failed++;
    }

    console.log(`📊 Business rules: ${passed} passed, ${failed} failed`);
    return failed === 0;
  }

  /**
   * Test 3: Validate status configurations
   */
  static testStatusConfigurations(): boolean {
    console.log('🧪 Testing status configurations...');
    
    const statuses: KpiStatus[] = ['not_started', 'in_progress', 'submitted', 'approved', 'rejected'];
    let passed = 0;
    let failed = 0;

    statuses.forEach(status => {
      try {
        const config = KpiStatusService.getStatusConfig(status);
        
        if (config.label && config.color && config.icon && config.description) {
          console.log(`✅ ${status}: ${config.label}`);
          passed++;
        } else {
          console.log(`❌ ${status}: Missing configuration`);
          failed++;
        }
      } catch (error) {
        console.log(`❌ ${status}: Error getting config - ${error}`);
        failed++;
      }
    });

    console.log(`📊 Status configurations: ${passed} passed, ${failed} failed`);
    return failed === 0;
  }

  /**
   * Test 4: Validate migration logic
   */
  static testMigrationLogic(): boolean {
    console.log('🧪 Testing migration logic...');
    
    const migrationTests = [
      { old: 'pending', expected: 'not_started' },
      { old: 'awaiting_approval', expected: 'submitted' },
      { old: 'approved', expected: 'approved' },
      { old: 'rejected', expected: 'rejected' },
      { old: 'completed', expected: 'approved' },
      { old: 'in-progress', expected: 'in_progress' },
    ];

    let passed = 0;
    let failed = 0;

    migrationTests.forEach(test => {
      const result = KpiStatusService.migrateOldStatus(test.old);
      
      if (result === test.expected) {
        console.log(`✅ ${test.old} → ${result}`);
        passed++;
      } else {
        console.log(`❌ ${test.old} → expected ${test.expected}, got ${result}`);
        failed++;
      }
    });

    console.log(`📊 Migration logic: ${passed} passed, ${failed} failed`);
    return failed === 0;
  }

  /**
   * Test 5: Validate helper methods
   */
  static testHelperMethods(): boolean {
    console.log('🧪 Testing helper methods...');
    
    let passed = 0;
    let failed = 0;

    // Test isFinalStatus
    if (KpiStatusService.isFinalStatus('approved')) {
      console.log('✅ approved is final status');
      passed++;
    } else {
      console.log('❌ approved is not final status');
      failed++;
    }

    if (!KpiStatusService.isFinalStatus('in_progress')) {
      console.log('✅ in_progress is not final status');
      passed++;
    } else {
      console.log('❌ in_progress is final status');
      failed++;
    }

    // Test isEditableStatus
    if (KpiStatusService.isEditableStatus('not_started')) {
      console.log('✅ not_started is editable');
      passed++;
    } else {
      console.log('❌ not_started is not editable');
      failed++;
    }

    if (!KpiStatusService.isEditableStatus('approved')) {
      console.log('✅ approved is not editable');
      passed++;
    } else {
      console.log('❌ approved is editable');
      failed++;
    }

    // Test canSubmitStatus
    if (KpiStatusService.canSubmitStatus('in_progress')) {
      console.log('✅ in_progress can be submitted');
      passed++;
    } else {
      console.log('❌ in_progress cannot be submitted');
      failed++;
    }

    if (!KpiStatusService.canSubmitStatus('approved')) {
      console.log('✅ approved cannot be submitted');
      passed++;
    } else {
      console.log('❌ approved can be submitted');
      failed++;
    }

    // Test canApproveStatus
    if (KpiStatusService.canApproveStatus('submitted')) {
      console.log('✅ submitted can be approved');
      passed++;
    } else {
      console.log('❌ submitted cannot be approved');
      failed++;
    }

    if (!KpiStatusService.canApproveStatus('approved')) {
      console.log('✅ approved cannot be approved again');
      passed++;
    } else {
      console.log('❌ approved can be approved again');
      failed++;
    }

    console.log(`📊 Helper methods: ${passed} passed, ${failed} failed`);
    return failed === 0;
  }

  /**
   * Run all tests
   */
  static runAllTests(): boolean {
    console.log('🚀 Starting KPI Status Test Suite...\n');
    
    const tests = [
      this.testStatusTransitions,
      this.testBusinessRules,
      this.testStatusConfigurations,
      this.testMigrationLogic,
      this.testHelperMethods
    ];

    let allPassed = true;

    tests.forEach(test => {
      const result = test.call(this);
      allPassed = allPassed && result;
      console.log(''); // Empty line for readability
    });

    console.log('🎯 Test Suite Results:');
    console.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
    
    return allPassed;
  }
}

// Export để sử dụng
export default KpiStatusTestSuite;
