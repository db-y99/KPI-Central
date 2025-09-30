@echo off
echo 🧪 Running KPI Management Test Suite...
echo.

REM Ensure we have npm installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed or not in PATH
    pause
    exit /b 1
)

REM Start development server in background
echo 🚀 Starting development server...
start /min cmd /c "npm run dev"
timeout /t 10 /nobreak >nul

echo 📝 Running Playwright tests for KPI Management...
echo.

REM Run tests with HTML reporter
npx playwright test tests/admin/kpi-management.spec.ts --reporter=html --project=chromium

echo.
echo ✅ Test execution completed!
echo 📄 Check playwright-report/index.html for detailed results
echo.

REM Ask user if they want to open the report
set /p choice="Do you want to open the HTML report? (y/n): "
if /i "%choice%"=="y" start playwright-report/index.html

pause

