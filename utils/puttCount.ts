import { puttCountFor } from './puttingEntry';

// Putts taken on one hole. The count chosen on the hole is stored, so it is used when present.
// Holes saved before the count was stored are read from the distances and the 3-putt sin:
// a chip-in is 0, a second putt of 0 means one putt, and a 3-putt adds to the count.
export const countHolePutts = (
    stats: { FirstPuttDistance: number; SecondPuttDistance: number | null; PuttCount?: number | null } | null,
    threePutts: boolean,
): number => {
    if (!stats) return 0;
    if (stats.PuttCount != null) return stats.PuttCount;
    if (threePutts && stats.FirstPuttDistance !== 0) return 3;
    return puttCountFor({
        firstPutt: stats.FirstPuttDistance,
        secondPutt: stats.SecondPuttDistance ?? undefined,
        threePutts,
    }) ?? 0;
};
