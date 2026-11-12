import { formatPgaRate, getExpectedMakes } from '../../assets/pgaPuttingBenchmarks';

// Every distance the benchmark table covers
const ALL_DISTANCES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 35, 40, 45, 50];

describe('pgaPuttingBenchmarks', () => {
    describe('formatPgaRate', () => {
        it('formats 1ft as 100%* (estimated)', () => {
            expect(formatPgaRate(1)).toBe('100%*');
        });

        it('formats 3ft as 99% (not estimated)', () => {
            expect(formatPgaRate(3)).toBe('99%');
        });

        it('formats 2ft as 99%* (estimated)', () => {
            expect(formatPgaRate(2)).toBe('99%*');
        });

        it('formats 35ft as 5%* (estimated)', () => {
            expect(formatPgaRate(35)).toBe('5%*');
        });

        it('returns dash for unknown distance', () => {
            expect(formatPgaRate(999)).toBe('-');
        });

        it('returns dash for zero distance', () => {
            expect(formatPgaRate(0)).toBe('-');
        });
    });

    describe('getExpectedMakes', () => {
        it('returns 0 for empty distance array', () => {
            expect(getExpectedMakes([])).toBe(0);
        });

        it('computes expected makes for single distance', () => {
            const distance10Rate = 41;
            const expected = distance10Rate / 100;
            expect(getExpectedMakes([10])).toBeCloseTo(expected, 5);
        });

        it('computes expected makes for multiple distances', () => {
            const rate10 = 41 / 100;
            const rate10_again = 41 / 100;
            const expected = rate10 + rate10_again;
            expect(getExpectedMakes([10, 10])).toBeCloseTo(expected, 5);
        });

        it('computes expected makes for full range 1-50ft', () => {
            const allDistances = ALL_DISTANCES;
            const result = getExpectedMakes(allDistances);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(allDistances.length); // can't make 100% of everything
        });

        it('sums probabilities correctly for 1ft and 50ft', () => {
            const rate1 = 100 / 100;
            const rate50 = 1 / 100;
            const expected = rate1 + rate50;
            expect(getExpectedMakes([1, 50])).toBeCloseTo(expected, 5);
        });

        it('ignores unknown distances (treats as 0% make rate)', () => {
            const rate10 = 41 / 100;
            expect(getExpectedMakes([10, 999, 10])).toBeCloseTo(rate10 + 0 + rate10, 5);
        });
    });

});
