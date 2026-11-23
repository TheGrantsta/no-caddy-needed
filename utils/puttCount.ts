// Putts taken on one hole. A chip-in (first putt = 0) is holed without a putt, so it counts as none.
export const countHolePutts = (
    stats: { FirstPuttDistance: number; SecondPuttDistance: number | null } | null,
    threePutts: boolean,
): number => {
    if (!stats) return 0;
    if (stats.FirstPuttDistance === 0) return 0;
    return (stats.SecondPuttDistance != null ? 2 : 1) + (threePutts ? 1 : 0);
};
