import fs from 'fs';
import path from 'path';
import appJson from '../../app.json';
import packageJson from '../../package.json';

// Reads width/height from the PNG IHDR chunk so the check needs no image library
const readPngSize = (relativePath: string) => {
  const buffer = fs.readFileSync(path.join(__dirname, '../..', relativePath));
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
};

describe('app.json configuration', () => {
  it('should declare BGTaskSchedulerPermittedIdentifiers for expo-background-task support', () => {
    const bgTaskIdentifiers =
      appJson.expo.ios?.infoPlist?.BGTaskSchedulerPermittedIdentifiers;

    expect(bgTaskIdentifiers).toBeDefined();
    expect(Array.isArray(bgTaskIdentifiers)).toBe(true);
    expect(bgTaskIdentifiers).toContain('com.expo.modules.backgroundtask.processing');
  });

  it('shouldConfigureSplashThroughTheExpoSplashScreenPluginOnly', () => {
    const splashPlugin = appJson.expo.plugins.find(
      (p: unknown) => Array.isArray(p) && p[0] === 'expo-splash-screen'
    ) as [string, { image: string; backgroundColor: string }];

    expect(splashPlugin).toBeDefined();
    expect(splashPlugin[1].image).toBeDefined();
    expect(splashPlugin[1].backgroundColor).toBeDefined();
    expect((appJson.expo as Record<string, unknown>).splash).toBeUndefined();
    expect((appJson.expo.ios as Record<string, unknown>).splash).toBeUndefined();
    expect((appJson.expo.android as Record<string, unknown>).splash).toBeUndefined();
  });

  it('shouldUseASquareAdaptiveIconForeground', () => {
    const foreground = appJson.expo.android.adaptiveIcon.foregroundImage;
    const { width, height } = readPngSize(foreground);

    expect(width).toBe(height);
  });
});

describe('package.json dependencies', () => {
  it('shouldNotInstallExpoModulesCoreDirectly', () => {
    expect(packageJson.dependencies).not.toHaveProperty('expo-modules-core');
  });
});
