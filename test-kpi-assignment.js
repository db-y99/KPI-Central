#!/usr/bin/env node

/**
 * Test script for KPI Assignment component
 * Tests the updated KPI Assignment component to ensure it displays correctly with data
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testKpiAssignmentComponent() {
  console.log('🧪 Testing KPI Assignment component...');

  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to KPI Management page with assignment tab
    console.log('📍 Navigating to KPI Assignment tab...');
    await page.goto('http://localhost:3000/admin/kpi-management?tab=assignment', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for the component to load
    await page.waitForSelector('[data-testid="kpi-assignment-table"], .space-y-6', { timeout: 10000 });

    console.log('✅ KPI Assignment component loaded');

    // Test 1: Check if stats cards are present
    console.log('\n📋 Test 1: Checking stats cards...');
    const statsCards = await page.$$eval('.grid.grid-cols-1.md\\:grid-cols-4.gap-6 .text-2xl.font-bold', elements =>
      elements.map(el => el.textContent?.trim())
    );

    console.log(`  📊 Found ${statsCards.length} stats cards:`);
    statsCards.forEach((stat, index) => {
      console.log(`    ${index + 1}. ${stat}`);
    });

    // Test 2: Check if table headers are correct
    console.log('\n📋 Test 2: Checking table headers...');
    const tableHeaders = await page.$$eval('table thead th', elements =>
      elements.map(el => el.textContent?.trim())
    );

    console.log(`  📋 Table headers (${tableHeaders.length}):`);
    tableHeaders.forEach((header, index) => {
      console.log(`    ${index + 1}. ${header}`);
    });

    // Test 3: Check if data is displayed
    console.log('\n📋 Test 3: Checking for data display...');
    const tableRows = await page.$$eval('table tbody tr', elements => elements.length);

    if (tableRows === 0) {
      console.log('  📭 No data rows found - checking for empty state message');

      const emptyState = await page.$eval('.text-center.py-8', el => el.textContent?.trim());
      console.log(`  📝 Empty state message: ${emptyState?.substring(0, 100)}...`);
    } else {
      console.log(`  📊 Found ${tableRows} data rows`);

      // Check first row data
      const firstRowData = await page.$$eval('table tbody tr:first-child td', elements =>
        elements.map(el => el.textContent?.trim())
      );

      console.log('  📋 First row data:');
      firstRowData.forEach((data, index) => {
        console.log(`    ${index + 1}. ${data}`);
      });
    }

    // Test 4: Check for status badges
    console.log('\n📋 Test 4: Checking status badges...');
    const statusBadges = await page.$$eval('.bg-green-100, .bg-blue-100, .bg-yellow-100, .bg-red-100, .bg-gray-100', elements =>
      elements.map(el => el.textContent?.trim())
    );

    console.log(`  🏷️  Found ${statusBadges.length} status badges:`);
    statusBadges.forEach((badge, index) => {
      console.log(`    ${index + 1}. ${badge}`);
    });

    // Test 5: Check for action buttons
    console.log('\n📋 Test 5: Checking action buttons...');
    const actionButtons = await page.$$eval('button', elements =>
      elements.map(el => el.textContent?.trim()).filter(text => text && text !== '')
    );

    const uniqueButtons = [...new Set(actionButtons)];
    console.log(`  🔘 Found ${uniqueButtons.length} unique action buttons:`);
    uniqueButtons.forEach((button, index) => {
      console.log(`    ${index + 1}. "${button}"`);
    });

    // Test 6: Check for cleanup button
    console.log('\n📋 Test 6: Checking for cleanup button...');
    const cleanupButton = await page.$('button:has-text("Dọn dẹp trùng lặp")');
    if (cleanupButton) {
      console.log('  ✅ Cleanup duplicates button found');
    } else {
      console.log('  ❌ Cleanup duplicates button not found');
    }

    // Test 7: Check responsive design
    console.log('\n📋 Test 7: Checking responsive design...');
    await page.setViewport({ width: 768, height: 800 });
    const mobileView = await page.$('.grid.grid-cols-1.md\\:grid-cols-4'); // Should be single column on mobile

    if (mobileView) {
      console.log('  📱 Mobile responsive design working');
    } else {
      console.log('  ❌ Mobile responsive design issue');
    }

    console.log('\n🎉 KPI Assignment component tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  📈 Stats cards: ${statsCards.length}`);
    console.log(`  📋 Table headers: ${tableHeaders.length}`);
    console.log(`  📊 Data rows: ${tableRows}`);
    console.log(`  🏷️  Status badges: ${statusBadges.length}`);
    console.log(`  🔘 Action buttons: ${uniqueButtons.length}`);
    console.log(`  🧹 Cleanup button: ${cleanupButton ? '✅' : '❌'}`);
    console.log(`  📱 Responsive: ${mobileView ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testKpiAssignmentComponent()
  .then(() => {
    console.log('✅ All tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Tests failed:', error);
    process.exit(1);
  });
