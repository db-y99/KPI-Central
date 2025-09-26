// App Actions
export * from './actions';

// Main App Components
export { default as RootLayout } from './layout';
export { default as LoadingPage } from './loading';
export { default as HomePage } from './page';
export { default as LoginPage } from './login/page';

// Admin Pages
export { default as AdminDashboard } from './admin/page';
export { default as AdminLayout } from './admin/layout';
export { default as ApprovalPage } from './admin/approval/page';
export { default as ApprovalLayout } from './admin/approval/layout';
export { default as DepartmentsPage } from './admin/departments/page';
export { default as EmployeesPage } from './admin/employees/page';
export { default as EvaluationPage } from './admin/evaluation/page';
export { default as EvaluationLayout } from './admin/evaluation/layout';
// EvaluationReportsPage is now integrated into KpiManagementPage
export { default as GoogleDriveConfigPage } from './admin/google-drive-config/page';
export { default as HrManagementPage } from './admin/hr-management/page';
export { default as InitPoliciesPage } from './admin/init-policies/page';
export { default as KpiAssignmentPage } from './admin/kpi-assignment/page';
export { default as KpiDefinitionsPage } from './admin/kpi-definitions/page';
export { default as KpiManagementPage } from './admin/kpi-management/page';
export { default as KpiTrackingPage } from './admin/kpi-tracking/page';
export { default as KpiTrackingLayout } from './admin/kpi-tracking/layout';
export { default as MetricsPage } from './admin/metrics/page';
export { default as PayrollIntegrationPage } from './admin/payroll-integration/page';
export { default as PoliciesOverviewPage } from './admin/policies-overview/page';
export { default as ReportsPage } from './admin/reports/page';
export { default as RewardCalculationsPage } from './admin/reward-calculations/page';
export { default as RewardProgramsPage } from './admin/reward-programs/page';
export { default as SettingsPage } from './admin/settings/page';
export { default as SystemSettingsPage } from './admin/system-settings/page';

// Employee Pages
export { default as EmployeeDashboard } from './employee/page';
export { default as EmployeeLayout } from './employee/layout';
export { default as EmployeeCalendarPage } from './employee/calendar/page';
export { default as EmployeeProfilePage } from './employee/profile/page';
export { default as EmployeeProfileEditPage } from './employee/profile/edit/page';
export { default as EmployeeProfileEnhancedPage } from './employee/profile/enhanced-page';
export { default as EmployeeReportsPage } from './employee/reports/page';
export { default as EmployeeReportsLayout } from './employee/reports/layout';
export { default as SelfUpdateMetricsPage } from './employee/self-update-metrics/page';

// API Routes
export * from './api/auth/route';
export * from './api/employees/route';
export * from './api/google-drive/route';
export * from './api/kpis/route';
export * from './api/metrics/route';
export * from './api/system/route';
