import easJson from '../../eas.json';

describe('eas.json build configuration', () => {
  const buildProfiles = easJson.build as Record<string, { ios?: { image?: string } }>;

  it('shouldUseTheLatestIosImageForEveryBuildProfile', () => {
    Object.entries(buildProfiles).forEach(([profile, config]) => {
      expect({ profile, image: config.ios?.image }).toEqual({ profile, image: 'latest' });
    });
  });

  it('shouldNotPinIosBuildsToXcode26WhichFailsToBuildExpoModulesJsi', () => {
    Object.values(buildProfiles).forEach(config => {
      expect(config.ios?.image ?? '').not.toMatch(/xcode-26/);
    });
  });
});
