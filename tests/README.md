# Playwright Testing Guide for KPI-Central

This document provides comprehensive guidance for running and maintaining Playwright end-to-end tests for the KPI-Central application.

## 🚀 Quick Start

### Prerequisites
- Node.js 20 or higher
- npm or yarn package manager
- Application running on `http://localhost:9001`

### Installation
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:install
```

### Running Tests
```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (visible browser)
npm run test:headed

# Run specific test suites
npm run test:auth        # Authentication tests
npm run test:admin       # Admin dashboard tests
npm run test:employee    # Employee dashboard tests
npm run test:integration # End-to-end integration tests
```

## 📁 Test Structure

```
tests/
├── auth/                 # Authentication flow tests
│   └── login.spec.ts
├── admin/                # Admin dashboard tests
│   └── dashboard.spec.ts
├── employee/             # Employee dashboard tests
│   └── dashboard.spec.ts
├── integration/          # End-to-end workflow tests
│   └── e2e-workflow.spec.ts
├── utils/                # Test utilities and helpers
│   ├── test-utils.ts
│   ├── auth-helper.ts
│   └── kpi-helper.ts
├── fixtures/              # Test fixtures and data
├── global-setup.ts        # Global test setup
└── global-teardown.ts     # Global test cleanup
```

## 🛠️ Test Utilities

### TestUtils Class
Provides common testing utilities:
- `waitForPageLoad()` - Wait for page to be fully loaded
- `waitForElement()` - Wait for element to be visible
- `fillFormField()` - Fill form field with validation
- `clickButton()` - Click button with retry logic
- `takeScreenshot()` - Take timestamped screenshots

### AuthHelper Class
Handles authentication flows:
- `loginAsAdmin()` - Login as admin user
- `loginAsEmployee()` - Login as employee user
- `logout()` - Logout from application
- `testInvalidLogin()` - Test invalid credentials

### KPIHelper Class
Manages KPI operations:
- `createKPI()` - Create new KPI
- `editKPI()` - Edit existing KPI
- `deleteKPI()` - Delete KPI
- `assignKPIToEmployee()` - Assign KPI to employee

## 🎯 Test Categories

### Authentication Tests (`tests/auth/`)
- Login form validation
- Admin and employee login flows
- Invalid credential handling
- Remember me functionality
- Logout functionality
- Protected route access

### Admin Dashboard Tests (`tests/admin/`)
- Dashboard overview and statistics
- KPI management (CRUD operations)
- Employee management
- System settings
- Reports and analytics
- Reward system configuration

### Employee Dashboard Tests (`tests/employee/`)
- Employee dashboard overview
- KPI progress tracking
- Personal information management
- Reports and history
- Notifications and alerts
- Responsive design

### Integration Tests (`tests/integration/`)
- Complete KPI workflow
- Multi-user scenarios
- Data consistency
- Error handling and recovery
- Performance testing
- Concurrent operations

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:9001`
- **Timeouts**: 30s for tests, 10s for actions
- **Retries**: 2 retries on CI, 0 locally
- **Reporters**: HTML, JSON, JUnit
- **Screenshots**: On failure only
- **Videos**: Retain on failure

### Test Data (`tests/utils/test-utils.ts`)
```typescript
export const TEST_DATA = {
  ADMIN: {
    email: 'db@y99.vn',
    password: 'admin123',
    name: 'Administrator',
    role: 'admin'
  },
  EMPLOYEE: {
    email: 'employee@y99.vn',
    password: 'employee123',
    name: 'Test Employee',
    role: 'employee'
  },
  // ... more test data
};
```

## 🚦 CI/CD Integration

### GitHub Actions Workflow
The project includes a comprehensive CI/CD pipeline:

1. **Test Job**: Runs all tests in parallel
2. **Auth Tests**: Dedicated authentication testing
3. **Admin Tests**: Admin functionality testing
4. **Employee Tests**: Employee functionality testing
5. **Integration Tests**: End-to-end workflow testing
6. **Deploy Job**: Automatic deployment on main branch

### Environment Variables
Required secrets in GitHub repository:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

## 📊 Test Reports

### HTML Report
```bash
npm run test:report
```
Opens interactive HTML report with:
- Test results overview
- Screenshots and videos
- Test execution timeline
- Error details and stack traces

### JSON Report
Test results are saved to `test-results/results.json` for programmatic analysis.

### JUnit Report
Test results are saved to `test-results/results.xml` for CI/CD integration.

## 🐛 Debugging Tests

### Debug Mode
```bash
npm run test:debug
```
Opens Playwright Inspector for step-by-step debugging.

### Headed Mode
```bash
npm run test:headed
```
Runs tests with visible browser windows.

### Code Generation
```bash
npm run test:codegen
```
Opens Playwright Codegen to record new tests.

### Screenshots
Screenshots are automatically taken on test failures and saved to `test-results/screenshots/`.

## 🔍 Best Practices

### Test Writing
1. **Descriptive Names**: Use clear, descriptive test names
2. **Single Responsibility**: Each test should verify one specific behavior
3. **Independent Tests**: Tests should not depend on each other
4. **Clean Setup**: Use `beforeEach` for consistent test setup
5. **Proper Cleanup**: Use `afterEach` for test cleanup

### Selectors
1. **Prefer Semantic Selectors**: Use `getByRole`, `getByLabel`, `getByText`
2. **Avoid Complex Selectors**: Keep selectors simple and maintainable
3. **Use Test IDs**: Add `data-testid` attributes for stable selectors
4. **Wait for Elements**: Always wait for elements before interacting

### Data Management
1. **Use Test Data**: Define test data in `TEST_DATA` constant
2. **Clean State**: Ensure tests start with clean state
3. **Isolation**: Each test should be able to run independently
4. **Mock External Services**: Mock external APIs when possible

## 🚨 Troubleshooting

### Common Issues

#### Test Timeouts
- Increase timeout in `playwright.config.ts`
- Check for slow network requests
- Verify application is running properly

#### Element Not Found
- Check if element exists before interaction
- Use proper wait strategies
- Verify selector is correct

#### Authentication Failures
- Check Firebase configuration
- Verify test user credentials
- Ensure application is accessible

#### Flaky Tests
- Add proper waits for dynamic content
- Use retry logic for unstable elements
- Check for race conditions

### Debug Commands
```bash
# Run specific test file
npx playwright test tests/auth/login.spec.ts

# Run test with specific browser
npx playwright test --project=chromium

# Run test with specific grep pattern
npx playwright test --grep "should login successfully"

# Run test in debug mode
npx playwright test --debug tests/auth/login.spec.ts
```

## 📈 Performance Monitoring

### Test Performance
- Monitor test execution time
- Identify slow tests
- Optimize test data and setup

### Application Performance
- Test dashboard load times
- Verify response times
- Check for memory leaks

## 🔄 Maintenance

### Regular Tasks
1. **Update Dependencies**: Keep Playwright and browsers updated
2. **Review Test Results**: Analyze test failures and flaky tests
3. **Refactor Tests**: Improve test maintainability
4. **Add New Tests**: Cover new features and edge cases

### Test Data Management
1. **Clean Test Data**: Remove test data after tests
2. **Update Test Data**: Keep test data current with application changes
3. **Data Isolation**: Ensure tests don't interfere with each other

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Patterns](https://playwright.dev/docs/test-patterns)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## 🤝 Contributing

When adding new tests:
1. Follow existing patterns and conventions
2. Add appropriate test data
3. Include both positive and negative test cases
4. Update documentation as needed
5. Ensure tests are maintainable and reliable


