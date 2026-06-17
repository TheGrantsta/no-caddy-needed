import {
    getWindArrowRotation,
    normalize360,
    getWindEffect,
    HEAD_PCT_PER_MPH,
    TAIL_PCT_PER_MPH,
    MAX_PLAYS_LONGER_PCT,
} from '../../service/WeatherService';

describe('normalize360', () => {
    it('leavesValuesInRangeUnchanged', () => {
        expect(normalize360(0)).toBe(0);
        expect(normalize360(180)).toBe(180);
        expect(normalize360(359)).toBe(359);
    });

    it('wrapsValuesAt360', () => {
        expect(normalize360(360)).toBe(0);
        expect(normalize360(450)).toBe(90);
    });

    it('wrapsNegativeValues', () => {
        expect(normalize360(-90)).toBe(270);
        expect(normalize360(-1)).toBe(359);
    });
});

describe('getWindArrowRotation', () => {
    it('addsDownwind180WhenHeadingZero', () => {
        // wind FROM 0 (north) blows TOward 180 (south)
        expect(getWindArrowRotation(0, 0)).toBe(180);
    });

    it('subtractsDeviceHeading', () => {
        // wind FROM 0 → downwind 180; phone rotated 90 → arrow at 90
        expect(getWindArrowRotation(0, 90)).toBe(90);
    });

    it('wrapsAroundBoundary', () => {
        // wind FROM 278 → downwind 458 → normalized 98; heading 0
        expect(getWindArrowRotation(278, 0)).toBe(98);
    });

    it('handlesHeadingLargerThanDownwind', () => {
        // downwind 180, heading 270 → -90 → 270
        expect(getWindArrowRotation(0, 270)).toBe(270);
    });
});

describe('getWindEffect', () => {
    it('exposesAsymmetricCoefficients', () => {
        // Headwind hurts more than tailwind helps.
        expect(HEAD_PCT_PER_MPH).toBeGreaterThan(TAIL_PCT_PER_MPH);
    });

    it('treatsStraightHeadwindAsPlayingLonger', () => {
        // wind FROM 0 (north), player faces north → straight into the wind
        const effect = getWindEffect(0, 10, 0);
        expect(effect.category).toBe('headwind');
        expect(effect.alongComponentMph).toBeCloseTo(-10, 5);
        expect(effect.playsLongerPercent).toBeCloseTo(10, 5);
        expect(effect.crossDirection).toBeNull();
    });

    it('treatsStraightTailwindAsPlayingShorter', () => {
        // wind FROM 180 (south), player faces north → straight downwind
        const effect = getWindEffect(180, 10, 0);
        expect(effect.category).toBe('tailwind');
        expect(effect.alongComponentMph).toBeCloseTo(10, 5);
        expect(effect.playsLongerPercent).toBeCloseTo(-5, 5);
        expect(effect.crossDirection).toBeNull();
    });

    it('treatsPureCrosswindFromTheRightWithMinimalDistanceEffect', () => {
        // wind FROM 90 (east), player faces north → from the right
        const effect = getWindEffect(90, 10, 0);
        expect(effect.category).toBe('crosswind');
        expect(effect.playsLongerPercent).toBeCloseTo(0, 5);
        expect(effect.crossDirection).toBe('right');
    });

    it('treatsCrosswindFromTheLeftWhenWindFromWest', () => {
        // wind FROM 270 (west), player faces north → from the left
        const effect = getWindEffect(270, 10, 0);
        expect(effect.category).toBe('crosswind');
        expect(effect.crossDirection).toBe('left');
    });

    it('clampsExtremeHeadwindToMax', () => {
        const effect = getWindEffect(0, 40, 0);
        expect(effect.playsLongerPercent).toBe(MAX_PLAYS_LONGER_PCT);
    });

    it('clampsExtremeTailwindToNegativeMax', () => {
        const effect = getWindEffect(180, 60, 0);
        expect(effect.playsLongerPercent).toBe(-MAX_PLAYS_LONGER_PCT);
    });

    it('reportsCalmWhenBelowThreshold', () => {
        const effect = getWindEffect(0, 2, 0);
        expect(effect.category).toBe('calm');
    });
});
