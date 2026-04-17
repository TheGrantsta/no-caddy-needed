#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const ROOT = path.join(__dirname, '..');
const BASELINES_DIR = path.join(ROOT, '.maestro', 'baselines');
const CURRENT_DIR = path.join(ROOT, '.maestro', 'screenshots');
const DIFF_DIR = path.join(ROOT, '.maestro', 'diff-output');
const DEFAULT_THRESHOLD = 0.5; // percent of total pixels

function isSimulatorBooted() {
  try {
    const result = execSync('xcrun simctl list | grep Booted', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

function getBootedSimulatorUdid() {
  try {
    const result = execSync('xcrun simctl list | grep Booted', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const match = result.match(/\(([0-9A-F-]{36})\)\s*\(Booted\)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function isEmulatorRunning() {
  try {
    const result = execSync('adb devices', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return result.split('\n').some(line => line.startsWith('emulator-') && line.includes('device'));
  } catch {
    return false;
  }
}

/**
 * Diffs two PNG files pixel-by-pixel.
 * Returns { numDiffPixels, diffPercent }.
 * Writes diff image to diffOutputPath if diffPercent > thresholdPercent.
 */
function diffImages(baselinePath, currentPath, diffOutputPath, thresholdPercent) {
  const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
  const current = PNG.sync.read(fs.readFileSync(currentPath));
  const { width, height } = baseline;
  const diffPng = new PNG({ width, height });

  const numDiffPixels = pixelmatch(
    baseline.data,
    current.data,
    diffPng.data,
    width,
    height,
    { threshold: 0.1 }
  );

  const diffPercent = (numDiffPixels / (width * height)) * 100;

  if (diffPercent > thresholdPercent) {
    fs.mkdirSync(path.dirname(diffOutputPath), { recursive: true });
    fs.writeFileSync(diffOutputPath, PNG.sync.write(diffPng));
  }

  return { numDiffPixels, diffPercent };
}

function main() {
  if (process.env.SKIP_UI_CHECK === '1') {
    console.log('SKIP_UI_CHECK=1 set, skipping UI visual regression check.');
    return 0;
  }

  // Visual regression requires an iOS simulator — Android emulator cold-starts
  // are too slow (100+ s) for a pre-push hook, and baselines are iOS captures.
  const simulatorUdid = getBootedSimulatorUdid();
  if (!simulatorUdid) {
    if (isEmulatorRunning()) {
      console.warn('Warning: Only Android emulator running (no iOS simulator). Skipping UI visual regression check (iOS simulator required).');
    } else {
      console.warn('Warning: No iOS simulator booted. Skipping UI visual regression check.');
    }
    return 0;
  }

  const threshold = parseFloat(process.env.UI_DIFF_THRESHOLD || String(DEFAULT_THRESHOLD));

  console.log('Running Maestro to capture current screenshots...');
  try {
    execSync(`maestro --device ${simulatorUdid} test .maestro/screenshots.yaml`, {
      stdio: 'inherit',
      cwd: ROOT,
    });
  } catch (err) {
    console.error('Maestro failed to capture screenshots:', err.message);
    return 1;
  }

  const baselines = fs.readdirSync(BASELINES_DIR).filter((f) => f.endsWith('.png'));

  if (baselines.length === 0) {
    console.warn('No baseline images found in .maestro/baselines/. Run `npm run ui:update` first.');
    return 0;
  }

  const failures = [];

  for (const filename of baselines) {
    const baselinePath = path.join(BASELINES_DIR, filename);
    const currentPath = path.join(CURRENT_DIR, filename);
    const diffOutputPath = path.join(DIFF_DIR, filename);

    if (!fs.existsSync(currentPath)) {
      console.warn(`  Skipping ${filename}: no current screenshot found.`);
      continue;
    }

    try {
      const { diffPercent } = diffImages(baselinePath, currentPath, diffOutputPath, threshold);
      if (diffPercent > threshold) {
        failures.push({ filename, diffPercent });
        console.error(`  FAIL ${filename}: ${diffPercent.toFixed(2)}% pixels differ (threshold: ${threshold}%)`);
      } else {
        console.log(`  PASS ${filename}: ${diffPercent.toFixed(2)}% pixels differ`);
      }
    } catch (err) {
      console.error(`  ERROR diffing ${filename}: ${err.message}`);
      failures.push({ filename, diffPercent: 100 });
    }
  }

  if (failures.length > 0) {
    console.error(`\nUI visual regression: ${failures.length} screenshot(s) exceeded threshold.`);
    console.error(`Diff images written to .maestro/diff-output/`);
    console.error(`To approve changes, run: npm run ui:update`);
    return 1;
  }

  console.log(`\nUI visual regression: all ${baselines.length} screenshots passed.`);
  return 0;
}

module.exports = { isSimulatorBooted, isEmulatorRunning, getBootedSimulatorUdid, diffImages, main };

if (require.main === module) {
  process.exit(main());
}
