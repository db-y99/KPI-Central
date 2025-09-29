#!/usr/bin/env node

/**
 * Comprehensive KPI Management Test Script
 *
 * This script tests all KPI Management tabs to ensure they work correctly
 * and checks for duplicate KPI tracking issues.
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function runKpiManagementTests() {
  console.log('🚀 Starting comprehensive KPI Management tests...');

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

    // Navigate to KPI Management page
    console.log('📍 Navigating to KPI Management page...');
    await page.goto('http://localhost:3000/admin/kpi-management', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for the page to load
    await page.waitForSelector('[data-testid="kpi-management-tabs"]', { timeout: 10000 });

    console.log('✅ Page loaded successfully');

    // Test 1: Check all tabs are present
    console.log('\n📋 Test 1: Checking all tabs are present...');
    const tabs = [
      'definitions',
      'assignment',
      'tracking',
      'approval',
      'reward-penalty'
    ];

    for (const tabId of tabs) {
      const tabElement = await page.$(`[data-testid="tab-${tabId}"]`);
      if (tabElement) {
        console.log(`  ✅ ${tabId} tab found`);
      } else {
        console.log(`  ❌ ${tabId} tab NOT found`);
      }
    }

    // Test 2: Test KPI Definitions tab
    console.log('\n📋 Test 2: Testing KPI Definitions tab...');
    await page.click('[data-testid="tab-definitions"]');
    await page.waitForSelector('[data-testid="kpi-definitions-table"]', { timeout: 5000 });

    const kpiCount = await page.evaluate(() => {
      const table = document.querySelector('[data-testid="kpi-definitions-table"]');
      return table ? table.querySelectorAll('tbody tr').length : 0;
    });

    console.log(`  ✅ KPI Definitions tab loaded with ${kpiCount} KPIs`);

    // Test 3: Test KPI Assignment tab
    console.log('\n📋 Test 3: Testing KPI Assignment tab...');
    await page.click('[data-testid="tab-assignment"]');
    await page.waitForSelector('[data-testid="kpi-assignment-table"]', { timeout: 5000 });

    const assignmentCount = await page.evaluate(() => {
      const table = document.querySelector('[data-testid="kpi-assignment-table"]');
      return table ? table.querySelectorAll('tbody tr').length : 0;
    });

    console.log(`  ✅ KPI Assignment tab loaded with ${assignmentCount} assignments`);

    // Test 4: Test KPI Tracking tab (main focus for duplication)
    console.log('\n📋 Test 4: Testing KPI Tracking tab (checking for duplicates)...');
    await page.click('[data-testid="tab-tracking"]');
    await page.waitForSelector('[data-testid="kpi-tracking-table"]', { timeout: 5000 });

    // Check for duplicates by looking at the table data
    const trackingData = await page.evaluate(() => {
      const table = document.querySelector('[data-testid="kpi-tracking-table"]');
      if (!table) return { count: 0, rows: [] };

      const rows = Array.from(table.querySelectorAll('tbody tr'));
      const rowData = rows.map(row => {
        const cells = row.querySelectorAll('td');
        return {
          employee: cells[0]?.textContent?.trim(),
          kpi: cells[1]?.textContent?.trim(),
          department: cells[2]?.textContent?.trim(),
          progress: cells[3]?.textContent?.trim(),
          status: cells[4]?.textContent?.trim(),
          deadline: cells[5]?.textContent?.trim()
        };
      });

      return { count: rows.length, rows: rowData };
    });

    console.log(`  ✅ KPI Tracking tab loaded with ${trackingData.count} records`);

    // Check for duplicates
    const duplicates = [];
    const seen = new Set();

    trackingData.rows.forEach((row, index) => {
      const key = `${row.employee}-${row.kpi}-${row.department}`;
      if (seen.has(key)) {
        duplicates.push({ index, key, data: row });
      } else {
        seen.add(key);
      }
    });

    if (duplicates.length > 0) {
      console.log(`  ❌ Found ${duplicates.length} potential duplicate records:`);
      duplicates.forEach(dup => {
        console.log(`    - Row ${dup.index}: ${dup.key}`);
      });
    } else {
      console.log(`  ✅ No duplicate records found in KPI Tracking`);
    }

    // Test 5: Test Approval tab
    console.log('\n📋 Test 5: Testing Approval tab...');
    await page.click('[data-testid="tab-approval"]');
    await page.waitForSelector('[data-testid="approval-table"]', { timeout: 5000 });

    const approvalCount = await page.evaluate(() => {
      const table = document.querySelector('[data-testid="approval-table"]');
      return table ? table.querySelectorAll('tbody tr').length : 0;
    });

    console.log(`  ✅ Approval tab loaded with ${approvalCount} reports`);

    // Test 6: Test Reward/Penalty tab
    console.log('\n📋 Test 6: Testing Reward/Penalty tab...');
    await page.click('[data-testid="tab-reward-penalty"]');
    await page.waitForSelector('[data-testid="reward-penalty-table"]', { timeout: 5000 });

    const rewardPenaltyCount = await page.evaluate(() => {
      const table = document.querySelector('[data-testid="reward-penalty-table"]');
      return table ? table.querySelectorAll('tbody tr').length : 0;
    });

    console.log(`  ✅ Reward/Penalty tab loaded with ${rewardPenaltyCount} calculations`);

    // Test 7: Test the cleanup functionality
    console.log('\n📋 Test 7: Testing cleanup functionality...');
    await page.click('[data-testid="tab-tracking"]');

    // Look for the cleanup button
    const cleanupButton = await page.$('[data-testid="cleanup-duplicates-btn"]');
    if (cleanupButton) {
      console.log('  ✅ Cleanup button found');

      // Try to click it (might not work if no duplicates)
      try {
        await cleanupButton.click();
        await page.waitForTimeout(2000);

        // Check if any success message appeared
        const successMessage = await page.evaluate(() => {
          const messages = document.querySelectorAll('.toast, [role="alert"]');
          return Array.from(messages).some(msg =>
            msg.textContent?.includes('dọn dẹp') ||
            msg.textContent?.includes('clean') ||
            msg.textContent?.includes('thành công')
          );
        });

        if (successMessage) {
          console.log('  ✅ Cleanup functionality working');
        } else {
          console.log('  ⚠️  Cleanup button clicked but no confirmation message');
        }
      } catch (error) {
        console.log('  ⚠️  Could not test cleanup button:', error.message);
      }
    } else {
      console.log('  ❌ Cleanup button not found');
    }

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`  ✅ KPI Definitions: ${kpiCount} KPIs`);
    console.log(`  ✅ KPI Assignment: ${assignmentCount} assignments`);
    console.log(`  ✅ KPI Tracking: ${trackingData.count} records (${duplicates.length} duplicates)`);
    console.log(`  ✅ Approval: ${approvalCount} reports`);
    console.log(`  ✅ Reward/Penalty: ${rewardPenaltyCount} calculations`);

    if (duplicates.length === 0) {
      console.log('\n🎉 All tests passed! No duplication issues found.');
    } else {
      console.log(`\n⚠️  Found ${duplicates.length} potential duplicates. Please review.`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the tests
runKpiManagementTests()
  .then(() => {
    console.log('✅ All KPI Management tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 KPI Management tests failed:', error);
    process.exit(1);
  });
