import appJson from '../../app.json';

describe('app.json configuration', () => {
  it('should declare BGTaskSchedulerPermittedIdentifiers for expo-background-task support', () => {
    const bgTaskIdentifiers =
      appJson.expo.ios?.infoPlist?.BGTaskSchedulerPermittedIdentifiers;

    expect(bgTaskIdentifiers).toBeDefined();
    expect(Array.isArray(bgTaskIdentifiers)).toBe(true);
    expect(bgTaskIdentifiers).toContain('com.expo.modules.backgroundtask.processing');
  });
});
