const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const HOOK = path.join(__dirname, '../../.husky/pre-push');
// The UI checks run with `npm run ui:verify`, not in the hook, because they outlast git's
// connection to the remote and would make the push fail.
const UNIT_TESTS_ONLY = ['run test:coverage'];

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

  it('shouldRunOnlyTheUnitTestsByDefault', () => {
    expect(runHook()).toEqual(UNIT_TESTS_ONLY);
  });

  it('shouldRunOnlyTheUnitTestsWhenSkipAllChecksIsSet', () => {
    expect(runHook({ SKIP_ALL_CHECKS: '1' })).toEqual(UNIT_TESTS_ONLY);
  });

  it('shouldRunOnlyTheUnitTestsWhenSkipUiCheckIsSet', () => {
    expect(runHook({ SKIP_UI_CHECK: '1' })).toEqual(UNIT_TESTS_ONLY);
  });

  it('shouldNeverRunTheUiChecksFromTheHook', () => {
    expect(runHook({ SKIP_UI_CHECK: '0' })).toEqual(UNIT_TESTS_ONLY);
  });
});
