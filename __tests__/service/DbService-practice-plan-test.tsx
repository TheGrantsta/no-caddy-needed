import { getTopSinsForPracticePlanService } from '../../service/DbService';
import { getSinFrequenciesSync } from '../../database/db';

jest.mock('../../database/db', () => ({
    getSinFrequenciesSync: jest.fn(),
}));

const mockGetSinFrequenciesSync = getSinFrequenciesSync as jest.Mock;

const allZeros = {
    ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0,
    BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0,
};

describe('getTopSinsForPracticePlanService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSinFrequenciesSync.mockReturnValue(allZeros);
    });

    it('returnsEmptyArrayWhenNoSinData', () => {
        const result = getTopSinsForPracticePlanService();
        expect(result).toEqual([]);
    });

    it('returnsSinsWithCountGreaterThanZero', () => {
        mockGetSinFrequenciesSync.mockReturnValue({ ...allZeros, ThreePutts: 3 });
        const result = getTopSinsForPracticePlanService();
        expect(result.length).toBe(1);
        expect(result[0].count).toBe(3);
    });

    it('sortsResultByCountDescending', () => {
        mockGetSinFrequenciesSync.mockReturnValue({
            ...allZeros, ThreePutts: 2, DoubleChips: 5, BogeysInside9Iron: 3,
        });
        const result = getTopSinsForPracticePlanService();
        expect(result[0].count).toBe(5);
        expect(result[1].count).toBe(3);
        expect(result[2].count).toBe(2);
    });

    it('deduplicatesByCategory', () => {
        // TroubleOffTee and Penalties both map to 'Full swing'
        mockGetSinFrequenciesSync.mockReturnValue({ ...allZeros, TroubleOffTee: 5, Penalties: 2 });
        const result = getTopSinsForPracticePlanService();
        expect(result.length).toBe(1);
        expect(result[0].count).toBe(5);
    });

    it('usesReminderLabelFromMapping', () => {
        mockGetSinFrequenciesSync.mockReturnValue({ ...allZeros, ThreePutts: 4 });
        const result = getTopSinsForPracticePlanService();
        expect(result[0].reminderLabel).toBe('Putting practice — reduce 3-putts');
    });
});
