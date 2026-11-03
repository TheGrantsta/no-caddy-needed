// Filter for round history: last N rounds, all rounds, or rounds from one calendar year.
export type RoundFilter = 1 | 10 | 'all' | { year: number };

export type RoundWithYear = { Year?: number };

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

// Distinct years present in the rounds, newest first. Rounds without a Year are ignored.
export const getAvailableYears = (rounds: RoundWithYear[]): number[] => {
  const years = new Set<number>();
  rounds.forEach(r => {
    if (r.Year !== undefined) years.add(r.Year);
  });
  return [...years].sort((a, b) => b - a);
};

// Expects rounds ordered newest-first (as produced by getAllRoundHistoryService).
export const applyRoundFilter = <T extends RoundWithYear>(rounds: T[], filter: RoundFilter): T[] => {
  if (filter === 'all') return rounds;
  if (typeof filter === 'number') return rounds.slice(0, filter);
  return rounds.filter(r => r.Year === filter.year);
};

export const isAllFilter = (filter: RoundFilter): boolean => filter === 'all';

export const serializeRoundFilter = (filter: RoundFilter): string =>
  typeof filter === 'number' ? String(filter) : filter === 'all' ? 'all' : String(filter.year);

// Unknown, missing or out-of-range values fall back to 'all'.
export const parseRoundFilter = (value: string | undefined): RoundFilter => {
  if (value === '1') return 1;
  if (value === '10') return 10;
  if (value === 'all') return 'all';
  if (value && /^\d{4}$/.test(value)) {
    const year = Number(value);
    if (year >= MIN_YEAR && year <= MAX_YEAR) return { year };
  }
  return 'all';
};

// A saved year can outlive its rounds (for example after a delete); fall back to All when it no longer exists.
export const resolveRoundFilter = (filter: RoundFilter, years: number[]): RoundFilter => {
  if (typeof filter === 'object' && !years.includes(filter.year)) return 'all';
  return filter;
};
