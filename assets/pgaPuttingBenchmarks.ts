export interface PgaBenchmark {
    rate: number; // make % as integer 0-100
    estimated: boolean; // true if extrapolated from PGA tour data
}

export const PGA_PUTTING_BENCHMARKS: Record<number, PgaBenchmark> = {
    1: { rate: 100, estimated: true },
    2: { rate: 99, estimated: true },
    3: { rate: 99, estimated: false },
    4: { rate: 91, estimated: false },
    5: { rate: 81, estimated: false },
    6: { rate: 70, estimated: false },
    7: { rate: 61, estimated: false },
    8: { rate: 53, estimated: false },
    9: { rate: 46, estimated: false },
    10: { rate: 41, estimated: false },
    11: { rate: 37, estimated: true },
    12: { rate: 33, estimated: true },
    13: { rate: 31, estimated: true },
    14: { rate: 28, estimated: true },
    15: { rate: 25, estimated: true },
    16: { rate: 23, estimated: true },
    17: { rate: 21, estimated: true },
    18: { rate: 19, estimated: true },
    19: { rate: 18, estimated: true },
    20: { rate: 16, estimated: true },
    25: { rate: 10, estimated: true },
    30: { rate: 7, estimated: true },
    35: { rate: 5, estimated: true },
    40: { rate: 3, estimated: true },
    45: { rate: 2, estimated: true },
    50: { rate: 1, estimated: true },
};

export const formatPgaRate = (distance: number): string => {
    const benchmark = PGA_PUTTING_BENCHMARKS[distance];
    if (!benchmark) return '-';
    return `${benchmark.rate}%${benchmark.estimated ? '*' : ''}`;
};

export const getExpectedMakes = (distances: number[]): number =>
    distances.reduce((sum, d) => sum + (PGA_PUTTING_BENCHMARKS[d]?.rate ?? 0) / 100, 0);

// Weighted distance sampling biased toward realistic putting distances (5-20ft most common)
const DISTANCE_WEIGHTS: Record<number, number> = {
    1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 8, 7: 9, 8: 10, 9: 10, 10: 10,
    11: 9, 12: 8, 13: 7, 14: 6, 15: 6, 16: 5, 17: 4, 18: 4, 19: 3, 20: 3,
    25: 2, 30: 1.5, 35: 1, 40: 0.7, 45: 0.5, 50: 0.3,
};

const WEIGHTED_DISTANCES = Object.keys(DISTANCE_WEIGHTS)
    .map(Number)
    .sort((a, b) => a - b);
const TOTAL_WEIGHT = WEIGHTED_DISTANCES.reduce((sum, d) => sum + DISTANCE_WEIGHTS[d], 0);

export const pickWeightedDistances = (
    count: number,
    rng: () => number = Math.random
): number[] => {
    const results: number[] = [];
    for (let i = 0; i < count; i++) {
        let target = rng() * TOTAL_WEIGHT;
        let chosen = WEIGHTED_DISTANCES[WEIGHTED_DISTANCES.length - 1];
        for (const d of WEIGHTED_DISTANCES) {
            target -= DISTANCE_WEIGHTS[d];
            if (target <= 0) {
                chosen = d;
                break;
            }
        }
        results.push(chosen);
    }
    return results;
};
