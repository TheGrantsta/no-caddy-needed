import { countRoundsByYear, filterLabel } from '../../utils/roundFilter';

describe('filterLabel', () => {
    it('shouldNameTheLastRoundFilter', () => {
        expect(filterLabel(1)).toBe('Last round');
    });

    it('shouldNameTheLastTenRoundsFilter', () => {
        expect(filterLabel(10)).toBe('Last 10 rounds');
    });

    it('shouldNameTheAllRoundsFilter', () => {
        expect(filterLabel('all')).toBe('All rounds');
    });

    it('shouldShowTheYearForAYearFilter', () => {
        expect(filterLabel({ year: 2025 })).toBe('2025');
    });
});

describe('countRoundsByYear', () => {
    it('shouldCountHowManyRoundsWerePlayedInEachYear', () => {
        const rounds = [{ Year: 2026 }, { Year: 2025 }, { Year: 2026 }, { Year: undefined }];

        expect(countRoundsByYear(rounds)).toEqual({ 2026: 2, 2025: 1 });
    });

    it('shouldReturnNoCountsWhenThereAreNoRounds', () => {
        expect(countRoundsByYear([])).toEqual({});
    });
});
