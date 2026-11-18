/**
 * test-project.js
 * Comprehensive automated verification script for VendorHub.
 * Checks:
 * 1. Syntax validity of all JS files.
 * 2. Static import path resolutions across all JS files and HTML pages.
 * 3. Builds the dist directory using vercel-build.js.
 * 4. Verifies all assets and pages in dist/.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Starting VendorHub Verification Suite...\n');

let errors = 0;
let passed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ ${message}`);
        passed++;
    } else {
        console.error(`  ❌ FAILED: ${message}`);
        errors++;
    }
}

const ROOT = __dirname;
const SRC = path.join(ROOT, 'vendorEcommerce', 'vendor-hub');

// 1. Check all JS files syntax
console.log('--- 1. Testing JavaScript Files Syntax ---');
function getAllFiles(dir, exts, list = []) {
    if (!fs.existsSync(dir)) return list;
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, f.name);
        if (f.isDirectory()) {
            getAllFiles(full, exts, list);
        } else if (exts.some(ext => f.name.endsWith(ext))) {
            list.push(full);
        }
    }
    return list;
}

const jsFiles = getAllFiles(SRC, ['.js']);
for (const file of jsFiles) {
    const rel = path.relative(ROOT, file);
    try {
        // Node's --check flag validates syntax without running
        execSync(`node --check "${file}"`);
        assert(true, `Syntax check passed for ${rel}`);
    } catch (e) {
        assert(false, `Syntax error in ${rel}: ${e.message}`);
    }
}

// 2. Check all Relative Imports in JS and HTML
console.log('\n--- 2. Validating Relative Imports & Module Resolutions ---');
const allHtmlAndJs = getAllFiles(SRC, ['.js', '.html']);

for (const file of allHtmlAndJs) {
    const content = fs.readFileSync(file, 'utf8');
    const relFile = path.relative(ROOT, file);
    const fileDir = path.dirname(file);

    // Match import ... from "..."
    const importRegex = /import\s+[\s\S]*?from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('http://') || importPath.startsWith('https://')) {
            // External CDN import (Firebase, etc.)
            continue;
        }

        const resolved = path.resolve(fileDir, importPath);
        const exists = fs.existsSync(resolved);
        assert(exists, `${relFile} imports "${importPath}" -> ${exists ? 'RESOLVED' : 'MISSING (' + resolved + ')'}`);
    }

    // Match <script ... src="..."> and <link ... href="..."> in HTML
    if (file.endsWith('.html')) {
        const scriptSrcRegex = /<script\s+[^>]*src=['"]([^'"]+)['"]/g;
        while ((match = scriptSrcRegex.exec(content)) !== null) {
            const src = match[1];
            if (src.startsWith('http://') || src.startsWith('https://')) continue;
            const resolved = path.resolve(fileDir, src);
            assert(fs.existsSync(resolved), `${relFile} script src "${src}" exists`);
        }

        const linkHrefRegex = /<link\s+[^>]*href=['"]([^'"]+)['"]/g;
        while ((match = linkHrefRegex.exec(content)) !== null) {
            const href = match[1];
            if (href.startsWith('http://') || href.startsWith('https://')) continue;
            const resolved = path.resolve(fileDir, href);
            assert(fs.existsSync(resolved), `${relFile} stylesheet href "${href}" exists`);
        }
    }
}

// 3. Test vercel-build.js
console.log('\n--- 3. Testing Vercel Build Script ---');
try {
    const buildOutput = execSync(`node vercel-build.js`, { cwd: ROOT }).toString();
    assert(buildOutput.includes('Build complete'), 'vercel-build.js runs to completion');
    
    const distIndex = path.join(ROOT, 'dist', 'index.html');
    const distEnv = path.join(ROOT, 'dist', 'assets', 'js', 'config', '__env.js');
    const distShop = path.join(ROOT, 'dist', 'pages', 'buyer', 'shop.html');

    assert(fs.existsSync(distIndex), 'dist/index.html generated');
    assert(fs.existsSync(distEnv), 'dist/assets/js/config/__env.js generated');
    assert(fs.existsSync(distShop), 'dist/pages/buyer/shop.html generated');
} catch (e) {
    assert(false, `vercel-build.js failed: ${e.message}`);
}

console.log(`\n========================================`);
console.log(`Test Results: ${passed} Passed, ${errors} Failed`);
console.log(`========================================\n`);

if (errors > 0) {
    process.exit(1);
} else {
    console.log('🎉 ALL CHECKS PASSED PERFECTLY!\n');
    process.exit(0);
}
