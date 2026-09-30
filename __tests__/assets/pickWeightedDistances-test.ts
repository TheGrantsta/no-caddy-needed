import { pickWeightedDistances } from '../../assets/pgaPuttingBenchmarks';
import { PUTTING_DISTANCE_BUCKETS } from '../../service/DbService';

describe('pickWeightedDistances', () => {
    describe('with deterministic RNG', () => {
        it('returns first distance when RNG is 0', () => {
            const rng = jest.fn(() => 0);
            const result = pickWeightedDistances(1, rng);
            expect(result).toEqual([1]);
            expect(rng).toHaveBeenCalled();
        });

        it('returns last distance when RNG is ~0.9999', () => {
            const rng = jest.fn(() => 0.9999);
            const result = pickWeightedDistances(1, rng);
            expect(result).toEqual([50]);
        });

        it('generates correct number of distances', () => {
            const rng = jest.fn(() => 0.5);
            const result = pickWeightedDistances(18, rng);
            expect(result.length).toBe(18);
        });

        it('generates empty array when count is 0', () => {
            const rng = jest.fn(() => 0.5);
            const result = pickWeightedDistances(0, rng);
            expect(result).toEqual([]);
            expect(rng).not.toHaveBeenCalled();
        });

        it('uses cycling RNG values for deterministic testing', () => {
            let callCount = 0;
            const values = [0, 0.5, 0.9, 0.1, 0.3];
            const rng = jest.fn(() => values[callCount++ % values.length]);

            const result = pickWeightedDistances(5, rng);

            expect(result.length).toBe(5);
            // Each call should have used one RNG value
            expect(rng).toHaveBeenCalledTimes(5);
            // All results should be valid distances from PUTTING_DISTANCE_BUCKETS
            result.forEach((distance) => {
                expect(PUTTING_DISTANCE_BUCKETS.includes(distance)).toBe(true);
            });
        });
    });

    describe('with Math.random', () => {
        it('returns distances from PUTTING_DISTANCE_BUCKETS', () => {
            const result = pickWeightedDistances(18);
            expect(result.length).toBe(18);
            result.forEach((distance) => {
                expect(PUTTING_DISTANCE_BUCKETS.includes(distance)).toBe(true);
            });
        });

        it('generates biased distribution toward mid-range distances', () => {
            const result = pickWeightedDistances(100);
            // Mid-range (5-20ft) should appear more frequently than very short/long
            const midRange = result.filter((d) => d >= 5 && d <= 20).length;
            const extreme = result.filter((d) => d <= 2 || d >= 40).length;
            expect(midRange).toBeGreaterThan(extreme);
        });

        it('can generate the same distance multiple times', () => {
            const result = pickWeightedDistances(50);
            const uniqueDistances = new Set(result);
            // With 50 samples from 26 possible values, we should have some repeats
            expect(uniqueDistances.size).toBeLessThan(result.length);
        });
    });

    describe('validation against PUTTING_DISTANCE_BUCKETS', () => {
        it('uses all distances from PUTTING_DISTANCE_BUCKETS', () => {
            // Generate many samples and check coverage
            const result = pickWeightedDistances(500);
            const unique = new Set(result);
            const expectedDistances = new Set(PUTTING_DISTANCE_BUCKETS);

            // We should eventually see most/all possible distances
            // (some low-probability ones might be missed in 500 samples)
            const coverage = [...expectedDistances].filter((d) =>
                unique.has(d)
            ).length;
            expect(coverage).toBeGreaterThan(expectedDistances.size * 0.8); // >80% coverage
        });
    });
});
