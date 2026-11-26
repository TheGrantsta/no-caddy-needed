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

    it('shouldCountAOnePuttAsOnePuttWhenTheSecondPuttIsZero', () => {
        expect(countHolePutts({ FirstPuttDistance: 18, SecondPuttDistance: 0 }, false)).toBe(1);
    });

    it('shouldCountTwoPuttsForAHoleWithASecondPutt', () => {
        expect(countHolePutts({ FirstPuttDistance: 12, SecondPuttDistance: 3 }, false)).toBe(2);
    });

    it('shouldAddAThirdPuttForAThreePutt', () => {
        expect(countHolePutts({ FirstPuttDistance: 12, SecondPuttDistance: 3 }, true)).toBe(3);
    });

    it('shouldUseTheStoredCountInsteadOfTheDistancesWhenItIsSaved', () => {
        expect(countHolePutts({ FirstPuttDistance: 12, SecondPuttDistance: 3, PuttCount: 1 }, false)).toBe(1);
    });

    it('shouldUseAStoredThreePuttCountWithoutTheSin', () => {
        expect(countHolePutts({ FirstPuttDistance: 12, SecondPuttDistance: 3, PuttCount: 3 }, false)).toBe(3);
    });

    it('shouldFallBackToTheDistancesAndSinForHolesWithNoStoredCount', () => {
        expect(countHolePutts({ FirstPuttDistance: 12, SecondPuttDistance: 3, PuttCount: null }, true)).toBe(3);
    });

    it('shouldCountAOnePuttAsOnePuttEvenWithAStrayThreePuttSin', () => {
        expect(countHolePutts({ FirstPuttDistance: 18, SecondPuttDistance: 0, PuttCount: null }, true)).toBe(1);
    });
});
