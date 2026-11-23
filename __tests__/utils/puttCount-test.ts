import { countHolePutts } from '../../utils/puttCount';

describe('countHolePutts', () => {
    it('shouldCountZeroPuttsWhenThereAreNoStatsForTheHole', () => {
        expect(countHolePutts(null, false)).toBe(0);
    });

    it('shouldCountAChipInAsZeroPutts', () => {
        expect(countHolePutts({ FirstPuttDistance: 0, SecondPuttDistance: 0 }, false)).toBe(0);
    });

    it('shouldCountAChipInAsZeroPuttsEvenIfAThreePuttWasMarked', () => {
        expect(countHolePutts({ FirstPuttDistance: 0, SecondPuttDistance: 0 }, true)).toBe(0);
    });

    it('shouldCountTwoPuttsForAHoleWithASecondPutt', () => {
        expect(countHolePutts({ FirstPuttDistance: 12, SecondPuttDistance: 3 }, false)).toBe(2);
    });

    it('shouldAddAThirdPuttForAThreePutt', () => {
        expect(countHolePutts({ FirstPuttDistance: 12, SecondPuttDistance: 3 }, true)).toBe(3);
    });
});
