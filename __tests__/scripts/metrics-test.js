/**
 * @jest-environment node
 */
'use strict';

// --- Mocks (must be declared before requires) ---

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
  existsSync: jest.fn(),
}));

// --- Requires (after mocks) ---

const { execSync } = require('child_process');
const fs = require('fs');

// --- Load module under test ---

let metrics;
beforeAll(() => {
  metrics = require('../../scripts/metrics');
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// --- countLines ---

describe('countLines', () => {
  it('returns 0 for empty string', () => {
    expect(metrics.countLines('')).toBe(0);
  });

  it('returns 1 for a single non-blank line', () => {
    expect(metrics.countLines('const x = 1;')).toBe(1);
  });

  it('ignores blank lines', () => {
    expect(metrics.countLines('line one\n\nline two\n\n')).toBe(2);
  });

  it('returns correct count for multi-line content', () => {
    const content = 'import React from "react";\nconst x = 1;\n// comment\n\nexport default x;';
    expect(metrics.countLines(content)).toBe(4);
  });
});

// --- categorizeFile ---

describe('categorizeFile', () => {
  it('returns "screen" for a tsx file in app/', () => {
    expect(metrics.categorizeFile('app/home.tsx')).toBe('screen');
  });

  it('returns null for a layout file in app/', () => {
    expect(metrics.categorizeFile('app/_layout.tsx')).toBeNull();
  });

  it('returns null for a layout file in a nested app/ subdirectory', () => {
    expect(metrics.categorizeFile('app/(tabs)/_layout.tsx')).toBeNull();
  });

  it('returns "component" for a tsx file in components/', () => {
    expect(metrics.categorizeFile('components/SubMenu.tsx')).toBe('component');
  });

  it('returns "service" for a ts file in service/', () => {
    expect(metrics.categorizeFile('service/DbService.ts')).toBe('service');
  });

  it('returns "service" for a tsx file in service/', () => {
    expect(metrics.categorizeFile('service/DbService.tsx')).toBe('service');
  });

  it('returns "hook" for a ts file in hooks/', () => {
    expect(metrics.categorizeFile('hooks/useTheme.ts')).toBe('hook');
  });

  it('returns "test" for a file matching *-test.* in __tests__/', () => {
    expect(metrics.categorizeFile('__tests__/service/DbService-test.tsx')).toBe('test');
  });

  it('returns "test" for a file matching *.test.* in __tests__/', () => {
    expect(metrics.categorizeFile('__tests__/service/DbService.test.ts')).toBe('test');
  });

  it('returns null for an unrelated path', () => {
    expect(metrics.categorizeFile('node_modules/react/index.js')).toBeNull();
  });

  it('returns null for a non-tsx file in app/', () => {
    expect(metrics.categorizeFile('app/something.js')).toBeNull();
  });

  it('returns "source" for a tsx file in database/', () => {
    expect(metrics.categorizeFile('database/db.tsx')).toBe('source');
  });

  it('returns "source" for a tsx file in context/', () => {
    expect(metrics.categorizeFile('context/ThemeContext.tsx')).toBe('source');
  });
});

// --- parseDependencyCounts ---

describe('parseDependencyCounts', () => {
  it('returns correct production and dev counts', () => {
    const pkg = {
      dependencies: { react: '^18.0.0', expo: '~49.0.0', lodash: '^4.0.0' },
      devDependencies: { jest: '^29.0.0', typescript: '^5.0.0' },
    };
    expect(metrics.parseDependencyCounts(pkg)).toEqual({ production: 3, dev: 2 });
  });

  it('returns 0 for missing keys', () => {
    expect(metrics.parseDependencyCounts({})).toEqual({ production: 0, dev: 0 });
  });

  it('handles missing devDependencies', () => {
    const pkg = { dependencies: { react: '^18.0.0' } };
    expect(metrics.parseDependencyCounts(pkg)).toEqual({ production: 1, dev: 0 });
  });

  it('handles missing dependencies', () => {
    const pkg = { devDependencies: { jest: '^29.0.0' } };
    expect(metrics.parseDependencyCounts(pkg)).toEqual({ production: 0, dev: 1 });
  });
});

// --- countTableDefinitions ---

describe('countTableDefinitions', () => {
  it('returns 0 for empty string', () => {
    expect(metrics.countTableDefinitions('')).toBe(0);
  });

  it('returns correct count for multiple CREATE TABLE statements', () => {
    const content = `
      CREATE TABLE IF NOT EXISTS WedgeChart (id INTEGER PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS Drills (id INTEGER PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS Rounds (id INTEGER PRIMARY KEY);
    `;
    expect(metrics.countTableDefinitions(content)).toBe(3);
  });

  it('returns 0 when no CREATE TABLE present', () => {
    expect(metrics.countTableDefinitions('SELECT * FROM WedgeChart;')).toBe(0);
  });
});

// --- formatBytes ---

describe('formatBytes', () => {
  it('formats bytes less than 1024 as "N bytes"', () => {
    expect(metrics.formatBytes(512)).toBe('512 bytes');
  });

  it('formats exactly 1024 as "1.0 KB"', () => {
    expect(metrics.formatBytes(1024)).toBe('1.0 KB');
  });

  it('formats exactly 1048576 as "1.0 MB"', () => {
    expect(metrics.formatBytes(1048576)).toBe('1.0 MB');
  });

  it('formats 1536 bytes as "1.5 KB"', () => {
    expect(metrics.formatBytes(1536)).toBe('1.5 KB');
  });
});

// --- buildReport ---

describe('buildReport', () => {
  const sampleMetrics = {
    sourceLoc: 26000,
    testLoc: 16700,
    totalLoc: 42700,
    screens: 21,
    components: 33,
    services: 2,
    hooks: 6,
    testFiles: 73,
    tables: 13,
    productionDeps: 40,
    devDeps: 21,
    totalDeps: 61,
    diskBytes: 4194304,
  };

  it('includes the project title', () => {
    const report = metrics.buildReport(sampleMetrics);
    expect(report).toContain('No Caddy Needed');
  });

  it('includes Lines of Code section', () => {
    const report = metrics.buildReport(sampleMetrics);
    expect(report).toContain('Lines of Code');
  });

  it('includes source LOC value', () => {
    const report = metrics.buildReport(sampleMetrics);
    expect(report).toContain('26,000');
  });

  it('includes test LOC value', () => {
    const report = metrics.buildReport(sampleMetrics);
    expect(report).toContain('16,700');
  });

  it('includes Files section with screen count', () => {
    const report = metrics.buildReport(sampleMetrics);
    expect(report).toContain('Files');
    expect(report).toContain('21');
  });

  it('includes Database section with table count', () => {
    const report = metrics.buildReport(sampleMetrics);
    expect(report).toContain('Database');
    expect(report).toContain('13');
  });

  it('includes Dependencies section', () => {
    const report = metrics.buildReport(sampleMetrics);
    expect(report).toContain('Dependencies');
    expect(report).toContain('40');
    expect(report).toContain('21');
    expect(report).toContain('61');
  });

  it('includes Project Size section', () => {
    const report = metrics.buildReport(sampleMetrics);
    expect(report).toContain('Project Size');
    expect(report).toContain('MB');
  });
});
