#!/usr/bin/env node

/**
 * Build Verification Script
 * Checks if all critical files exist in dist/ after build
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');

console.log('🔍 VendorHub Build Verification\n');

const criticalFiles = [
  'index.html',
  'assets/css/style.css',
  'assets/js/main.js',
  'assets/js/config/__env.js',
];

let allExists = true;

console.log('Checking critical files:\n');
criticalFiles.forEach((file) => {
  const filePath = path.join(DIST_DIR, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file}`);
  if (!exists) {
    allExists = false;
  }
});

console.log('\n' + '─'.repeat(50));

if (allExists) {
  console.log('✅ All critical files verified!\n');
  process.exit(0);
} else {
  console.log('❌ Build verification FAILED\n');
  console.log('Please ensure:');
  console.log('1. vendorEcommerce/vendor-hub/ directory exists');
  console.log('2. index.html is present in vendor-hub/');
  console.log('3. assets/css/style.css and assets/js/main.js exist\n');
  process.exit(1);
}
