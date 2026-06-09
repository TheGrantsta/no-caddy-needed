import { getWindArrowRotation, normalize360 } from '../../service/WeatherService';

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
