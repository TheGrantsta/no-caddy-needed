import { formatPgaRate, getExpectedMakes, PGA_PUTTING_BENCHMARKS } from '../../assets/pgaPuttingBenchmarks';
import { PUTTING_DISTANCE_BUCKETS } from '../../service/DbService';

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
            const distance10Rate = PGA_PUTTING_BENCHMARKS[10].rate;
            const expected = distance10Rate / 100;
            expect(getExpectedMakes([10])).toBeCloseTo(expected, 5);
        });

        it('computes expected makes for multiple distances', () => {
            const rate10 = PGA_PUTTING_BENCHMARKS[10].rate / 100;
            const rate10_again = PGA_PUTTING_BENCHMARKS[10].rate / 100;
            const expected = rate10 + rate10_again;
            expect(getExpectedMakes([10, 10])).toBeCloseTo(expected, 5);
        });

        it('computes expected makes for full range 1-50ft', () => {
            const allDistances = Object.keys(PGA_PUTTING_BENCHMARKS).map(Number);
            const result = getExpectedMakes(allDistances);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(allDistances.length); // can't make 100% of everything
        });

        it('sums probabilities correctly for 1ft and 50ft', () => {
            const rate1 = PGA_PUTTING_BENCHMARKS[1].rate / 100;
            const rate50 = PGA_PUTTING_BENCHMARKS[50].rate / 100;
            const expected = rate1 + rate50;
            expect(getExpectedMakes([1, 50])).toBeCloseTo(expected, 5);
        });

        it('ignores unknown distances (treats as 0% make rate)', () => {
            const rate10 = PGA_PUTTING_BENCHMARKS[10].rate / 100;
            expect(getExpectedMakes([10, 999, 10])).toBeCloseTo(rate10 + 0 + rate10, 5);
        });
    });

    describe('PGA_PUTTING_BENCHMARKS', () => {
        it('has entries for all PUTTING_DISTANCE_BUCKETS', () => {
            PUTTING_DISTANCE_BUCKETS.forEach((distance) => {
                expect(PGA_PUTTING_BENCHMARKS[distance]).toBeDefined();
                expect(PGA_PUTTING_BENCHMARKS[distance].rate).toBeGreaterThan(0);
                expect(PGA_PUTTING_BENCHMARKS[distance].rate).toBeLessThanOrEqual(100);
                expect(typeof PGA_PUTTING_BENCHMARKS[distance].estimated).toBe('boolean');
            });
        });

        it('marks distances 1,2 as estimated', () => {
            expect(PGA_PUTTING_BENCHMARKS[1].estimated).toBe(true);
            expect(PGA_PUTTING_BENCHMARKS[2].estimated).toBe(true);
        });

        it('marks distances 3-10 as not estimated', () => {
            for (let i = 3; i <= 10; i++) {
                expect(PGA_PUTTING_BENCHMARKS[i].estimated).toBe(false);
            }
        });

        it('marks distances 11-50 as estimated', () => {
            for (const distance of [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 35, 40, 45, 50]) {
                expect(PGA_PUTTING_BENCHMARKS[distance].estimated).toBe(true);
            }
        });
    });
});
