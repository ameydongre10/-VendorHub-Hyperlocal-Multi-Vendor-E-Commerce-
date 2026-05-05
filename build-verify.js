/**
 * build-verify.js
 *
 * Post-build verification script for VendorHub.
 * Checks that all critical files are present in the dist/ output directory.
 *
 * Usage:  node build-verify.js
 */

const fs   = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');

const REQUIRED_FILES = [
  'index.html',
  'assets/css/style.css',
  'assets/js/main.js',
  'assets/js/config/__env.js',
];

let allPassed = true;

console.log('🔍  Verifying build output in dist/ …\n');

if (!fs.existsSync(DIST_DIR)) {
  console.error('❌  dist/ directory does not exist. Run `npm run build` first.');
  process.exit(1);
}

for (const file of REQUIRED_FILES) {
  const fullPath = path.join(DIST_DIR, file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✓  ${file}`);
  } else {
    console.error(`  ✗  MISSING: ${file}`);
    allPassed = false;
  }
}

console.log('');

if (allPassed) {
  console.log('✅  All critical files verified successfully.');
} else {
  console.error('❌  Build verification failed — one or more required files are missing.');
  console.error('    Run `npm run build` and check the output above.');
  process.exit(1);
}
