import { hasSinDetails } from '../../utils/deadlySins';

const NO_SINS = {
    threePutts: false,
    doubleBogeys: false,
    bogeysPar5: false,
    bogeysInside9Iron: false,
    doubleChips: false,
    troubleOffTee: false,
    penalties: false,
};

describe('hasSinDetails', () => {
    it('shouldReturnTrueForEachSinThatHasFollowUpDetails', () => {
        expect(hasSinDetails({ ...NO_SINS, troubleOffTee: true })).toBe(true);
        expect(hasSinDetails({ ...NO_SINS, penalties: true })).toBe(true);
        expect(hasSinDetails({ ...NO_SINS, bogeysInside9Iron: true })).toBe(true);
        expect(hasSinDetails({ ...NO_SINS, doubleChips: true })).toBe(true);
    });

    it('shouldReturnFalseForSinsWithoutFollowUpDetails', () => {
        expect(hasSinDetails({ ...NO_SINS, threePutts: true })).toBe(false);
        expect(hasSinDetails({ ...NO_SINS, doubleBogeys: true })).toBe(false);
        expect(hasSinDetails({ ...NO_SINS, bogeysPar5: true })).toBe(false);
    });

    it('shouldReturnFalseWhenNoSinsAreLogged', () => {
        expect(hasSinDetails(NO_SINS)).toBe(false);
    });

    it('shouldReturnTrueWhenAnyDetailSinIsLoggedAlongsideOthers', () => {
        expect(hasSinDetails({ ...NO_SINS, threePutts: true, penalties: true })).toBe(true);
    });
});
