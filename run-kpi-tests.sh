#!/bin/bash

echo "🧪 Running KPI Management Test Suite..."
echo

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed or not in PATH"
    exit 1
fi

# Start development server in background
echo "🚀 Starting development server..."
npm run dev &
SERVER_PID=$!

# Wait for server to start
echo "⏱️  Waiting for server to start..."
sleep 10

# Check if server is running
if ! curl -s http://localhost:9001 > /dev/null; then
    echo "❌ Server failed to start at http://localhost:9001"
    kill $SERVER_PID
    exit 1
fi

echo "✅ Server is running at http://localhost:9001"
echo "📝 Running Playwright tests for KPI Management..."
echo

# Run tests with HTML reporter
npx playwright test tests/admin/kpi-management.spec.ts --reporter=html --project=chromium

# Stop the server
echo "🛑 Stopping development server..."
kill $SERVER_PID

echo
echo "✅ Test execution completed!"
echo "📄 Check playwright-report/index.html for detailed results"
echo

# Ask user if they want to open the report
read -p "Do you want to open the HTML report? (y/n): " choice
if [[ "$choice" == "y" || "$choice" == "Y" ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open playwright-report/index.html
    elif command -v open &> /dev/null; then
        open playwright-report/index.html
    else
        echo "Please manually open playwright-report/index.html in your browser"
    fi
fi

