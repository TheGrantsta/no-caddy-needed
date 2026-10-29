const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const HOOK = path.join(__dirname, '../../.husky/pre-push');
const ALL_CHECKS = [
  'run test:coverage',
  'run ui:check',
  'run test:e2e',
  'run test:e2e:stats',
];

describe('pre-push hook', () => {
  let stubDir;
  let logFile;

  beforeEach(() => {
    stubDir = fs.mkdtempSync(path.join(os.tmpdir(), 'npm-stub-'));
    logFile = path.join(stubDir, 'calls.log');
    // Stand-in for npm that records each invocation instead of running it
    fs.writeFileSync(path.join(stubDir, 'npm'), `#!/bin/sh\necho "$@" >> "${logFile}"\n`, { mode: 0o755 });
  });

  afterEach(() => {
    fs.rmSync(stubDir, { recursive: true, force: true });
  });

  const runHook = (env = {}) => {
    spawnSync('sh', [HOOK], {
      env: { PATH: `${stubDir}:${process.env.PATH}`, ...env },
      encoding: 'utf8',
    });
    return fs.existsSync(logFile)
      ? fs.readFileSync(logFile, 'utf8').trim().split('\n')
      : [];
  };

  it('runs unit tests, UI check and both Maestro flows by default', () => {
    expect(runHook()).toEqual(ALL_CHECKS);
  });

  it('runs only unit tests when SKIP_ALL_CHECKS=1', () => {
    expect(runHook({ SKIP_ALL_CHECKS: '1' })).toEqual(['run test:coverage']);
  });

  it('still runs the Maestro flows when only SKIP_UI_CHECK=1 is set', () => {
    expect(runHook({ SKIP_UI_CHECK: '1' })).toEqual(ALL_CHECKS);
  });
});
