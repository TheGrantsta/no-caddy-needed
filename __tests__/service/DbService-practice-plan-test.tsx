import { getTopSinsForPracticePlanService } from '../../service/DbService';
import { getSinFrequenciesForRoundsSync, getCompletedRoundIdsSync } from '../../database/db';

jest.mock('../../database/db', () => ({
    getSinFrequenciesForRoundsSync: jest.fn(),
    getCompletedRoundIdsSync: jest.fn(),
}));

const mockGetSinFrequenciesForRoundsSync = getSinFrequenciesForRoundsSync as jest.Mock;
const mockGetCompletedRoundIdsSync = getCompletedRoundIdsSync as jest.Mock;

const allZeros = {
    ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0,
    BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0,
};

describe('getTopSinsForPracticePlanService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetCompletedRoundIdsSync.mockReturnValue([1, 2, 3]);
        mockGetSinFrequenciesForRoundsSync.mockReturnValue(allZeros);
    });

    it('returnsEmptyArrayWhenNoSinData', () => {
        const result = getTopSinsForPracticePlanService();
        expect(result).toEqual([]);
    });

    it('returnsSinsWithCountGreaterThanZero', () => {
        mockGetSinFrequenciesForRoundsSync.mockReturnValue({ ...allZeros, ThreePutts: 3 });
        const result = getTopSinsForPracticePlanService();
        expect(result.length).toBe(1);
        expect(result[0].count).toBe(3);
    });

    it('sortsResultByCountDescending', () => {
        mockGetSinFrequenciesForRoundsSync.mockReturnValue({
            ...allZeros, ThreePutts: 2, DoubleChips: 5, BogeysInside9Iron: 3,
        });
        const result = getTopSinsForPracticePlanService();
        expect(result[0].count).toBe(5);
        expect(result[1].count).toBe(3);
        expect(result[2].count).toBe(2);
    });

    it('deduplicatesByCategory', () => {
        mockGetSinFrequenciesForRoundsSync.mockReturnValue({ ...allZeros, TroubleOffTee: 5, Penalties: 2 });
        const result = getTopSinsForPracticePlanService();
        expect(result.length).toBe(1);
        expect(result[0].count).toBe(5);
    });

    it('usesReminderLabelFromMapping', () => {
        mockGetSinFrequenciesForRoundsSync.mockReturnValue({ ...allZeros, ThreePutts: 4 });
        const result = getTopSinsForPracticePlanService();
        expect(result[0].reminderLabel).toBe('Putting practice — reduce 3-putts');
    });

    it('includesDrillLabelsArrayInResult', () => {
        mockGetSinFrequenciesForRoundsSync.mockReturnValue({ ...allZeros, ThreePutts: 4 });
        const result = getTopSinsForPracticePlanService();
        expect(Array.isArray(result[0].drillLabels)).toBe(true);
        expect(result[0].drillLabels.length).toBeGreaterThan(0);
        expect(result[0].drillLabels[0]).toBe('Ladder');
    });

    it('limitsToLast10Rounds', () => {
        getTopSinsForPracticePlanService();
        expect(mockGetCompletedRoundIdsSync).toHaveBeenCalledWith(10);
    });

    it('passesRecentRoundIdsToFrequencyQuery', () => {
        mockGetCompletedRoundIdsSync.mockReturnValue([7, 8, 9]);

        getTopSinsForPracticePlanService();

        expect(mockGetSinFrequenciesForRoundsSync).toHaveBeenCalledWith([7, 8, 9]);
    });
});
