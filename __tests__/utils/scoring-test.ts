import { isTripleBogeyOrWorse } from '../../utils/scoring';

describe('isTripleBogeyOrWorse', () => {
    it('shouldBeFalseWhenThereIsNoScore', () => {
        expect(isTripleBogeyOrWorse(undefined, 4)).toBe(false);
    });

    it('shouldBeFalseForABogeyOrADoubleBogey', () => {
        expect(isTripleBogeyOrWorse(5, 4)).toBe(false);
        expect(isTripleBogeyOrWorse(6, 4)).toBe(false);
    });

    it('shouldBeTrueForATripleBogey', () => {
        expect(isTripleBogeyOrWorse(7, 4)).toBe(true);
    });

    it('shouldBeTrueForAnythingWorseThanATripleBogey', () => {
        expect(isTripleBogeyOrWorse(10, 4)).toBe(true);
    });

    it('shouldMeasureFromTheHolesPar', () => {
        expect(isTripleBogeyOrWorse(6, 3)).toBe(true);
        expect(isTripleBogeyOrWorse(6, 5)).toBe(false);
    });
});
