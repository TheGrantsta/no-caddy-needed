export interface PgaBenchmark {
    rate: number; // make % as integer 0-100
    estimated: boolean; // true if extrapolated from PGA tour data
}

const PGA_PUTTING_BENCHMARKS: Record<number, PgaBenchmark> = {
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
