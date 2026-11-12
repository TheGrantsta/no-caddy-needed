import {
  applyRoundFilter,
  getAvailableYears,
  parseRoundFilter,
  resolveRoundFilter,
  serializeRoundFilter,
  RoundFilter,
} from '../../utils/roundFilter';

// Rounds are newest-first, as returned by getAllRoundHistoryService.
const rounds = [
  { Id: 6, Year: 2026 },
  { Id: 5, Year: 2025 },
  { Id: 4, Year: 2025 },
  { Id: 3, Year: 2025 },
  { Id: 2, Year: 2024 },
  { Id: 1, Year: 2024 },
];

describe('roundFilter', () => {
  describe('getAvailableYears', () => {
    it('shouldReturnDistinctYearsNewestFirst', () => {
      expect(getAvailableYears(rounds)).toEqual([2026, 2025, 2024]);
    });

    it('shouldReturnEmptyArrayWhenNoRounds', () => {
      expect(getAvailableYears([])).toEqual([]);
    });

    it('shouldIgnoreRoundsWithoutAYear', () => {
      expect(getAvailableYears([{ Id: 1 }, { Id: 2, Year: 2025 }])).toEqual([2025]);
    });
  });

  describe('applyRoundFilter', () => {
    it('shouldReturnAllRoundsForAllFilter', () => {
      expect(applyRoundFilter(rounds, 'all')).toEqual(rounds);
    });

    it('shouldReturnOnlyTheLatestRoundForFilterOne', () => {
      expect(applyRoundFilter(rounds, 1)).toEqual([{ Id: 6, Year: 2026 }]);
    });

    it('shouldReturnTheLatestTenRoundsForFilterTen', () => {
      const many = Array.from({ length: 15 }, (_, i) => ({ Id: i, Year: 2025 }));
      expect(applyRoundFilter(many, 10)).toHaveLength(10);
    });

    it('shouldReturnFewerThanTenWhenFewerRoundsExist', () => {
      expect(applyRoundFilter(rounds, 10)).toHaveLength(6);
    });

    it('shouldReturnOnlyRoundsFromTheSelectedYear', () => {
      const filter: RoundFilter = { year: 2025 };
      expect(applyRoundFilter(rounds, filter).map(r => r.Id)).toEqual([5, 4, 3]);
    });

    it('shouldReturnEmptyArrayWhenNoRoundsMatchTheYear', () => {
      expect(applyRoundFilter(rounds, { year: 2019 })).toEqual([]);
    });

    it('shouldReturnEmptyArrayWhenNoRoundsProvided', () => {
      expect(applyRoundFilter([], { year: 2025 })).toEqual([]);
    });
  });

  describe('serializeRoundFilter and parseRoundFilter', () => {
    it('shouldSerializeCountsAndAllAsTheirValue', () => {
      expect(serializeRoundFilter(1)).toBe('1');
      expect(serializeRoundFilter(10)).toBe('10');
      expect(serializeRoundFilter('all')).toBe('all');
    });

    it('shouldSerializeYearAsItsNumber', () => {
      expect(serializeRoundFilter({ year: 2025 })).toBe('2025');
    });

    it('shouldRoundTripEveryFilterKind', () => {
      const filters: RoundFilter[] = [1, 10, 'all', { year: 2024 }];
      filters.forEach(f => expect(parseRoundFilter(serializeRoundFilter(f))).toEqual(f));
    });

    it('shouldParseUnknownOrMissingValueAsAll', () => {
      expect(parseRoundFilter(undefined)).toBe('all');
      expect(parseRoundFilter('')).toBe('all');
      expect(parseRoundFilter('banana')).toBe('all');
    });

    it('shouldRejectNonYearNumbersAsAll', () => {
      expect(parseRoundFilter('7')).toBe('all');
      expect(parseRoundFilter('99999')).toBe('all');
    });
  });

  describe('resolveRoundFilter', () => {
    it('shouldKeepACountFilterUnchanged', () => {
      expect(resolveRoundFilter(10, [2026])).toBe(10);
      expect(resolveRoundFilter(1, [])).toBe(1);
    });

    it('shouldKeepAllUnchanged', () => {
      expect(resolveRoundFilter('all', [2026])).toBe('all');
    });

    it('shouldKeepAYearThatStillHasRounds', () => {
      expect(resolveRoundFilter({ year: 2025 }, [2026, 2025])).toEqual({ year: 2025 });
    });

    it('shouldFallBackToAllWhenTheSelectedYearHasNoRounds', () => {
      expect(resolveRoundFilter({ year: 2024 }, [2026, 2025])).toBe('all');
    });

    it('shouldFallBackToAllWhenThereAreNoRoundsAtAll', () => {
      expect(resolveRoundFilter({ year: 2025 }, [])).toBe('all');
    });
  });
});
