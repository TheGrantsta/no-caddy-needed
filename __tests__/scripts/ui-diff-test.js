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
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(),
  existsSync: jest.fn(),
  copyFileSync: jest.fn(),
}));

jest.mock('pixelmatch', () => jest.fn());

jest.mock('pngjs', () => {
  const MockPNG = jest.fn().mockImplementation(({ width, height }) => ({
    data: Buffer.alloc(width * height * 4),
    width,
    height,
  }));
  MockPNG.sync = {
    read: jest.fn(),
    write: jest.fn().mockReturnValue(Buffer.from('diff-png-data')),
  };
  return { PNG: MockPNG };
});

// --- Requires (after mocks) ---

const { execSync } = require('child_process');
const fs = require('fs');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

// --- Load module under test ---

let uiDiff;
beforeAll(() => {
  uiDiff = require('../../scripts/ui-diff');
});

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.SKIP_UI_CHECK;
  delete process.env.UI_DIFF_THRESHOLD;
});

// --- isSimulatorBooted ---

describe('isSimulatorBooted', () => {
  it('returns true when xcrun reports a booted simulator', () => {
    execSync.mockReturnValue('  iPhone 16 (Booted)\n');
    expect(uiDiff.isSimulatorBooted()).toBe(true);
  });

  it('returns false when xcrun output is empty', () => {
    execSync.mockReturnValue('');
    expect(uiDiff.isSimulatorBooted()).toBe(false);
  });

  it('returns false when xcrun throws (no simulator runtime)', () => {
    execSync.mockImplementation(() => {
      throw new Error('Command failed');
    });
    expect(uiDiff.isSimulatorBooted()).toBe(false);
  });
});

// --- diffImages ---

describe('diffImages', () => {
  const baselinePath = '/baselines/01-home.png';
  const currentPath = '/screenshots/01-home.png';
  const diffPath = '/diff-output/01-home.png';
  const threshold = 0.5;

  const mockPngBuffer = Buffer.from('fake-png');
  const mockPngData = { data: Buffer.alloc(100 * 100 * 4), width: 100, height: 100 };

  beforeEach(() => {
    fs.readFileSync.mockReturnValue(mockPngBuffer);
    PNG.sync.read.mockReturnValue(mockPngData);
  });

  it('returns diffPercent within threshold and does not write diff file', () => {
    pixelmatch.mockReturnValue(10); // 10 / (100*100) = 0.1% — below 0.5%

    const result = uiDiff.diffImages(baselinePath, currentPath, diffPath, threshold);

    expect(result.diffPercent).toBeCloseTo(0.1, 1);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('returns diffPercent above threshold and writes diff file', () => {
    pixelmatch.mockReturnValue(600); // 600 / (100*100) = 6% — above 0.5%

    const result = uiDiff.diffImages(baselinePath, currentPath, diffPath, threshold);

    expect(result.diffPercent).toBeCloseTo(6, 0);
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledWith(diffPath, expect.any(Buffer));
  });

  it('reads both baseline and current image files', () => {
    pixelmatch.mockReturnValue(0);

    uiDiff.diffImages(baselinePath, currentPath, diffPath, threshold);

    expect(fs.readFileSync).toHaveBeenCalledWith(baselinePath);
    expect(fs.readFileSync).toHaveBeenCalledWith(currentPath);
  });
});

// --- main ---

describe('main', () => {
  beforeEach(() => {
    // Default: simulator is booted
    execSync.mockImplementation((cmd) => {
      if (cmd.includes('simctl')) return 'iPhone 16 (Booted)';
      return ''; // maestro command
    });
    // No baselines by default
    fs.readdirSync.mockReturnValue([]);
    fs.existsSync.mockReturnValue(true);
  });

  it('returns 0 and skips all checks when SKIP_UI_CHECK=1', () => {
    process.env.SKIP_UI_CHECK = '1';

    const code = uiDiff.main();

    expect(code).toBe(0);
    expect(execSync).not.toHaveBeenCalled();
  });

  it('returns 0 with warning when no simulator is booted', () => {
    execSync.mockImplementation(() => {
      throw new Error('Command failed');
    });

    const code = uiDiff.main();

    expect(code).toBe(0);
  });

  it('returns 0 when all screenshots are within threshold', () => {
    fs.readdirSync.mockReturnValue(['01-home.png']);
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(Buffer.from('png'));
    PNG.sync.read.mockReturnValue({ data: Buffer.alloc(100 * 100 * 4), width: 100, height: 100 });
    pixelmatch.mockReturnValue(0); // identical

    const code = uiDiff.main();

    expect(code).toBe(0);
  });

  it('returns 1 when any screenshot exceeds threshold', () => {
    fs.readdirSync.mockReturnValue(['01-home.png']);
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(Buffer.from('png'));
    PNG.sync.read.mockReturnValue({ data: Buffer.alloc(100 * 100 * 4), width: 100, height: 100 });
    pixelmatch.mockReturnValue(9999); // huge diff

    const code = uiDiff.main();

    expect(code).toBe(1);
  });

  it('returns 0 and skips image when current screenshot does not exist', () => {
    fs.readdirSync.mockReturnValue(['01-home.png']);
    fs.existsSync.mockImplementation((p) => !p.includes('screenshots'));

    const code = uiDiff.main();

    expect(code).toBe(0);
    expect(pixelmatch).not.toHaveBeenCalled();
  });
});
