export const UP_AND_DOWN_DISTANCES = [7, 12, 5, 18, 10, 15, 6, 20, 9];

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
