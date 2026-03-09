#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCREENSHOTS_DIR = path.join(ROOT, '.maestro', 'screenshots');
const BASELINES_DIR = path.join(ROOT, '.maestro', 'baselines');

console.log('Running Maestro to capture fresh screenshots...');
execSync('maestro test .maestro/screenshots.yaml', {
  stdio: 'inherit',
  cwd: ROOT,
});

fs.mkdirSync(BASELINES_DIR, { recursive: true });

const screenshots = fs.readdirSync(SCREENSHOTS_DIR).filter((f) => f.endsWith('.png'));

if (screenshots.length === 0) {
  console.error('No screenshots found in .maestro/screenshots/. Maestro may have failed.');
  process.exit(1);
}

for (const filename of screenshots) {
  const src = path.join(SCREENSHOTS_DIR, filename);
  const dest = path.join(BASELINES_DIR, filename);
  fs.copyFileSync(src, dest);
  console.log(`  Copied ${filename} to .maestro/baselines/`);
}

console.log(`\nBaselines updated (${screenshots.length} files).`);
console.log("Run `git add .maestro/baselines/ && git commit -m 'Update UI baselines'` to commit.");
