// Test script để verify KPI status transitions
console.log('🧪 Testing KPI Status Transitions...\n');

// Mock KpiStatusService methods
const STATUS_CONFIGS = {
  'not_started': { label: 'Chưa bắt đầu' },
  'in_progress': { label: 'Đang thực hiện' },
  'submitted': { label: 'Đã nộp' },
  'awaiting_approval': { label: 'Chờ duyệt' },
  'approved': { label: 'Đã duyệt' },
  'rejected': { label: 'Từ chối' }
};

const VALID_TRANSITIONS = {
  'not_started': ['in_progress', 'awaiting_approval'],
  'in_progress': ['submitted', 'awaiting_approval', 'rejected'],
  'submitted': ['approved', 'rejected'],
  'awaiting_approval': ['approved', 'rejected'],
  'approved': [],
  'rejected': ['in_progress']
};

function getStatusLabel(status) {
  return STATUS_CONFIGS[status]?.label || 'Trạng thái không xác định';
}

function canTransition(from, to) {
  return VALID_TRANSITIONS[from]?.includes(to) || false;
}

function validateTransition(record, newStatus, userRole, additionalData) {
  // Kiểm tra trạng thái hiện tại hợp lệ
  if (!record.status || !STATUS_CONFIGS[record.status]) {
    return {
      isValid: false,
      error: `Trạng thái hiện tại không hợp lệ: ${record.status}`
    };
  }

  // Kiểm tra trạng thái mới hợp lệ
  if (!newStatus || !STATUS_CONFIGS[newStatus]) {
    return {
      isValid: false,
      error: `Trạng thái mới không hợp lệ: ${newStatus}`
    };
  }
  
  // Kiểm tra quyền hạn
  if (newStatus === 'awaiting_approval' && userRole !== 'employee') {
    return {
      isValid: false,
      error: 'Chỉ nhân viên mới có thể nộp KPI chờ duyệt'
    };
  }

  // Employee có thể submit trực tiếp từ not_started sang awaiting_approval
  if (userRole === 'employee' && record.status === 'not_started' && newStatus === 'awaiting_approval') {
    if (additionalData?.actual && additionalData.actual > 0) {
      return { isValid: true };
    } else {
      return {
        isValid: false,
        error: 'Phải có giá trị thực tế > 0 để nộp KPI'
      };
    }
  }
  
  // Kiểm tra transition hợp lệ
  if (!canTransition(record.status, newStatus)) {
    return {
      isValid: false,
      error: `Không thể chuyển từ "${getStatusLabel(record.status)}" sang "${getStatusLabel(newStatus)}"`
    };
  }

  return { isValid: true };
}

// Test cases
console.log('1. Testing valid transitions:');

const testCases = [
  {
    name: 'Employee: not_started → awaiting_approval (with actual value)',
    record: { status: 'not_started', actual: 0 },
    newStatus: 'awaiting_approval',
    userRole: 'employee',
    additionalData: { actual: 100 }
  },
  {
    name: 'Employee: not_started → awaiting_approval (no actual value)',
    record: { status: 'not_started', actual: 0 },
    newStatus: 'awaiting_approval',
    userRole: 'employee',
    additionalData: { actual: 0 }
  },
  {
    name: 'Employee: in_progress → awaiting_approval',
    record: { status: 'in_progress', actual: 50 },
    newStatus: 'awaiting_approval',
    userRole: 'employee',
    additionalData: { actual: 100 }
  },
  {
    name: 'Admin: awaiting_approval → approved',
    record: { status: 'awaiting_approval', actual: 100 },
    newStatus: 'approved',
    userRole: 'admin',
    additionalData: {}
  }
];

testCases.forEach((testCase, index) => {
  const result = validateTransition(
    testCase.record,
    testCase.newStatus,
    testCase.userRole,
    testCase.additionalData
  );
  
  const status = result.isValid ? '✅' : '❌';
  console.log(`   ${status} ${testCase.name}: ${result.isValid ? 'Valid' : result.error}`);
});

console.log('\n🏁 KPI Status Transition test completed');
