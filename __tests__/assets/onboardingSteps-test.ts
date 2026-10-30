import { ONBOARDING_STEPS } from '../../assets/onboardingSteps';

describe('onboarding steps', () => {
    const sets = Object.entries(ONBOARDING_STEPS);

    it('shouldDefineAnOverlayForEachMainScreen', () => {
        expect(Object.keys(ONBOARDING_STEPS).sort()).toEqual(
            ['distances', 'home', 'perform', 'play', 'practice', 'settings', 'wedgeChart']
        );
    });

    it.each(sets)('shouldKeepOverlay %s to at most two short steps', (_name, steps) => {
        expect(steps.length).toBeGreaterThanOrEqual(1);
        expect(steps.length).toBeLessThanOrEqual(2);
        steps.forEach(step => expect(step.text.length).toBeLessThanOrEqual(140));
    });
});
