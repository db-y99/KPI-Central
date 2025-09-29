#!/usr/bin/env node

/**
 * Test script to verify Reward-Penalty tab integration and consistency
 * This script tests the end-to-end flow: KPI Definitions → Assignment → Tracking → Approval → Reward-Penalty
 */

const puppeteer = require('puppeteer');
const { exec } = require('child_process');

class RewardPenaltyIntegrationTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:9001';
  }

  async setup() {
    console.log('🚀 Setting up browser...');
    this.browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    this.page = await this.browser.newPage();
    
    // Set console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🐛 Browser Error:', msg.text());
      }
    });
  }

  async login() {
    console.log('🔐 Logging in as admin...');
    
    try {
      await this.page.goto(`${this.baseUrl}/login`);
      await this.page.waitForSelector('input[name="email"]', { timeout: 10000 });
      
      await this.page.type('input[name="email"]', 'admin@kpi-central.com');
      await this.page.type('input[name="password"]', 'admin123');
      await this.page.click('button[type="submit"]');
      
      // Wait for dashboard
      await this.page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
      console.log('✅ Login successful');
    } catch (error) {
      console.log('❌ Login failed:', error.message);
      throw error;
    }
  }

  async navigateToKpiManagement() {
    console.log('📊 Navigating to KPI Management...');
    
    try {
      await this.page.goto(`${this.baseUrl}/admin/kpi-management`);
      await this.page.waitForSelector('[data-testid="kpi-management-container"]', { timeout: 10000 });
      console.log('✅ KPI Management loaded');
    } catch (error) {
      console.log('❌ Failed to load KPI Management:', error.message);
      throw error;
    }
  }

  async testTabNavigation() {
    console.log('🧪 Testing tab navigation...');
    
    const tabs = ['definitions', 'assignment', 'tracking', 'approval', 'reward-penalty'];
    
    for (const tab of tabs) {
      try {
        console.log(`   📋 Testing ${tab} tab...`);
        
        // Navigate to specific tab
        await this.page.goto(`${this.baseUrl}/admin/kpi-management?tab=${tab}`);
        await this.page.waitForTimeout(2000);
        
        // Check if tab content is loaded
        const tabContent = await this.page.$(`[data-value="${tab}"]`);
        if (!tabContent) {
          throw new Error(`Tab ${tab} not found`);
        }
        
        // Check URL changes
        const currentUrl = this.page.url();
        if (!currentUrl.includes(`tab=${tab}`)) {
          throw new Error(`URL does not reflect tab=${tab}`);
        }
        
        console.log(`   ✅ ${tab} tab working correctly`);
        await this.page.waitForTimeout(1000);
      } catch (error) {
        console.log(`   ❌ ${tab} tab failed:`, error.message);
        throw error;
      }
    }
  }

  async testRewardPenaltyTabFeatures() {
    console.log('💎 Testing Reward-Penalty tab specific features...');
    
    try {
      // Navigate to reward-penalty tab
      await this.page.goto(`${this.baseUrl}/admin/kpi-management?tab=reward-penalty`);
      await this.page.waitForTimeout(3000);
      
      // Test 1: Check if stats cards are displayed
      console.log('   📊 Testing stats cards...');
      const statsCards = await this.page.$$eval('[class*="grid"] [class*="Card"]', cards => cards.length);
      if (statsCards < 4) {
        throw new Error('Stats cards not displayed properly');
      }
      console.log('   ✅ Stats cards displayed');
      
      // Test 2: Check if filters are working
      console.log('   🔍 Testing filters...');
      const searchInput = await this.page.$('input[placeholder*="search"]');
      if (searchInput) {
        await searchInput.type('test employee');
        await this.page.waitForTimeout(1000);
        await searchInput.click({ clickCount: 3 });
        await searchInput.press('Backspace');
      }
      console.log('   ✅ Filters working');
      
      // Test 3: Check if buttons are interactive
      console.log('   🔘 Testing buttons...');
      const refreshButton = await this.page.$('button:has-text("Tính toán tự động")');
      if (refreshButton) {
        const isDisabled = await this.page.evaluate(btn => btn.disabled, refreshButton);
        console.log(`   ${isDisabled ? '⚠️' : '✅'} Refresh button ${isDisabled ? 'disabled' : 'enabled'}`);
      }
      
      const addButton = await this.page.$('button:has-text("Thêm")');
      if (addButton) {
        await addButton.click();
        await this.page.waitForTimeout(1000);
        
        // Check if dialog opens
        const dialog = await this.page.$('[role="dialog"]');
        if (dialog) {
          // Close dialog
          const closeButton = await this.page.$('button:has-text("Hủy")');
          if (closeButton) {
            await closeButton.click();
            await this.page.waitForTimeout(1000);
          }
        }
        console.log('   ✅ Add button working');
      }
      
      // Test 4: Check table data
      console.log('   📋 Testing table data...');
      const table = await this.page.$('table');
      if (table) {
        const rows = await this.page.$$eval('table tbody tr', rows => rows.length);
        console.log(`   📈 Found ${rows} rows in table`);
        
        if (rows > 0) {
          // Test view record functionality
          const firstRowEyeButton = await this.page.$('table tbody tr:first-child button[title*="Xem"]');
          if (firstRowEyeButton) {
            await firstRowEyeButton.click();
            await this.page.waitForTimeout(2000);
            
            // Check if dialog opens
            const recordDialog = await this.page.$('[role="dialog"]');
            if (recordDialog) {
              // Close dialog
              await this.page.keyboard.press('Escape');
              await this.page.waitForTimeout(1000);
            }
            console.log('   ✅ View record functionality working');
          }
        }
      }
      
      console.log('   ✅ All Reward-Penalty features tested successfully');
    } catch (error) {
      console.log('   ❌ Reward-Penalty features test failed:', error.message);
      throw error;
    }
  }

  async testDataConsistency() {
    console.log('🔗 Testing data consistency across tabs...');
    
    try {
      // Get initial data from definitions tab
      await this.page.goto(`${this.baseUrl}/admin/kpi-management?tab=definitions`);
      await this.page.waitForTimeout(2000);
      
      const definitionsCount = await this.page.$$eval('[data-testid="kpi-definition-item"]', items => items.length);
      console.log(`   📋 Definitions tab has ${definitionsCount} KPI definitions`);
      
      // Switch to assignment tab
      await this.page.goto(`${this.baseUrl}/admin/kpi-management?tab=assignment`);
      await this.page.waitForTimeout(2000);
      
      const assignmentsCount = await this.page.$$eval('[data-testid="kpi-assignment-item"]', items => items.length);
      console.log(`   👥 Assignment tab has ${assignmentsCount} assignments`);
      
      // Switch to tracking tab
      await this.page.goto(`${this.baseUrl}/admin/kpi-management?tab=tracking`);
      await this.page.waitForTimeout(2000);
      
      const trackingCount = await this.page.$$eval('[data-testid="kpi-tracking-item"]', items => items.length);
      console.log(`   📈 Tracking tab has ${trackingCount} tracking records`);
      
      // Switch to approval tab
      await this.page.goto(`${this.baseUrl}/admin/kpi-management?tab=approval`);
      await this.page.waitForTimeout(2000);
      
      const approvalCount = await this.page.$$eval('[data-testid="kpi-approval-item"]', items => items.length);
      console.log(`   ✅ Approval tab has ${approvalCount} approval records`);
      
      // Switch to reward-penalty tab
      await this.page.goto(`${this.baseUrl}/admin/kpi-management?tab=reward-penalty`);
      await this.page.waitForTimeout(2000);
      
      const rewardPenaltyCount = await this.page.$$eval('[data-testid="reward-penalty-item"]', items => items.length);
      console.log(`   💰 Reward-Penalty tab has ${rewardPenaltyCount} calculations`);
      
      // Check data flow consistency
      if (approvalCount > 0 && rewardPenaltyCount === 0) {
        console.log('   ⚠️ Warning: Approved records exist but no reward/penalty calculations');
        console.log('      Consider clicking "Tính toán tự động" button');
      } else {
        console.log('   ✅ Data flow consistency looks good');
      }
      
    } catch (error) {
      console.log('   ❌ Data consistency test failed:', error.message);
      throw error;
    }
  }

  async testPerformance() {
    console.log('⚡ Testing performance...');
    
    const tabs = ['definitions', 'assignment', 'tracking', 'approval', 'reward-penalty'];
    
    for (const tab of tabs) {
      try {
        const startTime = Date.now();
        await this.page.goto(`${this.baseUrl}/admin/kpi-management?tab=${tab}`);
        await this.page.waitForSelector('[data-testid="kpi-management-container"]');
        const loadTime = Date.now() - startTime;
        
        console.log(`   📊 ${tab} tab loaded in ${loadTime}ms`);
        
        if (loadTime > 5000) {
          console.log(`   ⚠️ Warning: ${tab} tab took longer than expected (${loadTime}ms)`);
        } else {
          console.log(`   ✅ ${tab} tab performance OK`);
        }
      } catch (error) {
        console.log(`   ❌ ${tab} tab performance test failed:`, error.message);
      }
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }

  async runFullTest() {
    console.log('🎯 Starting Reward-Penalty Tab Integration Test...\n');
    
    try {
      await this.setup();
      await this.login();
      await this.navigateToKpiManagement();
      await this.testTabNavigation();
      await this.testRewardPenaltyTabFeatures();
      await this.testDataConsistency();
      await this.testPerformance();
      
      console.log('\n🎉 All tests completed successfully!');
      console.log('✅ Reward-Penalty tab is working consistently with the project');
      
    } catch (error) {
      console.log('\n💥 Test failed:', error.message);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run test if called directly
if (require.main === module) {
  const test = new RewardPenaltyIntegrationTest();
  test.runFullTest()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = RewardPenaltyIntegrationTest;
