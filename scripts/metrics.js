#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

/**
 * Count non-blank lines in a string.
 */
function countLines(content) {
  if (!content) return 0;
  return content.split('\n').filter((line) => line.trim().length > 0).length;
}

/**
 * Categorize a file path. Returns category label or null if not tracked.
 */
function categorizeFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/');

  // Test files — check before source so test files in __tests__/ are correctly categorized
  if (normalized.includes('__tests__/') && /-test\.|\.test\./.test(normalized)) {
    return 'test';
  }

  // App screens (tsx, not layout)
  if (/^app\//.test(normalized) && normalized.endsWith('.tsx') && !normalized.includes('_layout')) {
    return 'screen';
  }

  // Components
  if (/^components\//.test(normalized) && normalized.endsWith('.tsx')) {
    return 'component';
  }

  // Services
  if (/^service\//.test(normalized) && /\.(ts|tsx)$/.test(normalized)) {
    return 'service';
  }

  // Hooks
  if (/^hooks\//.test(normalized) && /\.(ts|tsx)$/.test(normalized)) {
    return 'hook';
  }

  // Exclude layout files from source tracking
  if (normalized.includes('_layout')) {
    return null;
  }

  // Source (any .ts/.tsx in tracked source directories)
  const sourceDirs = ['app/', 'components/', 'service/', 'database/', 'hooks/', 'context/'];
  if (sourceDirs.some((dir) => normalized.startsWith(dir)) && /\.(ts|tsx)$/.test(normalized)) {
    return 'source';
  }

  return null;
}

/**
 * Parse dependency counts from a package.json object.
 */
function parseDependencyCounts(pkg) {
  const production = Object.keys(pkg.dependencies || {}).length;
  const dev = Object.keys(pkg.devDependencies || {}).length;
  return { production, dev };
}

/**
 * Count CREATE TABLE statements in a string.
 */
function countTableDefinitions(content) {
  if (!content) return 0;
  const matches = content.match(/CREATE TABLE/gi);
  return matches ? matches.length : 0;
}

/**
 * Format bytes into a human-readable string.
 */
function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} bytes`;
}

/**
 * Build a formatted report string from a metrics object.
 */
function buildReport(m) {
  const pad = (label, value, width = 20) => {
    const paddedLabel = label.padEnd(width);
    return `  ${paddedLabel}${value}`;
  };

  const fmt = (n) => n.toLocaleString('en-US');

  const lines = [
    '╔══════════════════════════════════════╗',
    '║      No Caddy Needed — Metrics       ║',
    '╚══════════════════════════════════════╝',
    '',
    'Lines of Code',
    pad('Source', `~${fmt(m.sourceLoc)} lines`),
    pad('Tests', `~${fmt(m.testLoc)} lines`),
    pad('Total', `~${fmt(m.totalLoc)} lines`),
    '',
    'Files',
    pad('Screens', m.screens),
    pad('Components', m.components),
    pad('Services', m.services),
    pad('Hooks', m.hooks),
    pad('Test files', m.testFiles),
    '',
    'Database',
    pad('Tables', m.tables),
    '',
    'Dependencies',
    pad('Production', m.productionDeps),
    pad('Dev', m.devDeps),
    pad('Total', m.totalDeps),
    '',
    'Project Size',
    pad('Source tree', `~${formatBytes(m.diskBytes)}`),
  ];

  return lines.join('\n');
}

/**
 * Recursively walk a directory, calling callback for each file.
 */
function walkDir(dir, rootDir, callback) {
  const SKIP = new Set(['node_modules', 'ios', 'android', 'coverage', '.expo', '.git', 'scripts']);
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP.has(entry)) continue;
    const fullPath = path.join(dir, entry);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      walkDir(fullPath, rootDir, callback);
    } else {
      const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
      callback(relativePath, fullPath);
    }
  }
}

/**
 * Collect all metrics by walking the filesystem.
 */
function collectMetrics(rootDir) {
  const counts = {
    sourceLoc: 0,
    testLoc: 0,
    screens: 0,
    components: 0,
    services: 0,
    hooks: 0,
    testFiles: 0,
  };

  const sourceCategories = new Set(['source', 'screen', 'component', 'service', 'hook']);

  walkDir(rootDir, rootDir, (relativePath, fullPath) => {
    const category = categorizeFile(relativePath);
    if (!category) return;

    let content = '';
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch {
      return;
    }

    const lines = countLines(content);

    if (sourceCategories.has(category)) {
      counts.sourceLoc += lines;
    }
    if (category === 'test') {
      counts.testLoc += lines;
      counts.testFiles += 1;
    }
    if (category === 'screen') counts.screens += 1;
    if (category === 'component') counts.components += 1;
    if (category === 'service') counts.services += 1;
    if (category === 'hook') counts.hooks += 1;
  });

  // Database table count
  let tables = 0;
  try {
    const dbContent = fs.readFileSync(path.join(rootDir, 'database', 'db.tsx'), 'utf8');
    tables = countTableDefinitions(dbContent);
  } catch {
    tables = 0;
  }

  // Dependency counts
  let productionDeps = 0;
  let devDeps = 0;
  try {
    const pkgContent = fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    const depCounts = parseDependencyCounts(pkg);
    productionDeps = depCounts.production;
    devDeps = depCounts.dev;
  } catch {
    productionDeps = 0;
    devDeps = 0;
  }

  // Disk usage — walk directory with the same skip list to avoid node_modules etc.
  let diskBytes = 0;
  walkDir(rootDir, rootDir, (_relativePath, fullPath) => {
    try {
      diskBytes += fs.statSync(fullPath).size;
    } catch {
      // ignore unreadable files
    }
  });

  const totalLoc = counts.sourceLoc + counts.testLoc;
  const totalDeps = productionDeps + devDeps;

  return {
    sourceLoc: counts.sourceLoc,
    testLoc: counts.testLoc,
    totalLoc,
    screens: counts.screens,
    components: counts.components,
    services: counts.services,
    hooks: counts.hooks,
    testFiles: counts.testFiles,
    tables,
    productionDeps,
    devDeps,
    totalDeps,
    diskBytes,
  };
}

/**
 * Entry point — collect metrics and print the report.
 */
function main() {
  const m = collectMetrics(ROOT);
  console.log(buildReport(m));
}

module.exports = {
  countLines,
  categorizeFile,
  parseDependencyCounts,
  countTableDefinitions,
  formatBytes,
  buildReport,
  collectMetrics,
  main,
};

if (require.main === module) {
  main();
}
