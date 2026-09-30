export const UP_AND_DOWN_DISTANCES = [35, 55, 42, 68, 28, 48, 62, 38, 52];

export function shuffleDistances(rng?: () => number): number[] {
    const distances = [...UP_AND_DOWN_DISTANCES];
    const randomFn = rng || Math.random;

    // Fisher-Yates shuffle
    for (let i = distances.length - 1; i > 0; i--) {
        const j = Math.floor(randomFn() * (i + 1));
        [distances[i], distances[j]] = [distances[j], distances[i]];
    }

    return distances;
}
