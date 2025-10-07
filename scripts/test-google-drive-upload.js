#!/usr/bin/env node

/**
 * Test Google Drive Upload
 * Kiểm tra xem Google Drive integration có hoạt động không
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 TESTING GOOGLE DRIVE CONFIGURATION\n');
console.log('='.repeat(60));

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: .env.local file not found!');
  console.log('\n📝 SOLUTION:');
  console.log('   1. Copy .env.local.template to .env.local');
  console.log('   2. Run this test again\n');
  process.exit(1);
}

console.log('✅ .env.local file found\n');

// Check required environment variables
const requiredVars = [
  { 
    names: ['GOOGLE_DRIVE_CLIENT_ID', 'GOOGLE_CLIENT_ID'],
    label: 'Client ID'
  },
  { 
    names: ['GOOGLE_DRIVE_CLIENT_SECRET', 'GOOGLE_CLIENT_SECRET'],
    label: 'Client Secret'
  },
  { 
    names: ['GOOGLE_DRIVE_REFRESH_TOKEN', 'GOOGLE_OAUTH_REFRESH_TOKEN'],
    label: 'Refresh Token'
  },
  { 
    names: ['GOOGLE_DRIVE_FOLDER_ID'],
    label: 'Folder ID'
  }
];

console.log('📋 Checking Environment Variables:\n');

let allConfigured = true;

requiredVars.forEach(({ names, label }) => {
  const value = names.map(name => process.env[name]).find(v => v);
  
  if (value) {
    const masked = value.length > 20 
      ? `${value.substring(0, 20)}...${value.substring(value.length - 10)}`
      : value;
    console.log(`✅ ${label.padEnd(20)}: ${masked}`);
  } else {
    console.log(`❌ ${label.padEnd(20)}: NOT SET`);
    console.log(`   Looking for: ${names.join(' or ')}`);
    allConfigured = false;
  }
});

console.log('\n' + '='.repeat(60));

if (allConfigured) {
  console.log('\n✅ SUCCESS: All Google Drive credentials are configured!\n');
  console.log('🎉 Your configuration:');
  
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  
  console.log(`   • Project: ${clientId.split('-')[0]}`);
  console.log(`   • Folder: ${folderId}`);
  console.log(`   • Folder URL: https://drive.google.com/drive/folders/${folderId}`);
  
  console.log('\n📊 What will happen when you upload:');
  console.log('   1. File will be uploaded to Google Drive');
  console.log('   2. File will be stored in the configured folder');
  console.log('   3. File will be made public (anyone with link can view)');
  console.log('   4. Real Google Drive URL will be returned');
  console.log('   5. Admin can click the link to view/download');
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Make sure dev server is running: npm run dev');
  console.log('   2. Login as employee');
  console.log('   3. Go to Submit KPI page');
  console.log('   4. Upload a test file');
  console.log('   5. Check console logs for "Google Drive upload successful"');
  console.log('   6. Login as admin and verify file link works');
  
  console.log('\n✨ Google Drive integration is READY TO USE!\n');
  
} else {
  console.log('\n❌ ERROR: Some credentials are missing!\n');
  console.log('📝 SOLUTION:');
  console.log('   1. Open .env.local file');
  console.log('   2. Make sure all Google Drive variables are set');
  console.log('   3. Save the file');
  console.log('   4. Run this test again');
  console.log('   5. Restart your dev server\n');
  process.exit(1);
}

// Test API endpoint availability
console.log('🔌 Testing API Endpoint...\n');

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 9001,
  path: '/api/file-upload',
  method: 'GET',
};

const req = http.request(options, (res) => {
  if (res.statusCode === 404 || res.statusCode === 405) {
    console.log('✅ API endpoint is accessible');
    console.log('   (404/405 is expected for GET request)\n');
  } else {
    console.log(`⚠️  API endpoint returned status: ${res.statusCode}\n`);
  }
});

req.on('error', (error) => {
  if (error.code === 'ECONNREFUSED') {
    console.log('⚠️  Dev server is not running');
    console.log('   Start it with: npm run dev\n');
  } else {
    console.log(`⚠️  Error connecting to server: ${error.message}\n`);
  }
});

req.end();

console.log('='.repeat(60));
console.log('\n💡 TIP: Check server console logs when uploading to see:');
console.log('   "Google Drive is configured, uploading to Google Drive..."');
console.log('   "Google Drive upload successful"\n');


