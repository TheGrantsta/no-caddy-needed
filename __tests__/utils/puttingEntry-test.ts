import {
    DEFAULT_FIRST_PUTT_FEET,
    DEFAULT_SECOND_PUTT_FEET,
    greenInRegulation,
    isShortSecondPuttInvalid,
    puttCountFor,
    statsForPutts,
} from '../../utils/puttingEntry';

describe('greenInRegulation', () => {
    it('shouldBeTrueWhenStrokesToTheGreenAreTwoOnAPar4WithTwoPutts', () => {
        expect(greenInRegulation({ putts: 2, score: 4, par: 4 })).toBe(true);
    });

    it('shouldBeFalseWhenAPar4TakesThreeStrokesToTheGreen', () => {
        expect(greenInRegulation({ putts: 2, score: 5, par: 4 })).toBe(false);
    });

    it('shouldBeTrueWhenAParThreeIsReachedWithOneStroke', () => {
        expect(greenInRegulation({ putts: 2, score: 3, par: 3 })).toBe(true);
    });

    it('shouldBeFalseForAChipIn', () => {
        expect(greenInRegulation({ putts: 0, score: 1, par: 4 })).toBe(false);
    });

    it('shouldBeFalseWhenTheScoreIsNotEnteredYet', () => {
        expect(greenInRegulation({ putts: 2, score: undefined, par: 4 })).toBe(false);
    });

    it('shouldBeFalseWhenThePuttCountIsNotChosenYet', () => {
        expect(greenInRegulation({ putts: undefined, score: 4, par: 4 })).toBe(false);
    });

    it('shouldCountThreePuttsAsThreeStrokesOnTheGreen', () => {
        expect(greenInRegulation({ putts: 3, score: 5, par: 4 })).toBe(true);
        expect(greenInRegulation({ putts: 3, score: 6, par: 4 })).toBe(false);
    });
});

describe('puttCountFor', () => {
    it('shouldReadAChipInAsZeroPutts', () => {
        expect(puttCountFor({ firstPutt: 0, secondPutt: 0, threePutts: false })).toBe(0);
    });

    it('shouldReadASavedOnePuttAsOnePutt', () => {
        expect(puttCountFor({ firstPutt: 12, secondPutt: 0, threePutts: false })).toBe(1);
    });

    it('shouldReadASavedTwoPuttAsTwoPutts', () => {
        expect(puttCountFor({ firstPutt: 12, secondPutt: 3, threePutts: false })).toBe(2);
    });

    it('shouldReadASavedTwoPuttWithTheThreePuttSinAsThreePutts', () => {
        expect(puttCountFor({ firstPutt: 12, secondPutt: 3, threePutts: true })).toBe(3);
    });

    it('shouldReadNoFirstPuttAsNoCountYet', () => {
        expect(puttCountFor({ firstPutt: undefined, secondPutt: undefined, threePutts: false })).toBeUndefined();
    });
});

describe('statsForPutts', () => {
    it('shouldStoreAChipInAsZeroFirstAndSecondPutt', () => {
        expect(statsForPutts({ putts: 0, firstPutt: 18, secondPutt: 3, secondIsLong: true })).toEqual({
            firstPutt: 0, secondPutt: 0, secondIsLong: false,
        });
    });

    it('shouldStoreOnePuttWithZeroSecondPuttAndNoDirection', () => {
        expect(statsForPutts({ putts: 1, firstPutt: 18, secondPutt: 3, secondIsLong: true })).toEqual({
            firstPutt: 18, secondPutt: 0, secondIsLong: false,
        });
    });

    it('shouldKeepTheSecondPuttAndDirectionForTwoPutts', () => {
        expect(statsForPutts({ putts: 2, firstPutt: 18, secondPutt: 3, secondIsLong: true })).toEqual({
            firstPutt: 18, secondPutt: 3, secondIsLong: true,
        });
    });

    it('shouldKeepTheSecondPuttForThreePutts', () => {
        expect(statsForPutts({ putts: 3, firstPutt: 18, secondPutt: 3, secondIsLong: false })).toEqual({
            firstPutt: 18, secondPutt: 3, secondIsLong: false,
        });
    });

    it('shouldStoreNothingWhenNoCountIsChosen', () => {
        expect(statsForPutts({ putts: undefined, firstPutt: 18, secondPutt: 3, secondIsLong: false })).toEqual({
            firstPutt: undefined, secondPutt: undefined, secondIsLong: false,
        });
    });
});

describe('isShortSecondPuttInvalid', () => {
    it('shouldRejectAShortSecondPuttEqualToTheFirst', () => {
        expect(isShortSecondPuttInvalid({ putts: 2, firstPutt: 10, secondPutt: 10, secondIsLong: false })).toBe(true);
    });

    it('shouldRejectAShortSecondPuttLongerThanTheFirst', () => {
        expect(isShortSecondPuttInvalid({ putts: 2, firstPutt: 10, secondPutt: 15, secondIsLong: false })).toBe(true);
    });

    it('shouldAllowAShortSecondPuttShorterThanTheFirst', () => {
        expect(isShortSecondPuttInvalid({ putts: 2, firstPutt: 10, secondPutt: 3, secondIsLong: false })).toBe(false);
    });

    it('shouldAllowALongSecondPuttLongerThanTheFirst', () => {
        expect(isShortSecondPuttInvalid({ putts: 2, firstPutt: 10, secondPutt: 15, secondIsLong: true })).toBe(false);
    });

    it('shouldIgnoreTheRuleForOneOrNoPutts', () => {
        expect(isShortSecondPuttInvalid({ putts: 1, firstPutt: 10, secondPutt: 0, secondIsLong: false })).toBe(false);
        expect(isShortSecondPuttInvalid({ putts: 0, firstPutt: 0, secondPutt: 0, secondIsLong: false })).toBe(false);
    });
});

describe('default distances', () => {
    it('shouldDefaultTheFirstPuttTo10FeetAndTheSecondTo3Feet', () => {
        expect(DEFAULT_FIRST_PUTT_FEET).toBe(10);
        expect(DEFAULT_SECOND_PUTT_FEET).toBe(3);
    });
});
