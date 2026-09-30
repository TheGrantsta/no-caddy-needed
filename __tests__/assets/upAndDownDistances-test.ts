import { UP_AND_DOWN_DISTANCES, shuffleDistances } from '../../assets/upAndDownDistances';

describe('upAndDownDistances', () => {
    describe('UP_AND_DOWN_DISTANCES', () => {
        it('has exactly 9 distances', () => {
            expect(UP_AND_DOWN_DISTANCES).toHaveLength(9);
        });

        it('all distances are positive numbers', () => {
            expect(UP_AND_DOWN_DISTANCES.every((d: number) => d > 0)).toBe(true);
        });

        it('distances are in realistic chip/pitch range', () => {
            const allInRange = UP_AND_DOWN_DISTANCES.every((d: number) => d >= 20 && d <= 80);
            expect(allInRange).toBe(true);
        });

        it('contains the expected distances', () => {
            expect(UP_AND_DOWN_DISTANCES.sort((a, b) => a - b)).toEqual(
                [28, 35, 38, 42, 48, 52, 55, 62, 68]
            );
        });
    });

    describe('shuffleDistances', () => {
        it('returns array of 9 distances', () => {
            const shuffled = shuffleDistances();
            expect(shuffled).toHaveLength(9);
        });

        it('returns same distances, just reordered', () => {
            const shuffled = shuffleDistances();
            const sorted1 = shuffled.sort((a, b) => a - b);
            const sorted2 = UP_AND_DOWN_DISTANCES.sort((a, b) => a - b);
            expect(sorted1).toEqual(sorted2);
        });

        it('produces different order on multiple calls', () => {
            const shuffled1 = shuffleDistances();
            const shuffled2 = shuffleDistances();
            // Very unlikely to be identical if shuffling works
            const isSame = JSON.stringify(shuffled1) === JSON.stringify(shuffled2);
            expect(isSame).toBe(false);
        });

        it('accepts injected RNG for deterministic shuffling', () => {
            let callCount = 0;
            const mockRng = () => {
                callCount++;
                return 0.5 + (callCount % 2) * 0.1;
            };

            const shuffled1 = shuffleDistances(mockRng);
            callCount = 0;
            const shuffled2 = shuffleDistances(mockRng);

            expect(shuffled1).toEqual(shuffled2);
        });

        it('handles edge case RNG returns', () => {
            const rng0 = () => 0;
            const result0 = shuffleDistances(rng0);
            expect(result0).toHaveLength(9);

            const rng1 = () => 0.999999;
            const result1 = shuffleDistances(rng1);
            expect(result1).toHaveLength(9);
        });
    });
});
